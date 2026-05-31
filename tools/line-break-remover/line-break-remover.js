document.addEventListener("DOMContentLoaded",()=>{
const input=document.getElementById("input"),output=document.getElementById("output"),replaceWith=document.getElementById("replace-with"),customChar=document.getElementById("custom-char");
replaceWith.addEventListener("change",()=>{customChar.style.display=replaceWith.value==="custom"?"":"none";});
function process(){
let text=input.value;
const breaks=(text.match(/\r\n|\r|\n/g)||[]).length;
document.getElementById("stat-breaks").textContent=breaks;
document.getElementById("stat-chars-in").textContent=text.length;
let rep=replaceWith.value==="custom"?customChar.value:replaceWith.value;
const preservePara=document.getElementById("opt-preserve-paragraphs").checked;
if(preservePara){text=text.replace(/(\r\n|\r|\n){2,}/g,"__PARA__").replace(/\r\n|\r|\n/g,rep).replace(/__PARA__/g,"\n\n");}
else{text=text.replace(/\r\n|\r|\n/g,rep);}
if(document.getElementById("opt-trim-spaces").checked)text=text.replace(/ {2,}/g," ").trim();
output.value=text;
document.getElementById("stat-chars-out").textContent=text.length;
}
document.getElementById("btn-process").addEventListener("click",()=>{if(!input.value.trim()){showToast("Enter some text first.","warning");return;}process();showToast("Line breaks removed!","success");});
document.getElementById("btn-copy").addEventListener("click",()=>{if(!output.value){showToast("Nothing to copy.","warning");return;}navigator.clipboard.writeText(output.value).then(()=>showToast("Copied!","success"));});
document.getElementById("btn-clear").addEventListener("click",()=>{input.value=output.value="";["stat-breaks","stat-chars-in","stat-chars-out"].forEach(id=>document.getElementById(id).textContent="0");});
input.addEventListener("input",()=>{document.getElementById("stat-breaks").textContent=(input.value.match(/\r\n|\r|\n/g)||[]).length;document.getElementById("stat-chars-in").textContent=input.value.length;});
});
