// I M P O R T   O F   F U N C T I O N S
// import { Player } from "./classes/class.js";
import { gameInitialization, movePlayers, animate } from "./utils/utils.js";

// C O D E
const pong = () => {
  // Initialisation of the Game
  const { context, canvas, player1, player2, ball } = gameInitialization();

  // Event Listener Management
  movePlayers(player1, player2);

  // Update the Game
  animate(context, canvas, player1, player2, ball);
};
pong();
