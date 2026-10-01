(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s);};
var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s));};
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var RAD=Math.PI/180;
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function fmt(n,d){return Number(n).toLocaleString('es-PA',{minimumFractionDigits:d||0,maximumFractionDigits:d||0});}
function setPressed(group,test){$$('button',group).forEach(function(b){b.setAttribute('aria-pressed',String(test(b)));});}
function watch(el,fn){if('ResizeObserver' in window){new ResizeObserver(fn).observe(el);}else window.addEventListener('resize',fn);}

/* ======================================================
   1. DIAGRAMAS ÓPTICOS
   ====================================================== */
function P(pts){return pts.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ');}
function ray(pts,cls){return '<polyline class="ray '+(cls||'')+'" points="'+P(pts)+'"/>';}
function lens(x,y,h,w){
  return '<path class="glass" d="M'+(x-w*.35)+' '+(y-h)+' Q'+(x-w*1.1)+' '+y+' '+(x-w*.35)+' '+(y+h)+' L'+(x+w*.35)+' '+(y+h)+' Q'+(x+w*1.1)+' '+y+' '+(x+w*.35)+' '+(y-h)+' Z"/>';
}
function txt(x,y,t,anchor,dim){return '<text class="txt'+(dim?' dim':'')+'" x="'+x+'" y="'+y+'" text-anchor="'+(anchor||'middle')+'">'+t+'</text>';}
function eyeShape(x,y,rot){
  return '<g transform="translate('+x+' '+y+') rotate('+(rot||0)+')"><ellipse class="eye" cx="0" cy="0" rx="20" ry="30"/><circle class="pupil" cx="-9" cy="0" r="6"/></g>';
}

function refractorSVG(chrom){
  var a=230,xl=190,F=470,xf=xl+F,fe=56,xe=xf+fe,hs=[-64,-32,0,32,64],s='',i;
  s+='<line class="axisline" x1="20" y1="'+a+'" x2="810" y2="'+a+'"/>';
  s+='<rect class="tube" x="'+(xl-24)+'" y="'+(a-88)+'" width="'+(xf-20-(xl-24))+'" height="176" rx="6"/>';
  s+='<rect class="tube" x="'+(xf-20)+'" y="'+(a-24)+'" width="'+(xe+16-(xf-20))+'" height="48" rx="4"/>';
  s+=lens(xl,a,80,26);
  s+=lens(xe,a,18,10);
  if(!chrom){
    for(i=0;i<hs.length;i++){var h=hs[i];s+=ray([[24,a+h],[xl,a+h],[xf,a],[xe,a-h*fe/F],[812,a-h*fe/F]]);}
    s+=eyeShape(834,a,0);
  }else{
    [[1.08,'r'],[1,''],[0.92,'b']].forEach(function(c){
      var Fc=F*c[0],xfc=xl+Fc;
      hs.forEach(function(h){if(h===0)return;s+=ray([[24,a+h],[xl,a+h],[xfc,a],[xfc+80,a-h*80/Fc]],c[1]);});
    });
    s+=ray([[24,a],[xe+30,a]]);
  }
  s+='<circle class="dotf" cx="'+xf+'" cy="'+a+'" r="4"/>';
  s+=txt(24,a+112,'Luz de la estrella','start',true);
  s+=txt(xl,a-104,'Objetivo (lente)');
  s+=txt(xf,a+112,'Punto focal');
  s+=txt(xe,a-36,'Ocular');
  if(!chrom)s+=txt(834,a+62,'Ojo');
  else s+=txt(xf+40,a-100,'Cada color se enfoca en un punto distinto','middle',true);
  return s;
}
function reflectorSVG(){
  var a=310,xv=800,F=480,xfa=xv-F,xs=430,hs=[-64,-46,-28,28,46,64],fy=a-110,ye=a-164,yend=a-232,s='',i;
  s+='<line class="axisline" x1="20" y1="'+a+'" x2="'+(xv+10)+'" y2="'+a+'"/>';
  s+='<rect class="tube" x="150" y="'+(a-86)+'" width="660" height="172" rx="6"/>';
  s+='<rect class="tube" x="'+(xs-16)+'" y="'+(ye-8)+'" width="32" height="'+((a-86)-(ye-8)+6)+'" rx="3" style="fill:var(--bench)"/>';
  s+=lens(xs,ye,18,10).replace('class="glass"','class="glass" transform="rotate(90 '+xs+' '+ye+')"');
  // espejo primario
  var d='',y;
  for(y=-86;y<=86;y+=6){d+=(y===-86?'M':'L')+(xv-y*y/(4*F)).toFixed(1)+' '+(a+y)+' ';}
  s+='<path class="mirror" d="'+d+'"/>';
  // espejo secundario plano
  s+='<line class="mirror" style="stroke-width:6" x1="'+(xs-22)+'" y1="'+(a-22)+'" x2="'+(xs+22)+'" y2="'+(a+22)+'"/>';
  for(i=0;i<hs.length;i++){
    var h=hs[i],p1x=xv-h*h/(4*F),p1y=a+h;
    var dx=xfa-p1x,dy=-h,len=Math.sqrt(dx*dx+dy*dy);dx/=len;dy/=len;
    var t=((p1x-xs)-h)/(dy-dx),hx=p1x+t*dx,hy=p1y+t*dy;
    var d2x=dy,d2y=dx;
    var sf=(fy-hy)/d2y,fx=hx+d2x*sf;
    var se=(ye-hy)/d2y,ex=hx+d2x*se;
    s+=ray([[24,a+h],[p1x,p1y],[hx,hy],[fx,fy],[ex,ye],[ex,yend]]);
  }
  s+='<circle class="dotf" cx="'+xs+'" cy="'+fy+'" r="4"/>';
  s+=eyeShape(xs,yend-24,90);
  s+='<line class="leader" x1="'+xs+'" y1="'+(a+26)+'" x2="'+xs+'" y2="'+(a+104)+'"/>';
  s+=txt(24,a+112,'Luz de la estrella','start',true);
  s+=txt(xs,a+128,'Espejo secundario (plano)');
  s+=txt(770,a+118,'Espejo primario (curvo)');
  s+=txt(xs+26,fy+6,'Punto focal','start');
  s+=txt(xs+26,ye+6,'Ocular','start');
  s+=txt(xs+42,yend-16,'Ojo','start');
  return s;
}
function cataSVG(){
  var a=230,xc=120,xs=150,xp=640,F1=600,xff=710,fe=56,xe=xff+fe,hs=[-66,-48,-30,30,48,66],s='',i,y;
  s+='<line class="axisline" x1="20" y1="'+a+'" x2="840" y2="'+a+'"/>';
  s+='<rect class="tube" x="110" y="'+(a-92)+'" width="560" height="184" rx="6"/>';
  s+='<rect class="tube" x="'+(xp+6)+'" y="'+(a-24)+'" width="'+(xe+18-(xp+6))+'" height="48" rx="4"/>';
  s+='<line class="glass" x1="'+xc+'" y1="'+(a-92)+'" x2="'+xc+'" y2="'+(a+92)+'" style="stroke-width:7"/>';
  s+='<path class="mirror" style="stroke-width:6" d="M'+(xs-3)+' '+(a-24)+' Q'+(xs+7)+' '+a+' '+(xs-3)+' '+(a+24)+'"/>';
  var up='',lo='';
  for(y=-90;y<=-26;y+=6){up+=(y===-90?'M':'L')+(xp-y*y/(4*F1)).toFixed(1)+' '+(a+y)+' ';}
  for(y=26;y<=90;y+=6){lo+=(y===26?'M':'L')+(xp-y*y/(4*F1)).toFixed(1)+' '+(a+y)+' ';}
  s+='<path class="mirror" d="'+up+'"/><path class="mirror" d="'+lo+'"/>';
  s+=lens(xe,a,18,10);
  for(i=0;i<hs.length;i++){
    var h=hs[i],p1x=xp-h*h/(4*F1),hy=h*(xs-(xp-F1))/(xp-(xp-F1));
    var ey=-hy*(xe-xff)/(xff-xs);
    s+=ray([[24,a+h],[xc,a+h],[p1x,a+h],[xs,a+hy],[xff,a],[xe,a+ey],[836,a+ey]]);
  }
  s+='<circle class="dotf" cx="'+xff+'" cy="'+a+'" r="4"/>';
  s+=eyeShape(858,a,0);
  s+='<line class="leader" x1="'+xs+'" y1="'+(a+26)+'" x2="'+xs+'" y2="'+(a+112)+'"/>';
  s+=txt(24,a-104,'Luz de la estrella','start',true);
  s+=txt(xc,a-104,'Lámina correctora','start');
  s+=txt(xs,a+128,'Espejo secundario');
  s+=txt(xp,a+124,'Espejo primario (con agujero)');
  s+=txt(xff,a+56,'Punto focal');
  s+=txt(xe,a-36,'Ocular');
  s+=txt(858,a+62,'Ojo');
  return s;
}
var OPT={
  refractor:{
    nombre:'Refractor',
    alt:'Diagrama de un refractor: rayos paralelos atraviesan una lente, convergen en el punto focal y el ocular los vuelve a hacer paralelos hacia el ojo.',
    como:'La luz atraviesa una lente grande, el objetivo, que la dobla (refracción) y la junta en un punto: el foco. Ahí se forma una imagen pequeña que el ocular, una lupa, agranda para tu ojo. Fíjate en el haz que sale del ocular: es más estrecho, porque toda la luz se concentró en la pupila.',
    pros:['Tubo cerrado: casi no necesita mantenimiento','Imágenes de buen contraste, sin nada que tape la luz','Muy buenos para la Luna, los planetas y las estrellas dobles'],
    contras:['Las lentes grandes son caras: por el mismo dinero tienes menos apertura','Los económicos dejan halos de color en los bordes (aberración cromática)','Los tubos largos son incómodos en aperturas mayores']
  },
  reflector:{
    nombre:'Reflector',
    alt:'Diagrama de un reflector newtoniano: la luz entra al tubo, rebota en un espejo curvo al fondo, luego en un espejo plano pequeño y sale por un costado hacia el ocular.',
    como:'Un espejo curvo al fondo del tubo (el primario) refleja la luz de vuelta y la enfoca. Un espejito plano e inclinado (el secundario) la desvía hacia un costado, donde está el ocular. No hay lentes, así que no hay halos de color. El espejito tapa un poco de luz en el centro.',
    pros:['La mayor apertura por tu dinero','Sin aberración cromática: los espejos reflejan todos los colores igual','Sobre una base tipo Dobson es muy fácil de usar'],
    contras:['El tubo está abierto: entra polvo y de vez en cuando hay que alinear los espejos (colimar)','El espejo secundario tapa parte de la luz','Los tubos grandes ocupan espacio']
  },
  cata:{
    nombre:'Catadióptrico',
    alt:'Diagrama de un telescopio catadióptrico tipo Schmidt-Cassegrain: la luz cruza una lámina correctora, rebota en el espejo del fondo, luego en un espejo pequeño y sale por un agujero en el primario.',
    como:'Mezcla lente y espejos (por eso se llama catadióptrico). Una lámina de vidrio corrige la luz, que rebota en el espejo grande del fondo, luego en uno pequeño que la manda de vuelta hacia atrás, y sale por un agujero en el primario. La luz recorre el tubo tres veces, así que un tubo corto tiene mucha distancia focal y mucho aumento.',
    pros:['Compacto y fácil de transportar','Mucho aumento en poco espacio: excelente para Luna y planetas','Es muy común en versiones con GoTo'],
    contras:['Cuesta más por cada milímetro de apertura','El campo de visión es estrecho: no es lo mejor para nebulosas grandes','Tarda en enfriarse y su espejo secundario tapa más luz']
  }
};
var opt={type:'refractor',chrom:false};
function renderOptics(){
  var info=OPT[opt.type],svg;
  if(opt.type==='refractor')svg=refractorSVG(opt.chrom);
  else if(opt.type==='reflector')svg=reflectorSVG();
  else svg=cataSVG();
  $('#optBench').innerHTML='<svg viewBox="0 0 900 440" role="img" aria-label="'+info.alt+'">'+svg+'</svg>';
  $('#optText').innerHTML='<h3>'+info.nombre+': cómo trabaja</h3><p>'+info.como+'</p>'+
    (opt.type==='refractor'&&opt.chrom?'<p>Un lente desvía cada color un poco distinto, como un prisma: el azul se enfoca antes que el rojo. Ese es el origen de los halos de color. Los espejos reflejan todos los colores igual, así que no lo sufren.</p>':'');
  $('#optPros').innerHTML='<h3>A favor</h3><ul>'+info.pros.map(function(t){return '<li>'+t+'</li>';}).join('')+'</ul><h3>En contra</h3><ul>'+info.contras.map(function(t){return '<li>'+t+'</li>';}).join('')+'</ul>';
  $('#chromWrap').hidden=(opt.type!=='refractor');
}
$('#optTabs').addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  opt.type=b.dataset.t;if(opt.type!=='refractor')opt.chrom=false;$('#chrom').checked=opt.chrom;
  setPressed($('#optTabs'),function(x){return x===b;});
  renderOptics();
});
$('#chrom').addEventListener('change',function(){opt.chrom=this.checked;renderOptics();});

/* ======================================================
   2. CALCULADORA Y VISOR
   ====================================================== */
var calc={D:200,F:1200,fe:25,barlow:false,obj:'luna'};
var resEl=$('#res');
function calcOut(){
  var D=calc.D,F=calc.F,M=F/calc.fe*(calc.barlow?2:1);
  var fov=50/M;
  return {D:D,F:F,M:M,fov:fov,ratio:F/D,pupil:D/M,light:Math.pow(D/7,2),dawes:116/D,mag:7.5+5*Math.log10(D/10),
    mmin:D/7,mmax:2*D,cross:fov*240};
}
function crossTxt(s){return s<90?Math.round(s)+' segundos':fmt(s/60,1)+' minutos';}
function renderCalc(){
  var c=calcOut();
  $('#dOut').textContent=c.D+' mm';
  $('#fOut').textContent=c.F+' mm';
  var ratioTxt=c.ratio<=6?'Es «rápido»: campo amplio, bueno para nebulosas y cúmulos.':(c.ratio<9?'Es versátil: sirve para casi todo.':'Es «lento»: mucho aumento, muy bueno para la Luna y los planetas.');
  var magTxt,magWarn=false;
  if(c.M<c.mmin){magTxt='Pocos aumentos: la luz sale en un haz más ancho que tu pupila y se desperdicia.';magWarn=true;}
  else if(c.M>c.mmax){magTxt='Demasiados: la imagen se ve grande pero borrosa y oscura. El límite útil ronda '+Math.round(c.mmax)+'×.';magWarn=true;}
  else magTxt='Dentro del rango útil de este telescopio (de '+Math.round(c.mmin)+'× a '+Math.round(c.mmax)+'×).';
  var pupTxt=c.pupil>5?'Muy abierta: ideal para nebulosas y cúmulos.':(c.pupil>=2?'Buena para casi todo.':(c.pupil>=1?'Estrecha: buena para Luna y planetas.':'Muy estrecha: solo en noches muy estables.'));
  var fovTxt=c.fov>=0.52?'La Luna (0.5°) cabe entera.':'La Luna no cabe entera.';
  var moon=c.fov>=0.52?'La Luna cabe entera.':'La Luna no cabe entera.';
  var cards=[
    ['Relación focal','f/'+fmt(c.ratio,1),ratioTxt,false],
    ['Aumentos',fmt(c.M,0)+'×',magTxt,magWarn],
    ['Pupila de salida',fmt(c.pupil,1)+' mm',pupTxt+' Tu ojo se abre hasta unos 7 mm de noche.',false],
    ['Campo de visión real',fmt(c.fov,2)+'°',moon,false],
    ['Luz que recoge',fmt(c.light,0)+' veces tu ojo','Crece con el cuadrado de la apertura: duplicarla da cuatro veces más luz.',false],
    ['Detalle más fino',fmt(c.dawes,1)+'″','Es el límite teórico. El aire suele limitarlo a 1 o 2″.',false],
    ['Estrella más débil','magnitud '+fmt(c.mag,1),'En un cielo oscuro. A simple vista llegas a la magnitud 6.',false],
    ['Tiempo en cruzar el campo',crossTxt(c.cross),'Sin motor, el objeto sale del ocular a ese ritmo y hay que mover el tubo.',false]
  ];
  resEl.innerHTML=cards.map(function(k){
    return '<div class="rc'+(k[3]?' warn':'')+'"><dt>'+k[0]+'</dt><dd><span class="v">'+k[1]+'</span><span class="n">'+k[2]+'</span></dd></div>';
  }).join('');
  // comparación con el ojo
  var rEye=46*7/Math.max(c.D,7);
  $('#cEye').setAttribute('r',Math.max(1.2,rEye).toFixed(2));
  $('#cBig').setAttribute('r',46);
  $('#eyeTxt').innerHTML='<b>Tu pupila</b> (punto rojo, unos 7 mm) frente a la apertura de <b>'+c.D+' mm</b>: el telescopio recoge unas <b>'+fmt(c.light,0)+' veces</b> más luz que tu ojo.';
  drawView(c);
}

/* ---- Visor: dibujo procedural de cada objeto ---- */
var viewCv=$('#view');
var mulberry=function(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};};
var FIELD=(function(){var r=mulberry(11),a=[];for(var i=0;i<70;i++){var ang=r()*6.283,rad=Math.sqrt(r());a.push([Math.cos(ang)*rad,Math.sin(ang)*rad,.6+r()*1.1,.35+r()*.5]);}return a;})();
var CRAT=(function(){var r=mulberry(5),a=[];for(var i=0;i<46;i++){var ang=r()*6.283,rad=Math.sqrt(r())*.93;a.push([Math.cos(ang)*rad,Math.sin(ang)*rad,.008+r()*.028]);}return a;})();
function blob(ctx,x,y,rx,ry,rgb,a0){
  ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);
  var g=ctx.createRadialGradient(0,0,0,0,0,1);
  g.addColorStop(0,'rgba('+rgb+','+a0+')');g.addColorStop(1,'rgba('+rgb+',0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,6.2832);ctx.fill();ctx.restore();
}
function dot(ctx,x,y,rpx,u,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,rpx/u,0,6.2832);ctx.fill();}
function drawMoon(ctx,u){
  var g=ctx.createRadialGradient(-.25,-.25,.1,0,0,1.05);
  g.addColorStop(0,'#ece8de');g.addColorStop(1,'#aaa69d');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,6.2832);ctx.fill();
  if(u<4)return;
  ctx.save();ctx.beginPath();ctx.arc(0,0,1,0,6.2832);ctx.clip();
  [[-.6,-.05,.32,.42,.62],[-.3,-.45,.3,.24,.6],[.12,-.38,.17,.16,.6],[.38,-.08,.22,.2,.58],[.72,-.28,.11,.09,.6],[.7,.16,.13,.15,.5],[-.3,.42,.16,.13,.5],[-.62,.38,.1,.09,.55]].forEach(function(m){blob(ctx,m[0],m[1],m[2],m[3],'74,72,70',m[4]);});
  if(u>40){
    ctx.lineWidth=1/u;
    CRAT.forEach(function(c){ctx.strokeStyle='rgba(60,58,56,.22)';ctx.beginPath();ctx.arc(c[0],c[1],c[2],0,6.2832);ctx.stroke();});
    ctx.strokeStyle='rgba(255,255,255,.16)';
    for(var k=0;k<10;k++){var ang=k*.628;ctx.beginPath();ctx.moveTo(-.12,.72);ctx.lineTo(-.12+Math.cos(ang)*.5,.72+Math.sin(ang)*.5);ctx.stroke();}
    blob(ctx,-.12,.72,.05,.05,'255,255,255',.9);blob(ctx,-.32,-.12,.04,.04,'255,255,255',.8);
  }
  var lg=ctx.createRadialGradient(0,0,.75,0,0,1);lg.addColorStop(0,'rgba(0,0,0,0)');lg.addColorStop(1,'rgba(0,0,0,.28)');
  ctx.fillStyle=lg;ctx.fillRect(-1.1,-1.1,2.2,2.2);
  ctx.restore();
}
function drawJupiter(ctx,u){
  [[6,-.07],[-9.4,.05],[15,-.08],[-26,.1]].forEach(function(m){dot(ctx,m[0],m[1],Math.max(1.2,u*.06),u,'#f3efe6');});
  if(u<2.2){dot(ctx,0,0,Math.max(1.8,u*1),u,'#f0dcb8');return;}
  ctx.save();ctx.scale(1,.935);ctx.beginPath();ctx.arc(0,0,1,0,6.2832);ctx.clip();
  ctx.fillStyle='#d9b98f';ctx.fillRect(-1.1,-1.1,2.2,2.2);
  [[-.95,-.7,'#c9a37a'],[-.7,-.5,'#ead6b6'],[-.5,-.3,'#b98a5f'],[-.3,-.05,'#efdcc0'],[-.05,.2,'#b57d55'],[.2,.4,'#ead6b8'],[.4,.62,'#c39568'],[.62,.95,'#dcc09a']].forEach(function(b){ctx.fillStyle=b[2];ctx.fillRect(-1.1,b[0],2.2,b[1]-b[0]);});
  ctx.fillStyle='rgba(190,90,60,.85)';ctx.beginPath();ctx.ellipse(.35,.38,.16,.09,0,0,6.2832);ctx.fill();
  var lg=ctx.createRadialGradient(0,0,.5,0,0,1);lg.addColorStop(0,'rgba(0,0,0,0)');lg.addColorStop(1,'rgba(0,0,0,.5)');
  ctx.fillStyle=lg;ctx.fillRect(-1.1,-1.1,2.2,2.2);
  ctx.restore();
}
function drawSaturn(ctx,u){
  if(u<2.2){ctx.save();ctx.scale(2.4,1);dot(ctx,0,0,Math.max(1.6,u),u/2.4,'#ead7a6');ctx.restore();return;}
  ctx.save();ctx.rotate(-.3);
  var tilt=.44;
  function annulus(ro,ri,col){
    ctx.fillStyle=col;ctx.beginPath();
    ctx.ellipse(0,0,ro,ro*tilt,0,0,6.2832);
    ctx.ellipse(0,0,ri,ri*tilt,0,6.2832,0,true);
    ctx.fill();
  }
  function rings(){
    annulus(1.55,1.24,'rgba(150,130,100,.5)');annulus(1.95,1.55,'#e7d5a5');annulus(2.27,2.04,'#cdb886');
  }
  ctx.save();ctx.beginPath();ctx.rect(-3,-3,6,3);ctx.clip();rings();ctx.restore();
  var g=ctx.createRadialGradient(-.3,-.3,.1,0,0,1);g.addColorStop(0,'#f0e0b4');g.addColorStop(1,'#b59b6c');
  ctx.save();ctx.scale(1,.9);ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,6.2832);ctx.fill();
  ctx.fillStyle='rgba(150,120,80,.25)';ctx.fillRect(-1,-.2,2,.16);ctx.fillRect(-1,.25,2,.12);ctx.restore();
  ctx.save();ctx.beginPath();ctx.rect(-3,0,6,3);ctx.clip();rings();ctx.restore();
  ctx.restore();
}
function drawPleiades(ctx,u){
  var B=[[0,0,3.4],[-.3,.08,2.8],[.26,-.14,2.6],[.06,.34,2.7],[-.16,-.32,2.4],[.4,.22,2.3],[-.44,-.22,2.1],[.16,.5,1.9],[-.05,-.55,1.9]];
  blob(ctx,.02,.02,.2,.2,'130,170,255',.25);blob(ctx,-.28,.1,.12,.12,'130,170,255',.18);
  var r=mulberry(3),i;
  for(i=0;i<34;i++){var ang=r()*6.283,rad=Math.sqrt(r())*.95;dot(ctx,Math.cos(ang)*rad,Math.sin(ang)*rad,.6+r()*.9,u,'rgba(230,236,255,.75)');}
  B.forEach(function(b){blob(ctx,b[0],b[1],b[2]*2.5/u,b[2]*2.5/u,'170,200,255',.5);dot(ctx,b[0],b[1],b[2],u,'#eef3ff');});
}
function drawOrion(ctx,u){
  blob(ctx,0,0,.75,.6,'190,165,215',.45);blob(ctx,.28,-.16,.45,.3,'170,190,235',.4);blob(ctx,-.32,.12,.4,.32,'190,170,220',.4);
  blob(ctx,.02,.06,.2,.17,'255,242,238',.85);blob(ctx,.03,-.3,.08,.08,'230,225,255',.7);
  ctx.fillStyle='rgba(8,6,16,.55)';ctx.beginPath();ctx.moveTo(-.05,-.04);ctx.lineTo(-.4,-.12);ctx.lineTo(-.34,.08);ctx.closePath();ctx.fill();
  [[.0,.04],[.035,.055],[.02,.09],[-.02,.07]].forEach(function(t){dot(ctx,t[0],t[1],1.6,u,'#ffffff');});
}
function drawAndromeda(ctx,u){
  ctx.save();ctx.rotate(-.62);
  blob(ctx,0,0,1.6,.5,'225,225,240',.28);blob(ctx,0,0,1.05,.3,'235,232,235',.42);blob(ctx,0,0,.35,.14,'255,244,220',.9);
  ctx.restore();
  blob(ctx,.55,.62,.09,.09,'240,240,245',.55);blob(ctx,-.9,-.85,.14,.09,'230,230,240',.32);
}
var VIEW={
  luna:{deg:.26,draw:drawMoon,size:.52,name:'La Luna'},
  jupiter:{deg:.00625,draw:drawJupiter,size:.0125,name:'Júpiter'},
  saturn:{deg:.00236,draw:drawSaturn,size:.0107,name:'Saturno con sus anillos'},
  pleiades:{deg:.9,draw:drawPleiades,size:1.8,name:'Las Pléyades'},
  orion:{deg:.5,draw:drawOrion,size:1,name:'La Nebulosa de Orión'},
  andromeda:{deg:1.5,draw:drawAndromeda,size:3,name:'La galaxia de Andrómeda'}
};
function drawView(c){
  var ctx=viewCv.getContext('2d');if(!ctx)return;
  var S=viewCv.width,cc=S/2,R=S/2-4,i;
  ctx.clearRect(0,0,S,S);
  ctx.save();ctx.beginPath();ctx.arc(cc,cc,R,0,6.2832);ctx.clip();
  ctx.fillStyle='#02040a';ctx.fillRect(0,0,S,S);
  for(i=0;i<FIELD.length;i++){var f=FIELD[i];ctx.fillStyle='rgba(255,255,255,'+f[3]+')';ctx.beginPath();ctx.arc(cc+f[0]*R,cc+f[1]*R,f[2],0,6.2832);ctx.fill();}
  var k=R/(c.fov/2),o=VIEW[calc.obj],u=o.deg*k;
  ctx.translate(cc,cc);ctx.scale(u,u);
  o.draw(ctx,u);
  ctx.restore();
  ctx.strokeStyle='#1c2430';ctx.lineWidth=4;ctx.beginPath();ctx.arc(cc,cc,R,0,6.2832);ctx.stroke();
  var frac=o.size/c.fov,msg;
  if(frac>1.02)msg=o.name+' no cabe entera: ocupa '+fmt(frac,1)+' veces el campo.';
  else if(frac<0.02)msg=o.name+' se ve como un puntito diminuto ('+fmt(frac*100,1)+'% del campo). Necesitas más aumentos.';
  else msg=o.name+' ocupa el '+fmt(frac*100,0)+'% del campo.';
  $('#vcap').textContent=msg;
  viewCv.setAttribute('aria-label','Vista por el ocular a '+fmt(c.M,0)+' aumentos: '+msg);
}
$('#dSl').addEventListener('input',function(){calc.D=Number(this.value);renderCalc();});
$('#fSl').addEventListener('input',function(){calc.F=Number(this.value);renderCalc();});
$('#eyeps').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;calc.fe=Number(b.dataset.e);setPressed(this,function(x){return x===b;});renderCalc();});
$('#barlow').addEventListener('change',function(){calc.barlow=this.checked;renderCalc();});
$('#objs').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;calc.obj=b.dataset.o;setPressed(this,function(x){return x===b;});renderCalc();});
$('#presets').addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  calc.D=Number(b.dataset.d);calc.F=Number(b.dataset.f);
  $('#dSl').value=calc.D;$('#fSl').value=calc.F;renderCalc();
});

/* ======================================================
   3. DIFRACCIÓN: DOS ESTRELLAS
   ====================================================== */
var ar={D:100,sep:2.5,seeing:2};
var airyCv=$('#airy');
function J1(x){
  var ax=Math.abs(x),v;
  if(ax<3){var t=(x/3)*(x/3);return x*(0.5-0.56249985*t+0.21093573*Math.pow(t,2)-0.03954289*Math.pow(t,3)+0.00443319*Math.pow(t,4)-0.00031761*Math.pow(t,5)+0.00001109*Math.pow(t,6));}
  var y=3/ax;
  var f1=0.79788456+0.00000156*y+0.01659667*y*y+0.00017105*Math.pow(y,3)-0.00249511*Math.pow(y,4)+0.00113653*Math.pow(y,5)-0.00020033*Math.pow(y,6);
  var th=ax-2.35619449+0.12499612*y+0.0000565*y*y-0.00637879*Math.pow(y,3)+0.00074348*Math.pow(y,4)+0.00079824*Math.pow(y,5)-0.00029166*Math.pow(y,6);
  v=f1*Math.cos(th)/Math.sqrt(ax);
  return x<0?-v:v;
}
function airyI(rArc,Dmm){
  if(rArc<1e-6)return 1;
  var x=Math.PI*(Dmm*1e-3)*(rArc/206264.806)/550e-9,v=2*J1(x)/x;
  return v*v;
}
function gblur(src,N,sig){
  if(sig<.35)return src;
  var r=Math.ceil(3*sig),k=[],sum=0,i,x,y,acc;
  for(i=-r;i<=r;i++){var w=Math.exp(-i*i/(2*sig*sig));k.push(w);sum+=w;}
  for(i=0;i<k.length;i++)k[i]/=sum;
  var tmp=new Float32Array(N*N),dst=new Float32Array(N*N);
  for(y=0;y<N;y++)for(x=0;x<N;x++){acc=0;for(i=-r;i<=r;i++){var xx=x+i;if(xx>=0&&xx<N)acc+=src[y*N+xx]*k[i+r];}tmp[y*N+x]=acc;}
  for(y=0;y<N;y++)for(x=0;x<N;x++){acc=0;for(i=-r;i<=r;i++){var yy=y+i;if(yy>=0&&yy<N)acc+=tmp[yy*N+x]*k[i+r];}dst[y*N+x]=acc;}
  return dst;
}
function renderAiry(){
  var N=128,FIELDARC=12,px=FIELDARC/N,half=N/2,x,y;
  var raw=new Float32Array(N*N);
  var x1=half-ar.sep/2/px,x2=half+ar.sep/2/px;
  for(y=0;y<N;y++)for(x=0;x<N;x++){
    var dy=(y+.5-half)*px;
    var r1=Math.hypot((x+.5-x1)*px,dy),r2=Math.hypot((x+.5-x2)*px,dy);
    raw[y*N+x]=airyI(r1,ar.D)+airyI(r2,ar.D);
  }
  var img=gblur(raw,N,(ar.seeing/2.355)/px);
  var mx=0,i;for(i=0;i<img.length;i++)if(img[i]>mx)mx=img[i];
  var ctx=airyCv.getContext('2d');
  if(ctx){
    var id=ctx.createImageData(N,N);
    for(i=0;i<img.length;i++){var v=Math.pow(img[i]/mx,.42),o=i*4;id.data[o]=255*v;id.data[o+1]=244*v;id.data[o+2]=225*v;id.data[o+3]=255;}
    ctx.putImageData(id,0,0);
  }
  // perfil por el centro
  var row=Math.floor(half),pa=img[row*N+Math.round(x1)],pb=img[row*N+Math.round(x2)],pc=img[row*N+Math.round(half)];
  var dip=pc/Math.min(pa,pb),v,t;
  var dawes=116/ar.D;
  if(dip<.8){v='Se ven dos estrellas separadas';t='Tu telescopio y el aire alcanzan para distinguirlas.';}
  else if(dip<.97){v='Apenas se separan';t='Se ve una estrella alargada con una pequeña muesca. Estás en el límite.';}
  else{v='Se ve una sola estrella';t=ar.seeing>dawes*1.4?'Aquí la atmósfera manda: el aire borra el detalle. Un telescopio más grande no ayudaría mucho.':'La separación es menor que lo que tu apertura puede resolver. Necesitas más apertura.';}
  $('#verdict').textContent=v;$('#verdictTxt').textContent=t;
  $('#limScope').textContent=fmt(dawes,1)+'″';$('#limAir').textContent=fmt(ar.seeing,1)+'″';
  $('#aDo').textContent=ar.D+' mm';$('#aSo').textContent=fmt(ar.sep,1)+'″';
  airyCv.setAttribute('aria-label','Simulación de dos estrellas separadas '+fmt(ar.sep,1)+' segundos de arco vistas con '+ar.D+' mm de apertura: '+v);
}
$('#aD').addEventListener('input',function(){ar.D=Number(this.value);renderAiry();});
$('#aS').addEventListener('input',function(){ar.sep=Number(this.value);renderAiry();});
$('#seeing').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;ar.seeing=Number(b.dataset.s);setPressed(this,function(x){return x===b;});renderAiry();});
$('#apresets').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;ar.sep=Number(b.dataset.sep);$('#aS').value=ar.sep;renderAiry();});

/* ======================================================
   4. MONTURAS
   ====================================================== */
var lat=9;
function arrowDefs(id){return '<defs><marker id="'+id+'" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" style="fill:var(--accent)"/></marker></defs>';}
function altSVG(){
  var s='<svg viewBox="0 0 340 290" role="img" aria-label="Montura altazimutal: un eje vertical para girar de lado y un eje horizontal para subir y bajar el tubo.">'+arrowDefs('ah1');
  s+='<line class="ground" x1="20" y1="262" x2="320" y2="262"/>';
  s+='<path class="leg" d="M170 172 L112 262 M170 172 L228 262 M170 172 L170 262"/>';
  s+='<rect class="metal" x="163" y="120" width="14" height="54" rx="3"/>';
  s+='<ellipse class="arrow" cx="170" cy="150" rx="58" ry="13" stroke-dasharray="7 6" marker-end="url(#ah1)" style="fill:none"/>';
  s+='<g transform="rotate(-32 170 108)"><rect class="tubei" x="58" y="97" width="226" height="22" rx="9"/><rect class="metal" x="262" y="90" width="14" height="10" rx="2"/></g>';
  s+='<circle class="metal" cx="170" cy="108" r="14"/>';
  s+='<path class="arrow" d="M272 108 A102 102 0 0 0 257 51" marker-end="url(#ah1)"/>';
  s+='<text class="acc" x="322" y="150" text-anchor="end">Gira de lado</text><text x="322" y="166" text-anchor="end">(acimut)</text>';
  s+='<text class="acc" x="322" y="40" text-anchor="end">Sube y baja</text><text x="322" y="56" text-anchor="end">(altura)</text>';
  s+='</svg>';
  return s;
}
function eqSVG(phi){
  var f=phi*RAD,Hx=100,Hy=190,ux=Math.cos(f),uy=-Math.sin(f);
  var Px=Hx+ux*95,Py=Hy+uy*95,Ex=Hx+ux*150,Ey=Hy+uy*150;
  var s='<svg viewBox="0 0 340 290" role="img" aria-label="Montura ecuatorial: el eje polar está inclinado según la latitud y apunta al polo celeste; un segundo eje, la declinación, es perpendicular.">'+arrowDefs('ah2');
  s+='<line class="ground" x1="20" y1="262" x2="320" y2="262"/>';
  s+='<path class="leg" d="M'+Hx+' '+Hy+' L52 262 M'+Hx+' '+Hy+' L152 262 M'+Hx+' '+Hy+' L'+Hx+' 262"/>';
  s+='<line class="thin" x1="'+Hx+'" y1="'+Hy+'" x2="'+(Hx+170)+'" y2="'+Hy+'"/>';
  s+='<line class="thin" x1="'+Px+'" y1="'+Py+'" x2="'+Ex+'" y2="'+Ey+'"/>';
  s+='<line class="polar" x1="'+Hx+'" y1="'+Hy+'" x2="'+Px+'" y2="'+Py+'"/>';
  s+='<g transform="translate('+Px.toFixed(1)+' '+Py.toFixed(1)+') rotate('+(-phi)+')">'+
     '<rect class="tubei" x="-64" y="-52" width="160" height="24" rx="9"/>'+
     '<rect class="metal" x="-6" y="-42" width="12" height="80" rx="3"/>'+
     '<rect class="weight" x="-3" y="34" width="6" height="44" rx="2"/><rect class="weight" x="-16" y="66" width="32" height="20" rx="4"/></g>';
  s+='<path class="arrow" d="M'+(Hx+56)+' '+Hy+' A56 56 0 0 0 '+(Hx+56*Math.cos(f)).toFixed(1)+' '+(Hy-56*Math.sin(f)).toFixed(1)+'" />';
  s+='<text class="acc" x="'+(Hx+66)+'" y="'+(Hy-6)+'">'+phi+'°</text>';
  s+='<text x="'+(Hx+172)+'" y="'+(Hy+16)+'" text-anchor="end">horizonte</text>';
  s+='<text class="acc" x="'+Math.min(318,Ex+4)+'" y="'+(Ey-8)+'" text-anchor="'+(Ex>230?'end':'start')+'">★ polo celeste norte</text>';
  s+='<text x="'+Hx+'" y="282" text-anchor="middle">Eje polar (paralelo al eje de la Tierra)</text>';
  s+='</svg>';
  return s;
}
function renderMounts(){
  $('#svgAlt').innerHTML=altSVG();
  $('#svgEq').innerHTML=eqSVG(lat);
  $('#latOut').textContent=lat+'°';
}

/* ---- Seguimiento ---- */
var tr={dec:-1,zenith:false,t:-2,timer:null};
function decNow(){return tr.zenith?Math.min(lat,88):tr.dec;}
function altaz(t){
  var H=t*15*RAD,d=decNow()*RAD,p=lat*RAD;
  var sa=Math.sin(p)*Math.sin(d)+Math.cos(p)*Math.cos(d)*Math.cos(H);
  var alt=Math.asin(clamp(sa,-1,1))/RAD;
  var Ax=Math.cos(H)*Math.sin(p)-Math.tan(d)*Math.cos(p);
  var sgn=(decNow()<lat)?1:-1;
  var rel=Math.atan2(Math.sin(H),sgn*Ax)/RAD;
  var azN=(Math.atan2(Math.sin(H),Ax)/RAD+180+360)%360;
  return {alt:alt,rel:rel,azN:azN};
}
function rates(t){
  var a=altaz(t-.005),b=altaz(t+.005),dalt=Math.abs(b.alt-a.alt)/.01,daz=Math.abs(b.rel-a.rel);
  daz=daz>180?Infinity:daz/.01;
  return {alt:dalt,az:daz};
}
function rateTxt(x){return (!isFinite(x)||x>300)?'más de 300°/h':fmt(x,0)+'°/h';}
function renderTracking(){
  var i,p,t;
  // vista del cielo
  var R=120,cx=150,cy=150,s='';
  [30,60,90].forEach(function(al){s+='<circle class="sk-c" cx="'+cx+'" cy="'+cy+'" r="'+((90-al)/90*R).toFixed(1)+'"/>';});
  s+='<line class="sk-c" x1="'+cx+'" y1="'+(cy-R)+'" x2="'+cx+'" y2="'+(cy+R)+'"/><line class="sk-c" x1="'+(cx-R)+'" y1="'+cy+'" x2="'+(cx+R)+'" y2="'+cy+'"/>';
  s+='<text class="sk-t" x="'+cx+'" y="'+(cy-R-8)+'" text-anchor="middle">N</text><text class="sk-t" x="'+cx+'" y="'+(cy+R+18)+'" text-anchor="middle">S</text>';
  s+='<text class="sk-t" x="'+(cx-R-12)+'" y="'+(cy+5)+'" text-anchor="middle">E</text><text class="sk-t" x="'+(cx+R+13)+'" y="'+(cy+5)+'" text-anchor="middle">O</text>';
  function xy(q){var r=(90-q.alt)/90*R,a=q.azN*RAD;return [cx-r*Math.sin(a),cy-r*Math.cos(a)];}
  var d='',pen=false;
  for(t=-6;t<=6.001;t+=.1){p=altaz(t);if(p.alt<0){pen=false;continue;}var c=xy(p);d+=(pen?'L':'M')+c[0].toFixed(1)+' '+c[1].toFixed(1)+' ';pen=true;}
  s+='<path class="sk-path" d="'+d+'"/>';
  var now=altaz(tr.t);
  if(now.alt>=0){var cn=xy(now);s+='<circle class="sk-dot" cx="'+cn[0].toFixed(1)+'" cy="'+cn[1].toFixed(1)+'" r="9"/>';}
  $('#sky').innerHTML=s;

  // gráfica
  var L=54,Rr=624,T0=14,B0=266;
  var X=function(tt){return L+(tt+6)/12*(Rr-L);},Y=function(v){return T0+(180-v)/360*(B0-T0);};
  var g='';
  [-180,-90,0,90,180].forEach(function(v){g+='<line class="ch-g" x1="'+L+'" y1="'+Y(v)+'" x2="'+Rr+'" y2="'+Y(v)+'"/><text class="ch-t" x="'+(L-8)+'" y="'+(Y(v)+5)+'" text-anchor="end">'+v+'°</text>';});
  [-6,-3,0,3,6].forEach(function(v){g+='<text class="ch-t" x="'+X(v)+'" y="'+(B0+22)+'" text-anchor="middle">'+(v>0?'+':'')+v+' h</text>';});
  function path(fn,color,w){
    var dd='',pn=false,prev=null;
    for(var tt=-6;tt<=6.001;tt+=.1){
      var q=altaz(tt);if(q.alt<0){pn=false;prev=null;continue;}
      var v=fn(q,tt);
      if(prev!==null&&Math.abs(v-prev)>150)pn=false;
      dd+=(pn?'L':'M')+X(tt).toFixed(1)+' '+Y(v).toFixed(1)+' ';pn=true;prev=v;
    }
    return '<path d="'+dd+'" fill="none" stroke="'+color+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  g+=path(function(q,tt){return 15*tt;},'var(--c-eq)',4.5);
  g+=path(function(q){return q.rel;},'var(--c-az)',3);
  g+=path(function(q){return q.alt;},'var(--c-alt)',3);
  g+='<line class="ch-cur" x1="'+X(tr.t)+'" y1="'+T0+'" x2="'+X(tr.t)+'" y2="'+B0+'"/>';
  $('#chart').innerHTML=g;

  $('#tOut').textContent=(tr.t>0?'+':'')+fmt(tr.t,1)+' h';
  var r=rates(tr.t);
  var ro;
  if(now.alt<0){
    ro='<div class="rc"><dt>Estrella bajo el horizonte</dt><dd><span class="n">A esta hora la estrella no se ve. Mueve el tiempo hacia su punto más alto (0 h).</span></dd></div>';
  }else{
    var boom=(!isFinite(r.az)||r.az>300);
    ro='<div class="rc'+(boom?' warn':'')+'"><dt>Montura altazimutal: dos ejes</dt><dd><span class="v">'+rateTxt(r.az)+' y '+rateTxt(r.alt)+'</span><span class="n">Velocidad del acimut y de la altura ahora mismo. Cambian todo el rato.'+(boom?' Cerca del cenit el acimut se dispara: por eso la altazimutal tiene un «punto ciego» arriba.':'')+'</span></dd></div>'+
       '<div class="rc"><dt>Montura ecuatorial: un eje</dt><dd><span class="v">15°/h</span><span class="n">Siempre igual, a toda hora y para cualquier estrella. Por eso un solo motor basta.</span></dd></div>';
  }
  $('#readout').innerHTML=ro;
}
$('#latSl').addEventListener('input',function(){lat=Number(this.value);renderMounts();renderTracking();});
$('#tSl').addEventListener('input',function(){stopPlay();tr.t=Number(this.value);renderTracking();});
$('#stars').addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  tr.zenith=(b.dataset.dec==='zenith');if(!tr.zenith)tr.dec=Number(b.dataset.dec);
  setPressed(this,function(x){return x===b;});renderTracking();
});
function stopPlay(){if(tr.timer){cancelAnimationFrame(tr.timer);tr.timer=null;}$('#play').textContent='Reproducir';}
$('#play').addEventListener('click',function(){
  if(tr.timer){stopPlay();return;}
  if(tr.t>=5.9)tr.t=-6;
  $('#play').textContent='Pausar';
  var last=performance.now();
  var step=function(now){
    tr.t=Math.min(6,tr.t+(now-last)/1000*.9);last=now;
    $('#tSl').value=tr.t;renderTracking();
    if(tr.t<6)tr.timer=requestAnimationFrame(step);else stopPlay();
  };
  tr.timer=requestAnimationFrame(step);
});

/* ======================================================
   5. ELEGIR
   ====================================================== */
var QS=[
  {k:'int',q:'¿Qué te gustaría ver más?',o:[['planetas','La Luna y los planetas'],['profundo','Nebulosas y galaxias'],['todo','Un poco de todo'],['foto','Quiero fotografiar']],d:'todo'},
  {k:'pre',q:'¿Cuánto quieres gastar (aproximado, en dólares)?',o:[['150','Hasta 150'],['400','150 a 400'],['1000','400 a 1,000'],['5000','Más de 1,000']],d:'400'},
  {k:'uso',q:'¿Dónde y cómo lo usarás?',o:[['patio','Desde casa o el patio'],['carro','Lo llevo en carro a lugares oscuros'],['viaje','Necesito que sea muy portátil'],['ciudad','Vivo con mucha luz de ciudad']],d:'patio'},
  {k:'buscar',q:'¿Cómo prefieres encontrar los objetos?',o:[['aprender','Quiero aprender a buscarlos yo'],['goto','Que el telescopio los encuentre por mí']],d:'aprender'}
];
var CAT=[
  {id:'binoc',n:'Binoculares 10×50',m:'En la mano o sobre un trípode de foto',pmin:40,pmax:150,a:{planet:1,deep:2,photo:0,port:5,simple:5,goto:0,city:3},
   care:'No muestran detalles de los planetas: Júpiter es un puntito acompañado de sus lunas.',desc:'Perfectos para reconocer constelaciones, la Luna, cúmulos y las lunas de Júpiter.'},
  {id:'refrac',n:'Refractor de 70 a 90 mm',m:'Altazimutal sobre trípode',pmin:100,pmax:300,a:{planet:3,deep:1,photo:1,port:4,simple:4,goto:0,city:4},
   care:'Evita los de caja que presumen 500× o más: traen montura temblorosa y lentes pobres. Busca un trípode firme.',desc:'Ligero, de uso inmediato y muy bueno para la Luna, los planetas y las estrellas dobles.'},
  {id:'dobson',n:'Dobsoniano de 6″ a 8″ (150 a 200 mm)',m:'Altazimutal tipo Dobson, sin trípode',pmin:300,pmax:700,a:{planet:4,deep:5,photo:0,port:2,simple:4,goto:0,city:3},
   care:'Es voluminoso (el tubo mide más de un metro) y hay que empujarlo a mano para seguir el objeto. De vez en cuando pide alinear los espejos.',desc:'La mayor apertura por tu dinero. Muestra nebulosas, galaxias y planetas con mucho detalle.'},
  {id:'newton',n:'Newtoniano de 130 a 150 mm',m:'Ecuatorial alemana con contrapesos',pmin:250,pmax:600,a:{planet:3,deep:4,photo:2,port:2,simple:2,goto:1,city:3},
   care:'Armarla y alinearla con el polo cuesta al principio. Las monturas económicas tiemblan y pueden arruinar la experiencia.',desc:'Seguimiento con un solo eje y buena apertura para el precio.'},
  {id:'mak',n:'Maksutov-Cassegrain de 90 a 127 mm',m:'Altazimutal de mesa, trípode o horquilla',pmin:250,pmax:800,a:{planet:5,deep:2,photo:1,port:4,simple:3,goto:2,city:5},
   care:'El campo es estrecho: no es lo mejor para nebulosas grandes. Necesita un rato para enfriarse antes de usarlo.',desc:'Compacto y con mucho aumento en poco tubo. Un gran aliado de la Luna y los planetas, incluso con luz de ciudad.'},
  {id:'gotosm',n:'Telescopio GoTo de 80 a 130 mm',m:'Altazimutal computarizada',pmin:250,pmax:700,a:{planet:3,deep:3,photo:1,port:3,simple:3,goto:5,city:3},
   care:'La alineación inicial pide paciencia, y la calidad varía mucho entre marcas. La apertura pequeña limita las nebulosas y galaxias.',desc:'Encuentra los objetos por ti y los sigue con motores, ideal para no perder tiempo buscando.'},
  {id:'sct',n:'Schmidt-Cassegrain de 6″ a 8″ con GoTo',m:'Horquilla altazimutal computarizada',pmin:800,pmax:2200,a:{planet:5,deep:4,photo:3,port:3,simple:3,goto:5,city:4},
   care:'Cuesta más por su apertura, necesita corriente eléctrica y alinearlo con estrellas cada noche.',desc:'Compacto, potente y automático. Lo mejor para quien quiere versatilidad y comodidad.'},
  {id:'apo',n:'Refractor apocromático de 80 a 100 mm',m:'Ecuatorial motorizada',pmin:1200,pmax:3500,a:{planet:4,deep:4,photo:5,port:3,simple:1,goto:3,city:4},
   care:'Es una inversión grande. Para fotografiar también necesitas cámara, guiado, software y mucha práctica.',desc:'La opción seria para empezar en astrofotografía, con imágenes muy limpias.'}
];
var W_INT={planetas:{planet:3,deep:.5,city:1},profundo:{planet:.5,deep:3},todo:{planet:1.5,deep:1.5},foto:{photo:3.5,planet:.5,deep:.5}};
var W_USO={patio:{simple:.8,port:.5},carro:{deep:1,port:.3},viaje:{port:2.5},ciudad:{city:2.5,planet:.5}};
var W_BUS={aprender:{simple:1.5,goto:-.3},goto:{goto:2.5}};
var REASON={planet:'Muestra muy bien la Luna y los planetas',deep:'Tiene apertura para nebulosas y galaxias',photo:'Sirve para empezar en astrofotografía',port:'Es fácil de transportar',simple:'Es sencillo de usar desde la primera noche',goto:'Encuentra los objetos por ti',city:'Se defiende bien con luz de ciudad'};
var PIPS=[['planet','Planetas'],['deep','Cielo profundo'],['photo','Fotografía'],['simple','Facilidad']];
var ans={};QS.forEach(function(q){ans[q.k]=q.d;});
function score(it){
  var w={},k,src=[W_INT[ans.int],W_USO[ans.uso],W_BUS[ans.buscar]];
  src.forEach(function(o){for(k in o)w[k]=(w[k]||0)+o[k];});
  var tot=0,contrib=[];
  for(k in w){var v=w[k]*(it.a[k]||0);tot+=v;contrib.push([k,v]);}
  var B=Number(ans.pre);
  if(it.pmin>B)return {s:-999,c:[]};
  tot+=1;
  if(it.pmax<B*.3)tot-=1.5;
  contrib.sort(function(a,b){return b[1]-a[1];});
  return {s:tot,c:contrib};
}
function priceTxt(it){return 'Aprox. US$'+fmt(it.pmin)+' a '+fmt(it.pmax);}
function renderQs(){
  $('#qs').innerHTML=QS.map(function(q){
    return '<div class="q"><h3>'+q.q+'</h3><div class="seg" data-k="'+q.k+'" role="group" aria-label="'+q.q+'">'+
      q.o.map(function(o){return '<button type="button" data-v="'+o[0]+'" aria-pressed="'+(ans[q.k]===o[0])+'">'+o[1]+'</button>';}).join('')+'</div></div>';
  }).join('');
}
function pipsHTML(it){
  return '<div class="pips">'+PIPS.map(function(p){
    var v=it.a[p[0]],h='';for(var i=1;i<=5;i++)h+='<i class="'+(i<=v?'on':'')+'"></i>';
    return '<div class="pip"><span>'+p[1]+'</span><div role="img" aria-label="'+v+' de 5">'+h+'</div></div>';
  }).join('')+'</div>';
}
function renderPick(){
  var list=CAT.map(function(it){var r=score(it);return {it:it,s:r.s,c:r.c};}).filter(function(x){return x.s>-900;}).sort(function(a,b){return b.s-a.s;});
  var top=list.slice(0,3);
  if(!top.length){$('#pick').innerHTML='<div class="pk"><p>Con ese presupuesto lo mejor es empezar con unos binoculares, o ahorrar un poco para un Dobsoniano de segunda mano.</p></div>';return;}
  $('#pick').innerHTML=top.map(function(x,i){
    var it=x.it,reasons=x.c.filter(function(c){return c[1]>=1.5;}).slice(0,3).map(function(c){return REASON[c[0]];});
    if(!reasons.length)reasons=['Se adapta bien a tu presupuesto'];
    return '<article class="pk '+(i===0?'top1':'alt')+'"><span class="tag">'+(i===0?'La mejor opción para ti':'También considera')+'</span>'+
      '<h3>'+it.n+'</h3><p class="sub">'+it.m+'</p><div class="price">'+priceTxt(it)+'</div>'+
      '<p>'+it.desc+'</p><ul>'+reasons.map(function(r){return '<li>'+r+'</li>';}).join('')+'</ul>'+pipsHTML(it)+
      '<p class="care"><b>Cuidado con esto:</b> '+it.care+'</p></article>';
  }).join('');
}
$('#qs').addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b)return;
  var g=b.parentNode;ans[g.dataset.k]=b.dataset.v;
  setPressed(g,function(x){return x===b;});
  renderPick();
});

/* Luz roja local para observación nocturna; el tema del sitio sigue en el control compartido. */
var telescopePage=document.querySelector('.telescopes-page');
var redModeButton=$('#redMode');
function setRedMode(enabled){
  telescopePage.dataset.observeMode=enabled?'red':'normal';
  redModeButton.setAttribute('aria-pressed',String(enabled));
  redModeButton.textContent=enabled?'Desactivar luz roja':'Activar luz roja';
  try{if(enabled)localStorage.setItem('telescopios-luz-roja','on');else localStorage.removeItem('telescopios-luz-roja');}catch(e){}
}
var redSaved=false;try{redSaved=localStorage.getItem('telescopios-luz-roja')==='on';}catch(e){}
setRedMode(redSaved);
redModeButton.addEventListener('click',function(){setRedMode(redModeButton.getAttribute('aria-pressed')!=='true');});
/* ---------------- Inicio ---------------- */
renderOptics();
renderCalc();
renderAiry();
renderMounts();
renderTracking();
renderQs();
renderPick();

})();
