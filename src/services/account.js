const ValidationError = require('../error/ValidationError');
const NotFoundError = require('../error/NotFoundError');

module.exports = (app) => {
  const ACCOUNTS = 'accounts';

  const getAll = (filter = {}) => app.db(ACCOUNTS).where(filter).select();

  const get = async (filter) => {
    const account = await app.db(ACCOUNTS).where(filter).first();
    if (!account) throw new NotFoundError('Account not found');
    return account;
  };

  const save = async (account) => {
    if (!account.name) throw new ValidationError('Name must not be null');
    if (!account.user_id) throw new ValidationError('User id must not be null');
    const sameNameAccount = await app.db(ACCOUNTS).where(account).first();
    if (sameNameAccount) throw new ValidationError('An account with this name already exists');
    return app.db(ACCOUNTS).insert(account, ['*']);
  };

  const update = (id, patch) => app.db(ACCOUNTS).where({ id }).update(patch, ['*']);

  const remove = async (id) => {
    const transactions = await app.services.transaction.getOne({ acc_id: id });
    if (transactions) throw new ValidationError('This account has transactions related to it');
    return app.db(ACCOUNTS).where({ id }).del();
  };

  return {
    save, getAll, get, update, remove,
  };
};
