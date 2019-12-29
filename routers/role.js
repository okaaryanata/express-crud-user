const express = require("express");
const router = express.Router();

// middleware
const Joi = require("joi");
const jwt = require("jsonwebtoken");

// models
const Role = require("../models/role");
const Account = require("../models/account");

const roleSchema = {
  role_name: Joi.string()
    .min(3)
    .required()
};

// add role
router.post("/", ensureToken, async (req, res, next) => {
  jwt.verify(req.token, "secret_key", async (err, user) => {
    if (err) {
      res.status(403).json({
        results: "failed",
        data: [],
        message: `Invalid Token`
      });
    } else if (user.role.role_name !== "admin") {
      res.status(403).json({
        results: "failed",
        data: [],
        message: `Forbidden Role`
      });
    } else {
      let { role_name } = req.body;
      const resJoi = Joi.validate(req.body, roleSchema);
      if (resJoi.error) {
        res.status(400).json({
          results: "failed",
          data: {},
          message: resJoi.error.details[0].message
        });
      }
      try {
        let newRole = await Role.create(
          {
            role_name: role_name
          },
          {
            feilds: ["role_name"]
          }
        );
        if (newRole) {
          res.json({
            results: "success",
            data: newRole
          });
        } else {
          res.status(400).json({
            results: "failed",
            data: {},
            message: "failed to create new role"
          });
        }
      } catch (error) {
        res.status(400).json({
          results: "failed",
          data: {},
          message: `create new Role failed, ${error}`
        });
      }
    }
  });
});

// get all role
router.get("/", async (req, res) => {
  const { id } = req.params;
  try {
    let roles = await Role.findAll();
    if (roles) {
      res.json({
        results: "success",
        data: roles
      });
    } else {
      res.status(500).json({
        results: "failed",
        data: [],
        message: "failed get roles"
      });
    }
  } catch (error) {
    res.status(500).json({
      results: "failed",
      data: [],
      message: `get roles failed, Error : ${error}`
    });
  }
});

// get role by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let roles = await Role.findAll({
      attributes: ["id", "role_name"],
      where: {
        id: id
      }
    });
    if (roles) {
      res.json({
        results: "success",
        data: roles
      });
    } else {
      res.status(404).json({
        results: "failed",
        data: [],
        message: `Roles with id : ${id} not found`
      });
    }
  } catch (error) {
    res.status(404).json({
      results: "failed",
      data: [],
      message: `get roles failed, Error : ${error}`
    });
  }
});

// edit role
router.put("/:id", ensureToken, async (req, res, next) => {
  jwt.verify(req.token, "secret_key", async (err, user) => {
    if (err) {
      res.status(403).json({
        results: "failed",
        data: [],
        message: `Invalid Token`
      });
    } else if (user.role.role_name !== "admin") {
      res.status(403).json({
        results: "failed",
        data: [],
        message: `Forbidden Role`
      });
    } else {
      const { id } = req.params;
      const { role_name } = req.body;

      const resJoi = Joi.validate(req.body, roleSchema);
      if (resJoi.error) {
        res.status(400).json({
          results: "failed",
          data: {},
          message: resJoi.error.details[0].message
        });
      }
      try {
        let roles = await Role.findAll({
          attributes: ["id", "role_name"],
          where: {
            id: id
          }
        });
        if (roles.length > 0) {
          roles[0].update({
            role_name: role_name ? role_name : roles[0].role_name
          });
          res.json({
            results: "success",
            data: roles[0],
            message: "success update role"
          });
        } else {
          res.status(404).json({
            results: "failde",
            data: {},
            message: "role not found"
          });
        }
      } catch (error) {
        es.status(404).json({
          results: "failde",
          data: roles[0],
          message: `edit role with id : ${id} failed, Error : ${error}`
        });
      }
    }
  });
});

// delete role
router.delete("/:id", ensureToken, async (req, res, next) => {
  jwt.verify(req.token, "secret_key", async (err, user) => {
    if (err) {
      res.status(403).json({
        results: "failed",
        data: [],
        message: `Invalid Token`
      });
    } else if (user.role.role_name !== "admin") {
      res.status(403).json({
        results: "failed",
        data: [],
        message: `Forbidden Role`
      });
    } else {
      const { id } = req.params;
      try {
        let deletedAcc = await Account.destroy({
          where: {
            roleid: id
          }
        });
        let numberOfDeletedRow = await Role.destroy({
          where: {
            id: id
          }
        });
        res.json({
          results: "success",
          data: [],
          deleted_role: numberOfDeletedRow,
          deleted_account: deletedAcc,
          message: `success deleted ${numberOfDeletedRow} role and ${deletedAcc} accounts`
        });
      } catch (error) {
        res.json({
          results: "failed",
          data: [],
          message: `Failed deleted Role with id : ${id}. Error: ${error}`
        });
      }
    }
  });
});

function ensureToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.status(403).send("Forbidden");
  }
}
module.exports = router;
