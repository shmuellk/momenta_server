// controllers/authController.js
const User = require("../models/userModel");
const VerificationToken = require("../models/verificationToken");
const bcrypt = require("bcrypt");
const transporter = require("../configs/nodemailer");
VerificationToken.syncIndexes();
User.syncIndexes();

const sendVerificationCode = async (req, res) => {
  try {
    const { name, email, password, userName, phone, gander } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message:
          "imageProfile is required (field name must be 'imageProfile').",
      });
    }

    // Build the public URL for the uploaded file
    const host = req.get("host");
    const protocol = req.protocol;
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    // Check if a user with this email already exists
    let user = await User.findOne({ email });

    if (user && user.verified) {
      return res.status(400).json({ message: "User already exists." });
    }

    // If user doesn't exist, create a new temp user
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        name,
        email,
        userName,
        phone,
        password: hashedPassword,
        gander,
        profileImage: imageUrl,
        verified: false,
      });
      await user.save();
    }

    // Remove old verification tokens (optional)
    await VerificationToken.deleteMany({ userId: user._id });

    // Generate a new 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Save the code in the DB
    await VerificationToken.create({
      userId: user._id,
      code,
    });

    // Send the email
    await transporter.sendMail({
      to: email,
      subject: "קוד אימות לרישום באפליקציה",
      text: `שלום ${name},\n\nהקוד שלך הוא: ${code}\n\nהקוד תקף לדקה.`,
    });

    res.status(200).json({ message: "Verification code sent to email." });
  } catch (err) {
    console.error(err);
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
    console.log("user = " + user);

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
    console.log("tokenDoc = " + tokenDoc);

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

module.exports = {
  verifyUser,
  sendVerificationCode,
  resendPinCode,
};
