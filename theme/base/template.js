// Base template JS (updated to load per-theme JSON from sibling theme folders)
(function(){
  const els = {
    time: () => document.getElementById('top-clock-time'),
    date: () => document.getElementById('top-clock-date'),
    cpuValue: () => document.getElementById('cpu-value'),
    cpuBar: () => document.getElementById('cpu-bar'),
    ramValue: () => document.getElementById('ram-value'),
    ramBar: () => document.getElementById('ram-bar'),
    latency: () => document.getElementById('latency-value'),
    netStatus: () => document.getElementById('net-status'),
    centerImage: () => document.getElementById('center-image'),
    centerTitle: () => document.getElementById('center-title')
  };

  function el(name){ return (els[name] && els[name]()) || null }

  function updateClock(){
    const now = new Date();
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    const t = el('time'); if(t) t.textContent = `${h}:${m}:${s}`;
    const days=['SUN','MON','TUE','WED','THU','FRI','SAT'];
    const months=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const d = el('date'); if(d) d.textContent = `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}`;
  }

  function formatBytes(bytes){
    if(bytes === 0) return '0 B';
    const units = ['B','KB','MB','GB','TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + units[i];
  }

  function updateSimStats(){
    const cpu = 10 + Math.random()*60;
    const ram = 20 + Math.random()*50;
    const latency = Math.floor(5 + Math.random()*40);
    const cores = navigator.hardwareConcurrency || 4;
    const freq = 2400 + Math.floor(Math.random()*800);
    const ramTotal = 8 * 1024 * 1024 * 1024; // 8GB
    const ramUsed = Math.floor(ramTotal * (ram/100));
    const diskTotal = 256 * 1024 * 1024 * 1024; // 256GB
    const diskFree = Math.floor(diskTotal * 0.4);
    setStats({
      cpu: { percent: cpu, count: cores, freq: freq },
      ram: { percent: ram, total: ramTotal, used: ramUsed },
      disk: { percent: 60, total: diskTotal, free: diskFree },
      network: { bytes_sent: 0, bytes_recv: 0 },
      os: { distro: 'Unknown', version: 'N/A', kernel: 'N/A', architecture: 'N/A' },
      latency
    });
  }

  function setStats({cpu, ram, disk, network, os, latency}){
    if(cpu){
      const pct = cpu.percent ?? cpu;
      const cEl = el('cpuValue'); if(cEl) cEl.textContent = `${Number(pct).toFixed(1)}%`;
      const cBar = el('cpuBar'); if(cBar) cBar.style.width = `${Math.min(100, pct)}%`;
      const coresEl = document.getElementById('cpu-cores'); if(coresEl && cpu.count) coresEl.textContent = cpu.count;
      const freqEl = document.getElementById('cpu-freq'); if(freqEl && cpu.freq) freqEl.textContent = `${cpu.freq} MHz`;
    }

    if(ram){
      const rpct = ram.percent ?? 0;
      const rEl = el('ramValue'); if(rEl) rEl.textContent = `${Number(rpct).toFixed(1)}%`;
      const rBar = el('ramBar'); if(rBar) rBar.style.width = `${Math.min(100, rpct)}%`;
      const totalEl = document.getElementById('ram-total'); if(totalEl && ram.total) totalEl.textContent = formatBytes(ram.total);
      const usedEl = document.getElementById('ram-used'); if(usedEl && ram.used) usedEl.textContent = formatBytes(ram.used);
    }

    if(disk){
      const dpct = disk.percent ?? 0;
      const dpEl = document.getElementById('disk-percent'); if(dpEl) dpEl.textContent = `${Number(dpct).toFixed(1)}%`;
      const dBar = document.getElementById('disk-bar'); if(dBar) dBar.style.width = `${Math.min(100, dpct)}%`;
      const dt = document.getElementById('disk-total'); if(dt && disk.total) dt.textContent = formatBytes(disk.total);
      const df = document.getElementById('disk-free'); if(df && disk.free) df.textContent = formatBytes(disk.free);
    }

    if(network){
      const ns = document.getElementById('net-sent'); if(ns && network.bytes_sent != null) ns.textContent = formatBytes(network.bytes_sent);
      const nr = document.getElementById('net-recv'); if(nr && network.bytes_recv != null) nr.textContent = formatBytes(network.bytes_recv);
    }

    if(os){
      const osDistro = document.getElementById('os-distro'); if(osDistro && os.distro) osDistro.textContent = os.distro;
      const osVersion = document.getElementById('os-version'); if(osVersion && os.version) osVersion.textContent = os.version;
      const osKernel = document.getElementById('os-kernel'); if(osKernel && os.kernel) osKernel.textContent = os.kernel;
      const osArch = document.getElementById('os-arch'); if(osArch && os.architecture) osArch.textContent = os.architecture;
    }

    const latEl = el('latency'); if(latEl && latency != null) latEl.textContent = `${latency}ms`;
  }

  // compute base path for the script so we can find sibling theme folders reliably
  function scriptBaseDir(){
    let script = document.currentScript;
    if(!script){
      const scripts = document.getElementsByTagName('script');
      script = scripts[scripts.length-1];
    }
    const src = (script && script.src) ? script.src : window.location.href;
    return src.substring(0, src.lastIndexOf('/'));
  }

  async function fetchStats(){
    const base = window.API_BASE || null;
    if(!base) return null;
    try{
      // Try unified endpoint first (more efficient)
      const resp = await fetch(base + '/api/stats', {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache'
      });

      if(!resp.ok) {
        console.warn('API returned error:', resp.status, resp.statusText);
        return null;
      }

      const data = await resp.json();
      return data;
    }catch(e){
      console.warn('Failed to fetch stats from', base, '- Error:', e.message);
      return null;
    }
  }

  // theme helpers
  function applyTheme(theme, themeName){
    if(!theme) return;
    const root = document.documentElement;
    Object.keys(theme).forEach(k=> {
      if(k.startsWith('--')) root.style.setProperty(k, theme[k]);
    });
    // Load theme-specific background if defined
    if(theme.backgroundMode && window.WALLPAPER_BACKGROUND && themeName){
      window.WALLPAPER_BACKGROUND.loadThemeBackground(themeName, theme.backgroundMode);
    }
  }

  async function setThemeByName(name){
    if(!name) return;
    try{
      const base = scriptBaseDir();
      // theme folders are in themes/ subdirectory, e.g. base/ -> ../themes/<name>/theme.json
      const themePath = base + '/../themes/' + encodeURIComponent(name) + '/theme.json';
      const resp = await fetch(themePath);
      if(!resp.ok) throw new Error('Theme not found: ' + themePath);
      const json = await resp.json();
      applyTheme(json, name);
      return json;
    }catch(e){
      console.warn('Failed to load theme', e);
      return null;
    }
  }



  function setTitle(text, show){
    const t = el('centerTitle');
    if(!t) return;

    // If show is explicitly false, hide the title
    if(show === false){
      t.style.display = 'none';
      return;
    }

    // Otherwise show/hide based on text content
    if(!text){
      t.textContent = '';
      t.style.display = 'none';
      return;
    }

    t.textContent = text;
    t.style.display = 'block';
  }

  let apiReachable = false;
  let usingRandomData = true;

  function setNetStatus(status){
    const ns = el('netStatus');
    if(ns) ns.textContent = status;
  }

  function setAllPanelStatus(status){
    // Set status for all panels
    const cpuStatus = document.getElementById('cpu-status');
    const ramStatus = document.getElementById('ram-status');
    const diskStatus = document.getElementById('disk-status');
    const netStatus = document.getElementById('net-status');
    const osStatus = document.getElementById('os-status');

    if(cpuStatus) cpuStatus.textContent = status;
    if(ramStatus) ramStatus.textContent = status;
    if(diskStatus) diskStatus.textContent = status;
    if(netStatus) netStatus.textContent = status;
    if(osStatus) osStatus.textContent = status;
  }

  // Load config.json and apply settings
  async function loadConfig(){
    try{
      const base = scriptBaseDir();
      const resp = await fetch(base + '/../config/config.json');
      if(!resp.ok) throw new Error('config.json not found');
      const cfg = await resp.json();

      // Apply theme
      if(cfg.theme){
        if(typeof cfg.theme === 'string') await setThemeByName(cfg.theme);
        else applyTheme(cfg.theme);
      }

      // Apply title (respect showTitle setting, default to false)
      const showTitle = cfg.showTitle !== undefined ? cfg.showTitle : false;
      if(showTitle && cfg.title) {
        setTitle(cfg.title, true);
      } else {
        setTitle('', false);
      }

      // Set API base
      if(cfg.apiBase) window.API_BASE = cfg.apiBase;

      // Expose config globally for background.js
      window.WALLPAPER_CONFIG = cfg;

      return cfg;
    }catch(e){
      console.warn('Failed to load config.json, using defaults', e);
      return null;
    }
  }

  window.WALLPAPER_TEMPLATE = {
    setTitle,
    setStats,
    fetchStats,
    applyTheme,
    setThemeName: setThemeByName,
    loadConfig
  };

  // boot
  updateClock(); setInterval(updateClock, 1000);

  // Try to reach API, fall back to randomized if unreachable
  async function initStats(){
    if(window.API_BASE){
      const s = await fetchStats();
      if(s){
        apiReachable = true;
        usingRandomData = false;
        setAllPanelStatus('ONLINE');
        setStats({cpu: s.cpu, ram: s.ram, disk: s.disk, network: s.network, os: s.os, latency: 0});
        return;
      }
    }
    // API not reachable, use randomized
    apiReachable = false;
    usingRandomData = true;
    setAllPanelStatus('RANDOMIZED');
    updateSimStats();
  }

  initStats();

  setInterval(async()=>{
    if(window.API_BASE){
      const s = await fetchStats();
      if(s){
        if(!apiReachable){
          apiReachable = true;
          usingRandomData = false;
          setAllPanelStatus('ONLINE');
        }
        setStats({cpu: s.cpu, ram: s.ram, disk: s.disk, network: s.network, os: s.os, latency: 0});
      }else{
        if(apiReachable){
          apiReachable = false;
          usingRandomData = true;
          setAllPanelStatus('RANDOMIZED');
        }
        updateSimStats();
      }
    }else{
      if(!usingRandomData){
        usingRandomData = true;
        setAllPanelStatus('RANDOMIZED');
      }
      updateSimStats();
    }
  }, 5000);

  // Load config at boot (async after page load)
  (async()=>{
    const cfg = await loadConfig();

    // If config didn't set a theme, fall back to legacy TEMPLATE_THEME/TEMPLATE_CONFIG
    if(!cfg || !cfg.theme){
      if(window.TEMPLATE_THEME){
        if(typeof window.TEMPLATE_THEME === 'string') await setThemeByName(window.TEMPLATE_THEME);
        else applyTheme(window.TEMPLATE_THEME);
      }
      if(window.TEMPLATE_CONFIG && window.TEMPLATE_CONFIG.theme){
        const t = window.TEMPLATE_CONFIG.theme;
        if(typeof t === 'string') await setThemeByName(t);
        else applyTheme(t);
      }
    }
  })();

})();
