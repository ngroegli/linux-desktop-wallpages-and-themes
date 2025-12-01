// Retro Synthwave Grid Background - 80s inspired neon grid with sun
(function(){
  let rafId = null;
  let time = 0;
  let sunPulse = 0;

  function drawGrid(ctx, canvas, offset) {
    const gridSize = 50;
    const horizonY = canvas.height * 0.65;
    const vanishingX = canvas.width / 2;
    const vanishingY = horizonY - 100;

    // Draw perspective grid
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff00ff';

    // Horizontal lines (receding into distance)
    for (let i = 0; i < 12; i++) {
      const y = horizonY + i * gridSize + (offset % gridSize);
      const width = canvas.width * (0.3 + (i / 12) * 0.7);

      ctx.globalAlpha = 0.3 + (i / 12) * 0.5;
      ctx.beginPath();
      ctx.moveTo(vanishingX - width, y);
      ctx.lineTo(vanishingX + width, y);
      ctx.stroke();
    }

    // Vertical lines (perspective)
    const numVerticals = 20;
    for (let i = -numVerticals/2; i <= numVerticals/2; i++) {
      if (i === 0) continue;

      const bottomX = vanishingX + i * gridSize * 2;
      const alpha = 1 - Math.abs(i) / (numVerticals/2);

      ctx.globalAlpha = alpha * 0.5;
      ctx.beginPath();
      ctx.moveTo(vanishingX + i * 20, vanishingY);
      ctx.lineTo(bottomX, canvas.height);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  function drawMountains(ctx, canvas) {
    const horizonY = canvas.height * 0.65;

    // Mountain silhouettes
    const mountains = [
      { peaks: [0.2, 0.35, 0.5, 0.65, 0.8], height: 0.3, color: '#1a0033' },
      { peaks: [0.15, 0.4, 0.6, 0.75], height: 0.25, color: '#2d0055' },
      { peaks: [0.1, 0.3, 0.55, 0.7, 0.9], height: 0.2, color: '#400077' }
    ];

    mountains.forEach((mountain, idx) => {
      ctx.fillStyle = mountain.color;
      ctx.strokeStyle = idx === 0 ? '#ff00ff' : '#cc00cc';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff00ff';

      ctx.beginPath();
      ctx.moveTo(0, horizonY);

      mountain.peaks.forEach((peakX, i) => {
        const x = peakX * canvas.width;
        const y = horizonY - mountain.height * canvas.height;

        if (i === 0) {
          ctx.lineTo(x, y);
        } else {
          const prevX = mountain.peaks[i-1] * canvas.width;
          const valleyY = horizonY - mountain.height * canvas.height * 0.6;
          const midX = (prevX + x) / 2;
          ctx.lineTo(midX, valleyY);
          ctx.lineTo(x, y);
        }
      });

      ctx.lineTo(canvas.width, horizonY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    ctx.shadowBlur = 0;
  }

  function drawSun(ctx, canvas, pulse) {
    const horizonY = canvas.height * 0.65;
    const sunY = horizonY - 80;
    const sunX = canvas.width / 2;
    const baseRadius = 60;
    const radius = baseRadius + pulse * 8;

    // Sun glow
    const gradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, radius * 2);
    gradient.addColorStop(0, 'rgba(255, 100, 200, 0.6)');
    gradient.addColorStop(0.4, 'rgba(255, 0, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(sunX - radius * 2, sunY - radius * 2, radius * 4, radius * 4);

    // Sun core
    const coreGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, radius);
    coreGradient.addColorStop(0, '#ffff00');
    coreGradient.addColorStop(0.5, '#ff00ff');
    coreGradient.addColorStop(1, '#ff0080');

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(sunX, sunY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Sun stripes
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff00ff';

    for (let i = 0; i < 8; i++) {
      const y = sunY - radius + i * (radius * 2 / 8);
      const lineRadius = Math.sqrt(radius * radius - Math.pow(y - sunY, 2));

      ctx.beginPath();
      ctx.moveTo(sunX - lineRadius, y);
      ctx.lineTo(sunX + lineRadius, y);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
  }

  function drawStars(ctx, canvas, time) {
    const stars = 100;
    ctx.fillStyle = '#ffffff';

    for (let i = 0; i < stars; i++) {
      const x = (i * 123.456) % canvas.width;
      const y = (i * 789.012) % (canvas.height * 0.6);
      const twinkle = Math.sin(time * 0.001 + i) * 0.5 + 0.5;
      const size = 1 + twinkle;

      ctx.globalAlpha = 0.3 + twinkle * 0.7;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  function animate(canvas, startTime) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = (timestamp) => {
      time = timestamp - startTime;
      const seconds = time / 1000;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background gradient (dark purple to black)
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#0a0015');
      bgGradient.addColorStop(0.6, '#1a0030');
      bgGradient.addColorStop(1, '#2d0050');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      drawStars(ctx, canvas, time);

      // Sun pulse
      sunPulse = Math.sin(seconds * 0.8) * 0.5 + 0.5;
      drawSun(ctx, canvas, sunPulse);

      // Mountains
      drawMountains(ctx, canvas);

      // Animated grid
      const gridOffset = seconds * 30;
      drawGrid(ctx, canvas, gridOffset);

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
  }

  function start(canvas, mode) {
    if (!canvas) return;

    stop();

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

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
