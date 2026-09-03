const $=id=>document.getElementById(id);
const F=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(Number(n)||0);
const PCT=n=>(Number.isFinite(Number(n))?Number(n):0).toFixed(1)+'%';
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const D=window.GL_STATE_DATA||{p:[],z:[],st:[],mo:[],m:[],mon:[],c:[]};
const selectedProducts=new Set(),selectedZones=new Set(),selectedStates=new Set();

const M=(D.m||[]).map(r=>({y:2025+r[0],b:D.p[r[1]],z:D.z[r[2]],st:D.st[r[3]],s:r[4],o:r[5],r:r[6],e:r[7],q:r[8],n:r[9]}));
const MON=(D.mon||[]).map(r=>({y:2025+r[0],mo:D.mo[r[1]],b:D.p[r[2]],z:D.z[r[3]],st:D.st[r[4]],s:r[5]}));
const CR=(D.c||[]).map(r=>({b:D.p[r[0]],z:D.z[r[1]],st:D.st[r[2]],acct:r[3],name:r[4],s25:r[5],s26:r[6]}));

function makeMulti(id,values,allLabel,state){
  const select=$(id);if(!select)return;
  select.disabled=false;select.style.display='none';
  const old=select.parentNode.querySelector('.multiSelect');if(old)old.remove();
  const wrap=document.createElement('div');wrap.className='multiSelect';
  wrap.innerHTML=`<button type="button" class="multiBtn"><span>${allLabel}</span><b>⌄</b></button><div class="multiMenu"><div class="multiActions"><button type="button" data-act="all">Select All</button><button type="button" data-act="clear">Clear</button></div><div class="multiList">${values.map(v=>`<label><input type="checkbox" value="${E(v)}"><span>${E(v)}</span></label>`).join('')}</div></div>`;
  select.parentNode.appendChild(wrap);
  const btn=wrap.querySelector('.multiBtn'),menu=wrap.querySelector('.multiMenu'),label=btn.querySelector('span');
  const sync=()=>{wrap.querySelectorAll('input[type=checkbox]').forEach(c=>c.checked=state.has(c.value));label.textContent=state.size===0?allLabel:(state.size===1?[...state][0]:`${state.size} selected`)};
  btn.onclick=e=>{e.stopPropagation();document.querySelectorAll('.multiSelect.open').forEach(x=>{if(x!==wrap)x.classList.remove('open')});wrap.classList.toggle('open')};
  menu.onclick=e=>e.stopPropagation();
  wrap.querySelectorAll('input[type=checkbox]').forEach(c=>c.onchange=()=>{c.checked?state.add(c.value):state.delete(c.value);sync();render()});
  wrap.querySelector('[data-act=all]').onclick=()=>{values.forEach(v=>state.add(v));sync();render()};
  wrap.querySelector('[data-act=clear]').onclick=()=>{state.clear();sync();render()};
  wrap._sync=sync;sync();
}

document.addEventListener('click',()=>document.querySelectorAll('.multiSelect.open').forEach(x=>x.classList.remove('open')));
makeMulti('brand',D.p||[],'All Products',selectedProducts);
makeMulti('zone',D.z||[],'All Zones',selectedZones);
makeMulti('state',D.st||[],'All States',selectedStates);
['sku','month'].forEach(id=>{const e=$(id);if(e)e.disabled=true});

function match(r){return (!selectedProducts.size||selectedProducts.has(r.b))&&(!selectedZones.size||selectedZones.has(r.z))&&(!selectedStates.size||selectedStates.has(r.st))}
function rows(){return M.filter(match)}
function tot(a,y){return a.filter(x=>x.y===y).reduce((t,x)=>{t[0]+=x.s||0;t[1]+=x.o||0;t[2]+=x.r||0;t[3]+=x.e||0;t[4]+=x.q||0;t[5]+=x.n||0;return t},[0,0,0,0,0,0])}
function grp(a,key){const m={};a.forEach(x=>{const k=x[key]||'Unspecified',o=m[k]||(m[k]={name:k,a25:[0,0,0,0,0,0],a26:[0,0,0,0,0,0]}),q=x.y===2026?o.a26:o.a25,v=[x.s,x.o,x.r,x.e,x.q,x.n];for(let i=0;i<6;i++)q[i]+=Number(v[i])||0});return Object.values(m).map(o=>{const a=o.a25,b=o.a26;return {...o,s25:a[0],s26:b[0],growth:a[0]?100*(b[0]-a[0])/a[0]:(b[0]?100:0),expire:b[3],expireRate:b[1]?100*b[3]/b[1]:0,bonusRate:b[4]?100*b[5]/b[4]:0,returnRate:b[1]?100*b[2]/b[1]:0}})}
function bars(id,a,key,p=false,n=14){const el=$(id);if(!el)return;a=[...a].sort((x,y)=>(y[key]||0)-(x[key]||0)).slice(0,n);const mx=Math.max(1,...a.map(x=>Math.abs(x[key]||0)));el.innerHTML=a.length?a.map(x=>`<div class="bar"><div class="name" title="${E(x.name)}">${E(x.name)}</div><div class="track"><div class="fill" style="width:${Math.abs(x[key]||0)/mx*100}%"></div></div><div class="value">${p?PCT(x[key]):F(x[key])}</div></div>`).join(''):'<div class="note">No matching data</div>'}
function compareBars(id,a){const el=$(id);if(!el)return;a=[...a].sort((x,y)=>y.s26-x.s26).slice(0,14);const mx=Math.max(1,...a.flatMap(x=>[x.s25,x.s26]));el.innerHTML=a.length?a.map(x=>`<div class="bar"><div class="name" title="${E(x.name)}">${E(x.name)}</div><div><div class="track"><div class="fill" style="width:${Math.max(0,x.s26)/mx*100}%;background:#31ecff"></div></div><div class="track" style="margin-top:3px"><div class="fill" style="width:${Math.max(0,x.s25)/mx*100}%;background:#a855f7"></div></div></div><div class="value">${F(x.s26)}</div></div>`).join(''):'<div class="note">No matching data</div>'}
function table(id,a,cols){const el=$(id);if(!el)return;el.innerHTML=a.length?a.map(x=>'<tr>'+cols.map(f=>'<td>'+f(x)+'</td>').join('')+'</tr>').join(''):'<tr><td colspan="9">No matching data</td></tr>'}

function customerData(){
 const q=($('search')?.value||'').toLowerCase();
 let a=CR.filter(match).filter(x=>!q||String(x.name).toLowerCase().includes(q)||String(x.acct).toLowerCase().includes(q)||String(x.z).toLowerCase().includes(q)||String(x.st).toLowerCase().includes(q));
 a=a.filter(x=>x.s25>0).map(x=>({...x,d:x.s26-x.s25,g:100*(x.s26-x.s25)/x.s25}));
 const g=a.filter(x=>x.g>=10).sort((x,y)=>y.d-x.d).slice(0,10).map((x,i)=>({...x,rk:i+1}));
 const d=a.filter(x=>x.g<=-10).sort((x,y)=>x.d-y.d).slice(0,10).map((x,i)=>({...x,rk:i+1}));
 return {g,d};
}
function ctab(id,a){const el=$(id);if(!el)return;el.innerHTML=a.length?a.map(x=>`<tr><td>${E(x.z)}</td><td>${E(x.st)}</td><td>${x.rk}</td><td>${E(x.name)}</td><td>${F(x.s25)}</td><td>${F(x.s26)}</td><td class="${x.g>=0?'pos':'neg'}">${PCT(x.g)}</td><td class="${x.d>=0?'pos':'neg'}">${F(x.d)}</td></tr>`).join(''):'<tr><td colspan="8">No matching customer data.</td></tr>'}
function cbars(id,a){const el=$(id);if(!el)return;if(!a.length){el.innerHTML='<div class="note">No matching customer data.</div>';return}const mx=Math.max(1,...a.map(x=>Math.abs(x.d)));el.innerHTML=a.map(x=>`<div class="bar"><div class="name" title="${E(x.name)}">${E(x.name)}</div><div class="track"><div class="fill" style="width:${Math.abs(x.d)/mx*100}%"></div></div><div class="value">${F(x.d)}</div></div>`).join('')}
function trend(){const el=$('trend');if(!el)return;const months=D.mo||[],ok=x=>match(x),a=months.map(m=>MON.filter(x=>x.y===2025&&x.mo===m&&ok(x)).reduce((s,x)=>s+(x.s||0),0)),c=months.map(m=>MON.filter(x=>x.y===2026&&x.mo===m&&ok(x)).reduce((s,x)=>s+(x.s||0),0)),mx=Math.max(1,...a,...c),xy=(v,i)=>[50+i*115,260-v/mx*220],line=v=>v.map((n,i)=>(i?'L':'M')+xy(n,i).join(',')).join(' ');el.innerHTML=`<path d="${line(a)}" fill="none" stroke="#a855f7" stroke-width="4"/><path d="${line(c)}" fill="none" stroke="#31ecff" stroke-width="4"/>`+months.map((m,i)=>`<text x="${50+i*115}" y="290" class="axis" text-anchor="middle">${m.slice(0,3)}</text>`).join('')}
function selectionText(set,allLabel){return set.size===0?allLabel:(set.size===1?[...set][0]:`${set.size} selected`)}

function render(){
 const a=rows(),t26=tot(a,2026),t25=tot(a,2025),zs=grp(a,'z'),ps=grp(a,'b'),growth=t25[0]?100*(t26[0]-t25[0])/t25[0]:(t26[0]?100:0),top=[...zs].sort((x,y)=>y.s26-x.s26)[0],cc=customerData();
 $('sales26').textContent=F(t26[0]);$('sales25').textContent='2025: '+F(t25[0]);$('growth').textContent=PCT(growth);$('growth').className=growth>=0?'pos':'neg';
 $('expire').textContent=F(t26[3]);$('expireRate').textContent=PCT(t26[1]?100*t26[3]/t26[1]:0)+' of Sold Amount';$('bonus').textContent=PCT(t26[4]?100*t26[5]/t26[4]:0);$('bonusQty').textContent=F(t26[5])+' bonus qty';$('returnRate').textContent=PCT(t26[1]?100*t26[2]/t26[1]:0);$('returnValue').textContent=F(t26[2])+' returned';
 $('topZone').textContent=top?top.name:'—';$('topShare').textContent=PCT(top&&t26[0]?100*top.s26/t26[0]:0)+' share';$('growCount').textContent=cc.g.length;$('declineCount').textContent=cc.d.length;
 compareBars('compare',zs);bars('growthBars',zs,'growth',true);bars('expireZone',zs,'expire');bars('expireZone2',zs,'expire');bars('productSales',ps,'s26');bars('productGrowth',ps,'growth',true);bars('expireProduct',ps,'expire');bars('expireProduct2',ps,'expire');bars('bonusProduct',ps,'bonusRate',true);bars('bonusProduct2',ps,'bonusRate',true);bars('bonusZone',zs,'bonusRate',true);
 table('zoneBody',zs,[x=>E(x.name),x=>F(x.s26),x=>F(x.s25),x=>PCT(t26[0]?100*x.s26/t26[0]:0),x=>PCT(x.growth),x=>F(x.expire),x=>PCT(x.expireRate),x=>PCT(x.bonusRate),x=>PCT(x.returnRate)]);
 table('productBody',ps,[x=>E(x.name),x=>F(x.s26),x=>F(x.s25),x=>PCT(x.growth),x=>F(x.expire),x=>PCT(x.expireRate),x=>PCT(x.bonusRate),x=>PCT(x.returnRate)]);
 ctab('growthTable',cc.g);ctab('declineTable',cc.d);cbars('growBars',cc.g);cbars('declineBars',cc.d);
 $('donutTotal').textContent=F(t26[0]);$('legend').innerHTML=[...zs].sort((x,y)=>y.s26-x.s26).map(x=>`<div class="legendItem"><span>${E(x.name)}</span><strong>${PCT(t26[0]?100*x.s26/t26[0]:0)}</strong></div>`).join('');
 $('smart').innerHTML=`<div class="smartCard"><span>Selected Product</span><strong>${E(selectionText(selectedProducts,'All Products'))}</strong><small>${F(t26[0])} sales in 2026</small></div><div class="smartCard"><span>Selected Zone</span><strong>${E(selectionText(selectedZones,'All Zones'))}</strong><small>${top?E(top.name):'—'} top zone</small></div><div class="smartCard"><span>Selected State</span><strong>${E(selectionText(selectedStates,'All States'))}</strong><small>State Name filter</small></div><div class="smartCard"><span>YTD Growth</span><strong class="${growth>=0?'pos':'neg'}">${PCT(growth)}</strong><small>Jan–Aug 2026 vs 2025</small></div>`;
 trend();
}

$('search')?.addEventListener('input',render);
$('resetBtn').onclick=()=>{selectedProducts.clear();selectedZones.clear();selectedStates.clear();document.querySelectorAll('.multiSelect').forEach(x=>x._sync&&x._sync());$('search').value='';render()};
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab,.view').forEach(x=>x.classList.remove('active'));b.classList.add('active');$(b.dataset.view).classList.add('active')});
$('langBtn').onclick=()=>{};
render();