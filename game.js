/* ===================================================================
   ADMISIÓN GALÁCTICA · AP ACADEMY
   Simulacro en formato de juego de naves. Depende de questions.js.
   ------------------------------------------------------------------
   AJUSTES RÁPIDOS (para el docente):
   - LV[x].fall  = segundos que tarda una cápsula en llegar a la zona
                   de peligro (modo Misión). Contrarreloj usa la mitad.
   - MODES.*.lives = escudos por sector.
   =================================================================== */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rand=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const LET='ABCDE';
const SHIPZONE=78,GAP=10;

const SUBJ=[
  {name:'Biología',  icon:'bio',c:'#36e6a0',d:'#07503a',tag:'Nebulosa Celular'},
  {name:'Matemática',icon:'math',c:'#6aa8ff',d:'#0a2a78',tag:'Cinturón de Ecuaciones'},
  {name:'Física',    icon:'phys',c:'#27d9f0',d:'#06485c',tag:'Campo de Gravedad'},
  {name:'Química',   icon:'chem',c:'#b58cff',d:'#3a1370',tag:'Planeta Reactivo'},
  {name:'Lenguaje',  icon:'book',c:'#ff7fd1',d:'#6a1050',tag:'Galaxia de las Letras'}
];
const LV={
  basico:    {name:'Básico',    rank:'Cadete',     get Q(){return QUESTIONS_BASICO},fall:80},
  intermedio:{name:'Intermedio',rank:'Piloto',     get Q(){return QUESTIONS_INTER}, fall:95},
  avanzado:  {name:'Avanzado',  rank:'Comandante', get Q(){return QUESTIONS_AVANZ}, fall:110}
};
const MODES={
  practica:{name:'Práctica',    icon:'leaf',desc:'Sin tiempo ni vidas. Ideal para aprender.',lives:Infinity,mul:0},
  mision:  {name:'Misión',      icon:'rocket',desc:'3 escudos y tiempo por pregunta.',lives:3,mul:1},
  reto:    {name:'Contrarreloj',icon:'bolt',desc:'Todo a doble velocidad.',lives:3,mul:.5}
};

/* ---------- iconos vectoriales (sin emojis) ---------- */
const ICONS={
  rocket:['<path d="M12 2c3 2 5 6 5 10l-2 4H9l-2-4c0-4 2-8 5-10z"/><circle cx="12" cy="10" r="1.6"/><path d="M7 14l-3 3v3l4-2M17 14l3 3v3l-4-2M10 19l2 3 2-3"/>'],
  heart:['<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>',1],
  phone:['<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>'],
  pause:['<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',1],
  play:['<path d="M7 4l13 8-13 8z"/>',1],
  left:['<path d="M17 4L6 12l11 8z"/>',1],
  right:['<path d="M7 4l11 8-11 8z"/>',1],
  volume:['<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>'],
  mute:['<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>'],
  trophy:['<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v4M8 21h8M9 18h6"/>'],
  share:['<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>'],
  bio:['<path d="M7 3c0 6 10 6 10 12s-10 6-10 6M17 3c0 6-10 6-10 12s10 6 10 6M9 7h6M9 17h6M8.5 12h7"/>'],
  math:['<path d="M4 20V4l16 16z"/><path d="M4 9h3M4 14h5"/>'],
  phys:['<circle cx="12" cy="12" r="1.8"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>'],
  chem:['<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2.2h12.4a1.5 1.5 0 0 0 1.3-2.2L14 9V3M7.5 15h9"/>'],
  book:['<path d="M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2zM12 6v14"/>'],
  target:['<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>'],
  check:['<path d="M4 12.5l5 5L20 6.5"/>'],
  cross:['<path d="M6 6l12 12M18 6L6 18"/>'],
  flame:['<path d="M12 22c4 0 7-2.8 7-7 0-3-2-5-3-7-1 2-2 3-3 3 0-3-1-6-4-9 0 4-4 6-4 12 0 4.2 3 8 7 8z"/>'],
  star:['<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.2 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>'],
  medal:['<circle cx="12" cy="15" r="6"/><path d="M8.5 10L6 3h5l1 4M15.5 10L18 3h-5"/>'],
  satellite:['<rect x="9" y="9" width="6" height="6" rx="1" transform="rotate(45 12 12)"/><path d="M4 8l4 4M16 12l4 4M3 3l3 3M18 18l3 3M5 14a7 7 0 0 0 5 5M14 5a7 7 0 0 1 5 5"/>'],
  crown:['<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>'],
  bolt:['<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'],
  leaf:['<path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15zM5 19l8-8"/>'],
  flag:['<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>'],
  burst:['<path d="M12 2l2 6 6-2-3 6 5 3-6 1 1 6-5-4-5 4 1-6-6-1 5-3-3-6 6 2z"/>'],
  clock:['<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'],
  pencil:['<path d="M4 20l1-5L16 4l4 4L9 19zM14 6l4 4"/>']
};
function ic(n,cls){
  const d=ICONS[n];if(!d)return '';
  return `<svg class="i${cls?' '+cls:''}" viewBox="0 0 24 24" fill="${d[1]?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d[0]}</svg>`;
}
function hearts(n,max){
  let s='';for(let i=0;i<max;i++)s+=ic('heart',i<n?'hp':'hp off');return s;
}
function hydrate(){document.querySelectorAll('[data-ic]').forEach(e=>{e.innerHTML=ic(e.dataset.ic)})}
const subjOf=qi=>Math.floor(qi/10);

/* ---------- almacenamiento ---------- */
const store={
  get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
};

/* ---------- audio sintetizado ---------- */
let AC=null,muted=!!store.get('ap_galaxy_mute');
function ac(){
  if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){AC=null}}
  if(AC&&AC.state==='suspended')AC.resume();
  return AC;
}
function tone(f1,f2,dur,type='sine',vol=.07,delay=0){
  if(muted)return;const a=ac();if(!a)return;
  const t=a.currentTime+delay,o=a.createOscillator(),g=a.createGain();
  o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur+.05);
}
function noise(dur,vol=.15,delay=0){
  if(muted)return;const a=ac();if(!a)return;
  const n=Math.floor(a.sampleRate*dur),b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
  const s=a.createBufferSource(),g=a.createGain(),f=a.createBiquadFilter();
  f.type='lowpass';f.frequency.value=900;s.buffer=b;g.gain.value=vol;
  s.connect(f);f.connect(g);g.connect(a.destination);s.start(a.currentTime+delay);
}
const sfx={
  laser(){tone(1200,200,.17,'sawtooth',.045)},
  boom(){noise(.5,.2);tone(170,35,.45,'triangle',.12)},
  good(){[660,880,1320].forEach((f,i)=>tone(f,f*1.01,.16,'square',.05,i*.09))},
  bad(){tone(240,60,.55,'sawtooth',.09);noise(.35,.12)},
  click(){tone(520,780,.07,'sine',.05)},
  fan(){[523,659,784,1046,1318].forEach((f,i)=>tone(f,f,.22,'triangle',.07,i*.12))},
  lose(){[440,370,311,220].forEach((f,i)=>tone(f,f*.9,.3,'sawtooth',.07,i*.18))}
};

/* ---------- canvas: estrellas, nave, balas, partículas ---------- */
const cv=$('fx'),cx=cv.getContext('2d');
let W=0,H=0,DPR=1,stars=[];
function resizeCanvas(){
  DPR=Math.min(2,window.devicePixelRatio||1);W=window.innerWidth;H=window.innerHeight;
  cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cx.setTransform(DPR,0,0,DPR,0,0);
  const n=Math.round(W*H/5000);
  stars=Array.from({length:n},()=>{const r=Math.random();return{x:Math.random()*W,y:Math.random()*H,z:r<.6?1:r<.9?2:3,tw:Math.random()*6}});
}
const ship={x:0,y:0,targetX:0,cool:0,hurt:0};
const bullets=[],parts=[],rings=[];
let themeC='#6aa8ff',fw=0,fwT=0;

function burst(x,y,color,n=40,sp=260){
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2,v=rand(.2,1)*sp;
    parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.5,1.1),max:1.1,s:rand(1.5,4),c:Math.random()<.25?'#ffffff':color});
  }
}
function ring(x,y,color){rings.push({x,y,r:10,life:.6,c:color})}

function drawShip(t){
  const x=ship.x,y=ship.y;
  cx.save();cx.translate(x,y);
  cx.rotate(clamp((ship.targetX-ship.x)/260,-.3,.3)*.5);
  const fl=14+Math.sin(t*45)*5+Math.random()*4;
  const fg=cx.createLinearGradient(0,18,0,18+fl+14);
  fg.addColorStop(0,'#fff6b0');fg.addColorStop(.4,'#ff9a3d');fg.addColorStop(1,'rgba(255,60,20,0)');
  cx.fillStyle=fg;cx.beginPath();cx.moveTo(-7,18);cx.lineTo(0,18+fl+14);cx.lineTo(7,18);cx.fill();
  cx.shadowColor=ship.hurt>0&&Math.floor(t*20)%2?'#ff3355':themeC;cx.shadowBlur=18;
  const g=cx.createLinearGradient(-26,0,26,0);
  g.addColorStop(0,'#7da7ff');g.addColorStop(.5,'#ffffff');g.addColorStop(1,'#7da7ff');
  cx.fillStyle=ship.hurt>0&&Math.floor(t*20)%2?'#ff8da1':g;
  cx.beginPath();
  cx.moveTo(0,-32);cx.lineTo(8,-10);cx.lineTo(27,14);cx.lineTo(25,21);cx.lineTo(10,15);cx.lineTo(6,22);
  cx.lineTo(-6,22);cx.lineTo(-10,15);cx.lineTo(-25,21);cx.lineTo(-27,14);cx.lineTo(-8,-10);cx.closePath();cx.fill();
  cx.shadowBlur=0;
  cx.strokeStyle=themeC;cx.lineWidth=2;cx.beginPath();cx.moveTo(-9,4);cx.lineTo(-24,16);cx.moveTo(9,4);cx.lineTo(24,16);cx.stroke();
  const cg=cx.createLinearGradient(0,-20,0,4);cg.addColorStop(0,'#aef4ff');cg.addColorStop(1,'#1a8fd8');
  cx.fillStyle=cg;cx.beginPath();cx.ellipse(0,-7,4.8,10,0,0,Math.PI*2);cx.fill();
  cx.restore();
}

function draw(t){
  cx.clearRect(0,0,W,H);
  for(const s of stars){
    cx.globalAlpha=(.3+.4*Math.sin(t*2+s.tw))*(s.z/3+.4);
    cx.fillStyle='#cfe4ff';cx.fillRect(s.x,s.y,s.z*.9,s.z*.9);
  }
  cx.globalAlpha=1;
  cx.globalCompositeOperation='lighter';
  for(const r of rings){
    cx.globalAlpha=Math.max(0,r.life/.6);cx.strokeStyle=r.c;cx.lineWidth=3;
    cx.beginPath();cx.arc(r.x,r.y,r.r,0,Math.PI*2);cx.stroke();
  }
  for(const b of bullets){
    cx.globalAlpha=1;cx.shadowColor=themeC;cx.shadowBlur=14;
    cx.strokeStyle=themeC;cx.lineWidth=4;cx.beginPath();cx.moveTo(b.x,b.y);cx.lineTo(b.x,b.y+18);cx.stroke();
    cx.shadowBlur=0;cx.strokeStyle='#fff';cx.lineWidth=2;cx.beginPath();cx.moveTo(b.x,b.y);cx.lineTo(b.x,b.y+14);cx.stroke();
  }
  for(const p of parts){
    cx.globalAlpha=Math.max(0,p.life/p.max);cx.fillStyle=p.c;
    cx.beginPath();cx.arc(p.x,p.y,p.s,0,Math.PI*2);cx.fill();
  }
  cx.globalCompositeOperation='source-over';cx.globalAlpha=1;
  if(view==='game')drawShip(t);
}

/* ---------- estado ---------- */
let view='menu',G=null,paused=false,lock=false,fbAt=0,splashCb=null;
const A={left:0,top:0,w:0,h:0};
const sel=Object.assign({level:'basico',mode:'mision',sectors:[0,1,2,3,4],name:''},store.get('ap_galaxy_pref')||{});
const keys={};

function setTheme(si){
  const s=SUBJ[si];themeC=s.c;
  document.documentElement.style.setProperty('--th',s.c);
  document.documentElement.style.setProperty('--thd',s.d);
}
function showView(v){
  view=v;
  ['menu','game','end'].forEach(n=>$(n).hidden=(n!==v));
  if(v==='game')updateArena();
  if(v!=='game'){bullets.length=0}
  if(v==='menu')setTheme(1);
}
function updateArena(){
  const r=$('arena').getBoundingClientRect();
  A.left=r.left;A.top=r.top;A.w=r.width;A.h=r.height;
  ship.y=A.top+A.h-40;
  if(!ship.x){ship.x=ship.targetX=A.left+A.w/2}
  ship.x=clamp(ship.x,A.left+24,A.left+A.w-24);ship.targetX=clamp(ship.targetX,A.left+24,A.left+A.w-24);
  if(G&&G.pods)sizePods();
}
const clampX=x=>clamp(x,A.left+24,A.left+A.w-24);

/* ---------- menú ---------- */
function openCount(L){return L.Q.filter(q=>q.open).length}
function buildMenu(){
  $('levels').innerHTML=Object.entries(LV).map(([k,L])=>{
    const o=openCount(L);
    return `<button type="button" class="card${sel.level===k?' on':''}" data-lv="${k}"><span class="ic">${ic(k==='basico'?'satellite':k==='intermedio'?'rocket':'crown')}</span><b>${L.name}</b><small>${L.rank} · 50 preguntas${o?`<br>(${o} de desarrollo)`:''}</small></button>`}).join('');
  $('modes').innerHTML=Object.entries(MODES).map(([k,M])=>
    `<button type="button" class="card${sel.mode===k?' on':''}" data-md="${k}"><span class="ic">${ic(M.icon)}</span><b>${M.name}</b><small>${M.desc}</small></button>`).join('');
  const all=sel.sectors.length===5;
  $('sectors').innerHTML=`<button type="button" class="chip${all?' on':''}" data-s="all">${ic('star')} Todos</button>`+
    SUBJ.map((s,i)=>`<button type="button" class="chip${!all&&sel.sectors.includes(i)?' on':''}" style="--c:${s.c}" data-s="${i}">${ic(s.icon)} ${s.name}</button>`).join('');
  $('inName').value=sel.name||'';
  showBest();
}
function bestKey(){return 'ap_galaxy_best_'+sel.level+'_'+sel.mode}
function showBest(){
  const b=store.get(bestKey());
  $('best').innerHTML=b?`${ic('medal')} Tu récord (${LV[sel.level].name} · ${MODES[sel.mode].name}): <b>${b.score.toLocaleString('es')} pts</b> · nota ${b.nota}/100`:'Aún no tienes récord en esta configuración. ¡Crea el primero!';
}
function savePref(){store.set('ap_galaxy_pref',{level:sel.level,mode:sel.mode,sectors:sel.sectors,name:sel.name})}
$('menu').addEventListener('click',e=>{
  const l=e.target.closest('[data-lv]'),m=e.target.closest('[data-md]'),s=e.target.closest('[data-s]');
  if(l){sel.level=l.dataset.lv;sfx.click()}
  else if(m){sel.mode=m.dataset.md;sfx.click()}
  else if(s){
    sfx.click();
    if(s.dataset.s==='all')sel.sectors=[0,1,2,3,4];
    else{
      const i=+s.dataset.s;
      if(sel.sectors.length===5)sel.sectors=[i];
      else if(sel.sectors.includes(i))sel.sectors=sel.sectors.filter(x=>x!==i);
      else sel.sectors=[...sel.sectors,i].sort();
      if(!sel.sectors.length)sel.sectors=[0,1,2,3,4];
    }
  }else return;
  savePref();buildMenu();
});
$('inName').addEventListener('input',e=>{sel.name=e.target.value.trim();savePref()});
$('btnStart').addEventListener('click',()=>{ac();startGame()});

/* ---------- inicio de partida ---------- */
const Q=()=>LV[G.level].Q;
const fallTime=()=>LV[G.level].fall*MODES[G.mode].mul;

function startGame(){
  const order=[];
  [...sel.sectors].sort().forEach(s=>{for(let k=0;k<10;k++)order.push(s*10+k)});
  const M=MODES[sel.mode];
  G={level:sel.level,mode:sel.mode,name:sel.name,order,pos:0,score:0,lives:M.lives,maxLives:M.lives,streak:0,best:0,res:[],cur:null,pods:[]};
  paused=false;lock=false;bullets.length=0;parts.length=0;
  showView('game');$('pods').innerHTML='';
  updateArena();ship.x=ship.targetX=A.left+A.w/2;
  updateHud();
  introSector(subjOf(order[0]),loadQuestion);
}

/* ---------- overlays ---------- */
function openSplash({icon,k,t,s,b,btn,cb}){
  lock=true;splashCb=cb;
  $('spIc').innerHTML=ic(icon);$('spK').textContent=k;$('spT').textContent=t;$('spS').textContent=s||'';
  $('spB').innerHTML=b||'';$('spBtn').innerHTML=btn;$('splash').hidden=false;
}
function closeSplash(){
  if($('splash').hidden)return;
  $('splash').hidden=true;lock=false;const cb=splashCb;splashCb=null;if(cb)cb();
}
$('spBtn').addEventListener('click',()=>{ac();sfx.click();closeSplash()});

function introSector(si,cb){
  setTheme(si);const s=SUBJ[si],n=G.order.filter(q=>subjOf(q)===si).length;
  $('pods').innerHTML='';G.pods=[];
  updateHud();
  openSplash({icon:s.icon,k:'SECTOR '+(si+1),t:s.name.toUpperCase(),s:s.tag,
    b:`${n} preguntas por delante${isFinite(G.maxLives)?` · Escudos: ${hearts(G.maxLives,G.maxLives)}`:' · Modo práctica'}`,btn:`DESPEGAR ${ic('play')}`,cb});
  sfx.fan();
}

/* ---------- HUD ---------- */
function updateHud(){
  const c=G.cur,si=c?c.subj:subjOf(G.order[Math.min(G.pos,G.order.length-1)]);
  $('hSec').innerHTML=ic(SUBJ[si].icon)+' '+SUBJ[si].name;
  $('hQn').textContent=`Pregunta ${Math.min(G.pos+1,G.order.length)} de ${G.order.length}`;
  $('hScore').textContent=G.score.toLocaleString('es');
  $('hCombo').innerHTML=G.streak>=2?`${ic('flame')} racha ${G.streak} · ×${Math.min(5,1+Math.floor((G.streak-1)/2))}`:'';
  $('hLives').innerHTML=isFinite(G.lives)?hearts(Math.max(0,G.lives),G.maxLives):'∞';
  $('mProg').style.width=(G.pos/G.order.length*100)+'%';
}

/* ---------- preguntas y cápsulas ---------- */
function loadQuestion(){
  const qi=G.order[G.pos],q=Q()[qi],si=subjOf(qi);
  setTheme(si);
  const c=G.cur={qi,q,subj:si,t:0,clock:0,state:'play',phase:0,delay:0,pendingFb:false,noFall:!!q.open,status:null,pts:0,mult:1};
  $('qMeta').innerHTML=`<span class="s">${SUBJ[si].name}</span><span>${q.t||''}</span>${q.open?`<span>${ic('pencil')} Desarrollo</span>`:''}`;
  $('qText').innerHTML=q.q;
  $('qFig').innerHTML=q.f||'';
  $('qModel').hidden=true;$('qModel').innerHTML='';
  $('qpanel').scrollTop=0;
  $('tBar').style.width='100%';$('tBar').className='';
  $('arena').classList.remove('warn');
  if(q.open)spawnPods([{badge:ic('target'),html:'Resuelve en tu cuaderno y <b>dispara aquí</b> para ver la respuesta modelo',cls:'wide',idx:0}]);
  else spawnPods(q.o.map((t,i)=>({badge:LET[i],html:t,idx:i})));
  updateHud();
}
function spawnPods(defs){
  const box=$('pods');box.innerHTML='';G.pods=[];
  defs.forEach((d,i)=>{
    const el=document.createElement('div');el.className='pod'+(d.cls?' '+d.cls:'');
    el.innerHTML=`<span class="pl">${d.badge}</span><span class="pt">${d.html}</span>`;
    box.appendChild(el);
    G.pods.push({el,lane:i,n:defs.length,idx:d.idx,px:0,py:0,w:0,h:0,baseX:0,dead:false});
  });
  updateArena();
}
function sizePods(){
  const n=G.pods.length;if(!n||!A.w)return;
  const lw=Math.min(A.w/n,n===1?460:300),off=(A.w-lw*n)/2;
  G.pods.forEach(p=>{
    p.w=lw-GAP;p.baseX=off+p.lane*lw+GAP/2;
    p.el.style.width=p.w+'px';p.el.classList.toggle('narrow',p.w<150&&!p.el.classList.contains('wide'));
    p.h=p.el.offsetHeight;
  });
}

/* ---------- disparo ---------- */
const playing=()=>view==='game'&&!paused&&!lock&&G&&G.cur&&G.cur.state==='play'&&$('fb').hidden;
function fire(){
  if(!playing()||ship.cool>0)return;
  ship.cool=.28;bullets.push({x:ship.x,y:ship.y-30,py:ship.y-30});
  sfx.laser();burst(ship.x,ship.y-32,themeC,6,120);
}

/* ---------- actualización por cuadro ---------- */
function update(dt){
  for(const s of stars){s.y+=(s.z===1?14:s.z===2?32:60)*dt;if(s.y>H){s.y=-4;s.x=Math.random()*W}}
  if(ship.cool>0)ship.cool-=dt;
  if(ship.hurt>0)ship.hurt-=dt;
  if(view==='game'&&!paused&&!lock&&G&&G.cur){
    if(playing()){
      const dir=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0);
      if(dir)ship.targetX=clampX(ship.targetX+dir*720*dt);
    }
    updatePods(dt);updateBullets(dt);
  }
  if(view==='game'||view==='end')ship.x+=(ship.targetX-ship.x)*Math.min(1,dt*16);
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.life-=dt;if(p.life<=0){parts.splice(i,1);continue}
    p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.985;p.vy=p.vy*.985+80*dt}
  for(let i=rings.length-1;i>=0;i--){const r=rings[i];r.life-=dt;r.r+=300*dt;if(r.life<=0)rings.splice(i,1)}
  if(fw>0){
    fw-=dt;fwT-=dt;
    if(fwT<=0){fwT=.3;burst(rand(W*.15,W*.85),rand(H*.1,H*.45),pick(['#6aa8ff','#ff7fd1','#4dffb0','#ffc24d','#b58cff']),55,300);sfx.boom()}
  }
}
function updatePods(dt){
  const c=G.cur;c.clock+=dt;
  if(c.state==='play')c.t+=dt;
  const fall=fallTime(),noFall=!fall||c.noFall;
  const f=noFall?0:Math.min(1,c.t/fall);
  const maxH=G.pods.reduce((m,p)=>Math.max(m,p.h),0);
  const maxY=Math.max(0,A.h-SHIPZONE-maxH-6);
  G.pods.forEach((p,i)=>{
    p.px=p.baseX+Math.sin(c.clock*1.1+i*1.7)*5;
    p.py=4+f*maxY+Math.sin(c.clock*1.7+i)*3;
    p.el.style.transform=`translate3d(${p.px.toFixed(1)}px,${p.py.toFixed(1)}px,0)`;
  });
  const tb=$('tBar');
  if(noFall){tb.style.width='100%';tb.className=''}
  else if(c.state==='play'){
    tb.style.width=((1-f)*100)+'%';tb.className=f>.85?'crit':f>.65?'low':'';
    $('arena').classList.toggle('warn',f>.8);
  }
  if(c.state==='play'&&!noFall&&f>=1)timeout();
  if(c.pendingFb){c.delay-=dt;if(c.delay<=0){c.pendingFb=false;showFeedback()}}
}
function updateBullets(dt){
  const c=G.cur;
  for(let i=bullets.length-1;i>=0;i--){
    const b=bullets[i];b.py=b.y;b.y-=1150*dt;
    let hit=null;
    if(c&&c.state==='play'){
      const bx=b.x-A.left,by=b.y-A.top,pby=b.py-A.top;
      for(const p of G.pods){
        if(p.dead)continue;
        if(bx>=p.px&&bx<=p.px+p.w&&by<=p.py+p.h&&pby>=p.py){hit=p;break}
      }
    }
    if(hit){bullets.splice(i,1);burst(b.x,b.y,'#ffffff',14,200);answer(hit);continue}
    if(b.y<A.top-20)bullets.splice(i,1);
  }
}

/* ---------- respuestas ---------- */
const center=p=>[A.left+p.px+p.w/2,A.top+p.py+p.h/2];
function destroyPod(p){
  const [x,y]=center(p);p.dead=true;p.el.classList.add('boom');
  burst(x,y,themeC,50,280);ring(x,y,themeC);sfx.boom();
}
function answer(p){
  const c=G.cur;if(c.state!=='play')return;
  if(c.q.open)return answerOpen(p);
  c.state='done';bullets.length=0;
  resolveQ(p.idx===c.q.a?'ok':'bad',p);
}
function answerOpen(p){
  const c=G.cur;
  if(c.phase===0){
    destroyPod(p);bullets.length=0;c.phase=1;
    const m=$('qModel');m.innerHTML=`<b>Respuesta modelo:</b> ${c.q.m}`;m.hidden=false;
    spawnPods([{badge:ic('check'),html:'La hice bien',idx:1},{badge:ic('cross'),html:'No me salió / incompleta',idx:0}]);
    $('qpanel').scrollTop=$('qpanel').scrollHeight;
    return;
  }
  c.state='done';bullets.length=0;
  resolveQ(p.idx===1?'ok':'bad',p);
}
function timeout(){
  const c=G.cur;if(c.state!=='play')return;
  c.state='done';bullets.length=0;resolveQ('timeout',null);
}
function resolveQ(status,p){
  const c=G.cur,q=c.q;c.status=status;
  let pts=0,mult=1,px,py;
  if(p){[px,py]=center(p)}else{px=A.left+A.w/2;py=A.top+A.h*.6}
  if(status==='ok'){
    G.streak++;G.best=Math.max(G.best,G.streak);
    mult=Math.min(5,1+Math.floor((G.streak-1)/2));
    const fall=fallTime(),bonus=(!q.open&&fall>0)?Math.round(60*(1-clamp(c.t/fall,0,1))):0;
    pts=((q.open?150:100)+bonus)*mult;G.score+=pts;
    sfx.good();burst(px,py,'#5dffb8',80,330);ring(px,py,'#5dffb8');
    $('hScore').classList.remove('pop');void $('hScore').offsetWidth;$('hScore').classList.add('pop');
  }else{
    G.streak=0;
    if(!q.open&&isFinite(G.lives))G.lives--;
    ship.hurt=.7;shake();sfx.bad();burst(px,py,'#ff5470',60,290);
  }
  G.res.push({qi:c.qi,subj:c.subj,status,chosen:p&&!q.open?p.idx:null,pts});
  c.pts=pts;c.mult=mult;
  if(!q.open){
    G.pods.forEach(pp=>{
      if(pp.idx===q.a)pp.el.classList.add('good');
      else if(pp===p)pp.el.classList.add('bad');
      else pp.el.classList.add('dim');
    });
    if(p&&!p.dead)destroyPod(p);
  }else if(p&&!p.dead){
    G.pods.forEach(pp=>{if(pp!==p)pp.el.classList.add('dim')});destroyPod(p);
  }
  pop(px,py,status==='ok'?`+${pts}${mult>1?' ×'+mult:''}`:(q.open?'A repasar':status==='timeout'?'¡Tiempo!':'¡Fallaste!'),status!=='ok');
  c.delay=status==='ok'?.9:1.3;c.pendingFb=true;
  updateHud();
}
function pop(x,y,txt,bad){
  const d=document.createElement('div');d.className='pop-t'+(bad?' bad':'');d.textContent=txt;
  d.style.left=(x-A.left)+'px';d.style.top=(y-A.top)+'px';$('floaty').appendChild(d);
  setTimeout(()=>d.remove(),1250);
}
function shake(){const a=$('app');a.classList.remove('shake');void a.offsetWidth;a.classList.add('shake');setTimeout(()=>a.classList.remove('shake'),420)}

/* ---------- retroalimentación ---------- */
function lastLife(){return isFinite(G.lives)&&G.lives<=0}
function showFeedback(){
  const c=G.cur,q=c.q,st=c.status,fb=$('fb');
  let title,cls=st==='ok'?'ok':'bad';
  if(q.open)title=st==='ok'?'¡Bien resuelto!':'A repasar este tema';
  else title=st==='ok'?pick(['¡Impacto perfecto!','¡Blanco directo!','¡Excelente puntería!','¡Respuesta correcta!']):st==='bad'?'Escudo dañado':'¡Se acabó el tiempo!';
  const correct=q.open?q.m:`<b>${LET[q.a]})</b> ${q.o[q.a]}`;
  const last=G.res[G.res.length-1];
  const mine=(st==='bad'&&!q.open&&last.chosen!=null)?`<div class="fb-ans mine"><small>Tu disparo</small><b>${LET[last.chosen]})</b> ${q.o[last.chosen]}</div>`:'';
  const info=st==='ok'?`+${c.pts} puntos${c.mult>1?` · combo ×${c.mult}`:''}`:
    (q.open?'':isFinite(G.lives)?(G.lives>0?`Escudos restantes: ${hearts(G.lives,G.maxLives)}`:'Sin escudos: la nave fue destruida'):'');
  const btn=lastLife()?`VER RESULTADOS ${ic('play')}`:(G.pos+1>=G.order.length?`FINALIZAR SECTOR ${ic('play')}`:`SIGUIENTE ${ic('play')}`);
  fb.className='feedback '+cls;
  fb.innerHTML=`<div class="fb-in"><div class="fb-t">${title}</div>${info?`<div class="fb-pts">${info}</div>`:''}
    ${mine}<div class="fb-ans"><small>${q.open?'Respuesta modelo':'Respuesta correcta'}</small>${correct}</div>
    <div class="fb-exp"><b>Explicación:</b> ${q.e}</div>
    <button class="btn big" id="fbNext" type="button">${btn}</button></div>`;
  fb.hidden=false;fb.scrollTop=0;fbAt=performance.now();
  $('fbNext').addEventListener('click',nextQ);
}
function nextQ(){
  if(performance.now()-fbAt<350)return;
  $('fb').hidden=true;sfx.click();
  if(lastLife())return endGame('defeat');
  const si=G.cur.subj,last=G.pos+1>=G.order.length,nextSi=last?-1:subjOf(G.order[G.pos+1]);
  G.pos++;
  if(last||nextSi!==si)sectorDone(si,last,nextSi);
  else loadQuestion();
}
function sectorDone(si,last,nextSi){
  const r=G.res.filter(x=>x.subj===si),ok=r.filter(x=>x.status==='ok').length;
  const bonus=ok*25;G.score+=bonus;
  if(isFinite(G.maxLives))G.lives=G.maxLives;
  $('pods').innerHTML='';G.pods=[];G.cur=null;bullets.length=0;updateHud();
  openSplash({icon:'flag',k:'SECTOR COMPLETADO',t:SUBJ[si].name.toUpperCase(),s:`Aciertos: ${ok} de ${r.length}`,
    b:`Bono de sector: <b>+${bonus}</b> puntos${isFinite(G.maxLives)?`<br>Escudos recargados ${hearts(G.maxLives,G.maxLives)}`:''}`,
    btn:last?`VER RESULTADOS ${ic('play')}`:`SIGUIENTE SECTOR ${ic('play')}`,
    cb:()=>last?endGame('win'):introSector(nextSi,loadQuestion)});
  sfx.fan();
}

/* ---------- final y resultados ---------- */
function rankOf(n){
  if(n>=90)return{ic:'trophy',t:'Comandante Galáctico'};
  if(n>=75)return{ic:'medal',t:'Capitán Estelar'};
  if(n>=51)return{ic:'rocket',t:'Piloto Estelar'};
  return{ic:'satellite',t:'Cadete en entrenamiento'};
}
let lastSummary='';
function endGame(kind){
  const total=G.order.length,ok=G.res.filter(x=>x.status==='ok').length;
  const bad=G.res.length-ok,nota=Math.round(ok/total*100),rk=rankOf(nota);
  const bk='ap_galaxy_best_'+G.level+'_'+G.mode,prev=store.get(bk);
  const record=!prev||G.score>prev.score;
  if(record)store.set(bk,{score:G.score,nota});
  lock=false;showView('end');$('fb').hidden=true;$('splash').hidden=true;
  setTheme(kind==='win'?1:3);
  $('eIcon').innerHTML=ic(kind==='win'?rk.ic:'burst');
  $('eTitle').textContent=kind==='win'?'¡MISIÓN CUMPLIDA!':'NAVE DESTRUIDA';
  $('eSub').innerHTML=(G.name?`Piloto <b>${G.name.replace(/[<>&]/g,'')}</b> · `:'')+`Rango: <b>${kind==='win'?rk.t:'Cadete en entrenamiento'}</b>`+(record?` · ${ic('medal')} <b style="color:var(--warn)">¡Nuevo récord!</b>`:'')+
    (kind==='defeat'?'<br>Repasa las explicaciones de abajo y vuelve a intentarlo. ¡Tú puedes!':'');
  $('eKpis').innerHTML=`<div class="kpi gold"><b>${G.score.toLocaleString('es')}</b><small>Puntos</small></div>
    <div class="kpi ok"><b>${ok}</b><small>Aciertos</small></div>
    <div class="kpi bad"><b>${bad}</b><small>Fallos</small></div>
    <div class="kpi"><b>${nota}</b><small>Nota sobre 100</small></div>
    <div class="kpi"><b>${G.best}</b><small>Mejor racha</small></div>`;
  const secs=[...new Set(G.order.map(subjOf))];
  $('eBars').innerHTML=secs.map(si=>{
    const n=G.order.filter(q=>subjOf(q)===si).length,o=G.res.filter(x=>x.subj===si&&x.status==='ok').length;
    return `<div class="sbar" style="--c:${SUBJ[si].c}"><div class="l"><span>${ic(SUBJ[si].icon)} ${SUBJ[si].name}</span><span>${o}/${n}</span></div><div class="t"><i data-w="${o/n*100}"></i></div></div>`}).join('');
  setTimeout(()=>document.querySelectorAll('#eBars i').forEach(i=>i.style.width=i.dataset.w+'%'),80);
  const L=LV[G.level].Q;
  const fails=G.res.filter(x=>x.status!=='ok');
  $('eReview').innerHTML=fails.length?fails.map(x=>{
    const q=L[x.qi];
    const mine=(x.chosen!=null&&!q.open)?`<div class="ans mine"><b>Tu disparo:</b> ${LET[x.chosen]}) ${q.o[x.chosen]}</div>`:(x.status==='timeout'?`<div class="ans mine"><b>Se acabó el tiempo</b></div>`:'');
    return `<article class="rv"><div class="top">Pregunta ${x.qi+1} · ${SUBJ[x.subj].name} · ${q.t||''}</div>
      <div class="q">${q.q}</div>${q.f||''}${mine}
      <div class="ans"><b>${q.open?'Respuesta modelo':'Correcta'}:</b> ${q.open?q.m:LET[q.a]+') '+q.o[q.a]}</div>
      <div class="ex"><b>Explicación:</b> ${q.e}</div></article>`}).join(''):'<div class="empty">¡Sin errores! Eres un as del espacio.</div>';
  $('end').scrollTop=0;
  lastSummary=`AP ACADEMY · Admisión Galáctica (${LV[G.level].name} · ${MODES[G.mode].name})\n${G.name?'Piloto: '+G.name+'\n':''}Aciertos: ${ok}/${total} · Nota ${nota}/100 · ${G.score} puntos\nRango: ${kind==='win'?rk.t:'Cadete en entrenamiento'}`;
  if(kind==='win'&&nota>=51){fw=3.2;fwT=0}else if(kind==='defeat'){sfx.lose();burst(W/2,H*.3,'#ff5470',90,360)}
  if(kind==='win')sfx.fan();
}
$('eAgain').addEventListener('click',()=>{ac();Object.assign(sel,{level:G.level,mode:G.mode});startGame()});
$('eMenu').addEventListener('click',()=>{G=null;fw=0;showView('menu');buildMenu()});
$('eShare').addEventListener('click',async()=>{
  try{
    if(navigator.share){await navigator.share({text:lastSummary})}
    else{await navigator.clipboard.writeText(lastSummary);$('eShare').innerHTML=ic('check')+' Copiado';setTimeout(()=>$('eShare').innerHTML=ic('share')+' Compartir resultado',1800)}
  }catch(e){}
});

/* ---------- pausa, sonido, zoom ---------- */
function setPaused(v){
  if(view!=='game'||!G)return;
  paused=v;$('pauseOv').hidden=!v;$('btnPause').innerHTML=ic(v?'play':'pause');
}
$('btnPause').addEventListener('click',()=>setPaused(!paused));
$('pResume').addEventListener('click',()=>setPaused(false));
$('pQuit').addEventListener('click',()=>{setPaused(false);$('fb').hidden=true;$('splash').hidden=true;lock=false;G=null;showView('menu');buildMenu()});
function setMute(v){muted=v;store.set('ap_galaxy_mute',v);$('btnMute').innerHTML=ic(v?'mute':'volume')}
$('btnMute').addEventListener('click',()=>{setMute(!muted);ac()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing())setPaused(true)});
document.addEventListener('click',e=>{
  const f=e.target.closest('svg.fig');
  if(f&&view!=='menu'){$('zoom').innerHTML=f.outerHTML;$('zoom').hidden=false;return}
  if(e.target.closest('#zoom')){$('zoom').hidden=true;return}
  const b=e.target.closest('button');if(b)b.blur();
});

/* ---------- controles ---------- */
const arena=$('arena');let down=null;
arena.addEventListener('pointerdown',e=>{
  if(!playing())return;
  down={x:e.clientX,y:e.clientY,t:performance.now()};
  ship.targetX=clampX(e.clientX);
  try{arena.setPointerCapture(e.pointerId)}catch(_){}
});
arena.addEventListener('pointermove',e=>{
  if(down)ship.targetX=clampX(e.clientX);
  else if(e.pointerType==='mouse'&&playing())ship.targetX=clampX(e.clientX);
});
arena.addEventListener('pointerup',e=>{
  if(!down)return;
  const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y),dt=performance.now()-down.t;
  if(moved<12&&dt<400){ship.x=ship.targetX=clampX(e.clientX);fire()}
  down=null;
});
arena.addEventListener('pointercancel',()=>{down=null});
function holdBtn(id,key){
  const b=$(id);
  const on=e=>{e.preventDefault();keys[key]=true};
  const off=()=>{keys[key]=false};
  b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointerleave',off);b.addEventListener('pointercancel',off);
}
holdBtn('bL','ArrowLeft');holdBtn('bR','ArrowRight');
$('bF').addEventListener('pointerdown',e=>{e.preventDefault();ac();fire()});

window.addEventListener('keydown',e=>{
  if(e.target&&e.target.tagName==='INPUT')return;
  keys[e.code]=true;
  if(e.code==='KeyM'){setMute(!muted);return}
  if(view!=='game'&&view!=='end')return;
  if(view==='game'){
    if(e.code==='KeyP'||e.code==='Escape'){setPaused(!paused);e.preventDefault();return}
    if(paused)return;
    if(!$('splash').hidden){if(e.code==='Space'||e.code==='Enter'){e.preventDefault();ac();closeSplash()}return}
    if(!$('fb').hidden){if(e.code==='Space'||e.code==='Enter'){e.preventDefault();nextQ()}return}
    if(e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW'){e.preventDefault();if(!e.repeat)fire()}
    if(/^Digit[1-5]$/.test(e.code)){
      const p=G.pods[+e.code.slice(5)-1];
      if(p)ship.targetX=clampX(A.left+p.baseX+p.w/2);
    }
    if(e.code.startsWith('Arrow'))e.preventDefault();
  }
});
window.addEventListener('keyup',e=>{keys[e.code]=false});
window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false});

/* ---------- ciclo principal ---------- */
let last=0;
function frame(ts){
  const dt=Math.min(.05,(ts-last)/1000||0);last=ts;
  update(dt);draw(ts/1000);
  requestAnimationFrame(frame);
}
function onResize(){resizeCanvas();if(view==='game')updateArena()}
window.addEventListener('resize',onResize);
if(window.ResizeObserver)new ResizeObserver(()=>{if(view==='game')updateArena()}).observe($('arena'));

/* ---------- arranque ---------- */
resizeCanvas();
hydrate();
$('btnPause').innerHTML=ic('pause');
setMute(muted);
setTheme(1);
buildMenu();
requestAnimationFrame(frame);
})();
