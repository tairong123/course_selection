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

var prefix_db = new sqlite3.Database(path.join(__dirname, 'db', 'prefix.db'), (err) => {
  if (err) {
    console.error('資料庫連接失敗:', err.message);
  } else {
    console.log('已成功連接到 prefix 資料庫。');
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

app.post('/api/drop-course', (req, res) => {
  const { username, courseId } = req.body;

  const getStudentCreditsSql = 'SELECT credit, department ,grade FROM students WHERE id = ?';
  const getCourseInfoSql = 'SELECT credit, required_elective, department ,grade FROM course WHERE id = ?';
  const deleteCourseSql = 'DELETE FROM schedule WHERE student_id = ? AND course_id = ?';
  const updateStudentCreditsSql = 'UPDATE students SET credit = ? WHERE id = ?';
  const decrementCoursePeopleSql = 'UPDATE course SET now_people = now_people - 1 WHERE id = ?';

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

      // 檢查退選後的學分是否大於 9
      if (newTotalCredits < 9) {
        return res.send({ success: false, message: '學分不夠，無法退選' });
      }

      // 檢查是否為必修課
      if (isRequired && studentRow.department === courseRow.department && studentRow.grade === courseRow.grade) {
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

          // 減少課程人數
          db.run(decrementCoursePeopleSql, [courseId], function (err) {
            if (err) {
              return res.status(500).send({ message: '無法更新課程人數' });
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
});


app.post('/api/student-courses', (req, res) => {
  const { username } = req.body;

  // 第一步：查詢 schedule 資料表中學生的所有 course_id
  const getCoursesSql = 'SELECT course_id FROM schedule WHERE student_id = ?';

  schedule_db.all(getCoursesSql, [username], (err, courseRows) => {
    if (err) {
      return res.status(500).send({ message: '無法查詢學生選課資料' });
    }

    // 如果學生沒有已選課程，返回空陣列
    if (courseRows.length === 0) {
      return res.json([]);
    }

    // 第二步：根據每個 course_id 查詢 course 資料表的名稱
    const courses = [];
    let completed = 0;

    courseRows.forEach((row, index) => {
      const getCourseNameSql = 'SELECT name FROM course WHERE id = ?';

      db.get(getCourseNameSql, [row.course_id], (err, course) => {
        if (err) {
          return res.status(500).send({ message: '無法查詢課程名稱' });
        }

        // 將課程代碼和名稱加入結果陣列
        courses.push({ course_id: row.course_id, name: course.name });
        completed++;

        // 確認所有查詢都完成後返回結果
        if (completed === courseRows.length) {
          res.json(courses);
        }
      });
    });
  });
});


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
app.post('/api/student-credits', (req, res) => {
  const { username } = req.body;
  const getCreditsSql = 'SELECT credit FROM students WHERE id = ?';

  students_db.get(getCreditsSql, [username], (err, row) => {
    if (err) {
      return res.status(500).send({ message: '無法查詢學生學分' });
    }
    res.send({ success: true, credits: row.credit });
  });
});

app.post('/api/add-course', (req, res) => {
  const { username, courseId } = req.body;

  const getStudentCreditsSql = 'SELECT credit FROM students WHERE id = ?';
  const getCourseInfoSql = 'SELECT credit, required_elective, most_people, now_people, time1, time2, time3, name, needed FROM course WHERE id = ?';
  const insertScheduleSql = 'INSERT INTO schedule (student_id, course_id) VALUES (?, ?)';
  const updateStudentCreditsSql = 'UPDATE students SET credit = ? WHERE id = ?';
  const updateCoursePeopleSql = 'UPDATE course SET now_people = now_people + 1 WHERE id = ?';

  // Step 1: Check if the course is already selected
  const checkIfCourseSelectedSql = 'SELECT COUNT(*) AS count FROM schedule WHERE student_id = ? AND course_id = ?';

  schedule_db.get(checkIfCourseSelectedSql, [username, courseId], (err, row) => {
    if (err) {
      return res.status(500).send({ message: '無法查詢已選課程' });
    }
    if (row.count > 0) {
      return res.send({ success: false, message: '你已選過該課程' });
    }

    // Step 2: Get course info
    db.get(getCourseInfoSql, [courseId], (err, courseRow) => {
      if (err || !courseRow) {
        return res.status(500).send({ message: '無法查詢課程資料' });
      }

      const { credit: courseCredit, name: courseName, most_people: mostPeople, now_people: nowPeople, needed } = courseRow;
      const courseTimes = [courseRow.time1, courseRow.time2, courseRow.time3].filter(time => time);

      // Step 3: Check student total credits
      students_db.get(getStudentCreditsSql, [username], (err, studentRow) => {
        if (err) {
          return res.status(500).send({ message: '無法查詢學生學分' });
        }

        const currentTotalCredits = studentRow.credit || 0;

        // Ensure adding the course does not exceed the credit limit
        if (currentTotalCredits + courseCredit > 30) {
          return res.send({ success: false, message: '學分超過上限，無法加選' });
        }

        // Check if course capacity is exceeded
        if (nowPeople + 1 > mostPeople) {
          return res.send({ success: false, message: '課程人數已滿，無法加選' });
        }

        // Step 4: Get selected course IDs and times for schedule conflict check
        const getSelectedCourseIdsSql = 'SELECT course_id FROM schedule WHERE student_id = ?';

        schedule_db.all(getSelectedCourseIdsSql, [username], (err, selectedCourses) => {
          if (err) {
            return res.status(500).send({ message: '無法查詢已選課程' });
          }

          const selectedCourseIds = selectedCourses.map(course => course.course_id);
          const getSelectedCourseTimesSql = `SELECT time1, time2, time3, name FROM course WHERE id IN (${selectedCourseIds.join(',')})`;

          db.all(getSelectedCourseTimesSql, [], (err, selectedCourseRows) => {
            if (err) {
              return res.status(500).send({ message: '無法查詢已選課程的時間' });
            }

            const selectedCourseTimes = selectedCourseRows.flatMap(course => [course.time1, course.time2, course.time3]).filter(time => time);
            const selectedCourseNames = selectedCourseRows.map(course => course.name);

            const hasConflict = courseTimes.some(newTime => selectedCourseTimes.includes(newTime));
            const hasSameName = selectedCourseNames.includes(courseName);

            if (hasConflict) {
              return res.send({ success: false, message: '衝堂，該課程不能加選' });
            }
            if (hasSameName) {
              return res.send({ success: false, message: '已選課程與欲選課程同名，無法加選' });
            }

            // Step 5: Check prerequisite requirements if any
            if (needed) {
              const checkPrerequisiteSql = 'SELECT COUNT(*) AS count FROM prefix WHERE student_id = ? AND course_id = ?';

              prefix_db.get(checkPrerequisiteSql, [username, needed], (err, prerequisiteRow) => {
                if (err) {
                  return res.status(500).send({ message: '無法查詢前置課程' });
                }
                if (prerequisiteRow.count === 0) {
                  return res.send({ success: false, message: '你沒修過前置課程' });
                }

                // Proceed to add the course if prerequisites are met
                addCourse();
              });
            } else {
              // Proceed to add the course if no prerequisites
              addCourse();
            }

            function addCourse() {
              // Add course to schedule
              schedule_db.run(insertScheduleSql, [username, courseId], function (err) {
                if (err) {
                  return res.status(500).send({ message: '資料庫錯誤' });
                }

                // Update student credits
                students_db.run(updateStudentCreditsSql, [currentTotalCredits + courseCredit, username], function (err) {
                  if (err) {
                    return res.status(500).send({ message: '無法更新學生學分' });
                  }

                  // Update course enrollment count
                  db.run(updateCoursePeopleSql, [courseId], function (err) {
                    if (err) {
                      return res.status(500).send({ message: '無法更新課程人數' });
                    }

                    res.send({
                      success: true,
                      message: '加選成功',
                      totalCredits: currentTotalCredits + courseCredit
                    });
                  });
                });
              });
            }
          });
        });
      });
    });
  });
});



module.exports = app;
