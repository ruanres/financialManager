module.exports = (app) => {
  const findAll = async (req, res, next) => {
    try {
      const transfers = await app.services.transfer.getAll({ user_id: req.user.id });
      res.status(200).json(transfers);
    } catch (error) {
      next(error);
    }
  };

  const find = async (req, res, next) => {
    try {
      const transfer = await app.services.transfer.getOne({ id: req.params.id });
      res.status(200).json(transfer);
    } catch (error) {
      next(error);
    }
  };

  const create = async (req, res, next) => {
    try {
      const body = { ...req.body, user_id: req.user.id };
      const transfer = await app.services.transfer.save(body);
      res.status(201).json(transfer);
    } catch (error) {
      next(error);
    }
  };

  const update = async (req, res, next) => {
    try {
      const body = { ...req.body, user_id: req.user.id };
      const transfer = await app.services.transfer.update(req.params.id, body);
      res.status(200).json(transfer);
    } catch (error) {
      next(error);
    }
  };

  const remove = async (req, res, next) => {
    try {
      await app.services.transfer.remove(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };


  return {
    findAll, create, find, update, remove,
  };
};
