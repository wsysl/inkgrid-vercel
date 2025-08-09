const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { isAuthenticated } = require('../middleware/isAuthenticated');
const multer = require('multer');

// 【修改点 1】: 不再使用 diskStorage，而是使用 memoryStorage
// memoryStorage 会将文件临时保存在内存中，作为一个 Buffer 对象
// 这样就不会尝试写入只读文件系统了
const upload = multer({ storage: multer.memoryStorage() });

// 路由定义
router.get('/', postController.showAllPosts);
router.get('/post/new', isAuthenticated, postController.showCreateForm);

// 【修改点 2】: 保持 upload.single() 中间件不变，它现在会将文件放入 req.file 的 buffer 中
router.post('/post/new', isAuthenticated, upload.single('featuredImage'), postController.createPost);

router.get('/post/:id', postController.showPostDetail);

module.exports = router;