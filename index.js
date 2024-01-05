const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

app.use(cors());
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_ADDRESS, // Replace with your React app's URL
    methods: ["GET", "POST"],
  },
});
const players = [];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    const index = players.findIndex((player) => player.id === socket.id);
    if (index !== -1) {
      players.splice(index, 1);
      io.emit("updatePlayers", players);
    }
  });

  socket.on("newPlayer", (playerData) => {
    const idExists = players.some((player) => player.id === socket.id);
    if (!idExists) {
      console.log("New Player emitted");
      players.push({ id: socket.id, x: playerData.x, y: playerData.y });
      io.emit("updatePlayers", players);
    }
  });

  socket.on("playerMoved", (playerNewPosition) => {
    const index = players.findIndex(
      (player) => player.id === playerNewPosition.id
    );
    if (index !== -1) {
      players.splice(index, 1, playerNewPosition);
      io.emit("updatePlayers", players);
    }
  });

  socket.on("sendMessage", (newMessage) => {
    const index = players.findIndex((player) => player.id === newMessage.id);
    if (index !== -1) {
      io.emit("messageSent", {
        message: newMessage.message,
        x: players[index].x,
        y: players[index].y,
      });
    }
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
