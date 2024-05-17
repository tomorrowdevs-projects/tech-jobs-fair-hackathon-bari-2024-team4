
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
var readyUsers = [];
var ranking = [];
var currentQuestions = [];

var gameStarted ; 

app.use("/css", express.static(__dirname + "/css"));
app.use("/javascript", express.static(__dirname + "/javascript"));
app.use("/img", express.static(__dirname + "/img"));
app.use("/", express.static(__dirname + "/"));

io.on("connection", socket => {
	console.log("socket ", socket.id, "connected");
	connectedUsers++;
	console.log("number of users connected :", connectedUsers);

	if (gameStarted){
		socket.emit(
			"ranking",
			ranking.sort((a, b) => b.score - a.score)
		);
		return
	}
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
			gameStarted = true; 
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
			gameStarted = false ; 
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