const request = require('supertest');
const app = require('../src/app');

const getEmail = () => `${Date.now()}@mail.com`;

const makeRequest = async (verb, route, token, body = {}) => {
  switch (verb) {
    case 'post':
    case 'put':
      return request(app)[verb](route).send(body).set('authorization', `bearer ${token}`);
    default:
      return request(app)[verb](route).set('authorization', `bearer ${token}`);
  }
};

const clearDB = async (tableName = 'all') => {
  if (tableName === 'all') {
    await app.db('transactions').del();
    await app.db('accounts').del();
    await app.db('users').del();
  } else {
    await app.db(tableName).del();
  }
};

module.exports = { getEmail, makeRequest, clearDB };
