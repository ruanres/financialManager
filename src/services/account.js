module.exports = (app) => {
  const save = (account) => {
    if (!account.name) return Promise.reject(new Error('Name must not be null'));
    if (!account.user_id) return Promise.reject(new Error('User id must not be null'));
    return app.db('accounts').insert(account, ['*']);
  };

  return { save };
};
