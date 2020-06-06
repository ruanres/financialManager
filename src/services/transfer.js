const TABLES = require('../enums/tables');

module.exports = (app) => {
  const getAll = async (userId) => app.db(TABLES.TRANSFERS).where({ user_id: userId }).select();

  const save = async (transfer) => app.db(TABLES.TRANSFERS).insert(transfer, '*');

  return { getAll, save };
};
