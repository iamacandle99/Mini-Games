class Creature {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 1 + Math.random() * 1.5;
        this.radius = 40;
        this.isLunging = false;
        this.lungeTimer = 0;
        this.active = false; 
    }

    update() {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 600) {
            this.active = true;
            const targetAngle = Math.atan2(dy, dx);
            
            let angleDiff = targetAngle - this.angle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            this.angle += angleDiff * 0.03;
            
            if (dist < 300 && Math.random() < 0.005 && !this.isLunging) {
                this.isLunging = true;
                this.lungeTimer = 40;
                this.speed = 14;
            }

            if (Date.now() - lastHeartbeat > dist * 2) {
                playHeartbeat();
                lastHeartbeat = Date.now();
            }
        } else {
            this.active = false;
        }

        if (this.isLunging) {
            this.lungeTimer--;
            if (this.lungeTimer <= 0) {
                this.isLunging = false;
                this.speed = 1.5;
            }
        }

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        if (dist < player.radius + this.radius) {
            triggerJumpscare();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(40, 0); ctx.stroke();
        for(let i = -20; i < 30; i += 10) {
            ctx.beginPath(); ctx.moveTo(i, -15); ctx.lineTo(i, 15); ctx.stroke();
        }
        ctx.fillStyle = '#ff0000';
        ctx.beginPath(); ctx.arc(35, -5, 3, 0, Math.PI * 2); ctx.arc(35, 5, 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }
}

class Key {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        const gradient = ctx.createRadialGradient(0, 0, 2, 0, 0, 20);
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.5, '#ffd700');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(0, -5, 5, 0, Math.PI * 2); ctx.moveTo(0, 0); ctx.lineTo(0, 10); ctx.lineTo(5, 10); ctx.moveTo(0, 7); ctx.lineTo(4, 7); ctx.stroke();
        ctx.restore();
    }
}
