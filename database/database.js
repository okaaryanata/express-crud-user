const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  "circledu", //db name
  "user", // username
  "pass", // pass
  {
    host: "localhost",
    dialect: "postgres",
    operatorAliases: false,
    pool: {
      max: 5,
      min: 0,
      require: 30000,
      idle: 10000
    }
  }
);

const Op = Sequelize.Op;
module.exports = { sequelize, Op };
