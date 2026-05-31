document.addEventListener('DOMContentLoaded',()=>{
const input=document.getElementById('input'),output=document.getElementById('output'),mode=document.getElementById('mode');
function reverse(){
  const text=input.value;if(!text){output.value='';return;}
  switch(mode.value){
    case 'full':output.value=[...text].reverse().join('');break;
    case 'words':output.value=text.split(/\s+/).reverse().join(' ');break;
    case 'each-word':output.value=text.split(/\s+/).map(w=>[...w].reverse().join('')).join(' ');break;
    case 'lines':output.value=text.split('\n').reverse().join('\n');break;
  }
}
document.getElementById('btn-reverse').addEventListener('click',()=>{if(!input.value){showToast('Enter text first.','warning');return;}reverse();showToast('Text reversed!','success');});
document.getElementById('btn-copy').addEventListener('click',()=>{if(!output.value)return;navigator.clipboard.writeText(output.value).then(()=>showToast('Copied!','success'));});
input.addEventListener('input',reverse);mode.addEventListener('change',reverse);
});
