/**
 * Game Constants
 * Central configuration for all game mechanics
 */

const GAME_CONFIG = {
    CANVAS: {
        WIDTH: 800,
        HEIGHT: 600,
    },
    PHYSICS: {
        GRAVITY: 0.6,
        JUMP_STRENGTH: 12,
        MOVE_SPEED: 5,
    },
    PLAYER: {
        WIDTH: 40,
        HEIGHT: 50,
        START_X: 100,
        START_Y: 0,
    },
    GRASS: {
        WIDTH: 20,
        HEIGHT: 20,
        SPAWN_CHANCE: 0.8, // 80% chance to spawn
    },
};
