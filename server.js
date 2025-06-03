require("dotenv").config();
const http = require("http");
const app = require("./index");

const port = process.env.PORT || 5001;

const httpServer = http.createServer(app);
httpServer.listen(port, () => {
  console.log(`שרת HTTP מאזין על הפורט ${port}`);
});
