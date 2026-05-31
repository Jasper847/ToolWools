document.addEventListener("DOMContentLoaded",()=>{
const input=document.getElementById("input"),output=document.getElementById("output");
function getIndent(){const v=document.getElementById("indent").value;return v==="tab"?"\t":(" ".repeat(parseInt(v)));}
function beautifyHTML(html){
if(document.getElementById("opt-minify").checked){return html.replace(/>\s+</g,"><").replace(/\s{2,}/g," ").trim();}
const ind=getIndent();let depth=0,result="",inPre=false;
const voidTags=new Set(["area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"]);
const noIndentTags=new Set(["pre","textarea","script","style"]);
html=html.replace(/>\s*</g,">\n<");
const lines=html.split("\n");
for(let line of lines){
line=line.trim();if(!line)continue;
const isClose=/^<\//.test(line);const isVoid=voidTags.has((line.match(/<(\w+)/)||[])[1]?.toLowerCase()||"");
const isComment=line.startsWith("<!--");
if(isClose&&!inPre)depth=Math.max(0,depth-1);
result+=ind.repeat(depth)+line+"\n";
if(!isClose&&!isVoid&&!isComment&&/^<\w/.test(line)&&!/<\/\w/.test(line)&&!inPre)depth++;
}
return result.trim();
}
document.getElementById("btn-format").addEventListener("click",()=>{
if(!input.value.trim()){showToast("Paste some HTML first.","warning");return;}
try{
const out=beautifyHTML(input.value);
output.value=out;
document.getElementById("stat-in").textContent=input.value.length;
document.getElementById("stat-out").textContent=out.length;
document.getElementById("stat-lines").textContent=out.split("\n").length;
document.getElementById("stat-tags").textContent=(input.value.match(/<\w/g)||[]).length;
showToast("HTML formatted!","success");
}catch(e){showToast("Error formatting HTML: "+e.message,"error");}
});
document.getElementById("btn-copy").addEventListener("click",()=>{if(!output.value){showToast("Format HTML first.","warning");return;}navigator.clipboard.writeText(output.value).then(()=>showToast("Copied!","success"));});
document.getElementById("btn-clear").addEventListener("click",()=>{input.value=output.value="";["stat-in","stat-out","stat-lines","stat-tags"].forEach(id=>document.getElementById(id).textContent="0");});
input.addEventListener("input",()=>{document.getElementById("stat-in").textContent=input.value.length;});
});
