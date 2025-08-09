const bcrypt = require('bcryptjs');
const passport = require('passport');
const { sql } = require('@vercel/postgres');

exports.showRegisterPage = (req, res) => res.render('register');
exports.showLoginPage = (req, res) => res.render('login');

exports.registerUser = async (req, res) => {
    const { username, email, password, password2 } = req.body;
    if (password !== password2) {
        // 在实际应用中，这里应该用 flash messages
        return res.status(400).send('两次输入的密码不匹配。');
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await sql`
            INSERT INTO Users (username, email, password)
            VALUES (${username}, ${email}, ${hashedPassword});
        `;
        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send('注册失败，用户名或邮箱可能已被占用。');
    }
};

exports.loginUser = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
});

exports.logoutUser = (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
};