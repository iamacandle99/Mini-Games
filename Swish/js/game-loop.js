import * as THREE from 'three';
import { scene, camera, composer, renderer } from './scene.js';
import { world } from './physics.js';
import * as game from './game.js';
import { hoopGroup, bbBody, rimBody, sensor } from './environment.js';

/** GAME LOOP **/
export function startGameLoop() {
    const clock = new THREE.Clock();
    
    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        world.step(1 / 60);

        // Hoop movement logic based on level
        if (game.level >= 2) {
            const speed = game.level * 0.5;
            const range = 4;
            hoopGroup.position.x = Math.sin(Date.now() * 0.002) * range;
            bbBody.position.x = hoopGroup.position.x;
            rimBody.position.x = hoopGroup.position.x;
        }

        // Update balls
        for (let i = game.balls.length - 1; i >= 0; i--) {
            const b = game.balls[i];
            b.mesh.position.copy(b.body.position);
            b.mesh.quaternion.copy(b.body.quaternion);

            // Check for score (Ball passing through sensor while falling)
            const dist = b.mesh.position.distanceTo(new THREE.Vector3(hoopGroup.position.x, 4.9, -4.2));
            if (dist < 0.6 && b.body.velocity.y < 0 && !b.scored) {
                game.handleScore();
                b.scored = true;
            }

            // Cleanup old balls
            if (b.body.position.y < -5) {
                scene.remove(b.mesh);
                world.removeBody(b.body);
                game.removeBall(i);
            }
        }

        composer.render();
    }

    animate();
}

export function setupResizeHandler() {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
