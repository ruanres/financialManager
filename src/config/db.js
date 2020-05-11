const knex = require('knex');
const knexFile = require('../../knexfile');

const env = 'test';
const config = knexFile[env];

module.exports = knex(config);
