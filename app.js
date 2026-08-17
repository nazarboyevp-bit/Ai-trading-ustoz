const KEY='ATU_FULL_V1';
const curriculum=[
["1","Trading asoslari","Trading, bozorlar, broker, spread, pip, lot, leverage, margin, orderlar, SL/TP"],
["2","Candlestick va grafik","Shamlar, timeframe, trend, swing high/low, support/resistance"],
["3","Market Structure","HH, HL, LH, LL, BOS, CHOCH va kontekst"],
["4","Liquidity","Equal highs/lows, stoplar, liquidity sweep va inducement"],
["5","Price Action","Displacement, rejection, impuls/koreksiya va confirmation"],
["6","SMC","Order block, FVG, premium/discount, mitigation"],
["7","ICT","Liquidity model, dealing range, sessionlar va setup qurish"],
["8","Fundamental tahlil","CPI, NFP, FOMC, foizlar, DXY va yangiliklar"],
["9","Risk va psixologiya","Risk %, R:R, drawdown, position sizing, revenge trading"],
["10","Professional tizim","Backtest, statistika, trading plan, demo va intizom"]
];
const quiz=[
["Tradingda risk managementning asosiy maqsadi nima?",["Ko‘proq leverage olish","Kapitalni himoya qilish","Ko‘proq trade ochish","Har doim foyda qilish"],1],
["SL nimani bildiradi?",["Stop Loss","Safe Lot","Spread Limit","Session Level"],0],
["BOS odatda nimani anglatadi?",["Break Of Structure","Buy Only Setup","Bank Order Signal","Best Open Spread"],0],
["Liquidity sweep nimaga yaqin tushuncha?",["Bozor likvidlikni yig‘ib/urib qaytishi","Har doim trend davom etishi","Spread yo‘qolishi","Broker yopilishi"],0],
["Riskni oldindan belgilashning foydasi nima?",["Zararni cheklash","Leverage oshirish","Signalni kafolatlash","Newsni bekor qilish"],0]
];
let s=JSON.parse(localStorage.getItem(KEY)||'null')||{name:'Trader',goal:'Intizomli trader bo‘lish',market:'XAUUSD',endpoint:'',progress:0,discipline:100,streak:1,chat:[{r:'ai',t:'Salom! Men sening virtual trading ustozingman. Avval bilim, keyin amaliyot, undan keyin demo. Real pulga shoshilmaymiz.'}],trades:[],skills:{}};

const el=id=>document.getElementById(id);function save(){localStorage.setItem(KEY,JSON.stringify(s));render()}
function esc(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function show(id,b){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));el(id).classList.add('active');document.querySelectorAll('nav button').forEach(x=>x.classList.remove('active'));b?.classList.add('active');window.scrollTo(0,0)}
function render(){
 el('greet').textContent=`Salom, ${s.name} 👋`;el('prog').textContent=s.progress+'%';el('disc').textContent=s.discipline;el('days').textContent=s.streak;
 el('rank').textContent=s.progress<20?'Boshlang‘ich':s.progress<50?'O‘rta':s.progress<80?'Yuqori':'Professional';
 el('chat').innerHTML=s.chat.map(x=>`<div class="msg ${x.r==='me'?'me':''}">${esc(x.t)}</div>`).join('');
 el('curriculum').innerHTML=curriculum.map((x,i)=>`<div class="lesson ${i*10>s.progress?'locked':''}"><div><b>${x[0]}. ${x[1]}</b><br><small>${x[2]}</small></div><span>${i*10<=s.progress?'✓':'🔒'}</span></div>`).join('');
 el('quizBox').innerHTML=quiz.map((q,i)=>`<div class="card"><b>${i+1}. ${q[0]}</b>${q[1].map((a,j)=>`<label><input type="radio" name="q${i}" value="${j}"> ${a}</label>`).join('')}</div>`).join('');
 el('trades').innerHTML=s.trades.map(t=>`<div class="trade"><b>${esc(t.pair)}</b> · ${esc(t.tf)} · ${esc(t.result)}<br><small>${esc(t.setup)} · Risk ${esc(t.risk)}<br>${esc(t.reason)}</small></div>`).join('');
 el('pBig').textContent=s.progress+'%';el('pText').textContent=s.progress<100?'Keyingi maqsad: bilimni mustahkamlash va vazifalarni ketma-ket bajarish.':'Kursning asosiy bosqichlari yakunlandi. Endi statistik backtest va demo intizomi.';
 el('skills').innerHTML=curriculum.slice(0,8).map((x,i)=>{let v=s.skills[i]||Math.min(100,Math.max(0,s.progress-(i*8)));return `<div class="skill"><b>${x[1]}</b><div class="bar"><div class="fill" style="width:${v}%"></div></div></div>`}).join('');
 el('name').value=s.name;el('goal').value=s.goal;el('market').value=s.market;el('endpoint').value=s.endpoint||'';
}
function lesson(){alert('Bugungi dars:\\n\\nTrading — bozor narxlaridagi o‘zgarishlardan foydalanishga urinish. Hech qanday strategiya foydani kafolatlamaydi. Birinchi professional odat: har bir trade oldidan risk va invalidationni bilish.\\n\\nEndi vazifani bajar.')}
function submitTask(){let a=el('taskAnswer').value.trim();if(a.length<40){s.discipline=Math.max(0,s.discipline-5);el('taskResult').innerHTML='<p class="warning">❌ Javob juda qisqa. 3+ mazmunli jumla yoz. Intizom -5.</p>'}else{s.progress=Math.min(100,s.progress+5);s.skills[0]=Math.min(100,(s.skills[0]||0)+10);el('taskResult').innerHTML='<p>✅ Qabul qilindi. Javobingda risk va kapitalni himoya qilish g‘oyasi bo‘lishi kerak. +5% progress.</p>'}save()}
function answerLocal(q){q=q.toLowerCase();if(q.includes('liquidity'))return'Liquidity — bozorda buyurtmalar va stoplar to‘planishi mumkin bo‘lgan hudud. Swing high/low, equal highs/lows va sweepni alohida o‘rganamiz.';if(q.includes('risk'))return'Risk management kapitalni himoya qilish tizimi. Har bir trade oldidan qancha zarar qabul qilishing va qayerda g‘oya noto‘g‘ri bo‘lishini belgilaysan.';if(q.includes('ict'))return'ICTni o‘rganishdan oldin market structure, liquidity va price actionni yaxshi bilishing kerak. Men mavzularni ketma-ket beraman.';if(q.includes('smc'))return'SMC — market structure, liquidity, order block, FVG kabi tushunchalar atrofidagi yondashuvlar to‘plami. Bitta patternni ko‘rishning o‘zi entry uchun yetarli emas.';return'Savoling yaxshi. Avval o‘z taxminingni yoz. Men uni tekshiraman va keyin sodda misol bilan tushuntiraman.'}
async function ask(){let q=el('q').value.trim();if(!q)return;s.chat.push({r:'me',t:q});el('q').value='';let a=answerLocal(q);if(s.endpoint){try{let r=await fetch(s.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q,context:{progress:s.progress,discipline:s.discipline}})});if(r.ok){let d=await r.json();a=d.reply||d.message||a}}catch(e){}}s.chat.push({r:'ai',t:a});save()}
function gradeQuiz(){let score=0;quiz.forEach((q,i)=>{let x=document.querySelector(`input[name=q${i}]:checked`);if(x&&+x.value===q[2])score++});let pct=Math.round(score/quiz.length*100);if(pct>=80){s.progress=Math.min(100,s.progress+5);s.discipline=Math.min(100,s.discipline+2);el('quizResult').innerHTML=`<p>✅ ${score}/${quiz.length} (${pct}%). Test o‘tdi. +5% progress.</p>`}else{ s.discipline=Math.max(0,s.discipline-3);el('quizResult').innerHTML=`<p class="warning">❌ ${score}/${quiz.length} (${pct}%). 80% kerak. Mavzuni qayta o‘rgan. Intizom -3.</p>`}save()}
function gradeChart(){let n=document.querySelectorAll('.chk:checked').length;if(n>=4){s.progress=Math.min(100,s.progress+3);el('chartResult').innerHTML='<p>✅ Amaliyot qabul qilindi. Keyingi bosqich: backtest.</p>'}else{el('chartResult').innerHTML='<p class="warning">⚠️ Kamida 4 ta checklist bandini bajar. Entryga shoshilma.</p>';s.discipline=Math.max(0,s.discipline-2)}save()}
function saveTrade(){let pair=el('pair').value.trim(),result=el('result').value.trim();if(!pair||!result){alert('Instrument va natijani kiriting.');return}s.trades.unshift({pair,tf:el('tf').value,setup:el('setup').value,risk:el('risk').value,result,reason:el('reason').value});save();['pair','tf','setup','risk','result','reason'].forEach(id=>el(id).value='')}
function saveSettings(){s.name=el('name').value||'Trader';s.goal=el('goal').value||'Intizomli trader bo‘lish';s.market=el('market').value;s.endpoint=el('endpoint').value.trim();save();alert('Saqlandi.')}
function resetApp(){if(confirm('Barcha progress va jurnal o‘chiriladi. Davom etamizmi?')){localStorage.removeItem(KEY);location.reload()}}
render();if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');