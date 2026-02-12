const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const hDisp = document.getElementById('hydrogen');
const sDisp = document.getElementById('stars');
const cDisp = document.getElementById('coords');
const mDisp = document.getElementById('message');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = { x: 0, y: 0, vx: 0, vy: 0, angle: 0, h: 0, s: 0, thrust: 0.35, friction: 0.985 };

const backStars = [];
for (let i = 0; i < 400; i++) {
    backStars.push({ x: (Math.random() - 0.5) * 4000, y: (Math.random() - 0.5) * 4000, s: Math.random() * 2 + 1 });
}

const derelicts = [];
function addDerelict(x, y) {
    derelicts.push({ x, y, mass: 100 });
}
for (let i = 0; i < 15; i++) { addDerelict((Math.random() - 0.5) * 2000, (Math.random() - 0.5) * 2000); }

const fuelCans = [];
function addFuelCan(x, y) {
    fuelCans.push({ x, y });
}
for (let i = 0; i < 20; i++) { addFuelCan((Math.random() - 0.5) * 3000, (Math.random() - 0.5) * 3000); }

const keys = {};
window.onkeydown = e => keys[e.key] = true;
window.onkeyup = e => keys[e.key] = false;

function showMsg(txt) { mDisp.innerText = txt; mDisp.style.opacity = 1; setTimeout(() => mDisp.style.opacity = 0, 2000); }

function update() {
    if (keys['ArrowUp'] || keys['w']) {
        player.vx += Math.cos(player.angle) * player.thrust;
        player.vy += Math.sin(player.angle) * player.thrust;
    }
    if (keys['ArrowLeft'] || keys['a']) player.angle -= 0.08;
    if (keys['ArrowRight'] || keys['d']) player.angle += 0.08;

    player.vx *= player.friction;
    player.vy *= player.friction;
    player.x += player.vx;
    player.y += player.vy;

    // Collect Fuel Cans
    fuelCans.forEach((fc, i) => {
        const dist = Math.hypot(player.x - fc.x, player.y - fc.y);
        if (dist < 40) {
            player.h += 15;
            fuelCans.splice(i, 1);
            showMsg(" +15 FUEL! ");
        }
    });

    // Salvage Derelicts
    derelicts.forEach((d, i) => {
        const dist = Math.hypot(player.x - d.x, player.y - d.y);
        if (dist < 100) {
            player.h += 0.5;
            d.mass -= 0.5;
            if (d.mass <= 0) {
                player.s++;
                showMsg(" SHIP SALVAGED! ");
                derelicts.splice(i, 1);
                addDerelict(player.x + (Math.random() - 0.5) * 2000, player.y + (Math.random() - 0.5) * 2000);
            }
        }
    });

    // Dynamic Spawning: ensure items are always nearby
    // Remove items that are too far away
    for (let i = fuelCans.length - 1; i >= 0; i--) {
        if (Math.hypot(player.x - fuelCans[i].x, player.y - fuelCans[i].y) > 2000) {
            fuelCans.splice(i, 1);
        }
    }
    for (let i = derelicts.length - 1; i >= 0; i--) {
        if (Math.hypot(player.x - derelicts[i].x, player.y - derelicts[i].y) > 2500) {
            derelicts.splice(i, 1);
        }
    }

    if (fuelCans.length < 25) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 700 + Math.random() * 500;
        addFuelCan(player.x + Math.cos(ang) * dist, player.y + Math.sin(ang) * dist);
    }
    if (derelicts.length < 12) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 900 + Math.random() * 700;
        addDerelict(player.x + Math.cos(ang) * dist, player.y + Math.sin(ang) * dist);
    }

    hDisp.innerText = Math.floor(player.h);
    sDisp.innerText = player.s;
    cDisp.innerText = Math.floor(player.x) + ", " + Math.floor(player.y);
}

function drawDerelict(d, ox, oy) {
    ctx.save();
    ctx.translate(d.x + ox, d.y + oy);
    ctx.rotate(Math.sin(Date.now() / 500) * 0.2);
    ctx.fillStyle = '#f44';
    ctx.fillRect(-15, -8, 30, 16);
    ctx.fillStyle = '#888';
    ctx.fillRect(-25, -12, 10, 24);
    ctx.fillStyle = '#aaa';
    ctx.fillRect(10, -12, 5, 24);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 50);
    g.addColorStop(0, 'rgba(255,100,100,0.3)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

function drawFuelCan(fc, ox, oy) {
    ctx.save();
    ctx.translate(fc.x + ox, fc.y + oy);
    ctx.rotate(Date.now() / 1000);
    ctx.fillStyle = '#ff0';
    ctx.fillRect(-5, -8, 10, 16);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-5, -2, 10, 4); // label
    ctx.restore();
}

function draw() {
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const ox = canvas.width / 2 - player.x;
    const oy = canvas.height / 2 - player.y;

    ctx.fillStyle = "#fff";
    backStars.forEach(s => { 
        // Infinite stars wrapping
        let sx = (s.x + ox) % 2000;
        if (sx < 0) sx += 2000;
        let sy = (s.y + oy) % 2000;
        if (sy < 0) sy += 2000;

        // Draw multiple copies to fill screen if 2000 is too small
        for(let tx = -2000; tx <= 2000; tx += 2000) {
            for(let ty = -2000; ty <= 2000; ty += 2000) {
                const finalX = sx + tx;
                const finalY = sy + ty;
                if (finalX >= 0 && finalX <= canvas.width && finalY >= 0 && finalY <= canvas.height) {
                    ctx.beginPath(); ctx.arc(finalX, finalY, s.s, 0, Math.PI * 2); ctx.fill();
                }
            }
        }
    });

    fuelCans.forEach(fc => drawFuelCan(fc, ox, oy));
    derelicts.forEach(d => drawDerelict(d, ox, oy));

    // Player Ship Sprite
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(player.angle);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(25, 0); ctx.lineTo(-15, -15); ctx.lineTo(-10, 0); ctx.lineTo(-15, 15);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#0af';
    ctx.beginPath(); ctx.arc(5, 0, 5, 0, Math.PI * 2); ctx.fill();
    if (keys['ArrowUp'] || keys['w']) {
        ctx.fillStyle = '#f80';
        ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-35, 5); ctx.lineTo(-35, -5); ctx.fill();
    }
    ctx.restore();
}

function loop() { update(); draw(); requestAnimationFrame(loop); }
loop();
window.onresize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
