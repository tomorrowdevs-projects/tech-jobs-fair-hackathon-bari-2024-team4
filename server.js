//X
const express = require("express");
const { read } = require("fs");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 5000;
const sampleUrl =
	"https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple";

var connectedUsers = 0;
var readyUsers = [];
var ranking = [];


var currentQuestions = [];

app.use("/css", express.static(__dirname + "/css"));
app.use("/javascript", express.static(__dirname + "/javascript"));
app.use("/img", express.static(__dirname + "/img"));
app.use("/", express.static(__dirname + "/"));

io.on("connection", socket => {
	console.log("socket ", socket.id, "connected");
	connectedUsers++;
	console.log("number of users connected :", connectedUsers);

	io.emit("firstConnection", readyUsers.map(o => o.username));


	//creare evento errore user con stesso nome gia presente


	socket.on("pressedReady", username => {
		
		if (readyUsers.map(o => o.username).includes(username)){
			// non capisco perchè ma è necessario questo controllo, se si avviano 2 client e si fa partire dal primo da errore
			console.log("ERROR ready called twice"); 
			return; 
		}




		console.log(username, " is ready");
		readyUsers.push({"username":username , "sockedId":socket.id});
		console.log("ready users : ", readyUsers);
		if (readyUsers.length >= 2 && readyUsers.length === connectedUsers) {
			console.log("Game starting with ", readyUsers.length, " users!");
			//per ora, una volta collegati i giocatori si parte direttamente;
			//si potrebbe mettere invece un altro evento "loading"
			// in cui si mostra ai giocatori che la partita sta iniziando
			fetch(sampleUrl)
				.then(res => res.json())
				.then(data => {
					currentQuestions = data.results;
					io.emit("gameStarting", currentQuestions); //passare anche domande
				});
		} else {
			io.emit("readyUsers", readyUsers.map(o => o.username));
		}
	});

	socket.on("userScore", userScore => {
		ranking.push(userScore);
		// per ora assumo che il numero di utenti ready è uguale al numero di giocatori
		if (readyUsers.length === ranking.length) {
			io.emit(
				"ranking",
				ranking.sort((a, b) => b.score - a.score)
			);
		}
	});

	socket.on("disconnect", () => {
		//aggiungere gestione disconnessione quando user si disconnette dopo che ha messo pronto
		console.log("socket ", socket.id, "disconnected");
		try{
			let tmpUsername = readyUsers.filter(o => o.socketId === socket.socketId )[0].username
			ranking = ranking.filter(o => o.username !== tmpUsername);
		}
		catch(error){
			console.log("error: ")
			console.log("ranking ->",ranking)
			console.log("filter ->",readyUsers.filter(o => o.socketId === socket.socketId ))
			

		}
		readyUsers = readyUsers.filter(o => o.socketId !== socket.socketId );
		console.log("users disconnected->", readyUsers);
		console.log("ranking disconnected->", ranking);
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
=======
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

const Question = mongoose.model("Question", questionSchema);

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