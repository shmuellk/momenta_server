const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./configs/dataBase");

require("dotenv").config();

const userRouter = require("./routers/userRouter");

const app = express();
app.use(cors());
app.use(bodyParser.json());

connectDB();

app.use("/users", userRouter);

app.get("/", (req, res) => {
  res.send("ברוך הבא לשרת!");
});

module.exports = app;
