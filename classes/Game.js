// I M P O R T   O F   C L A S S E S
// import GameElement from "./GameElement.js";
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
  constructor() {
    this.#canvas = document.getElementById("my-canvas");
    if (!this.#canvas) {
      throw new Error("Canvas element with id 'my-canvas' not found.");
    }
    this.#canvas.height = 400; // Setze feste Höhe
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
  }

  start() {
    this.#onKeyDown();
    this.#onKeyUp();
    this.#update();
  }

  // Private Methods
  #update() {
    //  Draw the playfield
    this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    this.#drawPlayfield();

    // Execute the game logic
    this.#gameLogic();

    // Update and draw the game elements
    this.#updateAndDraw();

    // Draw the score
    this.#drawScore();

    // Start the animation loop
    this.#requestId = requestAnimationFrame(this.#update.bind(this));

    // Finish the game
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
    this.#context.font = "40px 'Press Start 2P', sans-serif";
    this.#context.textAlign = "center";
    this.#context.fillText(this.#player1.points, 150, 50);
    this.#context.fillText(this.#player2.points, this.#canvas.width - 150, 50);
  }

  #gameLogic() {
    if (this.#ball._collidesWithLeftWall()) {
      this.#player2.points++;
      this.#ball.reset();
    } else if (this.#ball._collidesWithRightWall()) {
      this.#player1.points++;
      this.#ball.reset();
    }

    if (
      this.#player1.points >= Settings.maxPoints ||
      this.#player2.points >= Settings.maxPoints
    ) {
      this.#isGameOver = true;
      this.#finish();
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

  #finish() {
    const winner =
      this.#player1.points > this.#player2.points
        ? this.#player1
        : this.#player2;
    const winnerName = winner === this.#player1 ? "Player1" : "Player2";
    this.#context.font = "20px 'Press Start 2P', sans-serif";
    this.#context.fillStyle = "black";
    this.#context.fillText(
      `${winnerName} hat gewonnen!`,
      this.#canvas.width / 2,
      this.#canvas.height / 2
    );
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
    }
  }

  #onKeyDown() {
    document.addEventListener("keydown", this.#handleKeyEvent.bind(this));
  }

  #onKeyUp() {
    document.addEventListener("keyup", this.#handleKeyEvent.bind(this));
  }
}
