const moment = require('moment');
const { makeRequest, getTestEntities } = require('./utils');
const app = require('../src/app');

describe('Balance tests', () => {
  const BALANCE = '/balance';
  const TRANSACTIONS = '/transactions';
  const TRANSFERS = '/transfers';
  const { users, accounts } = getTestEntities();
  const user3 = users[2];
  const mainAcc = accounts[4];
  const secondaryAcc = accounts[5];
  const otherUserAcc = accounts[6];
  let token;

  beforeAll(async () => {
    await app.db.seed.run();
  });

  beforeAll(async () => {
    beforeEach(async () => {
      const response = await app.services.auth.signin({
        email: user3.email, password: user3.password,
      });
      token = response.token;
    });
  });

  describe('When calculating the balance', () => {
    it('should only return the account with some transaction', async () => {
      const response = await makeRequest('get', BALANCE, token);
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    it.each([
      [
        'should add input values',
        {
          description: '1',
          type: 'I',
          ammount: 100,
          acc_id: mainAcc.id,
          date: new Date(),
          status: true,
        },
        { size: 1, accId: mainAcc.id, sum: '100.00' },
      ],
      [
        'should subtract output values',
        {
          description: '1',
          type: 'O',
          ammount: 200,
          acc_id: mainAcc.id,
          date: new Date(),
          status: true,
        },
        { size: 1, accId: mainAcc.id, sum: '-100.00' },
      ],
      [
        'should not consider pendent transactions',
        {
          description: '1',
          type: 'O',
          ammount: 200,
          acc_id: mainAcc.id,
          date: new Date(),
          status: false,
        },
        { size: 1, accId: mainAcc.id, sum: '-100.00' },
      ],
    ])('%s', async (desc, transaction, expected) => {
      const { size, accId, sum } = expected;
      await makeRequest('post', TRANSACTIONS, token, transaction);
      const response = await makeRequest('get', BALANCE, token);
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(size);
      expect(response.body[0].id).toBe(accId);
      expect(response.body[0].sum).toBe(sum);
    });

    it.each([
      [
        'should calculate the balance for each account',
        {
          description: '1',
          type: 'I',
          ammount: 50,
          acc_id: secondaryAcc.id,
          date: new Date(),
          status: true,
        },
        {
          size: 2,
          balances: [
            { accId: mainAcc.id, sum: '-100.00' },
            { accId: secondaryAcc.id, sum: '50.00' },
          ],
        },
      ],
      [
        'should not consider accounts from another users',
        {
          description: '1',
          type: 'I',
          ammount: 50,
          acc_id: otherUserAcc.id,
          date: new Date(),
          status: true,
        },
        {
          size: 2,
          balances: [
            { accId: mainAcc.id, sum: '-100.00' },
            { accId: secondaryAcc.id, sum: '50.00' },
          ],
        },
      ],
      [
        'should consider old transactions',
        {
          description: '1',
          type: 'I',
          ammount: 250,
          acc_id: mainAcc.id,
          date: moment().subtract({ days: 5 }),
          status: true,
        },
        {
          size: 2,
          balances: [
            { accId: mainAcc.id, sum: '150.00' },
            { accId: secondaryAcc.id, sum: '50.00' },
          ],
        },
      ],
      [
        'should not consider future transactions',
        {
          description: '1',
          type: 'I',
          ammount: 250,
          acc_id: mainAcc.id,
          date: moment().add({ days: 5 }),
          status: true,
        },
        {
          size: 2,
          balances: [
            { accId: mainAcc.id, sum: '150.00' },
            { accId: secondaryAcc.id, sum: '50.00' },
          ],
        },
      ],
    ])('%s', async (desc, transaction, expected) => {
      const { size, balances } = expected;
      await makeRequest('post', TRANSACTIONS, token, transaction);
      const response = await makeRequest('get', BALANCE, token);
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(size);
      expect(response.body[0].id).toBe(balances[0].accId);
      expect(response.body[0].sum).toBe(balances[0].sum);
      expect(response.body[1].id).toBe(balances[1].accId);
      expect(response.body[1].sum).toBe(balances[1].sum);
    });

    it('should consider transfers', async () => {
      const transfer = {
        description: '1',
        ammount: 250,
        date: new Date(),
        acc_ori_id: mainAcc.id,
        acc_dest_id: secondaryAcc.id,
        user_id: user3.id,
      };
      await makeRequest('post', TRANSFERS, token, transfer);
      const response = await makeRequest('get', BALANCE, token);
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].id).toBe(mainAcc.id);
      expect(response.body[0].sum).toBe('-100.00');
      expect(response.body[1].id).toBe(secondaryAcc.id);
      expect(response.body[1].sum).toBe('300.00');
    });
  });
});
