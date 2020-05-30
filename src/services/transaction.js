module.exports = (app) => {
  const TRANSACTIONS = 'transactions';
  const ACCOUNTS = 'accounts';

  const getAll = async (userId, filter = {}) => app.db(TRANSACTIONS)
    .join(ACCOUNTS, `${ACCOUNTS}.id`, '=', 'acc_id')
    .where(filter)
    .andWhere(`${ACCOUNTS}.user_id`, '=', userId)
    .select();

  const save = async (transaction) => app.db(TRANSACTIONS).insert(transaction, ['*']);

  return { getAll, save };
};
