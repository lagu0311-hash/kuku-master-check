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

import { scoreBand, awardPerfect, REWARD_PICTURES, totalRewardTiles, currentRewardIndex } from '../docs/core.js';
test('six score bands: 100, 80-99, 60-79, 40-59, 20-39, 0-19',()=>{
 const bands=[[0,'courage'],[1,'courage'],[2,'training'],[3,'training'],[4,'keepgoing'],[5,'keepgoing'],[6,'good'],[7,'good'],[8,'great'],[9,'great'],[10,'perfect']];
 for(const [score,band] of bands)assert.equal(scoreBand(score,10),band);
 assert.equal(scoreBand(9,9),'perfect');
 assert.equal(scoreBand(65,81),'great');
 assert.throws(()=>scoreBand(11,10));
});
test('four rewards fixed in a secret order, tiles randomized per picture',()=>{
 const s=newStore();
 assert.deepEqual(s.reward.pictures.map(p=>p.id),REWARD_PICTURES.map(p=>p.id));
 assert.equal(s.reward.pictures.length,4);
 for(const p of s.reward.pictures)assert.deepEqual([...p.order].sort(),[0,1,2,3,4,5,6,7,8]);
 assert.equal(currentRewardIndex(s.reward),0);
});
test('perfect challenge in each kind unlocks one and exactly one tile',()=>{
 const s=newStore();
 assert.equal(awardPerfect(s,{id:'practice',mode:'practice',correct:9,total:9}),null);
 assert.equal(awardPerfect(s,{id:'incorrect',mode:'challenge',correct:8,total:9}),null);
 for(const [i,kind,total] of [[0,'stage',9],[1,'mixed',10],[2,'mixed',20],[3,'full',81],[4,'weak',10]]){
  const won=awardPerfect(s,{id:`ok-${kind}-${i}`,mode:'challenge',correct:total,total});
  assert.equal(won.pictureIndex,0);
  assert.equal(won.unlocked,i+1);
 }
 assert.equal(totalRewardTiles(s.reward),5);
 assert.equal(awardPerfect(s,{id:'ok-stage-0',mode:'challenge',correct:9,total:9}),null);
 assert.equal(totalRewardTiles(s.reward),5);
});
test('36 full-score challenges complete four rewards and never double-count',()=>{
 const s=newStore(()=>0.37),seen=[];
 for(let i=0;i<36;i++){
  const result=awardPerfect(s,{id:`reward-${i}`,mode:'challenge',correct:9,total:9});
  assert.equal(result.pictureIndex,Math.floor(i/9));
  seen.push(`${result.pictureIndex}:${result.tileIndex}`);
  assert.equal(result.pictureComplete,i%9===8);
  assert.equal(result.collectionComplete,i===35);
 }
 assert.equal(new Set(seen).size,36);
 assert.equal(currentRewardIndex(s.reward),-1);
 assert.equal(totalRewardTiles(s.reward),36);
 assert.equal(awardPerfect(s,{id:'after',mode:'challenge',correct:81,total:81}),null);
 assert.equal(s.reward.earnedSessionIds.length,37);
 assert.equal(totalRewardTiles(s.reward),36);
});
test('migration of both v1 and v2 backups keeps records and previous reward tiles',()=>{
 const v1={schemaVersion:1,records:[record(7,8,56)],sessions:[],active:null};
 const migrated=validateStore(v1);
 assert.equal(migrated.schemaVersion,3);
 assert.equal(migrated.records.length,1);
 assert.equal(totalRewardTiles(migrated.reward),0);
 const v2={...v1,schemaVersion:2,settings:{effects:'low'},reward:{pictureId:'storybook-picnic-1',unlocked:3,earnedSessionIds:['old-1','old-2','old-3']}};
 const upgraded=validateStore(v2);
 assert.equal(upgraded.schemaVersion,3);
 assert.equal(upgraded.reward.pictures[0].unlocked,3);
 assert.equal(upgraded.settings.effects,'low');
 assert.equal(upgraded.reward.earnedSessionIds.length,3);
 const again=validateStore(upgraded);
 assert.equal(again.reward.pictures[0].unlocked,3);
 const bad=structuredClone(again);bad.reward.pictures[0].order=[0,0,1,2,3,4,5,6,7];
 assert.throws(()=>validateStore(bad));
 const inconsistent=structuredClone(again);inconsistent.reward.pictures[1].unlocked=1;
 assert.throws(()=>validateStore(inconsistent));
});
