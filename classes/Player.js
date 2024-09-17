// I M P O R T   O F   C L A S S E S
import GameElement from "./GameElement.js";
import Settings from "./Settings.js";

// C O D E

export default class Player extends GameElement {
  constructor(isLeft, x, y, color, canvas) {
    const { width, height } = Settings.player;
    super(x, y, color, canvas);
    this.width = width;
    this.height = height;
    this.x = isLeft
      ? Settings.player.distance
      : canvas.width - Settings.player.distance - this.width;
    this.y = (canvas.height - this.height) / 2;
    this.velocity = 4;
    this.direction = {
      x: 0,
      y: 0,
    };
  }
  points = 0;

  // Public Methods
  draw() {
    const context = this.getCanvasContext();
    context.fillStyle = this.getColor();
    context.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this._checkWallCollision();
    this._updatePosition();
  }

  // Private Methods
  _checkWallCollision() {
    const canvas = this.getCanvasContext().canvas;
    if (this._collidesWithBottomWall()) {
      this.direction.y = 0;
      this.y = canvas.height - height - 1;
    }
    if (this._collidesWithTopWall()) {
      this.direction.y = 0;
      this.y = 1;
    }
  }

  _collidesWithTopWall() {
    return this.y <= 0;
  }

  _collidesWithBottomWall() {
    return this.y >= this.getCanvasContext().canvas.height - this.height;
  }
}
