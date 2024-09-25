// I M P O R T   O F   F U N C T I O N S
import Game from "./classes/Game.js";

// C O D E
const game = new Game();
const startButton = document.getElementById("start-button");
if (startButton) {
  window.onload = () => {
    game.initializeGame();
  };
  startButton.addEventListener("click", () => {
    if (!game.isGameStarted()) {
      game.start();
    }
  });
}
