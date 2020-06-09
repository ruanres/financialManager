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

const getTestEntities = () => {
  const password = 'password';
  const users = [{
    id: 10000, name: 'user #1', email: 'user1@mail.com', password,
  },
  {
    id: 10001, name: 'user #2', email: 'user2@mail.com', password,
  }];

  const accounts = [
    { id: 10000, name: 'accOri #1', user_id: users[0].id },
    { id: 10001, name: 'accDest #1', user_id: users[0].id },
    { id: 10002, name: 'accOri #2', user_id: users[1].id },
    { id: 10003, name: 'accDest #2', user_id: users[1].id },
  ];

  return { users, accounts };
};

module.exports = {
  getEmail, makeRequest, clearDB, getTestEntities,
};
