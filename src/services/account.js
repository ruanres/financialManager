module.exports = (app) => {
  const TABLE_NAME = 'accounts';

  const save = (account) => {
    if (!account.name) return Promise.reject(new Error('Name must not be null'));
    if (!account.user_id) return Promise.reject(new Error('User id must not be null'));
    return app.db(TABLE_NAME).insert(account, ['*']);
  };

  const getAll = (filter = {}) => app.db(TABLE_NAME).where(filter).select();

  const get = (id) => app.db(TABLE_NAME).where({ id }).first();

  const update = (id, patch) => app.db(TABLE_NAME).where({ id }).update(patch, ['*']);

  const remove = (id) => app.db(TABLE_NAME).where({ id }).del();

  return {
    save, getAll, get, update, remove,
  };
};
