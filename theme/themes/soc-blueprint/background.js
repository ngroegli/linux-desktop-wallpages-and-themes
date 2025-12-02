// SOC Dashboard Background - Live security operations center monitoring
(function(){
  let rafId = null;
  let alerts = [];
  let metrics = [];
  let scanLines = [];
  let threatIndicators = [];
  let particles = [];
  let gridLines = [];

  // Floating data particle
  class DataParticle {
    constructor(canvas) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = 1 + Math.random() * 2;
      this.opacity = 0.3 + Math.random() * 0.5;
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.canvasWidth = canvas.width;
      this.canvasHeight = canvas.height;
    }

    update(time) {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > this.canvasWidth) this.vx *= -1;
      if (this.y < 0 || this.y > this.canvasHeight) this.vy *= -1;

      this.pulse = Math.sin(time * 0.002 + this.pulsePhase) * 0.5 + 0.5;
    }

    draw(ctx) {
      ctx.fillStyle = `rgba(0, 255, 200, ${this.opacity * this.pulse})`;
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#00ffc8';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Scanning line effect - more subtle
  class ScanLine {
    constructor(canvas) {
      this.y = Math.random() * canvas.height;
      this.speed = 0.3 + Math.random() * 0.5;
      this.opacity = 0.1 + Math.random() * 0.15;
      this.height = canvas.height;
    }

    update() {
      this.y += this.speed;
      if (this.y > this.height) this.y = 0;
    }

    draw(ctx, canvas) {
      const gradient = ctx.createLinearGradient(0, this.y - 30, 0, this.y + 30);
      gradient.addColorStop(0, 'rgba(0, 255, 200, 0)');
      gradient.addColorStop(0.5, `rgba(0, 255, 200, ${this.opacity})`);
      gradient.addColorStop(1, 'rgba(0, 255, 200, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, this.y - 30, canvas.width, 60);
    }
  }

  // Alert notification
  class Alert {
    constructor(canvas) {
      this.x = 50 + Math.random() * (canvas.width - 100);
      this.y = canvas.height;
      this.targetY = 100 + Math.random() * (canvas.height - 200);
      this.speed = 2 + Math.random() * 3;
      this.life = 200 + Math.random() * 100;
      this.maxLife = this.life;
      this.severity = Math.random();
      this.message = this.generateMessage();
    }

    generateMessage() {
      const types = ['INTRUSION', 'MALWARE', 'ANOMALY', 'BREACH', 'SCAN', 'EXPLOIT'];
      const sources = ['FW-01', 'IDS-03', 'EDR-02', 'SIEM', 'WAF-04', 'PROXY'];
      return `[${sources[Math.floor(Math.random() * sources.length)]}] ${types[Math.floor(Math.random() * types.length)]}`;
    }

    update() {
      if (this.y > this.targetY) {
        this.y -= this.speed;
      }
      this.life--;
      return this.life > 0;
    }

    draw(ctx) {
      const alpha = Math.min(this.life / 50, 1) * (this.life / this.maxLife);
      // Use proper green for safe events
      const color = this.severity > 0.7 ? '#ff3333' : this.severity > 0.4 ? '#ffaa00' : '#00ff66';

      // Alert box with glow
      ctx.fillStyle = `${color}15`;
      ctx.strokeStyle = `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;

      const width = 220;
      const height = 35;
      const cornerRadius = 5;

      // Rounded rectangle
      ctx.beginPath();
      ctx.moveTo(this.x - width/2 + cornerRadius, this.y - height/2);
      ctx.lineTo(this.x + width/2 - cornerRadius, this.y - height/2);
      ctx.quadraticCurveTo(this.x + width/2, this.y - height/2, this.x + width/2, this.y - height/2 + cornerRadius);
      ctx.lineTo(this.x + width/2, this.y + height/2 - cornerRadius);
      ctx.quadraticCurveTo(this.x + width/2, this.y + height/2, this.x + width/2 - cornerRadius, this.y + height/2);
      ctx.lineTo(this.x - width/2 + cornerRadius, this.y + height/2);
      ctx.quadraticCurveTo(this.x - width/2, this.y + height/2, this.x - width/2, this.y + height/2 - cornerRadius);
      ctx.lineTo(this.x - width/2, this.y - height/2 + cornerRadius);
      ctx.quadraticCurveTo(this.x - width/2, this.y - height/2, this.x - width/2 + cornerRadius, this.y - height/2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Text with better styling
      ctx.shadowBlur = 5;
      ctx.fillStyle = `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.message, this.x, this.y);
      ctx.shadowBlur = 0;
    }
  }

  // Metric graph (CPU, memory, threat level, etc.)
  class MetricGraph {
    constructor(x, y, width, height, label) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.label = label;
      this.dataPoints = [];
      this.maxPoints = 50;
      this.value = 30 + Math.random() * 40;

      for (let i = 0; i < this.maxPoints; i++) {
        this.dataPoints.push(30 + Math.random() * 40);
      }
    }

    update() {
      // Smooth value changes
      const target = 20 + Math.random() * 60;
      this.value += (target - this.value) * 0.05;

      this.dataPoints.push(this.value);
      if (this.dataPoints.length > this.maxPoints) {
        this.dataPoints.shift();
      }
    }

    draw(ctx) {
      // Background with gradient
      const bgGradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
      bgGradient.addColorStop(0, 'rgba(0, 20, 30, 0.7)');
      bgGradient.addColorStop(1, 'rgba(0, 10, 15, 0.7)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(this.x, this.y, this.width, this.height);

      // Border with glow
      ctx.strokeStyle = 'rgba(0, 255, 200, 0.4)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#00ffc8';
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      ctx.shadowBlur = 0;

      // Fill area under graph
      ctx.fillStyle = 'rgba(0, 255, 170, 0.1)';
      ctx.beginPath();
      ctx.moveTo(this.x, this.y + this.height);
      this.dataPoints.forEach((value, i) => {
        const x = this.x + (i / this.maxPoints) * this.width;
        const y = this.y + this.height - (value / 100) * this.height;
        ctx.lineTo(x, y);
      });
      ctx.lineTo(this.x + this.width, this.y + this.height);
      ctx.closePath();
      ctx.fill();

      // Graph line with glow
      ctx.strokeStyle = '#00ffaa';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00ffaa';
      ctx.beginPath();

      this.dataPoints.forEach((value, i) => {
        const x = this.x + (i / this.maxPoints) * this.width;
        const y = this.y + this.height - (value / 100) * this.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Label with better styling
      ctx.fillStyle = 'rgba(0, 255, 200, 0.9)';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(this.label, this.x + 8, this.y + 15);

      ctx.fillStyle = 'rgba(0, 255, 170, 1)';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`${Math.round(this.value)}%`, this.x + 8, this.y + 30);
    }
  }

  // Threat indicator - rotating radar-style indicator
  class ThreatIndicator {
    constructor(x, y, radius) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.angle = 0;
      this.threats = [];

      // Generate some threat points
      for (let i = 0; i < 8; i++) {
        this.threats.push({
          angle: Math.random() * Math.PI * 2,
          distance: 0.3 + Math.random() * 0.6,
          severity: Math.random()
        });
      }
    }

    update() {
      this.angle += 0.02;
      if (this.angle > Math.PI * 2) this.angle = 0;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      // Outer circle
      ctx.strokeStyle = 'rgba(0, 200, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner circles
      ctx.strokeStyle = 'rgba(0, 200, 255, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, (this.radius / 4) * i, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshair
      ctx.strokeStyle = 'rgba(0, 200, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(-this.radius, 0);
      ctx.lineTo(this.radius, 0);
      ctx.moveTo(0, -this.radius);
      ctx.lineTo(0, this.radius);
      ctx.stroke();

      // Scanning beam
      ctx.strokeStyle = 'rgba(0, 255, 200, 0.3)';
      ctx.lineWidth = 2;
      const gradient = ctx.createLinearGradient(0, 0,
        this.radius * Math.cos(this.angle),
        this.radius * Math.sin(this.angle));
      gradient.addColorStop(0, 'rgba(0, 255, 200, 0)');
      gradient.addColorStop(1, 'rgba(0, 255, 200, 0.5)');
      ctx.strokeStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(this.radius * Math.cos(this.angle), this.radius * Math.sin(this.angle));
      ctx.stroke();

      // Threat points with proper green
      this.threats.forEach(threat => {
        const x = threat.distance * this.radius * Math.cos(threat.angle);
        const y = threat.distance * this.radius * Math.sin(threat.angle);

        const color = threat.severity > 0.7 ? '#ff3333' : threat.severity > 0.4 ? '#ffaa00' : '#00ff66';
        ctx.fillStyle = color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  function init(canvas) {
    // Create floating data particles
    for (let i = 0; i < 80; i++) {
      particles.push(new DataParticle(canvas));
    }

    // Create scan lines
    for (let i = 0; i < 2; i++) {
      scanLines.push(new ScanLine(canvas));
    }

    // Create metric graphs
    const graphWidth = 190;
    const graphHeight = 85;
    const margin = 25;

    metrics.push(new MetricGraph(margin, margin, graphWidth, graphHeight, 'CPU Load'));
    metrics.push(new MetricGraph(margin, margin + graphHeight + 20, graphWidth, graphHeight, 'Network'));
    metrics.push(new MetricGraph(canvas.width - graphWidth - margin, margin, graphWidth, graphHeight, 'Threats'));
    metrics.push(new MetricGraph(canvas.width - graphWidth - margin, margin + graphHeight + 20, graphWidth, graphHeight, 'Memory'));

    // Create threat indicator (central radar)
    threatIndicators.push(new ThreatIndicator(canvas.width / 2, canvas.height / 2, 140));
  }

  function update(canvas) {
    // Update all elements
    particles.forEach(particle => particle.update(Date.now()));
    scanLines.forEach(line => line.update());
    metrics.forEach(metric => metric.update());
    threatIndicators.forEach(indicator => indicator.update());

    // Add random alerts (less frequent)
    if (Math.random() < 0.015) {
      alerts.push(new Alert(canvas));
    }

    // Update and filter alerts
    alerts = alerts.filter(alert => alert.update());
  }

  function draw(ctx, canvas) {
    // Dark background with subtle gradient
    const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0,
                                             canvas.width / 2, canvas.height / 2, canvas.width * 0.8);
    gradient.addColorStop(0, '#001a1a');
    gradient.addColorStop(0.5, '#001515');
    gradient.addColorStop(1, '#000a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw subtle grid lines
    ctx.strokeStyle = 'rgba(0, 255, 200, 0.05)';
    ctx.lineWidth = 1;
    const gridSpacing = 50;
    for (let x = 0; x < canvas.width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw floating particles
    particles.forEach(particle => particle.draw(ctx));

    // Draw scan lines
    scanLines.forEach(line => line.draw(ctx, canvas));

    // Draw threat indicator (central radar)
    threatIndicators.forEach(indicator => indicator.draw(ctx));

    // Draw metric graphs
    metrics.forEach(metric => metric.draw(ctx));

    // Draw alerts
    alerts.forEach(alert => alert.draw(ctx));

    // Draw title/header with better styling
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffc8';
    ctx.fillStyle = 'rgba(0, 255, 200, 0.9)';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[ SECURITY OPERATIONS CENTER ]', canvas.width / 2, 35);
    ctx.shadowBlur = 0;
  }

  function animate(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animFrame = () => {
      update(canvas);
      draw(ctx, canvas);
      rafId = requestAnimationFrame(animFrame);
    };

    rafId = requestAnimationFrame(animFrame);
  }

  function start(canvas, mode) {
    if (!canvas) return;

    stop();

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    init(canvas);
    animate(canvas);

    canvas.style.transition = 'opacity 1s ease-in';
    canvas.style.opacity = '1';

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Reinitialize
      particles = [];
      scanLines = [];
      metrics = [];
      threatIndicators = [];
      alerts = [];
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
