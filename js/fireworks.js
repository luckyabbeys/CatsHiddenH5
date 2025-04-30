// 烟花效果实现
class Firework {
  constructor(canvasWidth, canvasHeight) {
      // 扩大烟花生成的水平范围，使用更宽的区域
      this.x = Math.random() * canvasWidth * 1.2 - canvasWidth * 0.1; // 允许在画布两侧稍微超出一点
      this.y = canvasHeight;
      // 允许烟花上升到更高的位置
      this.targetY = Math.random() * canvasHeight * 0.6; // 从0.8改为0.6，让烟花飞得更高
      this.size = 2;
      this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
      this.velocity = {
          x: Math.random() * 8 - 4, // 增加水平速度范围
          y: - (Math.random() * 7 + 6) // 进一步增大 y 方向速度，让烟花上升更快更高
      };
      this.gravity = 0.1;
      this.opacity = 1;
      this.particles = [];
      this.particleCount = 80 + Math.floor(Math.random() * 50); // 增加粒子数量，使烟花更壮观
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
      this.size = Math.random() * 4 + 1; // 增加粒子大小
      this.color = color;
      this.velocity = {
          x: Math.random() * 8 - 4, // 增加水平扩散范围
          y: Math.random() * 8 - 4  // 增加垂直扩散范围
      };
      this.gravity = 0.08; // 减小重力，让粒子飘得更久
      this.opacity = 1;
      this.friction = 0.97; // 增加摩擦系数，让粒子减速更慢
      // 大幅增加粒子寿命
      this.life = 180 + Math.floor(Math.random() * 100); 
  }

  update() {
      this.velocity.y += this.gravity;
      this.velocity.x *= this.friction;
      this.velocity.y *= this.friction;
      this.x += this.velocity.x;
      this.y += this.velocity.y;
      // 进一步减少透明度衰减速度，使粒子更持久
      this.opacity -= 0.0015; 
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
      // 确保画布覆盖整个视口，而不仅仅是容器大小
      this.canvas.width = Math.max(this.container.clientWidth, window.innerWidth);
      this.canvas.height = Math.max(this.container.clientHeight, window.innerHeight);
      // 设置画布样式，确保它能完全覆盖屏幕
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.zIndex = '1000'; // 确保烟花显示在其他元素之上
      this.canvas.style.pointerEvents = 'none'; // 允许点击穿透
      console.log(`Canvas width: ${this.canvas.width}, height: ${this.canvas.height}`);
  }

  start() {
      this.isRunning = true;
      this.animate();
      // 缩短生成间隔至 80ms，更频繁地生成烟花
      this.createFireworksInterval = setInterval(() => {
          if (this.fireworks.length < 300) { // 增加最大烟花数量
              // 增加每次生成的烟花数量
              for (let i = 0; i < 12; i++) { // 从8增加到12
                  this.fireworks.push(new Firework(this.canvas.width, this.canvas.height));
              }
          }
      }, 80); 

      // 设置 30 秒后停止，延长烟花持续时间
      setTimeout(() => {
          this.stop();
      }, 30000);
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
      // 清除画布但添加半透明黑色背景，形成拖尾效果
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