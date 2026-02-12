import { updateEnvironment } from './environment.js';

/** GAME STATE **/
export let level = 1;
export let score = 0;
export let target = 3;
export let isAiming = false;
export let startY = 0;
export let power = 0;
export const balls = [];

// State setters
export function setLevel(val) { level = val; }
export function setScore(val) { score = val; }
export function setTarget(val) { target = val; }
export function setIsAiming(val) { isAiming = val; }
export function setStartY(val) { startY = val; }
export function setPower(val) { power = val; }
export function addBall(ball) { balls.push(ball); }
export function removeBall(index) { balls.splice(index, 1); }
export function incrementScore() { score++; }
export function getGameState() { return { level, score, target, isAiming, startY, power, balls }; }

export function levelUp() {
    level++;
    score = 0;
    target += 2;
    document.getElementById('level-val').innerText = level;
    document.getElementById('score-val').innerText = score;
    document.getElementById('target-val').innerText = target;
    
    updateEnvironment(level);
    
    const msg = document.getElementById('msg');
    msg.innerText = `LEVEL ${level}: ${getEnvironmentName(level)}`;
    msg.style.display = 'block';
    setTimeout(() => {
        msg.innerText = "SWISH!";
        msg.style.display = 'none';
    }, 2000);
}

function getEnvironmentName(level) {
    const names = ["Court", "Desert", "Antarctica", "City", "Rainforest", "Space", "Candyland"];
    return names[(level - 1) % names.length];
}

export function handleScore() {
    score++;
    document.getElementById('score-val').innerText = score;
    
    const msg = document.getElementById('msg');
    msg.style.display = 'block';
    setTimeout(() => msg.style.display = 'none', 1000);

    if (score >= target) {
        levelUp();
    }
}
