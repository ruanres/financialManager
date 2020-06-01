const { makeRequest, clearDB } = require('./utils');
const app = require('../src/app');

describe('Transaction test', () => {
  const MAIN_ROUTE = '/transactions';
  let user;
  let otherUser;
  let userAcc;
  let otherUserAcc;
  let token;

  beforeAll(async () => {
    const userData = { name: 'tester', email: `${Date.now()}@mail.com`, password: 'password' };
    const otherUserData = { name: 'other tester', email: `other.${Date.now()}@mail.com`, password: 'password' };
    [user] = await app.services.user.save(userData);
    [otherUser] = await app.services.user.save(otherUserData);
    [userAcc] = await app.services.account.save({ name: 'user acc', user_id: user.id });
    [otherUserAcc] = await app.services.account.save({ name: 'otherUser acc', user_id: otherUser.id });

    const response = await app.services.auth.signin({
      email: userData.email, password: userData.password,
    });
    token = response.token;
  });

  afterAll(clearDB);

  it('should list all user transaction', async () => {
    const userTransactionData = {
      description: 'T1', type: 'I', ammount: 100, acc_id: userAcc.id, date: new Date(),
    };
    const otherUserTransactionData = {
      description: 'T2', type: 'O', ammount: 300, acc_id: otherUserAcc.id, date: new Date(),
    };
    await app.db('transactions').insert(userTransactionData);
    await app.db('transactions').insert(otherUserTransactionData);
    const response = await makeRequest('get', MAIN_ROUTE, token);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].description).toBe(userTransactionData.description);
  });

  it('should create a new transaction', async () => {
    const transactionData = {
      description: 'T1', type: 'I', ammount: 100, acc_id: userAcc.id, date: new Date(),
    };
    const response = await makeRequest('post', MAIN_ROUTE, token, transactionData);
    expect(response.status).toBe(201);
    expect(response.body.acc_id).toBe(userAcc.id);
    expect(response.body.ammount).toBe('100.00');
  });

  it('should save a positive ammount for input transactions', async () => {
    const transactionData = {
      description: 'T1', type: 'I', ammount: -100, acc_id: userAcc.id, date: new Date(),
    };
    const response = await makeRequest('post', MAIN_ROUTE, token, transactionData);
    expect(response.status).toBe(201);
    expect(response.body.acc_id).toBe(userAcc.id);
    expect(response.body.ammount).toBe('100.00');
  });

  it('should save a negative ammount for output transactions', async () => {
    const transactionData = {
      description: 'T1', type: 'O', ammount: 100, acc_id: userAcc.id, date: new Date(),
    };
    const response = await makeRequest('post', MAIN_ROUTE, token, transactionData);
    expect(response.status).toBe(201);
    expect(response.body.acc_id).toBe(userAcc.id);
    expect(response.body.ammount).toBe('-100.00');
  });

  it('should get a transaction by its id', async () => {
    const transactionData = {
      description: 'T1', type: 'I', ammount: 100, acc_id: userAcc.id, date: new Date(),
    };
    const [transaction] = await app.db('transactions').insert(transactionData, ['id']);
    const response = await makeRequest('get', `${MAIN_ROUTE}/${transaction.id}`, token);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(transaction.id);
  });

  it('should update an transaction by id', async () => {
    const transactionData = {
      description: 'T1', type: 'I', ammount: 100, acc_id: userAcc.id, date: new Date(),
    };
    const [transaction] = await app.db('transactions').insert(transactionData, ['id']);
    const description = 'new Descriotion';
    const response = await makeRequest('put', `${MAIN_ROUTE}/${transaction.id}`, token, { description });
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(transaction.id);
    expect(response.body.description).toBe(description);
  });

  it('should delete an transaction by id', async () => {
    const transactionData = {
      description: 'T1', type: 'I', ammount: 100, acc_id: userAcc.id, date: new Date(),
    };
    const [transaction] = await app.db('transactions').insert(transactionData, ['id']);
    const response = await makeRequest('delete', `${MAIN_ROUTE}/${transaction.id}`, token);
    expect(response.status).toBe(204);
  });

  describe('test the user handling transactions of another user', () => {
    let transaction;

    beforeAll(async () => {
      const userTransactionData = {
        description: 'T1', type: 'I', ammount: 100, acc_id: userAcc.id, date: new Date(),
      };
      const otherUserTransactionData = {
        description: 'T2', type: 'O', ammount: 300, acc_id: otherUserAcc.id, date: new Date(),
      };
      await app.db('transactions').insert(userTransactionData);
      [transaction] = await app.db('transactions').insert(otherUserTransactionData, ['id']);
    });

    it('should not access another user transaction', async () => {
      const response = await makeRequest('get', `${MAIN_ROUTE}/${transaction.id}`, token);
      expect(response.status).toBe(403);
    });

    it('should not edit another user transaction', async () => {
      const response = await makeRequest('put', `${MAIN_ROUTE}/${transaction.id}`, token, { description: 'new desc' });
      expect(response.status).toBe(403);
    });

    it('should not delete another user transaction', async () => {
      const response = await makeRequest('delete', `${MAIN_ROUTE}/${transaction.id}`, token);
      expect(response.status).toBe(403);
    });
  });

  describe('test invalid inputs', () => {
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
