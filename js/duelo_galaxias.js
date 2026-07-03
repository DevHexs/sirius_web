// Módulo A-1: Duelo de Clasificación Galáctica
// Sirius SAAC

const $ = id => document.getElementById(id);
const canvas = $('stage');
const ctx = canvas.getContext('2d');

function resize() {
  const r = canvas.getBoundingClientRect();
  canvas.width = r.width * devicePixelRatio;
  canvas.height = r.height * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  if (current) {
    drawObject(current);
  } else {
    starfield(r.width, r.height);
  }
}

window.addEventListener('resize', resize);
resize();

const TYPE_LABEL = { espiral: 'Galaxia espiral', eliptica: 'Galaxia elíptica', irregular: 'Galaxia irregular' };

let current = null;
let scoreHuman = 0, scoreAi = 0, round = 0;
let roundResolved = true;

function rand(a, b) { return a + Math.random() * (b - a); }
function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateObject() {
  const type = choice(['espiral', 'espiral', 'eliptica', 'irregular']); // spiral a bit more common (more edge-cases)
  const obj = { type, seed: Math.random() * 9999 };

  if (type === 'eliptica') {
    obj.axisRatio = rand(0.55, 0.95);       // b/a, mild flattening
    obj.colorIndex = rand(0.55, 0.9);       // redder
    obj.size = rand(70, 95);
  } else if (type === 'espiral') {
    obj.inclination = rand(0, 1);            // 0 face-on .. 1 edge-on
    // bias toward edge-cases sometimes
    if (Math.random() < 0.4) obj.inclination = rand(0.7, 1);
    obj.dust = rand(0.3, 1);
    obj.armTightness = rand(0.25, 0.5);
    obj.bulgeSize = rand(0.15, 0.35);
    obj.colorIndex = rand(0.1, 0.4);        // bluer
    obj.size = rand(75, 100);
  } else {
    obj.asymmetry = rand(0.45, 0.9);
    obj.clumps = Math.floor(rand(4, 8));
    obj.colorIndex = rand(0.15, 0.45);
    obj.size = rand(60, 85);
  }
  return obj;
}

function computeFeatures(obj) {
  let ellipticity, armContrast, asymmetry;
  if (obj.type === 'eliptica') {
    ellipticity = 1 - obj.axisRatio;
    armContrast = rand(0.02, 0.1);
    asymmetry = rand(0.03, 0.12);
  } else if (obj.type === 'espiral') {
    const squish = Math.cos(obj.inclination * Math.PI / 2);
    ellipticity = 1 - squish;
    armContrast = Math.max(0.05, 0.6 * (1 - obj.inclination) + rand(-0.05, 0.05));
    asymmetry = rand(0.03, 0.14);
  } else {
    ellipticity = rand(0.05, 0.25);
    armContrast = rand(0.02, 0.08);
    asymmetry = obj.asymmetry;
  }
  return { ellipticity, armContrast, asymmetry };
}

function aiClassify(f) {
  let guess;
  if (f.asymmetry > 0.35) guess = 'irregular';
  else if (f.ellipticity > 0.55) guess = 'eliptica';
  else if (f.armContrast > 0.22) guess = 'espiral';
  else guess = 'eliptica';
  const confidence = Math.round(rand(68, 95));
  return { guess, confidence };
}

function starfield(w, h) {
  ctx.fillStyle = '#182036';
  for (let i = 0; i < 50; i++) {
    const sx = (i * 83.7) % w, sy = (i * 61.3) % h;
    ctx.fillRect(sx, sy, 1.4, 1.4);
  }
}

function drawObject(obj) {
  const rect = canvas.getBoundingClientRect();
  const w = rect.width, h = rect.height;
  ctx.clearRect(0, 0, w, h);
  starfield(w, h);
  const cx = w / 2, cy = h / 2;

  if (obj.type === 'eliptica') {
    const R = obj.size;
    const ratio = obj.axisRatio;
    const hue = obj.colorIndex > 0.7 ? '255,200,150' : '255,225,190';
    for (let i = 8; i > 0; i--) {
      const t = i / 8;
      ctx.beginPath();
      ctx.ellipse(cx, cy, R * t, R * t * ratio, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${hue}, ${0.06 + (1 - t) * 0.05})`;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.ellipse(cx, cy, R * 0.15, R * 0.15 * ratio, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,240,220,0.9)';
    ctx.fill();
  }

  else if (obj.type === 'espiral') {
    const squish = Math.max(0.08, Math.cos(obj.inclination * Math.PI / 2));
    const R = obj.size;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1, squish);

    // faint disk
    const diskGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
    diskGrad.addColorStop(0, 'rgba(190,210,255,0.35)');
    diskGrad.addColorStop(1, 'rgba(120,150,255,0)');
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.fillStyle = diskGrad; ctx.fill();

    // spiral arms
    ctx.strokeStyle = 'rgba(180,205,255,0.55)';
    for (let arm = 0; arm < 2; arm++) {
      ctx.beginPath();
      const offset = arm * Math.PI;
      for (let a = 0; a < Math.PI * 2.4; a += 0.05) {
        const radius = (a / (Math.PI * 2.4)) * R;
        const ang = a + offset;
        const px = radius * Math.cos(ang);
        const py = radius * Math.sin(ang);
        if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.lineWidth = 5;
      ctx.stroke();
    }
    // star-forming knots along arms
    ctx.fillStyle = 'rgba(210,225,255,0.8)';
    for (let i = 0; i < 14; i++) {
      const a = rand(0, Math.PI * 2.4);
      const radius = (a / (Math.PI * 2.4)) * R;
      const arm = i % 2 === 0 ? 0 : Math.PI;
      const ang = a + arm;
      ctx.beginPath();
      ctx.arc(radius * Math.cos(ang), radius * Math.sin(ang), 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    // bulge
    ctx.beginPath();
    ctx.arc(0, 0, R * obj.bulgeSize, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,235,210,0.85)';
    ctx.fill();
    ctx.restore();

    // dust lane, drawn unscaled for a crisp thin edge-on streak
    if (obj.inclination > 0.6 && obj.dust > 0.5) {
      const lw = 2 + obj.dust * 2.5;
      ctx.strokeStyle = `rgba(30,18,14,${0.5 + obj.dust * 0.3})`;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(cx - R * 0.9, cy);
      ctx.lineTo(cx + R * 0.9, cy);
      ctx.stroke();
    }
  }

  else { // irregular
    const R = obj.size;
    ctx.save();
    ctx.translate(cx, cy);
    // diffuse asymmetric base
    const shiftX = (Math.random() - 0.5) * R * obj.asymmetry * 0.6;
    const shiftY = (Math.random() - 0.5) * R * obj.asymmetry * 0.6;
    const grad = ctx.createRadialGradient(shiftX, shiftY, 0, 0, 0, R);
    grad.addColorStop(0, 'rgba(170,210,255,0.3)');
    grad.addColorStop(1, 'rgba(170,210,255,0)');
    ctx.beginPath(); ctx.ellipse(shiftX * 0.3, shiftY * 0.3, R * 0.9, R * 0.7, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = grad; ctx.fill();
    // clumps
    for (let i = 0; i < obj.clumps; i++) {
      const ang = rand(0, Math.PI * 2);
      const dist = rand(0, R * 0.8) * obj.asymmetry;
      const px = Math.cos(ang) * dist + shiftX * 0.5;
      const py = Math.sin(ang) * dist + shiftY * 0.5;
      const rr = rand(6, 16);
      const grad2 = ctx.createRadialGradient(px, py, 0, px, py, rr);
      grad2.addColorStop(0, 'rgba(200,225,255,0.85)');
      grad2.addColorStop(1, 'rgba(200,225,255,0)');
      ctx.beginPath(); ctx.arc(px, py, rr, 0, Math.PI * 2);
      ctx.fillStyle = grad2; ctx.fill();
    }
    ctx.restore();
  }
}

function fmt(n) { return n.toFixed(2); }

function newRound() {
  current = generateObject();
  current.features = computeFeatures(current);
  drawObject(current);
  $('fEllip').textContent = fmt(current.features.ellipticity);
  $('fArm').textContent = fmt(current.features.armContrast);
  $('fAsym').textContent = fmt(current.features.asymmetry);

  $('resultCard').classList.remove('show');
  $('nextBtn').classList.remove('show');
  $('caveat').classList.remove('show');
  document.querySelectorAll('.guessBtn').forEach(b => b.disabled = false);
  roundResolved = false;
}

function caveatText(obj, aiGuess, truth) {
  if (truth === 'espiral' && aiGuess === 'eliptica') {
    return 'La IA solo midió qué tan alargada (elipticidad) y qué tan brillante en contraste (brazos) se ve la imagen. '
      + 'A alta inclinación, un disco espiral proyectado de canto se ve casi tan alargado como una elíptica, y sus brazos '
      + 'quedan comprimidos y difíciles de medir. Ustedes en cambio pudieron notar la línea oscura de polvo cruzando el centro — '
      + 'una pista clásica de disco visto de canto que la IA nunca buscó.';
  }
  if (truth === 'irregular' && aiGuess !== 'irregular') {
    return 'La IA solo revisó un umbral de asimetría. Las galaxias irregulares reales varían muchísimo en forma, '
      + 'y un solo número no siempre alcanza a distinguir un objeto genuinamente caótico de uno solo un poco inclinado.';
  }
  if (truth === 'eliptica' && aiGuess === 'espiral') {
    return 'La IA detectó algo de contraste de brillo y lo interpretó como brazos espirales, pero una elíptica '
      + 'con ruido en su brillo puede producir el mismo número sin tener ninguna estructura real girando.';
  }
  return 'En esta ronda la IA acertó — pero recuerden: acertar con métricas simples no significa que "entienda" '
    + 'la física del objeto. Con otro objeto, esas mismas reglas pueden fallar.';
}

function resolveRound(humanGuess) {
  if (roundResolved) return;
  roundResolved = true;
  document.querySelectorAll('.guessBtn').forEach(b => b.disabled = true);

  const truth = current.type;
  const ai = aiClassify(current.features);
  const humanCorrect = humanGuess === truth;
  const aiCorrect = ai.guess === truth;

  if (humanCorrect) scoreHuman++;
  if (aiCorrect) scoreAi++;
  $('scoreHuman').textContent = scoreHuman;
  $('scoreAi').textContent = scoreAi;

  $('truthLabel').textContent = TYPE_LABEL[truth];
  $('humanGuess').textContent = TYPE_LABEL[humanGuess];
  $('aiGuess').textContent = TYPE_LABEL[ai.guess];
  $('aiConf').textContent = `· confianza ${ai.confidence}%`;

  $('humanVerdict').className = 'verdict ' + (humanCorrect ? 'correct' : 'wrong');
  $('aiVerdict').className = 'verdict ' + (aiCorrect ? 'correct' : 'wrong');

  $('caveat').textContent = caveatText(current, ai.guess, truth);
  $('revealBtn').textContent = '¿Qué pistas midió la IA — y cuáles se le pasaron? ▾';
  $('resultCard').classList.add('show');
  $('nextBtn').classList.add('show');

  round++;
  const body = $('logBody');
  if (round === 1) { body.innerHTML = ''; }
  const tr = document.createElement('tr');
  tr.innerHTML = `<td>${round}</td><td>${TYPE_LABEL[truth]}</td>
    <td><span class="tag ${humanCorrect ? 'good' : 'bad'}">${TYPE_LABEL[humanGuess]}</span></td>
    <td><span class="tag ${aiCorrect ? 'good' : 'bad'}">${TYPE_LABEL[ai.guess]}</span></td>`;
  body.prepend(tr);
}

$('genBtn').addEventListener('click', newRound);
$('nextBtn').addEventListener('click', newRound);
document.querySelectorAll('.guessBtn').forEach(b => {
  b.addEventListener('click', () => resolveRound(b.dataset.type));
});
$('revealBtn').addEventListener('click', () => {
  const c = $('caveat');
  c.classList.toggle('show');
  $('revealBtn').textContent = c.classList.contains('show')
    ? '¿Qué pistas midió la IA — y cuáles se le pasaron? ▴'
    : '¿Qué pistas midió la IA — y cuáles se le pasaron? ▾';
});

starfield(canvas.getBoundingClientRect().width, canvas.getBoundingClientRect().height);
