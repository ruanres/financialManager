module.exports = (app) => {
  const findAll = (filter = {}) => app.db('users').where(filter).select();

  const save = async (user) => {
    if (!user.name) return Promise.reject(new Error('Name must not be null'));
    if (!user.email) return Promise.reject(new Error('Email must not be null'));
    if (!user.password) return Promise.reject(new Error('Password must not be null'));

    const users = await findAll({ email: user.email });
    if (users.length > 0) return Promise.reject(new Error('Email must be unique'));

    return app.db('users').insert(user, '*');
  };

  return { findAll, save };
};
