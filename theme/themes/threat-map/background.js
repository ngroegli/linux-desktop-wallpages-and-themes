// Threat Map - Static Network Topology Visualization
(function(){
  let canvas, ctx;
  let nodes = [];
  let connections = [];
  
  const CONFIG = {
    nodeCount: 20,
    connectionCount: 30
  };

  const COLORS = {
    background: '#0a0e1a',
    backgroundAlt: '#0d1120',
    grid: 'rgba(0, 255, 136, 0.12)',
    gridDot: 'rgba(0, 255, 136, 0.25)',
    connection: 'rgba(0, 200, 255, 0.35)',
    connectionBright: 'rgba(0, 255, 255, 0.6)',
    nodeIdle: '#00c8ff',
    nodeActive: '#00ff88',
    nodeAlert: '#ff3366',
    nodeCritical: '#ff0044',
    text: '#ffffff'
  };

  // Network node (server/endpoint)
  class NetworkNode {
    constructor(canvas) {
      this.x = 150 + Math.random() * (canvas.width - 300);
      this.y = 150 + Math.random() * (canvas.height - 300);
      this.radius = 6 + Math.random() * 4;
      this.state = this.randomState();
      this.label = this.generateLabel();
    }

    randomState() {
      const rand = Math.random();
      if (rand < 0.5) return 'idle';
      if (rand < 0.75) return 'active';
      if (rand < 0.9) return 'alert';
      return 'critical';
    }

    generateLabel() {
      const prefixes = ['SRV', 'NODE', 'EP', 'GW', 'FW', 'DB', 'API', 'CDN', 'DNS', 'LB'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const num = Math.floor(Math.random() * 99) + 1;
      return `${prefix}-${num.toString().padStart(2, '0')}`;
    }

    getColor() {
      switch(this.state) {
        case 'critical': return COLORS.nodeCritical;
        case 'alert': return COLORS.nodeAlert;
        case 'active': return COLORS.nodeActive;
        default: return COLORS.nodeIdle;
      }
    }

    draw(ctx) {
      const color = this.getColor();
      
      ctx.save();
      ctx.translate(this.x, this.y);
      
      // Large outer glow
      const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * 6);
      outerGlow.addColorStop(0, color.replace(')', ', 0.5)'));
      outerGlow.addColorStop(0.4, color.replace(')', ', 0.3)'));
      outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = outerGlow;
      ctx.shadowBlur = 25;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Outer ring for non-idle nodes
      if (this.state !== 'idle') {
        ctx.strokeStyle = color.replace(')', ', 0.7)');
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + 15, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Core circle
      ctx.fillStyle = color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Center bright dot
      ctx.fillStyle = COLORS.text;
      ctx.shadowBlur = 10;
      ctx.shadowColor = COLORS.text;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Label
      if (this.state !== 'idle') {
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        ctx.font = 'bold 11px "Courier New", monospace';
        ctx.fillStyle = COLORS.text;
        ctx.textAlign = 'center';
        ctx.fillText(this.label, 0, -this.radius - 18);
      }
      
      ctx.restore();
    }
  }

  // Connection between nodes
  class Connection {
    constructor(node1, node2) {
      this.node1 = node1;
      this.node2 = node2;
      this.bright = Math.random() > 0.6;
    }

    draw(ctx) {
      const color = this.bright ? COLORS.connectionBright : COLORS.connection;
      const lineWidth = this.bright ? 2.5 : 1.5;
      
      // Draw connection line
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.shadowColor = this.bright ? '#00ffff' : '#00c8ff';
      ctx.shadowBlur = this.bright ? 8 : 4;
      
      ctx.beginPath();
      ctx.moveTo(this.node1.x, this.node1.y);
      ctx.lineTo(this.node2.x, this.node2.y);
      ctx.stroke();
      
      // Reset shadow
      ctx.shadowBlur = 0;
    }
  }

  function drawGrid(ctx, canvas) {
    const spacing = 60;
    
    // Horizontal and vertical lines
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    
    for (let y = 0; y < canvas.height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    for (let x = 0; x < canvas.width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Grid dots at intersections
    ctx.fillStyle = COLORS.gridDot;
    for (let x = 0; x < canvas.width; x += spacing) {
      for (let y = 0; y < canvas.height; y += spacing) {
        if (Math.random() > 0.6) {
          ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
        }
      }
    }
  }

  function init(cvs) {
    canvas = cvs;
    ctx = canvas.getContext('2d');
    
    nodes = [];
    connections = [];
    
    // Create nodes
    for (let i = 0; i < CONFIG.nodeCount; i++) {
      nodes.push(new NetworkNode(canvas));
    }
    
    // Create connections (ensure each node has at least one connection)
    const connectionCount = new Map();
    nodes.forEach(node => connectionCount.set(node, 0));
    
    const maxAttempts = CONFIG.connectionCount * 3;
    let attempts = 0;
    
    while (connections.length < CONFIG.connectionCount && attempts < maxAttempts) {
      const node1 = nodes[Math.floor(Math.random() * nodes.length)];
      const node2 = nodes[Math.floor(Math.random() * nodes.length)];
      
      if (node1 !== node2) {
        // Check if connection already exists
        const exists = connections.some(c => 
          (c.node1 === node1 && c.node2 === node2) ||
          (c.node1 === node2 && c.node2 === node1)
        );
        
        if (!exists) {
          connections.push(new Connection(node1, node2));
          connectionCount.set(node1, connectionCount.get(node1) + 1);
          connectionCount.set(node2, connectionCount.get(node2) + 1);
        }
      }
      attempts++;
    }
    
    // Ensure every node has at least one connection
    nodes.forEach(node => {
      if (connectionCount.get(node) === 0) {
        const otherNode = nodes[Math.floor(Math.random() * nodes.length)];
        if (node !== otherNode) {
          connections.push(new Connection(node, otherNode));
        }
      }
    });
  }

  function draw() {
    // Background gradient
    const bgGradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.7
    );
    bgGradient.addColorStop(0, COLORS.backgroundAlt);
    bgGradient.addColorStop(1, COLORS.background);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid(ctx, canvas);
    
    // Draw connections
    connections.forEach(conn => conn.draw(ctx));
    
    // Draw nodes
    nodes.forEach(node => node.draw(ctx));
    
    ctx.shadowBlur = 0;
  }

  function start(canvas, mode) {
    if (!canvas || mode !== 'threat') return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    init(canvas);
    draw();
    
    canvas.style.transition = 'opacity 1.5s ease-in-out';
    canvas.style.opacity = '1';
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init(canvas);
      draw();
    };
    
    window.addEventListener('resize', handleResize);
    canvas._cleanupResize = () => {
      window.removeEventListener('resize', handleResize);
    };
  }

  function stop() {
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
