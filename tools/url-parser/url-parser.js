document.addEventListener("DOMContentLoaded",()=>{
const urlInput=document.getElementById("url-input"),results=document.getElementById("parse-results");
let params=new Map();
function parseURL(){
let urlStr=urlInput.value.trim();if(!urlStr){showToast("Enter a URL first.","warning");return;}
if(!/^https?:\/\//i.test(urlStr))urlStr="https://"+urlStr;
try{
const u=new URL(urlStr);
const parts=[{label:"Protocol",value:u.protocol.replace(":","")||"—",icon:"🔒"},{label:"Hostname",value:u.hostname||"—",icon:"🌐"},{label:"Port",value:u.port||"(default)",icon:"🔌"},{label:"Pathname",value:u.pathname||"/",icon:"📂"},{label:"Search",value:u.search||"(none)",icon:"🔍"},{label:"Hash",value:u.hash||"(none)",icon:"#"},{label:"Origin",value:u.origin||"—",icon:"🏠"},{label:"Full URL",value:u.href,icon:"🔗"}];
document.getElementById("url-parts-grid").innerHTML=parts.map(p=>`<div class="result-panel" style="margin-bottom:0"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span>${p.icon}</span><div class="result-panel-badge">${p.label}</div></div><div style="font-family:'Fira Code',monospace;font-size:13px;color:var(--color-dark);word-break:break-all;cursor:pointer" onclick="navigator.clipboard.writeText('${p.value}').then(()=>showToast('${p.label} copied!','success'))">${p.value}</div></div>`).join("");
params=new Map(u.searchParams.entries());
renderParams();
results.style.display="";
showToast("URL parsed!","success");
}catch(e){showToast("Invalid URL: "+e.message,"error");}
}
function renderParams(){
const pt=document.getElementById("params-table");const pf=document.getElementById("params-form");
if(!params.size){pt.innerHTML='<p style="font-size:13px;color:var(--color-muted)">No query parameters found.</p>';pf.innerHTML="";return;}
pt.innerHTML=`<table class="exif-table"><thead><tr><th>Parameter</th><th>Value</th><th>Decoded Value</th></tr></thead><tbody>${Array.from(params.entries()).map(([k,v])=>`<tr><td><code style="color:var(--color-primary)">${k}</code></td><td style="font-family:monospace;font-size:12px">${v}</td><td style="font-family:monospace;font-size:12px">${decodeURIComponent(v)}</td></tr>`).join("")}</tbody></table>`;
pf.innerHTML=Array.from(params.entries()).map(([k,v],i)=>`<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px"><input type="text" value="${k}" class="tool-input" style="flex:1;font-family:'Fira Code',monospace;font-size:12px" data-key="${i}"><input type="text" value="${decodeURIComponent(v)}" class="tool-input" style="flex:2;font-family:'Fira Code',monospace;font-size:12px" data-val="${i}"><button onclick="this.closest('[data-row]')||this.parentElement.remove()" style="background:none;border:none;color:var(--color-red);cursor:pointer;font-size:18px;padding:0 6px;min-height:auto">×</button></div>`).join("");
}
document.getElementById("btn-parse").addEventListener("click",parseURL);urlInput.addEventListener("keydown",e=>{if(e.key==="Enter")parseURL();});
document.getElementById("btn-add-param").addEventListener("click",()=>{const pf=document.getElementById("params-form");const div=document.createElement("div");div.style.cssText="display:flex;gap:8px;align-items:center;margin-bottom:8px";div.innerHTML=`<input type="text" placeholder="key" class="tool-input" style="flex:1;font-family:'Fira Code',monospace;font-size:12px"><input type="text" placeholder="value" class="tool-input" style="flex:2;font-family:'Fira Code',monospace;font-size:12px"><button style="background:none;border:none;color:var(--color-red);cursor:pointer;font-size:18px;padding:0 6px;min-height:auto" onclick="this.parentElement.remove()">×</button>`;pf.appendChild(div);});
document.getElementById("btn-rebuild").addEventListener("click",()=>{try{const base=new URL(urlInput.value.startsWith("http")?urlInput.value:"https://"+urlInput.value);base.search="";const rows=document.getElementById("params-form").querySelectorAll("div");rows.forEach(row=>{const inputs=row.querySelectorAll("input");if(inputs[0]&&inputs[1]&&inputs[0].value)base.searchParams.set(inputs[0].value,inputs[1].value);});urlInput.value=base.href;showToast("URL rebuilt!","success");}catch(e){showToast("Error rebuilding URL.","error");}});
document.getElementById("btn-copy-url").addEventListener("click",()=>navigator.clipboard.writeText(urlInput.value).then(()=>showToast("URL copied!","success")));
document.getElementById("btn-encode").addEventListener("click",()=>{urlInput.value=encodeURIComponent(urlInput.value);showToast("URL encoded!","success");});
document.getElementById("btn-decode").addEventListener("click",()=>{try{urlInput.value=decodeURIComponent(urlInput.value);showToast("URL decoded!","success");}catch{showToast("Invalid encoded URL.","error");}});
parseURL();
});
