const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 【新增】: 导入我们用于保护路由的中间件
// 虽然登出路由很特殊，但从逻辑严谨性上讲，只有登录的用户才能执行“登出”操作。
const { isAuthenticated } = require('../middleware/isAuthenticated');

// =================================================================
// 公开路由 (Public Routes) - 任何人都可以访问
// =================================================================

// GET /register - 显示注册表单页面
router.get('/register', authController.showRegisterPage);

// POST /register - 处理用户提交的注册信息
router.post('/register', authController.registerUser);

// GET /login - 显示登录表单页面
router.get('/login', authController.showLoginPage);

// POST /login - 处理用户提交的登录信息 (由 Passport.js 中间件处理)
router.post('/login', authController.loginUser);


// =================================================================
// 私有路由 (Private Route) - 只有登录用户才能访问
// =================================================================

// GET /logout - 处理用户登出
// 通过添加 isAuthenticated 中间件，可以防止未登录用户访问此链接
router.get('/logout', isAuthenticated, authController.logoutUser);


module.exports = router;