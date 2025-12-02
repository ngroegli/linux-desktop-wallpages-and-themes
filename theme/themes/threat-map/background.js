// Threat Map Background - Globe with skull threat actors and attack vectors
(function(){
  let rafId = null;
  let nodes = [];
  let threats = [];
  let skulls = [];
  let globeRotation = 0;

  // Major cities/nodes for the map (longitude, latitude approximations for 2D projection)
  const LOCATIONS = [
    { name: 'New York', lon: -74, lat: 40 },
    { name: 'London', lon: 0, lat: 51 },
    { name: 'Tokyo', lon: 140, lat: 35 },
    { name: 'Singapore', lon: 104, lat: 1 },
    { name: 'Sydney', lon: 151, lat: -33 },
    { name: 'São Paulo', lon: -46, lat: -23 },
    { name: 'Moscow', lon: 37, lat: 55 },
    { name: 'Dubai', lon: 55, lat: 25 },
    { name: 'Mumbai', lon: 72, lat: 19 },
    { name: 'Los Angeles', lon: -118, lat: 34 },
    { name: 'Berlin', lon: 13, lat: 52 },
    { name: 'Hong Kong', lon: 114, lat: 22 }
  ];

  function projectToCanvas(lon, lat, canvas, rotation) {
    // Proper orthographic projection for sphere
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;

    // Convert to radians
    const lambda = (lon + rotation) * Math.PI / 180;
    const phi = lat * Math.PI / 180;

    // Orthographic projection formulas
    const cosPhi = Math.cos(phi);
    const cosLambda = Math.cos(lambda);

    // Check if point is on visible hemisphere
    const visible = cosLambda > 0;

    // Project onto sphere surface
    const x = centerX + radius * Math.sin(lambda) * cosPhi;
    const y = centerY - radius * Math.sin(phi);

    return { x, y, visible };
  }

  class NetworkNode {
    constructor(location) {
      this.name = location.name;
      this.lon = location.lon;
      this.lat = location.lat;
      this.radius = 6;
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.isUnderAttack = false;
      this.attackTimer = 0;
      this.x = 0;
      this.y = 0;
      this.visible = true;
    }

    updatePosition(canvas, rotation) {
      const pos = projectToCanvas(this.lon, this.lat, canvas, rotation);
      this.x = pos.x;
      this.y = pos.y;
      this.visible = pos.visible;
    }

    update(time) {
      this.pulse = Math.sin(time * 0.002 + this.pulsePhase) * 0.3 + 0.7;

      // Decay attack status
      if (this.attackTimer > 0) {
        this.attackTimer--;
      } else {
        this.isUnderAttack = false;
      }
    }

    setUnderAttack() {
      this.isUnderAttack = true;
      this.attackTimer = 120; // Stay yellow for a while
    }

    getColor() {
      // Green (safe) or Yellow (under attack)
      if (this.isUnderAttack) {
        return '#ffcc00'; // Yellow when attacked
      } else {
        return '#00ff88'; // Green when safe
      }
    }

    draw(ctx) {
      if (!this.visible) return;

      const color = this.getColor();
      const radius = this.radius * this.pulse * (this.isUnderAttack ? 1.5 : 1);

      // Outer glow
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;

      // Node circle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Attack warning ring
      if (this.isUnderAttack) {
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius * 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
    }
  }

  class ThreatSkull {
    constructor(canvas) {
      this.lon = Math.random() * 360 - 180;
      this.lat = (Math.random() - 0.5) * 120; // -60 to 60 lat
      this.size = 15 + Math.random() * 10;
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.x = 0;
      this.y = 0;
      this.visible = true;
      this.targetNode = null;
      this.attackProgress = 0;
      this.isAttacking = false;
    }

    updatePosition(canvas, rotation) {
      const pos = projectToCanvas(this.lon, this.lat, canvas, rotation);
      this.x = pos.x;
      this.y = pos.y;
      this.visible = pos.visible;
    }

    startAttack(node) {
      this.targetNode = node;
      this.isAttacking = true;
      this.attackProgress = 0;
    }

    update(time, nodes) {
      this.pulse = Math.sin(time * 0.003 + this.pulsePhase) * 0.3 + 0.7;

      // Randomly start attacks
      if (!this.isAttacking && Math.random() < 0.002 && this.visible) {
        const visibleNodes = nodes.filter(n => n.visible);
        if (visibleNodes.length > 0) {
          const target = visibleNodes[Math.floor(Math.random() * visibleNodes.length)];
          this.startAttack(target);
        }
      }

      if (this.isAttacking) {
        this.attackProgress += 0.015;
        if (this.attackProgress >= 1) {
          this.isAttacking = false;
          if (this.targetNode) {
            this.targetNode.setUnderAttack();
          }
        }
      }
    }

    draw(ctx) {
      if (!this.visible) return;

      const size = this.size * this.pulse;

      // Skull glow
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ff3333';

      // Skull shape (simplified)
      ctx.fillStyle = '#ff3333';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;

      // Head
      ctx.beginPath();
      ctx.arc(this.x, this.y - size * 0.2, size * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Eye sockets
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(this.x - size * 0.25, this.y - size * 0.3, size * 0.15, 0, Math.PI * 2);
      ctx.arc(this.x + size * 0.25, this.y - size * 0.3, size * 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Jaw
      ctx.fillStyle = '#ff3333';
      ctx.beginPath();
      ctx.rect(this.x - size * 0.4, this.y + size * 0.1, size * 0.8, size * 0.3);
      ctx.fill();
      ctx.stroke();

      // Teeth
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const tx = this.x - size * 0.35 + i * size * 0.18;
        ctx.beginPath();
        ctx.moveTo(tx, this.y + size * 0.1);
        ctx.lineTo(tx, this.y + size * 0.25);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
    }

    drawAttack(ctx) {
      if (!this.isAttacking || !this.visible || !this.targetNode || !this.targetNode.visible) return;

      const dx = this.targetNode.x - this.x;
      const dy = this.targetNode.y - this.y;
      const currentX = this.x + dx * this.attackProgress;
      const currentY = this.y + dy * this.attackProgress;

      // Attack beam
      const gradient = ctx.createLinearGradient(this.x, this.y, currentX, currentY);
      gradient.addColorStop(0, '#ff3333');
      gradient.addColorStop(1, '#ff000080');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff3333';

      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();

      // Attack particle
      ctx.fillStyle = '#ff0000';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
    }
  }

  class ThreatLine {
    constructor(fromNode, toNode) {
      this.from = fromNode;
      this.to = toNode;
      this.progress = 0;
      this.speed = 0.01 + Math.random() * 0.02;
      this.isActive = false;
      this.severity = Math.random();
      this.particles = [];
      this.maxParticles = 3;
    }

    activate() {
      this.isActive = true;
      this.progress = 0;
      this.from.activity = 1;
      this.to.activity = 1;
    }

    update() {
      if (!this.isActive && Math.random() < 0.002) {
        this.activate();
      }

      if (this.isActive) {
        this.progress += this.speed;

        // Add particles
        if (this.particles.length < this.maxParticles && Math.random() < 0.3) {
          this.particles.push({
            progress: this.progress,
            life: 1
          });
        }

        // Update particles
        this.particles = this.particles.filter(p => {
          p.progress += this.speed;
          p.life -= 0.02;
          return p.life > 0 && p.progress <= 1;
        });

        if (this.progress >= 1) {
          this.isActive = false;
          this.particles = [];
        }
      }
    }

    draw(ctx) {
      const dx = this.to.x - this.from.x;
      const dy = this.to.y - this.from.y;

      // Draw faint connection line
      ctx.strokeStyle = 'rgba(100, 100, 120, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.from.x, this.from.y);
      ctx.lineTo(this.to.x, this.to.y);
      ctx.stroke();

      if (this.isActive) {
        // Draw active threat line
        const currentX = this.from.x + dx * this.progress;
        const currentY = this.from.y + dy * this.progress;

        const color = this.severity > 0.7 ? '#ff3333' : '#ffaa00';

        // Gradient line
        const gradient = ctx.createLinearGradient(this.from.x, this.from.y, currentX, currentY);
        gradient.addColorStop(0, `${color}00`);
        gradient.addColorStop(0.7, color);
        gradient.addColorStop(1, color);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;

        ctx.beginPath();
        ctx.moveTo(this.from.x, this.from.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();

        // Draw particles
        this.particles.forEach(p => {
          const px = this.from.x + dx * p.progress;
          const py = this.from.y + dy * p.progress;

          ctx.fillStyle = color;
          ctx.shadowBlur = 15 * p.life;
          ctx.beginPath();
          ctx.arc(px, py, 3 * p.life, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.shadowBlur = 0;
      }
    }
  }

  function drawContinents(ctx, canvas, rotation) {
    // Simple, clean continent shapes - simplified polygons that look clean
    const continents = [
      // North America - simple recognizable shape
      [
        [-130, 70], [-100, 75], [-80, 72], [-70, 68], [-60, 62], [-65, 55],
        [-75, 50], [-80, 48], [-85, 50], [-95, 52], [-100, 48], [-110, 45],
        [-115, 40], [-120, 38], [-125, 35], [-128, 32], [-130, 28], [-128, 25],
        [-120, 20], [-105, 18], [-100, 15], [-92, 15], [-85, 22], [-80, 28],
        [-75, 32], [-72, 38], [-68, 42], [-65, 45], [-68, 48], [-72, 52],
        [-78, 58], [-85, 62], [-95, 65], [-105, 68], [-115, 68], [-125, 68]
      ],
      // South America - simple triangle-ish shape
      [
        [-82, 12], [-75, 10], [-70, 5], [-68, 0], [-65, -5], [-62, -10],
        [-58, -15], [-55, -20], [-52, -28], [-50, -35], [-52, -42], [-58, -50],
        [-65, -54], [-72, -55], [-78, -52], [-82, -45], [-85, -38], [-86, -30],
        [-85, -22], [-83, -15], [-82, -8], [-82, 0], [-83, 5]
      ],
      // Europe - compact shape
      [
        [-10, 70], [0, 72], [10, 72], [20, 70], [28, 68], [35, 65],
        [40, 62], [42, 58], [40, 54], [35, 50], [30, 48], [25, 45],
        [20, 43], [15, 42], [10, 43], [5, 45], [0, 48], [-5, 52],
        [-8, 58], [-10, 65]
      ],
      // Africa - recognizable shape
      [
        [-18, 35], [-10, 38], [0, 38], [10, 35], [20, 32], [30, 28],
        [38, 22], [42, 15], [45, 5], [48, -5], [50, -12], [50, -18],
        [48, -25], [45, -32], [40, -38], [33, -42], [25, -45], [18, -48],
        [10, -48], [5, -45], [0, -40], [-5, -35], [-8, -28], [-10, -20],
        [-10, -10], [-8, 0], [-5, 10], [-5, 20], [-8, 28], [-12, 32], [-15, 35]
      ],
      // Asia - large landmass
      [
        [40, 75], [50, 78], [65, 78], [80, 76], [95, 72], [110, 68],
        [125, 62], [138, 55], [148, 48], [155, 40], [158, 32], [158, 25],
        [155, 18], [148, 12], [140, 8], [130, 5], [120, 3], [110, 2],
        [100, 3], [90, 5], [82, 10], [75, 15], [68, 20], [62, 28],
        [58, 35], [55, 42], [52, 48], [48, 55], [45, 62], [42, 68]
      ],
      // Australia - simple oval-ish
      [
        [113, -12], [120, -10], [128, -12], [135, -15], [142, -18],
        [148, -22], [152, -28], [153, -35], [150, -40], [145, -43],
        [138, -45], [130, -45], [122, -43], [116, -40], [112, -35],
        [110, -28], [110, -22], [111, -16]
      ]
    ];

    ctx.shadowBlur = 0;

    continents.forEach(continent => {
      // Project all points first
      const projected = continent.map(([lon, lat]) => {
        const pos = projectToCanvas(lon, lat, canvas, rotation);
        return { x: pos.x, y: pos.y, visible: pos.visible };
      });

      // Count visible points
      const visibleCount = projected.filter(p => p.visible).length;

      // Only draw if more than 50% visible to avoid weird partial shapes
      if (visibleCount > continent.length * 0.5) {
        ctx.fillStyle = 'rgba(0, 160, 100, 0.5)';
        ctx.strokeStyle = 'rgba(0, 200, 120, 0.7)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        let started = false;

        projected.forEach((point, idx) => {
          if (point.visible) {
            if (!started) {
              ctx.moveTo(point.x, point.y);
              started = true;
            } else {
              ctx.lineTo(point.x, point.y);
            }
          }
        });

        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    });
  }  function drawGlobe(ctx, canvas, rotation) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.35;

    // Ocean/Globe sphere (blue gradient)
    const globeGradient = ctx.createRadialGradient(
      centerX - radius * 0.3, centerY - radius * 0.3, 0,
      centerX, centerY, radius
    );
    globeGradient.addColorStop(0, 'rgba(30, 60, 120, 0.4)');
    globeGradient.addColorStop(0.7, 'rgba(20, 40, 80, 0.6)');
    globeGradient.addColorStop(1, 'rgba(10, 20, 50, 0.8)');

    ctx.fillStyle = globeGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw continents on the globe
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();
    drawContinents(ctx, canvas, rotation);
    ctx.restore();

    // Globe outline
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.5)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ff88';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Latitude lines
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;

    for (let lat = -60; lat <= 60; lat += 30) {
      const y = centerY - radius * (lat / 90) * 0.9;
      const width = radius * Math.cos(lat * Math.PI / 180) * 2;

      ctx.beginPath();
      ctx.ellipse(centerX, y, width / 2, width / 15, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Longitude lines
    for (let lon = 0; lon < 180; lon += 30) {
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * Math.abs(Math.cos(lon * Math.PI / 180)), radius, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function init(canvas) {
    nodes = [];
    skulls = [];
    globeRotation = 0;

    // Create nodes
    LOCATIONS.forEach(loc => {
      nodes.push(new NetworkNode(loc));
    });

    // Create threat actor skulls
    for (let i = 0; i < 8; i++) {
      skulls.push(new ThreatSkull(canvas));
    }
  }

  function animate(canvas, startTime) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = (timestamp) => {
      const time = timestamp - startTime;

      // Clear with dark background
      ctx.fillStyle = '#0a0a12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Slowly rotate globe
      globeRotation += 0.1;

      // Draw globe with continents
      drawGlobe(ctx, canvas, globeRotation);

      // Update positions based on rotation
      nodes.forEach(node => {
        node.updatePosition(canvas, globeRotation);
        node.update(time);
      });

      skulls.forEach(skull => {
        skull.updatePosition(canvas, globeRotation);
        skull.update(time, nodes);
      });

      // Draw attack beams first (behind everything)
      skulls.forEach(skull => {
        skull.drawAttack(ctx);
      });

      // Draw nodes
      nodes.forEach(node => {
        node.draw(ctx);
      });

      // Draw skulls
      skulls.forEach(skull => {
        skull.draw(ctx);
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
