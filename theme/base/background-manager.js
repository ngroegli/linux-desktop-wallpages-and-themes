// Background manager - loads theme-specific background scripts dynamically
(function(){
  const canvas = document.getElementById('background-canvas');
  if(!canvas) return;

  let currentBackgroundScript = null;
  let currentMode = 'none';

  function scriptBaseDir(){
    const scripts = document.querySelectorAll('script[src]');
    for(let s of scripts){
      if(s.src.includes('background-manager.js')){
        return s.src.substring(0, s.src.lastIndexOf('/'));
      }
    }
    return '.';
  }

  async function loadBackgroundScript(themeName, mode){
    if(!themeName || !mode || mode === 'none') {
      stopBackground();
      return;
    }

    try {
      const base = scriptBaseDir();
      const scriptPath = base + '/../themes/' + encodeURIComponent(themeName) + '/background.js';

      // Clean up old script
      if(currentBackgroundScript){
        stopBackground();
        const oldScript = document.querySelector(`script[data-background-theme="${currentBackgroundScript}"]`);
        if(oldScript) oldScript.remove();
      }

      // Load new script
      const script = document.createElement('script');
      script.src = scriptPath;
      script.dataset.backgroundTheme = themeName;

      return new Promise((resolve, reject) => {
        script.onload = () => {
          currentBackgroundScript = themeName;
          currentMode = mode;

          // Initialize the background if the theme exposed a start function
          if(window.THEME_BACKGROUND && window.THEME_BACKGROUND.start){
            window.THEME_BACKGROUND.start(canvas, mode);
          }
          resolve();
        };
        script.onerror = () => {
          console.warn('No background.js found for theme:', themeName);
          resolve(); // Don't reject, just continue without background
        };

        document.body.appendChild(script);
      });
    } catch(e) {
      console.warn('Failed to load background for theme:', themeName, e);
    }
  }

  function stopBackground(){
    if(window.THEME_BACKGROUND && window.THEME_BACKGROUND.stop){
      window.THEME_BACKGROUND.stop();
    }
    // Clear canvas
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.opacity = '0';
    currentMode = 'none';
  }

  // Expose API
  window.WALLPAPER_BACKGROUND = {
    loadThemeBackground: loadBackgroundScript,
    stop: stopBackground,
    getCurrentMode: () => currentMode
  };

})();
