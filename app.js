(()=>{
'use strict';
const {lessons,verses}=window.STUDY;
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const storage={get(k){try{return localStorage.getItem('mark-study-'+k)}catch{return null}},set(k,v){try{localStorage.setItem('mark-study-'+k,v)}catch{}}};
let current,selected=null,hover=null,kind='all',reading=false,size=+(storage.get('size')||19);
if(![17,19,21,23].includes(size))size=19;
if(storage.get('theme')==='dark')document.body.classList.add('dark');
document.documentElement.style.setProperty('--script-size',size+'px');
function refsLabel(list){
 const groups=[];
 for(const ref of list){const m=ref.match(/^(.*) (\d+):(\d+)$/),prefix=m[1]+' '+m[2],n=+m[3],last=groups[groups.length-1];if(last&&last.prefix===prefix&&last.end===n-1)last.end=n;else groups.push({prefix,start:n,end:n});}
 return groups.map(g=>`${g.prefix}:${g.start}${g.end!==g.start?'–'+g.end:''}`).join('; ');
}
function expand(ref){const m=ref.match(/^(.*) (\d+):(\d+)(?:-(\d+))?$/),a=[];for(let i=+m[3];i<=+(m[4]||m[3]);i++)a.push(`${m[1]} ${m[2]}:${i}`);return a;}
function navigation(){
 const q=$('#search').value.trim().toLowerCase(),ch=$('#chapter').value;
 let group='',count=0,html='';
 lessons.forEach((l,i)=>{
  const chapters=l.scripture.filter(v=>v.startsWith('Mark ')).map(v=>v.split(' ')[1].split(':')[0]);
  if(ch!=='all'&&(ch==='overview'?l.id!=='overview':l.id==='overview'||!chapters.includes(ch)))return;
  const hay=[l.title,l.passage,l.summary,l.context,...l.refs,...(l.manuscript||[]),...l.scripture,...l.scripture.map(r=>verses[r]),...l.points.map(p=>p.title+' '+p.text)].join(' ').toLowerCase();
  if(q&&!hay.includes(q))return;
  const g=l.id==='overview'?'START HERE':'MARK '+l.passage.split(' ')[1].split(':')[0];
  if(g!==group){html+=`<p class="group">${g}</p>`;group=g;}
  html+=`<a class="nav-lesson" href="#${l.id}" ${current?.id===l.id?'aria-current="page"':''}><span class="number">${String(i+1).padStart(2,'0')}</span><span><strong>${esc(l.title)}</strong><small>${esc(l.passage)}</small></span></a>`;count++;
 });
 $('#lessonNav').innerHTML=html;$('#libraryCount').textContent=count;$('#noResults').hidden=count!==0;
}
function card(p,i){return `<section class="point-card ${p.kind}" data-point="${i}" aria-label="${esc(p.kind+': '+p.title)}"><button class="point-select" data-select="${i}" aria-pressed="false" aria-label="Highlight Scripture for ${esc(p.title)}"><span class="point-top"><span class="kind">${p.kind==='application'?'↗ Application':'✦ Teaching insight'}</span><span class="verse-link">${esc(refsLabel(p.verses))} ↔</span></span><span class="point-title">${esc(p.title)}</span></button><p class="point-body" id="point-body-${i}">${esc(p.text)}</p><div class="point-bottom"><button class="show-verses" data-select="${i}">Show connected verses ↗</button><button class="collapse" data-collapse="${i}" aria-expanded="true" aria-controls="point-body-${i}">Collapse −</button></div></section>`;}
function manuscript(l){
 const blocks=l.teachingBlocks||[];let html='',list=false;
 const closeList=()=>{if(list){html+='</ul>';list=false;}};
 for(const block of blocks){
  const text=esc(block.text);
  if(block.type==='bullet'){if(!list){html+='<ul class="teaching-list">';list=true;}html+=`<li>${text}</li>`;continue;}
  closeList();
  if(block.type==='heading'){const tag=block.level===4?'h4':'h3';html+=`<${tag}>${text}</${tag}>`;}
  else if(block.type==='application')html+=`<aside class="manuscript-application"><span class="block-label">APPLICATION</span><p>${text}</p></aside>`;
  else if(block.type==='question')html+=`<aside class="teaching-prompt"><span class="block-label">CLASS DISCUSSION / TEACHER PROMPT</span><p>${text}</p></aside>`;
  else html+=`<p>${text}</p>`;
 }
 closeList();
 const words=l.manuscript.join(' ').split(/\s+/).length;
 return `<section id="teachingNotes" class="teacher-manuscript" aria-label="Expanded teaching notes"><div class="teacher-heading"><span class="eyebrow">TEACHER’S EDITION</span><span>${words} words · teaching outline</span></div><h2>Teaching notes</h2><p class="manuscript-intro">Follow the lesson in order. Explanations, discussion prompts, and applications are arranged for teaching.</p>${html}</section><div id="verseConnections" class="connections-heading"><span class="eyebrow">QUICK REFERENCE</span><h2>Verse connections</h2><p>Use these concise connections to locate the supporting Scripture for the teaching above.</p></div>`;
}
function render(){
 let id=decodeURIComponent(location.hash.slice(1)).split('/')[0];
 current=lessons.find(l=>l.id===id)||lessons[0];selected=null;hover=null;kind='all';
 document.title=current.title+' · The Gospel of Mark';
 let lastBook='',scripture='';
 current.scripture.forEach(ref=>{const book=ref.split(':')[0];if(book!==lastBook){scripture+=`<p class="verse-heading">${esc(book)}</p>`;lastBook=book;}
 scripture+=`<button class="verse" data-verse="${esc(ref)}" aria-pressed="false" aria-label="${esc(ref)}: ${esc(verses[ref])}. Show related teaching."><span class="vnum" aria-hidden="true">${ref.split(':')[1]}</span>${esc(verses[ref])}</button>`;});
 const idx=lessons.indexOf(current);
 $('#lesson').innerHTML=`<div class="lesson-meta"><span class="passage-pill">${esc(current.passage)}</span><span class="lesson-counter">LESSON ${String(idx+1).padStart(2,'0')} / ${lessons.length}</span></div><h1>${esc(current.title)}</h1><p class="lesson-intro">${esc(current.summary)}</p><nav class="teacher-jumps" aria-label="Within this lesson"><a href="#teachingNotes">Teaching notes ↓</a><a href="#verseConnections">Verse connections ↓</a><a href="#scriptureReference">Scripture ↓</a></nav><div class="lesson-tools"><span class="source-note">From the teaching notes · PDF pp. ${current.pages}</span><div class="reader-tools"><button id="readingMode" aria-pressed="${reading}">${reading?'Show study notes':'Scripture only'}</button><button id="smaller" aria-label="Decrease Scripture text size">A−</button><button id="larger" aria-label="Increase Scripture text size">A+</button></div></div><details class="context"><summary>BACKGROUND & CONTEXT</summary><p>${esc(current.context)}</p></details><p class="connection-help"><span aria-hidden="true">↔</span>Teach from the expanded notes below. Scripture is alongside for reference; the verse connections link teaching points to the text.</p><div class="study-grid"><section id="scriptureReference" class="scripture-column" aria-label="Scripture"><div class="column-head"><h2>Scripture reference</h2><span class="label">KING JAMES VERSION</span></div><div class="scripture-panel"><div class="scripture-heading"><span>${esc(current.passage)}</span><span>KJV</span></div>${scripture}</div></section><section class="study-notes" aria-label="Teaching notes"><div class="column-head"><h2>Lesson & teaching</h2><span class="label">${current.points.length} CONNECTIONS</span></div>${manuscript(current)}<div class="filters" aria-label="Filter teaching notes"><button data-kind="all" aria-pressed="true">All notes</button><button data-kind="insight" aria-pressed="false">Insights</button><button data-kind="application" aria-pressed="false">Applications</button></div><div class="selection-status" role="status" aria-live="polite"><span id="selectionLabel">Each note is rooted in the text.</span><button id="clearSelection" hidden>Clear selection</button></div><div id="points">${current.points.map(card).join('')}</div><section class="xref"><h3>Scripture with Scripture</h3><p class="source-note">Cross-references from this lesson · tap to read</p>${current.refs.map(ref=>`<details><summary>${esc(ref)}</summary><blockquote>${expand(ref).map(r=>`<sup>${r.split(':')[1]}</sup>${esc(verses[r])}`).join(' ')}</blockquote></details>`).join('')}</section></section></div><nav class="lesson-pager" aria-label="Previous and next lessons">${idx>0?`<a href="#${lessons[idx-1].id}"><small>← PREVIOUS LESSON</small>${esc(lessons[idx-1].title)}</a>`:''}${idx<lessons.length-1?`<a href="#${lessons[idx+1].id}"><small>NEXT LESSON →</small>${esc(lessons[idx+1].title)}</a>`:''}</nav>`;
 $('#lesson').classList.toggle('reading',reading);
 bindLesson();navigation();sizeButtons();
 document.querySelectorAll('.teacher-jumps a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();document.querySelector(a.getAttribute('href'))?.scrollIntoView({block:'start',behavior:'smooth'});}));
 $('#sidebar').classList.remove('open');$('#navToggle').setAttribute('aria-expanded','false');
}
function activeRefs(state){return !state?[]:state.type==='point'?current.points[state.index].verses:[state.ref];}
function paint(){
 const state=hover||selected,refs=activeRefs(state),matches=[];
 current.points.forEach((p,i)=>{if(refs.some(r=>p.verses.includes(r)))matches.push(i);});
 const allRefs=state?.type==='verse'?[state.ref]:refs;
 document.querySelectorAll('.verse').forEach(el=>{const hit=allRefs.includes(el.dataset.verse);el.classList.toggle('connected',hit);el.classList.toggle('pinned',hit&&!!selected&&!hover);el.setAttribute('aria-pressed',String(!!selected&&activeRefs(selected).includes(el.dataset.verse)));});
 document.querySelectorAll('.point-card').forEach(el=>{const i=+el.dataset.point,hit=matches.includes(i);el.classList.toggle('related',hit);const filtered=kind!=='all'&&current.points[i].kind!==kind;el.hidden=filtered||(selected?.type==='verse'&&!hover&&!hit);el.querySelector('.point-select').setAttribute('aria-pressed',String(selected?.type==='point'&&selected.index===i));});
 const clear=$('#clearSelection');clear.hidden=!selected;
 if(selected?.type==='verse')$('#selectionLabel').textContent=`${selected.ref} · ${matches.length} related ${matches.length===1?'note':'notes'}${matches.length?'':'. No direct note for this verse.'}`;
 else if(selected?.type==='point')$('#selectionLabel').textContent='Connected Scripture: '+refsLabel(current.points[selected.index].verses);
 else $('#selectionLabel').textContent='Each note is rooted in the text.';
}
function choose(state){
 const same=JSON.stringify(selected)===JSON.stringify(state);selected=same?null:state;hover=null;
 if(state.type==='verse'){kind='all';updateFilters();}
 paint();
 if(!selected)return;
 if(state.type==='point'){
  const el=[...document.querySelectorAll('.verse')].find(e=>e.dataset.verse===current.points[state.index].verses[0]);
  el?.scrollIntoView({block:'nearest',behavior:'smooth'});
 }else{
  const first=document.querySelector('.point-card:not([hidden])');
  document.querySelectorAll('.point-card:not([hidden])').forEach(card=>{card.querySelector('.point-body').hidden=false;const b=card.querySelector('.collapse');b.setAttribute('aria-expanded','true');b.textContent='Collapse −';});
  if(first&&window.matchMedia('(min-width:601px)').matches)first.scrollIntoView({block:'nearest',behavior:'smooth'});
  if(window.matchMedia('(max-width:600px)').matches&&!reading){(first||$('.connections-heading')).scrollIntoView({block:'start',behavior:'smooth'});$('#clearSelection').focus({preventScroll:true});}
 }
}
function updateFilters(){document.querySelectorAll('[data-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kind===kind)));}
function bindLesson(){
 document.querySelectorAll('[data-select]').forEach(b=>{const state={type:'point',index:+b.dataset.select};b.addEventListener('click',()=>choose(state));b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hover=state;paint();}});b.addEventListener('pointerleave',()=>{hover=null;paint();});b.addEventListener('focus',()=>{hover=state;paint();});b.addEventListener('blur',()=>{hover=null;paint();});});
 document.querySelectorAll('.verse').forEach(b=>{const state={type:'verse',ref:b.dataset.verse};b.addEventListener('click',()=>choose(state));b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hover=state;paint();}});b.addEventListener('pointerleave',()=>{hover=null;paint();});b.addEventListener('focus',()=>{hover=state;paint();});b.addEventListener('blur',()=>{hover=null;paint();});});
 document.querySelectorAll('[data-kind]').forEach(b=>b.addEventListener('click',()=>{kind=b.dataset.kind;selected=null;hover=null;updateFilters();paint();}));
 document.querySelectorAll('[data-collapse]').forEach(b=>b.addEventListener('click',()=>{const p=$('#point-body-'+b.dataset.collapse);p.hidden=!p.hidden;b.setAttribute('aria-expanded',String(!p.hidden));b.textContent=p.hidden?'Expand +':'Collapse −';}));
 $('#clearSelection').addEventListener('click',()=>{selected=null;hover=null;paint();});
 $('#readingMode').addEventListener('click',()=>{reading=!reading;$('#lesson').classList.toggle('reading',reading);$('#readingMode').setAttribute('aria-pressed',String(reading));$('#readingMode').textContent=reading?'Show study notes':'Scripture only';});
 $('#smaller').addEventListener('click',()=>changeSize(-2));$('#larger').addEventListener('click',()=>changeSize(2));
}
function sizeButtons(){$('#smaller').disabled=size<=17;$('#larger').disabled=size>=23;}
function changeSize(delta){size=Math.max(17,Math.min(23,size+delta));document.documentElement.style.setProperty('--script-size',size+'px');storage.set('size',size);sizeButtons();}
$('#lessonNav').addEventListener('click',e=>{if(e.target.closest('a')){$('#sidebar').classList.remove('open');$('#navToggle').setAttribute('aria-expanded','false');}});
$('#search').addEventListener('input',navigation);$('#chapter').addEventListener('change',navigation);
$('#navToggle').addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('open');$('#navToggle').setAttribute('aria-expanded',String(open));if(open)$('#search').focus();});
$('#theme').addEventListener('click',()=>{document.body.classList.toggle('dark');storage.set('theme',document.body.classList.contains('dark')?'dark':'light');});
$('#print').addEventListener('click',()=>window.print());
const dialog=$('#aboutDialog');$('#about').addEventListener('click',()=>dialog.showModal());$('.close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
window.addEventListener('hashchange',()=>{if(['#teachingNotes','#verseConnections','#scriptureReference'].includes(location.hash))return;render();$('#lesson').scrollIntoView({block:'start'});$('#lesson').focus({preventScroll:true});});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!dialog.open){e.preventDefault();if(innerWidth<=850){$('#sidebar').classList.add('open');$('#navToggle').setAttribute('aria-expanded','true');}$('#search').focus();}if(e.key==='Escape'){selected=null;hover=null;paint();$('#sidebar').classList.remove('open');$('#navToggle').setAttribute('aria-expanded','false');}});
// Printed lessons include all collapsed content and cross-references.
let printState;
window.addEventListener('beforeprint',()=>{printState={details:[...document.querySelectorAll('#lesson details')].map(d=>[d,d.open]),bodies:[...document.querySelectorAll('.point-body')].map(p=>[p,p.hidden])};printState.details.forEach(([d])=>d.open=true);printState.bodies.forEach(([p])=>p.hidden=false);});
window.addEventListener('afterprint',()=>{printState?.details.forEach(([d,o])=>d.open=o);printState?.bodies.forEach(([p,h])=>p.hidden=h);});
render();
})();
