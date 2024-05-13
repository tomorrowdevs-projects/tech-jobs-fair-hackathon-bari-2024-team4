const highScoresList = document.getElementById("highScoresList");
const highScores = JSON.parse(localStorage.getItem("highScores")) || [];

highScoresList.innerHTML = highScores
  .map(score => {
    return `<li class="high-score">${score.name} - ${score.score}</li>`;
  })
  .join("");

// Function to delete specific item from local storage
const deleteItemFromLocalStorage = (key) => {
    localStorage.removeItem(key);
};

// Function to clear all items from local storage
const clearAllLocalStorage = () => {
    localStorage.clear();
};

// Event listener for "Delete Data" button
const deleteDataBtn = document.getElementById('deleteDataBtn');

deleteDataBtn.addEventListener('click', () => {
    clearAllLocalStorage();
    // After clearing data, you might want to update the UI to reflect the changes
    highScoresList.innerHTML = ''; // Clear the high scores list
});
