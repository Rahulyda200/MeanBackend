const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config({ path: "./config.env" });

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const dbs = require("./conn/db");
const userRouter = require("./userRouter/userRouter");

app.use(cors());
app.use(express.json());

const logMessageToFile = (messageData) => {
  const now = new Date();
  const formattedDate = now.toLocaleString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const logEntry = `${formattedDate} - ${messageData.sender}: ${messageData.type === "text" ? messageData.content : "[Image message]"}\n`;
  const logFilePath = path.join(__dirname, "messages.txt");

  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error("Failed to write message to file:", err);
    }
  });
};

dbs();
app.use("/api/users", userRouter);

// Endpoint to retrieve message logs
app.get("/api/messages", (req, res) => {
  const logFilePath = path.join(__dirname, "messages.txt");

  fs.readFile(logFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Failed to read messages" });
    }

    const messages = data
      .split("\n")
      .filter((line) => line)
      .map((line) => {
        const parts = line.split(": ");
        return {
          sender: parts[0],
          content: parts[1],
        };
      });

    res.json({ messages });
  });
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("login", (userId) => {
    socket.join(userId);
    console.log(`${userId} has joined their room.`);
  });

  // Event for handling text and image messages
  socket.on("chat message", (data) => {
    const { sender, content, receiver, roomId, type } = data;
  
    console.log(`Message from ${sender}: ${type === "text" ? content : "[Image message]"} to ${receiver}`);
  
    if (!sender || !roomId) {
      console.error("Message must contain sender and roomId");
      return;
    }
  
    logMessageToFile({ sender, content, type });
  
    io.to(roomId).emit("chat message", {
      sender,
      content: type === "image" ? `data:image/jpeg;base64,${content}` : content, // Send as Base64 if image
      receiver,
      type,
      status: "sent",
    });
  });
  
  

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
