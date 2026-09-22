const rec=new (window.SpeechRecognition||window.webkitSpeechRecognition)();
rec.lang='en-GB';rec.interimResults=1;rec.continuous=1;

const s=document.getElementById('s'),d=document.getElementById('d'),b=document.getElementById('b'),t=document.getElementById('t');
let awake=0,running=1;

const GREETINGS=['hello','hi','wake up','good morning','good afternoon','good evening','i\'m home','i am home','hey','anyone there'];

function say(txt){speechSynthesis.speak(new SpeechSynthesisUtterance(txt))}
function searchGoogle(q){window.open(`https://google.com/search?q=${encodeURIComponent(q)}`,'_blank')}
function restart(){running&&setTimeout(()=>{try{rec.start()}catch(e){}},100)}

rec.onresult=async e=>{
  let txt='';
  for(let i=e.resultIndex;i<e.results.length;i++)txt+=e.results[i][0].transcript;
  txt=txt.toLowerCase().trim();t.textContent=txt;

  if(!awake){
    const wake=GREETINGS.some(g=>txt.includes(g));
    if(wake){
      awake=1;d.classList.remove('listen');d.classList.add('awake');
      say("Hello! I'm here. How can I help?");
    }
    return
  }

  if(awake&&txt.length>2){
    awake=0;d.classList.remove('awake');d.classList.add('listen');
    if(txt.includes('search')||txt.includes('google')||txt.includes('look up')||txt.includes('find')){
      let q=txt.replace(/search|google|look up|find|for|please|can you/gi,'').trim();
      if(q){say(`Searching Google for ${q}`);searchGoogle(q)}
      else{say("What would you like me to search for?");awake=1;d.classList.add('awake')}
      return
    }
    say(`Understood. I can search Google for you — say search followed by what you need.`);
  }
};
rec.onend=restart;rec.onerror=restart;

b.onclick=()=>{
  b.classList.add('hid');
  d.classList.add('listen');
  s.textContent='✅ Listening — say hello, hi, or wake up';
  rec.start();
};
