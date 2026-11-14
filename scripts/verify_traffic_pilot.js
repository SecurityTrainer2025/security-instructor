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
  assert.equal(s.questions.length, 5, s.id+' must have 5 knowledge questions');
  for(const q of s.questions) {
    assert.equal(q.a.length, 4, s.id+' question options');
    assert.ok(Number.isInteger(q.correct) && q.correct>=0 && q.correct<4, s.id+' answer index');
  }
  assert.ok(s.videoUrl && fs.existsSync(path.join(root, 'frontend', s.videoUrl)), s.id+' video missing: '+s.videoUrl);
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
assert.ok(html.includes("courseSlug==='traffic-management-vehicle-control'"),'traffic UI guard missing');
assert.ok(html.includes('traffic-body-ar')&&html.includes('traffic-body-en'),'language switch missing');
assert.ok(html.includes('00_course_introduction.en.vtt'),'subtitle track missing');
console.log('Traffic pilot static QA passed: 10 screens, 50 lesson questions, 30 final questions, videos, subtitles and language switch.');
