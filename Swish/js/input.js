import * as CANNON from 'cannon';
import * as game from './game.js';
import { createBall } from './basketball.js';

/** INPUT HANDLING **/
export function setupInputHandling() {
    window.addEventListener('mousedown', (e) => {
        game.setIsAiming(true);
        game.setStartY(e.clientY);
        document.getElementById('power-bar-container').style.display = 'block';
    });

    window.addEventListener('mousemove', (e) => {
        if (!game.isAiming) return;
        const diff = e.clientY - game.startY;
        const newPower = Math.min(Math.max(diff / 20, 0), 25);
        game.setPower(newPower);
        document.getElementById('power-bar').style.width = (newPower / 25) * 100 + '%';
    });

    window.addEventListener('mouseup', () => {
        if (!game.isAiming) return;
        game.setIsAiming(false);
        document.getElementById('power-bar-container').style.display = 'none';
        
        if (game.power > 5) {
            const b = createBall();
            // Balanced physics for an easier "rainbow" arc
            // Lower multipliers to make it more manageable
            const upForce = game.power * 0.7;    
            const forwardForce = -game.power * 0.45; 
            const force = new CANNON.Vec3(0, upForce, forwardForce);
            
            b.body.applyImpulse(force, b.body.position);
            game.addBall(b);
        }
        game.setPower(0);
    });
}
