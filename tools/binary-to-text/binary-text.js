document.addEventListener('DOMContentLoaded',()=>{
const textInput=document.getElementById('text-input'),binaryInput=document.getElementById('binary-input');
document.getElementById('btn-to-binary').addEventListener('click',()=>{
  const text=textInput.value;if(!text){showToast('Enter text to convert.','warning');return;}
  const binary=[...text].map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' ');
  binaryInput.value=binary;showToast('Converted to binary!','success');
});
document.getElementById('btn-to-text').addEventListener('click',()=>{
  const binary=binaryInput.value.trim();if(!binary){showToast('Enter binary to convert.','warning');return;}
  try{
    const text=binary.split(/\s+/).map(b=>{const n=parseInt(b,2);if(isNaN(n))throw new Error('Invalid');return String.fromCharCode(n);}).join('');
    textInput.value=text;showToast('Converted to text!','success');
  }catch(e){showToast('Invalid binary input. Use 8-bit groups separated by spaces.','error');}
});
document.getElementById('btn-copy').addEventListener('click',()=>{
  const val=binaryInput.value||textInput.value;if(!val)return;
  navigator.clipboard.writeText(val).then(()=>showToast('Copied!','success'));
});
// Real-time conversion
textInput.addEventListener('input',()=>{if(textInput.value)binaryInput.value=[...textInput.value].map(c=>c.charCodeAt(0).toString(2).padStart(8,'0')).join(' ');});
});
