const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const userService = require("./user");

//@see: https://github.com/passport/express-4.x-local-example/blob/master/server.js
//
// Configure the local strategy for use by Passport.
//
// The local strategy requires a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(
  new LocalStrategy((username, password, cb) => {
    userService.findByEmail(username, true, (err, user) => {
      if (err) {
        return cb(err);
      }

      if (!user || parseInt(user.active) === 0) {
        return cb(null, false);
      }

      bcrypt.compare(password, user.password, (err, isCorrect) => {
        if (err || !isCorrect) {
          return cb(null, false);
        }

        // remove PIIs
        delete user.password;

        return cb(null, { ...user, active: user.active == 1 });
      });
    });
  })
);

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  userService.find(id, (err, user) => {
    return err ? cb(err) : cb(null, user);
  });
});

module.exports = passport;
