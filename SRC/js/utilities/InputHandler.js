/**
 * Input Handler Utility
 * Manages keyboard input for player movement and jumping
 */

class InputHandler {
    constructor() {
        this.keys = {};
        this.jumpCallback = null;
        this.moveCallback = null;

        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(e) {
        this.keys[e.key] = true;

        // Handle jump
        if (e.key === ' ') {
            e.preventDefault();
            if (this.jumpCallback) {
                this.jumpCallback();
            }
        }
    }

    handleKeyUp(e) {
        this.keys[e.key] = false;
    }

    isMovingLeft() {
        return this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A'];
    }

    isMovingRight() {
        return this.keys['ArrowRight'] || this.keys['d'] || this.keys['D'];
    }

    onJump(callback) {
        this.jumpCallback = callback;
    }

    onMove(callback) {
        this.moveCallback = callback;
    }
}
