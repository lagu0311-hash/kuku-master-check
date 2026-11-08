import { BANK, newStore, validateStore, buildQuestions, masteryOf, masteryCounts, stageStats, median, csvOf, localDate, scoreBand, awardPerfect, REVEAL_ORDER } from './core.js';
import { animalSvg } from './animals.js';

const STORAGE_KEY = 'kuku-master-check:v2';
const LEGACY_STORAGE_KEY = 'kuku-master-check:v1';
const $app = document.querySelector('#app');
const names = { stage:'だんごと',mixed:'まぜこぜ',full:'ぜんぶ',weak:'にがてこくふく',practice:'れんしゅう',challenge:'ちからだめし' };
const masteryNames = { unseen:'まだ',practice:'れんしゅう中',learning:'おぼえてきた',mastered:'ばっちり！' };
const state = { page:'home', mode:'practice', kind:'stage', stage:2, count:10, answer:'', paused:false, feedback:null, lastSessionId:null, selectedCell:null, notice:'',variant:null,rewardJustUnlocked:false,previousVariant:{},awardAnimation:false };
let store = newStore();
let clockSince = null;
let busy = false;

try {
  const saved=localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
  if (saved) {
    store=validateStore(JSON.parse(saved));
    if (!localStorage.getItem(STORAGE_KEY)) localStorage.setItem(STORAGE_KEY,JSON.stringify(store));
  }
} catch (err) { state.notice = '保存済みデータを読み込めませんでした。バックアップを確認してください。今回の操作では上書きしません。'; store = newStore(); }
let storageBlocked = Boolean(state.notice);
function save() {
  if (storageBlocked) return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }
  catch { storageBlocked = true; state.notice = 'このブラウザでは自動保存できません。別のブラウザを使用するか、空き容量・プライベートブラウズを確認してください。'; }
}
function startClock() {
  if (store.active && !state.paused && !state.feedback && !document.hidden && clockSince === null) clockSince = performance.now();
}
function freezeClock() {
  if (clockSince !== null && store.active) {
    store.active.elapsedMs = Math.min(3600000, store.active.elapsedMs + Math.max(0, performance.now() - clockSince));
    clockSince = null;
    save();
  }
}
function elapsedNow() { return store.active ? Math.min(3600000, store.active.elapsedMs + (clockSince === null ? 0 : Math.max(0, performance.now() - clockSince))) : 0; }

const variantSets = {
  correct:[['cat','jump'],['cat','clap'],['cat','spin'],['cat','star'],['cat','jump'],['cat','clap']],
  wrong:[['cat','weights'],['dog','weights'],['squirrel','coach'],['rabbit','coach'],['cat','coach'],['dog','coach']],
  good:[['cat','jump'],['cat','star'],['cat','clap'],['cat','spin']],
  cheer:[['cat','coach'],['rabbit','coach'],['dog','weights'],['squirrel','coach']]
};
const positiveMessages=['やったね！','すごい！','そのちょうし！','ばっちり！','よくできたね！','せいかい！'];
const encouragingMessages=['だいじょうぶ、つぎいこう！','れんしゅうで つよくなる！','がんばっていて えらい！','つぎも チャレンジ！','いっしょに おぼえよう！','その いっぽが すてき！'];
function pickVariant(set) {
  const arr=variantSets[set];let n=Math.floor(Math.random()*arr.length);
  if (arr.length>1 && n===state.previousVariant[set]) n=(n+1+Math.floor(Math.random()*(arr.length-1)))%arr.length;
  state.previousVariant[set]=n;
  return {type:arr[n][0],pose:arr[n][1],message:(set==='wrong'||set==='cheer'?encouragingMessages:positiveMessages)[n%6]};
}
function confetti(kind='small') {
  const mode=store.settings.effects;
  if(mode==='off') return '';
  const n=mode==='low'?8:kind==='grand'?46:22;
  const palette=['#ffb7ca','#88cbef','#f9db75','#b9dca7','#c5b5e9','#ffbea1'];
  return `<div class="confetti" aria-hidden="true">${Array.from({length:n},(_,i)=>{
    const x=(i*37+13)%100, dx=(i%2?1:-1)*(22+(i*19)%95), delay=(i*13)%45/100;
    return `<i style="--x:${x}%;--drift:${dx}px;--delay:${delay}s;--color:${palette[i%6]};--turn:${(i*47)%360}deg"></i>`;
  }).join('')}</div>`;
}
function animalScene(variant, kind='success') {
  if (!variant) return '';
  return `<div class="animal-scene ${kind} ${store.settings.effects==='off'?'still':store.settings.effects==='low'?'gentle':''}">
    <span class="scene-spark left" aria-hidden="true">✦</span>${animalSvg(variant.type,variant.pose)}<span class="scene-spark right" aria-hidden="true">✧</span></div>`;
}
function puzzle(unlocked=store.reward.unlocked, newest=false) {
  const unlockedIndices=new Set(REVEAL_ORDER.slice(0,unlocked));
  const last=unlocked?REVEAL_ORDER[unlocked-1]:-1;
  return `<div class="reward-puzzle" role="img" aria-label="ごほうびのえ、${unlocked}マス開いたよ">
    ${Array.from({length:9},(_,idx)=>unlockedIndices.has(idx)
      ? `<div class="reward-tile open ${newest&&idx===last?'just-opened':''}" style="--bx:${idx%3*50}%;--by:${Math.floor(idx/3)*50}%"></div>`
      : `<div class="reward-tile locked"><span aria-hidden="true">${['✿','★','♥','✦','🐾','✦','♥','★','✿'][idx]}</span></div>`).join('')}
  </div>`;
}
function rewardPanel(celebrating=false) {
  const u=store.reward.unlocked;
  return `<section class="panel reward-section"><h2>ひみつの ごほうびのえ</h2>
    <p class="muted">ちからだめしで まんてんを とると、えが 1マスずつ ひらくよ！</p>
    ${puzzle(u,celebrating)}
    <p class="reward-progress">${u===9?'かんせい！ ぜんぶ ひらいたよ！':`${u} / 9 マス　あと ${9-u} かいで かんせい！`}</p>
    ${u===9?'<p class="small centered">おめでとう！ いつでも かんせいした えを みられるよ。</p>':''}
  </section>`;
}
function shell(body, narrow=false) {
  $app.innerHTML = `<div class="shell ${narrow ? 'narrow' : ''}">
    <header class="masthead"><span class="brand-mark" aria-hidden="true">★</span><span class="brand">九九マスターチェック</span></header>
    ${state.notice ? `<div class="notice" role="alert">${state.notice}</div>` : ''}
    ${body}<footer>がんばった分だけ、できることがふえていくよ。<span class="footnote"> 記録はこの端末に保存されます。</span></footer>
  </div>`;
}
const btn = (action, text, cls='', extra='') => `<button class="btn ${cls}" data-action="${action}" ${extra}>${text}</button>`;
const secondary = (action,text)=>btn(action,text,'secondary');
const header = (title,desc='')=>`<div class="section-heading"><h1>${title}</h1>${desc?`<p>${desc}</p>`:''}</div>`;
function renderHome() {
  const progress = masteryCounts(store.records);
  const resumed = store.active ? `<div class="resume-panel"><div><b>つづきのテストがあるよ</b><p>${names[store.active.kind]} ・ ${store.active.index + 1} / ${store.active.questions.length} もん</p></div>${btn('resume-active','つづきから ▶','primary')}</div>` : '';
  shell(`${header('きょうも九九にチャレンジ！','じぶんのペースで、いっぽずつ。')}
  <div class="hero"><div class="hero-cat">${animalSvg('cat','star')}</div><div><b>${progress.mastered} / 81 もん</b><small>「ばっちり！」になった もんだい</small></div></div>
  ${resumed}
  <div class="home-grid">
    <button class="home-card mint" data-action="setup-practice"><span class="home-icon">✏️</span><strong>れんしゅう</strong><small>こたえを たしかめながら</small></button>
    <button class="home-card lavender" data-action="setup-challenge"><span class="home-icon">🏅</span><strong>ちからだめし</strong><small>どのくらい おぼえたかな？</small></button>
    <button class="home-card peach" data-action="child"><span class="home-icon">⭐</span><strong>わたしのきろく</strong><small>がんばった きろくをみる</small></button>
    <button class="home-card gray" data-action="parent"><span class="home-icon">📊</span><strong>おうちのひと</strong><small>くわしい きろくと せってい</small></button>
  </div>`,false);
}
function renderSetup() {
  shell(`${header(state.mode === 'practice' ? 'れんしゅうを えらぼう' : 'ちからだめしを えらぼう',
    state.mode === 'practice' ? 'こたえを たしかめながら すすめるよ。' : 'さいごまで がんばってから、こたえあわせ！')}
    <div class="panel"><h2>どのテストにする？</h2><div class="choice-grid">
      ${[['stage','だんごと','9もん'],['mixed','まぜこぜ','10・20もん'],['full','ぜんぶ','81もん'],['weak','にがてこくふく','10・20もん']]
       .map(([kind,label,sub])=>`<button class="choice ${state.kind===kind?'picked':''}" data-action="choose-kind" data-kind="${kind}" aria-pressed="${state.kind===kind}"><strong>${label}</strong><small>${sub}</small></button>`).join('')}
    </div>
    ${state.kind === 'stage'?`<label class="control-label" for="stage">なんのだん？</label><select id="stage" data-setting="stage">${Array.from({length:9},(_,i)=>`<option value="${i+1}" ${state.stage===i+1?'selected':''}>${i+1} のだん</option>`).join('')}</select>`:''}
    ${['mixed','weak'].includes(state.kind)?`<label class="control-label" for="count">なんもん やる？</label><select id="count" data-setting="count"><option value="10" ${state.count===10?'selected':''}>10 もん</option><option value="20" ${state.count===20?'selected':''}>20 もん</option></select>`:''}
    ${state.kind==='weak'?`<p class="muted small">まちがえた問題や、こたえるのに時間がかかった問題をゆうせんするよ。まだ記録が少ないときは、ほかの問題も出るよ。</p>`:''}
    ${state.kind==='full'?`<p class="muted small">9もんごとに おやすみできるよ。とちゅうで やめても、つづきからできるよ。</p>`:''}
    ${btn('start','スタート！','primary wide big')}
    ${secondary('home','← もどる')}
    </div>`,true);
}
function renderQuiz() {
  const active=store.active;
  if (state.feedback) {
    const f=state.feedback;
    const atEnd=!active;
    const v=state.variant || pickVariant(f.correct?'correct':'wrong');
    shell(`<div class="quiz-top">${secondary('home','← ホーム')}<span>こたえあわせ</span></div>
      <div class="panel centered feedback ${f.correct?'is-correct':'is-incorrect'}">
      ${f.correct?confetti('small'):''}${animalScene(v,f.correct?'success':'encourage')}
      <h1>${f.correct?v.message:'まちがえても だいじょうぶ！'}</h1>
      <p class="equation">${f.a} × ${f.b} = ${f.a*f.b}</p>
      ${!f.correct?`<p>${v.message}　こたえは <strong>${f.a*f.b}</strong> だよ。</p>`:'<p>せいかい！　すてきだね！</p>'}
      ${btn('next',atEnd?'けっかを みる ▶':'つぎのもんだい ▶','primary wide big')}</div>`,true);
    return;
  }
  if (!active) return renderHome();
  const total=active.questions.length;
  const idx=active.index;
  const q=active.questions[idx];
  const percent=Math.round(idx/total*100);
  if (state.paused) {
    shell(`<div class="panel centered pause"><span class="large-emoji">☕</span><h1>ひとやすみ</h1><p>じゅんびができたら つづけよう！</p>
     <p class="muted">${idx+1} / ${total} もん</p>${btn('unpause','つづける ▶','primary wide big')}${secondary('home','ホームへ')}</div>`,true);
    return;
  }
  shell(`<div class="quiz-top">${secondary('home','← ホーム')}<span>${names[active.mode]} ・ ${idx+1} / ${total} もん</span>${secondary('pause','やすむ')}</div>
    <div class="progress"><div class="progress-fill" style="width:${percent}%"></div></div>
    <section class="quiz-card" aria-label="もんだい"><div class="question-label">だい ${idx+1} もん</div><h1 class="equation">${q.a} × ${q.b} = <span class="question-mark">？</span></h1>
    <div class="answer-box" aria-live="polite" aria-label="にゅうりょくしたこたえ">${state.answer || '<span class="placeholder">こたえをいれてね</span>'}</div>
    <div class="numberpad">${['1','2','3','4','5','6','7','8','9','けす','0','⌫'].map(v=>`<button class="numkey ${v==='けす'||v==='⌫'?'utility':''}" data-action="digit" data-value="${v}" aria-label="${v==='⌫'?'ひとつけす':v}">${v}</button>`).join('')}</div>
    ${btn('answer','こたえる！','primary wide big',state.answer?'':'disabled')}
    <p class="muted small center">じかんせいげんは ないよ。ゆっくり かんがえてね。</p></section>`,true);
  startClock();
}
function renderResult() {
  const session = store.sessions.find(s=>s.id===state.lastSessionId) || store.sessions.at(-1);
  if (!session) return renderHome();
  const records=store.records.filter(r=>r.sessionId===session.id);
  const band=scoreBand(session.correct,session.total);
  const bands={
    perfect:{title:'パーフェクト！',subtitle:'ぜんぶ せいかい！ すごい！',type:'good',confetti:'grand'},
    great:{title:'すごい！',subtitle:'とっても がんばったね！',type:'good',confetti:'small'},
    good:{title:'がんばったね！',subtitle:'つぎも チャレンジしよう！',type:'good'},
    keepgoing:{title:'ひとつずつ つよくなる！',subtitle:'れんしゅうすると もっと できるよ！',type:'cheer'},
    courage:{title:'チャレンジ できたね！',subtitle:'いっしょに すこしずつ おぼえよう！',type:'cheer'}
  };
  const b=bands[band];
  const variant=state.variant || pickVariant(b.type);
  const celebration=session.mode==='challenge' && band==='perfect';
  shell(`${header('よく がんばったね！','さいごまで やりとげたね！')}
    <div class="panel centered result result-${band}">
      ${b.confetti?confetti(b.confetti):''}
      ${animalScene(variant,band==='keepgoing'||band==='courage'?'encourage':'success')}
      <h2>${session.mode==='challenge'?b.title:'れんしゅう おつかれさま！'}</h2>
      <div class="score">${session.correct} <span>/ ${session.total} もん</span></div>
      <p>${session.mode==='challenge'?b.subtitle:'きょうも たくさん がんばったね！'}</p>
      <p class="muted small">${names[session.mode]} ・ ${names[session.kind]}</p>
      ${celebration?`<div class="reward-alert">${state.rewardJustUnlocked?'ごほうびのえが 1マス ひらいたよ！': 'ごほうびのえは もう かんせいしているよ！'}</div>`:''}
    </div>
    ${celebration?rewardPanel(state.rewardJustUnlocked):''}
    ${session.mode === 'challenge' ? `<details class="panel"><summary>こたえあわせ（${session.total} もん）</summary>
      <div class="answer-list">${records.map(r=>`<div class="answer-item ${r.correct?'ok':'no'}"><span>${r.a} × ${r.b} = ${r.a*r.b}</span><span>${r.correct?'○':`×（${r.input}）`}</span></div>`).join('')}</div></details>` : ''}
    ${btn('setup-practice','また れんしゅうする','primary wide')}
    ${secondary('reward','ごほうびのえを みる')}
    ${secondary('home','ホームへ')}`,true);
}
function renderReward() {
  shell(`${header('ひみつの ごほうびのえ','まんてんで 1マスずつ あくよ！')}
  ${store.reward.unlocked===9?'<div class="panel centered"><h2>かんせい おめでとう！</h2><p>みんなで なかよく ピクニック！</p></div>':''}
  ${rewardPanel(false)}
  ${secondary('home','← ホームへ')}`,true);
}
function renderChild() {
  const counts = masteryCounts(store.records);
  const recent = store.sessions.slice(-5).reverse();
  shell(`${header('わたしの きろく','きょうまでの がんばりが みえるよ！')}
    <div class="panel centered"><div class="award-stars">★ ★ ★</div><h2>ばっちり！ は ${counts.mastered} もん</h2>
    <p>おぼえてきた もんだい：${counts.learning} もん</p><p class="muted small">これからも じぶんのペースでね。</p></div>
    <div class="panel"><h2>さいきんの チャレンジ</h2>
    ${recent.length?recent.map(s=>`<div class="history-item"><span>${new Date(s.completedAt).toLocaleDateString('ja-JP')}　${names[s.kind]}</span><b>${s.correct} / ${s.total}</b></div>`).join(''):'<p class="muted">まだ きろくがないよ。ためしてみよう！</p>'}</div>
    ${secondary('reward','ひみつの ごほうびのえ')}
    ${secondary('home','← ホームへ')}`,true);
}
function renderParent() {
  const counts = masteryCounts(store.records);
  const stats = stageStats(store.records);
  const challenges = store.records.filter(r=>r.mode==='challenge');
  const correct = challenges.filter(r=>r.correct);
  const secMedian = median(correct.map(r=>r.elapsedMs));
  const detail = state.selectedCell;
  const details = detail ? store.records.filter(r=>r.a===detail.a&&r.b===detail.b).slice(-10).reverse():[];
  shell(`${header('おうちのひと向け','習得状況・学習記録・バックアップ')}
    <div class="stat-grid">
      <div class="stat"><b>${counts.mastered}<small> / 81</small></b><span>ばっちり</span></div>
      <div class="stat"><b>${81-counts.unseen}<small> / 81</small></b><span>出題済み</span></div>
      <div class="stat"><b>${challenges.length?Math.round(correct.length/challenges.length*100)+'%':'—'}</b><span>ちからだめし累計正答率</span></div>
      <div class="stat"><b>${secMedian===null?'—':(secMedian/1000).toFixed(1)+'秒'}</b><span>正解時の回答時間中央値</span></div>
    </div>
    <div class="panel"><h2>81問の習得マップ</h2><p class="muted small">行が「○の段」、列が「×□」。マスを押すとその問題の記録を表示します。</p>
    <div class="legend"><span><i class="dot unseen"></i>未出題</span><span><i class="dot practice"></i>れんしゅう中</span><span><i class="dot learning"></i>おぼえてきた</span><span><i class="dot mastered"></i>ばっちり</span></div>
    <div class="map-wrap"><div class="mastery-map"><div class="map-axis">×</div>${Array.from({length:9},(_,i)=>`<div class="map-axis">${i+1}</div>`).join('')}
    ${Array.from({length:9},(_,i)=>`<div class="map-axis">${i+1}</div>${Array.from({length:9},(_,j)=>`<button class="map-cell ${masteryOf(i+1,j+1,store.records)} ${detail?.a===i+1&&detail?.b===j+1?'selected':''}" data-action="cell" data-a="${i+1}" data-b="${j+1}" title="${i+1}×${j+1}: ${masteryNames[masteryOf(i+1,j+1,store.records)]}" aria-label="${i+1}かける${j+1}: ${masteryNames[masteryOf(i+1,j+1,store.records)]}">${j+1}</button>`).join('')}`).join('')}
    </div></div>
    ${detail?`<div class="cell-details"><h3>${detail.a} × ${detail.b} = ${detail.a*detail.b}（${masteryNames[masteryOf(detail.a,detail.b,store.records)]}）</h3>
      ${details.length?details.map(r=>`<p>${new Date(r.answeredAt).toLocaleString('ja-JP')}　${names[r.mode]}：${r.correct?'正解':'不正解'}（回答 ${r.input} ／ ${(r.elapsedMs/1000).toFixed(1)}秒）</p>`).join(''):'<p class="muted">まだ出題されていません。</p>'}</div>`:''}
    </div>
    <div class="panel"><h2>段別の状況</h2><table><thead><tr><th>段</th><th>出題済み</th><th>直近正解</th><th>ばっちり</th></tr></thead><tbody>
      ${stats.map(s=>`<tr><th>${s.stage}の段</th><td>${s.tested}/9</td><td>${s.latestCorrect}/9</td><td>${s.mastered}/9</td></tr>`).join('')}
    </tbody></table><p class="muted small">この集計は「ちからだめし」の回答のみを対象にします。未出題は正解数に含めません。</p></div>
    <div class="panel"><h2>履歴とデータ管理</h2><p class="muted small">保存先はこのブラウザです。iPhone、iPad、PCの間で自動同期はされません。</p>
      <label class="control-label" for="effects">アニメーションの おおきさ</label>
      <select id="effects" data-setting="effects"><option value="normal" ${store.settings.effects==='normal'?'selected':''}>ふつう（おすすめ）</option><option value="low" ${store.settings.effects==='low'?'selected':''}>ひかえめ</option><option value="off" ${store.settings.effects==='off'?'selected':''}>オフ</option></select>
      <p class="muted small">紙吹雪やどうぶつの動きを調整できます。画像や正誤表示は残ります。</p>
      <div class="actions">${btn('export-json' ,'JSONバックアップ','secondary')}${btn('export-csv','CSV書き出し','secondary')}
      ${btn('import','JSONを復元','secondary')}</div><input type="file" id="import-input" accept="application/json,.json" class="visually-hidden" aria-label="バックアップファイルを選ぶ">
      <hr><p class="muted small">記録を消すと元に戻せません。必要であれば先にバックアップしてください。</p>
      ${btn('erase','この端末の記録をすべて削除','danger-outline')}</div>
    ${secondary('home','← ホームへ')}`,false);
}
function render() {
  switch(state.page) {
    case 'home':renderHome();break;
    case 'setup':renderSetup();break;
    case 'quiz':renderQuiz();break;
    case 'result':renderResult();break;
    case 'reward':renderReward();break;
    case 'child':renderChild();break;
    case 'parent':renderParent();break;
    default: renderHome();
  }
}
function navigate(page) {
  freezeClock();state.page=page;state.feedback=null;state.paused=false;state.answer='';render();
}
function startTest() {
  if (store.active && !confirm('とちゅうのテストをやめて、新しいテストをはじめますか？\n（すでに答えた問題の記録は残ります）')) return;
  const questions=buildQuestions({kind:state.kind,stage:state.stage,count:state.count,records:store.records});
  store.active = { id: crypto.randomUUID(),mode:state.mode,kind:state.kind,questions,index:0,elapsedMs:0 };
  state.answer='';state.paused=false;state.feedback=null;state.variant=null;state.rewardJustUnlocked=false;clockSince=null;state.page='quiz';save();render();
}
function answer() {
  if (!store.active || state.paused || state.feedback || busy || !/^\d{1,3}$/.test(state.answer)) return;
  busy=true;
  try {
    freezeClock();
    const a=store.active;const q=a.questions[a.index];const value=Number(state.answer);
    const r={ sessionId:a.id,mode:a.mode,kind:a.kind,a:q.a,b:q.b,input:value,correct:value===q.a*q.b,
      elapsedMs:Math.round(elapsedNow()),answeredAt:new Date().toISOString(),localDate:localDate() };
    store.records.push(r);a.index++;a.elapsedMs=0;state.answer='';
    if (a.index===a.questions.length) {
      const records=store.records.filter(x=>x.sessionId===a.id);
      store.sessions.push({id:a.id,mode:a.mode,kind:a.kind,total:a.questions.length,
        correct:records.filter(x=>x.correct).length,completedAt:new Date().toISOString()});
      state.lastSessionId=a.id;
      const session=store.sessions.at(-1);
      state.rewardJustUnlocked=awardPerfect(store,session);
      store.active=null;state.paused=false;
      if(a.mode==='practice'){
        state.feedback=r;state.variant=pickVariant(r.correct?'correct':'wrong');state.page='quiz';
      } else {
        state.page='result';state.feedback=null;
        state.variant=pickVariant(scoreBand(session.correct,session.total)==='keepgoing'||scoreBand(session.correct,session.total)==='courage'?'cheer':'good');
      }
    } else if (a.mode==='practice') {
      state.feedback=r;state.variant=pickVariant(r.correct?'correct':'wrong');
    } else if (a.kind==='full' && a.index%9===0) {
      state.paused=true;
    }
    save();render();
  } finally { busy=false; }
}
function digit(value) {
  if (state.page!=='quiz'||!store.active||state.paused||state.feedback) return;
  if (value==='けす') state.answer='';
  else if (value==='⌫') state.answer=state.answer.slice(0,-1);
  else if (/^[0-9]$/.test(value) && state.answer.length<3) state.answer+=value;
  render();
}
function download(name,contents,type) {
  const url=URL.createObjectURL(new Blob([contents],{type}));
  const link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function onClick(ev) {
  const el=ev.target.closest('[data-action]');if(!el)return;
  const action=el.dataset.action;
  switch(action){
    case 'home':navigate('home');break;
    case 'setup-practice':state.mode='practice';navigate('setup');break;
    case 'setup-challenge':state.mode='challenge';navigate('setup');break;
    case 'choose-kind':state.kind=el.dataset.kind;render();break;
    case 'start':startTest();break;
    case 'resume-active':state.page='quiz';state.paused=false;state.feedback=null;state.answer='';state.variant=null;render();break;
    case 'digit':digit(el.dataset.value);break;
    case 'answer':answer();break;
    case 'pause':freezeClock();state.paused=true;render();break;
    case 'unpause':state.paused=false;render();break;
    case 'next':state.feedback=null;state.answer='';state.variant=null;if(!store.active){state.page='result';state.variant=pickVariant('good');}render();break;
    case 'child':navigate('child');break;
    case 'reward':navigate('reward');break;
    case 'parent':navigate('parent');break;
    case 'cell':state.selectedCell={a:Number(el.dataset.a),b:Number(el.dataset.b)};render();break;
    case 'export-json':download(`kuku-backup-${localDate()}.json`,JSON.stringify({...store,exportedAt:new Date().toISOString()},null,2),'application/json');break;
    case 'export-csv':download(`kuku-history-${localDate()}.csv`,csvOf(store.records),'text/csv;charset=utf-8');break;
    case 'import':document.querySelector('#import-input')?.click();break;
    case 'erase':
      if(confirm('この端末の九九の記録を全部消します。よろしいですか？')) {
        try{localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(LEGACY_STORAGE_KEY);}catch{};
        store=newStore();storageBlocked=false;state.notice='記録を削除しました。';navigate('parent');
      } break;
  }
}
$app.addEventListener('click',onClick);
$app.addEventListener('change',async ev=>{
  const t=ev.target;
  if(t.dataset.setting==='stage'){state.stage=Number(t.value);return;}
  if(t.dataset.setting==='count'){state.count=Number(t.value);return;}
  if(t.dataset.setting==='effects'){store.settings.effects=t.value;save();return;}
  if(t.id==='import-input' && t.files?.[0]){
    try{
      if(t.files[0].size>8*1024*1024)throw new Error('8MBを超えるファイルは読み込めません。');
      const loaded=validateStore(JSON.parse(await t.files[0].text()));
      if(!confirm('現在の記録をバックアップの内容で置き換えます。続けますか？'))return;
      freezeClock();store=loaded;storageBlocked=false;state.notice='バックアップを復元しました。';state.selectedCell=null;save();navigate('parent');
    }catch(e){alert(`読み込みできませんでした：${e.message}`);}finally{t.value='';}
  }
});
window.addEventListener('keydown',ev=>{
  if(state.page!=='quiz'||!store.active||state.paused||state.feedback||ev.ctrlKey||ev.metaKey||ev.altKey)return;
  if(document.activeElement?.matches('input,select,textarea'))return;
  if(/^[0-9]$/.test(ev.key)){ev.preventDefault();digit(ev.key);}
  else if(ev.key==='Backspace'){ev.preventDefault();digit('⌫');}
  else if(ev.key==='Enter'){ev.preventDefault();answer();}
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden)freezeClock();
  else if(state.page==='quiz'&&!state.paused&&!state.feedback)startClock();
});
window.addEventListener('pagehide',freezeClock);
render();
