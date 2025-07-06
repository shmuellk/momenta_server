const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

router.post("/", chatController.getOrCreateChat);
router.get("/:userId", chatController.getChatsForUser);
router.post("/anonymous", chatController.startAnonymousChat);
router.post("/anonymous/requestReveal", chatController.requestReveal);
router.get(
  "/anonymous/checkReveal/:chatId/:userId",
  chatController.checkRevealStatus
);
router.post("/anonymous/respondReveal", chatController.respondToReveal);
router.post("/anonymous/new", chatController.startNewAnonymousChat);

module.exports = router;
