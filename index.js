const express = require("express");
const cors = require("cors");
const connectDB = require("./configs/database");

require("dotenv").config();

const app = express();
const userRouter = require("./routers/userRouter");

app.use(cors());
app.use(express.json());

connectDB();

app.use("/users", userRouter);

app.get("/", (req, res) => {
  res.send("ברוך הבא לשרת!");
});

module.exports = app;
