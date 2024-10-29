create table course(
id int primary key auto_increment,
time1 int, 
time2 int,
time3 int,
credit int,
most_people int,
now_people int,
required_elective varchar(255),
name varchar(255),
grade int,
department varchar(255),
detail varchar(255)
);

insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1311, 23, 0, 0, 0, 61, 59, "必修", "班級活動", 2, "資訊","(二)09 資電411 洪振偉");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1312, 3, 4, 32, 3, 70, 65, "必修", "系統程式", 2, "資訊", "(一)03-04 資電402 (三)04 資電402 劉宗杰");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1313, 8, 9, 17, 3, 67, 65, "必修", "資料庫系統", 2, "資訊", "(一)08-09 資電511 (二)03 資電512 許懷中");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1314, 6, 7, 18, 3, 79, 75, "必修", "機率與統計", 2, "資訊", "(一)06-07 科航206 (二)04 資電504 游景盛");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1323, 34, 35, 36, 3, 60, 55, "選修", "互連網路", 2, "資訊", "(三)06-08 資電234(電腦實習室) 劉宗杰");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1324, 29, 30, 31, 3, 74, 70, "選修", "Web程式設計", 2, "資訊", "(三)01-03 資電234(電腦實習室) 劉明機");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1326, 31, 59, 60, 3, 60, 55, "選修", "系統分析與設計", 2, "資訊", "(三)03 資電B03 (五)03-04 資電104 洪振偉");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1328, 20, 21, 22, 3, 72, 70, "選修", "多媒體系統", 2, "資訊", "(二)06-08 資電234(電腦實習室) 葉春秀");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1329, 11, 12, 13, 3, 68, 65, "選修", "電子商務安全", 2, "資訊", "(一)11-13 資電102 魏國瑞");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1330, 36, 37, 38, 3, 60, 58, "選修", "電子商務安全", 2, "資訊", "(三)08-10 商303 周澤捷");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1331, 16, 45, 46, 3, 60, 58, "選修", "數位信號處理導論", 2, "資訊", "二)02 資電402 (四)03-04 資電511 陳啟鏘");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1332, 20, 21, 50, 3, 55, 54, "選修", "數位系統設計", 2, "資訊", "(二)06-07 資電107 (四)08 資電125(電腦實習室) 陳德生");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1333, 51, 52, 0, 1, 55, 54, "選修", "數位系統設計實驗", 2, "資訊", "(四)09-10 資電125(電腦實習室) 陳德生");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1334, 62, 63, 0, 3, 64, 63, "選修", "UNIX應用與實務", 2, "資訊", "(五)06-07 紀207(電腦實習室) 林佩蓉");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1626, 1, 0, 0, 1, 60, 53, "必修", "專題研究(一)	", 3, "電機", "(五)00 未排教室 陳坤煌,田春林,徐士賢,鄭進興,陳志強,游易霖,洪聖均,曹嶸,沈昭元,謝振中,李企桓,黃思倫,劉文豐,黃定彝,王丁勇,梁寶芝");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1627, 17, 18, 43, 3, 60, 53, "選修", "半導體元件", 3, "電機", "(二)03-04 資電410 (四)01 資電410 洪聖均");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1628, 9, 29, 30, 3, 60, 13, "選修", "光電工程", 3, "電機", "(一)09 資電515 (三)01-02 資電515 田春林");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1632, 6, 7, 34, 3, 60, 56, "選修", "電力電學", 3, "電機", "(一)06-07 資電306 (三)06 資電306 何子儀");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1634, 30, 21, 22, 3, 60, 59, "選修", "電動車技術導論", 3, "電機", "(二)06-08 資電306 何子儀");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1630, 2, 43, 44, 3, 60, 54, "選修", "能源轉換", 3, "電機", "(一)02 資電512 (四)01-02 資電511 黃思倫");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1633, 17, 18, 32, 3, 60, 32, "選修", "電磁干擾概論", 3, "電機", "(二)03-04 資電511 (三)04 資電515 黃定彝");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1635, 6, 57, 58, 3, 60, 40, "選修", "微波被動電路電腦輔助設計", 3, "電機", "(一)06 資電410 (五)01-02 工319(電腦實習室) 陳志強");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1637, 45, 46, 64, 3, 60, 13, "選修", "智慧控制工程", 3, "電機", "(四)03-04 資電306 (五)08 資電403 鄭進興");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(3522, 58, 59, 60, 3, 30, 25, "選修", "智慧電網大數據分析概論", 3, "電機", "(五)02-04 紀302(電腦實習室) 黃俊瑋");
insert into course(id, time1, time2, time3, credit, most_people, now_people, required_elective, name, grade, department, detail) values(1636, 16, 48, 49, 3, 60, 50, "選修", "數位光電影像處理", 3, "電機", "(二)02 行政二館105-電腦實習室 (四)06-07 行政二館105-電腦實習室 李企桓");

select * from course;