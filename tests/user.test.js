const request = require('supertest');
const app = require('../src/app');

const getEmail = () => `${Date.now()}@mail.com`;

it('should list all users', async () => {
  const response = await request(app).get('/users');
  expect(response.status).toBe(200);
  expect(response.body.length).toBeGreaterThan(0);
});

it('should add a new user', async () => {
  const newUser = { name: 'Walter Mitty', email: getEmail(), password: 'password' };
  const response = await request(app).post('/users').send(newUser);
  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('name', newUser.name);
  expect(response.body).not.toHaveProperty('password');
});

it('should store the password encoded', async () => {
  const newUser = { name: 'Walter Mitty', email: getEmail(), password: 'password' };
  const response = await request(app).post('/users').send(newUser);
  expect(response.status).toBe(201);
  const { id } = response.body;
  const user = await app.services.user.findOne({ id });
  expect(user.password).toBeDefined();
  expect(user.password).not.toEqual(newUser.password);
});

it('should not add a new user with a duplicated email', async () => {
  const email = getEmail();
  const newUser = { name: 'Walter Mitty', email, password: 'password' };
  await request(app).post('/users').send(newUser);
  const otherUser = { name: 'Other Walter Mitty', email, password: 'password' };
  const response = await request(app).post('/users').send(otherUser);
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Email must be unique');
});

it.each([
  ['Name', { email: 'john@mail.com', password: 'john@mail.com' }],
  ['Email', { name: 'john', password: 'password' }],
  ['Password', { name: 'john', email: 'john@mail.com' }],
])('should not insert a user with no %s', async (field, user) => {
  const response = await request(app).post('/users').send(user);
  expect(response.status).toBe(400);
  expect(response.body.error).toBe(`${field} must not be null`);
});
