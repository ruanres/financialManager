const passport = require('passport');
const passportJwt = require('passport-jwt');

const { Strategy, ExtractJwt } = passportJwt;
const SECRET = 'secret';

module.exports = (app) => {
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET,
  };

  const strategy = new Strategy(options, async (jwtPayload, done) => {
    try {
      const user = await app.services.user.findOne({ id: jwtPayload.id });
      if (user) {
        done(null, { ...jwtPayload });
      } else {
        done(null, false);
      }
    } catch (err) {
      done(err, false);
    }
  });

  passport.use(strategy);

  return {
    authenticate: () => passport.authenticate('jwt', { session: false }),
  };
};
