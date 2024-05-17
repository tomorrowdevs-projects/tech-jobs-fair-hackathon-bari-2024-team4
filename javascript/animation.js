// animation.js

const choiceContainers = document.querySelectorAll(".choice-container");

function animateChoicesFromRight() {
  choiceContainers.forEach((container, index) => {
    gsap.fromTo(
      container,
      { opacity: 0, x: 70 },
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        delay: index * 0.2,
        ease: "power2.out",
      }
    );
  });
}

// Function to reset the answer choices positions
function resetChoicesPosition() {
  choiceContainers.forEach((container, index) => {
    gsap.set(container, { opacity: 0, x: -50 });
  });
}
