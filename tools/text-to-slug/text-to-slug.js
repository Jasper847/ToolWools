document.addEventListener('DOMContentLoaded',()=>{
const input=document.getElementById('input'),output=document.getElementById('output'),
sep=document.getElementById('separator'),maxLen=document.getElementById('max-length'),
optLower=document.getElementById('opt-lower');
const TRANSLITERATE={'à':'a','á':'a','â':'a','ã':'a','ä':'a','å':'a','æ':'ae','ç':'c','è':'e','é':'e','ê':'e','ë':'e','ì':'i','í':'i','î':'i','ï':'i','ð':'d','ñ':'n','ò':'o','ó':'o','ô':'o','õ':'o','ö':'o','ø':'o','ù':'u','ú':'u','û':'u','ü':'u','ý':'y','ÿ':'y','ß':'ss','ğ':'g','ş':'s','ı':'i','č':'c','ř':'r','ž':'z','ů':'u'};
function slugify(text){
  let s=text.normalize('NFD');
  s=s.split('').map(c=>TRANSLITERATE[c.toLowerCase()]||c).join('');
  s=s.replace(/[\u0300-\u036f]/g,'');
  if(optLower.checked)s=s.toLowerCase();
  const separator=sep.value;
  s=s.replace(/[^a-zA-Z0-9]+/g,separator);
  s=s.replace(new RegExp(`^\\${separator}|\\${separator}$`,'g'),'');
  const max=parseInt(maxLen.value)||80;
  if(s.length>max){s=s.substring(0,max);const lastSep=s.lastIndexOf(separator);if(lastSep>max*0.6)s=s.substring(0,lastSep);}
  return s;
}
function update(){output.value=slugify(input.value);}
input.addEventListener('input',update);sep.addEventListener('change',update);
maxLen.addEventListener('input',update);optLower.addEventListener('change',update);
document.getElementById('btn-generate').addEventListener('click',update);
document.getElementById('btn-copy').addEventListener('click',()=>{
  if(!output.value)return;navigator.clipboard.writeText(output.value).then(()=>showToast('Slug copied!','success'));
});
});
