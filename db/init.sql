create table people(
id int primary key auto_increment,
name varchar(20),
description varchar(255)
);

insert into people(name, description) values("hj", "Hsu, HJ");
insert into people(name, description) values("help", "Hung, Help");
insert into people(name, description) values("desire", "Chen, Desire");
insert into people(name, description) values("broken", "Yang, Broken One");
insert into people(name, description) values("landsome", "oennis, lhandsome");
insert into people(name, description) values("handsome", "Dennis, handsome");

select * from people;