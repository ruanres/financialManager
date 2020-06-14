
const TABLES = require('../enums/tables');
const { hashPassword } = require('../utils');

exports.seed = async (knex) => {
  const password = await hashPassword('password');
  const [userId1, userId2] = [10100, 10101];
  await knex(TABLES.USERS).insert([
    {
      id: userId1, name: 'user #3', email: 'user3@mail.com', password,
    },
    {
      id: userId2, name: 'user #4', email: 'user4@mail.com', password,
    },
  ]);
  const [accOri1, accDest1, accOri2, accDest2] = [10100, 10101, 10102, 10103];
  await knex(TABLES.ACCOUNTS).insert([
    { id: accOri1, name: 'Acc main balance', user_id: userId1 },
    { id: accDest1, name: 'Acc secondary balance', user_id: userId1 },
    { id: accOri2, name: 'Acc alternative #1', user_id: userId2 },
    { id: accDest2, name: 'Acc alternative #2', user_id: userId2 },
  ]);
};
