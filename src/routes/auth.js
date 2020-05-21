module.exports = (app) => {
  const signin = async (req, res, next) => {
    try {
      const result = await app.services.auth.signin(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  return {
    signin,
  };
};
