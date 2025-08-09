const { createPool } = require('@vercel/postgres');

// createPool() 会自动读取 Vercel 在部署时注入的所有数据库环境变量。
// 我们创建一个连接池实例，并将其导出，以便在整个应用中复用。
const pool = createPool();

module.exports = pool;