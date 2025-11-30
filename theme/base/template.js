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
      latency
    });
  }

  function setStats({cpu, ram, disk, network, latency}){
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
      const [cpuResp, ramResp, diskResp, netResp] = await Promise.all([
        fetch(base + '/api/cpu'),
        fetch(base + '/api/ram'),
        fetch(base + '/api/disk'),
        fetch(base + '/api/network')
      ]);
      const cpuJson = await cpuResp.json();
      const ramJson = await ramResp.json();
      const diskJson = await diskResp.json();
      const netJson = await netResp.json();
      return { cpu: cpuJson, ram: ramJson, disk: diskJson, network: netJson };
    }catch(e){
      console.warn('Failed to fetch stats', e);
      return null;
    }
  }

  // theme helpers
  function applyTheme(theme){
    if(!theme) return;
    const root = document.documentElement;
    Object.keys(theme).forEach(k=> root.style.setProperty(k, theme[k]));
  }

  async function setThemeByName(name){
    if(!name) return;
    try{
      const base = scriptBaseDir();
      // theme folders are sibling to base, e.g. base/ -> ../<name>/theme.json
      const themePath = base + '/../' + encodeURIComponent(name) + '/theme.json';
      const resp = await fetch(themePath);
      if(!resp.ok) throw new Error('Theme not found: ' + themePath);
      const json = await resp.json();
      applyTheme(json);
    }catch(e){
      console.warn('Failed to load theme', e);
    }
  }

  function setCenterImage(url){
    const img = el('centerImage');
    if(!img) return;
    if(!url){ img.removeAttribute('src'); img.style.display='none'; return; }
    img.style.display='block'; img.src = url;
  }

  function setTitle(text){ const t = el('centerTitle'); if(t) t.textContent = text || ''; }

  window.WALLPAPER_TEMPLATE = {
    setCenterImage,
    setTitle,
    setStats,
    fetchStats,
    applyTheme,
    setThemeName: setThemeByName
  };

  // boot
  updateClock(); setInterval(updateClock, 1000);
  updateSimStats(); setInterval(updateSimStats, 3000);

  setInterval(async()=>{
    if(window.API_BASE){
      const s = await fetchStats();
      if(s) setStats({cpu: s.cpu, ram: s.ram, disk: s.disk, network: s.network, latency: 0});
    }
  }, 5000);

  // auto-apply provided theme config
  if(window.TEMPLATE_THEME){
    if(typeof window.TEMPLATE_THEME === 'string') setThemeByName(window.TEMPLATE_THEME);
    else applyTheme(window.TEMPLATE_THEME);
  }
  if(window.TEMPLATE_CONFIG && window.TEMPLATE_CONFIG.theme){
    const t = window.TEMPLATE_CONFIG.theme;
    if(typeof t === 'string') setThemeByName(t);
    else applyTheme(t);
  }

})();
