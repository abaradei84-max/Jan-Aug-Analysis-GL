(async()=>{
  try{
    const s=window.GL_B64||"";
    const map="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let clean=s.replace(/[^A-Za-z0-9+/=]/g,""),out=[],buf=0,bits=0;
    for(const ch of clean){
      if(ch==="=") break;
      const v=map.indexOf(ch); if(v<0) continue;
      buf=(buf<<6)|v; bits+=6;
      if(bits>=8){bits-=8;out.push((buf>>bits)&255);}
    }
    const stream=new Blob([new Uint8Array(out)]).stream().pipeThrough(new DecompressionStream("gzip"));
    const text=await new Response(stream).text();
    window.GL_DATA=JSON.parse(text);
    const sc=document.createElement("script");sc.src="app.js?v=2";document.body.appendChild(sc);
  }catch(err){
    const d=document.createElement("div");
    d.style.cssText="position:fixed;bottom:0;left:0;right:0;background:#b91c1c;color:white;padding:10px;z-index:9999;font-family:Arial";
    d.textContent="Dashboard load error: "+err.message;
    document.body.appendChild(d);
  }
})();