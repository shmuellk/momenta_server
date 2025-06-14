const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.delete("/delete", userController.deleteUser);
router.get("/", userController.getAllUsers);
router.post("/login", userController.loginUser);
router.get("/getUsersComplit", userController.getUsersComplit);

module.exports = router;
