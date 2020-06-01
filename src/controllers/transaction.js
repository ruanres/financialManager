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

  const find = async (req, res, next) => {
    try {
      const transaction = await app.services.transaction.getOne({ id: req.params.id });
      res.status(200).json(transaction);
    } catch (error) {
      next(error);
    }
  };

  const update = async (req, res, next) => {
    try {
      const [transaction] = await app.services.transaction.update(req.params.id, req.body);
      res.status(200).json(transaction);
    } catch (error) {
      next(error);
    }
  };

  const remove = async (req, res, next) => {
    try {
      await app.services.transaction.remove(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  return {
    findAll, create, find, update, remove,
  };
};
