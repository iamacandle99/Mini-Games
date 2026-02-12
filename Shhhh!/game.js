import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

// --- CONFIGURATION ---
const KEY_COUNT_TARGET = 3;
const HALLWAY_WIDTH = 6;
const HALLWAY_LENGTH = 60;
const ROOM_SIZE = 12;
const KILLER_SPEED = 0.05;
const KILLER_WANDER_SPEED = 0.02;

// --- STATE ---
let keysFound = 0;
let isHiding = false;
let isGameOver = false;
let currentLocker = null;
let killerTargetPos = new THREE.Vector3(0, 1.25, -50);
let killerState = 'hunting'; // 'hunting' or 'wandering'
let lastStateChange = 0;

// --- THREE.JS SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
scene.fog = new THREE.Fog(0x050505, 1, 25);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new PointerLockControls(camera, document.body);

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Increased for visibility
scene.add(ambientLight);

// Flashlight (Player light)
const flashlight = new THREE.SpotLight(0xffffff, 10); // Increased intensity
flashlight.angle = Math.PI / 6;
flashlight.penumbra = 0.3;
flashlight.decay = 1; // Faster decay for creepier feel but brighter near center
flashlight.distance = 30;
flashlight.castShadow = true;
camera.add(flashlight);
flashlight.position.set(0, 0, 0);
flashlight.target.position.set(0, 0, -1);
camera.add(flashlight.target);
scene.add(camera);

// --- WORLD ASSETS ---
const textureLoader = new THREE.TextureLoader();
// Placeholder textures using colors since we don't have local assets
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
const lockerMaterial = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
const keyMaterial = new THREE.MeshStandardMaterial({ color: 0xf1c40f, emissive: 0xf1c40f, emissiveIntensity: 0.5 });

// --- OBJECTS ---
const walls = [];
const interactables = []; // { mesh, type, data }
const lockers = [];
const keys = [];

function createWall(x, z, width, depth, height = 5) {
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geo, wallMaterial);
    mesh.position.set(x, height / 2, z);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add(mesh);
    walls.push(mesh);
}

function createFloorAndCeiling() {
    const floorGeo = new THREE.PlaneGeometry(100, 100);
    const floor = new THREE.Mesh(floorGeo, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const ceil = new THREE.Mesh(floorGeo, ceilingMaterial);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = 5;
    ceil.receiveShadow = true;
    scene.add(ceil);
}

function createLocker(x, z, rotationY) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1, 2.5, 1), lockerMaterial);
    body.position.y = 1.25;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const door = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.4, 0.9), lockerMaterial);
    door.position.set(0.5, 1.25, 0);
    group.add(door);

    group.position.set(x, 0, z);
    group.rotation.y = rotationY;
    scene.add(group);
    
    lockers.push(group);
    interactables.push({ mesh: body, type: 'locker', group: group });
}

function createKey(x, z) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.5), keyMaterial);
    mesh.position.set(x, 0.5, z);
    scene.add(mesh);
    keys.push(mesh);
    interactables.push({ mesh: mesh, type: 'key' });
}

// --- INITIALIZE WORLD ---
createFloorAndCeiling();

// Render one frame immediately to verify it works
renderer.render(scene, camera);

// Main Hallway
createWall(0, -30.5, HALLWAY_WIDTH + 1, 1); // End wall
createWall(-HALLWAY_WIDTH/2, 0, 1, HALLWAY_LENGTH); // Left wall
createWall(HALLWAY_WIDTH/2, 0, 1, HALLWAY_LENGTH); // Right wall

// Rooms
function createRoom(x, z, side) {
    const doorSize = 2;
    // Walls for the room
    createWall(x + (side * ROOM_SIZE / 2), z, ROOM_SIZE, 1); // Back
    createWall(x + (side * ROOM_SIZE), z + ROOM_SIZE / 2, 1, ROOM_SIZE); // Side
    createWall(x + (side * ROOM_SIZE / 2), z + ROOM_SIZE, ROOM_SIZE, 1); // Front
    
    // Classroom furniture (desks)
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const desk = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 1), wallMaterial);
            desk.position.set(x + side * (3 + i * 3), 0.4, z + 3 + j * 3);
            desk.castShadow = true;
            desk.receiveShadow = true;
            scene.add(desk);
        }
    }

    // Internal keys
    createKey(x + (side * (ROOM_SIZE - 2)), z + ROOM_SIZE / 2);
}

createRoom(HALLWAY_WIDTH/2, -10, 1);
createRoom(-HALLWAY_WIDTH/2, -25, -1);
createRoom(HALLWAY_WIDTH/2, -40, 1);

// Add some lockers in hallway
for(let i = 0; i < 5; i++) {
    createLocker(-HALLWAY_WIDTH/2 + 0.6, -5 - i * 8, 0);
    createLocker(HALLWAY_WIDTH/2 - 0.6, -8 - i * 8, Math.PI);
}

// --- PLAYER ---
camera.position.set(0, 1.7, 5);

// --- KILLER ---
const killerGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 4, 8);
const killerMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
const killer = new THREE.Mesh(killerGeometry, killerMaterial);
killer.position.set(0, 1.25, -50);
killer.castShadow = true;
scene.add(killer);

// --- KILLER SHADOW LIGHT ---
// This light is global but moves to cast the killer's shadow
const killerShadowLight = new THREE.DirectionalLight(0xffffff, 0.5);
killerShadowLight.castShadow = true;
killerShadowLight.shadow.mapSize.width = 1024;
killerShadowLight.shadow.mapSize.height = 1024;
scene.add(killerShadowLight);
scene.add(killerShadowLight.target);

// --- CONTROLS & INTERACTION ---
const keysPressed = {};
function handleInput() {
    document.addEventListener('keydown', (e) => {
        keysPressed[e.code] = true;
        if (e.code === 'KeyE') interact();
        if (e.code === 'Escape' && isHiding) exitLocker();
    });
    document.addEventListener('keyup', (e) => keysPressed[e.code] = false);
}
handleInput();

document.addEventListener('click', () => {
    if (!isGameOver && !isHiding) controls.lock();
});

const raycaster = new THREE.Raycaster();
const interactionPrompt = document.getElementById('interaction-prompt');
const hidingOverlay = document.getElementById('hiding-overlay');

function interact() {
    if (isHiding) return;
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(interactables.map(i => i.mesh));
    
    if (intersects.length > 0) {
        const intersection = intersects[0];
        const obj = interactables.find(i => i.mesh === intersection.object);
        if (intersection.distance < 3) {
            if (obj.type === 'locker') {
                enterLocker(obj.group);
            } else if (obj.type === 'key') {
                collectKey(obj.mesh);
            }
        }
    }
}

function enterLocker(lockerGroup) {
    isHiding = true;
    currentLocker = lockerGroup;
    controls.unlock();
    hidingOverlay.classList.remove('hidden');
    
    // Smoothly transition camera inside (or just teleport for simplicity)
    camera.position.copy(lockerGroup.position);
    camera.position.y = 1.7;
    // Look forward relative to locker
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(lockerGroup.quaternion);
    camera.lookAt(camera.position.clone().add(forward));
    
    flashlight.intensity = 0.5;
}

function exitLocker() {
    isHiding = false;
    flashlight.intensity = 5;
    hidingOverlay.classList.add('hidden');
    
    // Step out
    const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(currentLocker.quaternion);
    camera.position.add(direction.multiplyScalar(2));
    currentLocker = null;
    controls.lock();
}

function collectKey(keyMesh) {
    scene.remove(keyMesh);
    // Remove from interactables
    const index = interactables.findIndex(i => i.mesh === keyMesh);
    if (index > -1) interactables.splice(index, 1);
    
    keysFound++;
    document.getElementById('keys-count').innerText = `Keys: ${keysFound}/${KEY_COUNT_TARGET}`;
}

// --- SOUNDS ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let heartbeatOsc = null;

function playHeartbeat(strength) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    gain.gain.setValueAtTime(strength * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(now + 0.1);
}

let lastHeartbeat = 0;
const clock = new THREE.Clock();

// --- GAME LOOP ---
function update() {
    if (isGameOver) return;

    const delta = clock.getDelta();
    const now = Date.now();

    // Heartbeat logic
    const distanceToKiller = killer.position.distanceTo(camera.position);
    const heartbeatRate = Math.max(200, Math.min(1000, distanceToKiller * 50));
    if (now - lastHeartbeat > heartbeatRate) {
        playHeartbeat(Math.max(0.1, 1 - distanceToKiller / 20));
        lastHeartbeat = now;
    }

    // Player Movement
    if (controls.isLocked && !isHiding) {
        const moveSpeed = 5 * delta;
        const prevPos = camera.position.clone();

        if (keysPressed['KeyW']) controls.moveForward(moveSpeed);
        if (keysPressed['KeyS']) controls.moveForward(-moveSpeed);
        if (keysPressed['KeyA']) controls.moveRight(-moveSpeed);
        if (keysPressed['KeyD']) controls.moveRight(moveSpeed);
        
        // Basic wall collision
        camera.position.y = 1.7;
        const xLimit = HALLWAY_WIDTH/2 - 0.7;
        if (Math.abs(camera.position.x) > xLimit) {
            // Check if we are in a room doorway area
            const inRoomArea = (camera.position.z < -5 && camera.position.z > -15) || 
                               (camera.position.z < -20 && camera.position.z > -30) ||
                               (camera.position.z < -35 && camera.position.z > -45);
            
            if (!inRoomArea) camera.position.x = Math.sign(camera.position.x) * xLimit;
        }
        
        if (camera.position.z > 7.5) camera.position.z = 7.5;
        if (camera.position.z < -55) camera.position.z = -55;
    }

    // Interaction Check
    if (!isHiding && controls.isLocked) {
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const intersects = raycaster.intersectObjects(interactables.map(i => i.mesh));
        if (intersects.length > 0 && intersects[0].distance < 3) {
            interactionPrompt.style.display = 'block';
        } else {
            interactionPrompt.style.display = 'none';
        }
    } else {
        interactionPrompt.style.display = 'none';
    }

    // Killer AI & Shadow
    const distToPlayer = killer.position.distanceTo(camera.position);
    
    if (!isHiding) {
        // HUNTING MODE: Move killer towards player
        killerState = 'hunting';
        const dirToPlayer = new THREE.Vector3().subVectors(camera.position, killer.position).normalize();
        killer.position.add(dirToPlayer.multiplyScalar(KILLER_SPEED));
        killer.lookAt(camera.position.x, 1.25, camera.position.z);
    } else {
        // PLAYER IS HIDING: Killer wanders away
        if (killerState !== 'wandering' || now - lastStateChange > 5000) {
            killerState = 'wandering';
            lastStateChange = now;
            // Pick a random point far away in the hallway
            const wanderZ = -Math.random() * HALLWAY_LENGTH;
            killerTargetPos.set(0, 1.25, wanderZ);
        }

        const dirToTarget = new THREE.Vector3().subVectors(killerTargetPos, killer.position).normalize();
        killer.position.add(dirToTarget.multiplyScalar(KILLER_WANDER_SPEED));
        killer.lookAt(killerTargetPos.x, 1.25, killerTargetPos.z);
    }

    // Update killer shadow light position: a directional light pointing at the player through the killer
    const shadowDir = new THREE.Vector3().subVectors(killer.position, camera.position).normalize();
    killerShadowLight.position.copy(killer.position).add(shadowDir.multiplyScalar(-10));
    killerShadowLight.position.y = 1;
    killerShadowLight.target.position.copy(killer.position);
    
    // Flicker shadow light
    killerShadowLight.intensity = (0.5 + Math.random() * 0.5) * (1 - Math.min(1, distToPlayer / 40));

    // Check Catch
    if (distToPlayer < 2.0 && !isHiding) {
        triggerJumpscare();
    }

    // Check Win
    if (keysFound === KEY_COUNT_TARGET && camera.position.z > 6) {
        triggerWin();
    }

    // Pulsing atmosphere
    ambientLight.intensity = 0.1 + Math.sin(Date.now() * 0.002) * 0.05;

    renderer.render(scene, camera);
    requestAnimationFrame(update);
}

function triggerJumpscare() {
    isGameOver = true;
    controls.unlock();
    document.getElementById('jumpscare').classList.remove('hidden');
    // Sound would go here
    setTimeout(() => {
        location.reload();
    }, 3000);
}

function triggerWin() {
    isGameOver = true;
    controls.unlock();
    document.getElementById('win-screen').classList.remove('hidden');
}

// Remove loading screen
document.getElementById('start-button').addEventListener('click', () => {
    document.getElementById('loading').style.display = 'none';
    if (audioCtx.state === 'suspended') audioCtx.resume();
    try {
        controls.lock();
    } catch (e) {
        // Pointer lock failed silently
    }
    update();
});

// update(); // Don't start immediately now

// Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
