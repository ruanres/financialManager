module.exports = (app) => {
  const get = async (req, res, next) => {
    try {
      const result = await app.services.balance.get(req.user.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  return { get };
};
