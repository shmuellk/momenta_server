const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  userName: { type: String, required: true },
  profileImage: { type: String },
  gander: { type: String, required: true }, // “זכר” or “נקבה”
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false },
});

// מחיקה אוטומטית לאחר 5 דקות אם המשתמש לא אומת
userSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 300, partialFilterExpression: { verified: false } }
);

module.exports = mongoose.model("User", userSchema);
