const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { isAuthenticated } = require('../middleware/isAuthenticated');
const multer = require('multer');
const path = require('path');

// Multer 配置 (用于处理图片上传)
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 路由定义
router.get('/', postController.showAllPosts);
router.get('/post/new', isAuthenticated, postController.showCreateForm);
router.post('/post/new', isAuthenticated, upload.single('featuredImage'), postController.createPost);
router.get('/post/:id', postController.showPostDetail);

module.exports = router;