document.addEventListener('DOMContentLoaded',()=>{
const input=document.getElementById('input'),output=document.getElementById('output'),
replacement=document.getElementById('replacement'),customSep=document.getElementById('custom-sep');
replacement.addEventListener('change',()=>{customSep.style.display=replacement.value==='custom'?'inline-block':'none';});
document.getElementById('btn-remove').addEventListener('click',()=>{
  if(!input.value){showToast('Paste some text first.','warning');return;}
  let sep=replacement.value==='custom'?customSep.value:replacement.value;
  const result=input.value.replace(/\r\n|\r|\n/g,sep);
  output.value=result;
  const removed=(input.value.match(/\r\n|\r|\n/g)||[]).length;
  showToast(`Removed ${removed} line break${removed!==1?'s':''}!`,'success');
});
document.getElementById('btn-copy').addEventListener('click',()=>{
  if(!output.value)return;navigator.clipboard.writeText(output.value).then(()=>showToast('Copied!','success'));
});
});
