document.addEventListener('DOMContentLoaded',()=>{
const input=document.getElementById('input'),output=document.getElementById('output'),
stats=document.getElementById('stats'),optTrim=document.getElementById('opt-trim'),
optCase=document.getElementById('opt-case'),optSort=document.getElementById('opt-sort'),
optEmpty=document.getElementById('opt-empty');
document.getElementById('btn-remove').addEventListener('click',()=>{
  if(!input.value.trim()){showToast('Enter some text first.','warning');return;}
  let lines=input.value.split('\n');
  const origCount=lines.length;
  if(optTrim.checked)lines=lines.map(l=>l.trim());
  if(optEmpty.checked)lines=lines.filter(l=>l!=='');
  const seen=new Set();const unique=[];
  lines.forEach(l=>{const key=optCase.checked?l.toLowerCase():l;if(!seen.has(key)){seen.add(key);unique.push(l);}});
  let result=optSort.checked?unique.sort((a,b)=>a.localeCompare(b)):unique;
  output.value=result.join('\n');
  const removed=origCount-result.length;
  stats.textContent=`${origCount} lines → ${result.length} unique (${removed} duplicates removed)`;
  showToast(`Removed ${removed} duplicate line${removed!==1?'s':''}!`,'success');
});
document.getElementById('btn-copy').addEventListener('click',()=>{
  if(!output.value)return;navigator.clipboard.writeText(output.value).then(()=>showToast('Copied!','success'));
});
// Real-time preview
input.addEventListener('input',()=>{const lines=input.value.split('\n');stats.textContent=`${lines.length} lines entered`;});
});
