const LocalStrategy = require('passport-local').Strategy;
const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const { rows } = await sql`SELECT * FROM Users WHERE username = ${username};`;
        const user = rows[0];

        if (!user) {
          return done(null, false, { message: '该用户不存在。' });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: '密码错误。' });
          }
        });
      } catch (err) {
        console.error('Passport strategy error:', err);
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const { rows } = await sql`SELECT id, username, email FROM Users WHERE id = ${id};`;
      done(null, rows[0]);
    } catch (err) {
      done(err, null);
    }
  });
};