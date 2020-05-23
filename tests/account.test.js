const { makeRequest } = require('./utils');
const app = require('../src/app');

describe('Accounts tests', () => {
  const MAIN_ROUTE = '/accounts';
  let user;
  let token;

  beforeAll(async () => {
    const userData = { name: 'tester', email: `${Date.now()}@mail.com`, password: 'password' };
    const userResponse = await app.services.user.save(userData);
    user = { ...userResponse[0] };
    const response = await app.services.auth.signin({
      email: userData.email, password: userData.password,
    });
    token = response.token;
  });

  it('should create an account', async () => {
    const newAccount = { name: 'acc 1', user_id: user.id };
    const result = await makeRequest('post', MAIN_ROUTE, token, newAccount);
    expect(result.status).toBe(201);
    expect(result.body.name).toEqual(newAccount.name);
  });

  it('should list all accounts', async () => {
    await app.db('accounts').insert({ name: 'acc 1', user_id: user.id });
    const result = await makeRequest('get', MAIN_ROUTE, token);
    expect(result.status).toBe(200);
    expect(result.body.length).toBeGreaterThan(0);
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

  it('should not create an account with no name', async () => {
    const newAccount = { user_id: user.id };
    const result = await makeRequest('post', MAIN_ROUTE, token, newAccount);
    expect(result.status).toBe(400);
    expect(result.body.error).toEqual('Name must not be null');
  });
});
