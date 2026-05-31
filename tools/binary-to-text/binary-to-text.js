document.addEventListener("DOMContentLoaded",()=>{
const input=document.getElementById("input"),output=document.getElementById("output");
const inputLabel=document.getElementById("input-label"),outputLabel=document.getElementById("output-label");
let dir="bin-text";
const configs={
"bin-text":["Binary Input","Text Output",t=>t.trim().split(/\s+/).map(b=>{try{return String.fromCharCode(parseInt(b,2));}catch{return"?";} }).join("")],
"text-bin":["Text Input","Binary Output",t=>t.split("").map(c=>c.charCodeAt(0).toString(2).padStart(8,"0")).join(" ")],
"text-hex":["Text Input","Hex Output",t=>t.split("").map(c=>c.charCodeAt(0).toString(16).padStart(2,"0").toUpperCase()).join(" ")],
"hex-text":["Hex Input","Text Output",t=>t.trim().replace(/\s+/g,"").match(/.{1,2}/g).map(h=>String.fromCharCode(parseInt(h,16))).join("")],
"text-oct":["Text Input","Octal Output",t=>t.split("").map(c=>c.charCodeAt(0).toString(8).padStart(3,"0")).join(" ")],
"text-dec":["Text Input","Decimal Output",t=>t.split("").map(c=>c.charCodeAt(0)).join(" ")],
};
document.getElementById("direction-tabs").addEventListener("click",e=>{
const btn=e.target.closest("[data-dir]");if(!btn)return;
dir=btn.dataset.dir;
document.querySelectorAll("[data-dir]").forEach(b=>b.classList.remove("action-btn--active"));
btn.classList.add("action-btn--active");
inputLabel.textContent=configs[dir][0];
outputLabel.textContent=configs[dir][1];
input.value="";output.value="";
const placeholders={"bin-text":"01001000 01101001","text-bin":"Hello World","text-hex":"Hello","hex-text":"48 65 6C 6C 6F","text-oct":"Hello","text-dec":"Hello"};
input.placeholder=placeholders[dir]||"Enter input...";
});
document.getElementById("btn-convert").addEventListener("click",()=>{
if(!input.value.trim()){showToast("Enter some input first.","warning");return;}
try{output.value=configs[dir][2](input.value);showToast("Converted!","success");}
catch(e){showToast("Invalid input for this conversion.","error");}
});
document.getElementById("btn-copy").addEventListener("click",()=>{if(!output.value){showToast("Nothing to copy.","warning");return;}navigator.clipboard.writeText(output.value).then(()=>showToast("Copied!","success"));});
document.getElementById("btn-swap").addEventListener("click",()=>{if(!output.value)return;input.value=output.value;output.value="";});
document.getElementById("btn-clear").addEventListener("click",()=>{input.value=output.value="";});
});
