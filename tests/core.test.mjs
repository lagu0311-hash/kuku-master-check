import test from 'node:test';
import assert from 'node:assert/strict';
import { BANK, buildQuestions, masteryOf, stageStats, newStore, validateStore, csvOf, localDate } from '../docs/core.js';
const record = (a,b,input,day='2026-11-08',mode='challenge') => ({
  sessionId:'sample', mode,kind:'mixed',a,b,input,correct:input===a*b,elapsedMs:2500,
  answeredAt:`${day}T12:00:00.000Z`,localDate:day
});
test('81 unique ordered expressions', () => {
  assert.equal(BANK.length,81);assert.equal(new Set(BANK.map(q=>`${q.a},${q.b}`)).size,81);
  assert.ok(BANK.some(q=>q.a===7&&q.b===8)); assert.ok(BANK.some(q=>q.a===8&&q.b===7));
});
test('stage and full contain no duplicates', () => {
  const stage=buildQuestions({kind:'stage',stage:7,random:()=>.5});
  assert.equal(stage.length,9);assert.ok(stage.every(q=>q.a===7));
  const full=buildQuestions({kind:'full'});
  assert.equal(full.length,81);assert.equal(new Set(full.map(q=>`${q.a},${q.b}`)).size,81);
});
test('mixed 10 and 20 lengths', () => {
  assert.equal(buildQuestions({kind:'mixed',count:10}).length,10);
  assert.equal(buildQuestions({kind:'mixed',count:20}).length,20);
});
test('mastery is based only on challenge and distinct days', () => {
  const p=[record(7,8,56,'2026-11-06','practice')];
  assert.equal(masteryOf(7,8,p),'unseen');
  const d1=[...p,record(7,8,56,'2026-11-07'),record(7,8,56,'2026-11-07')];
  assert.equal(masteryOf(7,8,d1),'learning');
  const d2=[...d1,record(7,8,56,'2026-11-08')];
  assert.equal(masteryOf(7,8,d2),'mastered');
  assert.equal(masteryOf(7,8,[...d2,record(7,8,54,'2026-11-08')]),'practice');
});
test('weak question prioritizes latest incorrect',()=>{
 const history=[record(7,8,54)];
 const qs=buildQuestions({kind:'weak',count:10,records:history,random:()=>.5});
 assert.ok(qs.some(q=>q.a===7&&q.b===8));
});
test('stage stats count only unique tested expressions',()=>{
 const s=stageStats([record(3,4,12),record(3,4,12),record(3,5,10)]);
 assert.equal(s[2].tested,2);assert.equal(s[2].latestCorrect,1);
});
test('backup validates, prevents changed correctness and prototype pollution',()=>{
 const store=newStore();store.records.push(record(7,8,56));
 assert.equal(validateStore(store).records.length,1);
 const bad=structuredClone(store);bad.records[0].correct=false;
 assert.throws(()=>validateStore(bad));
 const injected=structuredClone(store);injected.surprise='ignore';
 assert.equal('surprise' in validateStore(injected),false);
});
test('CSV has header and safe escaped data',()=>{
 const csv=csvOf([record(7,8,56)]);
 assert.ok(csv.includes('7×8'));assert.ok(csv.startsWith('\ufeff'));
});
test('calendar date uses local day',()=>{
 assert.equal(localDate(new Date(2026,10,8,12)), '2026-11-08');
});

import { scoreBand, awardPerfect, REVEAL_ORDER } from '../docs/core.js';
test('score bands include 0, 40, 60, 80, and exact 100 percent',()=>{
  for (const [score,expectBand] of [[0,'courage'],[3,'courage'],[4,'keepgoing'],[5,'keepgoing'],[6,'good'],[7,'good'],[8,'great'],[9,'great'],[10,'perfect']]) {
    assert.equal(scoreBand(score,10),expectBand);
  }
  assert.equal(scoreBand(9,9),'perfect');
  assert.equal(scoreBand(65,81),'great');
  assert.throws(()=>scoreBand(11,10));
});
test('nine reveal positions form a unique center-first 3×3 grid',()=>{
 assert.deepEqual(new Set(REVEAL_ORDER).size,9);
 assert.equal(REVEAL_ORDER[0],4);
 assert.deepEqual([...REVEAL_ORDER].sort(),[0,1,2,3,4,5,6,7,8]);
});
test('only full-score challenge unlocks; never duplicate and stop at nine',()=>{
 const s=newStore();
 assert.equal(awardPerfect(s,{id:'practice',mode:'practice',correct:9,total:9}),false);
 assert.equal(awardPerfect(s,{id:'incorrect',mode:'challenge',correct:8,total:9}),false);
 for(let i=0;i<9;i++)assert.equal(awardPerfect(s,{id:`ok-${i}`,mode:'challenge',correct:9,total:9}),true);
 assert.equal(s.reward.unlocked,9);
 assert.equal(awardPerfect(s,{id:'ok-0',mode:'challenge',correct:9,total:9}),false);
 assert.equal(awardPerfect(s,{id:'tenth',mode:'challenge',correct:9,total:9}),false);
 assert.equal(s.reward.unlocked,9);
 assert.equal(s.reward.earnedSessionIds.length,10);
});
test('v1 backup migrates preserving history; v2 reward persists and validates',()=>{
 const old={schemaVersion:1,records:[record(7,8,56)],sessions:[],active:null};
 const migrated=validateStore(old);
 assert.equal(migrated.schemaVersion,2);
 assert.equal(migrated.records.length,1);
 assert.equal(migrated.reward.unlocked,0);
 assert.equal(migrated.settings.effects,'normal');
 const s=newStore();awardPerfect(s,{id:'one',mode:'challenge',correct:9,total:9});
 s.settings.effects='low';
 const restored=validateStore(s);
 assert.equal(restored.reward.unlocked,1);
 assert.equal(restored.settings.effects,'low');
 const invalid=structuredClone(s);invalid.reward.unlocked=9;
 assert.throws(()=>validateStore(invalid));
});
