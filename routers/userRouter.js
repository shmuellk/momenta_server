const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `profile-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

router.get("/", userController.getAllUsers);
router.post("/getUser", userController.getUser);
router.post("/login", userController.loginUser);
router.post("/getUsersComplit", userController.getUsersComplit);
router.put("/update", userController.updateUser);
router.delete("/delete", userController.deleteUser);
router.post(
  "/updateProfileImage",
  upload.single("profileImage"),
  userController.updateProfileImage
);

module.exports = router;
