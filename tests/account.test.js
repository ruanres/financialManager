const request = require('supertest');
const app = require('../src/app');

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
