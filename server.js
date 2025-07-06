require("dotenv").config();
const http = require("http");
const app = require("./index");
const setupSocket = require("./socketServer"); // 👈 ייבוא של socket.io

const port = process.env.PORT || 5001;

const httpServer = http.createServer(app);

// 🧠 הפעלת Socket.IO על אותו שרת
setupSocket(httpServer);

httpServer.listen(port, () => {
  console.log(`🚀 שרת HTTP מאזין על הפורט ${port}`);
});
