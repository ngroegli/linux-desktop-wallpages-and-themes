// Quantum Tunnel Background - Rotating geometric tunnel effect
(function(){
  let rafId = null;
  let rings = [];

  class TunnelRing {
    constructor(index, total) {
      this.index = index;
      this.total = total;
      this.z = index / total;
      this.rotation = 0;
      this.rotationSpeed = 0.3 + Math.random() * 0.2;
      this.sides = 6; // Hexagonal
      this.colorPhase = Math.random() * Math.PI * 2;
    }

    update(time) {
      this.rotation = time * 0.0003 * this.rotationSpeed + this.colorPhase;
      this.z -= 0.003;

      if (this.z < 0) {
        this.z = 1;
        this.colorPhase = Math.random() * Math.PI * 2;
      }
    }

    draw(ctx, canvas, time) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Perspective scaling
      const scale = (1 - this.z) * 0.9 + 0.1;
      const radius = Math.min(canvas.width, canvas.height) * 0.4 * scale;

      // Calculate color based on depth and phase
      const hue1 = (this.z * 180 + time * 0.05) % 360;
      const hue2 = (hue1 + 180) % 360;

      // Create gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, `hsla(${hue1}, 100%, 50%, 0)`);
      gradient.addColorStop(0.7, `hsla(${hue2}, 100%, 50%, ${0.3 * (1 - this.z)})`);
      gradient.addColorStop(1, `hsla(${hue1}, 100%, 50%, ${0.6 * (1 - this.z)})`);

      // Draw hexagonal ring
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3 * scale;
      ctx.shadowBlur = 15 * (1 - this.z);
      ctx.shadowColor = `hsl(${hue1}, 100%, 50%)`;

      ctx.beginPath();
      for (let i = 0; i <= this.sides; i++) {
        const angle = (i / this.sides) * Math.PI * 2 + this.rotation;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw nodes at corners
      ctx.fillStyle = `hsla(${hue2}, 100%, 70%, ${0.8 * (1 - this.z)})`;
      ctx.shadowBlur = 20 * (1 - this.z);
      for (let i = 0; i < this.sides; i++) {
        const angle = (i / this.sides) * Math.PI * 2 + this.rotation;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.arc(x, y, 4 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
    }
  }

  function init() {
    rings = [];
    const numRings = 30;
    for (let i = 0; i < numRings; i++) {
      rings.push(new TunnelRing(i, numRings));
    }
  }

  function drawParticles(ctx, canvas, time) {
    const numParticles = 100;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2 + time * 0.0001;
      const z = (time * 0.001 + i * 0.01) % 1;
      const scale = (1 - z) * 0.9 + 0.1;
      const distance = Math.min(canvas.width, canvas.height) * 0.5 * scale * (0.8 + Math.sin(time * 0.001 + i) * 0.2);

      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      const hue = (z * 180 + time * 0.05) % 360;
      const alpha = 0.4 * (1 - z);

      ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
      ctx.shadowBlur = 8 * (1 - z);
      ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;

      ctx.beginPath();
      ctx.arc(x, y, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
  }

  function animate(canvas, startTime) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = (timestamp) => {
      const time = timestamp - startTime;

      // Clear with dark background
      ctx.fillStyle = '#0a0520';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add radial gradient for depth
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = Math.max(canvas.width, canvas.height);

      const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
      bgGradient.addColorStop(0, 'rgba(20, 10, 50, 0.5)');
      bgGradient.addColorStop(0.5, 'rgba(10, 5, 32, 0.3)');
      bgGradient.addColorStop(1, 'rgba(10, 5, 32, 0)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Sort rings by depth for proper rendering
      rings.sort((a, b) => b.z - a.z);

      // Update and draw rings
      rings.forEach(ring => {
        ring.update(time);
        ring.draw(ctx, canvas, time);
      });

      // Draw flowing particles
      drawParticles(ctx, canvas, time);

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
  }

  function start(canvas, mode) {
    if (!canvas) return;

    stop();

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    init();

    const startTime = performance.now();
    animate(canvas, startTime);

    canvas.style.transition = 'opacity 1s ease-in';
    canvas.style.opacity = '1';

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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
