// Sunset Equalizer Background - Animated sound bar visualization
(function(){
  let rafId = null;
  let bars = [];
  const NUM_BARS = 48; // Number of equalizer bars
  const MIN_HEIGHT = 0.05; // Minimum bar height (5% of canvas)
  const MAX_HEIGHT = 0.50; // Maximum bar height (50% of canvas)

  // Color gradient stops for sunset theme
  const colors = [
    { stop: 0, color: '#ff1744' },    // Deep red
    { stop: 0.25, color: '#ff6b35' }, // Red-orange
    { stop: 0.5, color: '#ff9500' },  // Orange
    { stop: 0.75, color: '#ffcc00' }, // Yellow-orange
    { stop: 1, color: '#ffd700' }     // Golden yellow
  ];

  class EqualizerBar {
    constructor(index, totalBars) {
      this.index = index;
      this.totalBars = totalBars;

      // Position properties
      this.x = 0;
      this.width = 0;

      // Animation properties
      this.targetHeight = Math.random();
      this.currentHeight = this.targetHeight;
      this.velocity = 0;

      // Unique animation timing for each bar
      this.frequency = 0.02 + Math.random() * 0.03; // Speed of change
      this.phase = Math.random() * Math.PI * 2; // Starting phase
      this.smoothness = 0.15 + Math.random() * 0.1; // How smoothly it follows target

      // Beat-like behavior
      this.beatTimer = 0;
      this.beatInterval = 30 + Math.floor(Math.random() * 50);
      this.isBeating = false;
      this.beatIntensity = 0;
    }

    update(time) {
      // Create wave-like motion across bars
      const wave = Math.sin(time * this.frequency + this.phase + (this.index / this.totalBars) * Math.PI);

      // Add some randomness for organic feel
      const noise = (Math.random() - 0.5) * 0.1;

      // Beat simulation - occasional peaks
      this.beatTimer++;
      if (this.beatTimer > this.beatInterval) {
        this.beatTimer = 0;
        this.beatInterval = 30 + Math.floor(Math.random() * 50);
        this.isBeating = true;
        this.beatIntensity = 0.3 + Math.random() * 0.4;
      }

      if (this.isBeating) {
        this.beatIntensity *= 0.9; // Decay
        if (this.beatIntensity < 0.01) {
          this.isBeating = false;
        }
      }

      // Calculate target height
      this.targetHeight = MIN_HEIGHT +
                         (MAX_HEIGHT - MIN_HEIGHT) *
                         ((wave + 1) / 2 + noise + (this.isBeating ? this.beatIntensity : 0));

      // Clamp target
      this.targetHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, this.targetHeight));

      // Smooth interpolation to target
      const diff = this.targetHeight - this.currentHeight;
      this.velocity += diff * this.smoothness;
      this.velocity *= 0.8; // Damping
      this.currentHeight += this.velocity;

      // Clamp current
      this.currentHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, this.currentHeight));
    }

    draw(ctx, canvasWidth, canvasHeight) {
      const barWidth = canvasWidth / this.totalBars;
      const x = this.index * barWidth;
      const barHeight = this.currentHeight * canvasHeight;
      const y = canvasHeight - barHeight;

      // Create gradient based on height (sunset colors)
      const gradient = ctx.createLinearGradient(x, canvasHeight, x, y);

      // Map height to color intensity
      const heightRatio = this.currentHeight / MAX_HEIGHT;

      if (heightRatio < 0.3) {
        // Low bars - deep red to red-orange
        gradient.addColorStop(0, 'rgba(255, 23, 68, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 107, 53, 0.6)');
      } else if (heightRatio < 0.6) {
        // Medium bars - red-orange to orange
        gradient.addColorStop(0, 'rgba(255, 107, 53, 0.9)');
        gradient.addColorStop(0.5, 'rgba(255, 149, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 204, 0, 0.6)');
      } else {
        // High bars - orange to yellow with glow
        gradient.addColorStop(0, 'rgba(255, 149, 0, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 204, 0, 0.95)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0.85)');
      }

      // Draw bar with slight spacing
      const spacing = 2;
      ctx.fillStyle = gradient;
      ctx.fillRect(x + spacing/2, y, barWidth - spacing, barHeight);

      // Add glow effect for taller bars
      if (heightRatio > 0.5) {
        ctx.shadowBlur = 15 * heightRatio;
        ctx.shadowColor = heightRatio > 0.7 ? '#ffcc00' : '#ff6b35';
        ctx.fillRect(x + spacing/2, y, barWidth - spacing, barHeight);
        ctx.shadowBlur = 0;
      }

      // Add subtle reflection at the bottom
      if (barHeight > 20) {
        const reflectionGradient = ctx.createLinearGradient(x, canvasHeight, x, canvasHeight - 15);
        reflectionGradient.addColorStop(0, 'rgba(255, 107, 53, 0.2)');
        reflectionGradient.addColorStop(1, 'rgba(255, 107, 53, 0)');
        ctx.fillStyle = reflectionGradient;
        ctx.fillRect(x + spacing/2, canvasHeight - 15, barWidth - spacing, 15);
      }
    }
  }

  function init(canvas) {
    bars = [];
    for (let i = 0; i < NUM_BARS; i++) {
      bars.push(new EqualizerBar(i, NUM_BARS));
    }
  }

  function animate(canvas, startTime) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = (timestamp) => {
      const elapsed = (timestamp - startTime) / 1000;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw dark gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, 'rgba(26, 15, 10, 0.95)');
      bgGradient.addColorStop(0.5, 'rgba(40, 20, 10, 0.85)');
      bgGradient.addColorStop(1, 'rgba(50, 25, 15, 0.9)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw all bars
      bars.forEach(bar => {
        bar.update(elapsed);
        bar.draw(ctx, canvas.width, canvas.height);
      });

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
  }

  function start(canvas, mode) {
    if (!canvas) return;

    stop(); // Stop any existing animation

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    init(canvas);

    const startTime = performance.now();
    animate(canvas, startTime);

    // Fade in canvas
    canvas.style.transition = 'opacity 1s ease-in';
    canvas.style.opacity = '1';

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Store cleanup function
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

  // Expose API
  window.THEME_BACKGROUND = {
    start,
    stop
  };
})();
