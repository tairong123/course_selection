var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sqlite3 = require('sqlite3').verbose();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

var db = new sqlite3.Database(path.join(__dirname, 'db', 'course.db'), (err) => {
  if (err) {
    console.error('資料庫連接失敗:', err.message);
  } else {
    console.log('已成功連接到 SQLite3 資料庫。');
  }
});

// 登錄路由
app.post('/api/courses', (req, res) => {
  let { id } = req.body;
  let sql = 'SELECT * FROM course WHERE id = ?';
  db.all(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).send({ message: '資料庫錯誤' });
    }
    if (row) {
      res.json(row[0]);
    } else {
      res.send({ success: false, message: '無效的憑證' });
    }
  });
});

module.exports = app;