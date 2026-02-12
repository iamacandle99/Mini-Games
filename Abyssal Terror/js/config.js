// Game Configuration and Globals
const WORLD_WIDTH = 5000;
const WORLD_HEIGHT = 5000;
const TOTAL_KEYS = 3;

const player = {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,
    angle: 0,
    speed: 0,
    maxSpeed: 5,
    acceleration: 0.1,
    friction: 0.02,
    radius: 30,
    rotationSpeed: 0.05
};

const keys = {};
let gameStarted = false;
let gameOver = false;
let keysFound = 0;
let pulseRadius = 0;
let pulseActive = false;
let lastHeartbeat = 0;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const depthEl = document.getElementById('depth');
const keysEl = document.getElementById('keys');
const jumpEl = document.getElementById('jumpscare');
const menuEl = document.getElementById('menu');
const statusEl = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
