const LocalStrategy = require('passport-local').Strategy;
const pool = require('../lib/db');
const bcrypt = require('bcryptjs');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // 使用参数化查询根据用户名查找用户
        const { rows } = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
        const user = rows[0];

        // 如果找不到用户
        if (!user) {
          return done(null, false, { message: '该用户不存在。' });
        }

        // 找到用户，比对密码
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          
          if (isMatch) {
            return done(null, user); // 密码匹配，认证成功
          } else {
            return done(null, false, { message: '密码错误。' }); // 密码不匹配
          }
        });
      } catch (err) {
        console.error('Passport strategy error:', err);
        return done(err);
      }
    })
  );

  // 序列化用户：决定将用户的哪些信息存储在 session 中
  // 这里我们只存储用户的 ID
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // 反序列化用户：在每个请求中，根据 session 中存储的 ID 从数据库中查找完整的用户信息
  passport.deserializeUser(async (id, done) => {
    try {
      // 根据 ID 从数据库查找用户，不包含密码
      const { rows } = await pool.query('SELECT id, username, email FROM Users WHERE id = $1', [id]);
      done(null, rows[0]);
    } catch (err) {
      done(err, null);
    }
  });
};