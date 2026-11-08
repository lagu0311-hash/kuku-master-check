// Pure logic for 九九マスターチェック. No network calls or external dependencies.
export const VERSION = 2;
export const BANK = Object.freeze(Array.from({ length: 9 }, (_, i) =>
  Array.from({ length: 9 }, (_, j) => Object.freeze({ a: i + 1, b: j + 1 }))
).flat());
export const MODES = Object.freeze(['practice', 'challenge']);
export const KINDS = Object.freeze(['stage', 'mixed', 'full', 'weak']);
export const keyOf = (a, b) => `${a}x${b}`;
export const localDate = (d = new Date()) => {
  const y = d.getFullYear();
  return `${y}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const REVEAL_ORDER = Object.freeze([4,0,2,6,8,1,3,5,7]); // center first
export const EFFECTS = Object.freeze(['normal','low','off']);
export const newStore = () => ({ schemaVersion: VERSION, records: [], sessions: [], active: null,
  settings: { effects: 'normal' }, reward: { pictureId:'storybook-picnic-1', unlocked:0, earnedSessionIds:[] } });
export function scoreBand(correct, total) {
  if (!Number.isInteger(correct) || !Number.isInteger(total) || total < 1 || correct < 0 || correct > total) throw new Error('Invalid score');
  const pct=correct/total*100;
  return pct===100?'perfect':pct>=80?'great':pct>=60?'good':pct>=40?'keepgoing':'courage';
}
// Returns true iff one new tile was unlocked. Repeated processing is idempotent.
export function awardPerfect(store, session) {
  if (session.mode !== 'challenge' || session.correct !== session.total || session.total < 1 ||
      store.reward.earnedSessionIds.includes(session.id)) return false;
  store.reward.earnedSessionIds.push(session.id);
  const didUnlock=store.reward.unlocked<9;
  if (didUnlock) store.reward.unlocked++;
  return didUnlock;
}

export function shuffle(items, random = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function testRecordsFor(a, b, records) {
  return records.filter(r => r.mode === 'challenge' && r.a === a && r.b === b);
}
export function masteryOf(a, b, records) {
  const tests = testRecordsFor(a, b, records);
  if (tests.length === 0) return 'unseen';
  const latest = tests[tests.length - 1];
  if (!latest.correct) return 'practice';
  const correctDays = new Set(tests.filter(r => r.correct).map(r => r.localDate));
  return correctDays.size >= 2 ? 'mastered' : 'learning';
}
export function median(nums) {
  if (!nums.length) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const at = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[at] : (sorted[at - 1] + sorted[at]) / 2;
}

export function buildQuestions({ kind, stage = 2, count = 10, records = [], random = Math.random }) {
  if (!KINDS.includes(kind)) throw new Error('Unknown test kind');
  if (kind === 'stage') {
    if (!Number.isInteger(stage) || stage < 1 || stage > 9) throw new Error('Invalid stage');
    return shuffle(BANK.filter(q => q.a === stage), random);
  }
  if (kind === 'full') return shuffle(BANK, random);
  if (![10, 20].includes(count)) throw new Error('Invalid count');
  if (kind === 'mixed') return shuffle(BANK, random).slice(0, count);

  const lastTests = new Map();
  for (const r of records.filter(x => x.mode === 'challenge')) lastTests.set(keyOf(r.a, r.b), r);
  const pool = BANK.map(q => {
    const latest = lastTests.get(keyOf(q.a, q.b));
    // Prioritize recent errors, then slow but correct answers. No random false 'weak' label for unseen questions.
    const score = latest && !latest.correct ? 4 : latest && latest.elapsedMs >= 10000 ? 3 :
      latest && latest.elapsedMs >= 6000 ? 2 : latest ? 0 : 1;
    return { ...q, score };
  });
  const randomized = shuffle(pool, random);
  randomized.sort((a, b) => b.score - a.score);
  return randomized.slice(0, count).map(({ a, b }) => ({ a, b }));
}

export function stageStats(records) {
  return Array.from({ length: 9 }, (_, i) => {
    const row = BANK.filter(q => q.a === i + 1);
    const seen = row.filter(q => testRecordsFor(q.a, q.b, records).length);
    const latestCorrect = seen.filter(q => testRecordsFor(q.a, q.b, records).at(-1).correct).length;
    const mastered = row.filter(q => masteryOf(q.a, q.b, records) === 'mastered').length;
    return { stage: i + 1, tested: seen.length, latestCorrect, mastered };
  });
}
export function masteryCounts(records) {
  const counts = { unseen: 0, practice: 0, learning: 0, mastered: 0 };
  for (const q of BANK) counts[masteryOf(q.a, q.b, records)]++;
  return counts;
}

export function validateStore(raw) {
  if (!raw || typeof raw !== 'object' || ![1, VERSION].includes(raw.schemaVersion) ||
      !Array.isArray(raw.records) || !Array.isArray(raw.sessions) || raw.records.length > 200000 ||
      raw.sessions.length > 20000) throw new Error('対応していない保存データです。');
  const validQuestion = q => q && Number.isInteger(q.a) && q.a >= 1 && q.a <= 9 && Number.isInteger(q.b) && q.b >= 1 && q.b <= 9;
  const shortString = (s, limit = 128) => typeof s === 'string' && s.length > 0 && s.length <= limit;
  const validTime = s => shortString(s, 40) && Number.isFinite(Date.parse(s));
  const validDate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const validRecord = r => validQuestion(r) && shortString(r.sessionId) && MODES.includes(r.mode) && KINDS.includes(r.kind) &&
    Number.isInteger(r.input) && r.input >= 0 && r.input <= 999 && typeof r.correct === 'boolean' &&
    r.correct === (r.input === r.a * r.b) && Number.isFinite(r.elapsedMs) && r.elapsedMs >= 0 && r.elapsedMs <= 3600000 &&
    validTime(r.answeredAt) && validDate(r.localDate);
  if (!raw.records.every(validRecord)) throw new Error('回答履歴に不正なデータがあります。');
  if (!raw.sessions.every(s => s && shortString(s.id) && MODES.includes(s.mode) && KINDS.includes(s.kind) &&
    Number.isInteger(s.total) && s.total >= 1 && s.total <= 81 && Number.isInteger(s.correct) &&
    s.correct >= 0 && s.correct <= s.total && validTime(s.completedAt))) throw new Error('テスト履歴に不正なデータがあります。');
  if (raw.active !== null) {
    const a = raw.active;
    if (!a || !shortString(a.id) || !MODES.includes(a.mode) || !KINDS.includes(a.kind) ||
        !Array.isArray(a.questions) || a.questions.length < 1 || a.questions.length > 81 ||
        !a.questions.every(validQuestion) ||
        new Set(a.questions.map(q => keyOf(q.a, q.b))).size !== a.questions.length ||
        !Number.isInteger(a.index) || a.index < 0 || a.index >= a.questions.length ||
        !Number.isFinite(a.elapsedMs) || a.elapsedMs < 0 || a.elapsedMs > 3600000)
      throw new Error('途中のテストに不正なデータがあります。');
  }
  const effects=raw.schemaVersion===1?'normal':raw.settings?.effects;
  if (!EFFECTS.includes(effects)) throw new Error('演出設定が不正です。');
  const reward=raw.schemaVersion===1?{pictureId:'storybook-picnic-1',unlocked:0,earnedSessionIds:[]}:raw.reward;
  if (!reward || reward.pictureId!=='storybook-picnic-1' || !Number.isInteger(reward.unlocked) || reward.unlocked<0 || reward.unlocked>9 ||
      !Array.isArray(reward.earnedSessionIds) || reward.earnedSessionIds.length>20000 ||
      !reward.earnedSessionIds.every(id=>shortString(id)) || new Set(reward.earnedSessionIds).size!==reward.earnedSessionIds.length ||
      reward.unlocked>reward.earnedSessionIds.length) throw new Error('ごほうびデータが不正です。');
  // Reconstruct only known fields; never interpret imported data as HTML.
  return {
    schemaVersion: VERSION,
    settings:{effects},reward:{pictureId:'storybook-picnic-1',unlocked:reward.unlocked,earnedSessionIds:[...reward.earnedSessionIds]},
    records: raw.records.map(r => ({ sessionId:r.sessionId, mode:r.mode, kind:r.kind, a:r.a, b:r.b,
      input:r.input, correct:r.correct, elapsedMs:r.elapsedMs, answeredAt:r.answeredAt, localDate:r.localDate })),
    sessions: raw.sessions.map(s => ({ id:s.id, mode:s.mode, kind:s.kind, total:s.total, correct:s.correct, completedAt:s.completedAt })),
    active: raw.active === null ? null : {
      id:raw.active.id, mode:raw.active.mode, kind:raw.active.kind,
      questions:raw.active.questions.map(q => ({ a:q.a, b:q.b })), index:raw.active.index,
      elapsedMs:raw.active.elapsedMs
    }
  };
}

export function csvOf(records) {
  const header = ['出題日時','実施日','モード','テスト種類','式','入力回答','正答','正誤','回答秒数'];
  const lines = records.map(r => [r.answeredAt,r.localDate,r.mode,r.kind,`${r.a}×${r.b}`,r.input,r.a*r.b,
    r.correct ? '正解' : '不正解', (r.elapsedMs / 1000).toFixed(2)]);
  // All values are derived from validated fields; quote for broad spreadsheet compatibility.
  return '\ufeff' + [header, ...lines].map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\r\n');
}
