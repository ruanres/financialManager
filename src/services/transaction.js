module.exports = (app) => {
  const TRANSACTIONS = 'transactions';
  const ACCOUNTS = 'accounts';

  const getAll = async (userId, filter = {}) => app.db(TRANSACTIONS)
    .join(ACCOUNTS, `${ACCOUNTS}.id`, '=', 'acc_id')
    .where(filter)
    .andWhere(`${ACCOUNTS}.user_id`, '=', userId)
    .select();

  const getOne = async (id) => app.db(TRANSACTIONS).where({ id }).select();

  const save = async (transaction) => {
    const { type, ammount } = transaction;
    const newTransaction = { ...transaction };
    const isInputAmmountWrong = type === 'I' && ammount < 0;
    const isOutputAmmountWrong = type === 'O' && ammount > 0;
    if (isInputAmmountWrong || isOutputAmmountWrong) {
      newTransaction.ammount *= -1;
    }
    return app.db(TRANSACTIONS).insert(newTransaction, ['*']);
  };

  const update = async (id, patch) => app.db(TRANSACTIONS).where({ id }).update(patch, ['*']);

  const remove = async (id) => app.db(TRANSACTIONS).where({ id }).del();

  return {
    getAll, save, getOne, update, remove,
  };
};
