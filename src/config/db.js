const knex = require('knex');
const knexFile = require('../../knexfile');

const config = knexFile[process.env.NODE_ENV];

module.exports = knex(config);
