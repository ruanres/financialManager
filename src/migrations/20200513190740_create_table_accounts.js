const TABLE_NAME = 'accounts';

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (t) => {
  t.increments('id').primary();
  t.string('name').notNull();
  t.integer('user_id')
    .references('id')
    .inTable('users')
    .notNull();
});

exports.down = (knex) => knex.schema.dropTableIfExists(TABLE_NAME);
