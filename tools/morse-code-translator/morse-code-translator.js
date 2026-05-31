document.addEventListener("DOMContentLoaded",()=>{
const MORSE={"A":".-","B":"-...","C":"-.-.","D":"-..","E":".","F":"..-.","G":"--.","H":"....","I":"..","J":".---","K":"-.-","L":".-..","M":"--","N":"-.","O":"---","P":".--.","Q":"--.-","R":".-.","S":"...","T":"-","U":"..-","V":"...-","W":".--","X":"-..-","Y":"-.--","Z":"--..","0":"-----","1":".----","2":"..---","3":"...--","4":"....-","5":".....","6":"-....","7":"--...","8":"---..","9":"----.",".":" .-.-.-",",":" --..--","?":" ..--..","!":" -.-.--","/":" -..-.","@":" .--.-.","&":" .-..."," ":" / "};
const REVERSE=Object.fromEntries(Object.entries(MORSE).map(([k,v])=>[v.trim(),k]));
const input=document.getElementById("input"),morseOut=document.getElementById("morse-output");
let dir="text-morse",playing=false,audioCtx=null,stopFlag=false;
document.getElementById("dir-tabs").addEventListener("click",e=>{const btn=e.target.closest("[data-dir]");if(!btn)return;dir=btn.dataset.dir;document.querySelectorAll("[data-dir]").forEach(b=>b.classList.remove("action-btn--active"));btn.classList.add("action-btn--active");document.getElementById("input-label").textContent=dir==="text-morse"?"Your Text":"Morse Code (use dots, dashes, spaces)";input.value="";morseOut.textContent="—";});
const wpmEl=document.getElementById("wpm"),freqEl=document.getElementById("freq");
wpmEl.addEventListener("input",()=>document.getElementById("wpm-val").textContent=wpmEl.value);
freqEl.addEventListener("input",()=>document.getElementById("freq-val").textContent=freqEl.value);
function textToMorse(text){return text.toUpperCase().split("").map(c=>MORSE[c]||"").join(" ").replace(/ +/g," ").trim();}
function morseToText(morse){return morse.trim().split(/ {3}| \/ | \/ /).map(word=>word.trim().split(" ").map(s=>REVERSE[s.trim()]||"?").join("")).join(" ");}
function translate(){const text=input.value;if(!text.trim()){morseOut.textContent="—";return;}if(dir==="text-morse"){morseOut.textContent=textToMorse(text);}else{morseOut.textContent=morseToText(text);}}
document.getElementById("btn-translate").addEventListener("click",()=>{translate();showToast("Translated!","success");});
input.addEventListener("input",translate);
async function playMorse(){
const morse=morseOut.textContent;if(morse==="—"||!morse){showToast("Translate something first.","warning");return;}
if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();
const wpm=parseInt(wpmEl.value),freq=parseInt(freqEl.value);
const dotDur=1200/wpm/1000;const dashDur=dotDur*3,gapDur=dotDur,letterGap=dotDur*3,wordGap=dotDur*7;
stopFlag=false;playing=true;document.getElementById("btn-play").disabled=true;document.getElementById("btn-stop").disabled=false;
let t=audioCtx.currentTime+0.1;
function beep(dur){const o=audioCtx.createOscillator();const g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);o.frequency.value=freq;g.gain.setValueAtTime(0.4,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);o.start(t);o.stop(t+dur);t+=dur+gapDur;}
for(const ch of morse){
if(stopFlag)break;
if(ch===".")beep(dotDur);
else if(ch==="-")beep(dashDur);
else if(ch===" ")t+=letterGap;
else if(ch==="/")t+=wordGap;
}
const totalMs=(t-audioCtx.currentTime)*1000;
setTimeout(()=>{if(!stopFlag){playing=false;document.getElementById("btn-play").disabled=false;document.getElementById("btn-stop").disabled=true;}},totalMs+200);
}
document.getElementById("btn-play").addEventListener("click",playMorse);
document.getElementById("btn-stop").addEventListener("click",()=>{stopFlag=true;playing=false;document.getElementById("btn-play").disabled=false;document.getElementById("btn-stop").disabled=true;});
document.getElementById("btn-copy").addEventListener("click",()=>{const morse=morseOut.textContent;if(morse==="—"){showToast("Translate first.","warning");return;}navigator.clipboard.writeText(morse).then(()=>showToast("Morse copied!","success"));});
document.getElementById("btn-clear").addEventListener("click",()=>{input.value="";morseOut.textContent="—";});
});
