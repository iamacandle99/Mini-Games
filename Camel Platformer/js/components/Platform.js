/**
 * Platform Component
 * Manages platform creation and rendering in the game
 */

class Platform {
    constructor(x, y, width, height, gameContainer) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.element = document.createElement('div');
        this.element.className = 'platform';
        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';
        this.element.style.width = width + 'px';
        this.element.style.height = height + 'px';
        gameContainer.appendChild(this.element);
    }
}
