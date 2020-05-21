const request = require('supertest');
const app = require('../src/app');

describe('Accounts tests', () => {
  const MAIN_ROUTE = '/accounts';
  let user;

  beforeAll(async () => {
    const res = await app.services.user.save({ name: 'tester', email: `${Date.now()}@mail.com`, password: 'password' });
    user = { ...res[0] };
  });

  it('should create an account', async () => {
    const newAccount = { name: 'acc 1', user_id: user.id };
    const result = await request(app).post(MAIN_ROUTE).send(newAccount);
    expect(result.status).toBe(201);
    expect(result.body.name).toEqual(newAccount.name);
  });

  it('should list all accounts', async () => {
    await app.db('accounts').insert({ name: 'acc 1', user_id: user.id });
    const result = await request(app).get(MAIN_ROUTE);
    expect(result.status).toBe(200);
    expect(result.body.length).toBeGreaterThan(0);
  });

  it('should return an account per id', async () => {
    const account = { name: 'acc 1', user_id: user.id };
    const accounts = await app.db('accounts').insert(account, ['id']);
    const newAccount = accounts[0];
    const result = await request(app).get(`${MAIN_ROUTE}/${newAccount.id}`);
    expect(result.status).toBe(200);
    expect(result.body.name).toBe(account.name);
    expect(result.body.user_id).toBe(account.user_id);
  });

  it('should update an account', async () => {
    const account = { name: 'acc 1', user_id: user.id };
    const accounts = await app.db('accounts').insert(account, ['id']);
    const newAccount = accounts[0];
    const newName = 'updated name';
    const result = await request(app).put(`${MAIN_ROUTE}/${newAccount.id}`).send({ name: newName });
    expect(result.status).toBe(200);
    expect(result.body.name).toBe(newName);
    expect(result.body.user_id).toBe(account.user_id);
  });

  it('should delete an account', async () => {
    const account = { name: 'acc 1', user_id: user.id };
    const accounts = await app.db('accounts').insert(account, ['id']);
    const newAccount = accounts[0];
    const result = await request(app).delete(`${MAIN_ROUTE}/${newAccount.id}`);
    expect(result.status).toBe(204);
    const getResult = await request(app).get(`${MAIN_ROUTE}/${newAccount.id}`);
    expect(getResult.status).toBe(404);
    expect(getResult.body.error).toBe('Account not found');
  });

  it('should not create an account with n name', async () => {
    const newAccount = { user_id: user.id };
    const result = await request(app).post(MAIN_ROUTE).send(newAccount);
    expect(result.status).toBe(400);
    expect(result.body.error).toEqual('Name must not be null');
  });
});
