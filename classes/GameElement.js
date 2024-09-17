// C O D E
export default class GameElement {
  #color;
  #canvas;
  constructor(x, y, color = "white", canvas) {
    this.x = x;
    this.y = y;
    this.width = 0;
    this.height = 0;
    this.#color = color;
    this.#canvas = canvas;
  }
  velocity = 2;
  direction = {
    x: 1,
    y: -1,
  };

  // Public Methods
  // Getters
  getCanvasContext() {
    return this.#canvas.getContext("2d");
  }

  getColor() {
    return this.#color;
  }

  draw() {
    return null;
  }

  update() {
    return null;
  }

  // Private Methods
  _updatePosition() {
    this.x += this.direction.x * this.velocity;
    this.y += this.direction.y * this.velocity;
  }

  _checkWallCollision() {
    return null;
  }

  _collidesWithTopWall() {
    return null;
  }

  _collidesWithRightWall() {
    return null;
  }

  _collidesWithBottomWall() {
    return null;
  }

  _collidesWithLeftWall() {
    return null;
  }
}
