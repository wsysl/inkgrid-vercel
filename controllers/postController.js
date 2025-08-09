const { sql } = require('@vercel/postgres');
const { put } = require('@vercel/blob'); // 【修改点 1】: 导入 Vercel Blob 的 put 方法
const path = require('path');

// showAllPosts 和 showPostDetail 函数保持不变...
exports.showAllPosts = async (req, res) => {
    // ... (代码不变)
};

exports.showPostDetail = async (req, res) => {
    // ... (代码不变)
};

exports.showCreateForm = (req, res) => res.render('create-post');

// 【修改点 2】: 完全重写 createPost 函数
exports.createPost = async (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.id;

    // 检查是否有文件被上传
    if (!req.file) {
        return res.status(400).send('特色图片是必需的。');
    }

    try {
        // 从内存中获取文件名和文件内容
        const filename = req.file.originalname;
        const fileBuffer = req.file.buffer;

        // 上传文件到 Vercel Blob
        // 'articles/' 是你在 Blob 存储中的一个虚拟文件夹
        const blob = await put(`articles/${filename}`, fileBuffer, {
            access: 'public', // 确保文件是公开可访问的
        });

        // Vercel Blob 会返回一个包含 url 的对象
        // 我们将这个公开的 URL 存入数据库
        const imageUrl = blob.url;

        // 将文章信息和图片的 URL 存入数据库
        await sql`
            INSERT INTO Posts (title, content, "featuredImage", "UserId", "createdAt", "updatedAt")
            VALUES (${title}, ${content}, ${imageUrl}, ${userId}, NOW(), NOW());
        `;

        res.redirect('/');
    } catch (error) {
        console.error('文章发表或图片上传失败:', error);
        res.status(500).send('文章发表失败。');
    }
};