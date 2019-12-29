const Sequelize = require("sequelize");
const sequelize = require("../database/database").sequelize;
const Op = require("../database/database").Op;
const Account = require("./account");

const Role = sequelize.define(
  "role",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    role_name: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false
    }
  },
  { timestamps: false }
);
Role.hasMany(Account, { foreignKey: "roleid", sourceKey: "id" });
// Account.belongsTo(Role, { constraints: false });
Account.belongsTo(Role, { foreignKey: "roleid", targetKey: "id" });

module.exports = Role;
