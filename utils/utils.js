// I M P O R T   O F   F U N C T I O N S
import { Settings, Player, Ball } from "../classes/class.js";

// C O D E
// General functions

const connectAndStyleBody = () => {
  const body = document.querySelector("body");
  Object.assign(body.style, {
    margin: "0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    height: "100vh",
  });
  return body;
};

const createCanvasAndContext = (
  body,
  width = Settings.canvas.width,
  height = Settings.canvas.height
) => {
  const canvas = body.querySelector("#my-canvas");
  Object.assign(canvas, { width, height });
  const context = canvas.getContext("2d");
  return { canvas, context };
};

const drawPlayField = (context, canvas) => {
  // Draw the field
  context.fillStyle = "grey";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the border
  context.setLineDash([]);
  context.strokeStyle = "white";
  context.lineWidth = 10;
  context.strokeRect(0, 0, canvas.width, canvas.height);

  // Draw the middle line
  context.beginPath();
  context.setLineDash([30, 20]);
  context.moveTo(canvas.width / 2, 0);
  context.lineTo(canvas.width / 2, canvas.height);
  context.stroke();
  context.closePath();
};

const drawPlayers = (canvas) => {
  // Spieler 1 (links)
  const player1 = new Player(
    true,
    Settings.player.distance,
    Settings.player.width,
    Settings.player.height,
    Settings.player.color,
    canvas
  );

  // Spieler 2 (rechts)
  const player2 = new Player(
    false,
    Settings.player.distance,
    Settings.player.width,
    Settings.player.height,
    Settings.player.color,
    canvas
  );

  return { player1, player2 };
};

const movePlayers = (player1, player2) => {
  document.addEventListener("keydown", (event) => {
    if (event.code === "ArrowUp") {
      // player2 nach oben bewegen
      player2.direction.y = -1;
    } else if (event.code === "ArrowDown") {
      // player2 nach unten bewegen
      player2.direction.y = 1;
    } else if (event.code === "KeyW") {
      // player1 nach oben bewegen
      player1.direction.y = -1;
    } else if (event.code === "KeyS") {
      // player1 nach unten bewegen
      player1.direction.y = 1;
    }
  });

  document.addEventListener("keyup", (event) => {
    if (event.code === "ArrowUp" || event.code === "ArrowDown") {
      player2.direction.y = 0;
    } else if (event.code === "KeyW" || event.code === "KeyS") {
      player1.direction.y = 0;
    }
  });
};

const drawBall = (player1, player2, context, canvas) => {
  const ball = new Ball(
    100,
    200,
    10,
    "white",
    player1,
    player2,
    context,
    canvas
  );
  return ball;
};

const drawStandings = (context, canvas, player1, player2) => {
  context.font = "40px Helvetica";
  context.fillStyle = "white";
  context.textAlign = "center";
  context.fillText(player1.points, 150, 50);
  context.fillText(player2.points, canvas.width - 150, 50);
};

// ============================

// Sumup functions
const gameInitialization = () => {
  // Initialisation of the Game
  const body = connectAndStyleBody();
  const { canvas, context } = createCanvasAndContext(body);
  const { player1, player2 } = drawPlayers(canvas);
  const ball = drawBall(player1, player2, context, canvas);
  drawGameScene(context, canvas, player1, player2, ball);
  return { context, canvas, player1, player2, ball };
};

const drawGameScene = (context, canvas, player1, player2, ball) => {
  // Canvas leeren (alle Zeichnungen entfernen)
  context.clearRect(0, 0, canvas.width, canvas.height);
  // Draw the playing field with all elements
  drawPlayField(context, canvas);
  ball.draw();
  player1.draw();
  player2.draw();
  drawStandings(context, canvas, player1, player2);
};

const updateGameScene = (player1, player2, ball) => {
  // Update positions
  ball.update();
  player1.update();
  player2.update();
};

// ============================

// Update functions
const animate = (context, canvas, player1, player2, ball) => {
  drawGameScene(context, canvas, player1, player2, ball);
  updateGameScene(player1, player2, ball);
  requestAnimationFrame(() => animate(context, canvas, player1, player2, ball));
};

export { gameInitialization, movePlayers, animate };
