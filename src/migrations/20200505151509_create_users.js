
exports.up = (knex) => knex.schema.createTable('users', (t) => {
  t.increments('id').primary();
  t.string('name').notNullable();
  t.string('email').notNullable().unique();
  t.string('password').notNullable();
});

exports.down = (knex) => knex.schema.dropTableIfExists('users');
