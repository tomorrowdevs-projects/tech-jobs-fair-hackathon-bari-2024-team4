//X
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 5000;
const sampleUrl =
  "https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple";

//DATABASE

const mongoose = require("mongoose");
const dbURI = "mongodb://localhost:27017/Quiz_Database";

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on(
  "error",
  console.error.bind(console, "Errore di connessione al database:")
);
db.once("open", () => {
  console.log("Connesso al database MongoDB.");
});

const gameSchema = new mongoose.Schema({
  id: { type: Number },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  start: { type: Date, default: Date.now },
  timestamp: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  id: { type: Number },
  username: { type: String, required: true },
  role: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const questionSchema = new mongoose.Schema({
  id: { type: Number },
  question: { type: String, required: true },
  game_id: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
  answers: [{ type: String }],
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  correct: { type: Boolean, required: true },
  question_id: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
  answer: { type: Boolean, required: true },
});

const Game = mongoose.model("Game", gameSchema);
const User = mongoose.model("User", userSchema);
const Question = mongoose.model("Question", questionSchema);

//FINE DATABASE

var connectedUsers = 0;
var readyUsers = new Set();

var ranking = [];

//aggiungere errore caso username doppione

var currentQuestions = [];

app.use("/css", express.static(__dirname + "/css"));
app.use("/javascript", express.static(__dirname + "/javascript"));
app.use("/img", express.static(__dirname + "/img"));
app.use("/", express.static(__dirname + "/"));

io.on("connection", (socket) => {
  console.log("socket ", socket.id, "connected");
  connectedUsers++;
  console.log("number of users connected :", connectedUsers);

  io.emit("firstConnection", Array.from(readyUsers));

  socket.on("pressedReady", (username) => {
    console.log(username, " is ready");
    readyUsers.add(username);
    console.log("ready users : ", readyUsers);
    if (readyUsers.size >= 2 && readyUsers.size === connectedUsers) {
      console.log("Game starting with ", readyUsers.size, " users!");
      //per ora, una volta collegati i giocatori si parte direttamente;
      //si potrebbe mettere invece un altro evento "loading"
      // in cui si mostra ai giocatori che la partita sta iniziando
      fetch(sampleUrl)
        .then((res) => res.json())
        .then((data) => {
          currentQuestions = data.results;
          io.emit("gameStarting", currentQuestions); //passare anche domande
        });
    } else {
      io.emit("readyUsers", Array.from(readyUsers));
    }
  });

  socket.on("userScore", (userScore) => {
    ranking.push(userScore);
    // per ora assumo che il numero di utenti connessi sia = al numero di giocaotori
    if (connectedUsers === ranking.length) {
      io.emit(
        "ranking",
        ranking.sort((a, b) => b.score - a.score)
      );
    }
  });

  socket.on("disconnect", () => {
    //aggiungere gestione disconnessione quando user si disconnette dopo che ha messo pronto
    console.log("socket ", socket.id, "disconnected");
    connectedUsers--;
    console.log("users", connectedUsers);
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

server.listen(PORT, async () => {
  console.log("listening on port", PORT);
});
