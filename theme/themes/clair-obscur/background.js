// Clair Obscur: Expedition 33 - Atmospheric Dark Theme
(function(){
  let animationId = null;

  function start(canvas, mode){
    if(mode !== 'expedition') return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.opacity = '0.5';

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Bright straight gold color palette - pure golden tones
    const gold = '#D3AF37';        // Pure gold
    const lightGold = '#FFED4E';   // Bright shiny gold
    const darkGold = '#FFA500';    // Deep golden orange

    let time = 0;
    let particles = [];

    // More glowing golden particles - bigger and brighter
    for(let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 5 + 2,
        speed: Math.random() * 0.3 + 0.08,
        offset: Math.random() * Math.PI * 2
      });
    }

    // Draw shiny geometric patterns with glow
    function drawGeometry() {
      ctx.strokeStyle = gold;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.25;
      ctx.shadowColor = lightGold;
      ctx.shadowBlur = 20;

      // Concentric circles - bigger and brighter with glow
      for(let i = 1; i <= 10; i++) {
        const radius = Math.min(canvas.width, canvas.height) * 0.15 * i;
        const pulse = Math.sin(time * 0.5 + i * 0.3) * 0.15 + 0.85;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * pulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Radiating lines - thicker and brighter, extend further
      ctx.lineWidth = 4;
      for(let i = 0; i < 32; i++) {
        const angle = (Math.PI * 2 / 32) * i + time * 0.1;
        const innerRadius = Math.min(canvas.width, canvas.height) * 0.18;
        const outerRadius = Math.max(canvas.width, canvas.height) * 0.8;

        ctx.beginPath();
        ctx.moveTo(
          centerX + Math.cos(angle) * innerRadius,
          centerY + Math.sin(angle) * innerRadius
        );
        ctx.lineTo(
          centerX + Math.cos(angle) * outerRadius,
          centerY + Math.sin(angle) * outerRadius
        );
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // Draw floating golden particles with intense glow
    function drawParticles() {
      particles.forEach((p, i) => {
        const pulse = (Math.sin(time + p.offset) + 1) / 2;
        const alpha = pulse * 0.8 + 0.3;

        // Outer glow - bigger and brighter
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
        gradient.addColorStop(0, lightGold);
        gradient.addColorStop(0.3, gold);
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.globalAlpha = alpha * 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
        ctx.fill();

        // Core particle - brighter
        ctx.fillStyle = lightGold;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = lightGold;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Update
        p.y -= p.speed;
        if(p.y < -20) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
        }
      });

      ctx.globalAlpha = 1;
    }

    // Draw '33' in center with shiny Art Deco style - BIGGER AND BRIGHTER
    function drawTitle() {
      const fontSize = Math.min(canvas.width, canvas.height) / 3;  // Bigger!
      ctx.font = `bold ${fontSize}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const pulse = Math.sin(time * 0.8) * 0.15 + 0.85;

      // Intense outer glow
      ctx.shadowColor = lightGold;
      ctx.shadowBlur = 80;
      ctx.fillStyle = lightGold;
      ctx.globalAlpha = 0.6 * pulse;
      ctx.fillText('33', centerX, centerY);

      // Mid glow
      ctx.shadowBlur = 40;
      ctx.fillStyle = gold;
      ctx.globalAlpha = 0.8 * pulse;
      ctx.fillText('33', centerX, centerY);

      // Main text - pure bright gold
      ctx.shadowBlur = 20;
      ctx.fillStyle = lightGold;
      ctx.globalAlpha = 0.9 * pulse;
      ctx.fillText('33', centerX, centerY);

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      // Subtitle - brighter
      const subtitleSize = fontSize / 4.5;
      ctx.font = `bold ${subtitleSize}px monospace`;
      ctx.fillStyle = gold;
      ctx.shadowColor = gold;
      ctx.shadowBlur = 10;
      ctx.globalAlpha = 0.6;
      ctx.fillText('EXPEDITION', centerX, centerY + fontSize * 0.65);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // Corner decorations - bigger and shinier
    function drawCorners() {
      const size = Math.min(canvas.width, canvas.height) / 25;
      ctx.font = `${size}px monospace`;
      ctx.fillStyle = gold;
      ctx.globalAlpha = 0.5;
      ctx.shadowColor = lightGold;
      ctx.shadowBlur = 15;

      const margin = size * 2;
      const ornament = '◆';

      // Four corners
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(ornament, margin, margin);

      ctx.textAlign = 'right';
      ctx.fillText(ornament, canvas.width - margin, margin);

      ctx.textBaseline = 'bottom';
      ctx.fillText(ornament, canvas.width - margin, canvas.height - margin);

      ctx.textAlign = 'left';
      ctx.fillText(ornament, margin, canvas.height - margin);

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawGeometry();
      drawParticles();
      drawTitle();
      drawCorners();

      time += 0.02;
      animationId = requestAnimationFrame(draw);
    }

    function handleResize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', handleResize);
    draw();
  }

  function stop(){
    if(animationId){
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  window.THEME_BACKGROUND = {
    start: start,
    stop: stop
  };

})();
