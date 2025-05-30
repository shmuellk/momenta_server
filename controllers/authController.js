// controllers/authController.js
const User = require("../models/userModel");
const VerificationToken = require("../models/verificationToken");
const bcrypt = require("bcrypt");
const transporter = require("../configs/nodemailer");
VerificationToken.syncIndexes();
User.syncIndexes();

const sendVerificationCode = async (req, res) => {
  try {
    const { name, email, password, userName, phone } = req.body;

    // אם כבר קיים משתמש עם המייל
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ניצור משתמש זמני עם verified=false
    const hashedPassword = await bcrypt.hash(password, 10);
    const tempUser = new User({
      name,
      email,
      userName,
      phone,
      password: hashedPassword,
      verified: false,
    });
    await tempUser.save();

    // נייצר קוד אימות בן 4 ספרות
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // נשמור את הקוד במסד
    await VerificationToken.create({
      userId: tempUser._id,
      code,
    });

    // נשלח מייל עם הקוד
    await transporter.sendMail({
      to: email,
      subject: "קוד אימות לרישום באפליקציה",
      text: `שלום ${name},\n\nהקוד שלך הוא: ${code}\n\nהקוד תקף לדקה.`,
    });

    res.status(200).json({ message: "Verification code sent to email." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const resendPinCode = async (req, res) => {
  const email = req.body.email ? req.body.email : "";
  console.log("email: " + email);

  try {
    const user = await User.findOne({ email, verified: false });
    console.log("user: " + user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    await VerificationToken.create({
      userId: user._id,
      code,
    });

    await transporter.sendMail({
      to: user.email,
      subject: "קוד אימות לרישום באפליקציה",
      text: `שלום ${user.name},\n\nהקוד שלך הוא: ${code}\n\nהקוד תקף לדקה.`,
    });

    res.status(200).json({ message: "Verification code sent to email." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// controllers/authController.js
const verifyUser = async (req, res) => {
  console.log("email = " + req.body.email);
  console.log("code = " + req.body.code);
  try {
    const { email, code } = req.body;

    // נמצא את המשתמש הזמני
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.verified) {
      return res.status(400).json({ message: "User already verified" });
    }

    // נמצא את הטוקן
    const tokenDoc = await VerificationToken.findOne({
      userId: user._id,
      code,
    });
    if (!tokenDoc) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    // עדכנו את המשתמש להיות מאומת
    user.verified = true;
    await user.save();

    // נזרוק את הטוקן כדי שלא ישתמשו בו שוב
    await tokenDoc.deleteOne();

    res.status(200).json({
      verified: true,
      message: "User verified and created successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { verifyUser, sendVerificationCode, resendPinCode };
