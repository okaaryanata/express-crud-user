## Backend CRUD User

### Requirements

    - Postgresql
    - Node js
    - Express js
    - Joi
    - Jsonwebtoken
    - pg
    - pg-hstore
    - sequelize

### Installing

- Clone this repository:

  ```
  git clone https://github.com/okaaryanata/express-crud-user
  ```

- Create Database `circledu`

- Create Tables and insert data to the tables

  Run this query to create tables:

  ```
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
  ```

  and then insert data:

  ```
  INSERT INTO roles(role_name) VALUES ('admin');
  INSERT INTO roles(role_name) VALUES ('member');

  INSERT INTO accounts(firstname,lastname,username,password,email, roleid) VALUES ('admin','admin','admin', 'admin', 'admin@admin.com', 1);

  ```

### How to run locally?

1. cd into the repo.
2. Change `./database/database.js` with your `username` and `password`
3. Run `npm install` to download dependencies.
4. Run `npm start` or `node index.js` to start the development server, program will running in http://localhost:5000/

### Postman Documentation for the Api

https://documenter.getpostman.com/view/7748154/SWLb9Unv?version=latest
