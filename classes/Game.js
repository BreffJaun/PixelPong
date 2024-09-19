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
  #scorePauseDuration = 100; // default 2000
  #isPaused = false;
  #xPosText;
  #yPosText;
  #gameStarted = false;
  #pauseBlinkInterval;

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
  }

  start() {
    this.#resetGame();
    this.#initControls();
    this.#update();
    this.#gameStarted = true;
    this.#updateButtonStates();
  }

  isGameStarted() {
    return this.#gameStarted;
  }

  #resetGame() {
    this.#isGameOver = false;
    this.#isPaused = false;
    this.#player1.resetPosition();
    this.#player2.resetPosition();
    this.#ball.reset();
    this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    if (this.#pauseBlinkInterval) {
      clearInterval(this.#pauseBlinkInterval);
    }
  }

  #endGame() {
    this.#isGameOver = true;
    cancelAnimationFrame(this.#requestId);
    this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    this.#updateButtonStates();
  }

  #update() {
    if (!this.#isPaused) {
      this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
      this.#drawPlayfield();
      this.#gameLogic();
      this.#updateAndDraw();
      this.#drawScore();
    }
    this.#requestId = requestAnimationFrame(this.#update.bind(this));
    if (this.#isGameOver) {
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
      this.#context.fillStyle =
        this.#context.fillStyle === "transparent"
          ? "rgba(255, 0, 0, 0.5)"
          : "transparent";
      this.#context.fillText("PAUSE", this.#xPosText, this.#yPosText);
    }
  }

  #gameLogic() {
    if (this.#ball._collidesWithLeftWall()) {
      this.#player2.points++;
      if (this.#player2.points !== Settings.maxPoints) {
        this.#displayMessage("Player 1 scores!", () => {
          this.#ball.reset();
          this.#player1.resetPosition();
          this.#player2.resetPosition();
        });
      }
    } else if (this.#ball._collidesWithRightWall()) {
      this.#player1.points++;
      if (this.#player1.points !== Settings.maxPoints) {
        this.#displayMessage("Player 1 scores!", () => {
          this.#ball.reset();
          this.#player1.resetPosition();
          this.#player2.resetPosition();
        });
      }
    }

    if (
      this.#player1.points >= Settings.maxPoints ||
      this.#player2.points >= Settings.maxPoints
    ) {
      this.#isGameOver = true;
      this.#displayFinishText();
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
      this.#update();
    }
    if (this.#isPaused) {
      this.#pauseBlinkInterval = setInterval(() => this.#update(), 500);
    } else if (this.#pauseBlinkInterval) {
      clearInterval(this.#pauseBlinkInterval);
    }
  }

  #displayMessage(message, callback) {
    this.message = message;
    this.showMessage = true;

    this.#context.font = `${Settings.playField.fontSize}px ${Settings.playField.font}`;
    this.#context.fillStyle = Settings.playField.infoFontColor;
    // const textWidth = this.#context.measureText(message).width;
    this.#context.fillText(message, this.#xPosText, this.#yPosText);
    this.#isPaused = true;
    setTimeout(() => {
      console.log("Timeout wird ausgeführt");
      this.#context.clearRect(
        0,
        this.#yPosText - Settings.playField.fontSize,
        this.#canvas.width,
        Settings.playField.fontSize + 10
      );
      callback();
      this.showMessage = false;
      this.#isPaused = false;
    }, this.#scorePauseDuration);
  }

  #setupButtonListeners() {
    const startButton = document.getElementById("start-button");
    const pauseButton = document.getElementById("pause-button");
    const endButton = document.getElementById("end-button");

    if (startButton) {
      startButton.addEventListener("click", () => {
        if (!this.#gameStarted) {
          this.start();
        }
      });
    }

    if (pauseButton) {
      pauseButton.addEventListener("click", () => {
        if (this.#gameStarted && !this.#isGameOver) {
          this.#togglePause();
          this.#updateButtonStates();
        }
      });
    }

    if (endButton) {
      endButton.addEventListener("click", () => {
        if (this.#gameStarted && !this.#isGameOver) {
          this.#isGameOver = true;
          this.#endGame();
          this.#updateButtonStates();
        }
      });
    }
  }

  #updateButtonStates() {
    const startButton = document.getElementById("start-button");
    const pauseButton = document.getElementById("pause-button");
    const endButton = document.getElementById("end-button");

    if (startButton) {
      startButton.disabled = this.#gameStarted;
    }
    if (pauseButton) {
      pauseButton.disabled = !this.#gameStarted || this.#isGameOver;
    }
    if (endButton) {
      endButton.disabled = !this.#gameStarted || this.#isGameOver;
    }
  }
}
