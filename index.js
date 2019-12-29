const express = require("express");
const bodyParser = require("body-parser");
const roleRouter = require("./routers/role");
const accountRouter = require("./routers/account");
const account = require("./models/account");
const role = require("./models/role");

const app = express();

role.sync();
account.sync();
app.use(bodyParser.json());
app.use("/api/role", roleRouter);
app.use("/api/account", accountRouter);

app.get("/", (req, res) => {
  res.json("API Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`listening port ${PORT}`);
});
