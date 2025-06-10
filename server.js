const express = require('express');
const session = require('express-session');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // 托管静态文件

// 会话配置
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // 开发环境使用 http
}));

// API 路由
// 注册接口
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  
  db.registerUser(username, password, (err, userId) => {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({ error: '用户名已存在' });
      }
      return res.status(500).json({ error: '注册失败' });
    }
    
    req.session.userId = userId;
    res.json({ success: true, message: '注册成功' });
  });
});

// 登录接口
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  db.verifyUser(username, password, (err, user) => {
    if (err) return res.status(500).json({ error: '登录失败' });
    if (!user) return res.status(401).json({ error: '用户名或密码错误' });
    
    req.session.userId = user.id;
    res.json({ success: true, message: '登录成功' });
  });
});

// 检查登录状态
app.get('/api/check', (req, res) => {
  if (req.session.userId) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

// 退出登录
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: '退出失败' });
    res.json({ success: true });
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});