const { sql } = require('@vercel/postgres');
const path = require('path');

exports.showAllPosts = async (req, res) => {
    try {
        const { rows: posts } = await sql`
            SELECT Posts.id, Posts.title, Posts."featuredImage", Users.username
            FROM Posts
            INNER JOIN Users ON Posts."UserId" = Users.id
            ORDER BY Posts."createdAt" DESC;
        `;
        res.render('home', { posts: posts });
    } catch (error) {
        console.error(error);
        res.status(500).send('无法获取文章列表。');
    }
};

exports.showCreateForm = (req, res) => res.render('create-post');

exports.createPost = async (req, res) => {
    const { title, content } = req.body;
    // req.file 由 Multer 提供
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const userId = req.user.id;

    try {
        await sql`
            INSERT INTO Posts (title, content, "featuredImage", "UserId", "createdAt", "updatedAt")
            VALUES (${title}, ${content}, ${imagePath}, ${userId}, NOW(), NOW());
        `;
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('文章发表失败。');
    }
};

exports.showPostDetail = async (req, res) => {
    try {
        const postId = req.params.id;
        const { rows } = await sql`
            SELECT Posts.title, Posts.content, Posts."featuredImage", Posts."createdAt", Users.username
            FROM Posts
            INNER JOIN Users ON Posts."UserId" = Users.id
            WHERE Posts.id = ${postId};
        `;
        if (rows.length === 0) {
            return res.status(404).send('找不到该文章。');
        }
        res.render('post-detail', { post: rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send('无法获取文章详情。');
    }
};