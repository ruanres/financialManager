const { makeRequest, getTestEntities } = require('./utils');
const app = require('../src/app');

describe('Accounts tests', () => {
  const MAIN_ROUTE = '/accounts';
  const { users, accounts } = getTestEntities();
  const [user] = users;
  const [userAcc,, otherUserAcc] = accounts;
  let token;

  beforeAll(async () => {
    const response = await app.services.auth.signin({
      email: user.email, password: user.password,
    });
    token = response.token;
  });

  beforeEach(async () => {
    await app.db.seed.run();
  });

  it('should create an account', async () => {
    const newAccount = { name: 'acc 1' };
    const result = await makeRequest('post', MAIN_ROUTE, token, newAccount);
    expect(result.status).toBe(201);
    expect(result.body.name).toEqual(newAccount.name);
  });

  it('should not create duplicated accounts for the same user', async () => {
    const account = { name: 'new acc' };
    const resultA = await makeRequest('post', MAIN_ROUTE, token, account);
    expect(resultA.status).toBe(201);
    const resultB = await makeRequest('post', MAIN_ROUTE, token, account);
    expect(resultB.status).toBe(400);
    expect(resultB.body.error).toEqual('An account with this name already exists');
  });

  it('should list all the logged user accounts', async () => {
    const result = await makeRequest('get', MAIN_ROUTE, token);
    expect(result.status).toBe(200);
    expect(result.body.length).toBe(2);
    expect(result.body[0].id).toBe(user.id);
  });

  it('should not access another users accounts', async () => {
    const result = await makeRequest('get', `${MAIN_ROUTE}/${otherUserAcc.id}`, token);
    expect(result.status).toBe(403);
    expect(result.body.error).toBe('User is not allowed access this resource');
  });

  it('should return an account per id', async () => {
    const result = await makeRequest('get', `${MAIN_ROUTE}/${userAcc.id}`, token);
    expect(result.status).toBe(200);
    expect(result.body.name).toBe(userAcc.name);
    expect(result.body.user_id).toBe(userAcc.user_id);
  });

  it('should update an account', async () => {
    const newName = 'updated name';
    const result = await makeRequest('put', `${MAIN_ROUTE}/${userAcc.id}`, token, { name: newName });
    expect(result.status).toBe(200);
    expect(result.body.name).toBe(newName);
    expect(result.body.user_id).toBe(userAcc.user_id);
  });

  it('should not update another user account', async () => {
    const result = await makeRequest('put', `${MAIN_ROUTE}/${otherUserAcc.id}`, token, { name: 'updated name' });
    expect(result.status).toBe(403);
    expect(result.body.error).toBe('User is not allowed access this resource');
  });

  it('should delete an account', async () => {
    const account = { name: 'acc 1', user_id: user.id };
    const [newAccount] = await app.db('accounts').insert(account, ['id']);
    const result = await makeRequest('delete', `${MAIN_ROUTE}/${newAccount.id}`, token);
    expect(result.status).toBe(204);
  });

  it('should not delete another user account', async () => {
    const result = await makeRequest('delete', `${MAIN_ROUTE}/${otherUserAcc.id}`, token);
    expect(result.status).toBe(403);
    expect(result.body.error).toBe('User is not allowed access this resource');
  });

  it('should not create an account with no name', async () => {
    const newAccount = {};
    const result = await makeRequest('post', MAIN_ROUTE, token, newAccount);
    expect(result.status).toBe(400);
    expect(result.body.error).toEqual('Name must not be null');
  });

  it('should not delete an account with associated transactions', async () => {
    const result = await makeRequest('delete', `${MAIN_ROUTE}/${userAcc.id}`, token);
    expect(result.status).toBe(400);
    expect(result.body.error).toBe('This account has transactions related to it');
  });
});
