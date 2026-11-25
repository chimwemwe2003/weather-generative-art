/**
 * Atmosphere — Weather Generative Art
 * Translates live atmospheric conditions into dynamic, organic visual generative art.
 */

(function () {
  'use strict';

  // --- Simplex Noise 2D & 3D (Self-contained, fast implementation) ---
  class SimplexNoise {
    constructor(seed = Math.random()) {
      this.p = new Uint8Array(256);
      for (let i = 0; i < 256; i++) this.p[i] = i;
      let s = Math.floor(seed * 65536);
      for (let i = 255; i > 0; i--) {
        s = (s * 9301 + 49297) % 233280;
        const j = Math.floor((s / 233280) * (i + 1));
        const temp = this.p[i];
        this.p[i] = this.p[j];
        this.p[j] = temp;
      }
      this.perm = new Uint8Array(512);
      this.permMod12 = new Uint8Array(512);
      for (let i = 0; i < 512; i++) {
        this.perm[i] = this.p[i & 255];
        this.permMod12[i] = this.perm[i] % 12;
      }
    }

    noise2D(xin, yin) {
      const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
      const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
      let n0 = 0, n1 = 0, n2 = 0;

      const s = (xin + yin) * F2;
      const i = Math.floor(xin + s);
      const j = Math.floor(yin + s);
      const t = (i + j) * G2;
      const X0 = i - t;
      const Y0 = j - t;
      const x0 = xin - X0;
      const y0 = yin - Y0;

      let i1, j1;
      if (x0 > y0) { i1 = 1; j1 = 0; }
      else { i1 = 0; j1 = 1; }

      const x1 = x0 - i1 + G2;
      const y1 = y0 - j1 + G2;
      const x2 = x0 - 1.0 + 2.0 * G2;
      const y2 = y0 - 1.0 + 2.0 * G2;

      const ii = i & 255;
      const jj = j & 255;
      const gi0 = this.permMod12[ii + this.perm[jj]];
      const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
      const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];

      let t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 >= 0) {
        t0 *= t0;
        n0 = t0 * t0 * this.dot2(gi0, x0, y0);
      }
      let t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 >= 0) {
        t1 *= t1;
        n1 = t1 * t1 * this.dot2(gi1, x1, y1);
      }
      let t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 >= 0) {
        t2 *= t2;
        n2 = t2 * t2 * this.dot2(gi2, x2, y2);
      }
      return 70.0 * (n0 + n1 + n2);
    }

    noise3D(x, y, z) {
      const F3 = 1.0 / 3.0;
      const G3 = 1.0 / 6.0;
      let n0, n1, n2, n3;

      const s = (x + y + z) * F3;
      const i = Math.floor(x + s);
      const j = Math.floor(y + s);
      const k = Math.floor(z + s);
      const t = (i + j + k) * G3;
      const X0 = i - t;
      const Y0 = j - t;
      const Z0 = k - t;
      const x0 = x - X0;
      const y0 = y - Y0;
      const z0 = z - Z0;

      let i1, j1, k1, i2, j2, k2;
      if (x0 >= y0) {
        if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
        else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
        else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
      } else {
        if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
        else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
        else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      }

      const x1 = x0 - i1 + G3;
      const y1 = y0 - j1 + G3;
      const z1 = z0 - k1 + G3;
      const x2 = x0 - i2 + 2.0 * G3;
      const y2 = y0 - j2 + 2.0 * G3;
      const z2 = z0 - k2 + 2.0 * G3;
      const x3 = x0 - 1.0 + 3.0 * G3;
      const y3 = y0 - 1.0 + 3.0 * G3;
      const z3 = z0 - 1.0 + 3.0 * G3;

      const ii = i & 255;
      const jj = j & 255;
      const kk = k & 255;
      const gi0 = this.permMod12[ii + this.perm[jj + this.perm[kk]]];
      const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]];
      const gi2 = this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]];
      const gi3 = this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]];

      let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
      if (t0 < 0) n0 = 0.0;
      else { t0 *= t0; n0 = t0 * t0 * this.dot3(gi0, x0, y0, z0); }

      let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
      if (t1 < 0) n1 = 0.0;
      else { t1 *= t1; n1 = t1 * t1 * this.dot3(gi1, x1, y1, z1); }

      let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
      if (t2 < 0) n2 = 0.0;
      else { t2 *= t2; n2 = t2 * t2 * this.dot3(gi2, x2, y2, z2); }

      let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
      if (t3 < 0) n3 = 0.0;
      else { t3 *= t3; n3 = t3 * t3 * this.dot3(gi3, x3, y3, z3); }

      return 32.0 * (n0 + n1 + n2 + n3);
    }

    dot2(gi, x, y) {
      const grad2 = [
        [1, 1], [-1, 1], [1, -1], [-1, -1],
        [1, 0], [-1, 0], [1, 0], [-1, 0],
        [0, 1], [0, -1], [0, 1], [0, -1]
      ];
      const g = grad2[gi];
      return g[0] * x + g[1] * y;
    }

    dot3(gi, x, y, z) {
      const grad3 = [
        [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
        [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
        [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
      ];
      const g = grad3[gi];
      return g[0] * x + g[1] * y + g[2] * z;
    }
  }

  // --- Weather Codes Interpretation ---
  const WMO_MAP = {
    0: 'Clear Sky',
    1: 'Mainly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Freezing Fog',
    51: 'Light Drizzle',
    53: 'Moderate Drizzle',
    55: 'Dense Drizzle',
    56: 'Freezing Drizzle',
    57: 'Freezing Drizzle',
    61: 'Slight Rain',
    63: 'Moderate Rain',
    65: 'Heavy Rain',
    66: 'Freezing Rain',
    67: 'Freezing Rain',
    71: 'Slight Snow',
    73: 'Moderate Snow',
    75: 'Heavy Snow',
    77: 'Snow Grains',
    80: 'Rain Showers',
    81: 'Heavy Showers',
    82: 'Violent Showers',
    85: 'Snow Showers',
    86: 'Heavy Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with Hail',
    99: 'Severe Thunderstorm'
  };

  // --- Default Atmospheric Weather ---
  const defaultWeather = {
    temp: 20,
    windSpeed: 12,
    windDirection: 180,
    precipitation: 0,
    cloudCover: 25,
    weatherCode: 1,
    isDay: 1,
    locationName: 'Local Sky'
  };

  let currentWeather = { ...defaultWeather };
  let isDarkMode = true;

  // --- DOM Elements ---
  const canvas = document.getElementById('art-canvas');
  const ctx = canvas.getContext('2d');
  const themeToggle = document.getElementById('theme-toggle');

  // --- Canvas Dimensions & Resolution ---
  let width = 0;
  let height = 0;
  let dpr = 1;
  const simplex = new SimplexNoise();

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });
  resize();

  // --- Color Palette Generator based on Temperature & Theme ---
  function getPalette(temp, isDay, isDark) {
    let baseHue;
    if (temp <= 0) {
      baseHue = 195 + Math.max(-20, temp); // Ice cyan/blue
    } else if (temp < 15) {
      baseHue = 180 - ((temp / 15) * 40); // Cyan to emerald
    } else if (temp < 28) {
      baseHue = 140 - (((temp - 15) / 13) * 105); // Emerald to amber gold
    } else {
      baseHue = (35 - ((temp - 28) * 3) + 360) % 360; // Warm amber to coral/crimson
    }

    const secondaryHue = (baseHue + 45) % 360;
    const accentHue = (baseHue + 160) % 360;

    if (isDark) {
      return {
        bg: 'rgba(11, 12, 16, 0.08)',
        clearBg: '#0b0c10',
        hues: [baseHue, secondaryHue, accentHue],
        saturation: isDay ? 78 : 68,
        lightness: isDay ? 62 : 52,
        alpha: 0.36,
        blendMode: 'lighter'
      };
    } else {
      return {
        bg: 'rgba(248, 250, 252, 0.09)',
        clearBg: '#f8fafc',
        hues: [baseHue, secondaryHue, (baseHue - 35 + 360) % 360],
        saturation: isDay ? 66 : 52,
        lightness: isDay ? 42 : 36,
        alpha: 0.28,
        blendMode: 'multiply'
      };
    }
  }

  // --- Interactive Pointer / Touch State ---
  const mouse = {
    x: -9999,
    y: -9999,
    radius: 190,
    isDown: false
  };

  const ripples = [];

  window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('pointerdown', (e) => {
    mouse.isDown = true;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    ripples.push({
      x: e.clientX,
      y: e.clientY,
      radius: 4,
      maxRadius: Math.min(width, height) * 0.45,
      alpha: 0.8,
      speed: 6.5
    });
  });

  window.addEventListener('pointerup', () => {
    mouse.isDown = false;
  });

  window.addEventListener('pointerleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // --- Particle System ---
  let particles = [];
  const MAX_PARTICLES = Math.min(2400, Math.floor((width * height) / 700));

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(firstInit = false) {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.prevX = this.x;
      this.prevY = this.y;
      this.vx = 0;
      this.vy = 0;
      this.life = firstInit ? Math.random() * 200 : 0;
      this.maxLife = 160 + Math.random() * 220;
      this.hueOffset = (Math.random() - 0.5) * 45;
      this.size = 0.8 + Math.random() * 2.2;
      this.speedScale = 0.65 + Math.random() * 0.85;
    }

    update(time, flowScale, windVx, windVy, palette, isPrecip, isSnow) {
      this.life++;
      if (this.life >= this.maxLife || this.x < -40 || this.x > width + 40 || this.y < -40 || this.y > height + 40) {
        this.reset();
        return;
      }

      this.prevX = this.x;
      this.prevY = this.y;

      // Base vector field derived from Simplex Noise
      const noiseAngle = simplex.noise3D(this.x * flowScale, this.y * flowScale, time * 0.00018) * Math.PI * 2.4;
      let fieldVx = Math.cos(noiseAngle) * 1.8 * this.speedScale;
      let fieldVy = Math.sin(noiseAngle) * 1.8 * this.speedScale;

      // Wind influence
      fieldVx += windVx;
      fieldVy += windVy;

      // Rain / Snow atmospheric dynamics
      if (isPrecip) {
        fieldVy += 2.8 * this.speedScale;
        fieldVx += (Math.random() - 0.5) * 0.4;
      } else if (isSnow) {
        fieldVy += 0.9 * this.speedScale;
        fieldVx += Math.sin(time * 0.003 + this.y * 0.02) * 1.2;
      }

      // Pointer interaction
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius && dist > 1) {
        const force = (1 - dist / mouse.radius);
        const angle = Math.atan2(dy, dx);
        if (mouse.isDown) {
          fieldVx += Math.cos(angle + Math.PI / 2) * force * 5;
          fieldVy += Math.sin(angle + Math.PI / 2) * force * 5;
        } else {
          fieldVx -= Math.cos(angle) * force * 3.6;
          fieldVy -= Math.sin(angle) * force * 3.6;
        }
      }

      // Ripples influence
      for (let i = 0; i < ripples.length; i++) {
        const rip = ripples[i];
        const rdx = this.x - rip.x;
        const rdy = this.y - rip.y;
        const rDist = Math.sqrt(rdx * rdx + rdy * rdy);
        const diff = Math.abs(rDist - rip.radius);
        if (diff < 35 && rDist > 0) {
          const push = ((35 - diff) / 35) * rip.alpha * 4;
          fieldVx += (rdx / rDist) * push;
          fieldVy += (rdy / rDist) * push;
        }
      }

      this.vx += (fieldVx - this.vx) * 0.12;
      this.vy += (fieldVy - this.vy) * 0.12;

      this.x += this.vx;
      this.y += this.vy;
    }

    draw(ctx, palette) {
      const lifeRatio = this.life / this.maxLife;
      const fade = Math.sin(lifeRatio * Math.PI);
      const alpha = palette.alpha * fade;

      const hue = (palette.hues[0] + this.hueOffset + 360) % 360;
      ctx.beginPath();
      ctx.moveTo(this.prevX, this.prevY);
      ctx.lineTo(this.x, this.y);

      ctx.strokeStyle = `hsla(${hue}, ${palette.saturation}%, ${palette.lightness}%, ${alpha})`;
      ctx.lineWidth = this.size;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
      particles.push(new Particle());
    }
  }
  initParticles();

  // --- Thunderstorm & Lightning Simulation ---
  let lightningAlpha = 0;
  let nextLightning = Date.now() + 6000;

  function handleLightning(weatherCode) {
    const isThunder = [95, 96, 99].includes(weatherCode);
    if (!isThunder) return;

    const now = Date.now();
    if (now > nextLightning) {
      lightningAlpha = 0.6 + Math.random() * 0.35;
      nextLightning = now + 4000 + Math.random() * 8000;
    }

    if (lightningAlpha > 0.01) {
      ctx.save();
      ctx.fillStyle = isDarkMode
        ? `rgba(220, 230, 255, ${lightningAlpha})`
        : `rgba(255, 255, 255, ${lightningAlpha * 0.6})`;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
      lightningAlpha *= 0.88;
    }
  }

  // --- Main Animation Loop ---
  let animTime = 0;
  function animate(timestamp) {
    animTime = timestamp || 0;

    const temp = currentWeather.temp;
    const windSpeed = currentWeather.windSpeed;
    const windDirRad = (currentWeather.windDirection * Math.PI) / 180;
    const cloudCover = currentWeather.cloudCover;
    const weatherCode = currentWeather.weatherCode;
    const isDay = currentWeather.isDay;

    const windMagnitude = Math.min(Math.max(windSpeed / 18, 0.4), 2.5);
    const windVx = Math.cos(windDirRad) * windMagnitude * 0.6;
    const windVy = Math.sin(windDirRad) * windMagnitude * 0.6;

    const flowScale = 0.0012 + (cloudCover / 100) * 0.0014;

    const isPrecip = currentWeather.precipitation > 0.2 || [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode);
    const isSnow = [71, 73, 75, 77, 85, 86].includes(weatherCode);

    const palette = getPalette(temp, isDay, isDarkMode);

    // Trail persistence backdrop
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, width, height);

    // Dynamic blending
    ctx.globalCompositeOperation = palette.blendMode;

    // Particles update & draw
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.update(animTime, flowScale, windVx, windVy, palette, isPrecip, isSnow);
      p.draw(ctx, palette);
    }

    // Ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      rip.radius += rip.speed;
      rip.alpha *= 0.94;
      if (rip.alpha < 0.02 || rip.radius > rip.maxRadius) {
        ripples.splice(i, 1);
      }
    }

    // Lightning flashes during thunderstorms
    handleLightning(weatherCode);

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  // --- Theme Management ---
  function applyTheme(darkMode) {
    isDarkMode = darkMode;
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme_preference', darkMode ? 'dark' : 'light');

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = darkMode ? '#0b0c10' : '#f8fafc';
    ctx.fillRect(0, 0, width, height);
  }

  const savedTheme = localStorage.getItem('theme_preference');
  if (savedTheme) {
    applyTheme(savedTheme === 'dark');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark);
  }

  themeToggle.addEventListener('click', () => {
    applyTheme(!isDarkMode);
  });

  // --- Weather Fetching & Location Resolution ---
  function updateWeatherStatus(weather, locName) {
    const condName = WMO_MAP[weather.weatherCode] || 'Atmosphere';
    const statusText = `Atmosphere — ${Math.round(weather.temp)}°C ${condName} (${locName})`;
    document.title = statusText;
    canvas.setAttribute('title', statusText);
    themeToggle.setAttribute('title', `Toggle theme • Current: ${Math.round(weather.temp)}°C ${condName}`);
  }

  async function fetchWeather(lat, lon, locName = 'Local Sky') {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather API error');
      const data = await res.json();
      const current = data.current;

      currentWeather = {
        temp: current.temperature_2m ?? defaultWeather.temp,
        windSpeed: current.wind_speed_10m ?? defaultWeather.windSpeed,
        windDirection: current.wind_direction_10m ?? defaultWeather.windDirection,
        precipitation: current.precipitation ?? 0,
        cloudCover: current.cloud_cover ?? defaultWeather.cloudCover,
        weatherCode: current.weather_code ?? defaultWeather.weatherCode,
        isDay: current.is_day ?? 1,
        locationName: locName
      };

      updateWeatherStatus(currentWeather, locName);
    } catch (err) {
      console.warn('Weather fetch fallback:', err);
      updateWeatherStatus(currentWeather, locName);
    }
  }

  async function detectLocationAndWeather() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          let placeName = 'Your Location';

          try {
            const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              placeName = geoData.city || geoData.locality || geoData.principalSubdivision || 'Your Location';
            }
          } catch (_) {
            // Keep fallback
          }

          fetchWeather(lat, lon, placeName);
        },
        async () => {
          fallbackToIPLocation();
        },
        { timeout: 7000, enableHighAccuracy: false }
      );
    } else {
      fallbackToIPLocation();
    }
  }

  async function fallbackToIPLocation() {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          const place = data.city ? `${data.city}, ${data.country_code}` : 'Your Region';
          fetchWeather(data.latitude, data.longitude, place);
          return;
        }
      }
    } catch (_) {
      // Ignore
    }
    updateWeatherStatus(currentWeather, 'Atmosphere');
  }

  detectLocationAndWeather();
  setInterval(detectLocationAndWeather, 15 * 60 * 1000);
})();
