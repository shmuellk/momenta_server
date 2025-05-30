const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail", // אפשר גם outlook, yahoo וכו'
  auth: {
    user: process.env.EMAIL_USER, // מייל למשל: yourapp@gmail.com
    pass: process.env.EMAIL_PASSWORD, // הסיסמה או App Password
  },
});

module.exports = transporter;
