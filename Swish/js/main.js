// Import all modules
import './scene.js';
import './physics.js';
import { updateEnvironment } from './environment.js';
import './basketball.js';
import { setupInputHandling } from './input.js';
import { startGameLoop, setupResizeHandler } from './game-loop.js';

// Initialize the game
updateEnvironment(1);
setupInputHandling();
startGameLoop();
setupResizeHandler();
