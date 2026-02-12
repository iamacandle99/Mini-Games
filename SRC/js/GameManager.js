/**
 * Game Manager
 * Main game loop and state management
 */

class GameManager {
    constructor() {
        // DOM Elements
        this.gameContainer = document.getElementById('gameContainer');
        this.playerElement = document.getElementById('player');
        this.grassCountDisplay = document.getElementById('grassCount');
        this.levelDisplay = document.getElementById('level');
        this.gameOverScreen = document.getElementById('gameOver');
        this.gameOverText = document.getElementById('gameOverText');
        this.finalScore = document.getElementById('finalScore');

        // Game Objects
        this.player = new Player(this.playerElement, 800, 600);
        this.inputHandler = new InputHandler();
        this.levelManager = new LevelManager(this.gameContainer, () => this.onLevelUp());
        this.collisionDetector = new CollisionDetector();

        // Game State
        this.platforms = [];
        this.grassItems = [];
        this.grassEaten = 0;
        this.gameActive = true;

        // Game Constants
        this.GRAVITY = 0.6;
        this.JUMP_STRENGTH = 12;
        this.MOVE_SPEED = 5;

        this.setupInputHandlers();
        this.initLevel();
        this.start();
    }

    setupInputHandlers() {
        this.inputHandler.onJump(() => {
            if (this.gameActive) {
                this.player.jump(this.JUMP_STRENGTH);
            }
        });
    }

    initLevel() {
        // Clear existing platforms and grass
        this.platforms.forEach(p => p.element.remove());
        this.grassItems.forEach(g => {
            if (!g.eaten) g.remove();
        });
        this.platforms = [];
        this.grassItems = [];

        // Generate and create platforms
        const platformData = this.levelManager.generatePlatforms();
        platformData.forEach(data => {
            this.platforms.push(new Platform(data[0], data[1], data[2], data[3], this.gameContainer));
        });

        // Generate and create grass
        const grassPositions = this.levelManager.generateGrassPositions();
        grassPositions.forEach(pos => {
            if (Math.random() > (1 - 0.8)) { // 80% spawn chance
                this.grassItems.push(new Grass(pos[0], pos[1], this.gameContainer));
            }
        });
    }

    onLevelUp() {
        this.grassEaten = 0;
        this.grassCountDisplay.innerHTML = this.grassEaten;
        this.levelDisplay.innerHTML = this.levelManager.getLevel();
        this.initLevel();
        this.player.resetPosition();
    }

    update() {
        if (!this.gameActive) return;

        // Handle movement input
        if (this.inputHandler.isMovingLeft()) {
            this.player.move('left', this.MOVE_SPEED);
        } else if (this.inputHandler.isMovingRight()) {
            this.player.move('right', this.MOVE_SPEED);
        } else {
            this.player.move('stop', this.MOVE_SPEED);
        }

        // Apply physics
        this.player.applyGravity(this.GRAVITY);
        this.player.update();

        // Check platform collision
        if (this.collisionDetector.isOnPlatform(this.player, this.platforms)) {
            this.player.velY = 0;
            this.player.isJumping = false;
            this.player.y -= 1; // Stick to platform
        }

        // Check if fallen off bottom
        if (this.player.hasHitBottom(600)) {
            this.endGame();
            return;
        }

        // Check grass collision
        const collectedGrass = this.collisionDetector.checkGrassCollision(this.player, this.grassItems);
        collectedGrass.forEach(grass => {
            grass.remove();
            this.grassEaten++;
            this.grassCountDisplay.innerHTML = this.grassEaten;
        });

        // Check level completion
        const uneatenGrass = this.grassItems.filter(g => !g.eaten).length;
        if (uneatenGrass === 0) {
            this.levelManager.levelUp();
            this.onLevelUp();
        }

        requestAnimationFrame(() => this.update());
    }

    endGame() {
        this.gameActive = false;
        this.gameOverScreen.style.display = 'block';
        this.gameOverText.innerHTML = '💀 Game Over! 💀';
        this.finalScore.innerHTML = `You ate ${this.grassEaten} grass bundles on level ${this.levelManager.getLevel()}!`;
    }

    start() {
        this.update();
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GameManager();
});
