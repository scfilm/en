
// ================== CONFIG & STORAGE KEYS ==================
const PRICE = 99;
const STORAGE_KEYS = {
  paid: 'bh_paid',
  stats: 'bh_stats',
  srs: 'bh_srs',
  bestCombo: 'bh_best_combo',
  streak: 'bh_streak',
  lastDay: 'bh_last_day',
};
const arenaConfig = { hearts:5, roundSize:20, timePerQ:14, bossTime:8, correctScore:100, comboBonus:12 };

// ================== PAYWALL & NAV ==================
const isPaid = localStorage.getItem(STORAGE_KEYS.paid) === '1';
const startBtn = document.getElementById('startBtn');
const paywall = document.getElementById('paywall');
const closePay = document.getElementById('closePay');
const verifyBtn = document.getElementById('verifyBtn');

startBtn.addEventListener('click', ()=>{
  if(isPaid){ document.getElementById('arenaSection').scrollIntoView({behavior:'smooth'}); }
  else { paywall.classList.remove('hidden'); }
});
document.querySelectorAll('.card').forEach(el=>{
  el.addEventListener('click', ()=>{
    if(!localStorage.getItem(STORAGE_KEYS.paid)) paywall.classList.remove('hidden');
    else{
      const mod = el.getAttribute('data-module');
      if(mod==='vocab') document.getElementById('vocabSection').scrollIntoView({behavior:'smooth'});
      if(mod==='arena') document.getElementById('arenaSection').scrollIntoView({behavior:'smooth'});
      if(mod==='quest') document.getElementById('questSection').scrollIntoView({behavior:'smooth'});
      if(mod==='dash') document.getElementById('dashSection').scrollIntoView({behavior:'smooth'});
      if(mod==='review' || mod==='exam') alert('原型示意：该模块将在正式版开放完整功能。');
    }
  });
});
closePay?.addEventListener('click', ()=> paywall.classList.add('hidden'));
verifyBtn?.addEventListener('click', ()=>{
  localStorage.setItem(STORAGE_KEYS.paid,'1');
  paywall.classList.add('hidden');
  alert('验证成功，已开通30天访问权限！');
});

// ================== AUDIO (SFX & TTS) ==================
let audioOn = true, ttsOn = true;
const sfxToggle = document.getElementById('sfxToggle');
const ttsToggle = document.getElementById('ttsToggle');
sfxToggle.addEventListener('change', e => audioOn = e.target.checked);
ttsToggle.addEventListener('change', e => ttsOn = e.target.checked);

let audioCtx;
function initAudio(){
  if(!audioCtx){
    const AC = window.AudioContext || window.webkitAudioContext;
    if(AC) audioCtx = new AC();
  }
}
function beep(type='good'){
  if(!audioOn) return;
  initAudio();
  if(!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.connect(g); g.connect(audioCtx.destination);
  let freq = 880;
  if(type==='good'){ freq = 1040; }
  if(type==='bad'){ freq = 160; }
  if(type==='level'){ freq = 1400; }
  o.frequency.value = freq;
  g.gain.value = 0.001;
  const now = audioCtx.currentTime;
  g.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
  o.start(now);
  o.stop(now + 0.16);
}
function speakEN(text, rate=1.0){
  if(!ttsOn || !('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate; u.pitch = 1.0;
  window.speechSynthesis.speak(u);
}

// ================== SPEECH RECOGNITION ==================
let micOn = false;
const micToggle = document.getElementById('micToggle');
micToggle.addEventListener('change', e => micOn = e.target.checked);
function startSpeechInput(cb){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ alert('当前浏览器不支持语音识别，请改用输入或换 Chrome。'); return; }
  const rec = new SR();
  rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 1;
  rec.onresult = (e)=> { const text = e.results[0][0].transcript; cb(text); };
  rec.onerror = (e)=> { console.log('rec err', e.error); };
  rec.start();
}

// ================== CONFETTI ==================
const canvas = document.getElementById('burstCanvas'); const ctx = canvas.getContext('2d');
function resizeCanvas(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas); resizeCanvas();
function burst(x, y){
  const parts = [];
  for(let i=0;i<80;i++){
    parts.push({x,y,vx:(Math.random()*2-1)*6,vy:(Math.random()*2-1)*6-4,life:60+Math.random()*20,size:2+Math.random()*3});
  }
  function anim(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    parts.forEach(p=>{ p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.life--; ctx.fillStyle = ['#e07a3d','#2f9d7e','#4b9fd8','#b25aa1','#f0a34b'][Math.floor(Math.random()*5)]; ctx.fillRect(p.x,p.y,p.size,p.size); });
    if(parts.some(p=>p.life>0)) requestAnimationFrame(anim); else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  anim();
}

// ================== DATA: BASE ITEMS & 5000+ PROMPTS ==================
function baseItems(){
  const arr = [];
  function N(en, zh, tags=['survival'], syn=[]){ arr.push({type:'noun', en, zh, tags, ans:[en, ...syn]}); }
  function V(en, zh, tags=['survival'], syn=[]){ arr.push({type:'verb', en, zh, tags, ans:[en, ...syn]}); }
  function A(en, zh, tags=['survival'], syn=[]){ arr.push({type:'adj',  en, zh, tags, ans:[en, ...syn]}); }
  function P(en, zh, tags=['survival'], syn=[]){ arr.push({type:'phrase',en, zh, tags, ans:[en, ...syn]}); }
  // --- Only a curated subset; generator will expand to 5000+ prompts ---
  N('water','水',['survival']); N('food','食物',['survival']);
  N('toilet','厕所',['survival','nav'],['restroom','bathroom','washroom']);
  N('hospital','医院',['health']); N('doctor','医生',['health']); N('pharmacy','药店',['health'],['drugstore']);
  N('medicine','药',['health']); N('painkiller','止痛药',['health']); N('bandage','绷带',['health']);
  N('address','地址',['nav']); N('map','地图',['nav']); N('phone','手机',['survival'],['mobile','cellphone']);
  N('charger','充电器',['survival']); N('battery','电池/电量',['survival']);
  N('wallet','钱包',['money']); N('passport','护照',['travel']); N('visa','签证',['travel']); N('embassy','使馆',['travel']);
  N('police','警察',['health','survival']); N('station','车站',['nav','travel']);
  N('bus','公交车',['travel']); N('train','火车',['travel']);
  N('ticket','票',['travel','money']); N('airport','机场',['travel']); N('flight','航班',['travel']); N('gate','登机口',['travel']);
  N('hotel','酒店',['travel']); N('room','房间',['travel']); N('key','钥匙',['travel']);
  N('menu','菜单',['survival']); N('price','价格',['money']); N('discount','折扣',['money']);
  N('cash','现金',['money']); N('card','银行卡',['money']); N('receipt','小票',['money']); N('invoice','发票',['money']);
  N('change','零钱',['money']); N('coin','硬币',['money']); N('bottle','瓶子',['survival']); N('bag','袋子',['survival']);
  N('taxi','出租车',['travel'],['cab']); N('subway','地铁',['travel'],['metro']);
  N('museum','博物馆',['travel']); N('bank','银行',['money']); N('ATM','取款机',['money']);
  N('password','密码',['survival']); N('wifi','Wi‑Fi',['survival'],['wi-fi','wi fi','wifi']);
  N('emergency','紧急情况',['health','survival']); N('ambulance','救护车',['health']);
  N('umbrella','雨伞',['travel']); N('allergy','过敏',['health']); N('fever','发烧',['health']);
  N('headache','头痛',['health']); N('stomachache','胃痛',['health'],['stomach ache']);
  N('towel','毛巾',['survival']); N('supermarket','超市',['survival']);
  N('direction','方向',['nav']); N('north','北',['nav']); N('south','南',['nav']); N('east','东',['nav']); N('west','西',['nav']);
  N('left','左',['nav']); N('right','右',['nav']); N('elevator','电梯',['travel'],['lift']);
  N('stairs','楼梯',['travel']); N('floor','楼层',['travel']);
  N('time','时间',['time']); N('hour','小时',['time']); N('minute','分钟',['time']); N('morning','早上',['time']); N('evening','傍晚',['time']); N('night','夜晚',['time']);
  A('hungry','饿',['survival']); A('thirsty','渴',['survival']); A('lost','迷路',['nav']); A('sick','生病',['health']);
  A('cheap','便宜',['money']); A('expensive','昂贵',['money']); A('safe','安全',['survival']); A('dangerous','危险',['survival']);
  A('broken','坏了',['survival']); A('hot','热',['survival']); A('cold','冷',['survival']);
  V('eat','吃',['survival']); V('drink','喝',['survival']); V('help','帮助',['survival']); V('find','找',['survival']);
  V('buy','买',['money']); V('pay','付款',['money']); V('turn','转弯',['nav']); V('stop','停止',['nav']); V('book','预订',['travel'],['reserve']);
  V('cancel','取消',['travel']); V('open','打开',['survival']); V('close','关闭',['survival']); V('charge','充电',['survival']); V('fix','修理',['survival']);
  V('speak','说',['social']); V('understand','明白',['social']); V('read','读',['exam']); V('write','写',['exam']);
  P('turn left','左转',['nav']); P('turn right','右转',['nav']); P('go straight','直走',['nav']); P('how much','多少钱',['money']);
  P('where is the toilet','厕所在哪里',['survival','nav']); P('I need a doctor','我需要医生',['health']); P('call the police','报警',['health']);
  P('I am lost','我迷路了',['nav']); P('please help me','请帮忙',['survival']); P('excuse me','打扰一下',['social']);
  P('thank you','谢谢',['social']); P('no problem','没问题',['social']);
  P('speak slowly','说慢一点',['social']); P('one more time','再来一次',['social']);
  P("I don't understand",'我不明白',['social']); P('check in','办理入住',['travel']); P('check out','退房',['travel']);
  P('I want to book a room','我想订房',['travel']); P("what's the Wi-Fi password","Wi‑Fi 密码是多少",['survival']);
  return arr;
}
const TPL = {
  noun:['你需要【{zh}】——请打出英文。','生存场景：立刻要{zh}，你会输入哪个英文？','把“{zh}”写成英文：','在陌生城市找{zh}，你会打出哪个词？','填空：I need ____（{zh}）。','危机中你只会说一个词：{zh}。快打出来！'],
  verb:['动作需求：你想要【{zh}】，对应英文动词？','把“{zh}”打成英文动词。','紧急操作：立刻要{zh}，英文动词是什么？','填空：Please ____!（{zh}）','导航提示：到路口请{zh}——英文动词？'],
  adj:['你的状态是【{zh}】——打出英文形容词。','医生问你感觉如何：我很{zh}。英文是？','填空：I am ____（{zh}）。','告示牌：The museum is ____（{zh}）。'],
  phrase:['常用表达：把“{zh}”打成英文短语。','你要说：{zh}——英文是？','填空：____（{zh}）','过关口令：输入这句英文：{zh}','紧急情况你会说：{zh}，英文？']
};
function generateQuestions(){
  const base = baseItems(); const qs = [];
  for(const it of base){
    const tpls = TPL[it.type];
    for(const tpl of tpls){
      const text = tpl.replace('{zh}', it.zh);
      qs.push({q:text, ans: it.ans.map(s=>s.toLowerCase()), type: it.type, tags: it.tags, en: it.ans[0]});
    }
  }
  const extras = []; const variants = ['现在就打出来','用英文键入','快！英文是什么','手机里你会怎么敲','一分钟挑战：打出英文'];
  for(const it of base){ for(let i=0;i<6;i++){ const text = `${it.zh}：${variants[i%variants.length]}`; extras.push({q:text, ans: it.ans.map(s=>s.toLowerCase()), type: it.type, tags: it.tags, en: it.ans[0]}); } }
  const all = qs.concat(extras);
  while(all.length < 5200){ const it = all[Math.floor(Math.random()*qs.length)]; all.push({...it, q: it.q + '（快速版）'}); }
  return all;
}
const ALL_QUESTIONS = generateQuestions();

// ================== ARENA GAMEPLAY ==================
const heartsEl = document.getElementById('hearts');
const comboEl = document.getElementById('combo');
const scoreEl = document.getElementById('score');
const progressBar = document.getElementById('progressBar');
const timerEl = document.getElementById('timer');
const questionEl = document.getElementById('question');
const inputEl = document.getElementById('answerInput');
const submitBtn = document.getElementById('submitBtn');
const skipBtn = document.getElementById('skipBtn');
const startArenaBtn = document.getElementById('startArena');
const bossBtn = document.getElementById('bossBtn');
const chipBtns = document.querySelectorAll('.chip');
const timerToggle = document.getElementById('timerToggle');
const micBtn = document.getElementById('micBtn');

let arenaState = { round:[], idx:0, hearts:arenaConfig.hearts, score:0, combo:1, timer:null, timeLeft:arenaConfig.timePerQ, tag:'all', boss:false };

function setHearts(n){ heartsEl.innerHTML = Array.from({length:arenaConfig.hearts}).map((_,i)=>`<div class="heart ${i < n ? '' : 'off'}"></div>`).join(''); }
function setCombo(x){ comboEl.textContent = '×' + x; }
function setScore(s){ scoreEl.textContent = s; localStats().correctPlus=localStats().correctPlus||0; }
function setProgress(i,total){ progressBar.style.width = (100*(i/Math.max(total,1))).toFixed(1)+'%'; }
function setTimer(t){ timerEl.textContent = (t<0?'--':t+'s'); }
function nextQuestion(){
  if(arenaState.idx >= arenaState.round.length){
    questionEl.innerHTML = '本轮通关！🎉 准备下一轮或挑战BOSS。';
    burst(window.innerWidth/2, 120); beep('level'); saveBestCombo();
    addStudyMinutes(2); // 粗略计时：每轮+2分钟
    updateDashboard(); return;
  }
  const item = arenaState.round[arenaState.idx];
  questionEl.innerHTML = item.q; inputEl.value=''; inputEl.focus();
  if(timerToggle.checked){
    clearInterval(arenaState.timer);
    arenaState.timeLeft = arenaState.boss ? arenaConfig.bossTime : arenaConfig.timePerQ;
    setTimer(arenaState.timeLeft);
    arenaState.timer = setInterval(()=>{
      arenaState.timeLeft--; setTimer(arenaState.timeLeft);
      if(arenaState.timeLeft<=0){ clearInterval(arenaState.timer); wrongAnswer(item, true); }
    }, 1000);
  }else setTimer(-1);
}
function buildRound(tag='all', size=arenaConfig.roundSize){
  const pool = (tag==='all') ? ALL_QUESTIONS : ALL_QUESTIONS.filter(q=>q.tags.includes(tag));
  const arr = pool.sort(()=>Math.random()-0.5).slice(0, size);
  return arr;
}
function correctAnswer(item){
  beep('good'); speakEN(item.en); arenaState.score += arenaConfig.correctScore + Math.floor(arenaState.combo*arenaConfig.comboBonus);
  arenaState.combo++; setCombo(arenaState.combo); setScore(arenaState.score); arenaState.idx++;
  setProgress(arenaState.idx, arenaState.round.length);
  const rect = questionEl.getBoundingClientRect(); burst(rect.left + rect.width/2, rect.top + window.scrollY + rect.height/2);
  incStat('correct'); nextQuestion();
}
function wrongAnswer(item, timeout=false){
  beep('bad'); arenaState.combo = 1; setCombo(1); arenaState.hearts--; setHearts(arenaState.hearts);
  arenaState.round.splice(arenaState.idx+3, 0, item);
  if(arenaState.hearts <= 0){ questionEl.innerHTML = '闯关失败 💥 Hearts=0。点击“开始对战”重来！\n正确答案示例：' + item.en; return; }
  questionEl.innerHTML = (timeout?'时间到！':'答错啦！') + ' 正确：<b>' + item.en + '</b>';
  arenaState.idx++; setProgress(arenaState.idx, arenaState.round.length); incStat('wrong'); setTimeout(nextQuestion, 700);
}
submitBtn.addEventListener('click', ()=>{ const text = inputEl.value.trim().toLowerCase(); const item = arenaState.round[arenaState.idx]; if(!item) return; if(text && item.ans.includes(text)) correctAnswer(item); else wrongAnswer(item); });
inputEl.addEventListener('keydown', e=>{ if(e.key==='Enter') submitBtn.click(); });
skipBtn.addEventListener('click', ()=>{ const item = arenaState.round[arenaState.idx]; if(!item) return; wrongAnswer(item); });
startArenaBtn.addEventListener('click', ()=>{ arenaState = { round:buildRound(arenaState.tag), idx:0, hearts:arenaConfig.hearts, score:arenaState.score, combo:1, timer:null, timeLeft:arenaConfig.timePerQ, tag:arenaState.tag, boss:false }; setHearts(arenaState.hearts); setCombo(1); setProgress(0, arenaState.round.length); setTimer(-1); nextQuestion(); });
bossBtn.addEventListener('click', ()=>{ arenaState = { round:buildRound(arenaState.tag, 10), idx:0, hearts:3, score:arenaState.score, combo:1, timer:null, timeLeft:arenaConfig.bossTime, tag:arenaState.tag, boss:true }; setHearts(arenaState.hearts); setCombo(1); setProgress(0, arenaState.round.length); setTimer(-1); nextQuestion(); });
chipBtns.forEach(btn=> btn.addEventListener('click', ()=>{ chipBtns.forEach(b=>b.classList.remove('on')); btn.classList.add('on'); arenaState.tag = btn.dataset.tag; }));
micBtn.addEventListener('click', ()=>{
  if(!micOn){ micToggle.checked = true; micOn = true; }
  startSpeechInput(text=>{ inputEl.value = text; submitBtn.click(); });
});

// Stats & streaks
function incStat(k){
  const obj = JSON.parse(localStorage.getItem(STORAGE_KEYS.stats)||'{}');
  obj[k] = (obj[k]||0)+1; localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(obj));
  updateDashboard();
}
function localStats(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.stats)||'{}'); }
function addStudyMinutes(min){ const s = localStats(); s.mToday = (s.mToday||0)+min; localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(s)); }
function saveBestCombo(){ const best = Number(localStorage.getItem(STORAGE_KEYS.bestCombo)||0); if(arenaState.combo>best) localStorage.setItem(STORAGE_KEYS.bestCombo, String(arenaState.combo)); }
function updateStreak(){ const today = new Date().toDateString(); const last = localStorage.getItem(STORAGE_KEYS.lastDay); let streak = Number(localStorage.getItem(STORAGE_KEYS.streak)||0); if(last !== today){ streak = last ? streak+1 : 1; localStorage.setItem(STORAGE_KEYS.lastDay, today); localStorage.setItem(STORAGE_KEYS.streak, String(streak)); } }

// ================== NBNT QUEST ENGINE ==================
const questListEl = document.getElementById('questList');
const needText = document.getElementById('needText');
const storyText = document.getElementById('storyText');
const toStep2 = document.getElementById('toStep2');
const toStep3 = document.getElementById('toStep3');
const toStep4 = document.getElementById('toStep4');
const toStep5 = document.getElementById('toStep5');
const toStep6 = document.getElementById('toStep6');
const restartQuest = document.getElementById('restartQuest');
const actionHint = document.getElementById('actionHint');
const actionFeedback = document.getElementById('actionFeedback');
const questInput = document.getElementById('questInput');
const questSubmit = document.getElementById('questSubmit');
const questMic = document.getElementById('questMic');
const retellMic = document.getElementById('retellMic');
const retellTimer = document.getElementById('retellTimer');
const retellResult = document.getElementById('retellResult');
const srsPlanEl = document.getElementById('srsPlan');

const qsteps = ['qstep1','qstep2','qstep3','qstep4','qstep5','qstep6'].map(id=>document.getElementById(id));
function setStep(i){ qsteps.forEach((el,idx)=> el.classList.toggle('on', idx===i)); }
setStep(0);

const QUESTS = [
  { id:'restroom_metro', title:'地铁站找厕所', need:'孩子急着上厕所，你在地铁站人山人海。', story:[
    '你：Excuse me.','工作人员：Yes?','你：Where is the restroom?'
  ], key:['restroom','toilet','bathroom','washroom'], tip:'说/输入表示“厕所”的英文。', transfer:'换到商场保安处再问一次。'},
  { id:'hungry_street', title:'街头找吃的', need:'你走了两小时又饿又累。', story:[
    '你：I am hungry. Is there any restaurant nearby?','路人：Go straight and turn left.'
  ], key:['hungry'], tip:'说出你“很饿”的表达。', transfer:'换到火车站再问一次。'},
  { id:'pharmacy_fever', title:'发烧找药店', need:'你发烧了，附近需要药店与退烧药。', story:[
    '你：I need a pharmacy.','店员：We have medicine and painkillers.'
  ], key:['pharmacy','drugstore'], tip:'“药店”的常用英文是？', transfer:'在商场的服务台再问一次。'},
  { id:'gate_airport', title:'机场问登机口', need:'起飞前 30 分钟，你急着找登机口 C12。', story:[
    '你：Excuse me, where is gate C12?','工作人员：Take the elevator and go straight.'
  ], key:['gate'], tip:'登机口的英文是（输入单个单词即可）。', transfer:'在换乘航站楼再问一次。'},
  { id:'police_lost', title:'钱包丢了找警察', need:'你的钱包在地铁里丢了，需要报警。', story:[
    '你：Please help me. I lost my wallet.','警察：When and where?'
  ], key:['police'], tip:'你要找“警察”，英文单词是？', transfer:'在游客中心再说一次。'}
];
function renderQuestList(){
  questListEl.innerHTML = QUESTS.map(q=>`<div class="quest-item" data-id="${q.id}">${q.title}</div>`).join('');
}
renderQuestList();
let currentQuest = null, keyPassed = false;

questListEl.addEventListener('click', e=>{
  const item = e.target.closest('.quest-item'); if(!item) return;
  currentQuest = QUESTS.find(q=>q.id===item.dataset.id);
  needText.textContent = currentQuest.need; storyText.innerHTML = currentQuest.story.map(l=>`<div>· ${l}</div>`).join('');
  actionHint.textContent = '关键口令：' + currentQuest.tip;
  setStep(0);
});

toStep2.addEventListener('click', ()=>{
  if(!currentQuest){ alert('请先在左侧选择一个任务'); return; }
  setStep(1); // story
});
document.querySelectorAll('.shadowing button').forEach(btn=> btn.addEventListener('click', ()=>{
  if(!currentQuest) return;
  const rate = Number(btn.dataset.rate||1);
  currentQuest.story.forEach((line,i)=> setTimeout(()=> speakEN(line, rate), i*900));
}));
toStep3.addEventListener('click', ()=>{
  if(!currentQuest){ alert('请先在左侧选择一个任务'); return; }
  setStep(2);
  keyPassed = false; actionFeedback.textContent = '';
  questInput.value=''; questInput.focus();
});
questSubmit.addEventListener('click', ()=>{
  const text = questInput.value.trim().toLowerCase();
  if(!currentQuest) return;
  if(text && currentQuest.key.some(k=>k.toLowerCase()===text)){
    keyPassed = true; actionFeedback.innerHTML = '✅ 口令正确：<b>'+ currentQuest.key[0] +'</b>'; beep('good'); speakEN(currentQuest.key[0]);
    const rect = questInput.getBoundingClientRect(); burst(rect.left + rect.width/2, rect.top + window.scrollY);
  }else{
    keyPassed = false; actionFeedback.innerHTML = '❌ 未通过。提示：' + currentQuest.tip; beep('bad');
  }
});
questInput.addEventListener('keydown', e=>{ if(e.key==='Enter') questSubmit.click(); });
questMic.addEventListener('click', ()=> startSpeechInput(text=>{ questInput.value = text; questSubmit.click(); }));

toStep4.addEventListener('click', ()=>{
  if(!keyPassed){ alert('先通过关键口令'); return; }
  setStep(3);
});
toStep5.addEventListener('click', ()=> setStep(4));

// Retell (30s)
let retellInterval = null, retellLeft = 30;
retellMic.addEventListener('click', ()=>{
  retellLeft = 30; retellTimer.textContent = retellLeft;
  retellResult.textContent = '录音中…（若无反应，可能浏览器不支持语音识别）';
  startSpeechInput(text=>{ retellResult.textContent = text; });
  clearInterval(retellInterval);
  retellInterval = setInterval(()=>{ retellLeft--; retellTimer.textContent = retellLeft; if(retellLeft<=0){ clearInterval(retellInterval); } }, 1000);
});

toStep6.addEventListener('click', ()=>{
  if(!currentQuest){ return; }
  // Simple SRS scheduling
  const now = Date.now();
  const plan = [{t:now + 1000*60*10, label:'10分钟后'}, {t:now + 1000*60*60*24, label:'1天后'}, {t:now + 1000*60*60*72, label:'3天后'}, {t:now + 1000*60*60*24*7, label:'7天后'}];
  const srs = JSON.parse(localStorage.getItem(STORAGE_KEYS.srs)||'{}');
  srs[currentQuest.id] = plan.map(p=>p.t); // store timestamps
  localStorage.setItem(STORAGE_KEYS.srs', JSON.stringify(srs));
  srsPlanEl.innerHTML = '复习安排：' + plan.map(p=>p.label).join('、');
  setStep(5);
  addStudyMinutes(3); updateDashboard();
});
restartQuest.addEventListener('click', ()=> setStep(0));

// ================== VOCAB SAMPLE ==================
const VOCAB = [
  {word:'hungry', root:'hung(er)-', meaning:'饥饿的', story:'[需求] 你在街头饿坏了，只会说 hungry，店员立刻明白并递来菜单。'},
  {word:'benefit', root:'bene- (good)', meaning:'好处；使受益', story:'bene=好 + fit=做：做了好事 → 好处。'},
  {word:'malfunction', root:'mal- (bad) + funct (do)', meaning:'故障', story:'机器“做坏了”=故障。'},
  {word:'transport', root:'trans- (across) + port (carry)', meaning:'运输', story:'把东西“横跨”搬运。'},
  {word:'inspect', root:'in- (into) + spect (look)', meaning:'检查', story:'往里看一看。'},
  {word:'project', root:'pro- (forward) + ject (throw)', meaning:'项目；投射', story:'向前抛出一个想法=项目。'},
  {word:'predict', root:'pre- (before) + dict (say)', meaning:'预言', story:'提前说=预测。'},
  {word:'autograph', root:'auto- (self) + graph (write)', meaning:'亲笔签名', story:'自己写下的名字。'},
  {word:'biology', root:'bio- (life) + -logy (study)', meaning:'生物学', story:'研究生命。'},
  {word:'thermal', root:'therm- (heat)', meaning:'热的', story:'热水袋=thermal bottle。'},
  {word:'telephone', root:'tele- (far) + phone (sound)', meaning:'电话', story:'远方的声音。'},
  {word:'microcosm', root:'micro- (small) + cosm (world)', meaning:'微观世界', story:'小小的世界。'},
  {word:'macroeconomics', root:'macro- (large) + eco (house) + nom (rule)', meaning:'宏观经济学', story:'管理“大屋子”的规则。'},
  {word:'chronology', root:'chron- (time) + -logy', meaning:'年代学；年表', story:'按时间排队。'},
  {word:'phobia', root:'phob- (fear)', meaning:'恐惧症', story:'对某物的强烈害怕。'},
  {word:'audiology', root:'aud- (hear) + -logy', meaning:'听力学', story:'研究听觉。'},
  {word:'visible', root:'vid/vis (see)', meaning:'可见的', story:'能被看见。'},
  {word:'attract', root:'ad- (to) + tract (pull)', meaning:'吸引', story:'把你拉过来。'},
  {word:'construct', root:'con- (together) + struct (build)', meaning:'建造', story:'一起搭建。'},
  {word:'reduce', root:'re- (back) + duc (lead)', meaning:'减少', story:'把数量往回带。'}
];
const vocabList = document.getElementById('vocabList');
const searchInput = document.getElementById('searchInput');
const shuffleBtn = document.getElementById('shuffleBtn');
function renderVocab(list){
  vocabList.innerHTML = list.map(v => `
    <div class="v-item">
      <div class="word">${v.word}</div>
      <div class="meaning">${v.meaning}</div>
      <div class="root">词根/构词：${v.root}</div>
      <div class="story">${v.story}</div>
    </div>
  `).join('');
}
renderVocab(VOCAB);
searchInput?.addEventListener('input', e=>{ const q = e.target.value.trim().toLowerCase();
  const list = VOCAB.filter(v => [v.word, v.root, v.meaning].join(' ').toLowerCase().includes(q)); renderVocab(list); });
shuffleBtn?.addEventListener('click', ()=>{ const arr = [...VOCAB].sort(()=>Math.random()-0.5).slice(0,10); renderVocab(arr); });

// ================== DASHBOARD ==================
function updateDashboard(){
  const s = localStats();
  document.getElementById('mToday').textContent = s.mToday||0;
  document.getElementById('cwCount').textContent = (s.correct||0) + ' / ' + (s.wrong||0);
  document.getElementById('bestCombo').textContent = localStorage.getItem(STORAGE_KEYS.bestCombo)||0;
  document.getElementById('dueCount').textContent = countDueReviews();
  document.getElementById('streak').textContent = localStorage.getItem(STORAGE_KEYS.streak)||0;
}
function countDueReviews(){
  const srs = JSON.parse(localStorage.getItem(STORAGE_KEYS.srs)||'{}'); const now = Date.now();
  let c = 0; for(const k in srs){ const arr = srs[k]; if(arr.some(t=>t <= now)) c++; } return c;
}
updateStreak(); updateDashboard();
