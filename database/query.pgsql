-- CREATE DB
CREATE DATABASE CIRCLEDU;

-- DROP DB
DROP DATABASE CIRCLEDU;
-- DROP table
DROP TABLE account;
DROP TABLE role;


-- CREATE TABLE
CREATE TABLE roles(
   id serial PRIMARY KEY,
   role_name VARCHAR (255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts(
   id SERIAL PRIMARY KEY,
   firstname VARCHAR (100) NOT NULL,
   lastname VARCHAR (200) NOT NULL,
   username VARCHAR (50) UNIQUE NOT NULL,
   password VARCHAR (50) NOT NULL,
   email VARCHAR (355) UNIQUE NOT NULL,
   roleId INTEGER REFERENCES roles(id)
);

-- INSERT DATA ROLE
INSERT INTO roles(role_name) VALUES ('admin');
INSERT INTO roles(role_name) VALUES ('member');

INSERT INTO accounts(firstname,lastname,username,password,email, roleid) VALUES ('oka','aryanata','okaaryanata', '1234', 'oka.aryanata9@gmail.com', 1);


-- get data
SELECT * FROM roles;
SELECT * FROM account;
SELECT * FROM account_role;