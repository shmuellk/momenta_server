const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./configs/dataBase");

require("dotenv").config();

const userRouter = require("./routers/userRouter");
const authRoutes = require("./routers/authRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

connectDB();

app.use("/users", userRouter);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("ברוך הבא לשרת!");
});

module.exports = app;
