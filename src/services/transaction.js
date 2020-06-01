const ValidationError = require('../error/ValidationError');

module.exports = (app) => {
  const TRANSACTIONS = 'transactions';
  const ACCOUNTS = 'accounts';

  const getAll = async (userId, filter = {}) => app.db(TRANSACTIONS)
    .join(ACCOUNTS, `${ACCOUNTS}.id`, '=', 'acc_id')
    .where(filter)
    .andWhere(`${ACCOUNTS}.user_id`, '=', userId)
    .select();

  const getOne = async (id) => app.db(TRANSACTIONS).where({ id }).select();

  const validate = (transaction) => {
    const props = ['description', 'type', 'date', 'ammount', 'acc_id'];
    props.forEach((prop) => {
      if (!transaction[prop]) {
        throw new ValidationError(`${prop} must be valid`);
      }
    });

    if (!['I', 'O'].includes(transaction.type)) {
      throw new ValidationError('Type property must be valid');
    }
  };

  const formatAmmount = (transaction) => {
    const { type, ammount } = transaction;
    const isInputAmmountWrong = type === 'I' && ammount < 0;
    const isOutputAmmountWrong = type === 'O' && ammount > 0;
    return isInputAmmountWrong || isOutputAmmountWrong ? ammount * -1 : ammount;
  };

  const save = async (transaction) => {
    validate(transaction);
    const newTransaction = {
      ...transaction,
      ammount: formatAmmount(transaction),
    };
    return app.db(TRANSACTIONS).insert(newTransaction, ['*']);
  };

  const update = async (id, patch) => app.db(TRANSACTIONS).where({ id }).update(patch, ['*']);

  const remove = async (id) => app.db(TRANSACTIONS).where({ id }).del();

  return {
    getAll, save, getOne, update, remove,
  };
};
