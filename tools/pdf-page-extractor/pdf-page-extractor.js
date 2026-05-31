document.addEventListener("DOMContentLoaded",()=>{
const uploadZone=document.getElementById("upload-zone"),fileInput=document.getElementById("file-input"),controls=document.getElementById("controls");
let pdfBytes=null,totalPages=0,fileName="extracted";
function parseRange(rangeStr,total){
const pages=new Set();
rangeStr.split(",").forEach(part=>{part=part.trim();if(!part)return;if(part.includes("-")){const[a,b]=part.split("-").map(n=>parseInt(n.trim()));for(let i=Math.max(1,a);i<=Math.min(total,b);i++)pages.add(i-1);}else{const n=parseInt(part);if(!isNaN(n)&&n>=1&&n<=total)pages.add(n-1);}});
return Array.from(pages).sort((a,b)=>a-b);
}
async function loadPDF(file){pdfBytes=await file.arrayBuffer();fileName=file.name.replace(/\.pdf$/i,"");const doc=await PDFLib.PDFDocument.load(pdfBytes,{ignoreEncryption:true});totalPages=doc.getPageCount();document.getElementById("stat-pages").textContent=totalPages;controls.style.display="";showToast(`PDF loaded: ${totalPages} pages`,"success");}
uploadZone.addEventListener("click",()=>fileInput.click());uploadZone.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" ")fileInput.click();});
fileInput.addEventListener("change",()=>{if(fileInput.files[0])loadPDF(fileInput.files[0]);fileInput.value="";});
uploadZone.addEventListener("dragover",e=>{e.preventDefault();uploadZone.classList.add("dragover");});uploadZone.addEventListener("dragleave",()=>uploadZone.classList.remove("dragover"));uploadZone.addEventListener("drop",e=>{e.preventDefault();uploadZone.classList.remove("dragover");if(e.dataTransfer.files[0])loadPDF(e.dataTransfer.files[0]);});
document.getElementById("page-range").addEventListener("input",function(){const pages=parseRange(this.value,totalPages);document.getElementById("stat-selected").textContent=pages.length;});
document.getElementById("btn-select-all").addEventListener("click",()=>{document.getElementById("page-range").value="1-"+totalPages;document.getElementById("stat-selected").textContent=totalPages;});
document.getElementById("btn-even").addEventListener("click",()=>{const evens=[];for(let i=2;i<=totalPages;i+=2)evens.push(i);document.getElementById("page-range").value=evens.join(",");document.getElementById("stat-selected").textContent=evens.length;});
document.getElementById("btn-odd").addEventListener("click",()=>{const odds=[];for(let i=1;i<=totalPages;i+=2)odds.push(i);document.getElementById("page-range").value=odds.join(",");document.getElementById("stat-selected").textContent=odds.length;});
document.getElementById("btn-extract").addEventListener("click",async()=>{
if(!pdfBytes){showToast("Load a PDF first.","warning");return;}
const rangeStr=document.getElementById("page-range").value.trim();
if(!rangeStr){showToast("Enter page numbers to extract.","warning");return;}
const pages=parseRange(rangeStr,totalPages);
if(!pages.length){showToast("No valid pages selected.","warning");return;}
document.getElementById("progress-wrap").style.display="";document.getElementById("progress-bar").style.width="10%";document.getElementById("status-text").textContent=`Extracting ${pages.length} pages...`;
try{
const srcDoc=await PDFLib.PDFDocument.load(pdfBytes,{ignoreEncryption:true});
const newDoc=await PDFLib.PDFDocument.create();const copied=await newDoc.copyPages(srcDoc,pages);copied.forEach(p=>newDoc.addPage(p));
document.getElementById("progress-bar").style.width="80%";
const outBytes=await newDoc.save();
const blob=new Blob([outBytes],{type:"application/pdf"});
const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`${fileName}-pages-${rangeStr.replace(/,/g,"-")}.pdf`;a.click();URL.revokeObjectURL(a.href);
document.getElementById("progress-bar").style.width="100%";document.getElementById("status-text").textContent=`✓ Extracted ${pages.length} pages!`;
showToast(`Extracted ${pages.length} pages!`,"success");
}catch(e){showToast("Error: "+e.message,"error");}
});
});
