// Cyber Fortress Background - Digital fortress castle with towers and defenses
(function(){
  let rafId = null;
  let towers = [];
  let walls = [];
  let dataBeams = [];
  let particles = [];

  class Tower {
    constructor(x, baseY, height, width) {
      this.x = x;
      this.baseY = baseY;
      this.height = height;
      this.width = width;
      this.glowPhase = Math.random() * Math.PI * 2;
      this.scannerAngle = Math.random() * Math.PI * 2;
      this.scannerSpeed = 0.02 + Math.random() * 0.01;
    }

    update(time) {
      this.glow = Math.sin(time * 0.001 + this.glowPhase) * 0.3 + 0.7;
      this.scannerAngle += this.scannerSpeed;
    }

    draw(ctx) {
      const topY = this.baseY - this.height;

      // Tower body (trapezoid)
      const topWidth = this.width * 0.7;
      ctx.fillStyle = `rgba(0, 100, 180, 0.3)`;
      ctx.strokeStyle = `rgba(0, 153, 255, ${this.glow * 0.7})`;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#0099ff';

      ctx.beginPath();
      ctx.moveTo(this.x - this.width/2, this.baseY);
      ctx.lineTo(this.x - topWidth/2, topY);
      ctx.lineTo(this.x + topWidth/2, topY);
      ctx.lineTo(this.x + this.width/2, this.baseY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tower levels (horizontal lines)
      for (let i = 1; i < 4; i++) {
        const y = this.baseY - (this.height * i / 4);
        const levelWidth = this.width - (this.width - topWidth) * (i / 4);
        ctx.beginPath();
        ctx.moveTo(this.x - levelWidth/2, y);
        ctx.lineTo(this.x + levelWidth/2, y);
        ctx.stroke();
      }

      // Top scanner dish
      ctx.strokeStyle = `rgba(255, 100, 0, ${this.glow})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, topY - 20, 15, 0, Math.PI, true);
      ctx.stroke();

      // Rotating scanner beam
      const beamLength = 100;
      const beamX = this.x + Math.cos(this.scannerAngle) * beamLength;
      const beamY = topY - 20 + Math.sin(this.scannerAngle) * beamLength * 0.3;

      const gradient = ctx.createLinearGradient(this.x, topY - 20, beamX, beamY);
      gradient.addColorStop(0, 'rgba(255, 100, 0, 0.6)');
      gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(this.x, topY - 20);
      ctx.lineTo(beamX, beamY);
      ctx.stroke();

      ctx.shadowBlur = 0;
    }
  }

  class FortressWall {
    constructor(x1, y1, x2, y2) {
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;
      this.segments = 8;
      this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update(time) {
      this.pulse = Math.sin(time * 0.002 + this.pulsePhase) * 0.3 + 0.7;
    }

    draw(ctx) {
      // Wall body
      ctx.strokeStyle = `rgba(0, 153, 255, ${0.5 * this.pulse})`;
      ctx.lineWidth = 4;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#0099ff';

      ctx.beginPath();
      ctx.moveTo(this.x1, this.y1);
      ctx.lineTo(this.x2, this.y2);
      ctx.stroke();

      // Battlements (crenellations)
      const dx = this.x2 - this.x1;
      const dy = this.y2 - this.y1;
      const segmentLength = Math.sqrt(dx*dx + dy*dy) / this.segments;
      const angle = Math.atan2(dy, dx);

      ctx.fillStyle = `rgba(0, 153, 255, ${0.4 * this.pulse})`;
      for (let i = 0; i < this.segments; i += 2) {
        const x = this.x1 + Math.cos(angle) * segmentLength * i;
        const y = this.y1 + Math.sin(angle) * segmentLength * i;
        const perpX = Math.cos(angle + Math.PI/2) * 15;
        const perpY = Math.sin(angle + Math.PI/2) * 15;

        ctx.fillRect(x - 5, y + perpY - 20, 10, 15);
      }

      ctx.shadowBlur = 0;
    }
  }

  class DataBeam {
    constructor(fromTower, toTower) {
      this.from = fromTower;
      this.to = toTower;
      this.particles = [];
      this.nextParticle = 0;
    }

    update() {
      this.nextParticle--;
      if (this.nextParticle <= 0) {
        this.particles.push({
          progress: 0,
          life: 1
        });
        this.nextParticle = 30 + Math.random() * 30;
      }

      this.particles = this.particles.filter(p => {
        p.progress += 0.02;
        p.life = 1 - p.progress;
        return p.progress < 1;
      });
    }

    draw(ctx) {
      const fromX = this.from.x;
      const fromY = this.from.baseY - this.from.height;
      const toX = this.to.x;
      const toY = this.to.baseY - this.to.height;

      // Beam line
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Particles
      this.particles.forEach(p => {
        const x = fromX + (toX - fromX) * p.progress;
        const y = fromY + (toY - fromY) * p.progress;

        ctx.fillStyle = `rgba(0, 255, 255, ${p.life})`;
        ctx.shadowBlur = 15 * p.life;
        ctx.shadowColor = '#00ffff';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.shadowBlur = 0;
    }
  }

  class DefenseParticle {
    constructor(canvas) {
      this.reset(canvas);
    }

    reset(canvas) {
      this.x = Math.random() * canvas.width;
      this.y = -10;
      this.speed = 1 + Math.random() * 2;
      this.size = 2 + Math.random() * 3;
      this.opacity = 0.3 + Math.random() * 0.5;
    }

    update(canvas) {
      this.y += this.speed;
      if (this.y > canvas.height) {
        this.reset(canvas);
      }
    }

    draw(ctx) {
      ctx.fillStyle = `rgba(0, 200, 255, ${this.opacity})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00ccff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function init(canvas) {
    towers = [];
    walls = [];
    dataBeams = [];
    particles = [];

    const baseY = canvas.height - 80;
    const centerX = canvas.width / 2;

    // Create fortress towers (castle-like structure)
    const tower1 = new Tower(centerX - 300, baseY, 200, 80);
    const tower2 = new Tower(centerX - 150, baseY, 250, 80);
    const tower3 = new Tower(centerX, baseY, 280, 100); // Main tower (keep)
    const tower4 = new Tower(centerX + 150, baseY, 250, 80);
    const tower5 = new Tower(centerX + 300, baseY, 200, 80);

    towers.push(tower1, tower2, tower3, tower4, tower5);

    // Create connecting walls between towers
    walls.push(new FortressWall(tower1.x + 40, baseY - 150, tower2.x - 40, baseY - 190));
    walls.push(new FortressWall(tower2.x + 40, baseY - 190, tower3.x - 50, baseY - 210));
    walls.push(new FortressWall(tower3.x + 50, baseY - 210, tower4.x - 40, baseY - 190));
    walls.push(new FortressWall(tower4.x + 40, baseY - 190, tower5.x - 40, baseY - 150));

    // Create data beams between towers (encrypted communication)
    dataBeams.push(new DataBeam(tower1, tower3));
    dataBeams.push(new DataBeam(tower3, tower5));
    dataBeams.push(new DataBeam(tower2, tower4));

    // Create falling defense particles
    for (let i = 0; i < 50; i++) {
      particles.push(new DefenseParticle(canvas));
    }
  }

  function animate(canvas, startTime) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = (timestamp) => {
      const time = timestamp - startTime;

      // Clear with dark blue background
      ctx.fillStyle = '#0a0f1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add gradient atmosphere (night sky)
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(10, 20, 40, 0.8)');
      gradient.addColorStop(0.7, 'rgba(15, 30, 50, 0.6)');
      gradient.addColorStop(1, 'rgba(20, 40, 60, 0.4)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw falling defense particles
      particles.forEach(particle => {
        particle.update(canvas);
        particle.draw(ctx);
      });

      // Update and draw walls
      walls.forEach(wall => {
        wall.update(time);
        wall.draw(ctx);
      });

      // Update and draw data beams
      dataBeams.forEach(beam => {
        beam.update();
        beam.draw(ctx);
      });

      // Update and draw towers
      towers.forEach(tower => {
        tower.update(time);
        tower.draw(ctx);
      });

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
  }

  function start(canvas, mode) {
    if (!canvas) return;

    stop();

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    init(canvas);

    const startTime = performance.now();
    animate(canvas, startTime);

    canvas.style.transition = 'opacity 1s ease-in';
    canvas.style.opacity = '1';

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init(canvas);
    };
    window.addEventListener('resize', handleResize);

    canvas._cleanupResize = () => {
      window.removeEventListener('resize', handleResize);
    };
  }

  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    const canvas = document.getElementById('background-canvas');
    if (canvas) {
      if (canvas._cleanupResize) {
        canvas._cleanupResize();
        delete canvas._cleanupResize;
      }
      canvas.style.opacity = '0';
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  window.THEME_BACKGROUND = {
    start,
    stop
  };
})();
