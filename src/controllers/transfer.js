module.exports = (app) => {
  const findAll = async (req, res, next) => {
    try {
      const transfers = await app.services.transfer.getAll(req.user.id);
      res.status(200).json(transfers);
    } catch (error) {
      next(error);
    }
  };

  const create = async (req, res, next) => {
    try {
      const [transfer] = await app.services.transfer.save(req.body);
      res.status(201).json(transfer);
    } catch (error) {
      next(error);
    }
  };


  return {
    findAll, create,
  };
};
