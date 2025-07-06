const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const getOrCreateChat = async (req, res) => {
  const { user1, user2 } = req.body;
  try {
    let chat = await Chat.findOne({ users: { $all: [user1, user2] } })
      .populate("users", "userName profileImage")
      .populate("messages.sender", "userName");

    if (!chat) {
      chat = await Chat.create({ users: [user1, user2], messages: [] });
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getChatsForUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const chats = await Chat.find({ users: userId })
      .populate("users", "userName profileImage")
      .populate("messages.sender", "userName")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const findRandomUser = async (userId) => {
  const allUsers = await User.find({ _id: { $ne: userId } });
  const userIds = allUsers.map((u) => u._id.toString());
  const existingChats = await Chat.find({ users: userId });
  const existingUserIds = new Set();

  existingChats.forEach((chat) => {
    chat.users.forEach((u) => {
      if (u.toString() !== userId.toString()) {
        existingUserIds.add(u.toString());
      }
    });
  });

  const filtered = userIds.filter((id) => !existingUserIds.has(id));
  if (!filtered.length) return null;
  const randomId = filtered[Math.floor(Math.random() * filtered.length)];
  return randomId;
};

const startAnonymousChat = async (req, res) => {
  const { userId } = req.body;
  try {
    const existing = await Chat.findOne({ isAnonymous: true, users: userId });
    if (existing)
      return res.status(400).json({ error: "already has anonymous chat" });

    const partner = await findRandomUser(userId);
    if (!partner) return res.status(404).json({ error: "No users available" });

    const chat = await Chat.create({
      users: [userId, partner],
      isAnonymous: true,
      messages: [],
    });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const requestReveal = async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isAnonymous)
      return res.status(404).json({ error: "Chat not found" });

    const existing = chat.revealRequests.find(
      (r) => r.userId.toString() === userId
    );

    if (existing) {
      existing.status = "accepted"; // ← במקום להשאיר pending
    } else {
      chat.revealRequests.push({ userId, status: "accepted" });
    }

    // בדיקה אם שני הצדדים אישרו
    const approvals = chat.revealRequests.filter(
      (r) => r.status === "accepted"
    );
    if (approvals.length === 2) {
      chat.isAnonymous = false;
      chat.isRevealed = true;
      chat.revealRequests = [];

      // נשלח התראה ב־Socket לשני הצדדים
      const io = req.app.get("socketio");
      io.to(chat._id.toString()).emit("chatRevealed");
    }

    await chat.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkRevealStatus = async (req, res) => {
  const { chatId, userId } = req.params;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isAnonymous)
      return res.status(404).json({ error: "Chat not found" });

    const myRequest = chat.revealRequests.find(
      (r) => r.userId.toString() === userId
    );
    const otherRequest = chat.revealRequests.find(
      (r) => r.userId.toString() !== userId && r.status === "accepted"
    );

    // אם הצד השני אישר ואתה לא - תציג פופאפ
    const shouldPrompt =
      !!otherRequest && (!myRequest || myRequest.status !== "accepted");

    res.json({ shouldPrompt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const respondToReveal = async (req, res) => {
  const { chatId, userId, accept } = req.body;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isAnonymous)
      return res.status(404).json({ error: "Chat not found" });

    const index = chat.revealRequests.findIndex(
      (r) => r.userId.toString() === userId
    );
    if (index >= 0) {
      chat.revealRequests[index].status = accept ? "accepted" : "declined";
    } else {
      chat.revealRequests.push({
        userId,
        status: accept ? "accepted" : "declined",
      });
    }

    const approvals = chat.revealRequests.filter(
      (r) => r.status === "accepted"
    );
    if (approvals.length === 2) {
      chat.isAnonymous = false;
      chat.isRevealed = true;
      chat.revealRequests = [];
    }

    await chat.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const startNewAnonymousChat = async (req, res) => {
  const { userId, chatId } = req.body;
  try {
    await Chat.findByIdAndDelete(chatId);
    const partner = await findRandomUser(userId);
    if (!partner) return res.status(404).json({ error: "No users available" });

    const chat = await Chat.create({
      users: [userId, partner],
      isAnonymous: true,
      messages: [],
    });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getOrCreateChat,
  getChatsForUser,
  startAnonymousChat,
  requestReveal,
  checkRevealStatus,
  respondToReveal,
  startNewAnonymousChat,
};
