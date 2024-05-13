document.addEventListener('DOMContentLoaded', () => {
    const finalScore = document.getElementById('finalScore');
    const mostRecentScore = localStorage.getItem('mostRecentScore');

    finalScore.innerText = mostRecentScore;

    const username = localStorage.getItem('username');

    const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
    const MAX_HIGH_SCORES = 5;

    // Save the score with the username
    const score = {
        score: mostRecentScore,
        name: username,
    };

    highScores.push(score);
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(5);

    localStorage.setItem('highScores', JSON.stringify(highScores));
});
