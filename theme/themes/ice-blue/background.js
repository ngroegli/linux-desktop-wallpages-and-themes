// Arctic Scene - Full screen ice-blue background
(function(){
  let animationId = null;

  function start(canvas, mode){
    if(mode !== 'iceberg') return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.opacity = '0.3';

    // Ice-blue colors
    const iceLight = '#aeefff';
    const iceMid = '#7fd7ff';
    const iceDark = '#4db8e8';
    const white = '#ffffff';

    let time = 0;
    let snowflakes = [];
    let icebergs = [];

    // Initialize snowflakes
    for(let i = 0; i < 200; i++) {
      snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.2,
        drift: Math.random() * 0.3 - 0.15,
        char: ['*', '❄', '•', '⋆', '✦'][Math.floor(Math.random() * 5)]
      });
    }

    // Initialize multiple icebergs across screen
    const numIcebergs = 5;
    for(let i = 0; i < numIcebergs; i++) {
      icebergs.push({
        x: (canvas.width / (numIcebergs + 1)) * (i + 1),
        size: Math.random() * 0.5 + 0.5,
        offset: Math.random() * Math.PI * 2
      });
    }

    // Wave characters
    const waveChars = ['~', '≈', '∼', '⌇'];

    function drawAurora() {
      // Northern lights effect in the sky
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height * 0.4);
      gradient.addColorStop(0, 'rgba(174, 239, 255, 0.05)');
      gradient.addColorStop(0.5, 'rgba(127, 215, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(77, 184, 232, 0.05)');

      ctx.fillStyle = gradient;
      for(let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.2);
        for(let x = 0; x <= canvas.width; x += 50) {
          const y = canvas.height * 0.2 + Math.sin(x * 0.01 + time * 0.5 + i) * 40;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
      }
    }

    function drawIceberg(x, size, offset) {
      const fontSize = Math.min(canvas.width, canvas.height) / 35 * size;
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      const lineHeight = fontSize * 0.9;

      const waterY = canvas.height * 0.6;
      const bobbing = Math.sin(time + offset) * 3;

      // Above water - more detailed peak
      const aboveLines = [
        '        /\\        ',
        '       /  \\       ',
        '      /    \\      ',
        '     / /\\   \\     ',
        '    / /  \\   \\    ',
        '   / /    \\   \\   ',
        '  / /______\\   \\  ',
        ' /              \\ ',
        '/________________\\'
      ];

      aboveLines.forEach((line, i) => {
        const y = waterY - (aboveLines.length - i) * lineHeight + bobbing;
        const depth = i / aboveLines.length;

        // Gradient from white at peak to light ice at waterline
        if(depth < 0.3) {
          ctx.fillStyle = white;
        } else if(depth < 0.6) {
          ctx.fillStyle = iceLight;
        } else {
          ctx.fillStyle = iceMid;
        }

        ctx.globalAlpha = 0.8 + (i * 0.02);
        ctx.fillText(line, x, y);
      });
      ctx.globalAlpha = 1;

      // Below water - much larger underwater portion
      const belowLines = [
        '\\                  /',
        ' \\                / ',
        '  \\              /  ',
        '   \\            /   ',
        '    \\          /    ',
        '     \\   /\\   /     ',
        '      \\ /  \\ /      ',
        '       \\    /       ',
        '        \\  /        ',
        '         \\/         '
      ];

      belowLines.forEach((line, i) => {
        const y = waterY + (i + 1) * lineHeight + bobbing;
        const depth = i / belowLines.length;

        // Deeper = darker and more transparent
        if(depth < 0.3) {
          ctx.fillStyle = iceMid;
        } else if(depth < 0.6) {
          ctx.fillStyle = iceDark;
        } else {
          ctx.fillStyle = '#2a7da8';
        }

        ctx.globalAlpha = 0.7 - (depth * 0.4);
        ctx.fillText(line, x, y);
      });
      ctx.globalAlpha = 1;
    }

    function drawWaves() {
      const waterY = canvas.height * 0.6;
      const fontSize = Math.min(canvas.width, canvas.height) / 60;
      ctx.font = `${fontSize}px monospace`;

      // Multiple wave layers
      for(let layer = 0; layer < 5; layer++) {
        ctx.fillStyle = layer % 2 === 0 ? iceMid : iceLight;
        ctx.globalAlpha = 0.3 + (layer * 0.1);

        for(let x = 0; x < canvas.width; x += fontSize * 2) {
          const waveChar = waveChars[Math.floor(Math.random() * waveChars.length)];
          const y = waterY + layer * fontSize * 0.5 + Math.sin(x * 0.02 + time + layer) * 3;
          ctx.fillText(waveChar, x, y);
        }
      }
      ctx.globalAlpha = 1;
    }

    function drawSnowfall() {
      snowflakes.forEach(flake => {
        ctx.fillStyle = flake.size > 2 ? white : iceLight;
        ctx.globalAlpha = 0.4 + (flake.size / 4) * 0.4;
        ctx.font = `${flake.size * 8}px monospace`;
        ctx.fillText(flake.char, flake.x, flake.y);

        // Update position
        flake.y += flake.speed;
        flake.x += flake.drift + Math.sin(time * 2 + flake.y * 0.01) * 0.5;

        // Wrap around
        if(flake.y > canvas.height) {
          flake.y = -10;
          flake.x = Math.random() * canvas.width;
        }
        if(flake.x > canvas.width) flake.x = 0;
        if(flake.x < 0) flake.x = canvas.width;
      });
      ctx.globalAlpha = 1;
    }

    function drawIceShards() {
      // Floating ice chunks
      const fontSize = Math.min(canvas.width, canvas.height) / 70;
      ctx.font = `${fontSize}px monospace`;

      for(let i = 0; i < 30; i++) {
        const x = (i * 50 + time * 20) % canvas.width;
        const y = canvas.height * 0.6 + Math.sin(time + i) * 10;
        ctx.fillStyle = i % 2 === 0 ? white : iceLight;
        ctx.globalAlpha = 0.4;
        ctx.fillText(['◇', '◆', '▪', '▫'][i % 4], x, y);
      }
      ctx.globalAlpha = 1;
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw layers from back to front
      drawAurora();
      drawSnowfall();

      // Draw all icebergs
      icebergs.forEach(berg => {
        drawIceberg(berg.x, berg.size, berg.offset);
      });

      drawWaves();
      drawIceShards();

      time += 0.02;
      animationId = requestAnimationFrame(draw);
    }

    function handleResize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Reinitialize positions on resize
      snowflakes = [];
      for(let i = 0; i < 200; i++) {
        snowflakes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speed: Math.random() * 0.5 + 0.2,
          drift: Math.random() * 0.3 - 0.15,
          char: ['*', '❄', '•', '⋆', '✦'][Math.floor(Math.random() * 5)]
        });
      }

      icebergs = [];
      const numIcebergs = 5;
      for(let i = 0; i < numIcebergs; i++) {
        icebergs.push({
          x: (canvas.width / (numIcebergs + 1)) * (i + 1),
          size: Math.random() * 0.5 + 0.5,
          offset: Math.random() * Math.PI * 2
        });
      }
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

  // Expose to background manager
  window.THEME_BACKGROUND = {
    start: start,
    stop: stop
  };

})();
