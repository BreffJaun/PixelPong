// I M P O R T   O F   F U N C T I O N S

// C O D E
class Settings {
  static canvas = {
    width: 400,
    height: 400,
  };

  static player = {
    distance: 20,
    color: "white",
    width: 10,
    height: 50,
  };
}

class Player {
  constructor(isLeft, distance, width, height, color, canvas) {
    this.x = isLeft ? distance : canvas.width - distance - width;
    this.y = (canvas.height - height) / 2;
    this.width = width;
    this.height = height;
    this.color = color;
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
  }

  // Einstellungen die für Instanzen individuell sind, müssen in der Instanz gespeichert werden und nicht statisch:
  points = 0;
  velocity = 4;
  direction = {
    x: 0,
    y: 0,
  };

  update() {
    this.checkWallCollision();
    this.x += this.direction.x * this.velocity;
    this.y += this.direction.y * this.velocity;
  }

  draw() {
    this.context.fillStyle = this.color;
    this.context.fillRect(this.x, this.y, this.width, this.height);
  }

  checkWallCollision() {
    if (this.collidesWithBottomWall()) {
      this.direction.y = 0;
      // Spieler 1px vom Rand entfernt setzen:
      this.y = this.canvas.height - this.height - 1;
    }
    if (this.collidesWithTopWall()) {
      this.direction.y = 0;
      // Spieler 1px vom Rand entfernt setzen:
      this.y = 1;
    }
  }

  collidesWithTopWall() {
    // Kollision mit oberer Wand
    return this.y <= 0;
  }

  collidesWithBottomWall() {
    // Kollision mit unterer Wand
    return this.y >= this.canvas.height - this.height;
  }
}

class Ball {
  constructor(
    x = 100,
    y = 200,
    radius = 10,
    color = "white",
    player1,
    player2,
    context,
    canvas
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.player1 = player1;
    this.player2 = player2;
    this.canvas = canvas;
    this.context = context;
    this.message = "";
    this.showMessage = false;
  }
  // Geschwindigkeit des Balls
  velocity = 2;
  // Richtung des Balls
  direction = {
    x: 1,
    y: -1,
  };

  update() {
    if (!this.showMessage) {
      this.checkPlayerCollision(this.player1);
      this.checkPlayerCollision(this.player2);
      this.checkWallCollision();
      this.updatePosition();
    }
  }

  draw() {
    this.context.beginPath();
    this.context.fillStyle = this.color;
    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    this.context.closePath();
    this.context.fill();

    if (this.showMessage) {
      const message = this.message;
      this.context.font = "30px Helvetica";
      this.context.fillStyle = "black";
      const textWidth = this.context.measureText(message).width;
      const xPos = (this.canvas.width - textWidth) / 2;
      const lineHeight = 30;
      const yPos = (this.canvas.height + lineHeight) / 2;
      // this.context.fillText(message, xPos, yPos);
      this.context.fillText(message, 215, 215);
    }
  }

  updatePosition() {
    // Neue Position += Richtung * Geschwindigkeit
    this.x += this.direction.x * this.velocity;
    this.y += this.direction.y * this.velocity;
  }

  checkWallCollision() {
    if (this.collidesWithTopWall()) {
      this.direction.y *= -1;
    }
    if (this.collidesWithRightWall()) {
      this.player1.points++;
      this.displayMessage("Player 1 scores!", () => this.resetBall());
    }
    if (this.collidesWithBottomWall()) {
      this.direction.y *= -1;
    }
    if (this.collidesWithLeftWall()) {
      this.player2.points++;
      this.displayMessage("Player 2 scores!", () => this.resetBall());
    }

    if (this.player1.points >= 5 || this.player2.points >= 5) {
      this.showMessage = true;
      this.message =
        this.player1.points >= 5 ? "Player 1 wins!" : "Player 2 wins!";
      this.velocity = 0; // Stoppe den Ball
      // console.log(`Game over: ${this.message}`);
    }
  }

  checkPlayerCollision(player) {
    // Kollision mit der rechten Seite des Spielers
    if (
      this.x - this.radius < player.x + player.width &&
      this.x + this.radius > player.x &&
      this.y + this.radius > player.y &&
      this.y - this.radius < player.y + player.height
    ) {
      // console.log("Kollision mit Spieler!");
      this.direction.x *= -1;
    }
  }

  collidesWithTopWall() {
    // Kollision mit oberer Wand testen:
    // => Oberkante des Balls => ball.y - ball.radius
    // => Position der obere Wand => y <= 0
    return this.y - this.radius <= 0;
  }

  collidesWithRightWall() {
    // Kollision mit rechter Wand
    // => Rechte Kante des Balls => ball.x + radius
    // => Position der rechten Wand => x >= canvas.width
    return this.x + this.radius >= this.canvas.width;
  }

  collidesWithBottomWall() {
    // Kollision mit unterer Wand
    // => Untere Kante des Balls => ball.y + ball.radius
    // => Position der unteren Wand => ball.y >= canvas.height
    return this.y + this.radius >= this.canvas.height;
  }

  collidesWithLeftWall() {
    // Kollision mit linker Wand
    // => Linke Kante des Balls => ball.x - ball.radius
    // => Position der linken Wand => ball.x <= 0
    return this.x - this.radius <= 0;
  }

  displayMessage(message, callback) {
    this.message = message;
    this.showMessage = true;

    // Zeige die Nachricht für 2 Sekunden und setze den Ball zurück
    setTimeout(() => {
      this.showMessage = false;
      callback();
    }, 2000); // 2 Sekunden Verzögerung
  }

  resetBall() {
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height / 2;
    this.direction.x = Math.random() > 0.5 ? 1 : -1;
    this.direction.y = Math.random() > 0.5 ? 1 : -1;
  }
}

export { Settings, Player, Ball };
