document.addEventListener("DOMContentLoaded",()=>{
const prefixes=["get","use","try","go","the","my","we","be","pro","top","best","smart","easy","fast","quick","simple","super","ultra","mega","meta","next","now","app","web","digital","online","real","true","open","fresh","bright","bold","fly","run","jump","hub","lab","core","base","zone","spot","mind","peak","edge","apex","pulse","flow","spark","wave","forge","craft","build","make","create","design","work","team","link","sync","dash","flow","base","track","space","place"];
const suffixes=["app","hub","io","hq","pro","ai","ly","ify","ize","er","ify","labs","studio","works","team","base","core","zone","spot","tools","kit","box","cloud","tech","digital","solutions","agency","group","now","dev","code"];

function slug(text){return text.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");}
function suggest(keyword){
const kw=slug(keyword);
const exts=Array.from(document.querySelectorAll(".ext-check:checked")).map(c=>c.value);
const suggestions=new Set();
// Direct
exts.forEach(e=>suggestions.add(kw+e));
// With prefixes
prefixes.slice(0,10).forEach(p=>{exts.slice(0,3).forEach(e=>suggestions.add(p+kw+e));});
// With suffixes
suffixes.slice(0,10).forEach(s=>{exts.slice(0,3).forEach(e=>suggestions.add(kw+s+e));});
// Without vowels (Flickr-style)
const noVowel=kw.replace(/[aeiou]/g,"");
if(noVowel.length>2)exts.slice(0,2).forEach(e=>suggestions.add(noVowel+e));
// Word + number
[2,3,5,7,10,24].forEach(n=>exts.slice(0,2).forEach(e=>suggestions.add(kw+n+e)));
return Array.from(suggestions).slice(0,48);
}

document.getElementById("btn-suggest").addEventListener("click",()=>{
const kw=document.getElementById("keyword-input").value.trim();
if(!kw){showToast("Enter a keyword first.","warning");return;}
const domains=suggest(kw);
const grid=document.getElementById("domain-grid");
grid.innerHTML=domains.map(d=>{
const [name,ext]=d.split(/(?=\.[a-z]+$)/);
const url=`https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(d)}`;
return`<a href="${url}" target="_blank" rel="noopener noreferrer" class="domain-card" style="text-decoration:none"><div class="domain-name">${name}<span class="domain-ext">${ext||""}</span></div><div class="domain-tag">Check Availability →</div></a>`;
}).join("");
showToast(`Generated ${domains.length} domain ideas!`,"success");
});

document.getElementById("btn-copy-list").addEventListener("click",()=>{
const cards=document.querySelectorAll("#domain-grid .domain-card");
if(!cards.length){showToast("Generate suggestions first.","warning");return;}
const text=Array.from(cards).map(c=>c.querySelector(".domain-name").textContent+c.querySelector(".domain-ext").textContent).join("\n");
navigator.clipboard.writeText(text).then(()=>showToast("All domains copied!","success"));
});

document.getElementById("keyword-input").addEventListener("keydown",e=>{if(e.key==="Enter")document.getElementById("btn-suggest").click();});
});
