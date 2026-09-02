(async()=>{
  const loadScript=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
  const gunzip=async b64=>{
    const bin=atob((b64||'').replace(/\s/g,''));
    const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return await new Response(stream).text();
  };
  const fresh=Date.now();
  try{await loadScript('filters.js?v=13&t='+fresh)}catch(e){console.error('filters.js failed to load',e)}
  try{if(window.GL_FILTER_B64){const fallbackText=await gunzip(window.GL_FILTER_B64);(0,eval)(fallbackText)}}catch(e){console.error('Compressed fallback data load failed',e)}
  try{if(window.GL_B64){const text=await gunzip(window.GL_B64),full=JSON.parse(text);window.GL_DATA={p:[],m:full.m||[],c:full.c||[]}}}catch(e){console.error('Detailed dashboard data load failed; using filters.js fallback',e)}
  window.GL_B64='';window.GL_FILTER_B64='';
  try{await loadScript('app.js?v=13&t='+fresh)}catch(e){console.error('app.js failed to load',e)}
})();