module.exports = (app) => {
  const signin = async (req, res, next) => {
    try {
      const result = await app.services.auth.signin(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  const signup = async (req, res) => {
    try {
      const result = await app.services.user.save(req.body);
      res.status(201).json(result[0]);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  };

  return {
    signin, signup,
  };
};
