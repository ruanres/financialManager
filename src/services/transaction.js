module.exports = (app) => {
  const TRANSACTIONS = 'transactions';
  const ACCOUNTS = 'accounts';

  const getAll = async (userId, filter = {}) => app.db(TRANSACTIONS)
    .join(ACCOUNTS, `${ACCOUNTS}.id`, '=', 'acc_id')
    .where(filter)
    .andWhere(`${ACCOUNTS}.user_id`, '=', userId)
    .select();

  const getOne = async (id) => app.db(TRANSACTIONS).where({ id }).select();

  const save = async (transaction) => app.db(TRANSACTIONS).insert(transaction, ['*']);

  const update = async (id, patch) => app.db(TRANSACTIONS).where({ id }).update(patch, ['*']);

  const remove = async (id) => app.db(TRANSACTIONS).where({ id }).del();

  return {
    getAll, save, getOne, update, remove,
  };
};
