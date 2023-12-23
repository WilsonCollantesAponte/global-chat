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

app.get("/", (req, res) => {
  res
    .status(200)
    .send(
      "Servidor de la app-1 integración socket.io - iniciada - establecida:true"
    );
});

app.post("/one", (req, res) => {
  const { id } = req.body;

  res.status(200).json({ es: id });
});

io.on("connection", (socket) => {
  socket.emit("hello", "word");
});

io.on("hello", (socket) => {
  io.emit("helloe", "server - " + socket);
});

module.exports = server;
