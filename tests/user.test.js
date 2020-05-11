const request = require('supertest');
const app = require('../src/app');

it('should list all users', async () => {
  const response = await request(app).get('/users');
  expect(response.status).toBe(200);
  expect(response.body.length).toBeGreaterThan(0);
});

it('should add a new user', async () => {
  const email = `${Date.now()}@mail.com`;
  const newUser = { name: 'Walter Mitty', email, password: 'password' };
  const response = await request(app).post('/users').send(newUser);
  expect(response.status).toBe(201);
  expect(response.body[0]).toHaveProperty('name', newUser.name);
});
