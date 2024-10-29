create table students(
id int primary key auto_increment,
name varchar(20),
grade int,
department varchar(255),
credit int
);

insert into students(id, name, grade, department, credit) values(1150313, "帆船", 2 , "資訊", 9);
insert into students(id, name, grade, department, credit) values(1185397, "雪泥", 2 , "資訊", 9);
insert into students(id, name, grade, department, credit) values(1150059, "史帝夫", 3 , "電機", 1);
insert into students(id, name, grade, department, credit) values(1149457, "臨停", 2 , "資訊", 25);

select * from students;