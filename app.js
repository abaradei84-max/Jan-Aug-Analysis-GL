const D=window.GL_DATA||[];
const COLORS=['#31ecff','#5f8cff','#a855f7','#ff4fd8','#35efad','#ffcc65','#00c3ff','#8b5cf6','#22d3ee','#fb7185'];
const MONTHS=['January','February','March','April','May','June','July','August'];
let lang='ar';

const T={
 ar:{
  title:'تحليل مبيعات GL — Jan–Aug',sub:'Uniflox • Dinixir • Ruatine • Unicast 10mg • Olaxy • Hi Dee Drops — مقارنة عادلة Jan–Aug 2026 vs 2025',
  product:'الصنف',sku:'SKU / العبوة',zone:'Zone',state:'State',month:'الشهر',search:'بحث عميل',
  allProducts:'كل الأصناف',allSku:'كل الـSKU',allZones:'كل الـZones',allStates:'كل الـStates',allMonths:'كل الأشهر',
  overview:'ملخص تنفيذي',zones:'تحليل Zone',products:'تحليل الأصناف',customers:'نمو العملاء',returns:'المرتجعات والـBonus',
  reset:'إعادة الفلاتر',lang:'English',
  noData:'لا توجد بيانات مطابقة',
  topZone:'أعلى Zone',bestGrowth:'أفضل نمو Zone',expireRisk:'أعلى Expire Return',bonusLeader:'أعلى Bonus %',
  growTable:'Top 10 عملاء نموًا في كل Zone + Product',declineTable:'Top 10 عملاء هبوطًا في كل Zone + Product'
 },
 en:{
  title:'GL Sales Analysis — Jan–Aug',sub:'Uniflox • Dinixir • Ruatine • Unicast 10mg • Olaxy • Hi Dee Drops — Fair Jan–Aug 2026 vs 2025 YTD',
  product:'Product',sku:'SKU / Pack',zone:'Zone',state:'State',month:'Month',search:'Customer Search',
  allProducts:'All Products',allSku:'All SKUs',allZones:'All Zones',allStates:'All States',allMonths:'All Months',
  overview:'Executive Overview',zones:'Zone Analysis',products:'Product Analysis',customers:'Customer Growth',returns:'Returns & Bonus',
  reset:'Reset Filters',lang:'العربية',
  noData:'No matching data',
  topZone:'Top Zone',bestGrowth:'Best Zone Growth',expireRisk:'Highest Expire Return',bonusLeader:'Highest Bonus %',
  growTable:'Top 10 Growing Customers in Every Zone + Product',declineTable:'Top 10 Declining Customers in Every Zone + Product'
 }
};

const $=id=>document.getElementById(id);
const fmt=n=>new Intl.NumberFormat(lang==='ar'?'ar-JO':'en-US',{maximumFractionDigits:0}).format(n||0);
const fmt1=n=>new Intl.NumberFormat(lang==='ar'?'ar-JO':'en-US',{maximumFractionDigits:1}).format(n||0);
const pct=n=>fmt1(n)+'%';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uniq=(idx)=>[...new Set(D.map(r=>r[idx]).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b)));

function fillSelect(id,vals,label,current=''){
  const e=$(id);
  e.innerHTML=`<option value="">${label}</option>`+vals.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
  if(vals.includes(current)) e.value=current;
}
function initFilters(){
  const cur={b:$('brand').value,sku:$('sku').value,z:$('zone').value,st:$('state').value,m:$('month').value};
  fillSelect('brand',uniq(2),T[lang].allProducts,cur.b);
  const skuVals=[...new Set(D.filter(r=>!$('brand').value||r[2]===$('brand').value).map(r=>r[3]))].sort();
  fillSelect('sku',skuVals,T[lang].allSku,cur.sku);
  fillSelect('zone',uniq(4),T[lang].allZones,cur.z);
  fillSelect('state',uniq(5),T[lang].allStates,cur.st);
  fillSelect('month',MONTHS,T[lang].allMonths,cur.m);
}
function filtered(){
  const q=$('search').value.trim().toLowerCase();
  return D.filter(r=>
    (!$('brand').value||r[2]===$('brand').value)&&
    (!$('sku').value||r[3]===$('sku').value)&&
    (!$('zone').value||r[4]===$('zone').value)&&
    (!$('state').value||r[5]===$('state').value)&&
    (!$('month').value||r[1]===$('month').value)&&
    (!q||String(r[7]).toLowerCase().includes(q)||String(r[4]).toLowerCase().includes(q))
  );
}
function totals(rows,year){
  const t={s:0,o:0,r:0,e:0,q:0,n:0};
  for(const x of rows){
    if(x[0]!==year) continue;
    t.s+=x[8];t.o+=x[9];t.r+=x[10];t.e+=x[11];t.q+=x[12];t.n+=x[13];
  }
  return t;
}
function group(rows,idx){
  const m=new Map();
  for(const r of rows){
    const name=r[idx]||'Unspecified';
    if(!m.has(name))m.set(name,{name,s26:0,s25:0,o26:0,o25:0,r26:0,r25:0,e26:0,e25:0,q26:0,q25:0,n26:0,n25:0});
    const x=m.get(name), y=r[0]===2026?'26':'25';
    x['s'+y]+=r[8];x['o'+y]+=r[9];x['r'+y]+=r[10];x['e'+y]+=r[11];x['q'+y]+=r[12];x['n'+y]+=r[13];
  }
  return [...m.values()].map(x=>({...x,
    growth:x.s25?((x.s26-x.s25)/x.s25*100):(x.s26?100:null),
    expireRate:x.o26?x.e26/x.o26*100:0,
    bonusRate:x.q26?x.n26/x.q26*100:0,
    returnRate:x.o26?x.r26/x.o26*100:0
  }));
}
function barList(id,items,key,n=14,asPct=false){
  items=[...items].sort((a,b)=>(b[key]||0)-(a[key]||0)).slice(0,n);
  if(!items.length){$(id).innerHTML=`<div class="note">${T[lang].noData}</div>`;return}
  const mx=Math.max(...items.map(x=>Math.abs(x[key]||0)),1);
  $(id).innerHTML=items.map((x,i)=>`<div class="bar"><div class="name" title="${esc(x.name)}">${esc(x.name)}</div><div class="track"><div class="fill" style="width:${Math.min(100,Math.abs(x[key]||0)/mx*100)}%;background:linear-gradient(90deg,${COLORS[i%COLORS.length]},${COLORS[(i+1)%COLORS.length]});color:${COLORS[i%COLORS.length]}"></div></div><div class="value">${asPct?pct(x[key]):fmt(x[key])}</div></div>`).join('');
}
function growthBars(id,items,n=16){
  const a=[...items].filter(x=>x.growth!==null&&x.s25>0).sort((a,b)=>b.growth-a.growth).slice(0,n);
  if(!a.length){$(id).innerHTML=`<div class="note">${T[lang].noData}</div>`;return}
  const mx=Math.max(...a.map(x=>Math.abs(x.growth)),10);
  $(id).innerHTML=a.map(x=>{
    const w=Math.min(50,Math.abs(x.growth)/mx*50),l=x.growth>=0?50:50-w;
    return `<div class="growthRow"><div class="name">${esc(x.name)}</div><div class="growthTrack"><div class="growthFill" style="left:${l}%;width:${w}%;background:${x.growth>=0?'#35efad':'#ff6b81'}"></div></div><div class="value ${x.growth>=0?'pos':'neg'}">${pct(x.growth)}</div></div>`;
  }).join('');
}
function compareBars(items){
  const a=[...items].sort((a,b)=>b.s26-a.s26).slice(0,14);
  if(!a.length){$('compare').innerHTML=`<div class="note">${T[lang].noData}</div>`;return}
  const mx=Math.max(...a.flatMap(x=>[x.s26,x.s25]),1);
  $('compare').innerHTML=a.map(x=>`<div class="bar"><div class="name">${esc(x.name)}</div><div><div class="track"><div class="fill" style="width:${x.s26/mx*100}%;background:#31ecff;color:#31ecff"></div></div><div class="track" style="margin-top:3px"><div class="fill" style="width:${x.s25/mx*100}%;background:#a855f7;color:#a855f7"></div></div></div><div class="value">${fmt(x.s26)}</div></div>`).join('');
}
function donut(items,total){
  let a=[...items].filter(x=>x.s26>0).sort((a,b)=>b.s26-a.s26),parts=a.slice(0,7);
  const known=parts.reduce((s,x)=>s+x.s26,0);
  if(total-known>0) parts.push({name:lang==='ar'?'أخرى':'Others',s26:total-known});
  let acc=0,st=[];
  parts.forEach((x,i)=>{const v=total?x.s26/total*100:0;st.push(`${COLORS[i%COLORS.length]} ${acc}% ${acc+v}%`);acc+=v});
  $('donut').style.background=parts.length?`conic-gradient(${st.join(',')})`:'rgba(255,255,255,.05)';
  $('donutTotal').textContent=fmt(total);
  $('legend').innerHTML=parts.map((x,i)=>`<div class="legendItem"><div class="legendLeft"><span class="dot" style="background:${COLORS[i%COLORS.length]};color:${COLORS[i%COLORS.length]}"></span><span class="legendName">${esc(x.name)}</span></div><strong>${pct(total?x.s26/total*100:0)}</strong></div>`).join('');
}
function trend(rows){
  const a=MONTHS.map(m=>rows.filter(r=>r[1]===m&&r[0]===2025).reduce((s,r)=>s+r[8],0));
  const b=MONTHS.map(m=>rows.filter(r=>r[1]===m&&r[0]===2026).reduce((s,r)=>s+r[8],0));
  const mx=Math.max(...a,...b,1),W=900,H=300,L=60,R=20,Tp=20,B=40;
  const x=i=>L+(W-L-R)*i/(MONTHS.length-1), y=v=>Tp+(H-Tp-B)*(1-v/mx), line=v=>v.map((n,i)=>(i?'L':'M')+x(i)+','+y(n)).join(' ');
  let grid='';for(let i=0;i<5;i++){let yy=Tp+(H-Tp-B)*i/4,val=mx*(1-i/4);grid+=`<line x1="${L}" y1="${yy}" x2="${W-R}" y2="${yy}" class="gridline"/><text x="${L-8}" y="${yy+4}" text-anchor="end" class="axis">${fmt(val)}</text>`}
  const labels=MONTHS.map((m,i)=>`<text x="${x(i)}" y="${H-15}" text-anchor="middle" class="axis">${m.slice(0,3)}</text>`).join('');
  $('trend').innerHTML=`${grid}<path d="${line(a)}" fill="none" stroke="#a855f7" stroke-width="3"/><path d="${line(b)}" fill="none" stroke="#31ecff" stroke-width="3"/>${a.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="#a855f7"/>`).join('')}${b.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="#31ecff"/>`).join('')}${labels}`;
}
function customerGrowth(rows){
  const m=new Map();
  for(const r of rows){
    const key=[r[6],r[4],r[2]].join('¦');
    if(!m.has(key))m.set(key,{customer:r[7],zone:r[4],product:r[2],s25:0,s26:0});
    const x=m.get(key); if(r[0]===2026)x.s26+=r[8]; else x.s25+=r[8];
  }
  return [...m.values()].filter(x=>x.s25>0).map(x=>({...x,growth:(x.s26-x.s25)/x.s25*100,delta:x.s26-x.s25}));
}
function groupedTop10(customers,positive=true){
  const groups=new Map();
  for(const x of customers){
    if(positive ? x.growth<10 : x.growth>-10) continue;
    const k=x.zone+'¦'+x.product;
    if(!groups.has(k))groups.set(k,[]);
    groups.get(k).push(x);
  }
  let out=[];
  for(const [k,a] of groups){
    a.sort((u,v)=>positive?(v.delta-u.delta):(u.delta-v.delta));
    a.slice(0,10).forEach((x,i)=>out.push({...x,rank:i+1}));
  }
  return out.sort((a,b)=>a.zone.localeCompare(b.zone)||a.product.localeCompare(b.product)||a.rank-b.rank);
}
function customerTable(id,arr,positive){
  $(id).innerHTML=arr.length?arr.map(x=>`<tr><td>${esc(x.zone)}</td><td>${esc(x.product)}</td><td>${x.rank}</td><td>${esc(x.customer)}</td><td>${fmt(x.s25)}</td><td>${fmt(x.s26)}</td><td class="${positive?'pos':'neg'}">${pct(x.growth)}</td><td class="${x.delta>=0?'pos':'neg'}">${fmt(x.delta)}</td></tr>`).join(''):`<tr><td colspan="8">${T[lang].noData}</td></tr>`;
}
function customerImpactBars(id,arr,positive){
  const a=[...arr].sort((x,y)=>positive?(y.delta-x.delta):(x.delta-y.delta)).slice(0,15);
  const mx=Math.max(...a.map(x=>Math.abs(x.delta)),1);
  $(id).innerHTML=a.map((x,i)=>`<div class="bar"><div class="name" title="${esc(x.customer)} • ${esc(x.zone)}">${esc(x.customer)}</div><div class="track"><div class="fill" style="width:${Math.abs(x.delta)/mx*100}%;background:${positive?'linear-gradient(90deg,#35efad,#31ecff)':'linear-gradient(90deg,#ff6b81,#ff4fd8)'};color:${positive?'#35efad':'#ff6b81'}"></div></div><div class="value ${positive?'pos':'neg'}">${fmt(x.delta)}</div></div>`).join('');
}
function render(){
  const rows=filtered(),t26=totals(rows,2026),t25=totals(rows,2025),zones=group(rows,4),products=group(rows,2);
  const growth=t25.s?((t26.s-t25.s)/t25.s*100):0, expRate=t26.o?t26.e/t26.o*100:0, bonusRate=t26.q?t26.n/t26.q*100:0, returnRate=t26.o?t26.r/t26.o*100:0;
  const top=[...zones].sort((a,b)=>b.s26-a.s26)[0]||{name:'—',s26:0},share=t26.s?top.s26/t26.s*100:0;
  const cust=customerGrowth(rows),growAll=cust.filter(x=>x.growth>=10),declAll=cust.filter(x=>x.growth<=-10);
  $('sales26').textContent=fmt(t26.s);$('sales25').textContent='2025: '+fmt(t25.s);
  $('growth').textContent=pct(growth);$('growth').className=growth>=0?'pos':'neg';
  $('expire').textContent=fmt(t26.e);$('expireRate').textContent=pct(expRate)+' of Sold Amount';
  $('bonus').textContent=pct(bonusRate);$('bonusQty').textContent=fmt(t26.n)+' bonus qty';
  $('returnRate').textContent=pct(returnRate);$('returnValue').textContent=fmt(t26.r)+' returned';
  $('topZone').textContent=top.name;$('topShare').textContent=pct(share)+' share';
  $('growCount').textContent=growAll.length;$('declineCount').textContent=declAll.length;
  compareBars(zones);donut(zones,t26.s);growthBars('growthBars',zones);trend(rows);
  barList('productSales',products,'s26',10);growthBars('productGrowth',products,10);
  barList('expireProduct',products,'e26',10);
  const bonusP=[...products].sort((a,b)=>b.bonusRate-a.bonusRate);barList('bonusProduct',bonusP,'bonusRate',10,true);
  barList('expireZone',zones,'e26',14);
  const bonusZ=[...zones].sort((a,b)=>b.bonusRate-a.bonusRate);barList('bonusZone',bonusZ,'bonusRate',14,true);
  barList('expireZone2',zones,'e26',14);
  barList('expireProduct2',products,'e26',10);
  barList('bonusProduct2',[...products].sort((a,b)=>b.bonusRate-a.bonusRate),'bonusRate',10,true);
  const best=[...zones].filter(x=>x.s25>0&&x.growth!==null).sort((a,b)=>b.growth-a.growth)[0]||{name:'—',growth:0};
  const ex=[...zones].sort((a,b)=>b.e26-a.e26)[0]||{name:'—',e26:0};
  const bo=[...zones].sort((a,b)=>b.bonusRate-a.bonusRate)[0]||{name:'—',bonusRate:0};
  $('smart').innerHTML=[[T[lang].topZone,top.name,`${fmt(top.s26)} • ${pct(share)}`],[T[lang].bestGrowth,best.name,pct(best.growth)],[T[lang].expireRisk,ex.name,fmt(ex.e26)],[T[lang].bonusLeader,bo.name,pct(bo.bonusRate)]].map(c=>`<div class="smartCard"><span>${esc(c[0])}</span><strong>${esc(c[1])}</strong><small>${esc(c[2])}</small></div>`).join('');
  const zSorted=[...zones].sort((a,b)=>b.s26-a.s26);
  $('zoneBody').innerHTML=zSorted.map(x=>`<tr><td>${esc(x.name)}</td><td>${fmt(x.s26)}</td><td>${fmt(x.s25)}</td><td>${pct(t26.s?x.s26/t26.s*100:0)}</td><td class="${(x.growth??0)>=0?'pos':'neg'}">${x.growth===null?'—':pct(x.growth)}</td><td>${fmt(x.e26)}</td><td>${pct(x.expireRate)}</td><td>${pct(x.bonusRate)}</td><td>${pct(x.returnRate)}</td></tr>`).join('');
  $('productBody').innerHTML=[...products].sort((a,b)=>b.s26-a.s26).map(x=>`<tr><td>${esc(x.name)}</td><td>${fmt(x.s26)}</td><td>${fmt(x.s25)}</td><td class="${(x.growth??0)>=0?'pos':'neg'}">${x.growth===null?'—':pct(x.growth)}</td><td>${fmt(x.e26)}</td><td>${pct(x.expireRate)}</td><td>${pct(x.bonusRate)}</td><td>${pct(x.returnRate)}</td></tr>`).join('');
  const gt=groupedTop10(cust,true),dt=groupedTop10(cust,false);
  customerTable('growthTable',gt,true);customerTable('declineTable',dt,false);
  customerImpactBars('growBars',growAll,true);customerImpactBars('declineBars',declAll,false);
}
function applyLang(){
  const t=T[lang];document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  $('pageTitle').textContent=t.title;$('pageSub').textContent=t.sub;$('langBtn').textContent=t.lang;$('resetBtn').textContent=t.reset;
  $('productLbl').textContent=t.product;$('skuLbl').textContent=t.sku;$('zoneLbl').textContent=t.zone;$('stateLbl').textContent=t.state;$('monthLbl').textContent=t.month;$('searchLbl').textContent=t.search;
  $('tabOverview').textContent=t.overview;$('tabZones').textContent=t.zones;$('tabProducts').textContent=t.products;$('tabCustomers').textContent=t.customers;$('tabReturns').textContent=t.returns;
  $('growthTableTitle').textContent=t.growTable;$('declineTableTitle').textContent=t.declineTable;
  initFilters();render();
}
$('brand').addEventListener('change',()=>{const cur=$('sku').value,vals=[...new Set(D.filter(r=>!$('brand').value||r[2]===$('brand').value).map(r=>r[3]))].sort();fillSelect('sku',vals,T[lang].allSku,cur);render()});
['sku','zone','state','month'].forEach(id=>$(id).addEventListener('change',render));
$('search').addEventListener('input',render);
$('resetBtn').onclick=()=>{['brand','sku','zone','state','month'].forEach(id=>$(id).value='');$('search').value='';initFilters();render()};
$('langBtn').onclick=()=>{lang=lang==='ar'?'en':'ar';applyLang()};
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));b.classList.add('active');$(b.dataset.view).classList.add('active')});
initFilters();applyLang();