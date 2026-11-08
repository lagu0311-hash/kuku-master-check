import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {animalSvg} from '../docs/animals.js';
const here=dirname(fileURLToPath(import.meta.url));

test('incorrect-answer dog weights: two visible watercolor dumbbells attached to approved art',()=>{
 const html=animalSvg('dog','weights');
 assert.match(html,/dog-home\.webp/);
 assert.equal((html.match(/class="pose-accessory dog-dumbbell"/g)||[]).length,2);
 assert.match(html,/aria-label="いぬの筋トレ"/);
});

test('three coach animals show cheering prop while preserving original artwork',()=>{
 for(const [kind,file] of [['dog','dog-home.webp'],['rabbit','rabbit-home.webp'],['squirrel','squirrel-home.webp']]) {
  const html=animalSvg(kind,'coach');
  assert.ok(html.includes(file),kind);
  assert.ok(html.includes('class="pose-accessory cheer-bubble"'),kind);
  assert.ok(html.includes('ファイト！'),kind);
 }
});

test('cat coach uses approved cheering pose with a speech bubble',()=>{
 const html=animalSvg('cat','coach');
 assert.match(html,/cat-jump\.webp/);
 assert.match(html,/cheer-bubble/);
 assert.ok(existsSync(resolve(here,'../docs/assets/characters/cat-jump.webp')));
});

test('correct answer poses and the approved artwork remain in place',()=>{
 for(const pose of ['jump','spin','clap','star'])assert.match(animalSvg('cat',pose),/cat-.*\.webp/);
 for(const kind of ['dog','rabbit','squirrel'])assert.match(animalSvg(kind,'home'),/home\.webp/);
 const css=readFileSync(resolve(here,'../docs/styles.css'),'utf8');
 assert.ok(css.includes('prefers-reduced-motion:reduce'));
 assert.ok(css.includes('.animal-scene.still .animal-friend'));
});
