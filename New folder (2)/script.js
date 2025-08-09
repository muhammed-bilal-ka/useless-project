// Motivational Progress Bar — core logic
// Idle detection: mouse + keyboard. Idle > IDLE_THRESHOLD starts filling.
// Activity drains the bar. Reaches 100% -> celebrate.

const IDLE_THRESHOLD = 5000;       // ms before filling starts
const FILL_RATE = 0.6;            // percent per second while idle
const DRAIN_RATE = 1.2;           // percent per second while active (faster drain)
const TICK_MS = 100;              // main tick interval

let percent = 0;
let lastActivity = Date.now();
let isIdle = false;
let chaosMode = false;
let confettiFired = false;

const barInner = document.getElementById('barInner');
const percentText = document.getElementById('percentText');
const messageEl = document.getElementById('message');
const resetBtn = document.getElementById('resetBtn');
const chaosToggle = document.getElementById('chaosToggle');
const applause = document.getElementById('applause'); // optional

// messages by range
function sarcasmFor(p){
  if (p < 25) return "Pace yourself, champ.";
  if (p < 50) return "You're doing nothing... perfectly.";
  if (p < 75) return "Inspirational levels of avoidance.";
  if (p < 100) return "Almost there... to ultimate unproductivity.";
  return "🎉 Delay Master!";
}

// update UI
function render(){
  barInner.style.width = percent.toFixed(1) + '%';
  percentText.innerText = Math.round(percent) + '%';
  messageEl.innerText = sarcasmFor(percent);
}

// reset
resetBtn.addEventListener('click', ()=>{
  percent = 0;
  confettiFired = false;
  render();
});

// chaos mode toggle
chaosToggle.addEventListener('change', (e)=>{
  chaosMode = e.target.checked;
});

// register activity events
['mousemove','keydown','wheel','touchstart'].forEach(ev=>{
  document.addEventListener(ev, ()=> {
    lastActivity = Date.now();
    isIdle = false;
    // small jitter: if user moves, start draining faster
  }, {passive:true});
});

// track visibility changes (alt-tab counts as activity away -> treat as extra procrastination)
// when tab becomes hidden we will treat it as "super idle" to reward procrastination
document.addEventListener('visibilitychange', ()=> {
  if (document.hidden) {
    // simulate being idle longer (bonus)
    lastActivity = Date.now() - IDLE_THRESHOLD - 2000;
  } else {
    lastActivity = Date.now();
  }
});

// main loop
setInterval(()=>{
  const now = Date.now();
  const idleTime = now - lastActivity;

  if (idleTime >= IDLE_THRESHOLD) {
    // idle: fill
    isIdle = true;
    const inc = (FILL_RATE * (TICK_MS/1000));
    percent = Math.min(100, percent + inc);
  } else {
    // active: drain
    isIdle = false;
    const dec = (DRAIN_RATE * (TICK_MS/1000));
    percent = Math.max(0, percent - dec);
  }

  // chaos mode: small random jitter gains when idle
  if (chaosMode && isIdle) {
    percent = Math.min(100, percent + (Math.random()*0.2));
  }

  render();

  // celebration at 100%
  if (percent >= 100 && !confettiFired) {
    confettiFired = true;
    // confetti
    try {
      confetti({
        particleCount: 160,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch(e){ /* confetti lib missing? ignore */ }

    // small applause if available
    try { if (applause) applause.play().catch(()=>{}); } catch(e){}

    // optional: flash message and add extra fake award
    messageEl.innerText = "🎉 DELAY MASTER — Certificate incoming!";
    if (chaosMode) {
      // bonus visual: rapid tiny confetti bursts
      try {
        let bursts = 4;
        let i = 0;
        const b = setInterval(()=>{
          confetti({ particleCount: 40, spread: 50, origin: { x: Math.random(), y: Math.random()*0.6 }});
          i++; if(i>=bursts) clearInterval(b);
        }, 200);
      } catch(e){}
    }
  }

}, TICK_MS);

// initial render
render();
