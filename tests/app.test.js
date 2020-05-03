const request = require('supertest');
const app = require('../src/app');

test('should responde on port 3001', async () => {
  const response = await request(app).get('/');
  expect(response.status).toBe(200);
});
