module.exports = (app) => {
  const findAll = async (req, res, next) => {
    try {
      const transactions = await app.services.transaction.getAll(req.user.id);
      res.status(200).json(transactions);
    } catch (error) {
      next(error);
    }
  };

  const create = async (req, res, next) => {
    try {
      const [transaction] = await app.services.transaction.save(req.body);
      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  };

  return { findAll, create };
};
