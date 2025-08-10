const pool = require('../lib/db');
const { put } = require('@vercel/blob');
const path = require('path');

/**
 * 显示当前登录用户的所有文章列表
 */
exports.showAllPosts = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { rows: posts } = await pool.query(
            'SELECT "Posts".id, "Posts".title, "Posts"."featuredImage", "Users".username FROM "Posts" INNER JOIN "Users" ON "Posts"."UserId" = "Users".id WHERE "Posts"."UserId" = $1 ORDER BY "Posts"."createdAt" DESC',
            [currentUserId]
        );
        res.render('home', { posts: posts });
    } catch (error) {
        console.error('获取个人文章列表时出错:', error);
        res.status(500).send('无法获取您的文章列表。');
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
        const filename = req.file.originalname;
        const fileBuffer = req.file.buffer;
        const blob = await put(`articles/${Date.now()}-${filename}`, fileBuffer, { access: 'public' });
        const imageUrl = blob.url;
        await pool.query(
            'INSERT INTO "Posts" (title, content, "featuredImage", "UserId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())',
            [title, content, imageUrl, userId]
        );
        res.redirect('/');
    } catch (error) {
        console.error('文章发表或图片上传失败:', error);
        res.status(500).send('文章发表失败。');
    }
};

/**
 * 显示单篇文章的详情 (仅限本人)
 */
exports.showPostDetail = async (req, res) => {
    try {
        const postId = req.params.id;
        const currentUserId = req.user.id;
        const { rows } = await pool.query(
            'SELECT "Posts".title, "Posts".content, "Posts"."featuredImage", "Posts"."createdAt", "Users".username FROM "Posts" INNER JOIN "Users" ON "Posts"."UserId" = "Users".id WHERE "Posts".id = $1 AND "Posts"."UserId" = $2',
            [postId, currentUserId]
        );
        if (rows.length === 0) {
            return res.status(404).send('找不到该文章或您没有权限查看。');
        }
        res.render('post-detail', { post: rows[0] });
    } catch (error) {
        console.error('获取文章详情时出错:', error);
        res.status(500).send('无法获取文章详情。');
    }
};
