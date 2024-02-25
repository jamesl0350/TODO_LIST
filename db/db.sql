CREATE database project;
CREATE TABLE USERS (
    id INT NOT NULL AUTO_INCREMENT,
    email varchar(255),
    name varchar(255), 
    password varchar(255), 
    PRIMARY KEY (id)
);

CREATE TABLE TODO_LIST (
    id INT NOT NULL AUTO_INCREMENT,
    user_id varchar(255),
    name varchar(255),
    PRIMARY KEY (id)
);

CREATE TABLE TODO_LIST_ITEMS (
    id INT NOT NULL AUTO_INCREMENT,
    todo_list_id varchar(255),
    task varchar(255), 
    PRIMARY KEY (id)
);

