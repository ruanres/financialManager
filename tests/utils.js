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
  const [userId1, userId2] = [10000, 10001];
  const [accOri1, accDest1, accOri2, accDest2] = [10000, 10001, 10002, 10003];
  const [transferId1, transferId2] = [10000, 10001];
  const password = 'password';

  const users = [{
    id: userId1, name: 'user #1', email: 'user1@mail.com', password,
  },
  {
    id: userId2, name: 'user #2', email: 'user2@mail.com', password,
  }];

  const accounts = [
    { id: accOri1, name: 'accOri #1', user_id: users[0].id },
    { id: accDest1, name: 'accDest #1', user_id: users[0].id },
    { id: accOri2, name: 'accOri #2', user_id: users[1].id },
    { id: accDest2, name: 'accDest #2', user_id: users[1].id },
  ];

  const transfers = [
    {
      id: transferId1,
      description: 'Transfer #1',
      user_id: userId1,
      acc_ori_id: accOri1,
      acc_dest_id: accDest1,
      ammount: 100,
      date: new Date(),
    },
    {
      id: transferId2,
      description: 'Transfer #2',
      user_id: userId2,
      acc_ori_id: accOri2,
      acc_dest_id: accDest2,
      ammount: 100,
      date: new Date(),
    },
  ];

  const transactions = [
    {
      description: 'Transfer from accOri #1',
      date: new Date(),
      ammount: 100,
      type: 'I',
      acc_id: accDest1,
      transfer_id: transferId1,
    },
    {
      description: 'Transfer to accDest #1',
      date: new Date(),
      ammount: -100,
      type: 'O',
      acc_id: accOri1,
      transfer_id: transferId1,
    },
    {
      description: 'Transfer from accOri #2',
      date: new Date(),
      ammount: 100,
      type: 'I',
      acc_id: accDest2,
      transfer_id: transferId2,
    },
    {
      description: 'Transfer to accDest #2',
      date: new Date(),
      ammount: -100,
      type: 'O',
      acc_id: accOri2,
      transfer_id: transferId2,
    },
  ];

  return {
    users, accounts, transfers, transactions,
  };
};

module.exports = {
  getEmail, makeRequest, clearDB, getTestEntities,
};
