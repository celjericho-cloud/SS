const enc=new TextEncoder();
const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...extra}});
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
async function digest(s){return hex(await crypto.subtle.digest('SHA-256',enc.encode(s)));}
async function sign(s,secret){const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,enc.encode(s)));}
function equal(a,b){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
async function authenticated(req,env){const token=req.headers.get('Cookie')?.match(/(?:^|;\s*)mark_editor=([^;]+)/)?.[1]||'';const [expiry,nonce,mac]=token.split('.');if(!/^\d+$/.test(expiry)||+expiry<Date.now()||+expiry>Date.now()+28800000||!nonce||!mac)return false;return equal(mac,await sign(expiry+'.'+nonce,env.SESSION_SECRET));}
function parseData(source){if(!source.startsWith('window.STUDY = '))throw Error('The repository data.js format is not supported.');return JSON.parse(source.slice(15).trim().replace(/;$/,''));}
function validate(data){
 if(!data||!Array.isArray(data.lessons)||data.lessons.length<1||data.lessons.length>200||!data.verses||typeof data.verses!=='object'||Array.isArray(data.verses))throw Error('Invalid study data.');
 const str=(v,max=20000)=>{if(typeof v!=='string'||v.length>max)throw Error('A text field is invalid or too long.');};
 const ids=new Set();for(const [k,v] of Object.entries(data.verses)){str(k,100);str(v,5000);}
 for(const l of data.lessons){for(const key of ['id','title','passage','pages','summary','context'])str(l[key]);if(!/^[a-z0-9-]+$/.test(l.id)||ids.has(l.id))throw Error('Lesson IDs must be unique.');ids.add(l.id);
 if(!l.title.trim()||!Array.isArray(l.scripture)||!Array.isArray(l.refs)||!Array.isArray(l.points)||!Array.isArray(l.teachingBlocks))throw Error('A lesson is incomplete.');
 if(l.teachingBlocks.length>2000||l.points.length>1000)throw Error('Too many lesson sections.');
 for(const ref of l.scripture)if(!Object.hasOwn(data.verses,ref))throw Error('Missing Scripture text: '+ref);
 for(const ref of l.refs){str(ref,100);const m=ref.match(/^(.*) (\d+):(\d+)(?:-(\d+))?$/);if(!m||+(m[4]||m[3])<+m[3]||+(m[4]||m[3])-m[3]>200)throw Error('Invalid cross-reference: '+ref);for(let v=+m[3];v<=+(m[4]||m[3]);v++)if(!Object.hasOwn(data.verses,`${m[1]} ${m[2]}:${v}`))throw Error('Cross-reference text is not bundled: '+ref);}
 for(const b of l.teachingBlocks){if(!['heading','paragraph','bullet','question','application'].includes(b.type))throw Error('Invalid teaching section.');str(b.text);if(b.type==='heading'&&b.level!==undefined&&![3,4].includes(b.level))throw Error('Invalid heading level.');}
 for(const p of l.points){if(!['insight','application'].includes(p.kind))throw Error('Invalid note type.');str(p.title);str(p.text);if(!Array.isArray(p.verses)||!p.verses.length)throw Error('Each connection needs a verse.');for(const r of p.verses)if(!l.scripture.includes(r))throw Error('Connection verse is not displayed: '+r);}
 l.manuscript=l.teachingBlocks.map(b=>b.text);
 }
 return data;
}
const from64=s=>new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g,'')),c=>c.charCodeAt(0)));
function to64(s){const bytes=enc.encode(s);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary);}
async function github(env,method='GET',body){const url=`https://api.github.com/repos/${encodeURIComponent(env.GITHUB_OWNER)}/${encodeURIComponent(env.GITHUB_REPO)}/contents/${env.DATA_PATH.split('/').map(encodeURIComponent).join('/')}${method==='GET'?'?ref='+encodeURIComponent(env.GITHUB_BRANCH):''}`;return fetch(url,{method,headers:{Authorization:'Bearer '+env.GITHUB_TOKEN,Accept:'application/vnd.github+json','User-Agent':'Mark-Lesson-Editor','X-GitHub-Api-Version':'2022-11-28'},...(body?{body:JSON.stringify(body)}:{})});}
export default {async fetch(req,env){
 const url=new URL(req.url);
 if(!url.pathname.startsWith('/api/'))return env.ASSETS.fetch(req);
 if(!env.ADMIN_PASSWORD||env.ADMIN_PASSWORD.length<16||!env.SESSION_SECRET||env.SESSION_SECRET.length<32||!env.GITHUB_TOKEN)return json({error:'The backend still needs its private credentials configured.'},503);
 if(req.method==='POST'&&req.headers.get('Origin')!==url.origin)return json({error:'This request must come from the editor.'},403);
 try{
 if(url.pathname==='/api/login'&&req.method==='POST'){
  if(!env.LOGIN_LIMITER)return json({error:'Login protection is not configured.'},503);
  if(!(await env.LOGIN_LIMITER.limit({key:req.headers.get('CF-Connecting-IP')||'unknown'})).success)return json({error:'Too many attempts. Please try again in a minute.'},429);
  const raw=await req.text();if(raw.length>1000)return json({error:'Invalid password.'},400);
  const {password}=JSON.parse(raw);if(typeof password!=='string'||!equal(await digest(password),await digest(env.ADMIN_PASSWORD)))return json({error:'Incorrect password.'},401);
  const payload=(Date.now()+28800000)+'.'+crypto.randomUUID();const token=payload+'.'+await sign(payload,env.SESSION_SECRET);
  return json({ok:true},200,{'Set-Cookie':`mark_editor=${token}; HttpOnly; Secure; SameSite=Strict; Path=/api/; Max-Age=28800`});
 }
 if(!await authenticated(req,env))return json({error:'Please sign in to the editor.'},401);
 if(url.pathname==='/api/logout'&&req.method==='POST')return json({ok:true},200,{'Set-Cookie':'mark_editor=; HttpOnly; Secure; SameSite=Strict; Path=/api/; Max-Age=0'});
 if(url.pathname==='/api/study'&&req.method==='GET'){
  const r=await github(env);if(!r.ok)return json({error:'Cannot read the GitHub lesson file. Check the repository, branch, data path, and token permissions.'},502);const file=await r.json();return json({data:parseData(from64(file.content)),sha:file.sha,repository:env.GITHUB_OWNER+'/'+env.GITHUB_REPO,branch:env.GITHUB_BRANCH});
 }
 if(url.pathname==='/api/study'&&req.method==='POST'){
  const raw=await req.text();if(enc.encode(raw).length>2000000)return json({error:'The study is too large.'},413);
  const {data,sha}=JSON.parse(raw);if(!/^[a-f0-9]{40}$/.test(sha||''))return json({error:'Reload the repository before publishing.'},400);
  validate(data);
  // Read current revision to prevent accidental overwrites from stale editors.
  const latest=await github(env);if(!latest.ok)return json({error:'Could not check the current repository revision.'},502);const file=await latest.json();if(file.sha!==sha)return json({error:'Someone has changed the repository since you opened it. Download your draft, then reload the repository before merging your changes.'},409);
  const r=await github(env,'PUT',{message:'Update Sunday school lessons through visual editor',branch:env.GITHUB_BRANCH,sha,content:to64('window.STUDY = '+JSON.stringify(data,null,2)+';\n')});
  if(!r.ok)return json({error:r.status===409?'The repository changed during publishing. Reload and try again.':'GitHub could not save the changes. Check write access and branch protection.'},r.status===409?409:502);
  const saved=await r.json();return json({ok:true,sha:saved.content.sha,commit:saved.commit.html_url});
 }
 return json({error:'Not found.'},404);
 }catch(e){return json({error:e instanceof SyntaxError?'The data could not be read.':e.message||'Unable to complete the request.'},400);}
}};
export {validate,parseData};
