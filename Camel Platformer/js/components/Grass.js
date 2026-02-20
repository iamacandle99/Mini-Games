/**
 * Grass Component
 * Manages grass item creation, rendering, and removal
 */

class Grass {
    constructor(x, y, gameContainer) {
        this.x = x;
        this.y = y;
        this.width = 12;
        this.height = 36;
        this.eaten = false;
        this.element = document.createElement('div');
        this.element.className = 'grass';

        // 5% chance for tall white stalks (1/20)
        const isWhiteStalk = Math.random() > 0.95;

        if (isWhiteStalk) {
            this.element.classList.add('stalk');
            this.element.innerHTML = '<div class="stalk-blade" aria-hidden="true"></div>';
            this.width = 6;
            this.height = 36;
        } else {
            this.element.classList.add('green-grass');
            // create a small cluster of blades for a richer look
            this.element.classList.add('blade-cluster');
            this.element.innerHTML = `
                <div class="blade leaf-left"><span class="leaf"></span></div>
                <div class="blade leaf-center"><span class="leaf"></span></div>
                <div class="blade leaf-right"><span class="leaf"></span></div>
            `;
            this.width = 28;
            this.height = 28;
        }

        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';
        this.element.style.pointerEvents = 'auto';
        gameContainer.appendChild(this.element);
    }

    update(dx) {
        this.x -= dx;
        this.element.style.left = this.x + 'px';
    }

    remove() {
        if (this.element && this.element.parentNode) this.element.parentNode.removeChild(this.element);
        this.eaten = true;
    }
}
