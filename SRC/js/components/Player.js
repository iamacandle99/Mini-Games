/**
 * Player Component
 * Manages player state, movement, and physics
 */

class Player {
    constructor(playerElement, gameWidth, gameHeight) {
        this.element = playerElement;
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        // Position
        this.x = 100;
        this.y = 0;

        // Velocity
        this.velX = 0;
        this.velY = 0;

        // Dimensions
        this.width = 40;
        this.height = 50;

        // States
        this.isJumping = false;

        this.updateDisplay();
        this.updateCamelEmoji();
    }

    updateDisplay() {
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        this.updateCamelEmoji();
    }

    updateCamelEmoji() {
        // Replace emoji with inline SVG artwork for a more realistic look.
        if (this.isJumping || this.velY < 0) {
            this.setSVG(Player.camelJumpSVG);
        } else {
            this.setSVG(Player.camelWalkSVG);
        }
    }

    jump(jumpStrength) {
        if (!this.isJumping) {
            this.velY = -jumpStrength;
            this.isJumping = true;
        }
    }

    move(direction, moveSpeed) {
        if (direction === 'left') {
            this.velX = -moveSpeed;
        } else if (direction === 'right') {
            this.velX = moveSpeed;
        } else {
            this.velX = 0;
        }
    }

    applyGravity(gravity) {
        this.velY += gravity;
    }

    update() {
        this.x += this.velX;
        this.y += this.velY;

        // Boundary collision
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > this.gameWidth) this.x = this.gameWidth - this.width;

        this.updateDisplay();
    }

    resetPosition() {
        this.x = 100;
        this.y = 0;
        this.velY = 0;
        this.isJumping = false;
        this.updateDisplay();
    }

    hasHitBottom(gameHeight) {
        return this.y > gameHeight;
    }

        setSVG(svgString) {
                this.element.innerHTML = svgString;
        }
}

// Static SVG assets (simple stylized camel silhouettes)
Player.camelWalkSVG = `
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g transform="translate(0,6)">
        <ellipse class="camel-shadow" cx="60" cy="98" rx="28" ry="8" fill="#000" opacity="0.12"/>
        <path d="M18 76c6-6 14-6 22-6 8 0 18 2 26-2 12-6 18-20 34-20s18 12 18 20v4h-8c-4-10-12-12-18-12s-20 6-28 6-18-2-28 4c-8 5-26 8-36 6z" fill="#D9A66A"/>
        <path d="M20 60c0-12 8-22 20-22s18 6 28 6 20-4 28 2" stroke="#000" stroke-opacity="0.06" fill="none"/>
        <circle cx="34" cy="58" r="2.4" fill="#3a2b1a"/>
    </g>
</svg>
`;

Player.camelJumpSVG = `
<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g transform="translate(0,0)">
        <ellipse class="camel-shadow" cx="70" cy="102" rx="20" ry="6" fill="#000" opacity="0.12"/>
        <path d="M18 62c6-8 14-10 24-10 8 0 18 2 26-2 12-6 18-18 34-18s18 10 18 18v6h-8c-4-10-12-12-18-12s-20 6-28 6-18-2-28 4c-8 6-26 8-36 8z" fill="#D9A66A"/>
        <path d="M34 44c6-6 14-6 22-6" stroke="#000" stroke-opacity="0.06" fill="none"/>
        <circle cx="44" cy="46" r="2.6" fill="#3a2b1a"/>
    </g>
</svg>
`;
