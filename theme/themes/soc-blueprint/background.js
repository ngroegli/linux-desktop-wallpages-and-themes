// SOC Blueprint - Security Operations Center as Architectural Schematic
(function(){
  let rafId = null;
  let blueprintGrid = [];
  let securityNodes = [];
  let dataPipelines = [];
  let scanBeams = [];
  let alertMarkers = [];
  let annotations = [];
  let drawingLines = [];

  // Blueprint color scheme
  const COLORS = {
    blueprintBg: '#0E1F3F',
    blueprintDark: '#112B54',
    cyanLine: '#15D4FF',
    cyanLight: '#6CD5FF',
    white: '#FFFFFF',
    yellow: '#FFE135',
    red: '#FF3B3B',
    grey: '#8F9BA6'
  };

  // Blueprint grid line
  class GridLine {
    constructor(canvas, isVertical, position, isDashed) {
      this.isVertical = isVertical;
      this.position = position;
      this.isDashed = isDashed;
      this.opacity = isDashed ? 0.15 : 0.25;
    }

    draw(ctx, canvas) {
      ctx.strokeStyle = `rgba(21, 212, 255, ${this.opacity})`;
      ctx.lineWidth = this.isDashed ? 0.5 : 1;
      
      if (this.isDashed) {
        ctx.setLineDash([5, 5]);
      }

      ctx.beginPath();
      if (this.isVertical) {
        ctx.moveTo(this.position, 0);
        ctx.lineTo(this.position, canvas.height);
      } else {
        ctx.moveTo(0, this.position);
        ctx.lineTo(canvas.width, this.position);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Security node (subsystem)
  class SecurityNode {
    constructor(canvas, type) {
      this.x = 100 + Math.random() * (canvas.width - 200);
      this.y = 100 + Math.random() * (canvas.height - 200);
      this.size = 30 + Math.random() * 20;
      this.type = type; // 'firewall', 'sensor', 'endpoint', 'server'
      this.pulseOffset = Math.random() * Math.PI * 2;
      this.active = Math.random() > 0.3;
      this.label = this.generateLabel(type);
    }

    generateLabel(type) {
      const labels = {
        firewall: ['FW-01', 'FW-02', 'FW-EDGE'],
        sensor: ['IDS-A', 'IDS-B', 'IPS-01'],
        endpoint: ['EP-01', 'EP-02', 'WORKSTATION'],
        server: ['SVR-DB', 'SVR-WEB', 'SVR-APP']
      };
      const list = labels[type] || ['NODE'];
      return list[Math.floor(Math.random() * list.length)];
    }

    update(time) {
      this.pulse = Math.sin(time * 0.001 + this.pulseOffset) * 0.3 + 0.7;
    }

    draw(ctx, time) {
      ctx.save();
      ctx.translate(this.x, this.y);

      // Node shape based on type
      ctx.strokeStyle = this.active ? 
        `rgba(21, 212, 255, ${this.pulse})` : 
        `rgba(143, 155, 166, 0.6)`;
      ctx.lineWidth = 2;
      ctx.shadowColor = this.active ? COLORS.cyanLine : 'transparent';
      ctx.shadowBlur = this.active ? 10 : 0;

      if (this.type === 'firewall') {
        // Rectangle (wall)
        ctx.strokeRect(-this.size/2, -this.size/2, this.size, this.size);
      } else if (this.type === 'sensor') {
        // Circle (sensor)
        ctx.beginPath();
        ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
        ctx.stroke();
      } else if (this.type === 'endpoint') {
        // Triangle (endpoint)
        ctx.beginPath();
        ctx.moveTo(0, -this.size/2);
        ctx.lineTo(this.size/2, this.size/2);
        ctx.lineTo(-this.size/2, this.size/2);
        ctx.closePath();
        ctx.stroke();
      } else {
        // Hexagon (server)
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const x = Math.cos(angle) * this.size/2;
          const y = Math.sin(angle) * this.size/2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Center dot
      if (this.active) {
        ctx.fillStyle = `rgba(21, 212, 255, ${this.pulse})`;
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Label
      ctx.shadowBlur = 0;
      ctx.font = '10px monospace';
      ctx.fillStyle = `rgba(108, 213, 255, 0.8)`;
      ctx.textAlign = 'center';
      ctx.fillText(this.label, 0, this.size/2 + 15);

      ctx.restore();
    }
  }

  // Data pipeline (connection line)
  class DataPipeline {
    constructor(canvas, from, to) {
      this.from = from;
      this.to = to;
      this.flowOffset = 0;
      this.flowSpeed = 0.5 + Math.random() * 0.5;
      this.opacity = 0.4 + Math.random() * 0.3;
      this.isDashed = Math.random() > 0.5;
    }

    update() {
      this.flowOffset += this.flowSpeed;
      if (this.flowOffset > 20) this.flowOffset = 0;
    }

    draw(ctx) {
      ctx.strokeStyle = `rgba(21, 212, 255, ${this.opacity})`;
      ctx.lineWidth = 1.5;
      
      if (this.isDashed) {
        ctx.setLineDash([8, 8]);
        ctx.lineDashOffset = -this.flowOffset;
      }

      // Draw line with arrow
      ctx.beginPath();
      ctx.moveTo(this.from.x, this.from.y);
      ctx.lineTo(this.to.x, this.to.y);
      ctx.stroke();

      // Arrow head
      const angle = Math.atan2(this.to.y - this.from.y, this.to.x - this.from.x);
      const headLen = 10;
      const midX = (this.from.x + this.to.x) / 2;
      const midY = (this.from.y + this.to.y) / 2;

      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(
        midX - headLen * Math.cos(angle - Math.PI / 6),
        midY - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(midX, midY);
      ctx.lineTo(
        midX - headLen * Math.cos(angle + Math.PI / 6),
        midY - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Scanning beam
  class BlueprintScanBeam {
    constructor(canvas, isVertical) {
      this.isVertical = isVertical;
      this.position = Math.random();
      this.speed = 0.00008 + Math.random() * 0.00008;
      this.opacity = 0.3 + Math.random() * 0.2;
    }

    update(canvas) {
      this.position += this.speed;
      if (this.position > 1) this.position = 0;
    }

    draw(ctx, canvas) {
      const pos = this.isVertical ? 
        this.position * canvas.height : 
        this.position * canvas.width;

      const gradient = this.isVertical ?
        ctx.createLinearGradient(0, pos - 40, 0, pos + 40) :
        ctx.createLinearGradient(pos - 40, 0, pos + 40, 0);

      gradient.addColorStop(0, 'rgba(21, 212, 255, 0)');
      gradient.addColorStop(0.5, `rgba(21, 212, 255, ${this.opacity})`);
      gradient.addColorStop(1, 'rgba(21, 212, 255, 0)');

      ctx.fillStyle = gradient;
      
      if (this.isVertical) {
        ctx.fillRect(0, pos - 40, canvas.width, 80);
      } else {
        ctx.fillRect(pos - 40, 0, 80, canvas.height);
      }

      // Center line
      ctx.strokeStyle = `rgba(21, 212, 255, ${this.opacity * 1.5})`;
      ctx.lineWidth = 1;
      ctx.shadowColor = COLORS.cyanLine;
      ctx.shadowBlur = 8;

      ctx.beginPath();
      if (this.isVertical) {
        ctx.moveTo(0, pos);
        ctx.lineTo(canvas.width, pos);
      } else {
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, canvas.height);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  // Alert marker
  class AlertMarker {
    constructor(canvas) {
      this.x = 100 + Math.random() * (canvas.width - 200);
      this.y = 100 + Math.random() * (canvas.height - 200);
      this.size = 15;
      this.pulseOffset = Math.random() * Math.PI * 2;
      this.severity = Math.random();
    }

    update(time) {
      this.pulse = Math.sin(time * 0.003 + this.pulseOffset);
    }

    draw(ctx, time) {
      const color = this.severity > 0.7 ? COLORS.red : COLORS.yellow;
      const alpha = 0.6 + this.pulse * 0.4;

      ctx.save();
      ctx.translate(this.x, this.y);

      // Pulsing circle
      ctx.strokeStyle = color.replace(')', ', ' + alpha + ')');
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.stroke();

      // Inner circle
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      // Crosshair
      ctx.beginPath();
      ctx.moveTo(-this.size * 1.5, 0);
      ctx.lineTo(this.size * 1.5, 0);
      ctx.moveTo(0, -this.size * 1.5);
      ctx.lineTo(0, this.size * 1.5);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Blueprint annotation
  class Annotation {
    constructor(canvas) {
      this.x = 50 + Math.random() * (canvas.width - 100);
      this.y = 50 + Math.random() * (canvas.height - 100);
      this.text = this.generateText();
      this.opacity = 0.5 + Math.random() * 0.3;
    }

    generateText() {
      const texts = [
        'THREAT INTEL',
        'LOG PIPELINE',
        'DATA LAKE',
        'MITRE ATT&CK',
        'SIEM CORRELATION',
        'EDR AGENT',
        'NETWORK TAP',
        'SECURITY ZONE'
      ];
      return texts[Math.floor(Math.random() * texts.length)];
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);

      // Annotation line
      ctx.strokeStyle = `rgba(108, 213, 255, ${this.opacity})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(40, -20);
      ctx.lineTo(80, -20);
      ctx.stroke();
      ctx.setLineDash([]);

      // Text
      ctx.font = '9px monospace';
      ctx.fillStyle = `rgba(108, 213, 255, ${this.opacity})`;
      ctx.textAlign = 'left';
      ctx.fillText(this.text, 42, -17);

      ctx.restore();
    }
  }

  // Auto-drawing line effect
  class DrawingLine {
    constructor(canvas) {
      this.startX = Math.random() * canvas.width;
      this.startY = Math.random() * canvas.height;
      this.endX = Math.random() * canvas.width;
      this.endY = Math.random() * canvas.height;
      this.progress = 0;
      this.speed = 0.005 + Math.random() * 0.005;
      this.opacity = 0.3 + Math.random() * 0.3;
    }

    update() {
      this.progress += this.speed;
      if (this.progress > 1) this.progress = 1;
    }

    draw(ctx) {
      if (this.progress >= 1) return;

      const currentX = this.startX + (this.endX - this.startX) * this.progress;
      const currentY = this.startY + (this.endY - this.startY) * this.progress;

      ctx.strokeStyle = `rgba(21, 212, 255, ${this.opacity})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = COLORS.cyanLine;
      ctx.shadowBlur = 5;

      ctx.beginPath();
      ctx.moveTo(this.startX, this.startY);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  function init(canvas) {
    blueprintGrid = [];
    securityNodes = [];
    dataPipelines = [];
    scanBeams = [];
    alertMarkers = [];
    annotations = [];
    drawingLines = [];

    // Create blueprint grid
    const gridSpacing = 50;
    for (let x = 0; x < canvas.width; x += gridSpacing) {
      blueprintGrid.push(new GridLine(canvas, true, x, x % (gridSpacing * 4) !== 0));
    }
    for (let y = 0; y < canvas.height; y += gridSpacing) {
      blueprintGrid.push(new GridLine(canvas, false, y, y % (gridSpacing * 4) !== 0));
    }

    // Create security nodes
    const nodeTypes = ['firewall', 'sensor', 'endpoint', 'server'];
    for (let i = 0; i < 12; i++) {
      const type = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
      securityNodes.push(new SecurityNode(canvas, type));
    }

    // Create data pipelines between nodes
    for (let i = 0; i < 15; i++) {
      const from = securityNodes[Math.floor(Math.random() * securityNodes.length)];
      const to = securityNodes[Math.floor(Math.random() * securityNodes.length)];
      if (from !== to) {
        dataPipelines.push(new DataPipeline(canvas, from, to));
      }
    }

    // Create scan beams
    for (let i = 0; i < 2; i++) {
      scanBeams.push(new BlueprintScanBeam(canvas, true));
      scanBeams.push(new BlueprintScanBeam(canvas, false));
    }

    // Create alert markers
    for (let i = 0; i < 5; i++) {
      alertMarkers.push(new AlertMarker(canvas));
    }

    // Create annotations
    for (let i = 0; i < 8; i++) {
      annotations.push(new Annotation(canvas));
    }

    // Create drawing lines
    for (let i = 0; i < 5; i++) {
      drawingLines.push(new DrawingLine(canvas));
    }
  }

  function animate(canvas, startTime) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = (timestamp) => {
      const time = timestamp - startTime;

      // Blueprint background
      const bgGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.6
      );
      bgGradient.addColorStop(0, COLORS.blueprintDark);
      bgGradient.addColorStop(1, COLORS.blueprintBg);
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw blueprint grid
      blueprintGrid.forEach(line => line.draw(ctx, canvas));

      // Draw data pipelines
      dataPipelines.forEach(pipeline => {
        pipeline.update();
        pipeline.draw(ctx);
      });

      // Draw security nodes
      securityNodes.forEach(node => {
        node.update(time);
        node.draw(ctx, time);
      });

      // Draw annotations
      annotations.forEach(annotation => annotation.draw(ctx));

      // Draw alert markers
      alertMarkers.forEach(marker => {
        marker.update(time);
        marker.draw(ctx, time);
      });

      // Draw auto-drawing lines
      drawingLines.forEach(line => {
        line.update();
        line.draw(ctx);
      });

      // Draw scan beams
      scanBeams.forEach(beam => {
        beam.update(canvas);
        beam.draw(ctx, canvas);
      });

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
  }

  function start(canvas, mode) {
    if (!canvas || mode !== 'soc') return;

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
