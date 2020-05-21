const request = require('supertest');
const app = require('../src/app');
const { getEmail } = require('./utils');

describe('Auth tests', () => {
  const ROUTE = '/auth/signin';

  it('should return token on login', async () => {
    const user = { name: 'tom', email: getEmail(), password: 'password' };
    await app.services.user.save(user);
    const credentials = { email: user.email, password: user.password };
    const response = await request(app).post(ROUTE).send(credentials);
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});
