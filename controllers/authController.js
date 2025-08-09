const bcrypt = require('bcryptjs');
const passport = require('passport');
const pool = require('../lib/db');

/**
 * 显示注册页面
 */
exports.showRegisterPage = (req, res) => {
    res.render('register');
};

/**
 * 显示登录页面
 */
exports.showLoginPage = (req, res) => {
    res.render('login');
};

/**
 * 处理用户注册逻辑
 */
exports.registerUser = async (req, res) => {
    const { username, email, password, password2 } = req.body;

    if (password !== password2) {
        // 在实际应用中，这里应该使用 connect-flash 来显示更友好的错误消息
        return res.status(400).send('两次输入的密码不匹配。');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 使用参数化查询将新用户信息插入数据库
        await pool.query(
            'INSERT INTO Users (username, email, password) VALUES ($1, $2, $3)',
            [username, email, hashedPassword]
        );

        res.redirect('/login');
    } catch (error) {
        console.error('注册用户时出错:', error);
        // 通常错误是因为用户名或邮箱已存在 (违反 UNIQUE 约束)
        res.status(500).send('注册失败，用户名或邮箱可能已被占用。');
    }
};

/**
 * 处理用户登录逻辑 (交由 Passport 中间件处理)
 */
exports.loginUser = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    // failureFlash: true // 如果使用 connect-flash，可以开启这个选项
});

/**
 * 处理用户登出逻辑
 */
exports.logoutUser = (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
};