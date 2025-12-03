// Clair Obscur: Expedition 33 - Dark Fantasy with Metallic Gold
(function(){
  let rafId = null;
  let particles = [];
  let geometryShapes = [];
  let fogLayers = [];

  // Color palette inspired by Expedition 33
  // Metallic gold requires highlights and shadows
  const COLORS = {
    bg: '#0c0c0f',
    bgAlt: '#0a0f18',
    goldHighlight: '#ffd700',  // Bright metallic highlight
    goldMid: '#d4af37',        // Mid-tone gold
    goldDark: '#8b6914',       // Dark shadow gold
    goldDeep: '#5c4509',       // Deepest shadow
    teal: '#5a7a7a'
  };

  // Golden particle class
  class GoldenParticle {
    constructor(canvas) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1;
      this.speedX = (Math.random() - 0.5) * 0.15;
      this.speedY = (Math.random() - 0.5) * 0.15;
      this.opacity = Math.random() * 0.4 + 0.3;
      this.twinkle = Math.random() * Math.PI * 2;
      this.twinkleSpeed = 0.001 + Math.random() * 0.002;
    }

    update(time, canvas) {
      this.x += this.speedX;
      this.y += this.speedY;

      // Wrap around
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;

      this.twinkle += this.twinkleSpeed;
    }

    draw(ctx, time) {
      const brightness = Math.sin(this.twinkle) * 0.3 + 0.7;
      const alpha = this.opacity * brightness;

      // Metallic glow with graduated highlights
      const glow = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.size * 5
      );
      glow.addColorStop(0, `rgba(255, 215, 0, ${alpha * 0.9})`);    // Bright highlight
      glow.addColorStop(0.3, `rgba(212, 175, 55, ${alpha * 0.6})`); // Mid gold
      glow.addColorStop(0.6, `rgba(139, 105, 20, ${alpha * 0.3})`); // Dark shadow
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 5, 0, Math.PI * 2);
      ctx.fill();

      // Metallic core with gradient (creates 3D sphere effect)
      const metallic = ctx.createRadialGradient(
        this.x - this.size * 0.3, this.y - this.size * 0.3, 0,
        this.x, this.y, this.size * 1.5
      );
      metallic.addColorStop(0, `rgba(255, 215, 0, ${alpha})`);      // Bright spot
      metallic.addColorStop(0.4, `rgba(212, 175, 55, ${alpha})`);   // Mid tone
      metallic.addColorStop(0.8, `rgba(139, 105, 20, ${alpha * 0.8})`); // Shadow
      metallic.addColorStop(1, `rgba(92, 69, 9, ${alpha * 0.6})`);  // Deep shadow

      ctx.fillStyle = metallic;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Art Deco geometry shape
  class GeometryShape {
    constructor(canvas, type) {
      this.type = type; // 'circle', 'arc', 'line'
      this.x = canvas.width * (0.3 + Math.random() * 0.4);
      this.y = canvas.height * (0.3 + Math.random() * 0.4);
      this.size = Math.random() * 150 + 100;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.0003;
      this.offsetX = (Math.random() - 0.5) * 0.02;
      this.offsetY = (Math.random() - 0.5) * 0.02;
      this.opacity = 0.15 + Math.random() * 0.1;
      this.pulseOffset = Math.random() * Math.PI * 2;
    }

    update(time) {
      this.rotation += this.rotationSpeed;
      this.x += this.offsetX;
      this.y += this.offsetY;
    }

    draw(ctx, time) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      const pulse = Math.sin(time * 0.0005 + this.pulseOffset) * 0.1 + 0.9;

      // Metallic stroke with gradient for dimensional effect
      const gradient = ctx.createLinearGradient(
        -this.size, -this.size,
        this.size, this.size
      );
      gradient.addColorStop(0, `rgba(255, 215, 0, ${this.opacity * pulse * 0.8})`);
      gradient.addColorStop(0.3, `rgba(212, 175, 55, ${this.opacity * pulse})`);
      gradient.addColorStop(0.7, `rgba(139, 105, 20, ${this.opacity * pulse * 0.7})`);
      gradient.addColorStop(1, `rgba(92, 69, 9, ${this.opacity * pulse * 0.5})`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
      ctx.shadowBlur = 12;

      if (this.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, this.size * pulse, 0, Math.PI * 2);
        ctx.stroke();
      } else if (this.type === 'arc') {
        ctx.beginPath();
        ctx.arc(0, 0, this.size * pulse, 0, Math.PI * 1.5);
        ctx.stroke();
      } else if (this.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  // Fog layer
  class FogLayer {
    constructor(canvas, index) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.width = canvas.width * (0.4 + Math.random() * 0.3);
      this.height = canvas.height * (0.3 + Math.random() * 0.2);
      this.speedX = (Math.random() - 0.5) * 0.1;
      this.speedY = (Math.random() - 0.5) * 0.1;
      this.opacity = 0.03 + Math.random() * 0.04;
      this.fadeOffset = Math.random() * Math.PI * 2;
    }

    update(canvas) {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < -this.width) this.x = canvas.width;
      if (this.x > canvas.width) this.x = -this.width;
      if (this.y < -this.height) this.y = canvas.height;
      if (this.y > canvas.height) this.y = -this.height;
    }

    draw(ctx, time) {
      const fade = Math.sin(time * 0.0003 + this.fadeOffset) * 0.3 + 0.7;

      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.width
      );
      // Metallic fog with subtle highlights
      gradient.addColorStop(0, `rgba(255, 215, 0, ${this.opacity * fade * 0.4})`);
      gradient.addColorStop(0.3, `rgba(212, 175, 55, ${this.opacity * fade * 0.6})`);
      gradient.addColorStop(0.6, `rgba(139, 105, 20, ${this.opacity * fade * 0.4})`);
      gradient.addColorStop(0.8, `rgba(90, 122, 122, ${this.opacity * fade * 0.3})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.width, this.height, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function init(canvas) {
    particles = [];
    geometryShapes = [];
    fogLayers = [];

    // Create golden particles (low density)
    for (let i = 0; i < 60; i++) {
      particles.push(new GoldenParticle(canvas));
    }

    // Create geometry shapes
    const shapeTypes = ['circle', 'arc', 'line'];
    for (let i = 0; i < 8; i++) {
      const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
      geometryShapes.push(new GeometryShape(canvas, type));
    }

    // Create fog layers
    for (let i = 0; i < 5; i++) {
      fogLayers.push(new FogLayer(canvas, i));
    }
  }

  function drawAuroraWaves(ctx, canvas, time) {
    ctx.globalAlpha = 0.1;

    for (let i = 0; i < 3; i++) {
      const gradient = ctx.createLinearGradient(
        0, canvas.height * 0.3,
        0, canvas.height * 0.7
      );

      const offset = time * 0.0001 + i * 0.5;
      const intensity = Math.sin(offset) * 0.3 + 0.5;

      // Metallic aurora with highlights and shadows
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.3, `rgba(255, 215, 0, ${intensity * 0.3})`);
      gradient.addColorStop(0.5, `rgba(212, 175, 55, ${intensity * 0.5})`);
      gradient.addColorStop(0.7, `rgba(139, 105, 20, ${intensity * 0.4})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.globalAlpha = 1;
  }

  function drawExpeditionTitle(ctx, canvas, time) {
    ctx.save();

    // Art Deco style font - tall, condensed, elegant
    const fontSize = Math.min(canvas.width * 0.08, 120);
    ctx.font = `bold ${fontSize}px "Cinzel Decorative", "Trajan Pro", "Copperplate", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const x = canvas.width / 2;
    const y = canvas.height * 0.08;
    const text = 'EXPEDITION 33';

    // Subtle pulsing effect
    const pulse = Math.sin(time * 0.0005) * 0.1 + 0.9;

    // Multiple shadow layers for depth (Art Deco style)
    ctx.shadowColor = 'rgba(139, 105, 20, 0.8)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = 'rgba(92, 69, 9, 0.6)';
    ctx.fillText(text, x + 3, y + 3);

    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = 'rgba(139, 105, 20, 0.8)';
    ctx.fillText(text, x + 2, y + 2);

    // Main metallic gold text with gradient
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    const gradient = ctx.createLinearGradient(x, y, x, y + fontSize);
    gradient.addColorStop(0, `rgba(255, 215, 0, ${0.95 * pulse})`);
    gradient.addColorStop(0.3, `rgba(212, 175, 55, ${0.95 * pulse})`);
    gradient.addColorStop(0.6, `rgba(212, 175, 55, ${0.9 * pulse})`);
    gradient.addColorStop(1, `rgba(139, 105, 20, ${0.85 * pulse})`);

    ctx.fillStyle = gradient;
    ctx.fillText(text, x, y);

    // Bright highlight stroke (top edge only)
    ctx.strokeStyle = `rgba(255, 215, 0, ${0.4 * pulse})`;
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
    ctx.shadowBlur = 15;
    ctx.strokeText(text, x, y);

    // Art Deco decorative lines above and below
    ctx.shadowBlur = 0;
    const lineY1 = y - fontSize * 0.15;
    const lineY2 = y + fontSize * 1.15;
    const lineWidth = canvas.width * 0.25;

    // Top decorative line
    const topGradient = ctx.createLinearGradient(x - lineWidth/2, 0, x + lineWidth/2, 0);
    topGradient.addColorStop(0, 'rgba(212, 175, 55, 0)');
    topGradient.addColorStop(0.5, `rgba(255, 215, 0, ${0.6 * pulse})`);
    topGradient.addColorStop(1, 'rgba(212, 175, 55, 0)');

    ctx.strokeStyle = topGradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - lineWidth/2, lineY1);
    ctx.lineTo(x + lineWidth/2, lineY1);
    ctx.stroke();

    // Bottom decorative line
    ctx.beginPath();
    ctx.moveTo(x - lineWidth/2, lineY2);
    ctx.lineTo(x + lineWidth/2, lineY2);
    ctx.stroke();

    ctx.restore();
  }  function animate(canvas, startTime) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = (timestamp) => {
      const time = timestamp - startTime;

      // Dark gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, COLORS.bg);
      bgGradient.addColorStop(0.5, COLORS.bgAlt);
      bgGradient.addColorStop(1, COLORS.bg);
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw aurora waves (subtle gold light rays)
      drawAuroraWaves(ctx, canvas, time);

      // Draw fog layers (bottom)
      fogLayers.forEach(fog => {
        fog.update(canvas);
        fog.draw(ctx, time);
      });

      // Draw geometry shapes (middle - parallax)
      ctx.globalAlpha = 1;
      geometryShapes.forEach(shape => {
        shape.update(time);
        shape.draw(ctx, time);
      });

      // Draw golden particles (top)
      particles.forEach(particle => {
        particle.update(time, canvas);
        particle.draw(ctx, time);
      });

      // Draw EXPEDITION 33 title
      drawExpeditionTitle(ctx, canvas, time);

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
  }

  function start(canvas, mode) {
    if (!canvas || mode !== 'expedition') return;

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
