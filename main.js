// ─── DATA ───────────────────────────────
const ITEMS=[
  {id:1, name:'Elara Lounge Sofa',    cat:'Sofa',  desc:'Italian linen, solid oak frame, goose-down cushions.',       daily:349, weekly:1799, monthly:4999, em:'🛋️', style:'Luxury',       clr:'#c07040'},
  {id:2, name:'Arc Accent Chair',     cat:'Chair', desc:'Sculptural silhouette, brass legs, cloud-soft bouclé.',      daily:199, weekly:999,  monthly:2799, em:'🪑', style:'Contemporary', clr:'#7a8a5a'},
  {id:3, name:'Noir Dining Table',    cat:'Table', desc:'Powder-coated steel base with solid walnut 2cm slab.',       daily:299, weekly:1399, monthly:3999, em:'🪵', style:'Industrial',   clr:'#5a4a3a'},
  {id:4, name:'Cloud King Bed',       cat:'Bed',   desc:'Velvet upholstered headboard, solid wood slat base 180cm.',  daily:499, weekly:2499, monthly:6999, em:'🛏️', style:'Luxury',       clr:'#8a6a9a'},
  {id:5, name:'Helix Bookshelf',      cat:'Shelf', desc:'Modular open shelving in powder-coated steel, 80kg load.',   daily:149, weekly:699,  monthly:1999, em:'📚', style:'Minimal',      clr:'#5a7a7a'},
  {id:6, name:'Soleil Floor Lamp',    cat:'Lamp',  desc:'Brushed brass arc lamp, linen drum shade, 180cm height.',    daily:129, weekly:599,  monthly:1699, em:'💡', style:'Retro',        clr:'#c4922a'},
  {id:7, name:'Haven L-Sofa',         cat:'Sofa',  desc:'Deep-seated sectional in performance velvet, corner unit.',  daily:599, weekly:2999, monthly:7999, em:'🛋️', style:'Contemporary', clr:'#9a5a8a'},
  {id:8, name:'Studio Coffee Table',  cat:'Table', desc:'Smoked glass top, sculptural concrete base, 120×60cm.',      daily:179, weekly:849,  monthly:2399, em:'☕', style:'Modern',       clr:'#8a8070'},
  {id:9, name:'Petal Dining Chair',   cat:'Chair', desc:'Organic curved ash wood with hand-woven cane seat. Set×2.',  daily:179, weekly:849,  monthly:2399, em:'🪑', style:'Scandi',       clr:'#a09060'},
  {id:10,name:'Terra Queen Bed',      cat:'Bed',   desc:'Low-profile platform in terracotta linen, EU Queen.',        daily:399, weekly:1999, monthly:5599, em:'🛏️', style:'Boho',         clr:'#b87060'},
  {id:11,name:'Grid Wall Shelf',      cat:'Shelf', desc:'Industrial steel grid, fully customizable, matte black.',    daily:99,  weekly:449,  monthly:1299, em:'🗂️', style:'Industrial',   clr:'#5a5a6a'},
  {id:12,name:'Orb Pendant Light',    cat:'Lamp',  desc:'Handblown amber glass globe, 30cm, adjustable brass cord.',  daily:149, weekly:699,  monthly:1999, em:'🔆', style:'Artisan',      clr:'#c4922a'},
];

// ─── STATE ──────────────────────────────
let S={
  user: null,
  cat: 'All',
  wish: [],
  rentItem: null,
  rentDur: 'weekly',
  rentDays: 7,
  panelTab: 'active',
  notifOpen: false,
  mobOpen: false,
};

// ─── LOCAL STORAGE ──────────────────────
const ls = {
  get: k => { try{return JSON.parse(localStorage.getItem(k))}catch{return null} },
  set: (k,v) => localStorage.setItem(k, JSON.stringify(v)),
  rm:  k => localStorage.removeItem(k),
};

function getUsers(){ return ls.get('fixnrent_users')||[] }
function saveUsers(u){ ls.set('fixnrent_users',u) }
function getRentals(){ if(!S.user) return []; return ls.get('fixnrent_rentals_'+S.user.id)||[] }
function saveRentals(r){ if(!S.user) return; ls.set('fixnrent_rentals_'+S.user.id,r) }
function getNotifs(){ if(!S.user) return []; return ls.get('fixnrent_notifs_'+S.user.id)||[] }
function saveNotifs(n){ if(!S.user) return; ls.set('fixnrent_notifs_'+S.user.id,n) }
function addNotif(title,msg,type='info'){
  if(!S.user) return;
  const n=getNotifs();
  n.unshift({id:uid(),title,msg,type,read:false,at:new Date().toISOString()});
  saveNotifs(n);
}

// ─── INIT ───────────────────────────────
window.addEventListener('DOMContentLoaded', ()=>{
  const u=ls.get('fixnrent_user');
  if(u){ S.user=u; }
  S.wish = ls.get('fixnrent_wish')||[];
  renderNav();
  renderProducts();
  setupScrollReveal();
  setupNavScroll();
  setupNavHighlight();
  checkExpirations();
  setInterval(checkExpirations, 60000);

  // Close notif on outside click
  document.addEventListener('click', e=>{
    if(S.notifOpen && !document.getElementById('ndrop').contains(e.target) && !document.getElementById('notifBtn')?.contains(e.target)){
      S.notifOpen=false;
      document.getElementById('ndrop').classList.remove('on');
    }
  });
});

// ─── NAV RENDER ─────────────────────────
function renderNav(){
  const notifs = S.user ? getNotifs() : [];
  const unread = notifs.filter(n=>!n.read).length;
  const navR = document.getElementById('navRight');
  const mobA = document.getElementById('mobActions');

  if(S.user){
    const init = (S.user.firstName||S.user.name||'U').charAt(0).toUpperCase();
    navR.innerHTML=`
      <button class="btn-icon" id="notifBtn" onclick="toggleNotif(event)" aria-label="Notifications">
        🔔${unread>0?`<span class="badge">${unread>9?'9+':unread}</span>`:''}
      </button>
      <button class="avatar" onclick="openPanel()" title="My Account" aria-label="Dashboard">${init}</button>`;
    mobA.innerHTML=`
      <button class="btn btn-outline" onclick="openPanel();closeMob()">My Account</button>
      <button class="btn btn-ghost" onclick="doLogout();closeMob()">Sign Out</button>`;
  } else {
    navR.innerHTML=`
      <button class="btn btn-ghost btn-sm" onclick="openAuth('login')">Sign In</button>
      <button class="btn btn-terra btn-sm" onclick="openAuth('register')">Join Free</button>`;
    mobA.innerHTML=`
      <button class="btn btn-outline" onclick="openAuth('login');closeMob()">Sign In</button>
      <button class="btn btn-terra" onclick="openAuth('register');closeMob()">Join Free</button>`;
  }
  renderNotifList();
}

// ─── AUTH ───────────────────────────────
function openAuth(tab='login'){
  buildAuthModal(tab);
  openOL('authOL');
}

function buildAuthModal(tab){
  const el=document.getElementById('authBody');
  if(tab==='login'){
    el.innerHTML=`
      <div class="modal-h">Welcome back</div>
      <div class="modal-sub">Sign in to manage your rentals and account.</div>
      <div class="fg"><label class="fl">Email Address</label>
        <input class="fi" type="email" id="li_e" placeholder="you@example.com" autocomplete="email"></div>
      <div class="fg"><label class="fl">Password</label>
        <div class="fi-wrap">
          <input class="fi" type="password" id="li_p" placeholder="••••••••" autocomplete="current-password" onkeydown="if(event.key==='Enter')doLogin()">
          <span class="fi-eye" onclick="toggleEye('li_p')">👁</span>
        </div>
      </div>
      <div id="li_err" class="ferr hidden"></div>
      <button class="btn btn-terra btn-full mt3" id="li_btn" onclick="doLogin()">Sign In</button>
      <div class="fdiv"><span>or</span></div>
      <p class="fswitch">No account? <a onclick="buildAuthModal('register')">Create one free →</a></p>`;
  } else {
    el.innerHTML=`
      <div class="modal-h">Create account</div>
      <div class="modal-sub">Join thousands enjoying premium furniture rentals.</div>
      <div class="frow">
        <div class="fg"><label class="fl">First Name</label><input class="fi" id="rg_fn" placeholder="Alex" autocomplete="given-name"></div>
        <div class="fg"><label class="fl">Last Name</label><input class="fi" id="rg_ln" placeholder="Smith" autocomplete="family-name"></div>
      </div>
      <div class="fg"><label class="fl">Email</label><input class="fi" type="email" id="rg_e" placeholder="you@example.com" autocomplete="email"></div>
      <div class="fg"><label class="fl">Phone <span style="color:var(--ink3);font-weight:400">(optional)</span></label>
        <input class="fi" type="tel" id="rg_ph" placeholder="+91 98765 43210" autocomplete="tel"></div>
      <div class="fg"><label class="fl">Password</label>
        <div class="fi-wrap">
          <input class="fi" type="password" id="rg_pw" placeholder="Min. 6 characters" autocomplete="new-password" onkeydown="if(event.key==='Enter')doRegister()">
          <span class="fi-eye" onclick="toggleEye('rg_pw')">👁</span>
        </div>
        <p class="fhint">At least 6 characters.</p>
      </div>
      <div id="rg_err" class="ferr hidden"></div>
      <button class="btn btn-terra btn-full mt3" id="rg_btn" onclick="doRegister()">Create Account</button>
      <div class="fdiv"><span>or</span></div>
      <p class="fswitch">Already have an account? <a onclick="buildAuthModal('login')">Sign in →</a></p>`;
  }
}

function doLogin(){
  const e=val('li_e'), p=val('li_p');
  const err=document.getElementById('li_err');
  if(!e||!p){showErr(err,'Please fill in all fields.');return}
  setBtn('li_btn',true);
  try{
    const users=getUsers();
    const u=users.find(x=>x.email===e && x.password===p);
    if(!u){showErr(err,'Incorrect email or password.');setBtn('li_btn',false);return}
    S.user=u;
    ls.set('fixnrent_user',u);
    closeOL('authOL');
    renderNav();
    toast('success',`Welcome back, ${u.firstName||u.name.split(' ')[0]}!`,'You are signed in.');
    checkExpirations();
  }catch(ex){showErr(err,'Something went wrong. Try again.')}
  setBtn('li_btn',false);
}

function doRegister(){
  const fn=val('rg_fn'), ln=val('rg_ln'), e=val('rg_e'), ph=val('rg_ph'), pw=val('rg_pw');
  const err=document.getElementById('rg_err');
  if(!fn||!ln||!e||!pw){showErr(err,'Please fill in all required fields.');return}
  if(pw.length<6){showErr(err,'Password must be at least 6 characters.');return}
  const users=getUsers();
  if(users.find(u=>u.email===e)){showErr(err,'This email is already registered.');return}
  setBtn('rg_btn',true);
  const u={id:uid(),firstName:fn,lastName:ln,name:fn+' '+ln,email:e,phone:ph,password:pw,joinedAt:new Date().toISOString()};
  users.push(u);
  saveUsers(users);
  S.user=u;
  ls.set('fixnrent_user',u);
  // welcome notif
  addNotif('🎉 Welcome to Nëst!',`Hi ${fn}! Your account is ready. Start browsing our collection.`,'success');
  closeOL('authOL');
  renderNav();
  toast('success',`Welcome, ${fn}!`,'Your account is ready. Start browsing!');
  setBtn('rg_btn',false);
}

function doLogout(){
  S.user=null;
  ls.rm('fixnrent_user');
  renderNav();
  closePanel();
  toast('info','Signed out','See you next time!');
}

// ─── PRODUCTS ───────────────────────────
function renderProducts(){
  const grid=document.getElementById('pgrid');
  const q=(document.getElementById('sInput')?.value||'').trim().toLowerCase();
  const srt=document.getElementById('sortSel')?.value||'';
  let items=ITEMS.filter(f=>{
    const mc=S.cat==='All'||f.cat===S.cat;
    const mq=!q||f.name.toLowerCase().includes(q)||f.desc.toLowerCase().includes(q)||f.style.toLowerCase().includes(q);
    return mc&&mq;
  });
  if(srt==='pa') items.sort((a,b)=>a.daily-b.daily);
  if(srt==='pd') items.sort((a,b)=>b.daily-a.daily);
  if(srt==='na') items.sort((a,b)=>a.name.localeCompare(b.name));

  if(!items.length){
    grid.innerHTML=`<div style="grid-column:1/-1"><div class="empty"><span class="empty-icon">🔍</span><div class="empty-title">No pieces found</div><div class="empty-desc">Try a different search term or category.</div></div></div>`;
    return;
  }
  grid.innerHTML=items.map(f=>`
    <div class="pcard" onclick="cardClick(${f.id})">
      <div class="pcard-media">
        <span class="ptag">${f.style}</span>
        <button class="pfav ${S.wish.includes(f.id)?'on':''}" onclick="event.stopPropagation();toggleWish(${f.id})" aria-label="Wishlist">
          ${S.wish.includes(f.id)?'♥':'♡'}
        </button>
        <div class="p3d">${miniSVG(f)}</div>
      </div>
      <div class="pcard-body">
        <div class="pcat">${f.cat}</div>
        <div class="pname">${f.name}</div>
        <div class="pdesc">${f.desc}</div>
        <div class="pfoot">
          <div><span class="pfrom">From</span><span class="pval"> ₹${f.daily}</span><span class="punit">/day</span></div>
          <button class="prent" onclick="event.stopPropagation();rentClick(${f.id})">Rent Now</button>
        </div>
      </div>
    </div>`).join('');
}

function setCat(cat,btn){
  S.cat=cat;
  document.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));
  btn.classList.add('on');
  renderProducts();
}

function toggleWish(id){
  if(S.wish.includes(id)) S.wish=S.wish.filter(x=>x!==id);
  else S.wish.push(id);
  ls.set('fixnrent_wish',S.wish);
  renderProducts();
}

function cardClick(id){
  const f=ITEMS.find(x=>x.id===id);
  if(f) toast('info',f.name,`${f.style} · from ₹${f.daily}/day`);
}

// ─── SVG FURNITURE MINI ─────────────────
function miniSVG(f){
  const c=f.clr, d=dk(c), id='g'+f.id;
  const g=`<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c}" stop-opacity=".9"/><stop offset="100%" stop-color="${d}" stop-opacity=".9"/></linearGradient></defs>`;
  let b='';
  switch(f.cat){
    case 'Sofa':
      b=`<rect x="16" y="98" width="168" height="38" rx="8" fill="url(#${id})"/>
         <rect x="22" y="70" width="70" height="34" rx="6" fill="url(#${id})"/>
         <rect x="108" y="70" width="70" height="34" rx="6" fill="url(#${id})"/>
         <rect x="11" y="76" width="18" height="56" rx="6" fill="${d}"/>
         <rect x="171" y="76" width="18" height="56" rx="6" fill="${d}"/>
         <rect x="30" y="134" width="10" height="24" rx="3" fill="${d}"/>
         <rect x="160" y="134" width="10" height="24" rx="3" fill="${d}"/>
         <rect x="24" y="74" width="40" height="6" rx="3" fill="rgba(255,255,255,.16)"/>
         <rect x="110" y="74" width="40" height="6" rx="3" fill="rgba(255,255,255,.16)"/>
         <ellipse cx="100" cy="162" rx="74" ry="8" fill="rgba(0,0,0,.18)"/>`;break;
    case 'Chair':
      b=`<rect x="44" y="90" width="112" height="22" rx="6" fill="url(#${id})"/>
         <rect x="50" y="58" width="100" height="36" rx="7" fill="url(#${id})"/>
         <rect x="54" y="110" width="10" height="44" rx="4" fill="${d}"/>
         <rect x="136" y="110" width="10" height="44" rx="4" fill="${d}"/>
         <rect x="56" y="52" width="10" height="42" rx="4" fill="${d}"/>
         <rect x="134" y="52" width="10" height="42" rx="4" fill="${d}"/>
         <rect x="57" y="62" width="38" height="5" rx="2" fill="rgba(255,255,255,.16)"/>
         <ellipse cx="100" cy="157" rx="56" ry="7" fill="rgba(0,0,0,.18)"/>`;break;
    case 'Table':
      b=`<rect x="12" y="72" width="176" height="18" rx="4" fill="url(#${id})"/>
         <rect x="22" y="88" width="10" height="62" rx="4" fill="${d}"/>
         <rect x="168" y="88" width="10" height="62" rx="4" fill="${d}"/>
         <rect x="34" y="90" width="10" height="58" rx="4" fill="${d}"/>
         <rect x="156" y="90" width="10" height="58" rx="4" fill="${d}"/>
         <ellipse cx="100" cy="153" rx="82" ry="8" fill="rgba(0,0,0,.18)"/>`;break;
    case 'Bed':
      b=`<rect x="12" y="86" width="176" height="58" rx="8" fill="url(#${id})"/>
         <rect x="10" y="56" width="34" height="86" rx="8" fill="${d}"/>
         <rect x="26" y="92" width="134" height="32" rx="5" fill="${c}aa"/>
         <rect x="28" y="92" width="64" height="30" rx="4" fill="${c}80"/>
         <rect x="105" y="92" width="53" height="30" rx="4" fill="${c}80"/>
         <rect x="16" y="142" width="12" height="18" rx="3" fill="${d}"/>
         <rect x="172" y="142" width="12" height="18" rx="3" fill="${d}"/>
         <ellipse cx="100" cy="147" rx="86" ry="9" fill="rgba(0,0,0,.18)"/>`;break;
    case 'Shelf':
      b=`<rect x="26" y="36" width="148" height="10" rx="3" fill="url(#${id})"/>
         <rect x="26" y="76" width="148" height="10" rx="3" fill="url(#${id})"/>
         <rect x="26" y="116" width="148" height="10" rx="3" fill="url(#${id})"/>
         <rect x="26" y="38" width="10" height="100" rx="3" fill="${d}"/>
         <rect x="164" y="38" width="10" height="100" rx="3" fill="${d}"/>
         <rect x="42" y="48" width="18" height="28" rx="2" fill="${c}75"/>
         <rect x="64" y="52" width="14" height="24" rx="2" fill="${c}55"/>
         <rect x="82" y="46" width="22" height="30" rx="2" fill="${c}65"/>
         <rect x="110" y="50" width="16" height="26" rx="2" fill="${c}60"/>`;break;
    case 'Lamp':
      b=`<ellipse cx="100" cy="66" rx="44" ry="27" fill="url(#${id})"/>
         <rect x="97" y="91" width="6" height="66" rx="3" fill="${d}"/>
         <ellipse cx="100" cy="160" rx="29" ry="7" fill="${d}"/>
         <circle cx="100" cy="65" r="11" fill="rgba(255,230,100,.85)"/>
         <ellipse cx="100" cy="65" rx="44" ry="27" fill="rgba(255,220,80,.1)"/>
         <ellipse cx="100" cy="168" rx="40" ry="6" fill="rgba(0,0,0,.18)"/>`;break;
    default:
      b=`<text x="100" y="112" text-anchor="middle" font-size="72">${f.em}</text>`;
  }
  return `<svg width="200" height="180" viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg">${g}${b}</svg>`;
}
function dk(h){const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16),f=.52;return '#'+[r,g,b].map(v=>Math.floor(v*f).toString(16).padStart(2,'0')).join('')}

// ─── RENT FLOW ──────────────────────────
function rentClick(id){
  if(!S.user){
    toast('info','Sign in required','Create a free account to rent furniture.');
    openAuth('login');
    return;
  }
  S.rentItem=ITEMS.find(f=>f.id===id);
  S.rentDur='weekly';
  S.rentDays=7;
  buildRentModal();
  openOL('rentOL');
}

function buildRentModal(){
  const f=S.rentItem;
  if(!f) return;
  document.getElementById('rentBody').innerHTML=`
    <div class="modal-h">Rent This Item</div>
    <div class="modal-sub">Configure duration and delivery details below.</div>
    <div class="r-preview">
      <span class="r-em">${f.em}</span>
      <div><div class="r-iname">${f.name}</div><div class="r-imeta">${f.cat} · ${f.style}</div></div>
    </div>
    <div class="fg">
      <label class="fl">Duration Type</label>
      <div class="durgrid">
        <div class="duropt ${S.rentDur==='daily'?'on':''}" onclick="setRentDur('daily')">
          <span class="dur-tag2">Daily</span><div class="dur-p">₹${f.daily}</div><span class="dur-s">per day</span>
        </div>
        <div class="duropt ${S.rentDur==='weekly'?'on':''}" onclick="setRentDur('weekly')">
          <span class="dur-tag2">Weekly</span><div class="dur-p">₹${f.weekly}</div><span class="dur-s">Save 28%</span>
        </div>
        <div class="duropt ${S.rentDur==='monthly'?'on':''}" onclick="setRentDur('monthly')">
          <span class="dur-tag2">Monthly</span><div class="dur-p">₹${f.monthly}</div><span class="dur-s">Save 50%</span>
        </div>
      </div>
    </div>
    <div class="range-wrap">
      <label class="fl">Number of Days: <strong id="daysLbl" style="color:var(--terra)">${S.rentDays}</strong></label>
      <div class="range-disp" id="rangeDisp">${S.rentDays} days</div>
      <input type="range" id="daysRange" min="1" max="90" value="${S.rentDays}" oninput="onDaysChange(this.value)">
      <div class="range-lbl"><span>1 day</span><span>45 days</span><span>90 days</span></div>
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">Start Date</label><input class="fi" type="date" id="r_start" value="${today()}" min="${today()}" onchange="syncEnd()"></div>
      <div class="fg"><label class="fl">End Date</label><input class="fi" type="date" id="r_end" value="${addDays(today(),S.rentDays)}" readonly style="opacity:.65"></div>
    </div>
    <div class="fg"><label class="fl">Delivery Address</label><input class="fi" id="r_addr" placeholder="Full address including city and PIN code"></div>
    <div class="breakdown" id="bkdn">${buildBreakdown()}</div>
    <div id="r_err" class="ferr hidden"></div>
    <button class="btn btn-terra btn-full" id="r_btn" onclick="confirmRent()">
      Confirm &amp; Pay — ₹<span id="r_total">${calcTotal()}</span>
    </button>
    <p style="text-align:center;font-size:.72rem;color:var(--ink3);margin-top:.75rem">
      🛡️ Free delivery &amp; pickup · Cancel up to 24h before start date
    </p>`;
}

function setRentDur(d){
  S.rentDur=d;
  if(d==='daily')   S.rentDays=Math.max(1,S.rentDays);
  if(d==='weekly')  S.rentDays=Math.max(7,Math.ceil(S.rentDays/7)*7);
  if(d==='monthly') S.rentDays=Math.max(30,Math.ceil(S.rentDays/30)*30);
  buildRentModal();
}

function onDaysChange(v){
  S.rentDays=parseInt(v);
  document.getElementById('daysLbl').textContent=v;
  document.getElementById('rangeDisp').textContent=v+' days';
  const s=document.getElementById('r_start').value;
  document.getElementById('r_end').value=addDays(s,parseInt(v));
  document.getElementById('bkdn').innerHTML=buildBreakdown();
  document.getElementById('r_total').textContent=calcTotal();
}

function syncEnd(){
  const s=document.getElementById('r_start').value;
  document.getElementById('r_end').value=addDays(s,S.rentDays);
}

function calcPrice(){
  const f=S.rentItem;
  if(S.rentDur==='daily')  return f.daily   * S.rentDays;
  if(S.rentDur==='weekly') return f.weekly  * Math.ceil(S.rentDays/7);
  return f.monthly * Math.ceil(S.rentDays/30);
}
function calcTotal(){ const p=calcPrice(); return (p+Math.round(p*.2)).toLocaleString() }

function buildBreakdown(){
  const f=S.rentItem, d=S.rentDays;
  let lbl, base;
  if(S.rentDur==='daily'){
    base=f.daily*d; lbl=`₹${f.daily} × ${d} day${d!==1?'s':''}`;
  } else if(S.rentDur==='weekly'){
    const w=Math.ceil(d/7); base=f.weekly*w; lbl=`₹${f.weekly} × ${w} week${w!==1?'s':''}`;
  } else {
    const m=Math.ceil(d/30); base=f.monthly*m; lbl=`₹${f.monthly} × ${m} month${m!==1?'s':''}`;
  }
  const dep=Math.round(base*.2);
  return `
    <div class="brow"><span>Rental (${lbl})</span><span>₹${base.toLocaleString()}</span></div>
    <div class="brow"><span>Delivery &amp; Pickup</span><span style="color:var(--sage);font-weight:600">FREE</span></div>
    <div class="brow"><span>Refundable Deposit (20%)</span><span>₹${dep.toLocaleString()}</span></div>
    <div class="brow btotal"><span>Total Payable Today</span><span class="bval">₹${(base+dep).toLocaleString()}</span></div>`;
}

function confirmRent(){
  const addr=val('r_addr');
  const start=document.getElementById('r_start').value;
  const errEl=document.getElementById('r_err');
  if(!addr){showErr(errEl,'Please enter a delivery address.');return}
  setBtn('r_btn',true);
  const f=S.rentItem;
  const endDate=addDays(start,S.rentDays);
  const price=calcPrice();
  const deposit=Math.round(price*.2);
  const rental={
    id:'RF-'+uid().slice(0,8).toUpperCase(),
    furnitureId:f.id, furnitureName:f.name, cat:f.cat, em:f.em,
    dur:S.rentDur, days:S.rentDays,
    startDate:start, endDate, address:addr,
    price, deposit, totalPaid:price+deposit,
    status:'active', n3days:false, nExpired:false,
    createdAt:new Date().toISOString()
  };
  const rentals=getRentals();
  rentals.unshift(rental);
  saveRentals(rentals);
  addNotif(`📦 Confirmed — ${f.name}`,`Order Confirmed: ${fmtDate(start)} · Return by: ${fmtDate(endDate)} · Total: ₹${(price+deposit).toLocaleString()}`,'success');
  closeOL('rentOL');
  renderNav();
  toast('success','Rental Confirmed! 🎉',`${f.name} delivered by ${fmtDate(start)}.`);
  setBtn('r_btn',false);
}

// ─── NOTIFICATIONS ──────────────────────
function toggleNotif(e){
  e.stopPropagation();
  S.notifOpen=!S.notifOpen;
  document.getElementById('ndrop').classList.toggle('on',S.notifOpen);
}

function renderNotifList(){
  const el=document.getElementById('nlist');
  if(!S.user){el.innerHTML='<div style="padding:2rem;text-align:center;font-size:.84rem;color:var(--ink3)">Sign in to see notifications.</div>';return}
  const n=getNotifs();
  if(!n.length){el.innerHTML='<div style="padding:2rem;text-align:center;font-size:.84rem;color:var(--ink3)">No notifications yet.</div>';return}
  el.innerHTML=n.slice(0,30).map(x=>`
    <div class="nitem ${x.read?'':'unread'}" onclick="readNotif('${x.id}')">
      <div class="ndot2 ${x.read?'old':'new'}"></div>
      <div>
        <div class="ntitle">${x.title}</div>
        <div class="nmsg">${x.msg}</div>
        <div class="ntime">${timeAgo(x.at)}</div>
      </div>
    </div>`).join('');
}

function readNotif(id){
  const n=getNotifs();
  const x=n.find(y=>y.id===id);
  if(x){x.read=true;saveNotifs(n);}
  renderNotifList();
  renderNav();
}

function markAllRead(){
  const n=getNotifs();
  n.forEach(x=>x.read=true);
  saveNotifs(n);
  renderNotifList();
  renderNav();
}

// ─── DASHBOARD ──────────────────────────
function openPanel(){
  checkExpirations();
  renderPanel();
  document.getElementById('panel').classList.add('on');
  document.getElementById('pback').classList.add('on');
  document.body.style.overflow='hidden';
}
function closePanel(){
  document.getElementById('panel').classList.remove('on');
  document.getElementById('pback').classList.remove('on');
  document.body.style.overflow='';
}

function swTab(t){
  S.panelTab=t;
  ['active','history','profile'].forEach(x=>{
    document.getElementById('pt-'+x).classList.toggle('on',x===t);
    document.getElementById('pc-'+x).classList.toggle('hidden',x!==t);
  });
  renderPanel();
}

function renderPanel(){
  renderPActive();
  renderPHistory();
  renderPProfile();
}

function renderPActive(){
  const el=document.getElementById('pc-active');
  const rentals=getRentals().filter(r=>r.status==='active');
  if(!rentals.length){
    el.innerHTML=`<div class="empty"><span class="empty-icon">🛋️</span><div class="empty-title">No active rentals</div><div class="empty-desc">Browse our collection to get started.</div><button class="btn btn-terra mt3" onclick="closePanel();go('catalog')">Browse Collection</button></div>`;
    return;
  }
  el.innerHTML=rentals.map(r=>rentalCard(r,true)).join('');
}

function renderPHistory(){
  const el=document.getElementById('pc-history');
  const rentals=getRentals();
  if(!rentals.length){
    el.innerHTML=`<div class="empty"><span class="empty-icon">📋</span><div class="empty-title">No rental history</div><div class="empty-desc">Your past rentals will appear here.</div></div>`;
    return;
  }
  el.innerHTML=`<p style="font-size:.76rem;color:var(--ink3);margin-bottom:1rem">${rentals.length} total rental${rentals.length!==1?'s':''}</p>`+
    rentals.map(r=>rentalCard(r,false)).join('');
}

function renderPProfile(){
  const el=document.getElementById('pc-profile');
  const u=S.user;
  if(!u){el.innerHTML='';return}
  const rentals=getRentals();
  const active=rentals.filter(r=>r.status==='active').length;
  const spent=rentals.reduce((s,r)=>s+(r.totalPaid||0),0);
  el.innerHTML=`
    <div class="prof-hd">
      <div class="prof-av">${(u.firstName||u.name||'U').charAt(0).toUpperCase()}</div>
      <div class="prof-name">${u.name||u.firstName+' '+u.lastName}</div>
      <div class="prof-email">${u.email}</div>
    </div>
    <div class="stats-3">
      <div class="s3"><div class="s3n">${rentals.length}</div><div class="s3l">Total Rentals</div></div>
      <div class="s3"><div class="s3n text-sage">${active}</div><div class="s3l">Active</div></div>
      <div class="s3"><div class="s3n" style="font-size:1.2rem">₹${spent.toLocaleString()}</div><div class="s3l">Total Spent</div></div>
    </div>
    <div class="frow">
      <div class="fg"><label class="fl">First Name</label><input class="fi" id="pf_fn" value="${u.firstName||u.name.split(' ')[0]}"></div>
      <div class="fg"><label class="fl">Last Name</label><input class="fi" id="pf_ln" value="${u.lastName||u.name.split(' ').slice(1).join(' ')}"></div>
    </div>
    <div class="fg"><label class="fl">Phone</label><input class="fi" id="pf_ph" value="${u.phone||''}" placeholder="Add phone number"></div>
    <button class="btn btn-terra mt2" onclick="saveProfile()">Save Changes</button>
    <div style="margin-top:1.8rem;padding-top:1.4rem;border-top:1px solid var(--border2)">
      <div style="font-size:.68rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);margin-bottom:.35rem">Member Since</div>
      <div style="font-size:.84rem;color:var(--ink2)">${fmtDate(u.joinedAt)}</div>
    </div>
    <div style="margin-top:1.5rem">
      <button class="btn btn-danger btn-sm" onclick="doLogout()">Sign Out</button>
    </div>`;
}

function rentalCard(r,showAct){
  const total=Math.max(1,ddiff(r.startDate,r.endDate));
  const elapsed=Math.max(0,ddiff(r.startDate,today()));
  const pct=Math.min(100,Math.round((elapsed/total)*100));
  const rem=Math.max(0,total-elapsed);
  return `
    <div class="rcard">
      <div class="rcard-hd">
        <div><div class="rcard-name">${r.em} ${r.furnitureName}</div><div class="rcard-id">Order ${r.id}</div></div>
        <span class="spill spill-${r.status}">${r.status}</span>
      </div>
      <div class="rmeta">
        <div class="rmi"><strong>${fmtDate(r.startDate)}</strong>Start Date</div>
        <div class="rmi"><strong>${fmtDate(r.endDate)}</strong>End Date</div>
        <div class="rmi"><strong>₹${(r.price||0).toLocaleString()}</strong>Rental Cost</div>
        <div class="rmi"><strong>${r.days} days</strong>Duration</div>
      </div>
      ${r.status==='active'?`
        <div class="pbar-wrap">
          <div class="pbar-bg"><div class="pbar-fill" style="width:${pct}%"></div></div>
          <div class="pbar-lbl">${rem} day${rem!==1?'s':''} remaining</div>
        </div>`:'' }
      ${showAct&&r.status==='active'?`
        <div class="ract">
          <button class="btn btn-outline btn-sm" onclick="extendRental('${r.id}')">＋ Extend 7 Days</button>
          <button class="btn btn-ghost btn-sm" onclick="returnRental('${r.id}')">Schedule Return</button>
        </div>`:'' }
    </div>`;
}

function extendRental(id){
  const rentals=getRentals();
  const i=rentals.findIndex(r=>r.id===id);
  if(i<0) return;
  const nd=new Date(rentals[i].endDate);
  nd.setDate(nd.getDate()+7);
  rentals[i].endDate=nd.toISOString().split('T')[0];
  rentals[i].days+=7;
  rentals[i].n3days=false;
  saveRentals(rentals);
  addNotif(`📅 Extended — ${rentals[i].furnitureName}`,`Extended by 7 days. New end: ${fmtDate(rentals[i].endDate)}.`,'info');
  renderPanel();
  renderNav();
  toast('success','Rental Extended!',`New end date: ${fmtDate(rentals[i].endDate)}`);
}

function returnRental(id){
  const rentals=getRentals();
  const i=rentals.findIndex(r=>r.id===id);
  if(i<0) return;
  rentals[i].status='returned';
  rentals[i].returnedAt=new Date().toISOString();
  saveRentals(rentals);
  addNotif(`✅ Return Scheduled — ${rentals[i].furnitureName}`,`Pickup arranged. Deposit ₹${rentals[i].deposit?.toLocaleString()||0} refunded in 3–5 days.`,'success');
  renderPanel();
  renderNav();
  toast('info','Return Scheduled','Our team will arrange pickup within 24 hours.');
}

function saveProfile(){
  const users=getUsers();
  const i=users.findIndex(u=>u.id===S.user.id);
  if(i<0) return;
  const fn=val('pf_fn'), ln=val('pf_ln'), ph=val('pf_ph');
  if(fn) users[i].firstName=fn;
  if(ln) users[i].lastName=ln;
  if(fn||ln) users[i].name=(fn||users[i].firstName)+' '+(ln||users[i].lastName);
  if(ph!==undefined) users[i].phone=ph;
  saveUsers(users);
  S.user=users[i];
  ls.set('fixnrent_user',S.user);
  renderNav();
  renderPProfile();
  toast('success','Profile Updated','Your details have been saved.');
}

// ─── EXPIRATION CHECKS ──────────────────
function checkExpirations(){
  if(!S.user) return;
  const rentals=getRentals();
  const now=new Date();
  let changed=false;
  rentals.forEach(r=>{
    if(r.status!=='active') return;
    const end=new Date(r.endDate);
    const diff=Math.ceil((end-now)/86400000);
    if(diff<=3&&diff>0&&!r.n3days){
      r.n3days=true;
      addNotif(`⚠️ Ending Soon — ${r.furnitureName}`,`Rental ends in ${diff} day${diff!==1?'s':''} on ${fmtDate(r.endDate)}. Extend or schedule return.`,'warn');
      changed=true;
    }
    if(diff<=0&&!r.nExpired){
      r.status='expired';
      r.nExpired=true;
      addNotif(`🔔 Rental Expired — ${r.furnitureName}`,`Your rental ended on ${fmtDate(r.endDate)}. Please arrange pickup or renew.`,'warn');
      changed=true;
    }
  });
  if(changed){saveRentals(rentals);renderNav();}
}

// ─── OVERLAY HELPERS ────────────────────
function openOL(id){ document.getElementById(id).classList.add('on'); document.body.style.overflow='hidden' }
function closeOL(id){ document.getElementById(id).classList.remove('on'); document.body.style.overflow='' }
function olClick(e,id){ if(e.target.id===id) closeOL(id) }

// ─── MOBILE MENU ────────────────────────
document.getElementById('hbg').addEventListener('click',()=>{
  S.mobOpen=!S.mobOpen;
  document.getElementById('hbg').classList.toggle('open',S.mobOpen);
  document.getElementById('mobMenu').classList.toggle('open',S.mobOpen);
  document.body.style.overflow=S.mobOpen?'hidden':'';
});
function closeMob(){
  S.mobOpen=false;
  document.getElementById('hbg').classList.remove('open');
  document.getElementById('mobMenu').classList.remove('open');
  document.body.style.overflow='';
}

// ─── SCROLL REVEAL ──────────────────────
function setupScrollReveal(){
  const obs=new IntersectionObserver((entries)=>{
    entries.forEach((e,i)=>{
      if(e.isIntersecting){
        setTimeout(()=>e.target.classList.add('vis'),i*90);
        obs.unobserve(e.target);
      }
    });
  },{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
}

// ─── NAV EFFECTS ────────────────────────
function setupNavScroll(){
  window.addEventListener('scroll',()=>{
    document.getElementById('nav').classList.toggle('scrolled',window.scrollY>55);
    updateNavHL();
  },{passive:true});
}
function setupNavHighlight(){ updateNavHL(); }
function updateNavHL(){
  const secs=['how','catalog','pricing','reviews'];
  let cur='';
  secs.forEach(id=>{
    const el=document.getElementById(id);
    if(el&&window.scrollY>=el.offsetTop-130) cur=id;
  });
  document.querySelectorAll('.nav-a').forEach(a=>{
    a.classList.toggle('active',a.getAttribute('href')==='#'+cur);
  });
}

// ─── TOAST ──────────────────────────────
const TICONS={success:'✅',error:'❌',info:'💬',warn:'⚠️'};
function toast(type,title,msg){
  const w=document.getElementById('tw');
  const el=document.createElement('div');
  el.className=`toast toast-${type}`;
  el.innerHTML=`<span class="t-icon">${TICONS[type]||'💬'}</span><div><div class="t-title">${title}</div><div class="t-body">${msg}</div></div>`;
  w.appendChild(el);
  requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('in')));
  setTimeout(()=>{el.classList.remove('in');setTimeout(()=>el.remove(),350)},4500);
}

// ─── UTILITIES ──────────────────────────
function val(id){ return (document.getElementById(id)?.value||'').trim() }
function showErr(el,msg){ el.textContent=msg; el.classList.remove('hidden'); setTimeout(()=>el.classList.add('hidden'),5000) }
function setBtn(id,loading){
  const b=document.getElementById(id);
  if(!b) return;
  b.disabled=loading;
  b.style.opacity=loading?.6:1;
}
function toggleEye(id){
  const el=document.getElementById(id);
  if(el) el.type=el.type==='password'?'text':'password';
}
function today(){ return new Date().toISOString().split('T')[0] }
function addDays(from,n){
  const d=new Date(from+'T00:00:00');
  d.setDate(d.getDate()+parseInt(n));
  return d.toISOString().split('T')[0];
}
function ddiff(a,b){ return Math.max(1,Math.ceil((new Date(b)-new Date(a))/86400000)) }
function fmtDate(s){
  if(!s) return '';
  return new Date(s).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
}
function timeAgo(s){
  const d=Date.now()-new Date(s).getTime();
  const m=Math.floor(d/60000);
  if(m<1) return 'just now';
  if(m<60) return m+'m ago';
  const h=Math.floor(m/60);
  if(h<24) return h+'h ago';
  return Math.floor(h/24)+'d ago';
}
function uid(){ return Math.random().toString(36).slice(2)+Date.now().toString(36) }
function scrollTop(){ window.scrollTo({top:0,behavior:'smooth'}) }
function go(id){ document.getElementById(id)?.scrollIntoView({behavior:'smooth'}) }