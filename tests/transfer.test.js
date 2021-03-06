const { makeRequest, getTestEntities } = require('./utils');
const TABLES = require('../src/enums/tables');
const app = require('../src/app');

describe('Transfers tests', () => {
  const ROUTE = '/transfers';
  const userId = 10000;
  const accOriId = 10000;
  const accDestId = 10001;
  const anotherUserAcc = 10002;
  const transferId = 10000;
  const entities = getTestEntities();
  const [user1] = entities.users;
  const [accOri, accDest] = entities.accounts;
  let token;

  beforeAll(async () => {
    await app.db.seed.run();
  });

  beforeEach(async () => {
    const response = await app.services.auth.signin({
      email: user1.email, password: user1.password,
    });
    token = response.token;
  });

  it("should list only the user's transfers", async () => {
    const response = await makeRequest('get', ROUTE, token);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].description).toBe('Transfer #1');
  });

  describe('When creating transfers successfully', () => {
    let newTransferId;
    let income;
    let outcome;

    it('should create a transfer', async () => {
      const newTransfer = {
        description: 'new transfer', user_id: user1.id, acc_ori_id: accOri.id, acc_dest_id: accDest.id, ammount: 100, date: new Date(),
      };
      const response = await makeRequest('post', ROUTE, token, newTransfer);
      newTransferId = response.body.id;
      expect(response.status).toBe(201);
      expect(response.body.description).toBe(newTransfer.description);
    });

    it('should create two new transactions related to the new transfer ', async () => {
      const transactions = await app.db(TABLES.TRANSACTIONS)
        .where({ transfer_id: newTransferId })
        .orderBy('ammount');
      expect(transactions.length).toBe(2);
      [outcome, income] = transactions;
    });

    it('should create an outcome transaction with a negative ammount', () => {
      expect(outcome.description).toBe(`Transfer to acc #${accDest.id}`);
      expect(outcome.ammount).toBe('-100.00');
      expect(outcome.acc_id).toBe(accOri.id);
      expect(outcome.type).toBe('O');
    });

    it('should create an income transaction with a positive ammount', () => {
      expect(income.description).toBe(`Transfer from acc #${accOri.id}`);
      expect(income.ammount).toBe('100.00');
      expect(income.acc_id).toBe(accDest.id);
      expect(income.type).toBe('I');
    });

    it('should create transactions that reference the new transfer', () => {
      expect(outcome.transfer_id).toBe(newTransferId);
      expect(income.transfer_id).toBe(newTransferId);
    });

    it('should create transactions that are with status done', () => {
      expect(outcome.status).toBe(true);
      expect(income.status).toBe(true);
    });
  });

  describe('When creating an invalid transfer', () => {
    it.each([
      ['description', {
        user_id: userId,
        acc_ori_id: accOriId,
        acc_dest_id: accDestId,
        ammount: 100,
        date: new Date(),
      }],
      ['ammount', {
        description: 'desc',
        user_id: userId,
        acc_ori_id: accOriId,
        acc_dest_id: accDestId,
        date: new Date(),
      }],
      ['date', {
        description: 'desc',
        user_id: userId,
        acc_ori_id: accOriId,
        acc_dest_id: accDestId,
        ammount: 100,
      }],
      ['user_id', {
        description: 'desc',
        acc_ori_id: accOriId,
        acc_dest_id: accDestId,
        date: new Date(),
        ammount: 100,
      }],
      ['acc_ori_id', {
        description: 'desc',
        user_id: 10000,
        acc_dest_id: accDestId,
        date: new Date(),
        ammount: 100,
      }],
      ['acc_dest_id', {
        description: 'desc',
        user_id: userId,
        acc_ori_id: accOriId,
        date: new Date(),
        ammount: 100,
      }],
    ])('should not insert a transfer with no %s', async (prop, body) => {
      const response = await makeRequest('post', ROUTE, token, body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe(`${prop} must be valid`);
    });

    it('should not insert a transfer if the destiny and origin accounts are the same', async () => {
      const transfer = {
        description: 'desc',
        user_id: userId,
        acc_ori_id: accOriId,
        acc_dest_id: accOriId,
        ammount: 100,
        date: new Date(),
      };
      const response = await makeRequest('post', ROUTE, token, transfer);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('The origin account cannot be equal to the destiny one');
    });

    it('should not insert a transfer if the any of the accounts are from another user', async () => {
      const transfer = {
        description: 'desc',
        user_id: userId,
        acc_ori_id: accOriId,
        acc_dest_id: anotherUserAcc,
        ammount: 100,
        date: new Date(),
      };
      const response = await makeRequest('post', ROUTE, token, transfer);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('It is possible to transfer to another user account');
    });
  });

  it('should get a transfer by id', async () => {
    const userTransferId = 10000;
    const response = await makeRequest('get', `${ROUTE}/${userTransferId}`, token);
    expect(response.status).toBe(200);
    expect(response.body.description).toBe('Transfer #1');
  });

  describe('When updating transfers successfully', () => {
    let income;
    let outcome;

    it('should update a transfer', async () => {
      const newTransfer = {
        description: 'updated transfer',
        user_id: user1.id,
        acc_ori_id: accOri.id,
        acc_dest_id: accDest.id,
        ammount: 500,
        date: new Date(),
      };
      const response = await makeRequest('put', `${ROUTE}/${transferId}`, token, newTransfer);
      expect(response.status).toBe(200);
      expect(response.body.description).toBe(newTransfer.description);
      expect(response.body.ammount).toBe('500.00');
    });

    it('should create two new transactions related to the new transfer ', async () => {
      const transactions = await app.db(TABLES.TRANSACTIONS)
        .where({ transfer_id: transferId })
        .orderBy('ammount');
      expect(transactions.length).toBe(2);
      [outcome, income] = transactions;
    });

    it('should update the ammount of the outcome transaction', () => {
      expect(outcome.description).toBe(`Transfer to acc #${accDest.id}`);
      expect(outcome.ammount).toBe('-500.00');
      expect(outcome.acc_id).toBe(accOri.id);
      expect(outcome.type).toBe('O');
    });

    it('should update the ammount of the income transaction', () => {
      expect(income.description).toBe(`Transfer from acc #${accOri.id}`);
      expect(income.ammount).toBe('500.00');
      expect(income.acc_id).toBe(accDest.id);
      expect(income.type).toBe('I');
    });

    it('should create transactions that reference the new transfer', () => {
      expect(outcome.transfer_id).toBe(transferId);
      expect(income.transfer_id).toBe(transferId);
    });
  });

  describe('When updating a transfer with a invalid field value', () => {
    it.each([
      ['description', {
        user_id: userId,
        acc_ori_id: accOriId,
        acc_dest_id: accDestId,
        ammount: 100,
        date: new Date(),
      }],
      ['ammount', {
        description: 'desc',
        user_id: userId,
        acc_ori_id: accOriId,
        acc_dest_id: accDestId,
        date: new Date(),
      }],
      ['date', {
        description: 'desc',
        user_id: userId,
        acc_ori_id: accOriId,
        acc_dest_id: accDestId,
        ammount: 100,
      }],
      ['user_id', {
        description: 'desc',
        acc_ori_id: accOriId,
        acc_dest_id: accDestId,
        date: new Date(),
        ammount: 100,
      }],
      ['acc_ori_id', {
        description: 'desc',
        user_id: 10000,
        acc_dest_id: accDestId,
        date: new Date(),
        ammount: 100,
      }],
      ['acc_dest_id', {
        description: 'desc',
        user_id: userId,
        acc_ori_id: accOriId,
        date: new Date(),
        ammount: 100,
      }],
    ])('should not insert a transfer with no %s', async (prop, body) => {
      const response = await makeRequest('put', `${ROUTE}/${transferId}`, token, body);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe(`${prop} must be valid`);
    });

    it('should not insert a transfer if the destiny and origin accounts are the same', async () => {
      const transfer = {
        description: 'desc',
        user_id: userId,
        acc_ori_id: accOriId,
        acc_dest_id: accOriId,
        ammount: 100,
        date: new Date(),
      };
      const response = await makeRequest('put', `${ROUTE}/${transferId}`, token, transfer);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('The origin account cannot be equal to the destiny one');
    });

    it('should not insert a transfer if the any of the accounts are from another user', async () => {
      const transfer = {
        description: 'desc',
        user_id: userId,
        acc_ori_id: accOriId,
        acc_dest_id: anotherUserAcc,
        ammount: 100,
        date: new Date(),
      };
      const response = await makeRequest('put', `${ROUTE}/${transferId}`, token, transfer);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('It is possible to transfer to another user account');
    });
  });

  describe('when removing a transfer', () => {
    it('should return a 204 status code', async () => {
      const response = await makeRequest('delete', `${ROUTE}/${transferId}`, token);
      expect(response.status).toBe(204);
    });

    it('should have removed the transfer from the database', async () => {
      const transactions = await app.db(TABLES.TRANSFERS).where({ id: transferId }).select();
      expect(transactions).toHaveLength(0);
    });

    it('should have removed the transactions related to this transfer', async () => {
      const transactions = await app.db(TABLES.TRANSACTIONS)
        .where({ transfer_id: transferId }).select();
      expect(transactions).toHaveLength(0);
    });
  });

  it('should not handle the transfers from another user', async () => {
    const otherUserTransferId = 10001;
    const response = await makeRequest('get', `${ROUTE}/${otherUserTransferId}`, token);
    expect(response.status).toBe(403);
    expect(response.body.error).toBe('User is not allowed access this resource');
  });
});
