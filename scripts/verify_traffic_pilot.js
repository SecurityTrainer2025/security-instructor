#!/usr/bin/env node
// Read-only checks for the SI Traffic pilot. No production deployment.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const { TRAFFIC_SLUG, TRAFFIC_META, TRAFFIC_SCREENS, TRAFFIC_FINAL_ASSESSMENT } = require('../backend/self-study-traffic-config.js');
assert.equal(TRAFFIC_SLUG, 'traffic-management-vehicle-control');
assert.equal(TRAFFIC_META.accessHours, 120);
assert.equal(TRAFFIC_META.activeStudyHours, 24);
assert.equal(TRAFFIC_META.masteryScore, 80);
assert.equal(TRAFFIC_META.finalPassScore, 70);
assert.equal(TRAFFIC_SCREENS.length, 10);
assert.equal(new Set(TRAFFIC_SCREENS.map(s=>s.id)).size, 10);
assert.equal(TRAFFIC_SCREENS[0].videoUrl, 'assets/traffic-videos/00_course_introduction.mp4');
for(const s of TRAFFIC_SCREENS){
  assert.ok(s.titleAr && s.titleEn && s.bodyAr && s.bodyEn, s.id+' missing bilingual content');
  assert.equal(s.questions.length, s.id.endsWith('s2') ? 5 : 0, s.id+' invalid assessment count');
  assert.equal(s.assessmentRequired===false, s.id.endsWith('s1'));
  for(const q of s.questions) {
    assert.equal(q.a.length, 4, s.id+' question options');
    assert.ok(Number.isInteger(q.correct) && q.correct>=0 && q.correct<4, s.id+' answer index');
  }
  assert.ok(s.videoUrl && fs.existsSync(path.join(root, 'frontend', s.videoUrl)), s.id+' video missing: '+s.videoUrl);
}
const previewVideoFiles=[...new Set(TRAFFIC_SCREENS.map(s=>path.basename(s.videoUrl)))];
assert.equal(previewVideoFiles.length,7,'Expected seven distinct pilot video assets');
for(const filename of previewVideoFiles) {
  const captions=path.join(root,'frontend/assets/traffic-videos',filename.replace(/\.mp4$/i,'.en.vtt'));
  assert.ok(fs.existsSync(captions),'Missing English subtitle: '+captions);
  assert.ok(fs.readFileSync(captions,'utf8').startsWith('WEBVTT'),'Invalid subtitle header: '+captions);
}
const trafficPlayer=fs.readFileSync(path.join(root,'frontend/traffic-self-study.html'),'utf8');
assert.ok(trafficPlayer.includes('kind="subtitles"'),'Traffic player must offer English subtitles');
const mediaConfig=fs.readFileSync(path.join(root,'frontend/traffic-staging-config.js'),'utf8');
assert.ok(trafficPlayer.includes('window.SI_TRAFFIC_FINAL_MEDIA?.[id]'),'Final video must require per-screen staging approval');
assert.ok(trafficPlayer.includes('approved?.approved===true'),'Unapproved video must never replace pilot media');
assert.ok(!trafficPlayer.includes('SI_TRAFFIC_APPROVED_INTRO'),'Deprecated intro-only approval removed');
const mediaWindow={location:{hostname:'127.0.0.1'}};
require('node:vm').runInNewContext(mediaConfig,{window:mediaWindow});
const media=mediaWindow.SI_TRAFFIC_FINAL_MEDIA;
assert.deepEqual(Object.keys(media).sort(),TRAFFIC_SCREENS.map(s=>s.id).sort());
assert.equal(new Set(Object.values(media).map(item=>item.file)).size,10);
for (const [screen,item] of Object.entries(media)) {
  assert.equal(item.approved,true,screen+' staging asset not enabled');
  const mp4=path.join(root,'frontend',item.file);
  for (const file of [mp4,mp4.replace(/\.mp4$/,'.en.vtt'),mp4.replace(/\.mp4$/,'.timing.json')]) {
    assert.ok(fs.statSync(file).size>0,screen+' missing approved asset: '+file);
  }
}
assert.equal(TRAFFIC_FINAL_ASSESSMENT.length, 30);
const vtt = fs.readFileSync(path.join(root, 'frontend/assets/traffic-videos/00_course_introduction.en.vtt'), 'utf8');
assert.ok(vtt.startsWith('WEBVTT'));
assert.equal((vtt.match(/--> /g)||[]).length,5);
const html=fs.readFileSync(path.join(root,'frontend/fire-safety-self-study.html'),'utf8');
const vm = require('node:vm');
const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(match=>match[1]).filter(Boolean);
assert.ok(inlineScripts.length, 'course page missing inline JavaScript');
for(const source of inlineScripts) new vm.Script(source, {filename:'fire-safety-self-study.html'});
const assessmentHtml=fs.readFileSync(path.join(root,'frontend/course-assessment-v2.html'),'utf8');
const publicBanks = vm.runInNewContext(assessmentHtml.match(/const Q=(\{[\s\S]*?\});\s*const data=/)[1].replace(/^/, '(') + ')');
assert.deepEqual(Object.keys(publicBanks), ['traffic', 'crowd', 'fire', 'vehicle', 'person']);
for (const [course, questions] of Object.entries(publicBanks)) {
  assert.equal(questions.length, 10, course + ' public diagnostic must have 10 questions');
  for (const [english, arabic, choices, answer] of questions) {
    assert.ok(english && arabic && choices.length === 8 && Number.isInteger(answer) && answer >= 0 && answer < 4);
  }
}
const standaloneInitial=fs.readFileSync(path.join(root,'frontend/traffic-initial-assessment.html'),'utf8');
const legacyBank=standaloneInitial.split('const qs=[')[1].split('];')[0];
assert.equal((legacyBank.match(/^\['M[1-5]'/gm)||[]).length,10,'The legacy Traffic assessment link must also have 10 questions');
console.log('Traffic static QA passed: 10 initial questions, five module assessments of five questions, 30 final questions.');
