(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s);};
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var LMIN=380,LMAX=720;

/* ---------------- Datos ---------------- */
var BOUNDS=[40000,30000,10000,7500,6000,5200,3700,2400];
var REP=[35000,20000,8500,6750,5600,4400,3200];
var CLS=[
 {k:'O',nombre:'azul',corto:'azul',t:'30,000+',rango:'30,000 K o más',masa:'16 veces o más',vida:'unos pocos millones de años',barra:12,
  ej:'Alnitak, en el cinturón de Orión',
  find:'Pocas líneas, todas débiles. Si ves helio ionizado (He⁺), es una O.',
  why:'Está tan caliente que arranca electrones hasta a los átomos de helio. El helio ionizado es la huella de las estrellas O. El hidrógeno casi no se nota porque también está ionizado.',
  fun:'Son poco comunes porque consumen su combustible muy rápido. Muchas terminan su vida como supernovas.'},
 {k:'B',nombre:'azul-blanca',corto:'azulada',t:'10,000–30,000',rango:'10,000 a 30,000 K',masa:'2 a 16 veces',vida:'decenas a cientos de millones de años',barra:33,
  ej:'Rigel y Spica',
  find:'Líneas de helio bien marcadas y algo de hidrógeno.',
  why:'Aquí el helio absorbe con fuerza. Necesita mucha energía y solo la encuentra en estrellas muy calientes. El hidrógeno ya se ve, pero todavía no es el protagonista.',
  fun:'Rigel, el pie de Orión, brilla como más de 100,000 Soles. Es una supergigante azul.'},
 {k:'A',nombre:'blanca',corto:'blanca',t:'7,500–10,000',rango:'7,500 a 10,000 K',masa:'1.4 a 2 veces',vida:'cerca de mil millones de años',barra:50,
  ej:'Sirio y Vega',
  find:'Líneas de hidrógeno muy marcadas y casi nada más.',
  why:'Justo aquí los electrones del hidrógeno están en el nivel de energía perfecto para absorber luz visible. Por eso las líneas de hidrógeno son las más fuertes de todos los tipos.',
  fun:'Sirio es la estrella más brillante de nuestro cielo nocturno.'},
 {k:'F',nombre:'blanco-amarillenta',corto:'crema',t:'6,000–7,500',rango:'6,000 a 7,500 K',masa:'1.0 a 1.4 veces',vida:'unos 4 mil millones de años',barra:60,
  ej:'Proción y Polaris (la Estrella Polar)',
  find:'Hidrógeno un poco más débil y calcio (líneas H y K) bien visible.',
  why:'La estrella se enfría un poco. El hidrógeno empieza a debilitarse y aparecen las líneas del calcio y de los primeros metales.',
  fun:'La Estrella Polar es una supergigante de tipo F, mucho más grande que el Sol.'},
 {k:'G',nombre:'amarilla',corto:'amarilla',t:'5,200–6,000',rango:'5,200 a 6,000 K',masa:'0.8 a 1.0 veces',vida:'unos 10 mil millones de años',barra:67,
  ej:'El Sol y Alfa Centauri A',
  find:'Calcio muy oscuro y muchas líneas finas de metales, con hidrógeno débil.',
  why:'El calcio produce líneas muy anchas y aparecen hierro, sodio y magnesio. El hidrógeno sigue ahí, pero ya casi no absorbe luz visible.',
  fun:'El Sol es una estrella tipo G2. Aunque el máximo de su espectro continuo cae cerca del verde, al sumar todos los colores su luz se percibe blanca, con un leve tono amarillento.'},
 {k:'K',nombre:'naranja',corto:'naranja',t:'3,700–5,200',rango:'3,700 a 5,200 K',masa:'0.45 a 0.8 veces',vida:'decenas de miles de millones de años',barra:75,
  ej:'Arturo y Aldebarán',
  find:'Un bosque de líneas finas de metales y casi nada de hidrógeno.',
  why:'Hay muchísimas líneas de metales neutros y el calcio es muy fuerte. Ya casi no queda hidrógeno que absorba luz visible.',
  fun:'Arturo es un gigante naranja. Muchos astrónomos buscan planetas habitables cerca de estrellas K porque viven mucho tiempo y son estables.'},
 {k:'M',nombre:'roja',corto:'roja',t:'2,400–3,700',rango:'2,400 a 3,700 K',masa:'0.08 a 0.45 veces',vida:'cientos de miles de millones de años o más',barra:100,
  ej:'Betelgeuse y Próxima Centauri',
  find:'Grandes bandas anchas y oscuras: el espectro parece acanalado.',
  why:'Está tan fría que los átomos se unen en moléculas. El óxido de titanio (TiO) tapa zonas enteras del espectro. Además, casi toda su luz es infrarroja, invisible para nosotros.',
  fun:'Las enanas rojas son la mayoría: unas 3 de cada 4 estrellas. Ninguna se ve a simple vista.'}
];

/* ---------------- Color ---------------- */
var ANCH=[[40000,[122,154,255]],[30000,[140,168,255]],[20000,[165,188,255]],[10000,[200,216,255]],[8500,[222,232,255]],
 [7000,[255,246,226]],[6000,[255,236,170]],[5500,[255,224,128]],[5200,[255,212,110]],[4500,[255,183,90]],
 [3700,[255,150,70]],[3000,[255,118,58]],[2400,[244,88,50]]];
function starRGB(T){
  T=Math.max(2400,Math.min(40000,T));
  for(var i=0;i<ANCH.length-1;i++){
    var t0=ANCH[i][0],t1=ANCH[i+1][0],c0=ANCH[i][1],c1=ANCH[i+1][1];
    if(T<=t0&&T>=t1){
      var f=(Math.log(t0)-Math.log(T))/(Math.log(t0)-Math.log(t1));
      return [c0[0]+(c1[0]-c0[0])*f,c0[1]+(c1[1]-c0[1])*f,c0[2]+(c1[2]-c0[2])*f];
    }
  }
  return ANCH[ANCH.length-1][1];
}
function mix(c,to,f){return [c[0]+(to-c[0])*f,c[1]+(to-c[1])*f,c[2]+(to-c[2])*f];}
function rgbStr(c,a){var r=Math.round(c[0]),g=Math.round(c[1]),b=Math.round(c[2]);return a==null?'rgb('+r+','+g+','+b+')':'rgba('+r+','+g+','+b+','+a+')';}
function wl2rgb(w){
  var r=0,g=0,b=0;
  if(w<440){r=(440-w)/60;b=1;}
  else if(w<490){g=(w-440)/50;b=1;}
  else if(w<510){g=1;b=(510-w)/20;}
  else if(w<580){r=(w-510)/70;g=1;}
  else if(w<645){r=1;g=(645-w)/65;}
  else{r=1;}
  var f=1;
  if(w<420)f=.3+.7*(w-380)/40; else if(w>700)f=.3+.7*(780-w)/80;
  return [Math.pow(r*f,.8),Math.pow(g*f,.8),Math.pow(b*f,.8)];
}
function colorName(l){
  if(l<450)return 'violeta'; if(l<495)return 'azul'; if(l<570)return 'verde';
  if(l<590)return 'amarilla'; if(l<620)return 'naranja'; return 'roja';
}

/* ---------------- Física ---------------- */
var C2=1.4388e7;
function planck(l,T){return 1/(Math.pow(l,5)*Math.expm1(C2/(l*T)));}
function bell(T,Tc,sHot,sCool){var d=Math.log10(T)-Math.log10(Tc);var s=d>0?sHot:sCool;return Math.exp(-0.5*Math.pow(d/s,2));}
var fH=function(T){return bell(T,9500,.3,.15);};
var fHe=function(T){return bell(T,20000,.25,.13);};
var fHe2=function(T){return bell(T,40000,.15,.1);};
var fCa=function(T){return bell(T,5000,.13,.22);};
var fMe=function(T){return bell(T,4300,.17,.15);};
var fTiO=function(T){return bell(T,3000,.06,.2);};
var GF={H:fH,He:fHe,He2:fHe2,Ca:fCa,Me:fMe,TiO:fTiO};
var SYM={H:'H',He:'He',He2:'He⁺',Ca:'Ca',Na:'Na',Mg:'Mg',Fe:'Fe'};
/* g: grupo para etiqueta; f: curva de intensidad */
var LINES=[
 {g:'H',f:'H',l:656.3,d:.85,w:2.2},{g:'H',f:'H',l:486.1,d:.8,w:2.0},{g:'H',f:'H',l:434.0,d:.75,w:1.9},{g:'H',f:'H',l:410.2,d:.7,w:1.8},
 {g:'He',f:'He',l:587.6,d:.5,w:1.3},{g:'He',f:'He',l:501.6,d:.45,w:1.2},{g:'He',f:'He',l:492.2,d:.35,w:1.2},
 {g:'He',f:'He',l:471.3,d:.35,w:1.2},{g:'He',f:'He',l:447.1,d:.55,w:1.3},{g:'He',f:'He',l:402.6,d:.4,w:1.2},
 {g:'He2',f:'He2',l:468.6,d:.7,w:1.5},{g:'He2',f:'He2',l:541.1,d:.4,w:1.4},{g:'He2',f:'He2',l:420.0,d:.3,w:1.3},
 {g:'Ca',f:'Ca',l:393.4,d:1.0,w:2.4},{g:'Ca',f:'Ca',l:396.8,d:.9,w:2.2},{g:'Ca',f:'Me',l:422.7,d:.6,w:1.6},
 {g:'Na',f:'Me',l:589.0,d:.8,w:1.3},{g:'Na',f:'Me',l:589.6,d:.7,w:1.3},
 {g:'Mg',f:'Me',l:516.7,d:.55,w:1.1},{g:'Mg',f:'Me',l:517.3,d:.6,w:1.1},{g:'Mg',f:'Me',l:518.4,d:.6,w:1.1},
 {g:'Fe',f:'Me',l:527.0,d:.5,w:1.2},{g:'Fe',f:'Me',l:495.8,d:.3,w:1.0},{g:'Fe',f:'Me',l:438.4,d:.45,w:1.1},{g:'Fe',f:'Me',l:404.6,d:.35,w:1.1}
];
var BANDS=[{h:476.1,d:.25},{h:495.4,d:.3},{h:516.7,d:.4},{h:544.8,d:.3},{h:559.8,d:.4},{h:584.7,d:.5},{h:615.9,d:.55},{h:665.1,d:.6},{h:705.4,d:.8}];
BANDS.forEach(function(b){b.L=13;});
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
var rnd=mulberry(7);
var FOREST=[];for(var q=0;q<70;q++){FOREST.push({l:392+rnd()*310,d:.08+rnd()*.22,w:.6+rnd()*.6});}
var SHOW=[
 {sym:'H',name:'Hidrógeno',f:fH},
 {sym:'He',name:'Helio',f:fHe},
 {sym:'He⁺',name:'Helio ionizado',f:fHe2},
 {sym:'Ca',name:'Calcio',f:fCa},
 {sym:'Fe',name:'Metales (sodio, magnesio, hierro)',f:fMe},
 {sym:'TiO',name:'Óxido de titanio (molécula)',f:fTiO}
];
var lvl=function(s){return s>=.6?'fuerte':(s>=.3?'media':'débil');};

function posToT(pos){
  pos=Math.max(0,Math.min(7,pos));
  var i=Math.min(6,Math.floor(pos)),f=pos-i;
  var a=Math.log(BOUNDS[i]),b=Math.log(BOUNDS[i+1]);
  return Math.exp(a+(b-a)*f);
}
function posToIdx(pos){return Math.min(6,Math.max(0,Math.floor(pos)));}
function round3(T){return T>=10000?Math.round(T/500)*500:Math.round(T/100)*100;}
function fmt(n){return Number(n).toLocaleString('en-US');}

function makeStarSampler(T){
  var act=[],bands=[],i;
  for(i=0;i<LINES.length;i++){var ln=LINES[i];var a=ln.d*GF[ln.f](T);if(a>0.02)act.push([ln.l,a,ln.w]);}
  var sm=fMe(T);
  if(sm>0.05)for(i=0;i<FOREST.length;i++)act.push([FOREST[i].l,FOREST[i].d*sm,FOREST[i].w]);
  var st=fTiO(T);
  if(st>0.03)for(i=0;i<BANDS.length;i++)bands.push([BANDS[i].h,BANDS[i].d*st,BANDS[i].L]);
  var bmax=0;for(var l=LMIN;l<=LMAX;l+=5)bmax=Math.max(bmax,planck(l,T));
  return function(l){
    var tr=1,j;
    for(j=0;j<act.length;j++){var dx=(l-act[j][0])/act[j][2];if(dx>4||dx<-4)continue;tr*=1-Math.min(.97,act[j][1]*Math.exp(-.5*dx*dx));}
    for(j=0;j<bands.length;j++){
      var h=bands[j][0];
      var g=l>=h?Math.exp(-(l-h)/bands[j][2]):Math.exp(-.5*Math.pow((h-l)/.9,2));
      if(g<.01)continue;
      tr*=1-Math.min(.95,bands[j][1]*g);
    }
    var I=Math.pow(planck(l,T)/bmax,.42);
    var c=wl2rgb(l),k=I*tr*255;
    return [c[0]*k,c[1]*k,c[2]*k];
  };
}

/* ---------------- Lienzos ---------------- */
var off=document.createElement('canvas');
function paintStrip(cv,sampler,vignette){
  var dpr=Math.min(window.devicePixelRatio||1,2);
  var w=Math.max(1,Math.round(cv.clientWidth*dpr)),h=Math.max(1,Math.round(cv.clientHeight*dpr));
  if(cv.width!==w)cv.width=w;
  if(cv.height!==h)cv.height=h;
  var ctx=cv.getContext('2d');if(!ctx)return;
  off.width=w;off.height=1;
  var octx=off.getContext('2d');
  var img=octx.createImageData(w,1);
  for(var x=0;x<w;x++){
    var l=LMIN+(x+.5)/w*(LMAX-LMIN),c=sampler(l),o=x*4;
    img.data[o]=Math.min(255,c[0]);img.data[o+1]=Math.min(255,c[1]);img.data[o+2]=Math.min(255,c[2]);img.data[o+3]=255;
  }
  octx.putImageData(img,0,0);
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(off,0,0,w,1,0,0,w,h);
  if(vignette){
    var g=ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0,'rgba(0,0,0,.4)');g.addColorStop(.25,'rgba(0,0,0,0)');g.addColorStop(.75,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.4)');
    ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  }
}
function watch(el,fn){
  if('ResizeObserver' in window){new ResizeObserver(fn).observe(el);}
  else window.addEventListener('resize',fn);
}

/* ---------------- Estado ---------------- */
var state={mode:'explore',explorePos:0,curve:false,
  d:{idx:-1,pos:0,wrong:[],done:false,hint:false,tries:0,started:false},
  score:{ok:0,rounds:0}};
function curPos(){return state.mode==='explore'?state.explorePos:state.d.pos;}
var detHidden=function(){return state.mode==='detective'&&!state.d.done;};

/* ---------------- Referencias ---------------- */
var root=document.querySelector('.stars-page');
var starEl=$('#star'),starLetter=$('#starLetter'),specCv=$('#spec'),scaleEl=$('#scale'),ticksEl=$('#ticks'),peakEl=$('#peak'),peakNote=$('#peakNote');
var classesEl=$('#classes'),sliderWrap=$('#sliderwrap'),slider=$('#temp'),detbar=$('#detbar'),panel=$('#panel'),live=$('#live');
var stripEl=$('.strip'),curveChk=$('#curve'),curveHelp=$('#curveHelp');
var tabE=$('#tabExplore'),tabD=$('#tabDetective');
var btnHint=$('#hintColor'),btnReveal=$('#reveal'),btnNext=$('#next'),scoreEl=$('#score');

/* ---------------- Construcción fija ---------------- */
scaleEl.innerHTML=[400,500,600,700].map(function(n){return '<span style="left:'+((n-LMIN)/(LMAX-LMIN)*100)+'%">'+n+' nm</span>';}).join('');
classesEl.innerHTML=CLS.map(function(c,i){
  return '<button type="button" class="cbtn" data-i="'+i+'" style="--c:'+rgbStr(starRGB(REP[i]))+'" aria-pressed="false">'+
    '<i class="sw"></i><b>'+c.k+'</b><span class="cw">'+c.corto+'</span><small>'+c.t+' K</small></button>';
}).join('');
var cbtns=[].slice.call(classesEl.querySelectorAll('.cbtn'));
var trackStops=CLS.map(function(c,i){return rgbStr(starRGB(REP[i]))+' '+((i+.5)/7*100).toFixed(2)+'%';});
root.style.setProperty('--track','linear-gradient(90deg,'+rgbStr(starRGB(40000))+' 0%,'+trackStops.join(',')+','+rgbStr(starRGB(2400))+' 100%)');

/* ---------------- Marcas de líneas ---------------- */
function buildTicks(T){
  var W=stripEl.clientWidth;
  if(!W||detHidden()){ticksEl.innerHTML='';ticksEl.style.height='8px';return;}
  var pxnm=W/(LMAX-LMIN),items=[],i;
  for(i=0;i<LINES.length;i++){var ln=LINES[i];var e=ln.d*GF[ln.f](T);if(e>=.2)items.push({l:ln.l,sym:SYM[ln.g],g:ln.g});}
  for(i=0;i<BANDS.length;i++){var e2=BANDS[i].d*fTiO(T);if(e2>=.5)items.push({l:BANDS[i].h+8,sym:'TiO',g:'TiO'});}
  items.sort(function(a,b){return a.l-b.l;});
  var cl=[];
  items.forEach(function(it){
    var last=cl[cl.length-1];
    if(last&&last.g===it.g&&it.l-last.ls[last.ls.length-1]<5){last.ls.push(it.l);last.l=last.ls.reduce(function(a,b){return a+b;},0)/last.ls.length;}
    else cl.push({l:it.l,sym:it.sym,g:it.g,ls:[it.l]});
  });
  var rows=[-1e9,-1e9,-1e9,-1e9],out=[],maxRow=0;
  cl.forEach(function(c){
    var x=(c.l-LMIN)*pxnm,w=c.sym.length*9+10,r=0;
    while(r<rows.length&&rows[r]>x-w/2-2)r++;
    if(r>=rows.length)return;
    rows[r]=x+w/2;if(r>maxRow)maxRow=r;
    out.push({x:x,r:r,sym:c.sym});
  });
  ticksEl.innerHTML=out.map(function(o){
    var hh=8+o.r*18;
    return '<div class="tk" style="left:'+o.x.toFixed(1)+'px"><i style="height:'+hh+'px"></i><span style="top:'+(hh+1)+'px">'+o.sym+'</span></div>';
  }).join('');
  ticksEl.style.height=(8+maxRow*18+26)+'px';
}

/* ---------------- Curva de brillo ---------------- */
function drawCurve(T){
  var ctx=specCv.getContext('2d');if(!ctx)return;
  var w=specCv.width,h=specCv.height,dpr=w/Math.max(1,specCv.clientWidth);
  var bmax=0,l;for(l=LMIN;l<=LMAX;l+=2)bmax=Math.max(bmax,planck(l,T));
  ctx.beginPath();
  for(var x=0;x<=w;x+=3){
    l=LMIN+x/w*(LMAX-LMIN);
    var y=h-10*dpr-(planck(l,T)/bmax)*(h-28*dpr);
    if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.lineJoin='round';ctx.lineCap='round';
  ctx.strokeStyle='rgba(0,0,0,.7)';ctx.lineWidth=5*dpr;ctx.stroke();
  ctx.strokeStyle='#fff';ctx.lineWidth=2.2*dpr;ctx.stroke();
}

/* ---------------- Tarjeta ---------------- */
function cardHTML(i,T,lead){
  var c=CLS[i],rgb=starRGB(T);
  var lam=2897771.955/T,peak;
  if(lam<LMIN)peak=Math.round(lam)+' nm<small>ultravioleta: no se ve</small>';
  else if(lam>LMAX)peak=Math.round(lam)+' nm<small>infrarrojo: no se ve</small>';
  else peak=Math.round(lam)+' nm<small>luz '+colorName(lam)+'</small>';
  var rows=SHOW.map(function(g){return {sym:g.sym,name:g.name,s:g.f(T)};}).filter(function(g){return g.s>=.12;}).sort(function(a,b){return b.s-a.s;});
  var lines=rows.map(function(g){
    return '<li><span class="sym">'+g.sym+'</span><span class="nm">'+g.name+'<small>'+lvl(g.s)+'</small></span><span class="meter" aria-hidden="true"><i style="width:'+Math.round(Math.min(1,g.s)*100)+'%"></i></span></li>';
  }).join('');
  var tk=round3(T),tc=round3(T-273.15);
  var sun=Math.abs(T-5772)<260&&i===4?'<p class="sub">Muy parecida al Sol.</p>':'';
  return (lead||'')+'<article class="card">'+
    '<h2><span class="dot" style="background:'+rgbStr(rgb)+'"></span>Estrella tipo '+c.k+'</h2>'+
    '<p class="sub">Estrella '+c.nombre+'</p>'+sun+
    '<dl class="facts">'+
      '<div><dt>Temperatura de la superficie</dt><dd>'+fmt(tk)+' K<small>unos '+fmt(tc)+' °C</small></dd></div>'+
      '<div><dt>Su luz más intensa</dt><dd>'+peak+'</dd></div>'+
      '<div><dt>Masa comparada con el Sol</dt><dd>'+c.masa+'</dd></div>'+
      '<div><dt>Vida como estrella normal</dt><dd>'+c.vida+'</dd></div>'+
    '</dl>'+
    '<h3>Cómo reconocerla</h3><p>'+c.find+'</p>'+
    '<h3>Huellas que se ven ahora</h3><ul class="lines">'+lines+'</ul>'+
    '<h3>Por qué se ve así</h3><p>'+c.why+'</p>'+
    '<p class="fun"><b>Ejemplos:</b> '+c.ej+'.<br><b>Dato curioso:</b> '+c.fun+'</p>'+
  '</article>';
}
function detectivePanel(){
  var d=state.d,c=d.idx>=0?CLS[d.idx]:null;
  if(!c)return '';
  if(d.done){
    var lead=d.gaveUp
      ?'<div class="hintbox"><div class="big">Era una estrella tipo '+c.k+'.</div>Revisa cómo se ven sus líneas y prueba con otra.</div>'
      :'<div class="hintbox good"><div class="big">¡Correcto! Es tipo '+c.k+'.</div>'+(d.tries===1?'La adivinaste a la primera.':'Ya la tienes.')+'</div>';
    return cardHTML(d.idx,posToT(d.pos),lead);
  }
  var body='<h2>¿Qué tipo de estrella es?</h2>'+
    '<p>Mira los colores y las líneas oscuras del espectro. Después elige una letra.</p>'+
    '<p>Si te trabas, abre la <a href="#guia">guía de pistas</a> o pide ver el color de la estrella.</p>';
  if(d.wrong.length){
    var g=d.wrong[d.wrong.length-1];
    var dir=g<d.idx?'más fría':'más caliente';
    body+='<div class="hintbox"><div class="big">Todavía no es tipo '+CLS[g].k+'.</div>La estrella es <b>'+dir+'</b> que una tipo '+CLS[g].k+'.';
    if(d.wrong.length>=2)body+='<br><br><b>Pista extra:</b> '+c.find;
    body+='</div>';
  }
  return '<article class="card">'+body+'</article>';
}

/* ---------------- Render ---------------- */
var lastKey='';
function render(){
  var det=state.mode==='detective',d=state.d;
  var pos=curPos(),T=posToT(pos),idx=posToIdx(pos),hid=detHidden();
  var rgb=starRGB(T);

  // Estrella
  var showColor=!hid||d.hint;
  if(showColor){
    root.style.setProperty('--star',rgbStr(rgb));
    root.style.setProperty('--star-hi',rgbStr(mix(rgb,255,.62)));
    root.style.setProperty('--star-lo',rgbStr(mix(rgb,0,.4)));
    root.style.setProperty('--glow',rgbStr(rgb,.45));
    root.style.setProperty('--glow2',rgbStr(rgb,.16));
  }
  starEl.classList.toggle('hidden',!showColor);
  starLetter.textContent=hid?'?':CLS[idx].k;

  // Espectro
  paintStrip(specCv,makeStarSampler(T),true);
  if(state.curve)drawCurve(T);
  specCv.setAttribute('aria-label',hid?'Espectro de una estrella misteriosa':'Espectro de una estrella tipo '+CLS[idx].k);
  buildTicks(T);

  // Pico de brillo
  var lam=2897771.955/T;
  if(hid){peakEl.hidden=true;peakNote.textContent='';}
  else if(lam<LMIN){peakEl.hidden=true;peakNote.textContent='Su luz más intensa es ultravioleta y no se ve.';}
  else if(lam>LMAX){peakEl.hidden=true;peakNote.textContent='Su luz más intensa es infrarroja y no se ve.';}
  else{peakEl.hidden=false;peakEl.style.left=((lam-LMIN)/(LMAX-LMIN)*100)+'%';peakNote.textContent='La marca blanca señala su luz más intensa: '+Math.round(lam)+' nm.';}

  // Botones de tipo
  classesEl.classList.toggle('det',det);
  cbtns.forEach(function(b,i){
    if(!det){b.disabled=false;b.setAttribute('aria-pressed',String(i===idx));}
    else{
      b.setAttribute('aria-pressed',String(d.done&&i===d.idx));
      b.disabled=d.done||d.wrong.indexOf(i)>=0;
    }
  });
  slider.setAttribute('aria-valuetext','Tipo '+CLS[idx].k+', '+fmt(round3(T))+' kelvin');

  // Barra detective
  if(det){
    btnHint.disabled=d.hint||d.done;
    btnReveal.disabled=d.done;
    scoreEl.textContent=state.score.rounds?'Aciertos a la primera: '+state.score.ok+' de '+state.score.rounds:'';
  }

  // Panel
  var key=state.mode+'|'+idx+'|'+round3(T)+'|'+d.done+'|'+d.wrong.length+'|'+d.idx+'|'+(d.gaveUp?1:0);
  if(key!==lastKey){
    lastKey=key;
    panel.innerHTML=det?detectivePanel():cardHTML(idx,T);
  }

  // Cursor del mapa
  var cur=$('#pcur');
  if(cur){
    if(hid){cur.setAttribute('visibility','hidden');}
    else{var x=PX(pos);cur.setAttribute('visibility','visible');cur.setAttribute('x1',x);cur.setAttribute('x2',x);}
  }
}

/* ---------------- Interacción ---------------- */
var anim=null;
function cancelAnim(){if(anim){cancelAnimationFrame(anim);anim=null;}}
function setPos(v){
  state.explorePos=Math.max(0,Math.min(7,v));
  slider.value=Math.round(state.explorePos*100);
  render();
}
function animateTo(target,dur){
  cancelAnim();
  if(reduce||dur<=0){setPos(target);return;}
  var from=state.explorePos,t0=performance.now();
  var step=function(now){
    var f=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-f,3);
    setPos(from+(target-from)*e);
    if(f<1)anim=requestAnimationFrame(step);else anim=null;
  };
  anim=requestAnimationFrame(step);
}
function announce(t){live.textContent='';setTimeout(function(){live.textContent=t;},40);}

function setMode(m){
  cancelAnim();
  state.mode=m;
  tabE.setAttribute('aria-pressed',String(m==='explore'));
  tabD.setAttribute('aria-pressed',String(m==='detective'));
  sliderWrap.hidden=(m!=='explore');
  detbar.hidden=(m!=='detective');
  if(m==='detective'&&!state.d.started)newMystery(true);
  lastKey='';
  render();
}
function newMystery(silent){
  var prev=state.d.idx,i;
  do{i=Math.floor(Math.random()*7);}while(i===prev);
  state.d={idx:i,pos:i+.12+Math.random()*.76,wrong:[],done:false,hint:false,tries:0,started:true,gaveUp:false};
  lastKey='';
  if(!silent){render();announce('Nueva estrella misteriosa.');}
}
function guess(i){
  var d=state.d;
  if(d.done||d.wrong.indexOf(i)>=0)return;
  d.tries++;
  if(i===d.idx){
    d.done=true;state.score.rounds++;if(d.tries===1)state.score.ok++;
    announce('Correcto. Es una estrella tipo '+CLS[i].k+'.');
  }else{
    d.wrong.push(i);
    announce('Todavía no. La estrella es '+(i<d.idx?'más fría':'más caliente')+' que una tipo '+CLS[i].k+'.');
  }
  render();
}

classesEl.addEventListener('click',function(e){
  var b=e.target.closest('.cbtn');if(!b||b.disabled)return;
  var i=Number(b.dataset.i);
  if(state.mode==='explore'){animateTo(i+.5,380);announce('Tipo '+CLS[i].k+', estrella '+CLS[i].nombre+'.');}
  else guess(i);
});
slider.addEventListener('input',function(){cancelAnim();state.explorePos=slider.value/100;render();});
tabE.addEventListener('click',function(){setMode('explore');});
tabD.addEventListener('click',function(){setMode('detective');});
btnHint.addEventListener('click',function(){state.d.hint=true;render();});
btnReveal.addEventListener('click',function(){
  var d=state.d;if(d.done)return;
  d.done=true;d.gaveUp=true;state.score.rounds++;
  announce('Era una estrella tipo '+CLS[d.idx].k+'.');
  render();
});
btnNext.addEventListener('click',function(){newMystery(false);});
curveChk.addEventListener('change',function(){state.curve=curveChk.checked;curveHelp.hidden=!state.curve;render();});
$('#clasificar').addEventListener('pointerdown',cancelAnim,true);
watch(stripEl,function(){render();});

/* ---------------- Guía ---------------- */
$('#guideBody').innerHTML=CLS.map(function(c,i){
  return '<tr>'+
    '<td data-l="Tipo"><span class="pill" style="background:'+rgbStr(starRGB(REP[i]))+'">'+c.k+'</span></td>'+
    '<td data-l="Color">'+c.nombre.charAt(0).toUpperCase()+c.nombre.slice(1)+'</td>'+
    '<td data-l="Temperatura">'+c.rango+'</td>'+
    '<td data-l="Cómo reconocerla">'+c.find+'</td>'+
    '<td data-l="Ejemplos">'+c.ej+'</td>'+
    '<td><button type="button" class="btn" data-go="'+i+'" aria-label="Ver el espectro de una estrella tipo '+c.k+'">Ver su espectro</button></td>'+
  '</tr>';
}).join('');
$('#guideBody').addEventListener('click',function(e){
  var b=e.target.closest('[data-go]');if(!b)return;
  setMode('explore');
  animateTo(Number(b.dataset.go)+.5,reduce?0:500);
  $('#clasificar').scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
});

/* ---------------- Vida ---------------- */
$('#life').innerHTML=CLS.map(function(c,i){
  var col=rgbStr(starRGB(REP[i]));
  return '<div class="lrow"><span class="lt" style="background:'+col+'">'+c.k+'</span>'+
    '<div><div class="lbar" role="img" aria-label="Tipo '+c.k+': '+c.vida+'"><i style="width:'+c.barra+'%;background:'+col+'"></i></div>'+
    '<div class="ltxt"><b>'+c.masa+' la masa del Sol.</b> Vive '+c.vida+'.</div></div></div>';
}).join('');

/* ---------------- Tres clases de luz ---------------- */
var HLINES=[[656.3,.9],[486.1,.55],[434.0,.35],[410.2,.25]];
function contS(l){var c=wl2rgb(l),bm=planck(500,5800);var I=Math.pow(planck(l,5800)/(bm*1.06),.42);return [c[0]*I*255,c[1]*I*255,c[2]*I*255];}
function emisS(l){var a=0;for(var i=0;i<HLINES.length;i++){var dx=(l-HLINES[i][0])/2;if(dx>5||dx<-5)continue;a+=HLINES[i][1]*Math.exp(-.5*dx*dx);}a=Math.min(1,a);var c=wl2rgb(l);return [c[0]*a*255,c[1]*a*255,c[2]*a*255];}
function absS(l){var t=1;for(var i=0;i<HLINES.length;i++){var dx=(l-HLINES[i][0])/2;if(dx>5||dx<-5)continue;t*=1-.95*HLINES[i][1]*Math.exp(-.5*dx*dx);}var c=contS(l);return [c[0]*t,c[1]*t,c[2]*t];}
[['#kCont',contS],['#kEmis',emisS],['#kAbs',absS]].forEach(function(p){
  var cv=$(p[0]);watch(cv,function(){paintStrip(cv,p[1],false);});
});

/* ---------------- Mapa de huellas ---------------- */
var PW=700,PH=290,PX0=46,PX1=684,PY0=34,PY1=238;
function PX(p){return PX0+(PX1-PX0)*p/7;}
function PY(v){return PY1-(PY1-PY0)*v;}
(function buildPayne(){
  var curves=[
    ['Helio ionizado',fHe2,'#8C63F2','start',6,-8],
    ['Helio',fHe,'#2E93E6','middle',0,-10],
    ['Hidrógeno',fH,'#E5487E','middle',0,-10],
    ['Calcio',fCa,'#17A589','end',-8,4],
    ['Metales',fMe,'#E5951F','start',8,4],
    ['TiO',fTiO,'#D9503A','start',8,4]
  ];
  var s='<svg viewBox="0 0 '+PW+' '+PH+'" role="img" aria-label="Curvas que muestran en qué tipo de estrella es más fuerte cada huella: helio ionizado en O, helio en B, hidrógeno en A, calcio en F y G, metales en G y K, óxido de titanio en M.">';
  var i;
  for(i=0;i<=7;i++)s+='<line class="ax" x1="'+PX(i)+'" y1="'+PY0+'" x2="'+PX(i)+'" y2="'+PY1+'" stroke-width="1"/>';
  s+='<line class="ax" x1="'+PX0+'" y1="'+PY1+'" x2="'+PX1+'" y2="'+PY1+'" stroke-width="2"/>';
  for(i=0;i<7;i++)s+='<text x="'+PX(i+.5)+'" y="'+(PY1+30)+'" text-anchor="middle" font-size="22" font-weight="800">'+CLS[i].k+'</text>';
  s+='<text x="'+PX0+'" y="'+(PH-4)+'" font-size="14" style="opacity:.75">Más caliente</text><text x="'+PX1+'" y="'+(PH-4)+'" text-anchor="end" font-size="14" style="opacity:.75">Más fría</text>';
  curves.forEach(function(c){
    var d='',best=0,bp=0;
    for(var p=0;p<=7.001;p+=.05){
      var v=c[1](posToT(p));
      d+=(p===0?'M':'L')+PX(p).toFixed(1)+' '+PY(v).toFixed(1)+' ';
      if(v>best+1e-9){best=v;bp=p;}
    }
    s+='<path d="'+d+'" fill="none" stroke="'+c[2]+'" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>';
    s+='<text x="'+(PX(bp)+c[4])+'" y="'+(PY(best)+c[5]+(c[5]>0?12:0))+'" text-anchor="'+c[3]+'" font-size="15" font-weight="700" style="fill:'+c[2]+'">'+c[0]+'</text>';
  });
  s+='<line id="pcur" class="cur" x1="'+PX(4.5)+'" x2="'+PX(4.5)+'" y1="'+(PY0-8)+'" y2="'+PY1+'"/>';
  s+='</svg>';
  $('#payne').innerHTML=s;
})();

/* ---------------- Inicio: un barrido del azul al Sol ---------------- */
var SUN_POS=4.27;
state.explorePos=0;slider.value=0;
render();
if(reduce){setPos(SUN_POS);}
else{setTimeout(function(){animateTo(SUN_POS,4200);},500);}

})();
