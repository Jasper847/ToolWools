document.addEventListener("DOMContentLoaded",()=>{
const jwtInput=document.getElementById("jwt-input");
function base64Decode(str){try{return atob(str.replace(/-/g,"+").replace(/_/g,"/").padEnd(str.length+((4-str.length%4)%4),"="));}catch{return null;}}
function prettyJSON(obj){return JSON.stringify(obj,null,2);}
function formatDate(ts){return new Date(ts*1000).toLocaleString();}
document.getElementById("btn-decode").addEventListener("click",()=>{
const token=jwtInput.value.trim();
if(!token){showToast("Paste a JWT token first.","warning");return;}
const parts=token.split(".");
if(parts.length!==3){showToast("Invalid JWT format. A JWT must have 3 parts separated by dots.","error");return;}
try{
const header=JSON.parse(base64Decode(parts[0])||"{}");
const payload=JSON.parse(base64Decode(parts[1])||"{}");
document.getElementById("header-out").textContent=prettyJSON(header);
document.getElementById("payload-out").textContent=prettyJSON(payload);
document.getElementById("sig-out").textContent=parts[2];
// Claims table
const claimDescriptions={"sub":"Subject (who the token refers to)","iss":"Issuer (who created the token)","aud":"Audience (who can use the token)","exp":"Expiry time","nbf":"Not valid before","iat":"Issued at","jti":"JWT ID","name":"Full name","email":"Email address","roles":"Roles/Permissions"};
let tableHtml="<table class='exif-table'><thead><tr><th>Claim</th><th>Value</th><th>Description</th></tr></thead><tbody>";
for(const[k,v] of Object.entries(payload)){
let displayVal=v;
if(k==="exp"||k==="nbf"||k==="iat")displayVal=`${v} (${formatDate(v)})`;
else if(typeof v==="object")displayVal=JSON.stringify(v);
tableHtml+=`<tr><td><code style="color:var(--color-primary)">${k}</code></td><td style="font-family:monospace;font-size:12px;word-break:break-all">${displayVal}</td><td style="color:var(--color-muted)">${claimDescriptions[k]||""}</td></tr>`;
}
tableHtml+="</tbody></table>";
document.getElementById("claims-table").innerHTML=tableHtml;
// Expiry check
const banner=document.getElementById("expiry-banner");
if(payload.exp){
const now=Math.floor(Date.now()/1000);const diff=payload.exp-now;
banner.style.display="";
if(diff<0){banner.style.cssText="display:block;padding:12px 16px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:12px;margin-bottom:16px;font-size:13px;color:var(--color-red);font-weight:600";banner.textContent="✗ Token EXPIRED "+formatDate(payload.exp);}
else{banner.style.cssText="display:block;padding:12px 16px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:12px;margin-bottom:16px;font-size:13px;color:var(--color-green);font-weight:600";banner.textContent="✓ Token valid until "+formatDate(payload.exp);}
}else{banner.style.display="none";}
document.getElementById("results").style.display="";
showToast("JWT decoded successfully!","success");
}catch(e){showToast("Failed to decode JWT: "+e.message,"error");}
});
document.getElementById("btn-copy-payload").addEventListener("click",()=>{const out=document.getElementById("payload-out").textContent;if(!out){showToast("Decode a JWT first.","warning");return;}navigator.clipboard.writeText(out).then(()=>showToast("Payload copied!","success"));});
document.getElementById("btn-clear").addEventListener("click",()=>{jwtInput.value="";document.getElementById("results").style.display="none";});
});
