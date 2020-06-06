
module.exports = {
  test: {
    client: 'pg',
    version: '12.2',
    connection: {
      database: 'fincdb',
      user: 'pguser',
      password: 'pgpass',
    },
    migrations: { directory: 'src/migrations' },
    seeds: { directory: 'src/seeds' },
  },

};
