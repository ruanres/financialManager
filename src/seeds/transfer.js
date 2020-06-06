
const TABLES = require('../enums/tables');
const { hashPassword } = require('../utils');

exports.seed = async (knex) => {
  await knex(TABLES.TRANSACTIONS).del();
  await knex(TABLES.TRANSFERS).del();
  await knex(TABLES.ACCOUNTS).del();
  await knex(TABLES.USERS).del();

  const password = await hashPassword('password');
  const [userId1, userId2] = [10000, 10002];
  await knex(TABLES.USERS).insert([
    {
      id: userId1, name: 'user #1', email: 'user1@mail.com', password,
    },
    {
      id: userId2, name: 'user #2', email: 'user2@mail.com', password,
    },
  ]);
  const [accOri1, accDest1, accOri2, accDest2] = [10000, 10001, 10002, 10003];
  await knex(TABLES.ACCOUNTS).insert([
    { id: accOri1, name: 'accOri #1', user_id: userId1 },
    { id: accDest1, name: 'accDest #1', user_id: userId1 },
    { id: accOri2, name: 'accOri #2', user_id: userId2 },
    { id: accDest2, name: 'accDest #2', user_id: userId2 },
  ]);

  const [transferId1, transferId2] = [10000, 10001];
  await knex(TABLES.TRANSFERS).insert([
    {
      id: transferId1, description: 'Transfer #1', user_id: userId1, acc_ori_id: accOri1, acc_dest_id: accDest1, ammount: 100, date: new Date(),
    },
    {
      id: transferId2, description: 'Transfer #2', user_id: userId2, acc_ori_id: accOri2, acc_dest_id: accDest2, ammount: 100, date: new Date(),
    },
  ]);

  await knex(TABLES.TRANSACTIONS).insert([
    {
      description: 'Transfer to accDest #1', date: new Date(), ammount: -100, type: 'O', acc_id: accOri1, transfer_id: transferId1,
    },
    {
      description: 'Transfer from accOri #1', date: new Date(), ammount: 100, type: 'I', acc_id: accDest1, transfer_id: transferId1,
    },
    {
      description: 'Transfer to accDest #2', date: new Date(), ammount: -100, type: 'O', acc_id: accOri2, transfer_id: transferId2,
    },
    {
      description: 'Transfer from accOri #2', date: new Date(), ammount: 100, type: 'I', acc_id: accDest2, transfer_id: transferId2,
    },
  ]);
};
