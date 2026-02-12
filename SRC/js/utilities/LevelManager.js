/**
 * Level Manager Utility
 * Handles level initialization and level progression
 */

class LevelManager {
    constructor(gameContainer, onLevelUp) {
        this.gameContainer = gameContainer;
        this.onLevelUp = onLevelUp;
        this.level = 1;
    }

    generatePlatforms() {
        const platformData = [
            [0, 550, 800, 50], // Ground
            [600, 480, 150, 20],
            [100, 420, 150, 20],
            [450, 360, 150, 20],
            [200, 300, 150, 20],
            [550, 240, 150, 20],
            [300, 180, 150, 20],
            [50, 120, 150, 20],
        ];

        // Add extra platforms for higher levels
        if (this.level > 1) {
            platformData.push([400, 400, 100, 20]);
        }
        if (this.level > 2) {
            platformData.push([150, 250, 100, 20]);
            platformData.push([600, 350, 100, 20]);
        }

        return platformData;
    }

    generateGrassPositions() {
        const grassPositions = [
            [650, 450],
            [150, 390],
            [500, 330],
            [250, 270],
            [600, 210],
            [350, 150],
            [100, 90],
            [700, 520],
        ];

        // Add many more grass for a huge field effect
        for (let x = 0; x < 800; x += 35) {
            for (let y = 100; y < 550; y += 40) {
                // Add variation and randomness
                const offsetX = (Math.random() - 0.5) * 20;
                const offsetY = (Math.random() - 0.5) * 15;
                grassPositions.push([x + offsetX, y + offsetY]);
            }
        }

        // Add extra grass for higher levels
        if (this.level > 1) {
            grassPositions.push([450, 370]);
            grassPositions.push([550, 350]);
        }
        if (this.level > 2) {
            grassPositions.push([200, 220]);
            grassPositions.push([650, 300]);
        }

        return grassPositions;
    }

    levelUp() {
        this.level++;
        if (this.onLevelUp) {
            this.onLevelUp(this.level);
        }
    }

    getLevel() {
        return this.level;
    }
}
