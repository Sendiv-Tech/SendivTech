const CREDS={u:'admin',p:'sendiv2025'};
let projects=[];let reviews=[];let logoDataUrl=null;
let currentFilter='all';let editIdx=null;let imgData=null;let projType='demo';let selectedRating=0;

const DEMO_PROJECTS=[
  {id:'d1',title:'NexaFlow SaaS Dashboard',category:'Web Design',type:'demo',desc:'A clean, data-rich admin dashboard for a B2B SaaS client. Features real-time charts and role-based access.',link:'#',image:null},
  {id:'d2',title:'Motion Brand Reel',category:'Video Editing',type:'demo',desc:'60-second brand film with custom motion graphics, kinetic typography and original sound design.',link:'',image:null},
  {id:'d3',title:'Velta Campaign Posters',category:'Graphic Design',type:'done',desc:'6 event and marketing posters for a product launch. Bold typography, print-ready exports.',link:'',image:null},
  {id:'d4',title:'Stackmode Landing Page',category:'Web Design',type:'done',desc:'High-converting marketing site for a developer tools startup. Next.js, Framer Motion, 98 Lighthouse score.',link:'#',image:null},
];

async function load(){
  try{const r=await window.storage.get('stech-v4-projects');if(r&&r.value)projects=JSON.parse(r.value);else{projects=[...DEMO_PROJECTS];await persistProj();}}catch(e){projects=[...DEMO_PROJECTS];}
  try{const r=await window.storage.get('stech-v4-reviews');if(r&&r.value)reviews=JSON.parse(r.value);}catch(e){}
  try{const r=await window.storage.get('stech-v4-logo');if(r&&r.value){logoDataUrl=r.value;applyLogo(logoDataUrl);}}catch(e){}
  renderAll();renderRevPreview();renderAllReviews();
}
async function persistProj(){try{await window.storage.set('stech-v4-projects',JSON.stringify(projects));}catch(e){}}
async function persistRevs(){try{await window.storage.set('stech-v4-reviews',JSON.stringify(reviews));}catch(e){}}
async function persistLogo(){try{await window.storage.set('stech-v4-logo',logoDataUrl);}catch(e){}}

function applyLogo(src){
  const ids=['navLogoWrap','aboutLogoWrap','ftLogoWrap','rpLogoWrap','admLogoWrap','admNavLogo'];
  ids.forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    el.innerHTML='';el.style.background='transparent';
    const img=new Image();img.src=src;img.style.cssText='width:100%;height:100%;object-fit:contain;border-radius:inherit';
    el.appendChild(img);
  });
  const lp=document.getElementById('logoPreviewImg');
  if(lp){lp.src=src;document.getElementById('logoPreviewArea').style.display='block';}
}
function uploadLogo(input){
  const file=input.files[0];if(!file)return;
  if(file.size>2*1024*1024){showToast('Logo too large (max 2MB)','err');return;}
  const r=new FileReader();r.onload=async e=>{logoDataUrl=e.target.result;applyLogo(logoDataUrl);await persistLogo();showToast('Logo updated!','ok');};r.readAsDataURL(file);
}
function uploadHeroVideo(input){
  const file=input.files[0];if(!file)return;
  const url=URL.createObjectURL(file);
  const vid=document.getElementById('heroBg');
  document.getElementById('heroVideoSrc').src=url;vid.load();vid.play();vid.muted=true;
  document.getElementById('videoStatus').style.display='block';showToast('Hero video loaded!','ok');
}

function renderAll(){
  renderProjects(currentFilter);renderAdmTable();updateAdmStats();updateTabCounts();
  document.getElementById('hp-proj').textContent=projects.length;
}
function updateTabCounts(){
  document.getElementById('cnt-all').textContent=projects.length;
  document.getElementById('cnt-demo').textContent=projects.filter(p=>p.type==='demo').length;
  document.getElementById('cnt-done').textContent=projects.filter(p=>p.type==='done').length;
}
function filterProj(type,btn){
  currentFilter=type;document.querySelectorAll('.ptab').forEach(t=>t.classList.remove('active'));btn.classList.add('active');renderProjects(type);
}
function renderProjects(filter){
  const grid=document.getElementById('projGrid');
  let list=filter==='all'?projects:projects.filter(p=>p.type===filter);
  if(!list.length){grid.innerHTML=`<div class="proj-empty"><div style="font-size:2rem;margin-bottom:.6rem">🚀</div><h3>No projects yet</h3><p>Add via Admin panel.</p></div>`;return;}
  grid.innerHTML=list.map(p=>`
    <div class="proj-card fade-up">
      <div class="proj-thumb">
        ${p.image?`<img src="${p.image}" alt="${esc(p.title)}" loading="lazy"/>`:
        `<div class="proj-ph"><div class="proj-ph-ico">${p.category==='Video Editing'?'🎬':p.category==='Graphic Design'?'🎨':'🌐'}</div><div class="proj-ph-lbl">${p.category||'Project'}</div></div>`}
        <div class="proj-badge ${p.type==='done'?'bdone':'bdemo'}">${p.type==='done'?'✅ Completed':'🟡 Demo'}</div>
      </div>
      <div class="proj-body">
        <div class="proj-cat">${p.category||'Project'}</div>
        <h3 class="proj-title">${esc(p.title)}</h3>
        <p class="proj-desc">${esc(p.desc)}</p>
        <div class="proj-foot">${p.link?`<a href="${p.link}" target="_blank" class="proj-link">Live Preview ↗</a>`:'<span></span>'}</div>
      </div>
    </div>`).join('');
  setTimeout(()=>{document.querySelectorAll('.proj-card.fade-up').forEach(el=>el.classList.add('vis'))},40);
}

/* REVIEW RENDERING */
function reviewCardHTML(r,cls='rev-card-white'){
  return`<div class="${cls} fade-up">
    <div class="rev-quote-mark">"</div>
    <p class="rev-text-white">${esc(r.text)}</p>
    <div class="rev-foot-white">
      <div class="rev-author-white">
        <div class="rev-av-white" style="background:${r.avc};color:${r.avt}">${r.initials}</div>
        <div><div class="rev-name-white">${esc(r.name)}</div><div class="rev-role-white">${esc(r.role||'Client')}</div></div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:.3rem">
        <div class="rev-stars-white">${'<span>★</span>'.repeat(r.stars)}</div>
        <span class="rev-svc-badge">${esc(r.service)}</span>
      </div>
    </div>
  </div>`;
}

function renderRevPreview(){
  const approved=reviews.filter(r=>r.status==='approved');
  const total=approved.length;
  const avg=total?Math.round(approved.reduce((s,r)=>s+r.stars,0)/total*10)/10:4.9;
  document.getElementById('sec-avg-rating').textContent=avg;
  document.getElementById('sec-rev-count').textContent=`Based on ${total} review${total!==1?'s':''}`;
  document.getElementById('hp-rat').textContent=avg;
  const grid=document.getElementById('revPreviewGrid');
  const strip=document.getElementById('revPreviewStrip');
  if(!total){
    grid.innerHTML=`<div class="rev-no-public"><div style="font-size:2rem;margin-bottom:.5rem">💬</div><h3>No reviews yet</h3><p>Click "View All Reviews" to be the first!</p></div>`;
    strip.classList.remove('has-more');return;
  }
  const preview=approved.slice(0,3);
  grid.innerHTML=preview.map(r=>reviewCardHTML(r)).join('');
  strip.classList.toggle('has-more',approved.length>3);
  document.getElementById('rev-section-label').textContent=`Recent Reviews${approved.length>3?` (Showing 3 of ${approved.length})`:` (${approved.length})`}`;
  setTimeout(()=>{document.querySelectorAll('#revPreviewGrid .fade-up').forEach(el=>el.classList.add('vis'))},40);
}

function renderAllReviews(){
  const approved=reviews.filter(r=>r.status==='approved');
  const total=approved.length;
  const avg=total?Math.round(approved.reduce((s,r)=>s+r.stars,0)/total*10)/10:4.9;
  document.getElementById('rp-avg').textContent=avg;
  document.getElementById('rp-cnt').textContent=`Based on ${total} review${total!==1?'s':''}`;
  const grid=document.getElementById('rpAllReviews');
  if(!total){
    grid.innerHTML=`<div class="rp-empty"><div style="font-size:2rem;margin-bottom:.5rem">💬</div><h3>No published reviews yet</h3><p>Be the first to share your experience below!</p></div>`;
    return;
  }
  grid.innerHTML=approved.map(r=>reviewCardHTML(r)).join('');
  setTimeout(()=>{document.querySelectorAll('#rpAllReviews .fade-up').forEach(el=>el.classList.add('vis'))},40);
}
function renderAdmRevTable(){
  const tbody=document.getElementById('adm-rev-tbody');
  const empty=document.getElementById('adm-rev-empty');
  if(!reviews.length){tbody.innerHTML='';empty.style.display='block';return;}
  empty.style.display='none';
  tbody.innerHTML=reviews.map((r,i)=>`
    <tr>
      <td style="font-weight:600">${esc(r.name)}</td>
      <td style="color:var(--gold)">${'★'.repeat(r.stars)}</td>
      <td><span class="stag tb" style="font-size:.68rem">${r.service}</span></td>
      <td style="max-width:180px;color:var(--ts);font-size:.8rem;font-style:italic">"${esc(r.text.slice(0,55))}${r.text.length>55?'…':''}"</td>
      <td>${r.status==='approved'?
        '<span class="proj-badge bdone" style="position:static;display:inline-flex;font-size:.68rem">✅ Published</span>':
        '<span class="proj-badge bdemo" style="position:static;display:inline-flex;font-size:.68rem">⏳ Pending</span>'}</td>
      <td><div class="acts">
        ${r.status==='pending'?`<button class="btn-approve" onclick="approveRev(${i})">Approve</button>`:`<button class="btn-e" onclick="unpubRev(${i})">Unpublish</button>`}
        <button class="btn-e" onclick="editRev(${i})">Edit</button>
        <button class="btn-d" onclick="deleteRev(${i})">Delete</button>
      </div></td>
    </tr>`).join('');
}

/* REVIEW ACTIONS */
function setRating(v){selectedRating=v;document.querySelectorAll('.sp-star').forEach((s,i)=>s.classList.toggle('lit',i<v));}
async function submitReview(){
  const name=document.getElementById('rv-name').value.trim();
  const role=document.getElementById('rv-role').value.trim();
  const svc=document.getElementById('rv-svc').value;
  const text=document.getElementById('rv-text').value.trim();
  if(!name||!svc||!text){showToast('Fill in all required fields','err');return;}
  if(selectedRating===0){showToast('Please select a star rating','err');return;}
  const initials=name.split(' ').map(w=>w[0]||'').join('').toUpperCase().slice(0,2)||'??';
  const cols=[['#1E40AF','#93C5FD'],['#065F46','#6EE7B7'],['#7C3AED','#C4B5FD'],['#9D174D','#F9A8D4'],['#92400E','#FCD34D'],['#1E3A5F','#BAE6FD']];
  const ci=reviews.length%cols.length;
  const rev={id:Date.now()+'',name,role,service:svc,stars:selectedRating,text,initials,avc:cols[ci][0],avt:cols[ci][1],status:'pending',date:new Date().toLocaleDateString()};
  reviews.push(rev);await persistRevs();
  renderAllReviews();renderRevPreview();renderAdmRevTable();updateAdmStats();
  document.getElementById('rv-name').value='';document.getElementById('rv-role').value='';
  document.getElementById('rv-svc').value='';document.getElementById('rv-text').value='';
  selectedRating=0;document.querySelectorAll('.sp-star').forEach(s=>s.classList.remove('lit'));
  document.getElementById('rv-ok').classList.add('show');
  setTimeout(()=>document.getElementById('rv-ok').classList.remove('show'),5000);
  showToast('Review submitted! Pending approval.','ok');
}
async function approveRev(i){reviews[i].status='approved';await persistRevs();renderAllReviews();renderRevPreview();renderAdmRevTable();updateAdmStats();showToast('Review published!','ok');}
async function unpubRev(i){reviews[i].status='pending';await persistRevs();renderAllReviews();renderRevPreview();renderAdmRevTable();updateAdmStats();showToast('Review unpublished','ok');}
async function deleteRev(i){if(!confirm('Delete this review?'))return;reviews.splice(i,1);await persistRevs();renderAllReviews();renderRevPreview();renderAdmRevTable();updateAdmStats();showToast('Deleted','ok');}
function editRev(i){const t=prompt('Edit review text:',reviews[i].text);if(t===null)return;reviews[i].text=t.trim()||reviews[i].text;persistRevs();renderAllReviews();renderRevPreview();renderAdmRevTable();showToast('Review updated','ok');}

/* ADMIN */
function openAdm(){document.getElementById('adm').classList.add('open');document.body.style.overflow='hidden';}
function closeAdm(){document.getElementById('adm').classList.remove('open');document.body.style.overflow='';}
function doLogin(){
  if(document.getElementById('adm-u').value.trim()===CREDS.u&&document.getElementById('adm-p').value===CREDS.p){
    document.getElementById('adm-login').style.display='none';document.getElementById('adm-dash').style.display='block';
    document.getElementById('adm-err').classList.remove('show');renderAdmTable();renderAdmRevTable();updateAdmStats();
  }else{document.getElementById('adm-err').classList.add('show');}
}
function doLogout(){document.getElementById('adm-login').style.display='flex';document.getElementById('adm-dash').style.display='none';document.getElementById('adm-u').value='';document.getElementById('adm-p').value='';}
function updateAdmStats(){
  document.getElementById('as-all').textContent=projects.length;
  document.getElementById('as-demo').textContent=projects.filter(p=>p.type==='demo').length;
  document.getElementById('as-done').textContent=projects.filter(p=>p.type==='done').length;
  document.getElementById('as-rev-pend').textContent=reviews.filter(r=>r.status==='pending').length;
  document.getElementById('as-rev-app').textContent=reviews.filter(r=>r.status==='approved').length;
}
function switchAdmTab(name,btn){
  document.querySelectorAll('.adm-tab').forEach(t=>t.classList.remove('active'));btn.classList.add('active');
  ['projects','reviews','media','logo'].forEach(t=>{document.getElementById('tab-'+t).style.display=t===name?'block':'none';});
}
function renderAdmTable(){
  const tbody=document.getElementById('adm-tbody');const empty=document.getElementById('adm-proj-empty');
  if(!projects.length){tbody.innerHTML='';empty.style.display='block';return;}
  empty.style.display='none';
  tbody.innerHTML=projects.map((p,i)=>`
    <tr>
      <td>${p.image?`<img src="${p.image}" class="t-thumb"/>`:
      `<div class="t-thumb-ph">—</div>`}</td>
      <td style="font-weight:600;max-width:160px">${esc(p.title)}</td>
      <td><span class="stag tb">${p.category||'—'}</span></td>
      <td><span class="proj-badge ${p.type==='done'?'bdone':'bdemo'}" style="position:static;display:inline-flex;font-size:.68rem">${p.type==='done'?'✅':'🟡'} ${p.type==='done'?'Done':'Demo'}</span></td>
      <td>${p.link?`<a href="${p.link}" target="_blank" style="color:var(--blue);font-size:.8rem">↗</a>`:'—'}</td>
      <td><div class="acts"><button class="btn-e" onclick="editProj(${i})">Edit</button><button class="btn-d" onclick="delProj(${i})">Delete</button></div></td>
    </tr>`).join('');
}

/* MODAL */
function setType(t){projType=t;document.getElementById('pill-demo').className='tpill'+(t==='demo'?' ad':'');document.getElementById('pill-done').className='tpill'+(t==='done'?' ak':'');}
function openAddModal(){editIdx=null;imgData=null;projType='demo';document.getElementById('pModal-title').textContent='Add Project';['m-title','m-desc','m-link'].forEach(id=>document.getElementById(id).value='');document.getElementById('m-cat').value='';document.getElementById('img-drop').innerHTML=`<div id="img-ph"><div style="font-size:1.4rem">🖼</div><div>Click to upload</div></div>`;document.getElementById('img-file').value='';setType('demo');document.getElementById('pModal').classList.add('open');}
function editProj(i){const p=projects[i];editIdx=i;imgData=p.image||null;projType=p.type||'demo';document.getElementById('pModal-title').textContent='Edit Project';document.getElementById('m-title').value=p.title||'';document.getElementById('m-cat').value=p.category||'';document.getElementById('m-desc').value=p.desc||'';document.getElementById('m-link').value=p.link||'';document.getElementById('img-drop').innerHTML=p.image?`<img src="${p.image}" style="width:100%;height:100%;object-fit:cover"/>`:
`<div id="img-ph"><div style="font-size:1.4rem">🖼</div><div>Click to change</div></div>`;document.getElementById('img-file').value='';setType(projType);document.getElementById('pModal').classList.add('open');}
function closeModal(){document.getElementById('pModal').classList.remove('open');}
function previewImg(input){const file=input.files[0];if(!file)return;if(file.size>4*1024*1024){showToast('Image too large','err');return;}const r=new FileReader();r.onload=e=>{imgData=e.target.result;document.getElementById('img-drop').innerHTML=`<img src="${imgData}" style="width:100%;height:100%;object-fit:cover"/>`;};r.readAsDataURL(file);}
async function saveProject(){
  const title=document.getElementById('m-title').value.trim();const cat=document.getElementById('m-cat').value;const desc=document.getElementById('m-desc').value.trim();const link=document.getElementById('m-link').value.trim();
  if(!title||!cat||!desc){showToast('Fill required fields','err');return;}
  const proj={id:Date.now()+'',title,category:cat,type:projType,desc,link,image:imgData||null};
  if(editIdx!==null)projects[editIdx]=proj;else projects.unshift(proj);
  await persistProj();renderAll();closeModal();showToast(editIdx!==null?'Updated':'Added','ok');
}
async function delProj(i){if(!confirm('Delete?'))return;projects.splice(i,1);await persistProj();renderAll();showToast('Deleted','ok');}

/* REVIEW PAGE */
function openReviewPage(){document.getElementById('review-page').style.display='block';document.body.style.overflow='hidden';renderAllReviews();}
function closeReviewPage(){document.getElementById('review-page').style.display='none';document.body.style.overflow='';}

/* CONTACT */
function sendContact(){
  const fn=document.getElementById('c-fn').value.trim();const em=document.getElementById('c-em').value.trim();const msg=document.getElementById('c-msg').value.trim();
  if(!fn||!em||!msg){showToast('Fill required fields','err');return;}
  document.getElementById('c-ok').classList.add('show');
  ['c-fn','c-ln','c-em','c-msg'].forEach(id=>document.getElementById(id).value='');document.getElementById('c-sv').value='';
  setTimeout(()=>document.getElementById('c-ok').classList.remove('show'),5000);
}

/* UTILS */
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function showToast(msg,type='ok'){const t=document.getElementById('toast');t.textContent=(type==='ok'?'✓  ':' ✕  ')+msg;t.className='toast '+(type==='ok'?'ok':'err')+' up';setTimeout(()=>t.className='toast',3200);}
function toggleMob(){document.getElementById('mobMenu').classList.toggle('open');}
function closeMob(){document.getElementById('mobMenu').classList.remove('open');}

const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('vis');});},{threshold:0.08});
document.querySelectorAll('.fade-up').forEach(el=>io.observe(el));
window.addEventListener('scroll',()=>{document.getElementById('nav').style.background=window.scrollY>30?'rgba(10,37,64,.99)':'rgba(10,37,64,.95)';});
load();
