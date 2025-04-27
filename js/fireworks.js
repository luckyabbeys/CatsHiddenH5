// 烟花效果实现
class Firework {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = canvasHeight;
        this.targetY = Math.random() * canvasHeight / 2;
        this.size = 2;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.velocity = {
            x: Math.random() * 6 - 3,
            y: -Math.random() * 3 - 3
        };
        this.gravity = 0.1;
        this.opacity = 1;
        this.particles = [];
        this.particleCount = 50 + Math.floor(Math.random() * 30);
    }

    update() {
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        if (this.y <= this.targetY) {
            this.explode();
            return false;
        }
        return true;
    }

    explode() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new Particle(this.x, this.y, this.color));
        }
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.color = color;
        this.velocity = {
            x: Math.random() * 6 - 3,
            y: Math.random() * 6 - 3
        };
        this.gravity = 0.1;
        this.opacity = 1;
        this.friction = 0.95;
        this.life = 40 + Math.floor(Math.random() * 20);
    }

    update() {
        this.velocity.y += this.gravity;
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.opacity -= 0.02;
        this.life--;

        return this.life > 0 && this.opacity > 0;
    }

    draw(ctx) {
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class FireworksDisplay {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.fireworks = [];
        this.particles = [];
        this.isRunning = false;
        this.animationId = null;

        this.container.appendChild(this.canvas);
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
    }

    start() {
        this.isRunning = true;
        this.animate();
        this.createFireworksInterval = setInterval(() => {
            if (this.fireworks.length < 5) {
                this.fireworks.push(new Firework(this.canvas.width, this.canvas.height));
            }
        }, 800);
    }

    stop() {
        this.isRunning = false;
        clearInterval(this.createFireworksInterval);
        cancelAnimationFrame(this.animationId);
        this.fireworks = [];
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    animate() {
        if (!this.isRunning) return;

        this.animationId = requestAnimationFrame(() => this.animate());
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 更新和绘制烟花
        this.fireworks = this.fireworks.filter(firework => {
            firework.draw(this.ctx);
            const isAlive = firework.update();
            if (!isAlive) {
                this.particles.push(...firework.particles);
            }
            return isAlive;
        });

        // 更新和绘制粒子
        this.particles = this.particles.filter(particle => {
            particle.draw(this.ctx);
            return particle.update();
        });
    }
}