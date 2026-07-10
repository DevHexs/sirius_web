// Módulo R-9: Simulador Crítico de Cohetes
// Sirius SAAC

const $ = id => document.getElementById(id);
const mass = $('mass'), thrust = $('thrust'), burn = $('burn'), drag = $('drag'), angle = $('angle');
const dragLabelsNormal = ['Ninguno', 'Bajo', 'Medio', 'Alto'];
const dragLabelsKids = ['¡Sin Viento! ☀️', 'Viento Suave 🍃', 'Viento Medio 💨', '¡Tormenta! 🌪️'];
const dragK = [0, 0.0025, 0.008, 0.02];

let currentMode = 'normal';
let lastLaunchResult = null;
let lastDrawProgress = 1;
let particles = [];
let landingEffectTriggered = false;

function syncLabels() {
  $('massVal').textContent = parseFloat(mass.value).toFixed(1) + ' kg';
  $('thrustVal').textContent = thrust.value + ' N';
  $('burnVal').textContent = parseFloat(burn.value).toFixed(1) + ' s';
  $('dragVal').textContent = currentMode === 'normal' ? dragLabelsNormal[drag.value] : dragLabelsKids[drag.value];
  $('angleVal').textContent = angle.value + '°';
}
[mass, thrust, burn, drag, angle].forEach(el => el.addEventListener('input', syncLabels));
syncLabels();

// ---- Cadet Mode Toggling & Text Management ----
function updateAiCardTexts() {
  const isShow = $('aiCard').classList.contains('show');
  if (!isShow) return;

  const titleText = currentMode === 'normal' ? 'IA DE VUELO' : '🤖 ROBOT ASISTENTE';
  const confidenceText = currentMode === 'normal' ? 'confianza del modelo: 96%' : '¡seguridad de mi cálculo: 96%! ⭐';
  
  $('aiCard').querySelector('.ai-badge').textContent = titleText;
  $('aiConfidence').textContent = confidenceText;

  const contentDiv = $('aiCard').querySelector('p strong').parentElement;
  if (currentMode === 'normal') {
    contentDiv.innerHTML = `<strong>Ángulo recomendado: 45°</strong> — según mi modelo, este ángulo maximiza el alcance del cohete.`;
    contentDiv.nextElementSibling.textContent = `Basé este cálculo en las ecuaciones clásicas de tiro parabólico.`;
    $('revealBtn').textContent = $('caveat').classList.contains('show') 
      ? '¿Qué información NO consideró la IA? ▴' 
      : '¿Qué información NO consideró la IA? ▾';
    $('caveat').innerHTML = `La IA usó un modelo <strong>sin fricción del aire</strong>. En la vida real, el arrastre frena más al cohete
      mientras más tiempo y más rápido vuela — y eso cambia cuál ángulo da el mejor resultado.
      Prueba a subir el "Arrastre del aire" al máximo y lanza con distintos ángulos:
      <strong>¿45° sigue siendo el mejor, o hay un ángulo más bajo que gana?</strong>`;
  } else {
    contentDiv.innerHTML = `<strong>¡Te aconsejo inclinarlo a 35° - 45°! 🚀</strong> — ¡Mi supercalculadora dice que es la dirección perfecta para volar súper lejos!`;
    contentDiv.nextElementSibling.textContent = `Hice esta cuenta pensando en un mundo mágico sin viento ni gravedad pesada.`;
    $('revealBtn').textContent = $('caveat').classList.contains('show') 
      ? '¿Por qué fallará mi cálculo si hay viento? ▴' 
      : '¿Por qué fallará mi cálculo si hay viento? ▾';
    $('caveat').innerHTML = `¡El viento real frena a nuestro cohete! 🌬️ Mi consejo de 45° solo funciona si no hay aire.
      Pero en la vida real, el viento lo empuja hacia atrás. 
      <strong>¡Reto!</strong> Sube el "Viento en Contra" al máximo y prueba a lanzarlo más inclinado (como a 35°):
      ¡verás que llega más lejos que a 45°! 🛸`;
  }
}

function setMode(mode) {
  currentMode = mode;
  const btn = $('btnToggleMode');
  const body = document.body;

  if (mode === 'normal') {
    body.classList.remove('kids-mode');
    if (btn) {
      btn.textContent = '🔬 Modo Científico';
      btn.classList.remove('kids-active');
    }
    $('panelTitle').textContent = 'Parámetros del cohete';
    $('lblMass').textContent = 'Masa';
    $('lblThrust').textContent = 'Empuje';
    $('lblBurn').textContent = 'Tiempo de quema';
    $('lblDrag').textContent = 'Arrastre del aire';
    $('lblAngle').textContent = 'Ángulo de lanzamiento';
    $('lblApogee').textContent = 'Apogeo';
    $('lblRange').textContent = 'Alcance';
    $('lblVel').textContent = 'Vel. máxima';
    $('lblTime').textContent = 'Tiempo de vuelo';
  } else {
    body.classList.add('kids-mode');
    if (btn) {
      btn.textContent = '🚀 Modo Cadete';
      btn.classList.add('kids-active');
    }
    $('panelTitle').textContent = '¡Prepara tu Cohete! 🚀';
    $('lblMass').textContent = 'Peso del Cohete ⚖️';
    $('lblThrust').textContent = 'Fuerza del Motor 💪';
    $('lblBurn').textContent = 'Tiempo de Combustible ⚡';
    $('lblDrag').textContent = 'Viento en Contra 🌬️';
    $('lblAngle').textContent = 'Inclinación del Cañón 📐';
    $('lblApogee').textContent = 'Altura Máxima 🚀';
    $('lblRange').textContent = 'Distancia de Vuelo 🏁';
    $('lblVel').textContent = 'Velocidad Máxima ⚡';
    $('lblTime').textContent = 'Tiempo en el Aire ⏱️';
  }
  updateAiCardTexts();
  syncLabels();
  
  if (lastLaunchResult) {
    draw(lastLaunchResult.pts, lastLaunchResult.burnT, 0.02, lastDrawProgress);
  } else {
    draw([{ x: 0, y: 0 }], 0);
  }
}

const btnToggleMode = $('btnToggleMode');
if (btnToggleMode) {
  btnToggleMode.addEventListener('click', () => {
    const targetMode = currentMode === 'normal' ? 'kids' : 'normal';
    setMode(targetMode);
  });
}

// ---- Canvas setup ----
const canvas = $('stage');
const ctx = canvas.getContext('2d');
function resize() {
  const r = canvas.getBoundingClientRect();
  canvas.width = r.width * devicePixelRatio;
  canvas.height = r.height * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  draw([{ x: 0, y: 0 }], 0);
}
window.addEventListener('resize', resize);
resize();

let launchCount = 0;
let lastAiAngle = null;
let animId = null;

function simulate(m, T, burnT, k, angDeg) {
  const g = 9.81;
  const rad = angDeg * Math.PI / 180;
  let vx = 0, vy = 0, x = 0, y = 0, t = 0;
  const dt = 0.02;
  const pts = [{ x: 0, y: 0 }];
  let maxV = 0, apogee = 0;

  while (true) {
    const inBurn = t < burnT;
    const Fx = inBurn ? T * Math.cos(rad) : 0;
    const Fy = inBurn ? T * Math.sin(rad) : 0;
    const speed = Math.hypot(vx, vy);
    const dragFx = k * speed * vx;
    const dragFy = k * speed * vy;
    const ax = (Fx - dragFx) / m;
    const ay = (Fy - dragFy) / m - g;
    vx += ax * dt; vy += ay * dt;
    x += vx * dt; y += vy * dt;
    t += dt;
    if (y < 0) { y = 0; pts.push({ x, y }); break; }
    pts.push({ x, y });
    maxV = Math.max(maxV, Math.hypot(vx, vy));
    apogee = Math.max(apogee, y);
    if (t > 60) break;
  }
  return { pts, apogee, range: x, maxV, time: t, burnT };
}

function updateAndDrawParticles(ctx, rx, ry, angleRad, isBurning) {
  // Spawn new flame particles if burning
  if (isBurning) {
    const jetAngle = angleRad + Math.PI + (Math.random() - 0.5) * 0.4;
    const speed = 2 + Math.random() * 4;
    particles.push({
      x: rx,
      y: ry,
      vx: Math.cos(jetAngle) * speed,
      vy: Math.sin(jetAngle) * speed,
      size: 6 + Math.random() * 6,
      alpha: 1.0,
      color: Math.random() < 0.6 ? '#FF4D80' : (Math.random() < 0.5 ? '#FFD23F' : '#FF6B35'),
      decay: 0.02 + Math.random() * 0.02
    });
  }

  // Update and draw existing particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.decay;
    p.size *= 0.96;

    if (p.alpha <= 0 || p.size < 0.5) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function triggerLandingEffect(lx, ly) {
  for (let k = 0; k < 30; k++) {
    const ang = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 5;
    particles.push({
      x: lx,
      y: ly,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed - (1.5 + Math.random() * 2.5),
      size: 5 + Math.random() * 8,
      alpha: 1.0,
      color: Math.random() < 0.4 ? '#FFD23F' : (Math.random() < 0.4 ? '#FF4D80' : '#7EE0A0'),
      decay: 0.015 + Math.random() * 0.02
    });
  }
}

function drawAchievementBadge(ctx, w, h, result) {
  if (currentMode !== 'kids' || !result) return;
  
  let title = "¡VUELO INCREÍBLE! 🚀";
  let desc = "¡Gran despegue, Cadete!";
  
  if (result.maxV > 120) {
    title = "¡HIPERSÓNICO! ⚡";
    desc = `Superaste los 120 m/s (${fmt(result.maxV)} m/s)`;
  } else if (result.apogee > 200) {
    title = "¡MISIÓN ESPACIAL! 🌌";
    desc = `¡Llegaste súper alto! (${fmt(result.apogee)} m)`;
  } else if (result.range > 350) {
    title = "¡DISTANCIA RÉCORD! 🏁";
    desc = `¡Lanzamiento muy lejano! (${fmt(result.range)} m)`;
  } else if (lastAiAngle !== null) {
    const m = parseFloat(mass.value);
    const T = parseFloat(thrust.value);
    const bt = parseFloat(burn.value);
    const k = dragK[drag.value];
    const aiResult = simulate(m, T, bt, k, lastAiAngle);
    if (result.range > aiResult.range) {
      title = "¡CAMPEÓN VS IA! 🏆";
      desc = "¡Superaste el consejo de la IA!";
    }
  }

  // Centered box at the top
  ctx.save();
  ctx.translate(w / 2 - 140, 24);
  
  // Background card
  ctx.fillStyle = 'rgba(29, 11, 53, 0.92)';
  ctx.strokeStyle = '#FFD23F';
  ctx.lineWidth = 2.5;
  
  ctx.beginPath();
  const rx = 0, ry = 0, rw = 280, rh = 58, radVal = 10;
  ctx.moveTo(rx + radVal, ry);
  ctx.lineTo(rx + rw - radVal, ry);
  ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + radVal);
  ctx.lineTo(rx + rw, ry + rh - radVal);
  ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - radVal, ry + rh);
  ctx.lineTo(rx + radVal, ry + rh);
  ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - radVal);
  ctx.lineTo(rx, ry + radVal);
  ctx.quadraticCurveTo(rx, ry, rx + radVal, ry);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Shadow/Glow effect
  ctx.shadowColor = 'rgba(255, 210, 63, 0.4)';
  ctx.shadowBlur = 10;
  ctx.strokeStyle = '#FFD23F';
  ctx.stroke();

  // Text
  ctx.shadowBlur = 0; // reset
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFD23F';
  ctx.font = 'bold 13.5px "Space Grotesk", sans-serif';
  ctx.fillText(title, 140, 22);
  
  ctx.fillStyle = '#E7ECF3';
  ctx.font = '500 11px "Space Grotesk", sans-serif';
  ctx.fillText(desc, 140, 42);
  
  ctx.restore();
}

function draw(pts, burnT, dt = 0.02, progress = 1) {
  lastDrawProgress = progress;
  const w = canvas.getBoundingClientRect().width;
  const h = canvas.getBoundingClientRect().height;
  ctx.clearRect(0, 0, w, h);

  if (currentMode === 'normal') {
    // Normal space stars background
    ctx.fillStyle = '#182036';
    for (let i = 0; i < 40; i++) {
      const sx = (i * 97) % w, sy = (i * 53) % (h * 0.6);
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }
  } else {
    // Playful stars space background for kids
    ctx.fillStyle = '#FFD23F';
    for (let i = 0; i < 25; i++) {
      const sx = (i * 123) % w;
      const sy = (i * 71) % (h * 0.55);
      const twinkle = (i + Math.floor(Date.now() / 250)) % 3;
      const size = 1.8 + twinkle;
      ctx.fillRect(sx - size/2, sy, size, size);
      ctx.fillRect(sx, sy - size/2, size, size);
    }

    // Saturn-like planet
    ctx.save();
    ctx.translate(w * 0.85, h * 0.22);
    // Ring
    ctx.strokeStyle = 'rgba(255, 77, 128, 0.7)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 9, Math.PI / 6, 0, Math.PI * 2);
    ctx.stroke();
    // Body
    ctx.fillStyle = '#FFD23F';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Cute small planet
    ctx.fillStyle = '#7EE0A0';
    ctx.beginPath();
    ctx.arc(w * 0.4, h * 0.15, 11, 0, Math.PI * 2);
    ctx.fill();
    // Crater
    ctx.fillStyle = '#5CA677';
    ctx.beginPath();
    ctx.arc(w * 0.4 - 2, h * 0.15 - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const maxX = Math.max(...pts.map(p => p.x), 10);
  const maxY = Math.max(...pts.map(p => p.y), 10);
  const pad = 40;
  const scale = Math.min((w - pad * 2) / maxX, (h - pad * 1.6) / maxY);
  const groundY = h - 36;
  const toScreen = p => ({ sx: pad + p.x * scale, sy: groundY - p.y * scale });

  if (currentMode === 'kids') {
    // Fluffy clouds near ground
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < 5; i++) {
      const cx = (i * w / 4) - 20;
      const cy = groundY - 6;
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.arc(cx + 15, cy - 8, 28, 0, Math.PI * 2);
      ctx.arc(cx + 35, cy, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    // Green hills background
    ctx.fillStyle = '#21163B';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.quadraticCurveTo(w * 0.3, groundY - 26, w * 0.6, groundY);
    ctx.quadraticCurveTo(w * 0.85, groundY - 16, w, groundY);
    ctx.fill();
    
    ctx.fillStyle = '#2A1B4E';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.quadraticCurveTo(w * 0.25, groundY - 12, w * 0.5, groundY);
    ctx.quadraticCurveTo(w * 0.75, groundY - 20, w, groundY);
    ctx.fill();
  }

  // ground
  ctx.strokeStyle = currentMode === 'normal' ? '#232A3A' : '#4E2A84';
  ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w, groundY); ctx.stroke();

  // trajectory path
  const count = Math.floor(pts.length * progress);
  ctx.strokeStyle = currentMode === 'normal' ? '#3A4B63' : '#FF4D80';
  ctx.lineWidth = currentMode === 'normal' ? 2 : 3.5;
  ctx.beginPath();
  pts.slice(0, count).forEach((p, i) => {
    const { sx, sy } = toScreen(p);
    if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
  });
  ctx.stroke();

  // rocket + flame at current point
  if (count > 0) {
    const cur = pts[count - 1];
    const { sx, sy } = toScreen(cur);
    const idxTime = count * dt;
    const burning = idxTime < burnT;

    const prev = pts[Math.max(0, count - 2)];
    const ang = Math.atan2(-(cur.y - prev.y), cur.x - prev.x);

    // Update and draw particles (kids mode only)
    if (currentMode === 'kids') {
      updateAndDrawParticles(ctx, sx, sy, ang, burning);

      if (progress === 1 && !landingEffectTriggered) {
        landingEffectTriggered = true;
        triggerLandingEffect(sx, sy);
      }
    }

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(-ang + Math.PI / 2);

    if (currentMode === 'normal') {
      if (burning) {
        ctx.beginPath();
        ctx.moveTo(-4, 10); ctx.lineTo(0, 22 + Math.random() * 8); ctx.lineTo(4, 10);
        ctx.closePath();
        ctx.fillStyle = '#FF6B35';
        ctx.fill();
      }
      ctx.beginPath();
      ctx.moveTo(0, -12); ctx.lineTo(6, 10); ctx.lineTo(-6, 10); ctx.closePath();
      ctx.fillStyle = '#E7ECF3';
      ctx.fill();
    } else {
      // Cute cartoon rocket
      // Fins
      ctx.fillStyle = '#FF4D80';
      ctx.beginPath();
      ctx.moveTo(-5, 4); ctx.lineTo(-12, 10); ctx.lineTo(-5, 10); ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(5, 4); ctx.lineTo(12, 10); ctx.lineTo(5, 10); ctx.closePath();
      ctx.fill();

      // Main body
      ctx.fillStyle = '#E7ECF3';
      ctx.beginPath();
      ctx.arc(0, -2, 6, Math.PI, 0); // top dome
      ctx.lineTo(6, 10);
      ctx.lineTo(-6, 10);
      ctx.closePath();
      ctx.fill();

      // Nose cone
      ctx.fillStyle = '#FF4D80';
      ctx.beginPath();
      ctx.arc(0, -2, 6, Math.PI, 0);
      ctx.lineTo(0, -14);
      ctx.closePath();
      ctx.fill();

      // Circular window
      ctx.fillStyle = '#FFD23F';
      ctx.beginPath();
      ctx.arc(0, 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Draw Achievement Badge if landing completed
  if (progress === 1) {
    drawAchievementBadge(ctx, w, h, lastLaunchResult);
  }
}

function animateLaunch(result) {
  const { pts, burnT} = result;
  let i = 0;
  particles = [];
  landingEffectTriggered = false;
  
  const step = () => {
    i += Math.max(1, Math.floor(pts.length / 160));
    const progress = Math.min(1, i / pts.length);
    draw(pts, burnT, 0.02, progress);
    if (progress < 1) {
      animId = requestAnimationFrame(step);
    }
  };
  if (animId) cancelAnimationFrame(animId);
  step();
}

function fmt(n) { return n.toLocaleString('es', { maximumFractionDigits: 1 }); }

function addLogRow(n, ang, dragLbl, apogee, range, vsAi) {
  const body = $('logBody');
  if (launchCount === 1) { body.innerHTML = ''; }
  const tr = document.createElement('tr');
  let tagHtml = '<span class="muted">—</span>';
  if (vsAi !== null) {
    tagHtml = vsAi
      ? `<span class="tag better">${currentMode === 'normal' ? 'superó a la IA' : '¡Superaste a la IA! 🏆'}</span>`
      : `<span class="tag worse">${currentMode === 'normal' ? 'bajo la IA' : 'Bajo la IA 🤖'}</span>`;
  }
  tr.innerHTML = `<td>${n}</td><td>${ang}°</td><td>${dragLbl}</td><td>${fmt(apogee)} m</td><td>${fmt(range)} m</td><td>${tagHtml}</td>`;
  body.prepend(tr);
}

$('launchBtn').addEventListener('click', () => {
  const m = parseFloat(mass.value);
  const T = parseFloat(thrust.value);
  const bt = parseFloat(burn.value);
  const k = dragK[drag.value];
  const ang = parseFloat(angle.value);

  const result = simulate(m, T, bt, k, ang);
  lastLaunchResult = result;
  animateLaunch(result);

  $('tApogee').textContent = fmt(result.apogee) + ' m';
  $('tRange').textContent = fmt(result.range) + ' m';
  $('tVel').textContent = fmt(result.maxV) + ' m/s';
  $('tTime').textContent = fmt(result.time) + ' s';

  launchCount++;
  let vsAi = null;
  if (lastAiAngle !== null && ang !== lastAiAngle) {
    const aiResult = simulate(m, T, bt, k, lastAiAngle);
    vsAi = result.range > aiResult.range;
  }
  
  const currentDragLabel = currentMode === 'normal' ? dragLabelsNormal[drag.value] : dragLabelsKids[drag.value];
  addLogRow(launchCount, ang, currentDragLabel, result.apogee, result.range, vsAi);
});

$('aiBtn').addEventListener('click', () => {
  angle.value = 45;
  syncLabels();
  lastAiAngle = 45;
  $('aiCard').classList.add('show');
  $('caveat').classList.remove('show');
  updateAiCardTexts();
});

$('revealBtn').addEventListener('click', () => {
  const c = $('caveat');
  c.classList.toggle('show');
  if (currentMode === 'normal') {
    $('revealBtn').textContent = c.classList.contains('show')
      ? '¿Qué información NO consideró la IA? ▴'
      : '¿Qué información NO consideró la IA? ▾';
  } else {
    $('revealBtn').textContent = c.classList.contains('show')
      ? '¿Por qué fallará mi cálculo si hay viento? ▴'
      : '¿Por qué fallará mi cálculo si hay viento? ▾';
  }
});

draw([{ x: 0, y: 0 }], 0);
