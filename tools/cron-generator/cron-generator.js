document.addEventListener("DOMContentLoaded",()=>{
const fields=["min","hr","dom","mon","dow"];
const presets=[
{label:"Every minute",expr:"* * * * *"},
{label:"Every hour",expr:"0 * * * *"},
{label:"Every day midnight",expr:"0 0 * * *"},
{label:"Every Monday 9am",expr:"0 9 * * 1"},
{label:"Every weekday 8am",expr:"0 8 * * 1-5"},
{label:"Every Sunday noon",expr:"0 12 * * 0"},
{label:"1st of month",expr:"0 0 1 * *"},
{label:"Every 15 min",expr:"*/15 * * * *"},
{label:"Every 5 min",expr:"*/5 * * * *"},
{label:"Twice daily",expr:"0 8,20 * * *"},
{label:"Every 3 hours",expr:"0 */3 * * *"},
{label:"Quarterly",expr:"0 0 1 1,4,7,10 *"},
];
const presetGrid=document.getElementById("preset-grid");
presets.forEach(p=>{const btn=document.createElement("button");btn.className="action-btn";btn.textContent=p.label;btn.addEventListener("click",()=>{setExpr(p.expr);showToast(p.label+" selected","success");});presetGrid.appendChild(btn);});
document.getElementById("btn-presets-show").addEventListener("click",()=>{const panel=document.getElementById("presets-panel");panel.style.display=panel.style.display==="none"?"":"none";});
function setExpr(expr){const parts=expr.split(" ");if(parts.length!==5)return;parts.forEach((v,i)=>{const el=document.getElementById("cron-"+["min","hr","dom","mon","dow"][i]);if(el)el.value=v;});updateOutput();}
const descriptions={min:{"*":"every minute","0":"at minute 0"},hr:{"*":"","0":" at midnight"},dom:{"*":"","1":" on the 1st"},mon:{"*":"","1":" in January"},dow:{"*":"","1":" on Monday","0":" on Sunday","1-5":" on weekdays","6-7":" on weekends"}};
function describe(parts){
const[min,hr,dom,mon,dow]=parts;
let d="Runs ";
if(min==="*"&&hr==="*")d+="every minute";
else if(min.startsWith("*/"))d+=`every ${min.slice(2)} minutes`;
else if(hr==="*")d+=`at minute ${min} of every hour`;
else d+=`at ${hr.padStart(2,"0")}:${min.padStart(2,"0")}`;
if(dom!=="*")d+=` on day ${dom}`;
if(mon!=="*")d+=` in month ${mon}`;
if(dow==="1-5")d+=" (weekdays only)";
else if(dow==="0,6"||dow==="6,0"||dow==="0-6"&&dow!=="*")d+=" (weekends)";
else if(dow!=="*")d+=` on weekday ${dow}`;
return d;
}
function updateOutput(){
const expr=fields.map(f=>document.getElementById("cron-"+f).value.trim()||"*").join(" ");
document.getElementById("cron-output").textContent=expr;
document.getElementById("cron-desc").textContent=describe(expr.split(" "));
}
fields.forEach(f=>document.getElementById("cron-"+f).addEventListener("input",updateOutput));
["min","hr","dom","mon","dow"].forEach((f,i)=>{document.getElementById(f+"-mode").addEventListener("change",e=>{const v=e.target.value;const el=document.getElementById("cron-"+f);if(v==="*")el.value="*";else if(v==="weekdays")el.value="1-5";else if(v==="weekends")el.value="0,6";else if(v==="last")el.value="L";updateOutput();});});
document.getElementById("btn-copy").addEventListener("click",()=>{const expr=document.getElementById("cron-output").textContent;navigator.clipboard.writeText(expr).then(()=>showToast("Cron expression copied!","success"));});
updateOutput();
});
