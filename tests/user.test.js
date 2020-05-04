const request = require('supertest');
const app = require('../src/app');

it('should list all users', async () => {
  const response = await request(app).get('/users');
  expect(response.status).toBe(200);
  expect(response.body).toHaveLength(1);
  expect(response.body[0]).toHaveProperty('name', 'John Doe');
});

it('should add a new user', async () => {
  const newUser = { name: 'Walter Mitty', email: 'walter@mail.com' };
  const response = await request(app).post('/users').send(newUser);
  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('name', newUser.name);
});
