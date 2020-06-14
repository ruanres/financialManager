const { makeRequest, getTestEntities } = require('./utils');
const app = require('../src/app');
const TABLES = require('../src/enums/tables');

describe('Transaction test', () => {
  const MAIN_ROUTE = '/transactions';
  const {
    users, accounts, transactions, transfers,
  } = getTestEntities();
  const [user] = users;
  const [userAccOri, userAccDest] = accounts;
  const [transfer] = transfers;
  const [userTransacDest, userTransacOri] = transactions;
  let token;
  let savedTransacId;

  beforeEach(async () => {
    await app.db.seed.run();
  });

  beforeEach(async () => {
    const transaction = await app.db(TABLES.TRANSACTIONS).where({
      description: userTransacOri.description,
    }).first();
    savedTransacId = transaction.id;

    const response = await app.services.auth.signin({
      email: user.email, password: user.password,
    });
    token = response.token;
  });

  it('should list all user transactions', async () => {
    const response = await makeRequest('get', MAIN_ROUTE, token);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it('should get a transaction by its id', async () => {
    const response = await makeRequest('get', `${MAIN_ROUTE}/${savedTransacId}`, token);
    expect(response.status).toBe(200);
    expect(response.body.description).toBe(userTransacOri.description);
  });

  it('should update an transaction by id', async () => {
    const transactionData = {
      description: 'T1',
      type: 'I',
      ammount: 500,
      acc_id: userAccOri.id,
      transfer_id: transfer.id,
      date: new Date(),
    };
    const response = await makeRequest('put', `${MAIN_ROUTE}/${savedTransacId}`, token, transactionData);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(savedTransacId);
    expect(response.body.description).toBe(transactionData.description);
  });

  it('should delete an transaction by id', async () => {
    const response = await makeRequest('delete', `${MAIN_ROUTE}/${savedTransacId}`, token);
    expect(response.status).toBe(204);
  });

  describe('when creating a transaction', () => {
    it('should create a new transaction', async () => {
      const response = await makeRequest('post', MAIN_ROUTE, token, userTransacOri);
      expect(response.status).toBe(201);
      expect(response.body.acc_id).toBe(userAccOri.id);
      expect(response.body.ammount).toBe('-100.00');
    });

    it('should save a positive ammount for input transactions', async () => {
      const response = await makeRequest('post', MAIN_ROUTE, token, userTransacDest);
      expect(response.status).toBe(201);
      expect(response.body.acc_id).toBe(userAccDest.id);
      expect(response.body.ammount).toBe('100.00');
    });

    it('should save a negative ammount for output transactions', async () => {
      const response = await makeRequest('post', MAIN_ROUTE, token, userTransacOri);
      expect(response.status).toBe(201);
      expect(response.body.acc_id).toBe(userAccOri.id);
      expect(response.body.ammount).toBe('-100.00');
    });
  });

  describe('when the one user try to handle the transactions of another user', () => {
    let otherUserTransc;

    beforeAll(async () => {
      otherUserTransc = await app.db('transactions').where({ description: 'Transfer from accOri #2' }).first();
    });

    it('should not access another user transaction', async () => {
      const response = await makeRequest('get', `${MAIN_ROUTE}/${otherUserTransc.id}`, token);
      expect(response.status).toBe(403);
    });

    it('should not edit another user transaction', async () => {
      const response = await makeRequest('put', `${MAIN_ROUTE}/${otherUserTransc.id}`, token, { description: 'new desc' });
      expect(response.status).toBe(403);
    });

    it('should not delete another user transaction', async () => {
      const response = await makeRequest('delete', `${MAIN_ROUTE}/${otherUserTransc.id}`, token);
      expect(response.status).toBe(403);
    });
  });

  describe('when inserting invalid inputs', () => {
    let accountId;

    beforeAll(async () => {
      const [account] = await app.services.account.save({ name: 'other', user_id: user.id });
      accountId = account.id;
    });

    it.each([
      ['description', {
        type: 'I', ammount: -100, acc_id: accountId, date: new Date(),
      }],
      ['type', {
        description: 'desc', ammount: -100, acc_id: accountId, date: new Date(),
      }],
      ['ammount', {
        description: 'desc', type: 'I', acc_id: accountId, date: new Date(),
      }],
      ['acc_id', {
        description: 'desc', type: 'I', ammount: -100, date: new Date(),
      }],
      ['date', {
        description: 'desc', type: 'I', ammount: -100, acc_id: accountId,
      }],
    ])('should not insert a transaction with no %s', async (prop, t) => {
      const response = await makeRequest('post', MAIN_ROUTE, token, t);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe(`${prop} must be valid`);
    });

    it('should not insert a transaction with invalid type', async () => {
      const data = {
        description: 'desc', ammount: -100, acc_id: accountId, date: new Date(), type: 'invalid',
      };
      const response = await makeRequest('post', MAIN_ROUTE, token, data);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Type property must be valid');
    });
  });
});
