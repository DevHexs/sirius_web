// Módulo R-9: Simulador Crítico de Cohetes
// Sirius SAAC

const $ = id => document.getElementById(id);
const mass = $('mass'), thrust = $('thrust'), burn = $('burn'), drag = $('drag'), angle = $('angle');
const dragLabels = ['Ninguno', 'Bajo', 'Medio', 'Alto'];
const dragK = [0, 0.0025, 0.008, 0.02];

function syncLabels() {
  $('massVal').textContent = parseFloat(mass.value).toFixed(1) + ' kg';
  $('thrustVal').textContent = thrust.value + ' N';
  $('burnVal').textContent = parseFloat(burn.value).toFixed(1) + ' s';
  $('dragVal').textContent = dragLabels[drag.value];
  $('angleVal').textContent = angle.value + '°';
}
[mass, thrust, burn, drag, angle].forEach(el => el.addEventListener('input', syncLabels));
syncLabels();

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

function draw(pts, burnT, dt = 0.02, progress = 1) {
  const w = canvas.getBoundingClientRect().width;
  const h = canvas.getBoundingClientRect().height;
  ctx.clearRect(0, 0, w, h);

  // stars
  ctx.fillStyle = '#182036';
  for (let i = 0; i < 40; i++) {
    const sx = (i * 97) % w, sy = (i * 53) % (h * 0.6);
    ctx.fillRect(sx, sy, 1.5, 1.5);
  }

  const maxX = Math.max(...pts.map(p => p.x), 10);
  const maxY = Math.max(...pts.map(p => p.y), 10);
  const pad = 40;
  const scale = Math.min((w - pad * 2) / maxX, (h - pad * 1.6) / maxY);
  const groundY = h - 36;
  const toScreen = p => ({ sx: pad + p.x * scale, sy: groundY - p.y * scale });

  // ground
  ctx.strokeStyle = '#232A3A';
  ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w, groundY); ctx.stroke();

  // trajectory path
  const count = Math.floor(pts.length * progress);
  ctx.strokeStyle = '#3A4B63';
  ctx.lineWidth = 2;
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

    ctx.save();
    ctx.translate(sx, sy);
    const prev = pts[Math.max(0, count - 2)];
    const ang = Math.atan2(-(cur.y - prev.y), cur.x - prev.x);
    ctx.rotate(-ang + Math.PI / 2);

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
    ctx.restore();
  }
}

function animateLaunch(result) {
  const { pts, burnT} = result;
  let i = 0;
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
      ? '<span class="tag better">superó a la IA</span>'
      : '<span class="tag worse">bajo la IA</span>';
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
  addLogRow(launchCount, ang, dragLabels[drag.value], result.apogee, result.range, vsAi);
});

$('aiBtn').addEventListener('click', () => {
  angle.value = 45;
  syncLabels();
  lastAiAngle = 45;
  $('aiCard').classList.add('show');
  $('caveat').classList.remove('show');
  $('revealBtn').textContent = '¿Qué información NO consideró la IA? ▾';
});

$('revealBtn').addEventListener('click', () => {
  const c = $('caveat');
  c.classList.toggle('show');
  $('revealBtn').textContent = c.classList.contains('show')
    ? '¿Qué información NO consideró la IA? ▴'
    : '¿Qué información NO consideró la IA? ▾';
});

draw([{ x: 0, y: 0 }], 0);
