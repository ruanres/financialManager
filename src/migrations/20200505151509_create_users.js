const TABLE_NAME = 'users';

exports.up = (knex) => knex.schema.createTable(TABLE_NAME, (t) => {
  t.increments('id').primary();
  t.string('name').notNullable();
  t.string('email').notNullable().unique();
  t.string('password').notNullable();
});

exports.down = (knex) => knex.schema.dropTableIfExists(TABLE_NAME);
