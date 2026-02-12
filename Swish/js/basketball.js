import * as THREE from 'three';
import * as CANNON from 'cannon';
import { scene } from './scene.js';
import { world, ballMat } from './physics.js';

/** BASKETBALL LOGIC **/
function createBasketballTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // Base color
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(0, 0, 256, 128);
    
    // Lines
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 4;
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(0, 64);
    ctx.lineTo(256, 64);
    ctx.stroke();
    
    // Vertical lines (equator-like)
    ctx.beginPath();
    ctx.moveTo(64, 0);
    ctx.lineTo(64, 128);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(192, 0);
    ctx.lineTo(192, 128);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
}

export function createBall() {
    const radius = 0.4;
    const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 32, 32),
        new THREE.MeshStandardMaterial({ 
            map: createBasketballTexture(),
            roughness: 0.8,
            metalness: 0.1
        })
    );
    mesh.castShadow = true;
    scene.add(mesh);

    const body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Sphere(radius),
        material: ballMat
    });
    body.position.set(0, 1, 8);
    world.addBody(body);

    return { mesh, body, scored: false };
}
