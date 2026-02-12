/**
 * Collision Detection Utility
 * Handles all collision checks for the game
 */

class CollisionDetector {
    static isOnPlatform(player, platforms) {
        for (let platform of platforms) {
            if (
                player.y + player.height >= platform.y &&
                player.y + player.height <= platform.y + platform.height + 5 &&
                player.x + player.width > platform.x &&
                player.x < platform.x + platform.width &&
                player.velY >= 0
            ) {
                return true;
            }
        }
        return false;
    }

    static checkGrassCollision(player, grassItems) {
        const collectedGrass = [];

        for (let grass of grassItems) {
            if (!grass.eaten) {
                if (
                    player.x < grass.x + grass.width &&
                    player.x + player.width > grass.x &&
                    player.y < grass.y + grass.height &&
                    player.y + player.height > grass.y
                ) {
                    collectedGrass.push(grass);
                }
            }
        }

        return collectedGrass;
    }
}
