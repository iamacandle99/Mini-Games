import * as THREE from 'three';
import * as CANNON from 'cannon';
import { scene } from './scene.js';
import { world, groundMat, ballMat } from './physics.js';

/** ENVIRONMENT **/
// Floor
export const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({ color: 0x888888 }));
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const floorBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane(), material: groundMat });
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(floorBody);

const themes = [
    { name: 'Court', bg: 0x446688, floor: '#8b4513' },
    { name: 'Desert', bg: 0xffcc88, floor: '#edc9af' },
    { name: 'Antarctica', bg: 0xe0ffff, floor: '#ffffff' },
    { name: 'City', bg: 0x222222, floor: '#333333' },
    { name: 'Rainforest', bg: 0x004400, floor: '#1a3300' },
    { name: 'Space', bg: 0x000005, floor: '#111111' },
    { name: 'Candyland', bg: 0xffc0cb, floor: '#ff69b4' }
];

function createFloorTexture(theme) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (theme.name === 'Court') {
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = '#5d2e0c';
        ctx.lineWidth = 4;
        for (let i = 0; i < 512; i += 32) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 512);
            ctx.stroke();
        }
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(0,0, 512, 512);
    } else if (theme.name === 'Desert') {
        ctx.fillStyle = '#edc9af';
        ctx.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 2000; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? '#d2b48c' : '#c2a278';
            ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
        }
    } else if (theme.name === 'Antarctica') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = '#d0f0ff';
        for (let i = 0; i < 100; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 40, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (theme.name === 'City') {
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 10;
        for (let i = 0; i < 512; i += 128) {
            ctx.strokeRect(i, i, 128, 128);
        }
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(250, 0, 12, 512);
    } else if (theme.name === 'Rainforest') {
        ctx.fillStyle = '#1a3300';
        ctx.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 300; i++) {
            ctx.fillStyle = `rgb(0, ${Math.floor(Math.random() * 100 + 40)}, 0)`;
            ctx.beginPath();
            ctx.ellipse(Math.random() * 512, Math.random() * 512, 10, 20, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (theme.name === 'Space') {
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 300; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (theme.name === 'Candyland') {
        ctx.fillStyle = '#ff69b4';
        ctx.fillRect(0, 0, 512, 512);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 30;
        for (let i = -512; i < 512; i += 100) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + 512, 512);
            ctx.stroke();
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    return texture;
}

export function updateEnvironment(level) {
    const themeIndex = (level - 1) % themes.length;
    const theme = themes[themeIndex];
    
    const color = new THREE.Color(theme.bg);
    scene.background = color;
    if (scene.fog) scene.fog.color = color;
    
    // Dispose old texture if exists
    if (floor.material.map) floor.material.map.dispose();
    
    floor.material.map = createFloorTexture(theme);
    floor.material.needsUpdate = true;
}

// The Hoop Group
export const hoopGroup = new THREE.Group();
scene.add(hoopGroup);

// Pole
const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 10, 8), new THREE.MeshStandardMaterial({ color: 0x333333 }));
pole.position.set(0, 5, -5.2);
hoopGroup.add(pole);

// Backboard
const backboard = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 0.1), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
backboard.position.set(0, 6, -5);
backboard.castShadow = true;
hoopGroup.add(backboard);

// Shooting Square on Backboard
const shootingSquare = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.2, 0.05), 
    new THREE.MeshStandardMaterial({ color: 0xff3300 })
);
shootingSquare.position.set(0, 5.8, -4.95);
hoopGroup.add(shootingSquare);

// Inner part of shooting square to make it look like a border
const innerSquare = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 1.0, 0.06), 
    new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })
);
innerSquare.position.set(0, 5.8, -4.94);
hoopGroup.add(innerSquare);

export const bbBody = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(2, 1.5, 0.1)) });
bbBody.position.set(0, 6, -5);
world.addBody(bbBody);

// Rim
const rim = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 16, 32), new THREE.MeshStandardMaterial({ color: 0xff4400 }));
rim.rotation.x = Math.PI / 2;
rim.position.set(0, 5.2, -4.2); // Moved up slightly for better look
hoopGroup.add(rim);

// Net (Simple representation)
const netGeom = new THREE.CylinderGeometry(0.7, 0.5, 1.5, 16, 8, true);
const netMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    wireframe: true, 
    transparent: true, 
    opacity: 0.5,
    side: THREE.DoubleSide 
});
const net = new THREE.Mesh(netGeom, netMat);
net.position.set(0, 4.45, -4.2);
hoopGroup.add(net);

// Physics for Rim (Simple cylinder approximation for collisions)
// Reduced collision radius slightly (0.68) vs visual radius (0.7) to "guide" the ball in
export const rimBody = new CANNON.Body({ mass: 0, shape: new CANNON.Cylinder(0.68, 0.68, 0.1, 16) });
rimBody.position.set(0, 5.2, -4.2);
world.addBody(rimBody);

// Score Sensor (Transparent box inside the rim)
// Made sensor slightly taller to catch the ball easier
const sensorGeom = new THREE.BoxGeometry(0.9, 0.4, 0.9);
const sensorMat = new THREE.MeshBasicMaterial({ visible: false });
export const sensor = new THREE.Mesh(sensorGeom, sensorMat);
sensor.position.set(0, 5.2, -4.2);
hoopGroup.add(sensor);
