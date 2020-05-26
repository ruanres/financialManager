const { makeRequest } = require('./utils');
const app = require('../src/app');

describe('Accounts tests', () => {
  const MAIN_ROUTE = '/accounts';
  let user;
  let otherUser;
  let token;

  beforeEach(async () => {
    const userData = { name: 'tester', email: `${Date.now()}@mail.com`, password: 'password' };
    const otherUserData = { name: 'other tester', email: `other.${Date.now()}@mail.com`, password: 'password' };
    const userResponse = await app.services.user.save(userData);
    const otherUserResponse = await app.services.user.save(otherUserData);
    user = { ...userResponse[0] };
    otherUser = { ...otherUserResponse[0] };

    const response = await app.services.auth.signin({
      email: userData.email, password: userData.password,
    });
    token = response.token;
  });

  it('should create an account', async () => {
    const newAccount = { name: 'acc 1' };
    const result = await makeRequest('post', MAIN_ROUTE, token, newAccount);
    expect(result.status).toBe(201);
    expect(result.body.name).toEqual(newAccount.name);
  });

  it('should not create duplicated accounts for the same user', async () => {
    const account = { name: 'acc 1' };
    const resultA = await makeRequest('post', MAIN_ROUTE, token, account);
    expect(resultA.status).toBe(201);
    const resultB = await makeRequest('post', MAIN_ROUTE, token, account);
    expect(resultB.status).toBe(400);
    expect(resultB.body.error).toEqual('An account with this name already exists');
  });

  it('should list all the logged user accounts', async () => {
    const accountData = { name: 'acc 1', user_id: user.id };
    const otherAccountData = { name: 'acc 2', user_id: otherUser.id };
    const [userAccount] = await app.db('accounts').insert(
      [accountData, otherAccountData],
      ['id'],
    );
    const result = await makeRequest('get', MAIN_ROUTE, token);
    expect(result.status).toBe(200);
    expect(result.body.length).toBe(1);
    expect(result.body[0].id).toBe(userAccount.id);
  });

  it('should not access another users accounts', async () => {
    const account = { name: 'acc from other user', user_id: otherUser.id };
    const [newAccount] = await app.db('accounts').insert(account, ['id']);
    const result = await makeRequest('get', `${MAIN_ROUTE}/${newAccount.id}`, token);
    expect(result.status).toBe(403);
    expect(result.body.error).toBe('User is not allowed access this resource');
  });

  it('should return an account per id', async () => {
    const account = { name: 'acc 1', user_id: user.id };
    const accounts = await app.db('accounts').insert(account, ['id']);
    const newAccount = accounts[0];
    const result = await makeRequest('get', `${MAIN_ROUTE}/${newAccount.id}`, token);
    expect(result.status).toBe(200);
    expect(result.body.name).toBe(account.name);
    expect(result.body.user_id).toBe(account.user_id);
  });

  it('should update an account', async () => {
    const account = { name: 'acc 1', user_id: user.id };
    const accounts = await app.db('accounts').insert(account, ['id']);
    const newAccount = accounts[0];
    const newName = 'updated name';
    const result = await makeRequest('put', `${MAIN_ROUTE}/${newAccount.id}`, token, { name: newName });
    expect(result.status).toBe(200);
    expect(result.body.name).toBe(newName);
    expect(result.body.user_id).toBe(account.user_id);
  });

  it('should not update another user account', async () => {
    const account = { name: 'acc 1', user_id: otherUser.id };
    const [newAccount] = await app.db('accounts').insert(account, ['id']);
    const result = await makeRequest('put', `${MAIN_ROUTE}/${newAccount.id}`, token, { name: 'updated name' });
    expect(result.status).toBe(403);
    expect(result.body.error).toBe('User is not allowed access this resource');
  });

  it('should delete an account', async () => {
    const account = { name: 'acc 1', user_id: user.id };
    const accounts = await app.db('accounts').insert(account, ['id']);
    const newAccount = accounts[0];
    const result = await makeRequest('delete', `${MAIN_ROUTE}/${newAccount.id}`, token);
    expect(result.status).toBe(204);
    const getResult = await makeRequest('get', `${MAIN_ROUTE}/${newAccount.id}`, token);
    expect(getResult.status).toBe(404);
    expect(getResult.body.error).toBe('Account not found');
  });

  it('should not delete another user account', async () => {
    const account = { name: 'acc 1', user_id: otherUser.id };
    const [newAccount] = await app.db('accounts').insert(account, ['id']);
    const result = await makeRequest('delete', `${MAIN_ROUTE}/${newAccount.id}`, token);
    expect(result.status).toBe(403);
    expect(result.body.error).toBe('User is not allowed access this resource');
  });

  it('should not create an account with no name', async () => {
    const newAccount = {};
    const result = await makeRequest('post', MAIN_ROUTE, token, newAccount);
    expect(result.status).toBe(400);
    expect(result.body.error).toEqual('Name must not be null');
  });
});
