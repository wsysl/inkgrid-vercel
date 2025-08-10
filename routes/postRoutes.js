const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { isAuthenticated } = require('../middleware/isAuthenticated');
const multer = require('multer');

// multer 配置保持不变
const upload = multer({ storage: multer.memoryStorage() });

// 路由定义

// 【修改点 1】: 在主页路由上添加 isAuthenticated 中间件
// 现在，任何未登录的用户访问主页都会被重定向到 /login
router.get('/', isAuthenticated, postController.showAllPosts);

// 发表文章相关的路由保持不变，它们已经被保护了
router.get('/post/new', isAuthenticated, postController.showCreateForm);
router.post('/post/new', isAuthenticated, upload.single('featuredImage'), postController.createPost);

// 【修改点 2】: 在文章详情页路由上添加 isAuthenticated 中间件
// 现在，任何未登录的用户访问具体的文章链接也会被重定向到 /login
router.get('/post/:id', isAuthenticated, postController.showPostDetail);

module.exports = router;