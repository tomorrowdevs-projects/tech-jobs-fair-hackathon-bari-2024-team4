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

socket.on("firstConnection", (ru) => {
  readyUsers = ru;
  handleReadyUsers();

  readyBtn.innerHTML = "Ready";
  readyBtn.addEventListener("click", (e) => {
    readyBtn.disabled = true;
    socket.emit("pressedReady", username);
  });
});

socket.on("readyUsers", (ru) => {
  readyUsers = ru;
  handleReadyUsers();
});

socket.on("ranking", (rnk) => {
  if (rnk.length === 0) {
    readyBtn.remove();
    endGame();
    return;
  }
  ranking = rnk;
  handleRanking();
  loader.classList.add("hidden");
});

socket.on("gameStarting", (q) => {
  questions = q.map((loadedQuestion) => {
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
  startGame();
});

function handleReadyUsers() {}

function startGame() {
  questionCounter = 0;
  score = 0;
  animateChoicesFromRight();
  getNewQuestion();
  game.classList.remove("hidden");
  loader.classList.add("hidden");
}

function handleRanking() {
  showRanking();
  waitingText.innerText = "";
}

getNewQuestion = () => {
  if (questionCounter === MAX_QUESTIONS) {
    endGame();
    localStorage.setItem("mostRecentScore", score);
    socket.emit("userScore", { username: username, score: score });
    return;
  }
  progressText.innerText = `Question ${questionCounter + 1}/${MAX_QUESTIONS}`;

  currentQuestion = questions[questionCounter];
  question.innerHTML = currentQuestion.question;

  choices.forEach((choice) => {
    const number = choice.dataset["number"];
    choice.innerHTML = currentQuestion["choice" + number];
  });
  animateChoicesFromRight();
  acceptingAnswers = true;
  applyChoicesOnClick();
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
  }, 1000);
};

updateTimerUI = (time) => {
  timerElement.textContent = `Time: ${time}s`;
};

const applyChoicesOnClick = () => {
  choices.forEach((choice) => {
    choice.addEventListener("click", (e) => {
      if (!acceptingAnswers) return;

      acceptingAnswers = false;
      clearInterval(timer);

      const selectedChoice = choice;
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
        animateChoicesFromRight();
        getNewQuestion();
      }, 1000);
    });
  });
};

incrementScore = (num) => {
  score += num + timeLeft;
  scoreText.innerText = score;
};

function endGame() {
  game.classList.add("hidden");
  loader.classList.remove("hidden");
  waitingText.innerText =
    "Game already started , wait for the results to start a new one!";
  socket.emit("getRanking");
}

function showRanking() {
  const rankingList = document.getElementById("ranking-list");

  ranking.sort((a, b) => b.score - a.score);

  ranking.forEach((user, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${index + 1}. ${user.username}: ${user.score}`;
    rankingList.appendChild(listItem);
  });

  const rankingModal = document.getElementById("ranking");
  rankingModal.classList.remove("hidden");

  homeBtn.innerHTML = "Home";
  homeBtn.addEventListener("click", (e) => {
    socket.emit("pressedReady", username);
    return window.location.assign("/");
  });
}
