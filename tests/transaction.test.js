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
    const userResult = await app.services.user.save(userData);
    const otherUserResult = await app.services.user.save(otherUserData);
    user = { ...userResult[0] };
    otherUser = { ...otherUserResult[0] };


    const accResult = await app.services.account.save({ name: 'user acc', user_id: user.id });
    const otherAccResult = await app.services.account.save({ name: 'otherUser acc', user_id: otherUser.id });
    userAcc = { ...accResult[0] };
    otherUserAcc = { ...otherAccResult[0] };

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
    await app.db('transactions').insert(userTransactionData, ['*']);
    await app.db('transactions').insert(otherUserTransactionData);
    const response = await makeRequest('get', MAIN_ROUTE, token);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].description).toBe(userTransactionData.description);
  });
});