const { Server } = require("socket.io");
const Chat = require("./models/chatModel");

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("📡 משתמש התחבר:", socket.id);

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`🚪 נכנס לחדר ${roomId}`);
    });

    socket.on("sendMessage", async ({ roomId, senderId, text }) => {
      try {
        const chat = await Chat.findById(roomId);
        if (!chat) {
          console.log("🔴 שיחה לא נמצאה");
          return;
        }

        const newMsg = { sender: senderId, text };
        chat.messages.push(newMsg);
        await chat.save();

        io.to(roomId).emit("newMessage", {
          senderId,
          text,
          createdAt: new Date(),
        });
        console.log("💬 הודעה נשלחה ונשמרה");
      } catch (err) {
        console.log("❌ שגיאה בשמירת הודעה:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ משתמש התנתק:", socket.id);
    });
  });
}

module.exports = setupSocket;
