const ValidationError = require('../error/ValidationError');
const NotFoundError = require('../error/NotFoundError');

module.exports = (app) => {
  const TABLE_NAME = 'accounts';

  const getAll = (filter = {}) => app.db(TABLE_NAME).where(filter).select();

  const get = async (filter) => {
    const account = await app.db(TABLE_NAME).where(filter).first();
    if (!account) throw new NotFoundError('Account not found');
    return account;
  };

  const save = async (account) => {
    if (!account.name) throw new ValidationError('Name must not be null');
    if (!account.user_id) throw new ValidationError('User id must not be null');
    const sameNameAccount = await app.db(TABLE_NAME).where(account).first();
    if (sameNameAccount) throw new ValidationError('An account with this name already exists');
    return app.db(TABLE_NAME).insert(account, ['*']);
  };

  const update = (id, patch) => app.db(TABLE_NAME).where({ id }).update(patch, ['*']);

  const remove = (id) => app.db(TABLE_NAME).where({ id }).del();

  return {
    save, getAll, get, update, remove,
  };
};
