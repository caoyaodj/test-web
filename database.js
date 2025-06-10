const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

// 连接数据库（自动创建文件）
const db = new sqlite3.Database('users.db');

// 初始化用户表
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);
});

// 注册用户
function registerUser(username, password, callback) {
  // 加密密码
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return callback(err);
    
    db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hash],
      function(err) {
        callback(err, this.lastID);
      }
    );
  });
}

// 验证用户
function verifyUser(username, password, callback) {
  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (err, row) => {
      if (err) return callback(err);
      if (!row) return callback(null, null);
      
      // 比对密码
      bcrypt.compare(password, row.password, (err, isValid) => {
        callback(err, isValid ? row : null);
      });
    }
  );
}

module.exports = {
  registerUser,
  verifyUser
};