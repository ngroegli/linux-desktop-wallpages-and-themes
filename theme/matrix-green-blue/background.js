// Matrix rain background for matrix-green-blue theme
(function(){
  let animationId = null;

  function start(canvas, mode){
    if(mode !== 'matrix') return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.opacity = '0.4';

    const chars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ01';
    const charArray = chars.split('');
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);
    const colors = ['#00ff88', '#00ffaa', '#00ddff', '#00bbff'];

    function draw(){
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for(let i = 0; i < drops.length; i++){
        const colorIndex = Math.floor(Math.random() * colors.length);
        ctx.fillStyle = colors[colorIndex];

        const char = charArray[Math.floor(Math.random() * charArray.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(char, x, y);

        if(y > canvas.height && Math.random() > 0.975){
          drops[i] = 0;
        }

        drops[i]++;
      }

      animationId = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

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
