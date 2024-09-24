// I M P O R T   O F   C L A S S E S
import GameElement from "./GameElement.js";

// C O D E

export default class Ball extends GameElement {
  #player1;
  #player2;
  constructor(x, y, radius, color, player1, player2, canvas) {
    super(x, y, color, canvas);
    this.radius = radius;
    this.#player1 = player1;
    this.#player2 = player2;
    this.velocity = 6; // default 3
    this.direction = { x: 1, y: -1 };
  }

  // Public Methods
  draw() {
    const context = this.getCanvasContext();
    context.beginPath();
    context.fillStyle = this.getColor();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
  }

  update() {
    this.#checkPlayerCollision(this.#player1);
    this.#checkPlayerCollision(this.#player2);
    this._checkWallCollision();
    this._updatePosition();
  }

  reset() {
    const canvas = this.getCanvasContext().canvas;
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;

    this.direction.x = Math.random() < 0.5 ? 1 : -1;
    this.direction.y = Math.random() < 0.5 ? 1 : -1;
  }

  // Private Methods
  #checkPlayerCollision(player) {
    if (
      this.x - this.radius < player.x + player.width &&
      this.x + this.radius > player.x &&
      this.y + this.radius > player.y &&
      this.y - this.radius < player.y + player.height
    ) {
      this.direction.x *= -1;
    }
  }

  // Protected Methods
  _checkWallCollision() {
    if (this._collidesWithTopWall()) {
      this.direction.y *= -1;
    }
    if (this._collidesWithBottomWall()) {
      this.direction.y *= -1;
    }
  }

  _collidesWithTopWall() {
    return this.y - this.radius <= 0;
  }

  _collidesWithRightWall() {
    const canvas = this.getCanvasContext().canvas;
    return this.x + this.radius >= canvas.width;
  }

  _collidesWithBottomWall() {
    const canvas = this.getCanvasContext().canvas;
    return this.y + this.radius >= canvas.height;
  }

  _collidesWithLeftWall() {
    const canvas = this.getCanvasContext().canvas;
    return this.x - this.radius <= 0;
  }
}
