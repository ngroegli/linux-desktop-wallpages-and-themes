// Cyber Grid - Hexagonal Security Grid with Energy Shields
(function(){
  let rafId = null;
  let hexGrid = [];
  let shields = [];
  let scanBeams = [];
  let circuits = [];
  let particles = [];
  let glyphs = [];

  // Color scheme: Military cyberspace fortress
  const COLORS = {
    bg: '#0a0a0f',
    steel: '#2a2d35',
    gunmetal: '#3d4451',
    cyan: '#00d9ff',
    cyanDark: '#0088aa',
    crimson: '#ff0044',
    silver: '#c0c5ce'
  };

  // Hexagonal shield tile
  class HexShield {
    constructor(canvas, x, y, size) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.opacity = 0.1 + Math.random() * 0.2;
      this.pulseOffset = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.0003 + Math.random() * 0.0002;
      this.isActive = Math.random() > 0.7;
    }

    update(time) {
      this.pulse = Math.sin(time * this.pulseSpeed + this.pulseOffset);
    }

    draw(ctx, time) {
      if (!this.isActive && Math.random() > 0.9995) {
        this.isActive = true;
      } else if (this.isActive && Math.random() > 0.997) {
        this.isActive = false;
      }

      const alpha = this.isActive ?
        this.opacity * (0.7 + this.pulse * 0.3) :
        this.opacity * 0.3;

      ctx.save();
      ctx.translate(this.x, this.y);

      // Hexagon path
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = Math.cos(angle) * this.size;
        const y = Math.sin(angle) * this.size;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Fill with subtle glow
      if (this.isActive) {
        ctx.fillStyle = `rgba(0, 217, 255, ${alpha * 0.1})`;
        ctx.fill();
      }

      // Stroke with cyan
      ctx.strokeStyle = `rgba(0, 217, 255, ${alpha})`;
      ctx.lineWidth = this.isActive ? 2 : 1;
      ctx.shadowColor = this.isActive ? COLORS.cyan : 'transparent';
      ctx.shadowBlur = this.isActive ? 8 : 0;
      ctx.stroke();

      ctx.restore();
    }
  }

  // Energy shield bubble
  class EnergyShield {
    constructor(canvas) {
      this.x = canvas.width * (0.2 + Math.random() * 0.6);
      this.y = canvas.height * (0.3 + Math.random() * 0.4);
      this.radius = 80 + Math.random() * 60;
      this.opacity = 0.3 + Math.random() * 0.2;
      this.pulseOffset = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.0005;
      this.rotation = Math.random() * Math.PI * 2;
      this.segments = 6 + Math.floor(Math.random() * 3);
    }

    update(time) {
      this.pulse = Math.sin(time * 0.0008 + this.pulseOffset) * 0.3 + 0.7;
      this.rotation += this.rotationSpeed;
    }

    draw(ctx, time) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      // Outer shield glow
      const glowGradient = ctx.createRadialGradient(0, 0, this.radius * 0.8, 0, 0, this.radius * 1.2);
      glowGradient.addColorStop(0, 'rgba(0, 217, 255, 0)');
      glowGradient.addColorStop(0.8, `rgba(0, 217, 255, ${this.opacity * 0.2 * this.pulse})`);
      glowGradient.addColorStop(1, 'rgba(0, 217, 255, 0)');

      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Shield segments
      ctx.strokeStyle = `rgba(0, 217, 255, ${this.opacity * this.pulse})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = COLORS.cyan;
      ctx.shadowBlur = 10;

      for (let seg = 0; seg < this.segments; seg++) {
        const angle = (Math.PI * 2 / this.segments) * seg;
        ctx.save();
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.radius, 0);
        ctx.stroke();

        // Hex at edge
        const hexSize = 15;
        ctx.translate(this.radius, 0);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const hexAngle = (Math.PI / 3) * i;
          const x = Math.cos(hexAngle) * hexSize;
          const y = Math.sin(hexAngle) * hexSize;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();
    }
  }

  // Security scan beam
  class ScanBeam {
    constructor(canvas, isVertical) {
      this.isVertical = isVertical;
      this.position = Math.random();
      this.speed = 0.0001 + Math.random() * 0.0001;
      this.thickness = 2 + Math.random() * 3;
      this.opacity = 0.4 + Math.random() * 0.3;
      this.crimson = Math.random() > 0.7;
    }

    update(canvas) {
      this.position += this.speed;
      if (this.position > 1) this.position = 0;
    }

    draw(ctx, canvas) {
      const color = this.crimson ? COLORS.crimson : COLORS.cyan;
      const pos = this.isVertical ?
        this.position * canvas.height :
        this.position * canvas.width;

      const gradient = this.isVertical ?
        ctx.createLinearGradient(0, pos - 50, 0, pos + 50) :
        ctx.createLinearGradient(pos - 50, 0, pos + 50, 0);

      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.5, color.replace(')', ', ' + this.opacity + ')'));
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;

      if (this.isVertical) {
        ctx.fillRect(0, pos - 50, canvas.width, 100);
      } else {
        ctx.fillRect(pos - 50, 0, 100, canvas.height);
      }

      // Sharp center line
      ctx.strokeStyle = color.replace(')', ', ' + (this.opacity * 1.5) + ')');
      ctx.lineWidth = this.thickness;
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;

      ctx.beginPath();
      if (this.isVertical) {
        ctx.moveTo(0, pos);
        ctx.lineTo(canvas.width, pos);
      } else {
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, canvas.height);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // Circuit line
  class CircuitLine {
    constructor(canvas) {
      this.points = [];
      this.segments = 8 + Math.floor(Math.random() * 6);

      let x = Math.random() * canvas.width;
      let y = Math.random() * canvas.height;

      for (let i = 0; i < this.segments; i++) {
        this.points.push({ x, y });
        x += (Math.random() - 0.5) * 150;
        y += (Math.random() - 0.5) * 150;
        x = Math.max(0, Math.min(canvas.width, x));
        y = Math.max(0, Math.min(canvas.height, y));
      }

      this.flowOffset = 0;
      this.flowSpeed = 0.5;
      this.opacity = 0.3 + Math.random() * 0.3;
    }

    update() {
      this.flowOffset += this.flowSpeed;
      if (this.flowOffset > 20) this.flowOffset = 0;
    }

    draw(ctx) {
      ctx.strokeStyle = `rgba(0, 217, 255, ${this.opacity})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.lineDashOffset = -this.flowOffset;

      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);
      for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      this.points.forEach((point, i) => {
        ctx.fillStyle = `rgba(0, 217, 255, ${this.opacity * 1.2})`;
        ctx.shadowColor = COLORS.cyan;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
    }
  }

  // Security glyph
  class SecurityGlyph {
    constructor(canvas) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.char = String.fromCharCode(0x2580 + Math.floor(Math.random() * 16));
      this.size = 20 + Math.random() * 15;
      this.opacity = 0.2 + Math.random() * 0.3;
      this.rotationSpeed = (Math.random() - 0.5) * 0.001;
      this.rotation = Math.random() * Math.PI * 2;
      this.pulseOffset = Math.random() * Math.PI * 2;
    }

    update(time) {
      this.rotation += this.rotationSpeed;
      this.pulse = Math.sin(time * 0.001 + this.pulseOffset) * 0.3 + 0.7;
    }

    draw(ctx, time) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      ctx.font = `${this.size}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.shadowColor = COLORS.cyan;
      ctx.shadowBlur = 10;
      ctx.fillStyle = `rgba(0, 217, 255, ${this.opacity * this.pulse})`;
      ctx.fillText(this.char, 0, 0);

      ctx.restore();
    }
  }

  // Energy particle
  class EnergyParticle {
    constructor(canvas) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = 1 + Math.random() * 2;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = 0.3 + Math.random() * 0.4;
      this.isCrimson = Math.random() > 0.8;
    }

    update(canvas) {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    }

    draw(ctx) {
      const color = this.isCrimson ? COLORS.crimson : COLORS.cyan;

      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.size * 3
      );
      gradient.addColorStop(0, color.replace(')', ', ' + this.opacity + ')'));
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function init(canvas) {
    hexGrid = [];
    shields = [];
    scanBeams = [];
    circuits = [];
    particles = [];
    glyphs = [];

    const hexSize = 40;
    const rows = Math.ceil(canvas.height / (hexSize * 1.5)) + 2;
    const cols = Math.ceil(canvas.width / (hexSize * Math.sqrt(3))) + 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * hexSize * Math.sqrt(3) + (row % 2) * hexSize * Math.sqrt(3) / 2;
        const y = row * hexSize * 1.5;
        hexGrid.push(new HexShield(canvas, x, y, hexSize * 0.45));
      }
    }

    for (let i = 0; i < 4; i++) {
      shields.push(new EnergyShield(canvas));
    }

    for (let i = 0; i < 3; i++) {
      scanBeams.push(new ScanBeam(canvas, true));
      scanBeams.push(new ScanBeam(canvas, false));
    }

    for (let i = 0; i < 8; i++) {
      circuits.push(new CircuitLine(canvas));
    }

    for (let i = 0; i < 15; i++) {
      glyphs.push(new SecurityGlyph(canvas));
    }

    for (let i = 0; i < 100; i++) {
      particles.push(new EnergyParticle(canvas));
    }
  }

  function animate(canvas, startTime) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = (timestamp) => {
      const time = timestamp - startTime;

      const bgGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.7
      );
      bgGradient.addColorStop(0, COLORS.steel);
      bgGradient.addColorStop(0.5, COLORS.bg);
      bgGradient.addColorStop(1, '#000000');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      hexGrid.forEach(hex => {
        hex.update(time);
        hex.draw(ctx, time);
      });

      circuits.forEach(circuit => {
        circuit.update();
        circuit.draw(ctx);
      });

      shields.forEach(shield => {
        shield.update(time);
        shield.draw(ctx, time);
      });

      glyphs.forEach(glyph => {
        glyph.update(time);
        glyph.draw(ctx, time);
      });

      particles.forEach(particle => {
        particle.update(canvas);
        particle.draw(ctx);
      });

      scanBeams.forEach(beam => {
        beam.update(canvas);
        beam.draw(ctx, canvas);
      });

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
  }

  function start(canvas, mode) {
    if (!canvas || mode !== 'grid') return;

    stop();

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    init(canvas);

    const startTime = performance.now();
    animate(canvas, startTime);

    canvas.style.transition = 'opacity 1.5s ease-in-out';
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
