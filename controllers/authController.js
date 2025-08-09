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
        return res.status(400).send('两次输入的密码不匹配。');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.query(
            'INSERT INTO "Users" (username, email, password) VALUES ($1, $2, $3)',
            [username, email, hashedPassword]
        );

        res.redirect('/login');
    } catch (error) {
        console.error('注册用户时出错:', error);
        res.status(500).send('注册失败，用户名或邮箱可能已被占用。');
    }
};

/**
 * 处理用户登录逻辑 (交由 Passport 中间件处理)
 */
exports.loginUser = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
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