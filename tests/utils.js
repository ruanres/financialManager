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

module.exports = { getEmail, makeRequest };
