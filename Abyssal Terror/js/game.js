let creatures = [];
let pickups = [];
let particles = [];

function showEscapeOverlay() {
    document.getElementById('escape-overlay').style.display = 'flex';
}

function init() {
    resize();
    creatures = [];
    pickups = [];
    particles = [];

    for (let i = 0; i < TOTAL_KEYS; i++) {
        pickups.push(new Key(
            Math.random() * (WORLD_WIDTH - 200) + 100,
            Math.random() * (WORLD_HEIGHT - 200) + 100
        ));
    }

    for (let i = 0; i < 40; i++) {
        let cx = Math.random() * WORLD_WIDTH;
        let cy = Math.random() * WORLD_HEIGHT;
        if (Math.hypot(cx - player.x, cy - player.y) > 500) {
            creatures.push(new Creature(cx, cy));
        }
    }

    for (let i = 0; i < 200; i++) {
        particles.push({
            x: Math.random() * WORLD_WIDTH,
            y: Math.random() * WORLD_HEIGHT,
            size: Math.random() * 2,
            speed: 0.2 + Math.random() * 0.5
        });
    }
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);

window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

startBtn.addEventListener('click', () => {
    menuEl.style.display = 'none';
    gameStarted = true;
    init();
    requestAnimationFrame(update);
});

function update() {
    if (!gameStarted || gameOver) return;

    if (keys['Space']) {
        if (!pulseActive) {
            pulseActive = true;
            pulseRadius = 0;
        }
    }

    if (pulseActive) {
        pulseRadius += 15;
        if (pulseRadius > 1000) pulseActive = false;
    }

    if (keys['ArrowUp'] || keys['KeyW']) player.speed += player.acceleration;
    if (keys['ArrowDown'] || keys['KeyS']) player.speed -= player.acceleration;
    if (keys['ArrowLeft'] || keys['KeyA']) player.angle -= player.rotationSpeed;
    if (keys['ArrowRight'] || keys['KeyD']) player.angle += player.rotationSpeed;

    player.speed *= (1 - player.friction);
    player.speed = Math.max(-player.maxSpeed/2, Math.min(player.maxSpeed, player.speed));

    player.x += Math.cos(player.angle) * player.speed;
    player.y += Math.sin(player.angle) * player.speed;

    player.x = Math.max(0, Math.min(WORLD_WIDTH, player.x));
    player.y = Math.max(0, Math.min(WORLD_HEIGHT, player.y));

    creatures.forEach(c => c.update());

    particles.forEach(p => {
        p.y += p.speed;
        if (p.y > WORLD_HEIGHT) p.y = 0;
    });

    pickups = pickups.filter(k => {
        const d = Math.hypot(player.x - k.x, player.y - k.y);
        if (d < player.radius + k.radius) {
            keysFound++;
            keysEl.innerText = keysFound;
            if (keysFound === TOTAL_KEYS) {
                statusEl.innerText = 'THE GATE IS OPEN! ESCAPE TO THE SURFACE!';
            }
            return false;
        }
        return true;
    });

    if (keysFound === TOTAL_KEYS && player.y < 50) {
        gameOver = true;
        showEscapeOverlay();
        return;
    }

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const camX = canvas.width / 2 - player.x;
    const camY = canvas.height / 2 - player.y;

    ctx.save();
    ctx.translate(camX, camY);
    ctx.fillStyle = '#000205';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    if (pulseActive) {
        ctx.strokeStyle = `rgba(0, 150, 255, ${1 - pulseRadius / 1000})`;
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(player.x, player.y, pulseRadius, 0, Math.PI * 2); ctx.stroke();
    }

    ctx.fillStyle = 'rgba(200, 200, 255, 0.1)';
    particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    });

    pickups.forEach(k => {
        const dist = Math.hypot(player.x - k.x, player.y - k.y);
        if (dist < 350 || (pulseActive && Math.abs(dist - pulseRadius) < 50)) {
            k.draw();
        }
    });

    creatures.forEach(c => {
        const dist = Math.hypot(player.x - c.x, player.y - c.y);
        if (dist < 350 || (pulseActive && Math.abs(dist - pulseRadius) < 100)) {
            c.active = true;
            c.draw();
        } else {
            c.active = false;
        }
    });

    // Draw Player
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    ctx.fillStyle = '#1c2e3d';
    ctx.beginPath();
    ctx.moveTo(40, 0); ctx.quadraticCurveTo(0, -20, -40, -5); ctx.quadraticCurveTo(-50, 0, -40, 5); ctx.quadraticCurveTo(0, 20, 40, 0); 
    ctx.fill();
    ctx.beginPath(); ctx.moveTo(-5, -12); ctx.lineTo(-25, -28); ctx.lineTo(-15, -5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-60, -20); ctx.lineTo(-50, 0); ctx.lineTo(-60, 20); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1;
    for(let i=0; i<3; i++) { ctx.beginPath(); ctx.moveTo(10 + i*4, -8); ctx.lineTo(8 + i*4, 8); ctx.stroke(); }
    ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(30, -4, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.restore();

    const darkness = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 80,
        canvas.width / 2, canvas.height / 2, 350
    );
    darkness.addColorStop(0, 'rgba(0,0,0,0)');
    darkness.addColorStop(0.4, 'rgba(0,2,5,0.7)');
    darkness.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = darkness;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!pulseActive) {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.font = '12px monospace';
        ctx.fillText('SPACE: SONAR', 20, canvas.height - 20);
    }
    depthEl.innerText = Math.floor(player.y);
}
