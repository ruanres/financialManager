const TABLES = require('../enums/tables');
const ValidationError = require('../error/ValidationError');

module.exports = (app) => {
  const getAll = async (filter = {}) => app.db(TABLES.TRANSFERS).where(filter).select();

  const getOne = async (filter = {}) => app.db(TABLES.TRANSFERS).where(filter).first();

  const createRelatedTransactions = async (transfer) => {
    const transactions = [
      {
        description: `Transfer to acc #${transfer.acc_dest_id}`,
        date: new Date(),
        type: 'O',
        ammount: transfer.ammount * -1,
        acc_id: transfer.acc_ori_id,
        transfer_id: transfer.id,
      }, {
        description: `Transfer from acc #${transfer.acc_ori_id}`,
        date: new Date(),
        type: 'I',
        ammount: transfer.ammount,
        acc_id: transfer.acc_dest_id,
        transfer_id: transfer.id,
      },
    ];
    await app.db(TABLES.TRANSACTIONS).insert(transactions);
  };

  const validate = async (transfer) => {
    const props = ['description', 'ammount', 'date', 'user_id', 'acc_dest_id', 'acc_ori_id'];
    props.forEach((prop) => {
      if (!transfer[prop]) {
        throw new ValidationError(`${prop} must be valid`);
      }
    });

    if (transfer.acc_dest_id === transfer.acc_ori_id) {
      throw new ValidationError('The origin account cannot be equal to the destiny one');
    }

    const accounts = await app.db(TABLES.ACCOUNTS).whereIn('id', [transfer.acc_dest_id, transfer.acc_ori_id]).select('user_id');
    const isFromAnotherUser = (acc) => acc.user_id !== transfer.user_id;
    if (accounts.find(isFromAnotherUser)) {
      throw new ValidationError('It is possible to transfer to another user account');
    }
  };

  const save = async (transfer) => {
    const [newTransfer] = await app.db(TABLES.TRANSFERS).insert(transfer, '*');
    await createRelatedTransactions(newTransfer);
    return newTransfer;
  };

  const update = async (id, updatedTransfer) => {
    const [transfer] = await app.db(TABLES.TRANSFERS).where({ id }).update(updatedTransfer, '*');
    await app.db(TABLES.TRANSACTIONS).where({ transfer_id: id }).del();
    await createRelatedTransactions(transfer);
    return transfer;
  };

  return {
    getAll, save, getOne, update, validate,
  };
};
