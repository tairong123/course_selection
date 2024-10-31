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

var schedule_db = new sqlite3.Database(path.join(__dirname, 'db', 'schedule.db'), (err) => {
  if (err) {
    console.error('資料庫連接失敗:', err.message);
  } else {
    console.log('已成功連接到 schedule 資料庫。');
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

app.post('/api/student-courses', (req, res) => {
  const { username } = req.body;
  const sql = 'SELECT course_id FROM schedule WHERE student_id = ?';

  schedule_db.all(sql, [username], (err, rows) => {
    if (err) {
      res.status(500).send({ message: '資料庫錯誤' });
    } else {
      res.json(rows); // 傳回查詢的課程資料
    }
  });
});

app.post('/api/drop-course', (req, res) => {
  const { username, courseId } = req.body;

  const getStudentCreditsSql = 'SELECT credit, department ,grade FROM students WHERE id = ?';
  const getCourseInfoSql = 'SELECT credit, required_elective, department ,grade FROM course WHERE id = ?';
  const deleteCourseSql = 'DELETE FROM schedule WHERE student_id = ? AND course_id = ?';
  const updateStudentCreditsSql = 'UPDATE students SET credit = ? WHERE id = ?';

  // 查詢學生當前的總學分
  students_db.get(getStudentCreditsSql, [username], (err, studentRow) => {
    if (err) {
      return res.status(500).send({ message: '無法查詢學生學分' });
    }

    const currentTotalCredits = studentRow.credit || 0;

    // 查詢要退選的課程學分與是否必修
    db.get(getCourseInfoSql, [courseId], (err, courseRow) => {
      if (err || !courseRow) {
        return res.status(500).send({ message: '無法查詢課程資料' });
      }

      const courseCredit = courseRow.credit;
      const isRequired = courseRow.required_elective === '必修';
      const newTotalCredits = currentTotalCredits - courseCredit;
      console.log(newTotalCredits);

      // 檢查退選後的學分是否大於 9
      if (newTotalCredits < 9) {
        return res.send({ success: false, message: '學分不夠，無法退選' });
      }
      // 檢查是否為必修課
      if (isRequired && studentRow.department ===  courseRow.department && studentRow.grade === courseRow.grade) {
        return res.send({ success: false, message: '必修課程無法退選' });
      }
      // 執行退選操作
      schedule_db.run(deleteCourseSql, [username, courseId], function (err) {
        if (err) {
          return res.status(500).send({ message: '資料庫錯誤' });
        } else if (this.changes === 0) {
          return res.send({ success: false, message: '退選失敗，找不到指定課程' });
        }

        // 更新學生的學分總和
        students_db.run(updateStudentCreditsSql, [newTotalCredits, username], function (err) {
          if (err) {
            return res.status(500).send({ message: '無法更新學生學分總和' });
          }

          res.send({
            success: true,
            message: '退選成功',
            totalCredits: newTotalCredits
          });
        });
      });
    });
  });
});

// 在 app.js 中修改 get-schedule 路由，加入除錯訊息

app.post('/api/get-schedule', (req, res) => {
  const { username } = req.body;
  console.log('Fetching schedule for user:', username);

  // 從 schedule 獲取學生的選課資料
  const scheduleSql = 'SELECT course_id FROM schedule WHERE student_id = ?';

  schedule_db.all(scheduleSql, [username], (err, scheduleRows) => {
    if (err) {
      console.error('Schedule database error:', err);
      return res.status(500).send({ message: '無法獲取選課資料' });
    }

    console.log('Schedule rows found:', scheduleRows);

    if (!scheduleRows || scheduleRows.length === 0) {
      console.log('No courses found for user');
      return res.json({
        success: true,
        schedule: Array(5).fill().map(() => Array(14).fill(null))
      });
    }

    // 獲取所有課程 ID
    const courseIds = scheduleRows.map(row => row.course_id);
    console.log('Course IDs to fetch:', courseIds);

    // 從 course 資料庫獲取課程詳細資訊
    const courseQuery = `SELECT id, name, time1, time2, time3 FROM course WHERE id IN (${courseIds.map(() => '?').join(',')})`;

    db.all(courseQuery, courseIds, (err, courseRows) => {
      if (err) {
        console.error('Course database error:', err);
        return res.status(500).send({ message: '無法獲取課程資料' });
      }

      console.log('Course details found:', courseRows);

      // 創建空的課表
      const schedule = Array(5).fill().map(() => Array(14).fill(null));

      // 填充課表
      courseRows.forEach(course => {
        const times = [course.time1, course.time2, course.time3];
        console.log(`Processing course ${course.id} (${course.name}) with times:`, times);

        times.forEach(time => {
          if (time && time > 0) {
            const day = Math.floor((time - 1) / 14); // 0-4 代表週一到週五
            const period = ((time - 1) % 14); // 0-13 代表第幾節課

            console.log(`Time ${time} maps to day ${day}, period ${period}`);

            if (day >= 0 && day < 5 && period >= 0 && period < 14) {
              schedule[day][period] = {
                courseId: course.id,
                name: course.name
              };
            }
          }
        });
      });

      console.log('Final schedule:', schedule);

      res.json({
        success: true,
        schedule: schedule
      });
    });
  });
});

module.exports = app;
