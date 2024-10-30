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

// 連接 course 資料庫
var db = new sqlite3.Database(path.join(__dirname, 'db', 'course.db'), (err) => {
  if (err) {
    console.error('資料庫連接失敗:', err.message);
  } else {
    console.log('已成功連接到 course 資料庫。');
  }
});

// 連接 students 資料庫
var students_db = new sqlite3.Database(path.join(__dirname, 'db', 'students.db'), (err) => {
  if (err) {
    console.error('資料庫連接失敗:', err.message);
  } else {
    console.log('已成功連接到 students 資料庫。');
  }
});

// 查詢課程資料路由
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

// 登入路由
app.post('/api/login', (req, res) => {
  let { username, password } = req.body;
  let sql = 'SELECT * FROM students WHERE id = ? AND password = ?';

  students_db.get(sql, [username, password], (err, row) => {
    if (err) {
      return res.status(500).send({ message: '資料庫錯誤' });
    }
    console.log(row);
    if (row) {
      res.send({ success: true, message: '登入成功' });
    } else {
      res.send({ success: false, message: '使用者名稱或密碼錯誤' });
    }
  });
});

module.exports = app;
