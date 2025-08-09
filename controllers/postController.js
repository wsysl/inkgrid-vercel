const pool = require('../lib/db');
const { put } = require('@vercel/blob');
const path = require('path');

/**
 * 显示所有文章列表
 */
exports.showAllPosts = async (req, res) => {
    try {
        const { rows: posts } = await pool.query(`
            SELECT Posts.id, Posts.title, Posts."featuredImage", Users.username
            FROM Posts
            INNER JOIN Users ON Posts."UserId" = Users.id
            ORDER BY Posts."createdAt" DESC;
        `);
        res.render('home', { posts: posts });
    } catch (error) {
        console.error('获取文章列表时出错:', error);
        res.status(500).send('无法获取文章列表。');
    }
};

/**
 * 显示创建新文章的表单页面
 */
exports.showCreateForm = (req, res) => {
    res.render('create-post');
};

/**
 * 处理创建新文章的逻辑
 */
exports.createPost = async (req, res) => {
    const { title, content } = req.body;
    const userId = req.user.id;

    if (!req.file) {
        return res.status(400).send('特色图片是必需的。');
    }

    try {
        // 从内存中获取文件名和文件 buffer
        const filename = req.file.originalname;
        const fileBuffer = req.file.buffer;

        // 上传文件到 Vercel Blob
        const blob = await put(`articles/${Date.now()}-${filename}`, fileBuffer, {
            access: 'public',
        });

        // 从 Vercel Blob 获取公开可访问的 URL
        const imageUrl = blob.url;

        // 使用参数化查询将文章数据和图片 URL 存入数据库
        await pool.query(
            'INSERT INTO Posts (title, content, "featuredImage", "UserId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
            [title, content, imageUrl, userId]
        );

        res.redirect('/');
    } catch (error) {
        console.error('文章发表或图片上传失败:', error);
        res.status(500).send('文章发表失败。');
    }
};

/**
 * 显示单篇文章的详情
 */
exports.showPostDetail = async (req, res) => {
    try {
        const postId = req.params.id;
        
        // 使用参数化查询获取文章详情
        const { rows } = await pool.query(
            'SELECT Posts.title, Posts.content, Posts."featuredImage", Posts."createdAt", Users.username FROM Posts INNER JOIN Users ON Posts."UserId" = Users.id WHERE Posts.id = $1',
            [postId]
        );

        if (rows.length === 0) {
            return res.status(404).send('找不到该文章。');
        }

        res.render('post-detail', { post: rows[0] });
    } catch (error) {
        console.error('获取文章详情时出错:', error);
        res.status(500).send('无法获取文章详情。');
    }
};