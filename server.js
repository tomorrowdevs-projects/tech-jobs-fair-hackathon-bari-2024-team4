const express = require("express");
const socketIo = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 5000;

io.on("connection", socket => {
	console.log("Connesione stabilita:" + socket.id);

	socket.on("saveScore", scoreData => {
		console.log("Punteggio totale", scoreData);
	});
});

server.listen(PORT, () => {
	console.log(`Server connesso sulla porta ${PORT}`);
});
