//CONSTANTS
const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 10;

const readyBox = document.getElementById("ready-box");
const readyList = document.getElementById("ready-list");
const readyBtn = document.getElementById("ready-btn");
const homeBtn = document.getElementById("home-btn");

let userReady = false;
let gameStarted = false;
let readyUsers = [];

const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const progressText = document.getElementById("progressText");
const scoreText = document.getElementById("score");
const loader = document.getElementById("loader");
const game = document.getElementById("game");
const timerElement = document.getElementById("timer");

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];
let timer;
let timeLeft = 30;
let ranking = [];

let questions = [];

const username = localStorage.getItem("username");

const socket = io();

//oltre (o invece di)  if gamestarted si potrebbe rispondere ad un evento "firstconnection"
//prima connessione al server
socket.on("firstConnection", ru => {
	readyUsers = ru;
	handleReadyUsers();
	if (!gameStarted) {
		// readyBtn.id = "readyBtn"; 
		readyBtn.innerHTML = "Ready";
		readyBtn.addEventListener("click", e => {
			readyBtn.disabled = true;
			socket.emit("pressedReady", username);
		});
	} else {
		//decidere cosa fare in caso di accesso a partita gia iniziata
		console.log("Game already started");
	}
});

//Un altro utente ha messo pronto
socket.on("readyUsers", ru => {
	readyUsers = ru;
	handleReadyUsers();
});

socket.on("ranking", rnk => {
	ranking = rnk;
	handleRanking();
	loader.classList.add("hidden");
});

//Ci sono abbastanza utenti e la partita può iniziare
socket.on("gameStarting", q => {
	questions = q.map(loadedQuestion => {
		const formattedQuestion = {
			question: loadedQuestion.question,
		};
		const answerChoices = [...loadedQuestion.incorrect_answers];
		formattedQuestion.answer = Math.floor(Math.random() * 4) + 1;
		answerChoices.splice(
			formattedQuestion.answer - 1,
			0,
			loadedQuestion.correct_answer
		);

		answerChoices.forEach((choice, index) => {
			formattedQuestion["choice" + (index + 1)] = choice;
		});

		return formattedQuestion;
	});
	readyBtn.remove(); 
	console.log("game starting");
	startGame();
	//
});

function handleReadyUsers() {
	//per ora console log , si può fare una schermata che mostra i giocatori
	//attenzione al caso in cui la partita è gia iniziata

	console.log("There are ", readyUsers.length, "ready users: ");
}

function startGame() {
	questionCounter = 0;
	score = 0;
	// availableQuestions = [...questions];
	getNewQuestion();
	game.classList.remove("hidden");
	loader.classList.add("hidden");
}

function handleRanking() {
	console.log("ranking : ", ranking);
	showRanking();
	waitingText.innerText = "";
}

getNewQuestion = () => {
	if (questionCounter === MAX_QUESTIONS) {
		endGame();
		//inviare score a server o calcolare tutto su frontend?
		localStorage.setItem("mostRecentScore", score);
		//funziona con express? capire se gestirla con risposta a socket

		// per ora solo console.log della classifica

		console.log("Game ended");
		socket.emit("userScore", { username: username, score: score });

		return;
		// return window.location.assign('/end.html');
	}
	progressText.innerText = `Question ${questionCounter + 1}/${MAX_QUESTIONS}`;

	// const questionIndex = Math.floor(Math.random() * availableQuestions.length);
	// currentQuestion = availableQuestions[questionIndex];
	currentQuestion = questions[questionCounter];
	question.innerHTML = currentQuestion.question;

	console.log("Questions -> ", questions);
	// console.log("Available Quesitions -> ", availableQuestions);
	// console.log("questionIndex -> ", questionIndex);
	// console.log("questionCounter", questionCounter);

	choices.forEach(choice => {
		const number = choice.dataset["number"];
		choice.innerHTML = currentQuestion["choice" + number];
	});

	// availableQuestions.splice(questionIndex, 1);
	acceptingAnswers = true;
	timeLeft = 10;
	startTimer();
};

startTimer = () => {
	timer = setInterval(() => {
		timeLeft--;
		updateTimerUI(timeLeft);
		if (timeLeft === 0) {
			clearInterval(timer);
			questionCounter++;
			getNewQuestion();
		}
	}, 1000000);
};

updateTimerUI = time => {
	timerElement.textContent = `Time: ${time}s`;
};

choices.forEach(choice => {
	choice.addEventListener("click", e => {
		if (!acceptingAnswers) return;

		acceptingAnswers = false;
		clearInterval(timer);

		const selectedChoice = e.target;
		const selectedAnswer = selectedChoice.dataset["number"];

		const classToApply =
			selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";

		if (classToApply === "correct") {
			incrementScore(CORRECT_BONUS);
		}

		selectedChoice.parentElement.classList.add(classToApply);

		setTimeout(() => {
			selectedChoice.parentElement.classList.remove(classToApply);
			questionCounter++;
			getNewQuestion();
		}, 1000);
	});
});

incrementScore = num => {
	score += num;
	scoreText.innerText = score;
};

function endGame() {
	game.classList.add("hidden");
	loader.classList.remove("hidden");
	waitingText.innerText = "Waiting for other players score";
	socket.emit("getRanking");
}

//SHOW RANKING
function showRanking() {
	const rankingList = document.getElementById("ranking-list");

	//rankingList.innerHTML = "";

	ranking.sort((a, b) => b.score - a.score);

	ranking.forEach((user, index) => {
		const listItem = document.createElement("li");
		listItem.textContent = `${index + 1}. ${user.username}: ${user.score}`;
		rankingList.appendChild(listItem);
	});

	const rankingModal = document.getElementById("ranking");
	rankingModal.classList.remove("hidden");

	homeBtn.innerHTML = "Home"; 
	homeBtn.addEventListener("click", e => {
		socket.emit("pressedReady", username);
		return window.location.assign('/');
	})


}

// fetch(
//     'https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple'
// )
//     .then((res) => {
//         return res.json();
//     })
//     .then((loadedQuestions) => {
//         questions = loadedQuestions.results.map((loadedQuestion) => {
//             const formattedQuestion = {
//                 question: loadedQuestion.question,
//             };

//             const answerChoices = [...loadedQuestion.incorrect_answers];
//             formattedQuestion.answer = Math.floor(Math.random() * 4) + 1;
//             answerChoices.splice(
//                 formattedQuestion.answer - 1,
//                 0,
//                 loadedQuestion.correct_answer
//             );

//             answerChoices.forEach((choice, index) => {
//                 formattedQuestion['choice' + (index + 1)] = choice;
//             });

//             return formattedQuestion;
//         });

//         startGame();
//     })
//     .catch((err) => {
//         console.error(err);
//     });

// startGame = () => {
//     questionCounter = 0;
//     score = 0;
//     availableQuestions = [...questions];
//     getNewQuestion();
//     game.classList.remove('hidden');
//     loader.classList.add('hidden');
// };

// getNewQuestion = () => {
//     if (availableQuestions.length === 0 || questionCounter === MAX_QUESTIONS) {
//         localStorage.setItem('mostRecentScore', score);
//         return window.location.assign('/end.html');
//     }
//     progressText.innerText = `Question ${questionCounter + 1}/${MAX_QUESTIONS}`;

//     const questionIndex = Math.floor(Math.random() * availableQuestions.length);
//     currentQuestion = availableQuestions[questionIndex];
//     question.innerHTML = currentQuestion.question;

//     choices.forEach((choice) => {
//         const number = choice.dataset['number'];
//         choice.innerHTML = currentQuestion['choice' + number];
//     });

//     availableQuestions.splice(questionIndex, 1);
//     acceptingAnswers = true;
//     timeLeft = 10;
//     // startTimer();
// };

// startTimer = () => {
//     timer = setInterval(() => {
//         timeLeft--;
//         updateTimerUI(timeLeft);
//         if (timeLeft === 0) {
//             clearInterval(timer);
//             questionCounter++;
//             getNewQuestion();
//         }
//     }, 1000);
// };

// updateTimerUI = (time) => {
//     timerElement.textContent = `Time: ${time}s`;
// };

// choices.forEach((choice) => {
//     choice.addEventListener('click', (e) => {
//         if (!acceptingAnswers) return;

//         acceptingAnswers = false;
//         clearInterval(timer);

//         const selectedChoice = e.target;
//         const selectedAnswer = selectedChoice.dataset['number'];

//         const classToApply =
//             selectedAnswer == currentQuestion.answer ? 'correct' : 'incorrect';

//         if (classToApply === 'correct') {
//             incrementScore(CORRECT_BONUS);
//         }

//         selectedChoice.parentElement.classList.add(classToApply);

//         setTimeout(() => {
//             selectedChoice.parentElement.classList.remove(classToApply);
//             questionCounter++;
//             getNewQuestion();
//         }, 1000);
//     });
// });

// incrementScore = (num) => {
//     score += num;
//     scoreText.innerText = score;
// };
