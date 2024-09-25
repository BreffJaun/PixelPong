// I M P O R T   O F   C L A S S E S
import Ball from "./Ball.js";
import Player from "./Player.js";
import Settings from "./Settings.js";

// C O D E
export default class Game {
  #canvas;
  #context;
  #player1;
  #player2;
  #ball;
  #requestId;
  #isGameOver = false;
  #scorePausedDuration = 500; // default 2000
  #isPaused = false;
  #scorePaused = false;
  #xPosText;
  #yPosText;
  #gameStarted = false;

  constructor() {
    this.#canvas = document.getElementById("my-canvas");
    if (!this.#canvas) {
      throw new Error("Canvas element with id 'my-canvas' not found.");
    }
    this.#canvas.height = 400;
    this.#canvas.width = 400;
    this.#context = this.#canvas.getContext("2d");
    if (!this.#context) {
      throw new Error("Failed to get canvas context.");
    }

    const playerStartX = Settings.player.distance;
    const playerStartY = (this.#canvas.height - Settings.player.height) / 2;

    this.#player1 = new Player(
      true,
      playerStartX,
      playerStartY,
      Settings.player.color,
      this.#canvas
    );
    this.#player2 = new Player(
      false,
      this.#canvas.width - Settings.player.distance - Settings.player.width,
      playerStartY,
      Settings.player.color,
      this.#canvas
    );

    this.#ball = new Ball(
      this.#canvas.width / 2,
      this.#canvas.height / 2,
      10,
      Settings.playField.fontColor,
      this.#player1,
      this.#player2,
      this.#canvas
    );
    this.#xPosText = this.#canvas.width / 2;
    this.#yPosText =
      this.#canvas.height / 2 +
      (Settings.playField.fontSize * Settings.playField.fontSizeFactor) / 2;
    this.#setupButtonListeners();
    this.#requestId = null;
    this.scoreCounter = 0;
    this.timeOutCounter = 0;
  }

  initializeGame() {
    this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    this.#initControls();
    this.#drawPlayfield();
    this.#drawScore();
    this.#updateAndDraw();
  }

  start() {
    this.#resetGame();
    this.#initControls();
    this.#update();
    // console.log("GAME STARTED");
    this.#gameStarted = true;
  }

  isGameStarted() {
    return this.#gameStarted;
  }

  #resetGame() {
    this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    this.#isGameOver = false;
    this.#isPaused = false;
    this.#scorePaused = false;
    this.#updateAndDraw();
  }

  #endGame() {
    this.#isGameOver = false;
    this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    this.#drawPlayfield();
    this.#updateAndDraw();
    this.#drawScore();
    this.#displayFinishText();
    this.#updateButtonStates();
    cancelAnimationFrame(this.#requestId);
    this.#requestId = null;
    // console.log("this.#requestId ENDGAME", this.#requestId);
  }

  #update() {
    // console.log("UPDATE CALLED");
    if (this.#isGameOver) {
      this.#requestId = null;
      this.#endGame();
    }
    this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    // console.log("this.#requestId UPDATE", this.#requestId);
    if (!this.#isPaused) {
      this.#drawPlayfield();
      this.#gameLogic();
      this.#updateAndDraw();
      this.#drawScore();
      this.#updateButtonStates();
      this.#requestId = requestAnimationFrame(this.#update.bind(this));
    } else {
      this.#drawPlayfield();
      this.#updateAndDraw();
      this.#drawScore();
      this.#drawPauseMessage();
      this.#updateButtonStates();
      cancelAnimationFrame(this.#requestId);
    }
  }

  #drawPlayfield() {
    const canvas = this.#canvas;
    const context = this.#context;
    context.fillStyle = "grey";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the border
    context.setLineDash([]);
    context.strokeStyle = Settings.playField.border;
    context.lineWidth = 10;
    context.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw the middle line
    context.beginPath();
    context.setLineDash([30, 20]);
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.stroke();
    context.closePath();
  }

  #drawScore() {
    this.#context.fillStyle = Settings.playField.fontColor;
    this.#context.font = `${40}px ${Settings.playField.font}`;
    this.#context.textAlign = "center";
    this.#context.fillText(this.#player1.points, 150, 50);
    this.#context.fillText(this.#player2.points, this.#canvas.width - 150, 50);
  }

  #drawPauseMessage() {
    if (this.#isPaused) {
      this.#context.font = `${60}px ${Settings.playField.font}`;
      this.#context.textAlign = "center";
      this.#context.fillStyle = "rgba(255, 0, 0, 0.5)";
      this.#context.fillText("PAUSE", this.#xPosText, 234); // EIgentlich this.#yPosText
    }
  }

  #drawScorePauseMessage(message) {
    if (this.#scorePaused) {
      this.#context.font = `${Settings.playField.fontSize}px ${Settings.playField.font}`;
      this.#context.fillStyle = Settings.playField.infoFontColor;
      this.#context.fillText(message, this.#xPosText, this.#yPosText);
    }
  }

  #gameLogic() {
    if (
      this.#player1.points >= Settings.maxPoints ||
      this.#player2.points >= Settings.maxPoints
    ) {
      // this.#isGameOver = true;
      this.#requestId = null;
      // console.log("this.#requestId GAMELOGIC", this.#requestId);
      this.#endGame();
      return;
    }
    // console.log("ICH WERDE NOCH AUSGEFÜHRT ! ! !");
    if (!this.#scorePaused) {
      if (this.#ball._collidesWithLeftWall()) {
        if (this.#player2.points < Settings.maxPoints) {
          this.#player2.points++;
          this.scoreCounter++;
          // console.log("Score Counter: ", this.scoreCounter);
          // console.log("Scored from Player 2");
          this.#scorePauseToggle("Player 2 scores!", () => {
            this.#ball.reset();
            this.#player1.resetPosition();
            this.#player2.resetPosition();
          });
        }
      } else if (this.#ball._collidesWithRightWall()) {
        if (this.#player1.points < Settings.maxPoints) {
          this.#player1.points++;
          this.scoreCounter++;
          // console.log("Score Counter: ", this.scoreCounter);
          // console.log("Scored from Player 1");
          this.#scorePauseToggle("Player 1 scores!", () => {
            this.#ball.reset();
            this.#player1.resetPosition();
            this.#player2.resetPosition();
          });
        }
      }
    }
  }

  #updateAndDraw() {
    this.#player1.update();
    this.#player2.update();
    this.#ball.update();

    this.#player1.draw();
    this.#player2.draw();
    this.#ball.draw();
  }

  #displayFinishText() {
    const winner =
      this.#player1.points > this.#player2.points
        ? this.#player1
        : this.#player2;
    const winnerName = winner === this.#player1 ? "Player1" : "Player2";
    const message = `${winnerName} won!`;
    this.#context.font = `${Settings.playField.fontSize}px ${Settings.playField.font}`;
    this.#context.fillStyle = Settings.playField.infoFontColor;
    this.#context.fillText(message, this.#xPosText, this.#yPosText);
    this.#updateButtonStates();
  }

  #handleKeyEvent(event) {
    const isKeyDown = event.type === "keydown";
    switch (event.code) {
      case "KeyW":
        this.#player1.direction.y = isKeyDown ? -1 : 0;
        break;
      case "KeyS":
        this.#player1.direction.y = isKeyDown ? 1 : 0;
        break;
      case "ArrowUp":
        this.#player2.direction.y = isKeyDown ? -1 : 0;
        break;
      case "ArrowDown":
        this.#player2.direction.y = isKeyDown ? 1 : 0;
        break;
      case "Space":
        if (isKeyDown) {
          this.#togglePause();
        }
        break;
    }
  }

  #onKeyDown() {
    document.addEventListener("keydown", this.#handleKeyEvent.bind(this));
  }

  #onKeyUp() {
    document.addEventListener("keyup", this.#handleKeyEvent.bind(this));
  }

  #initControls() {
    this.#onKeyDown();
    this.#onKeyUp();
  }

  #togglePause() {
    this.#isPaused = !this.#isPaused;
    if (!this.#isPaused) {
      this.#requestId = requestAnimationFrame(this.#update.bind(this));
    } else {
      this.#drawPauseMessage();
      cancelAnimationFrame(this.#requestId);
    }
    this.#updateButtonStates();
  }

  #scorePauseToggle(message, callback) {
    this.#scorePaused = true;
    this.#drawScorePauseMessage(message);
    setTimeout(() => {
      this.timeOutCounter++;
      this.#scorePaused = false;
      // console.log("Timeout Counter: ", this.timeOutCounter);
      callback();
      if (
        this.#player1.points === Settings.maxPoints ||
        this.#player2.points === Settings.maxPoints
      ) {
        cancelAnimationFrame(this.#requestId);
      }
    }, this.#scorePausedDuration);
  }

  #setupButtonListeners() {
    const startButton = document.getElementById("start-button");
    const pauseButton = document.getElementById("pause-button");
    const endButton = document.getElementById("end-button");

    startButton.addEventListener("click", () => {
      this.start();
    });

    pauseButton.addEventListener("click", () => {
      this.#togglePause();
    });

    endButton.addEventListener("click", () => {
      this.#isGameOver = true;
    });

    this.#updateButtonStates();
  }

  #updateButtonStates() {
    const startButton = document.getElementById("start-button");
    const pauseButton = document.getElementById("pause-button");
    const endButton = document.getElementById("end-button");

    if (this.#gameStarted && !this.#isPaused) {
      startButton.disabled = true;
      pauseButton.disabled = false;
      endButton.disabled = false;
    } else if (this.#gameStarted && this.#isPaused) {
      startButton.disabled = true;
      pauseButton.disabled = false;
      endButton.disabled = false;
    } else {
      startButton.disabled = false;
      pauseButton.disabled = true;
      endButton.disabled = true;
    }
  }
}
