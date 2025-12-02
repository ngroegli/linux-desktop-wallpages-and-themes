// Circuit Board Background - Minimalist PCB with traces and diodes
(function(){
  let rafId = null;
  let traces = [];
  let diodes = [];
  let signals = [];

  class CircuitTrace {
    constructor(canvas) {
      this.points = [];
      this.generatePath(canvas);
      this.width = 2 + Math.random() * 2;
      this.opacity = 0.3 + Math.random() * 0.4;
    }

    generatePath(canvas) {
      const startX = Math.random() * canvas.width;
      const startY = Math.random() * canvas.height;

      let x = startX;
      let y = startY;
      this.points.push({ x, y });

      const segments = 3 + Math.floor(Math.random() * 5);

      for (let i = 0; i < segments; i++) {
        // Create right-angle paths (like PCB traces)
        if (Math.random() > 0.5) {
          // Horizontal then vertical
          x += (Math.random() - 0.5) * 200;
          this.points.push({ x, y });
          y += (Math.random() - 0.5) * 200;
          this.points.push({ x, y });
        } else {
          // Vertical then horizontal
          y += (Math.random() - 0.5) * 200;
          this.points.push({ x, y });
          x += (Math.random() - 0.5) * 200;
          this.points.push({ x, y });
        }
      }
    }

    draw(ctx) {
      if (this.points.length < 2) return;

      ctx.strokeStyle = `rgba(0, 255, 170, ${this.opacity})`;
      ctx.lineWidth = this.width;
      ctx.lineCap = 'square';

      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);

      for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y);
      }

      ctx.stroke();

      // Draw connection pads at corners
      ctx.fillStyle = `rgba(0, 255, 170, ${this.opacity + 0.2})`;
      this.points.forEach(point => {
        ctx.fillRect(point.x - 3, point.y - 3, 6, 6);
      });
    }
  }

  class Diode {
    constructor(canvas) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = 6 + Math.random() * 4;
      this.blinkSpeed = 1 + Math.random() * 3;
      this.blinkOffset = Math.random() * Math.PI * 2;
      this.brightness = 0;
      this.color = Math.random() > 0.7 ? 'amber' : 'teal';
    }

    update(time) {
      // Occasional blinks
      const blinkPhase = Math.sin(time * 0.001 * this.blinkSpeed + this.blinkOffset);
      if (blinkPhase > 0.9) {
        this.brightness = (blinkPhase - 0.9) * 10;
      } else {
        this.brightness *= 0.9;
      }
    }

    draw(ctx) {
      const baseAlpha = 0.3 + this.brightness * 0.7;
      const color = this.color === 'amber'
        ? `rgba(255, 170, 0, ${baseAlpha})`
        : `rgba(0, 255, 170, ${baseAlpha})`;

      // Glow
      if (this.brightness > 0.1) {
        ctx.shadowBlur = 15 * this.brightness;
        ctx.shadowColor = color;
      }

      // Diode body
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();

      // Diode stripe
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x + this.size * 0.5, this.y - this.size);
      ctx.lineTo(this.x + this.size * 0.5, this.y + this.size);
      ctx.stroke();

      ctx.shadowBlur = 0;
    }
  }

  class Signal {
    constructor(trace) {
      this.trace = trace;
      this.progress = 0;
      this.speed = 0.01 + Math.random() * 0.02;
      this.size = 3 + Math.random() * 3;
      this.color = Math.random() > 0.5 ? 'cyan' : 'lime';
    }

    update() {
      this.progress += this.speed;
      if (this.progress > 1) {
        this.progress = 0;
      }
    }

    draw(ctx) {
      if (this.trace.points.length < 2) return;

      // Calculate position along path
      const totalPoints = this.trace.points.length;
      const segment = this.progress * (totalPoints - 1);
      const segmentIndex = Math.floor(segment);
      const segmentProgress = segment - segmentIndex;

      if (segmentIndex >= totalPoints - 1) return;

      const p1 = this.trace.points[segmentIndex];
      const p2 = this.trace.points[segmentIndex + 1];

      const x = p1.x + (p2.x - p1.x) * segmentProgress;
      const y = p1.y + (p2.y - p1.y) * segmentProgress;

      const color = this.color === 'cyan'
        ? 'rgba(0, 255, 255, 0.9)'
        : 'rgba(0, 255, 0, 0.9)';

      // Signal glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, this.size, 0, Math.PI * 2);
      ctx.fill();

      // Trail
      ctx.shadowBlur = 5;
      ctx.fillStyle = color.replace('0.9', '0.3');
      ctx.beginPath();
      ctx.arc(x, y, this.size * 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
    }
  }

  function init(canvas) {
    traces = [];
    diodes = [];
    signals = [];

    // Create circuit traces
    const numTraces = 30 + Math.floor(Math.random() * 20);
    for (let i = 0; i < numTraces; i++) {
      traces.push(new CircuitTrace(canvas));
    }

    // Create diodes
    const numDiodes = 20 + Math.floor(Math.random() * 15);
    for (let i = 0; i < numDiodes; i++) {
      diodes.push(new Diode(canvas));
    }

    // Create signals traveling on some traces
    const numSignals = 8;
    for (let i = 0; i < numSignals; i++) {
      const randomTrace = traces[Math.floor(Math.random() * traces.length)];
      signals.push(new Signal(randomTrace));
    }
  }

  function drawGrid(ctx, canvas) {
    const gridSize = 50;
    ctx.strokeStyle = 'rgba(0, 255, 170, 0.05)';
    ctx.lineWidth = 0.5;

    // Vertical lines
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  function animate(canvas, startTime) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = (timestamp) => {
      const time = timestamp - startTime;

      // Clear with dark background
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid
      drawGrid(ctx, canvas);

      // Draw traces
      traces.forEach(trace => trace.draw(ctx));

      // Update and draw diodes
      diodes.forEach(diode => {
        diode.update(time);
        diode.draw(ctx);
      });

      // Update and draw signals
      signals.forEach(signal => {
        signal.update();
        signal.draw(ctx);
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
