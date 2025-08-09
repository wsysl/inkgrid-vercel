require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');

const app = express();

// Passport 配置
require('./config/passport')(passport);

// 路由导入
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

// EJS 视图引擎设置
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'a_very_weak_secret_for_dev',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});

// 挂载路由
app.use('/', authRoutes);
app.use('/', postRoutes);

// Vercel 部署关键: 导出 app
module.exports = app;