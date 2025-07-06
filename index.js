const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

const bodyParser = require("body-parser");
const connectDB = require("./configs/dataBase");

require("dotenv").config();

const userRouter = require("./routers/userRouter");
const authRoutes = require("./routers/authRoutes");
const postRoutes = require("./routers/postRouter");
const chatRoutes = require("./routers/chatRoutes");
app.use(cors());
app.use(express.json());

connectDB();

app.use("/users", userRouter);
app.use("/auth", authRoutes);
app.use("/post", postRoutes);
app.use("/chat", chatRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("ברוך הבא לשרת!");
});

module.exports = app;
