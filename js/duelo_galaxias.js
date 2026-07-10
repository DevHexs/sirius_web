// Módulo A-1: Duelo de Clasificación Galáctica
// Sirius SAAC

const $ = id => document.getElementById(id);
const canvas = $('stage');
const ctx = canvas.getContext('2d');

let current = null;
let scoreHuman = 0, scoreAi = 0, round = 0;
let roundResolved = true;

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

function rand(a, b) { return a + Math.random() * (b - a); }
function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const REAL_GALAXIES = [
  {
    name: 'NGC 1300',
    type: 'espiral',
    imageUrl: 'https://cdn.esahubble.org/archives/images/screen/opo0501a.jpg',
    features: { ellipticity: 0.15, armContrast: 0.78, asymmetry: 0.08 },
    telemetryKids: { shape: 'Casi redonda', arms: '¡Muy brillantes!', chaos: 'Muy ordenada' },
    caveat: 'La IA midió un bajo nivel de asimetría, baja elipticidad y un contraste de brazos muy marcado, clasificándola correctamente como espiral. NGC 1300 es el prototipo perfecto de galaxia espiral barrada.',
    caveatKids: '¡Es un remolino perfecto! Tiene unos brazos brillantes que giran y una barra en el medio. Tanto tú como la IA vieron los brazos fácilmente y acertaron.'
  },
  {
    name: 'M101 (Galaxia del Molinete)',
    type: 'espiral',
    imageUrl: 'https://cdn.esahubble.org/archives/images/screen/heic0602a.jpg',
    features: { ellipticity: 0.04, armContrast: 0.85, asymmetry: 0.06 },
    telemetryKids: { shape: 'Circular', arms: '¡Brazos gigantes!', chaos: 'Muy ordenada' },
    caveat: 'Al estar orientada completamente de frente, su redondez (baja elipticidad) y el altísimo contraste de sus brazos permitieron que la IA acertara de forma contundente.',
    caveatKids: 'Esta galaxia está de frente y es redondita. Como sus brazos brillantes destacan tanto en el espacio, ¡la IA y tú acertaron de inmediato!'
  },
  {
    name: 'M104 (Galaxia del Sombrero)',
    type: 'espiral',
    imageUrl: 'https://cdn.esahubble.org/archives/images/screen/opo0328a.jpg',
    features: { ellipticity: 0.65, armContrast: 0.12, asymmetry: 0.05 },
    telemetryKids: { shape: 'Estirada como huevo', arms: 'Sin brazos visibles', chaos: 'Muy ordenada' },
    caveat: '¡La IA falló! Midió una elipticidad muy alta (0.65) por la inclinación y un bajo contraste de brazos porque están comprimidos de canto. La IA la clasificó como elíptica. Sin embargo, tus ojos humanos pudieron identificar el disco oscuro de polvo que cruza el centro, característico de una espiral vista casi de canto.',
    caveatKids: '¡La IA se confundió! Como la vemos inclinada de costado, la IA pensó que era un huevo liso sin brazos (elíptica). Pero tus ojos de explorador vieron la franja oscura de polvo en medio, ¡que delata que es una espiral de canto!'
  },
  {
    name: 'M51 (Galaxia del Remolino)',
    type: 'espiral',
    imageUrl: 'https://cdn.esahubble.org/archives/images/screen/heic0506a.jpg',
    features: { ellipticity: 0.10, armContrast: 0.88, asymmetry: 0.38 },
    telemetryKids: { shape: 'Circular', arms: '¡Brazos marcados!', chaos: 'Un poco despeinada' },
    caveat: '¡La IA falló! Midió una asimetría global elevada (0.38) debido a la presencia de la galaxia compañera (NGC 5195) a un lado, catalogándola como "irregular". Los humanos reconocemos de inmediato la majestuosa estructura espiral de la galaxia principal.',
    caveatKids: '¡La IA se confundió por culpa del vecino! Vio a la pequeña galaxia compañera a un lado y pensó que era un caos sin forma (irregular). Pero tú notaste los hermosos brazos espirales del remolino.'
  },
  {
    name: 'NGC 6946 (Galaxia de los Fuegos Artificiales)',
    type: 'espiral',
    imageUrl: 'https://cdn.esahubble.org/archives/images/screen/potw2101a.jpg',
    features: { ellipticity: 0.06, armContrast: 0.82, asymmetry: 0.12 },
    telemetryKids: { shape: 'Circular', arms: '¡Brazos brillantes!', chaos: 'Muy ordenada' },
    caveat: 'El gran contraste de sus brazos y su forma circular al estar orientada de frente le permitieron al clasificador de la IA catalogarla correctamente como espiral. Se le apoda galaxia de los fuegos artificiales debido a su alta frecuencia de supernovas.',
    caveatKids: '¡Un acierto para todos! Es un remolino circular muy claro en el cielo. Se le llama "fuegos artificiales" porque en ella explotan muchas estrellas (supernovas).'
  },
  {
    name: 'M87',
    type: 'eliptica',
    imageUrl: 'https://cdn.esahubble.org/archives/images/screen/heic0815f.jpg',
    features: { ellipticity: 0.05, armContrast: 0.02, asymmetry: 0.03 },
    telemetryKids: { shape: 'Redondita', arms: 'Sin brazos', chaos: 'Muy ordenada' },
    caveat: 'La IA midió una forma casi circular, nula estructura de brazos y bajísima asimetría, acertando que es elíptica. M87 es una galaxia elíptica gigante que alberga uno de los agujeros negros más masivos conocidos.',
    caveatKids: 'Es una nube gigante de estrellas en forma de bola lisa. Como no tiene brazos ni formas raras, la IA acertó que es elíptica. ¡Alberga un agujero negro gigante en su centro!'
  },
  {
    name: 'NGC 4660',
    type: 'eliptica',
    imageUrl: 'https://cdn.esahubble.org/archives/images/screen/heic0815b.jpg',
    features: { ellipticity: 0.48, armContrast: 0.03, asymmetry: 0.04 },
    telemetryKids: { shape: 'Ovalada', arms: 'Sin brazos', chaos: 'Muy ordenada' },
    caveat: 'A pesar de estar notablemente estirada, la elipticidad medida (0.48) no superó el umbral crítico de la IA para catalogarla directamente, pero la ausencia total de brazos la colocó correctamente en el grupo elíptico.',
    caveatKids: 'Parece una galleta ovalada y lisa. Al no tener brazos de remolino, la IA supo que es una galaxia elíptica.'
  },
  {
    name: 'NGC 1132',
    type: 'eliptica',
    imageUrl: 'https://cdn.esahubble.org/archives/images/screen/heic0804a.jpg',
    features: { ellipticity: 0.58, armContrast: 0.04, asymmetry: 0.05 },
    telemetryKids: { shape: 'Estirada', arms: 'Sin brazos', chaos: 'Muy ordenada' },
    caveat: 'Con una elipticidad alta de 0.58 y sin estructura de brazos, el clasificador de la IA determinó sin problemas que es una elíptica. Se la conoce como un "fósil cósmico", el resultado de múltiples fusiones galácticas.',
    caveatKids: 'Esta gran bola ovalada es el resultado de muchas galaxias que chocaron y se unieron en una sola gran elíptica. La IA acertó al verla lisa y alargada.'
  },
  {
    name: 'M60',
    type: 'eliptica',
    imageUrl: 'https://cdn.esahubble.org/archives/images/screen/heic1419b.jpg',
    features: { ellipticity: 0.22, armContrast: 0.03, asymmetry: 0.05 },
    telemetryKids: { shape: 'Ovalada', arms: 'Sin brazos', chaos: 'Muy ordenada' },
    caveat: 'La IA midió una forma ovalada pero sumamente uniforme (baja elipticidad, nulo contraste de brazos y bajísima asimetría), catalogándola correctamente como elíptica. Es una de las galaxias elípticas gigantes más masivas en el Cúmulo de Virgo.',
    caveatKids: 'Es una bola lisa ovalada de estrellas viejas. Sin brazos espirales ni formas raras, la IA y tú la clasificaron correctamente como elíptica.'
  },
  {
    name: 'M59 (Messier 59)',
    type: 'eliptica',
    imageUrl: 'https://cdn.esahubble.org/archives/images/screen/potw1921a.jpg',
    features: { ellipticity: 0.35, armContrast: 0.02, asymmetry: 0.04 },
    telemetryKids: { shape: 'Ovalada', arms: 'Sin brazos', chaos: 'Muy ordenada' },
    caveat: 'La IA la clasificó de manera correcta como elíptica al medir una elipticidad moderada (0.35) pero con niveles insignificantes de asimetría y estructura de brazos.',
    caveatKids: 'Es una galaxia lisa y alargada. Al no tener remolinos ni estar desordenada, la IA acertó al clasificarla como elíptica.'
  },
  {
    name: 'NGC 4449',
    type: 'irregular',
    imageUrl: 'https://cdn.esahubble.org/archives/images/screen/heic1203a.jpg',
    features: { ellipticity: 0.22, armContrast: 0.15, asymmetry: 0.42 },
    telemetryKids: { shape: 'Casi redonda', arms: 'Sin brazos', chaos: '¡Súper desordenada!' },
    caveat: 'La IA detectó una asimetría muy por encima del límite (0.42), logrando clasificarla correctamente como irregular. NGC 4449 tiene una tasa altísima de formación estelar, lo que le da su forma caótica y azulada.',
    caveatKids: 'Esta galaxia es una fiesta ruidosa de estrellas nuevas de color azul. Está tan desordenada que la IA y tú adivinaron que es irregular sin dudarlo.'
  },
  {
    name: 'NGC 1427A',
    type: 'irregular',
    imageUrl: 'https://cdn.esahubble.org/archives/images/screen/opo0509a.jpg',
    features: { ellipticity: 0.35, armContrast: 0.12, asymmetry: 0.48 },
    telemetryKids: { shape: 'Ovalada', arms: 'Sin brazos', chaos: '¡Súper desordenada!' },
    caveat: 'Esta galaxia está siendo despedazada por la gravedad de un cúmulo cercano. La IA identificó la gran asimetría (0.48) causada por este efecto y acertó la clasificación.',
    caveatKids: 'Esta galaxia está siendo estirada y rota por la gravedad de un grupo de vecinas. Al verla tan deforme y caótica, la IA supo que era irregular.'
  },
  {
    name: 'IC 4710',
    type: 'irregular',
    imageUrl: 'https://cdn.esahubble.org/archives/images/screen/potw1818a.jpg',
    features: { ellipticity: 0.18, armContrast: 0.14, asymmetry: 0.32 },
    telemetryKids: { shape: 'Casi redonda', arms: 'Sin brazos', chaos: 'Un poco despeinada' },
    caveat: '¡La IA falló! Midió una asimetría global de 0.32, por debajo del umbral de 0.35. Como no tiene brazos definidos ni elipticidad alta, la IA asumió que es elíptica. Sin embargo, visualmente carece de la concentración central simétrica de una elíptica y muestra nubes caóticas de formación estelar.',
    caveatKids: '¡La IA falló! Esta galaxia es una nube esponjosa sin forma. Como no es súper asimétrica ni tiene brazos, la IA asumió que era un huevo liso (elíptica). Pero tus ojos vieron que no tiene un centro ordenado.'
  },
  {
    name: 'AM 0644-741 (Anillo de Lindsay-Shapley)',
    type: 'irregular',
    imageUrl: 'https://cdn.esahubble.org/archives/images/screen/opo0415a.jpg',
    features: { ellipticity: 0.38, armContrast: 0.15, asymmetry: 0.44 },
    telemetryKids: { shape: 'Ovalada', arms: 'Anillo brillante', chaos: '¡Súper desordenada!' },
    caveat: '¡La IA acertó! Catalogó esta estructura peculiar como irregular debido a su alta asimetría (0.44), generada por una colisión cósmica que empujó el núcleo y expandió un anillo de gas y estrellas jóvenes.',
    caveatKids: '¡La IA acertó! Catalogó esta extraña forma como irregular debido a su gran desorden, causado por un choque espacial que empujó su centro y creó un anillo de estrellas.'
  },
  {
    name: 'IC 10',
    type: 'irregular',
    imageUrl: 'https://cdn.esahubble.org/archives/images/screen/potw1924a.jpg',
    features: { ellipticity: 0.20, armContrast: 0.12, asymmetry: 0.41 },
    telemetryKids: { shape: 'Casi redonda', arms: 'Sin brazos', chaos: '¡Súper desordenada!' },
    caveat: 'La IA detectó una asimetría por encima del umbral (0.41), clasificándola de forma correcta como irregular. IC 10 es una galaxia enana starburst con una densidad de estrellas masivas en formación inusualmente alta.',
    caveatKids: 'Es una pequeña galaxia enana muy desordenada y llena de gas formando estrellas a toda prisa. Su gran caos hizo que la IA acertara clasificándola como irregular.'
  }
];

let lastGalaxy = null;
let shownGalaxies = [];
let currentMode = 'normal';

function generateObject() {
  if (shownGalaxies.length >= REAL_GALAXIES.length) {
    shownGalaxies = [];
  }

  const available = REAL_GALAXIES.filter(g => !shownGalaxies.includes(g.name));

  let galaxy;
  do {
    galaxy = choice(available);
  } while (galaxy === lastGalaxy && available.length > 1);

  lastGalaxy = galaxy;
  shownGalaxies.push(galaxy.name);
  return JSON.parse(JSON.stringify(galaxy));
}

function computeFeatures(obj) {
  return obj.features;
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

const imageCache = {};

function drawObject(obj) {
  const rect = canvas.getBoundingClientRect();
  const w = rect.width, h = rect.height;
  ctx.clearRect(0, 0, w, h);
  starfield(w, h);

  if (!obj.imageUrl) return;

  let img = imageCache[obj.imageUrl];
  if (!img) {
    img = new Image();
    img.src = obj.imageUrl;
    imageCache[obj.imageUrl] = img;
    img.onload = () => {
      if (current === obj) {
        drawObject(obj);
      }
    };

    ctx.fillStyle = 'rgba(10, 15, 25, 0.7)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = '500 13px "JetBrains Mono", monospace';
    ctx.fillStyle = currentMode === 'normal' ? '#5EEAD4' : '#FF6B35';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentMode === 'normal' ? 'ADQUIRIENDO SEÑAL DE TELESCOPIO...' : 'BUSCANDO GALAXIA EN EL ESPACIO...', w / 2, h / 2);
    return;
  }

  if (!img.complete) {
    ctx.fillStyle = 'rgba(10, 15, 25, 0.7)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = '500 13px "JetBrains Mono", monospace';
    ctx.fillStyle = currentMode === 'normal' ? '#5EEAD4' : '#FF6B35';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentMode === 'normal' ? 'DESENCRIPTANDO DATOS DE IMAGEN...' : 'ABRIENDO FOTO ESPACIAL...', w / 2, h / 2);
    return;
  }

  const imgRatio = img.width / img.height;
  const canvasRatio = w / h;
  let dw, dh, dx, dy;
  if (imgRatio > canvasRatio) {
    dh = h;
    dw = h * imgRatio;
    dx = (w - dw) / 2;
    dy = 0;
  } else {
    dw = w;
    dh = w / imgRatio;
    dx = 0;
    dy = (h - dh) / 2;
  }

  ctx.drawImage(img, dx, dy, dw, dh);
  drawHud(w, h, obj);
}

function drawHud(w, h, obj) {
  const hudColor = currentMode === 'normal' ? '#5EEAD4' : '#FF6B35';
  const hudStroke = currentMode === 'normal' ? 'rgba(94, 234, 212, 0.25)' : 'rgba(255, 107, 53, 0.25)';
  const hudBracket = currentMode === 'normal' ? 'rgba(94, 234, 212, 0.4)' : 'rgba(255, 107, 53, 0.4)';
  const hudCrosshair = currentMode === 'normal' ? 'rgba(94, 234, 212, 0.2)' : 'rgba(255, 107, 53, 0.2)';

  // Vignette
  const vignette = ctx.createRadialGradient(w/2, h/2, Math.min(w, h) * 0.4, w/2, h/2, Math.max(w, h) * 0.7);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(10, 15, 25, 0.85)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  // Reticle circle
  ctx.strokeStyle = hudStroke;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(w/2, h/2, Math.min(w, h) * 0.38, 0, Math.PI * 2);
  ctx.stroke();

  // Corner brackets
  const pad = 15;
  const len = 12;
  ctx.strokeStyle = hudBracket;
  ctx.lineWidth = 1.5;
  
  // Top-left
  ctx.beginPath();
  ctx.moveTo(pad + len, pad); ctx.lineTo(pad, pad); ctx.lineTo(pad, pad + len);
  ctx.stroke();
  
  // Top-right
  ctx.beginPath();
  ctx.moveTo(w - pad - len, pad); ctx.lineTo(w - pad, pad); ctx.lineTo(w - pad, pad + len);
  ctx.stroke();
  
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(pad + len, h - pad); ctx.lineTo(pad, h - pad); ctx.lineTo(pad, h - pad + len);
  ctx.stroke();
  
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(w - pad - len, h - pad); ctx.lineTo(w - pad, h - pad); ctx.lineTo(w - pad, h - pad + len);
  ctx.stroke();

  // Crosshairs
  ctx.strokeStyle = hudCrosshair;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(w/2 - 25, h/2); ctx.lineTo(w/2 - 8, h/2);
  ctx.moveTo(w/2 + 8, h/2); ctx.lineTo(w/2 + 25, h/2);
  ctx.moveTo(w/2, h/2 - 25); ctx.lineTo(w/2, h/2 - 8);
  ctx.moveTo(w/2, h/2 + 8); ctx.lineTo(w/2, h/2 + 25);
  ctx.stroke();

  // HUD Text
  ctx.font = '600 10px "JetBrains Mono", monospace';
  ctx.fillStyle = hudColor;
  
  if (currentMode === 'normal') {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`QUEUE: ${shownGalaxies.length}/${REAL_GALAXIES.length}`, pad + 8, pad + 8);
    
    ctx.textAlign = 'right';
    ctx.fillText(`OBJ: ${obj.name.toUpperCase()}`, w - pad - 8, pad + 8);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('RES: 1024x768', pad + 8, h - pad - 8);

    ctx.textAlign = 'right';
    ctx.fillText('FOV: 0.15°', w - pad - 8, h - pad - 8);
  } else {
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`OBJETO: ${shownGalaxies.length}/${REAL_GALAXIES.length}`, pad + 8, pad + 8);
    
    ctx.textAlign = 'right';
    ctx.fillText(`MIRA: ${obj.name.toUpperCase()}`, w - pad - 8, pad + 8);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('MODO: CADETE 🚀', pad + 8, h - pad - 8);

    ctx.textAlign = 'right';
    ctx.fillText('ZOOM: MÁXIMO', w - pad - 8, h - pad - 8);
  }
}

function fmt(n) { return n.toFixed(2); }

function updateTelemetryDisplay(obj) {
  if (!obj || !obj.features) return;
  if (currentMode === 'normal') {
    $('fEllip').textContent = fmt(obj.features.ellipticity);
    $('fArm').textContent = fmt(obj.features.armContrast);
    $('fAsym').textContent = fmt(obj.features.asymmetry);
  } else {
    $('fEllip').textContent = obj.telemetryKids.shape;
    $('fArm').textContent = obj.telemetryKids.arms;
    $('fAsym').textContent = obj.telemetryKids.chaos;
  }
}

function setMode(mode) {
  currentMode = mode;
  const btn = $('btnToggleMode');
  const body = document.body;
  
  // Dynamic update of labels (checking if they exist defensively)
  const lblEllip = $('lblEllip');
  const lblArm = $('lblArm');
  const lblAsym = $('lblAsym');

  if (mode === 'normal') {
    body.classList.remove('kids-mode');
    if (btn) {
      btn.textContent = '🔬 Modo Científico';
      btn.classList.remove('kids-active');
    }
    if (lblEllip) lblEllip.textContent = 'Elipticidad';
    if (lblArm) lblArm.textContent = 'Contraste de brazos';
    if (lblAsym) lblAsym.textContent = 'Asimetría';
  } else {
    body.classList.add('kids-mode');
    if (btn) {
      btn.textContent = '🚀 Modo Cadete';
      btn.classList.add('kids-active');
    }
    if (lblEllip) lblEllip.textContent = '¿Qué forma tiene?';
    if (lblArm) lblArm.textContent = '¿Tiene remolinos?';
    if (lblAsym) lblAsym.textContent = '¿Es ordenada?';
  }
  
  if (current) {
    updateTelemetryDisplay(current);
    drawObject(current);
    if (roundResolved) {
      const ai = aiClassify(current.features);
      $('caveat').textContent = caveatText(current, ai.guess, current.type);
    }
  }
}

function newRound() {
  current = generateObject();
  current.features = computeFeatures(current);
  drawObject(current);
  updateTelemetryDisplay(current);

  $('resultCard').classList.remove('show');
  $('nextBtn').classList.remove('show');
  $('caveat').classList.remove('show');
  document.querySelectorAll('.guessBtn').forEach(b => b.disabled = false);
  roundResolved = false;
}

function caveatText(obj, aiGuess, truth) {
  if (currentMode === 'kids') {
    return (obj && obj.caveatKids) || '¡Excelente observación!';
  }
  if (obj && obj.caveat) {
    return obj.caveat;
  }
  return 'En esta ronda la IA acertó — pero recuerden: acertar con métricas simples no significa que "entienda" la física del objeto. Con otro objeto, esas mismas reglas pueden fallar.';
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

const btnToggleMode = $('btnToggleMode');
if (btnToggleMode) {
  btnToggleMode.addEventListener('click', () => {
    const targetMode = currentMode === 'normal' ? 'kids' : 'normal';
    setMode(targetMode);
  });
}

starfield(canvas.getBoundingClientRect().width, canvas.getBoundingClientRect().height);

