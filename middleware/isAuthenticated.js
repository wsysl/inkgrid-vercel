module.exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // 在实际应用中，这里应该用 flash messages 提示用户
    res.redirect('/login');
};