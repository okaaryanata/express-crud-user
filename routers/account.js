const express = require("express");
const router = express.Router();

// middleware
const Joi = require("joi");
const jwt = require("jsonwebtoken");

// models
const Role = require("../models/role");
const Account = require("../models/account");

const accountSchema = {
  firstname: Joi.string()
    .min(3)
    .required(),
  lastname: Joi.string()
    .min(3)
    .required(),
  username: Joi.string()
    .min(3)
    .required(),
  password: Joi.string()
    .min(6)
    .required(),
  email: Joi.string()
    .trim()
    .email()
    .required(),
  role_id: Joi.number()
    .integer()
    .required()
};

const accountEditSchema = {
  firstname: Joi.string()
    .min(3)
    .required(),
  lastname: Joi.string()
    .min(3)
    .required(),
  username: Joi.string()
    .min(3)
    .required(),
  password: Joi.string().min(6),
  email: Joi.string()
    .trim()
    .email()
    .required(),
  role_id: Joi.number()
    .integer()
    .required(),
  id: Joi.number().integer()
};

const loginSchema = {
  email: Joi.string().required(),
  password: Joi.string().required()
};

// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const resJoi = Joi.validate(req.body, loginSchema);
  if (resJoi.error) {
    res.status(400).json({
      results: "failed",
      data: {},
      message: resJoi.error.details[0].message
    });
  }
  try {
    let accounts = await Account.findAll({
      limit: 1,
      attributes: ["id", "firstname", "lastname", "username", "email"],
      where: {
        email: email,
        password: password
      },
      include: {
        model: Role,
        as: "role",
        required: false
      }
    });
    if (accounts.length > 0) {
      let resJson = {
        id: accounts[0].id,
        firstname: accounts[0].firstname,
        lastname: accounts[0].lastname,
        username: accounts[0].username,
        email: accounts[0].email,
        role: accounts[0].role
      };
      const token = jwt.sign(resJson, "secret_key");
      resJson.token = token;
      res.json({
        results: "success",
        data: resJson
      });
    } else {
      res.status(404).json({
        results: "failed",
        data: [],
        message: `Username or Password incorrect`
      });
    }
  } catch (error) {
    res.status(404).json({
      results: "failed",
      data: [],
      message: `Login failed, Error : ${error}`
    });
  }
});

// register account
router.post("/register", async (req, res) => {
  let { firstname, lastname, username, password, email, role_id } = req.body;

  const resJoi = Joi.validate(req.body, accountSchema);
  if (resJoi.error) {
    res.status(400).json({
      results: "failed",
      data: {},
      message: resJoi.error.details[0].message
    });
  }
  try {
    let newAccount = await Account.create(
      {
        firstname: firstname,
        lastname: lastname,
        username: username,
        password: password,
        email: email,
        roleid: role_id
      },
      {
        feilds: ["firstname", "lastname", "username", "email", "roleid"]
      }
    );
    if (newAccount) {
      res.json({
        results: "success",
        data: newAccount
      });
    } else {
      res.status(400).json({
        results: "failed",
        data: {},
        message: "failed to register new account"
      });
    }
  } catch (error) {
    res.status(400).json({
      results: "failed",
      data: {},
      message: `register new account failed, ${error}`
    });
  }
});

// auth
router.get("/auth", ensureToken, async (req, res, next) => {
  jwt.verify(req.token, "secret_key", (err, user) => {
    if (err) {
      res.status(403).json({
        results: "failed",
        data: [],
        message: `Invalid Token`
      });
    } else {
      res.json({
        results: "success",
        data: user
      });
    }
  });
});

// get all account
router.get("/users", ensureToken, async (req, res, next) => {
  jwt.verify(req.token, "secret_key", async (err, user) => {
    if (err) {
      res.status(403).json({
        results: "failed",
        data: [],
        message: `Invalid Token, Please Login`
      });
    } else {
      try {
        let accounts = await Account.findAll({
          attributes: ["id", "firstname", "lastname", "username", "email"],
          include: {
            model: Role,
            as: "role",
            required: false
          }
        });
        if (accounts) {
          res.json({
            results: "success",
            data: accounts
          });
        } else {
          res.status(500).json({
            results: "failed",
            data: [],
            message: "failed get accounts"
          });
        }
      } catch (error) {
        res.status(500).json({
          results: "failed",
          data: [],
          message: `get accounts failed, Error : ${error}`
        });
      }
    }
  });
});

// register account
router.post("/users", ensureToken, async (req, res, next) => {
  jwt.verify(req.token, "secret_key", async (err, user) => {
    if (err) {
      res.status(403).json({
        results: "failed",
        data: [],
        message: `Invalid Token, please login`
      });
    } else if (user.role.role_name !== "admin") {
      res.status(403).json({
        results: "failed",
        data: [],
        message: `Forbidden Role`
      });
    } else {
      let {
        firstname,
        lastname,
        username,
        password,
        email,
        role_id
      } = req.body;

      const resJoi = Joi.validate(req.body, accountSchema);
      if (resJoi.error) {
        res.status(400).json({
          results: "failed",
          data: {},
          message: resJoi.error.details[0].message
        });
      }
      try {
        let newAccount = await Account.create(
          {
            firstname: firstname,
            lastname: lastname,
            username: username,
            password: password,
            email: email,
            roleid: role_id
          },
          {
            feilds: ["firstname", "lastname", "username", "email", "roleid"]
          }
        );
        if (newAccount) {
          res.json({
            results: "success",
            data: newAccount
          });
        } else {
          res.status(400).json({
            results: "failed",
            data: {},
            message: "failed to create new account"
          });
        }
      } catch (error) {
        res.status(400).json({
          results: "failed",
          data: {},
          message: `create new account failed, ${error}`
        });
      }
    }
  });
});

// edit account
router.put("/users/:id", ensureToken, async (req, res, next) => {
  jwt.verify(req.token, "secret_key", async (err, user) => {
    if (err) {
      res.status(403).json({
        results: "failed",
        data: [],
        message: `Invalid Token, please login`
      });
    } else if (user.role.role_name !== "admin") {
      res.status(403).json({
        results: "failed",
        data: [],
        message: `Forbidden Role`
      });
    } else {
      const { id } = req.params;
      const {
        firstname,
        lastname,
        username,
        password,
        email,
        role_id
      } = req.body;

      const resJoi = Joi.validate(req.body, accountEditSchema);
      if (resJoi.error) {
        res.status(400).json({
          results: "failed",
          data: {},
          message: resJoi.error.details[0].message
        });
      }
      try {
        let accounts = await Account.findAll({
          attributes: [
            "id",
            "firstname",
            "lastname",
            "username",
            "password",
            "email"
          ],
          where: {
            id: id
          },
          include: {
            model: Role,
            as: "role",
            required: false
          }
        });
        if (accounts.length > 0) {
          await accounts[0].update({
            firstname: firstname ? firstname : accounts[0].firstname,
            lastname: lastname ? lastname : accounts[0].lastname,
            username: username ? username : accounts[0].username,
            password: password ? password : accounts[0].password,
            email: email ? email : accounts[0].email,
            roleid: parseInt(role_id) ? parseInt(role_id) : accounts[0].roleid
          });
          res.json({
            results: "success",
            data: accounts,
            message: "success update account"
          });
        } else {
          res.status(404).json({
            results: "failde",
            data: {},
            message: "account not found"
          });
        }
      } catch (error) {
        es.status(404).json({
          results: "failde",
          data: roles[0],
          message: `edit account with id : ${id} failed, Error : ${error}`
        });
      }
    }
  });
});

// delete account
router.delete("/users/:id", ensureToken, async (req, res, next) => {
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
            id: id
          }
        });
        res.json({
          results: "success",
          data: [],
          deleted_account: deletedAcc,
          message: `success deleted ${deletedAcc} account`
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

// get account by id
router.get("/user/:id", ensureToken, async (req, res, next) => {
  jwt.verify(req.token, "secret_key", async (err, user) => {
    if (err) {
      res.status(403).json({
        results: "failed",
        data: [],
        message: `Invalid Token, Please login`
      });
    } else {
      try {
        const { id } = req.params;
        let accounts = await Account.findAll({
          attributes: ["id", "firstname", "lastname", "username", "email"],
          where: { id: id },
          include: {
            model: Role,
            as: "role",
            required: false
          }
        });
        if (accounts) {
          res.json({
            results: "success",
            data: accounts
          });
        } else {
          res.status(500).json({
            results: "failed",
            data: [],
            message: "failed get accounts"
          });
        }
      } catch (error) {
        res.status(500).json({
          results: "failed",
          data: [],
          message: `get accounts failed, Error : ${error}`
        });
      }
      const { id } = req.params;
      try {
        let accounts = await Account.findAll({
          attributes: ["id", "firstname", "lastname", "username", "email"],
          where: {
            id: id
          },
          include: {
            model: Role,
            as: "role",
            required: false
          }
        });

        if (accounts) {
          res.json({
            results: "success",
            data: accounts
          });
        } else {
          res.status(404).json({
            results: "failed",
            data: [],
            message: `Accounts with id : ${id} not found`
          });
        }
      } catch (error) {
        res.status(404).json({
          results: "failed",
          data: [],
          message: `get accounts failed, Error : ${error}`
        });
      }
    }
  });
});

// get account by role
router.get("/role/:id", ensureToken, async (req, res, next) => {
  jwt.verify(req.token, "secret_key", async (err, user) => {
    if (err) {
      res.status(403).json({
        results: "failed",
        data: [],
        message: `Invalid Token, please login`
      });
    } else {
      const { id } = req.params;
      try {
        let accounts = await Account.findAll({
          attributes: ["id", "firstname", "lastname", "username", "email"],
          where: {
            roleid: id
          },
          include: {
            model: Role,
            as: "role",
            required: false
          }
        });

        if (accounts) {
          res.json({
            results: "success",
            data: accounts
          });
        } else {
          res.status(404).json({
            results: "failed",
            data: [],
            message: `Accounts with role id : ${id} not found`
          });
        }
      } catch (error) {
        res.status(404).json({
          results: "failed",
          data: [],
          message: `get accounts failed, Error : ${error}`
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

// jwt.verify(req.token, "secret_key", async (err, user) => {
//     if (err) {
//       res.status(403).json({
//         results: "failed",
//         data: [],
//         message: `Invalid Token`
//       });
//     } else if (user.role.role_name !== "admin") {
//       res.status(403).json({
//         results: "failed",
//         data: [],
//         message: `Forbidden Role`
//       });
//     } else {
//     }
//   });
