document.addEventListener("DOMContentLoaded",()=>{
function generateV4(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,c=>{const r=crypto.getRandomValues(new Uint8Array(1))[0]%16|0,v=c=="x"?r:r&0x3|0x8;return v.toString(16);});}
function generateV1(){const t=Date.now();const tHex=t.toString(16).padStart(12,"0");return`${tHex.slice(6)}-${tHex.slice(2,6)}-1${tHex.slice(0,3)}-${(Math.random()*0x3fff+0x8000|0).toString(16)}-${crypto.getRandomValues(new Uint8Array(6)).reduce((a,b)=>a+(b.toString(16).padStart(2,"0")),"")}`;}
function generateULID(){const t=Date.now().toString(32).toUpperCase().padStart(10,"0");const chars="0123456789ABCDEFGHJKMNPQRSTVWXYZ";let r="";for(let i=0;i<16;i++)r+=chars[crypto.getRandomValues(new Uint8Array(1))[0]%32];return t+r;}
function format(uuid){
let result=uuid;
if(document.getElementById("opt-no-hyphens").checked)result=result.replace(/-/g,"");
if(document.getElementById("opt-uppercase").checked)result=result.toUpperCase();
if(document.getElementById("opt-braces").checked)result="{"+result+"}";
return result;
}
function generate(){
const ver=document.getElementById("uuid-version").value;
const qty=Math.min(1000,Math.max(1,parseInt(document.getElementById("quantity").value)||10));
const uuids=[];
for(let i=0;i<qty;i++){
let uuid=ver==="v4"?generateV4():ver==="v1"?generateV1():generateULID();
uuids.push(format(uuid));
}
document.getElementById("output").value=uuids.join("\n");
showToast(`Generated ${qty} ${ver.toUpperCase()}s!`,"success");
}
document.getElementById("btn-generate").addEventListener("click",generate);
document.getElementById("btn-copy-all").addEventListener("click",()=>{const out=document.getElementById("output").value;if(!out){showToast("Generate UUIDs first.","warning");return;}navigator.clipboard.writeText(out).then(()=>showToast("All UUIDs copied!","success"));});
document.getElementById("btn-copy-first").addEventListener("click",()=>{const out=document.getElementById("output").value;if(!out){showToast("Generate UUIDs first.","warning");return;}navigator.clipboard.writeText(out.split("\n")[0]).then(()=>showToast("First UUID copied!","success"));});
document.getElementById("btn-clear").addEventListener("click",()=>{document.getElementById("output").value="";});
document.getElementById("btn-validate").addEventListener("click",()=>{
const val=document.getElementById("validate-input").value.trim();
const result=document.getElementById("validate-result");
const uuidRegex=/^[{]?[0-9a-f]{8}-[0-9a-f]{4}-([0-9a-f]{4})-[89ab][0-9a-f]{3}-[0-9a-f]{12}[}]?$/i;
const nidRegex=/^[0-9a-f]{32}$/i;
const ulidRegex=/^[0-9A-Z]{26}$/;
let html="",valid=false;
if(ulidRegex.test(val)){valid=true;html=`<p style="color:var(--color-green);font-weight:600">✓ Valid ULID</p><p style="font-size:13px;color:var(--color-muted)">Timestamp: ${new Date(parseInt(val.slice(0,10),32)).toLocaleString()}</p>`;}
else if(uuidRegex.test(val)||nidRegex.test(val)){
valid=true;const clean=val.replace(/[{}-]/g,"");
const version=clean[12];
const variant=parseInt(clean[16],16);
const variantName=variant>=8&&variant<=11?"RFC 4122":variant>=12&&variant<=15?"Microsoft":"Other";
html=`<p style="color:var(--color-green);font-weight:600">✓ Valid UUID</p><table class="exif-table"><tr><td>Version</td><td>v${version}</td></tr><tr><td>Variant</td><td>${variantName}</td></tr><tr><td>Uppercase</td><td>${val===val.toUpperCase()?"Yes":"No"}</td></tr></table>`;
}else{html=`<p style="color:var(--color-red);font-weight:600">✗ Invalid UUID/ULID</p><p style="font-size:13px;color:var(--color-muted)">Does not match any known UUID or ULID format.</p>`;}
result.style.display="";result.innerHTML=html;
showToast(valid?"Valid identifier!":"Invalid UUID/ULID",valid?"success":"error");
});
// Auto-generate on load
generate();
});
