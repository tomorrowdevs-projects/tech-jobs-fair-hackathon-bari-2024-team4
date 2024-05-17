<<<<<<< HEAD
document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("username");
  const playBtn = document.getElementById("playBtn");

  playBtn.disabled = true;

  const togglePlayButton = () => {
    playBtn.disabled = !usernameInput.value.trim(); 
  };

  usernameInput.addEventListener("input", togglePlayButton);

  playBtn.addEventListener("click", (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();

    if (username !== "") {
      localStorage.setItem("username", username);

      window.location.href = "game.html";
    }
  });
});
=======
document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const playBtn = document.getElementById('playBtn');

    playBtn.disabled = true;

    const togglePlayButton = () => {
        playBtn.disabled = !usernameInput.value.trim(); // Disable if username is empty
    };

    usernameInput.addEventListener('input', togglePlayButton);

    playBtn.addEventListener('click', (event) => {
        event.preventDefault();

        const username = usernameInput.value.trim();

        if (username !== '') {
            localStorage.setItem('username', username);

            window.location.href = 'game.html';
        }
    });
});
>>>>>>> daf904951d9a766b9966ea141750c44adc36377e
