const { Server } = require("socket.io");
const { createServer } = require("node:http");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

io.on("connection", (socket) => {
  socket.on("message", (body) => {
    // console.log(body);

    socket.broadcast.emit("message", {
      ...body,
      from: socket.id.slice(0, 6), // Cambiar el "from" solo para los demás usuarios
    });
  });
});

module.exports = server;
