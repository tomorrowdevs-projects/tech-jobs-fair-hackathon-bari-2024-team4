//X
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const sampleUrl =
  "https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple";

var connectedUsers = 0;
var readyUsers = [];
var ranking = [];
var currentQuestions = [];

var gameStarted;

app.use("/css", express.static(__dirname + "/css"));
app.use("/javascript", express.static(__dirname + "/javascript"));
app.use("/img", express.static(__dirname + "/img"));
app.use("/", express.static(__dirname + "/"));

io.on("connection", (socket) => {
  connectedUsers++;

  if (gameStarted) {
    socket.emit(
      "ranking",
      ranking.sort((a, b) => b.score - a.score)
    );
    return;
  }
  io.emit(
    "firstConnection",
    readyUsers.map((o) => o.username)
  );

  socket.on("pressedReady", (username) => {
    if (readyUsers.map((o) => o.username).includes(username)) {
      return;
    }

    readyUsers.push({ username: username, sockedId: socket.id });
    if (readyUsers.length >= 2 && readyUsers.length === connectedUsers) {
      gameStarted = true;
      fetch(sampleUrl)
        .then((res) => res.json())
        .then((data) => {
          currentQuestions = data.results;
          io.emit("gameStarting", currentQuestions);
        });
    } else {
      io.emit(
        "readyUsers",
        readyUsers.map((o) => o.username)
      );
    }
  });

  socket.on("userScore", (userScore) => {
    ranking.push(userScore);

    if (readyUsers.length === ranking.length) {
      gameStarted = false;
      io.emit(
        "ranking",
        ranking.sort((a, b) => b.score - a.score)
      );
    }
  });

  socket.on("disconnect", () => {
    try {
      let tmpUsername = readyUsers.filter(
        (o) => o.socketId === socket.socketId
      )[0].username;
      ranking = ranking.filter((o) => o.username !== tmpUsername);
    } catch (error) {}
    readyUsers = readyUsers.filter((o) => o.socketId !== socket.socketId);

    connectedUsers--;
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

server.listen(PORT, async () => {
  console.log("listening on port", PORT);
});
