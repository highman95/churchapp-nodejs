"use strict";

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const authService = require("./auth");

//@see: https://github.com/passport/express-4.x-local-example/blob/master/server.js
//@see: https://github.com/passport/express-4.x-local-example/blob/master/boot/auth.js
//
// Configure the local strategy for use by Passport.
//
// The local strategy requires a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(
  new LocalStrategy(
    { usernameField: "username", passReqToCallback: true },
    (req, username, password, cb) => {
      authService.login(username, password, (err, user, code = 400) => {
        const tokenObj = req.isWR ? {} : { token: user?.token };
        return err || !user
          ? cb(null, false, { message: err.message, code })
          : cb(null, user.data, { code, ...tokenObj });
      });
    }
  )
);

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser((user, cb) => {
  process.nextTick(() => cb(null, user.id));
});

passport.deserializeUser((id, cb) => {
  process.nextTick(() => {
    authService.find(id, (err, user) => {
      delete user.password;
      return err ? cb(err) : cb(null, user);
    });
  });
});

module.exports = passport;
