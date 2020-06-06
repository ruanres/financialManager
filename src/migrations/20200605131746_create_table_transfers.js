const TABLES = require('../enums/tables');

exports.up = (knex) => Promise.all([
  knex.schema.createTable(TABLES.TRANSFERS, (t) => {
    t.increments('id').primary();
    t.string('description').notNull();
    t.date('date').notNull();
    t.decimal('ammount', 15, 2).notNull();
    t.integer('acc_ori_id')
      .references('id')
      .inTable('accounts')
      .notNull();
    t.integer('acc_dest_id')
      .references('id')
      .inTable('accounts')
      .notNull();
    t.integer('user_id')
      .references('id')
      .inTable('users')
      .notNull();
  }),
  knex.schema.table(TABLES.TRANSACTIONS, (t) => {
    t.integer('transfer_id')
      .references('id')
      .inTable(TABLES.TRANSFERS)
      .notNull();
  }),
]);


exports.down = (knex) => Promise.all([
  knex.schema.table(TABLES.ACCOUNTS, (t) => {
    t.dropColumn('transfer_id');
  }),
  knex.schema.dropTableIfExists(TABLES.TRANSFERS),
]);
