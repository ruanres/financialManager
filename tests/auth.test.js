const request = require('supertest');
const app = require('../src/app');
const { getEmail } = require('./utils');

describe('Auth tests', () => {
  const ROUTE = '/auth';
  const SIGNIN_ROUTE = `${ROUTE}/signin`;
  const SIGNUP_ROUTE = `${ROUTE}/signup`;
  let user;

  beforeEach(async () => {
    user = { name: 'tom', email: getEmail(), password: 'password' };
    await app.services.user.save(user);
  });

  it('should create a user by signup', async () => {
    const newUser = { name: 'tom', email: getEmail(), password: 'password' };
    const response = await request(app).post(SIGNUP_ROUTE).send(newUser);
    expect(response.status).toBe(201);
    expect(response.body).not.toHaveProperty('password');
    expect(response.body.name).toBe(newUser.name);
    expect(response.body.email).toBe(newUser.email);
  });

  it('should return token on login', async () => {
    const credentials = { email: user.email, password: user.password };
    const response = await request(app).post(SIGNIN_ROUTE).send(credentials);
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it('should not authenticate the user when the password is wrong', async () => {
    const credentials = { email: user.email, password: 'wrong password' };
    const response = await request(app).post(SIGNIN_ROUTE).send(credentials);
    expect(response.status).toBe(401);
    expect(response.body.token).toBeUndefined();
    expect(response.body.error).toBe('Wrong password');
  });

  it('should not authenticate if the user does not exist', async () => {
    const credentials = { email: 'notFound@mail.com', password: 'password' };
    const response = await request(app).post(SIGNIN_ROUTE).send(credentials);
    expect(response.status).toBe(404);
    expect(response.body.token).toBeUndefined();
    expect(response.body.error).toBe('User not found');
  });

  it('should not allow an unauthenticated user to access a protected route', async () => {
    const response = await request(app).get('/users');
    expect(response.status).toBe(401);
  });
});
