const ValidationError = require('../error/ValidationError');

module.exports = (app) => {
  const findAll = (filter = {}) => app.db('users').where(filter).select();

  const save = async (user) => {
    if (!user.name) throw new ValidationError('Name must not be null');
    if (!user.email) throw new ValidationError('Email must not be null');
    if (!user.password) throw new ValidationError('Password must not be null');

    const users = await findAll({ email: user.email });
    if (users.length > 0) throw new ValidationError('Email must be unique');

    return app.db('users').insert(user, '*');
  };

  return { findAll, save };
};
