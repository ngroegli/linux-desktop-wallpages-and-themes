// Ubuntu Circle of Friends logo background
(function(){
  let animationId = null;

  function start(canvas, mode){
    if(mode !== 'ubuntu-logo') return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.opacity = '0.35';

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Scale factor for the logo (4x size)
    const scale = Math.min(canvas.width, canvas.height) / 100;

    // Ubuntu colors (official)
    const orangeLight = '#fb8b00';
    const orangeMid = '#f44800';
    const orangeDark = '#dd4814';
    const white = '#ffffff';

    let rotation = 0;

    function drawLogo() {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);

      // Logo is 108px, so offset by -54 to center
      const S = scale;

      // Center position of the logo
      const centerLogoX = (39 + 26 - 54) * S;
      const centerLogoY = (27 + 26 - 54) * S;

      // Orange ring - slim stroke style
      const ringRadius = (26 + 45) / 2 * S; // Midpoint between inner and outer
      const ringWidth = 8 * S; // Slim ring width

      ctx.strokeStyle = orangeDark;
      ctx.lineWidth = ringWidth;
      ctx.beginPath();
      ctx.arc(centerLogoX, centerLogoY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Three orange circles (no white border)
      const humans = [
        { x: (0 + 14 - 54) * S, y: (39 + 14 - 54) * S, color: orangeMid },      // left: 0, top: 39
        { x: (108 - 4 - 14 - 54) * S, y: (-4 + 14 - 54) * S, color: orangeDark },    // right: 4, top: -4
        { x: (108 - 4 - 14 - 54) * S, y: (108 + 4 - 14 - 54) * S, color: orangeLight }  // right: 4, bottom: -4
      ];

      humans.forEach(human => {
        // Just the colored circle (14px radius = 28px diameter)
        ctx.fillStyle = human.color;
        ctx.beginPath();
        ctx.arc(human.x, human.y, 14 * S, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }

    function draw(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawLogo();

      // Slow rotation
      rotation += 0.005;

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

  // Expose to background manager
  window.THEME_BACKGROUND = {
    start: start,
    stop: stop
  };

})();
