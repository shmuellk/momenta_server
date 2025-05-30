const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    require: true,
  },
  userName: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});
userSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 300, partialFilterExpression: { verified: false } }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
