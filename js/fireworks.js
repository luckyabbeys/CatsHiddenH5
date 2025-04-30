// 烟花效果实现
class Firework {
  constructor(canvasWidth, canvasHeight) {
      this.x = Math.random() * canvasWidth;
      this.y = canvasHeight;
      this.targetY = Math.random() * canvasHeight * 0.8;
      this.size = 2;
      this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
      this.velocity = {
          x: Math.random() * 6 - 3,
          y: - (Math.random() * 5 + 5) // 增大 y 方向速度
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
      // 进一步增加粒子寿命
      this.life = 120 + Math.floor(Math.random() * 60); 
  }

  update() {
      this.velocity.y += this.gravity;
      this.velocity.x *= this.friction;
      this.velocity.y *= this.friction;
      this.x += this.velocity.x;
      this.y += this.velocity.y;
      // 进一步减少透明度衰减速度
      this.opacity -= 0.002; 
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
      console.log(`Canvas width: ${this.canvas.width}, height: ${this.canvas.height}`);
  }

  start() {
      this.isRunning = true;
      this.animate();
      // 缩短生成间隔至 100ms
      this.createFireworksInterval = setInterval(() => {
          if (this.fireworks.length < 200) {
              // 增加每次生成的烟花数量
              for (let i = 0; i < 8; i++) { 
                  this.fireworks.push(new Firework(this.canvas.width, this.canvas.height));
              }
          }
      }, 100); 

      // 设置 15 秒后停止
      setTimeout(() => {
          this.stop();
      }, 15000);
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
      // 清除画布但不添加黑色背景
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

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
          // 添加粒子尾迹效果
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x - particle.velocity.x, particle.y - particle.velocity.y);
          this.ctx.lineTo(particle.x, particle.y);
          this.ctx.strokeStyle = particle.color;
          this.ctx.globalAlpha = particle.opacity * 0.5;
          this.ctx.stroke();
          this.ctx.globalAlpha = 1;

          particle.draw(this.ctx);
          return particle.update();
      });
  }
}