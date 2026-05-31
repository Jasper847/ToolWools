document.addEventListener("DOMContentLoaded",()=>{
const input=document.getElementById("input"),output=document.getElementById("output");
let mode="chars";
document.getElementById("mode-tabs").addEventListener("click",e=>{
const btn=e.target.closest("[data-mode]");if(!btn)return;
mode=btn.dataset.mode;
document.querySelectorAll("[data-mode]").forEach(b=>b.classList.remove("action-btn--active"));
btn.classList.add("action-btn--active");
});
function reverseText(text){
switch(mode){
case "chars":return text.split("").reverse().join("");
case "words":return text.split(/\s+/).reverse().join(" ");
case "each-word":return text.split(" ").map(w=>w.split("").reverse().join("")).join(" ");
case "lines":return text.split("\n").reverse().join("\n");
default:return text.split("").reverse().join("");
}}
function isPalindrome(t){const s=t.toLowerCase().replace(/[^a-z0-9]/g,"");return s===s.split("").reverse().join("");}
input.addEventListener("input",()=>{
const t=input.value;
document.getElementById("stat-chars").textContent=t.length;
const p=t.trim()&&isPalindrome(t.trim());
const pe=document.getElementById("stat-palindrome");
pe.textContent=t.trim()?(p?"✓ Yes":"✗ No"):"—";
pe.style.color=t.trim()?(p?"var(--color-green)":"var(--color-red)"):"";
});
document.getElementById("btn-process").addEventListener("click",()=>{
if(!input.value.trim()){showToast("Enter some text first.","warning");return;}
output.value=reverseText(input.value);
showToast("Text reversed!","success");
});
document.getElementById("btn-copy").addEventListener("click",()=>{if(!output.value){showToast("Nothing to copy.","warning");return;}navigator.clipboard.writeText(output.value).then(()=>showToast("Copied!","success"));});
document.getElementById("btn-clear").addEventListener("click",()=>{input.value=output.value="";document.getElementById("stat-chars").textContent="0";document.getElementById("stat-palindrome").textContent="—";});
});
