// ASCII Galaxy Background - Terminal-style starscape
(function(){
  let rafId = null;
  let particles = [];

  const ASCII_CHARS = {
    stars: ['*', '+', '.', '·', '✦', '✧'],
    planets: ['@', 'O', '◉', '●', '◯'],
    nebula: ['%', '#', '~', '≈', '∞', '◊'],
    dust: [':', ';', ',', '`', '\'']
  };

  class AsciiParticle {
    constructor(canvas, type) {
      this.type = type;
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.z = Math.random(); // Depth for parallax

      // Select character based on type
      switch(type) {
        case 'star':
          this.char = ASCII_CHARS.stars[Math.floor(Math.random() * ASCII_CHARS.stars.length)];
          this.baseSize = 12 + Math.random() * 8;
          this.twinkleSpeed = 0.5 + Math.random() * 2;
          this.twinkleOffset = Math.random() * Math.PI * 2;
          break;
        case 'planet':
          this.char = ASCII_CHARS.planets[Math.floor(Math.random() * ASCII_CHARS.planets.length)];
          this.baseSize = 20 + Math.random() * 15;
          this.twinkleSpeed = 0.2 + Math.random() * 0.3;
          this.twinkleOffset = Math.random() * Math.PI * 2;
          this.orbitSpeed = 0.05 + Math.random() * 0.1;
          this.orbitRadius = 50 + Math.random() * 100;
          this.orbitCenter = { x: this.x, y: this.y };
          this.orbitAngle = Math.random() * Math.PI * 2;
          break;
        case 'nebula':
          this.char = ASCII_CHARS.nebula[Math.floor(Math.random() * ASCII_CHARS.nebula.length)];
          this.baseSize = 18 + Math.random() * 12;
          this.twinkleSpeed = 0.1 + Math.random() * 0.2;
          this.twinkleOffset = Math.random() * Math.PI * 2;
          break;
        case 'dust':
          this.char = ASCII_CHARS.dust[Math.floor(Math.random() * ASCII_CHARS.dust.length)];
          this.baseSize = 8 + Math.random() * 4;
          this.twinkleSpeed = 1 + Math.random() * 2;
          this.twinkleOffset = Math.random() * Math.PI * 2;
          break;
      }

      // Drift velocity
      this.vx = (Math.random() - 0.5) * 0.1 * this.z;
      this.vy = (Math.random() - 0.5) * 0.1 * this.z;
    }

    update(time, canvas) {
      // Twinkle effect
      this.brightness = 0.3 + Math.sin(time * 0.001 * this.twinkleSpeed + this.twinkleOffset) * 0.35 + 0.35;

      // Orbital motion for planets
      if (this.type === 'planet') {
        this.orbitAngle += this.orbitSpeed * 0.01;
        this.x = this.orbitCenter.x + Math.cos(this.orbitAngle) * this.orbitRadius * this.z;
        this.y = this.orbitCenter.y + Math.sin(this.orbitAngle) * this.orbitRadius * this.z * 0.5;
      } else {
        // Slow drift
        this.x += this.vx;
        this.y += this.vy;
      }

      // Wrap around screen
      if (this.x < -50) this.x = canvas.width + 50;
      if (this.x > canvas.width + 50) this.x = -50;
      if (this.y < -50) this.y = canvas.height + 50;
      if (this.y > canvas.height + 50) this.y = -50;
    }

    draw(ctx) {
      const size = this.baseSize * (0.5 + this.z * 0.5);

      // Color based on type
      let color;
      switch(this.type) {
        case 'star':
          color = `rgba(255, 255, 255, ${this.brightness})`;
          break;
        case 'planet':
          color = `rgba(0, 255, 255, ${this.brightness * 0.9})`;
          break;
        case 'nebula':
          color = `rgba(200, 100, 255, ${this.brightness * 0.6})`;
          break;
        case 'dust':
          color = `rgba(150, 150, 180, ${this.brightness * 0.4})`;
          break;
      }

      ctx.fillStyle = color;
      ctx.font = `${size}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Glow effect for brighter objects
      if (this.type === 'star' || this.type === 'planet') {
        ctx.shadowBlur = 10 * this.brightness;
        ctx.shadowColor = color;
      }

      ctx.fillText(this.char, this.x, this.y);
      ctx.shadowBlur = 0;
    }
  }

  function init(canvas) {
    particles = [];

    // Create stars (most common)
    for (let i = 0; i < 150; i++) {
      particles.push(new AsciiParticle(canvas, 'star'));
    }

    // Create planets (fewer)
    for (let i = 0; i < 5; i++) {
      particles.push(new AsciiParticle(canvas, 'planet'));
    }

    // Create nebula particles
    for (let i = 0; i < 30; i++) {
      particles.push(new AsciiParticle(canvas, 'nebula'));
    }

    // Create dust
    for (let i = 0; i < 80; i++) {
      particles.push(new AsciiParticle(canvas, 'dust'));
    }

    // Sort by z-depth for proper rendering
    particles.sort((a, b) => a.z - b.z);
  }

  function drawScanlines(ctx, canvas, time) {
    ctx.fillStyle = 'rgba(0, 255, 0, 0.02)';
    const scanlineY = (time * 0.1) % 4;

    for (let y = scanlineY; y < canvas.height; y += 4) {
      ctx.fillRect(0, y, canvas.width, 1);
    }
  }

  function animate(canvas, startTime) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = (timestamp) => {
      const time = timestamp - startTime;

      // Clear with dark background
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle purple nebula glow in background
      const nebulaGradient = ctx.createRadialGradient(
        canvas.width * 0.7, canvas.height * 0.3, 0,
        canvas.width * 0.7, canvas.height * 0.3, canvas.width * 0.5
      );
      nebulaGradient.addColorStop(0, 'rgba(100, 50, 150, 0.1)');
      nebulaGradient.addColorStop(1, 'rgba(100, 50, 150, 0)');
      ctx.fillStyle = nebulaGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(particle => {
        particle.update(time, canvas);
        particle.draw(ctx);
      });

      // Terminal scanlines effect
      drawScanlines(ctx, canvas, time);

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
