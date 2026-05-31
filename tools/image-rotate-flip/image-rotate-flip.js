document.addEventListener("DOMContentLoaded",()=>{
const uploadZone=document.getElementById("upload-zone"),fileInput=document.getElementById("file-input"),controls=document.getElementById("controls"),resultCanvas=document.getElementById("result-canvas"),preview=document.getElementById("preview");
let imgEl=null,angle=0,flipH=false,flipV=false,fileName="image";
function loadFile(f){imgEl=new Image();const url=URL.createObjectURL(f);fileName=f.name.replace(/\.[^.]+$/,"");imgEl.onload=()=>{URL.revokeObjectURL(url);controls.style.display="";render();showToast("Image loaded!","success");};imgEl.src=url;}
uploadZone.addEventListener("click",()=>fileInput.click());uploadZone.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" ")fileInput.click();});
fileInput.addEventListener("change",()=>{if(fileInput.files[0])loadFile(fileInput.files[0]);fileInput.value="";});
uploadZone.addEventListener("dragover",e=>{e.preventDefault();uploadZone.classList.add("dragover");});uploadZone.addEventListener("dragleave",()=>uploadZone.classList.remove("dragover"));uploadZone.addEventListener("drop",e=>{e.preventDefault();uploadZone.classList.remove("dragover");if(e.dataTransfer.files[0])loadFile(e.dataTransfer.files[0]);});
function render(){if(!imgEl)return;const rad=angle*Math.PI/180;const sin=Math.abs(Math.sin(rad)),cos=Math.abs(Math.cos(rad));const w=Math.round(imgEl.naturalWidth*cos+imgEl.naturalHeight*sin);const h=Math.round(imgEl.naturalWidth*sin+imgEl.naturalHeight*cos);resultCanvas.width=w;resultCanvas.height=h;const ctx=resultCanvas.getContext("2d");ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(w/2,h/2);ctx.rotate(rad);ctx.scale(flipH?-1:1,flipV?-1:1);ctx.drawImage(imgEl,-imgEl.naturalWidth/2,-imgEl.naturalHeight/2);ctx.restore();resultCanvas.style.display="block";preview.querySelector("p").style.display="none";}
document.getElementById("btn-rot-left").addEventListener("click",()=>{angle=(angle-90+360)%360;render();});
document.getElementById("btn-rot-right").addEventListener("click",()=>{angle=(angle+90)%360;render();});
document.getElementById("btn-rot-180").addEventListener("click",()=>{angle=(angle+180)%360;render();});
document.getElementById("btn-flip-h").addEventListener("click",()=>{flipH=!flipH;render();});
document.getElementById("btn-flip-v").addEventListener("click",()=>{flipV=!flipV;render();});
const customAngle=document.getElementById("custom-angle");
customAngle.addEventListener("input",()=>{angle=parseInt(customAngle.value);document.getElementById("angle-val").textContent=angle;render();});
document.getElementById("btn-download").addEventListener("click",()=>{if(!imgEl){showToast("Load an image first.","warning");return;}const fmt=document.getElementById("format").value;const ext=fmt==="image/png"?"png":fmt==="image/webp"?"webp":"jpg";const a=document.createElement("a");a.href=resultCanvas.toDataURL(fmt,0.92);a.download=`${fileName}-rotated.${ext}`;a.click();showToast("Downloaded!","success");});
document.getElementById("btn-reset").addEventListener("click",()=>{angle=0;flipH=false;flipV=false;customAngle.value=0;document.getElementById("angle-val").textContent="0";if(imgEl)render();});
});
