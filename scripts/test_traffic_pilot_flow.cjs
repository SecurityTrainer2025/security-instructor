#!/usr/bin/env node
/* Isolated DOM-flow smoke tests for SI Traffic pilot. No browser, network or learner data. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..', 'review');
class Element {
  constructor(tag='div', id='') {
    this.tagName=tag; this.id=id; this.children=[]; this.listeners={};
    this.className=''; this.disabled=false; this.checked=false; this.value='';
    this.name=''; this.style={}; this._text='';
    const classes=new Set();
    this.classList={
      add:x=>classes.add(x), remove:x=>classes.delete(x),
      contains:x=>classes.has(x), toggle:(x,force)=>{const on=force===undefined?!classes.has(x):force;on?classes.add(x):classes.delete(x);return on;}
    };
  }
  set textContent(x){this._text=String(x);this.children=[];}
  get textContent(){return this._text+this.children.map(x=>x.textContent||'').join('');}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=[...nodes];this._text='';}
  addEventListener(evt,fn){this.listeners[evt]=fn;}
  click(){if(this.disabled)return;const fn=this.listeners.click||this.onclick;if(fn)fn();}
  load(){}
  walk(fn){for(const e of this.children){if(!(e instanceof Element))continue;fn(e);e.walk(fn);}}
  querySelector(selector){
    const match=/^input\[name="([^"]+)"\]:checked$/.exec(selector);
    if(!match)throw new Error('Unsupported querySelector: '+selector);
    let found=null;this.walk(el=>{if(!found&&el.tagName==='input'&&el.name===match[1]&&el.checked)found=el;});
    return found;
  }
}
function makeDom(html){
  const ids={};const get=id=>ids[id]||(ids[id]=new Element('div',id));
  const doc={
    getElementById:get, createElement:tag=>new Element(tag),
    createTextNode:text=>({textContent:String(text)}),
    querySelector:sel=>get('quiz').querySelector(sel),
    querySelectorAll:sel=>{if(sel!=='.choice')throw Error(sel);return get('decisions').children.filter(x=>x.className.split(' ').includes('choice'));}
  };
  for(const m of html.matchAll(/\bid="([^"]+)"/g))get(m[1]);
  for(const m of html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)){
    if(/\bclass="[^"]*\bhidden\b/.test(m[0]))get(m[1]).classList.add('hidden');
    if(/\bdisabled\b/.test(m[0]))get(m[1]).disabled=true;
  }
  const sandbox={document:doc,window:{scrollTo(){}},console,Math};
  vm.createContext(sandbox);
  const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(x=>x[1]);
  assert.ok(scripts.length,'Missing inline script');
  scripts.forEach(s=>vm.runInContext(s,sandbox,{timeout:2000}));
  const evaluate=code=>vm.runInContext(code,sandbox,{timeout:2000});
  return {get,doc,evaluate};
}
function answerQuestions(form,correctCount){
  let groups=[];
  form.walk(el=>{if(el.tagName==='input'&&el.type==='radio'){const k=el.name;let group=groups.find(g=>g.key===k);if(!group){group={key:k,opts:[]};groups.push(group);}group.opts.push(el);}});
  assert.equal(groups.length,5,'Expected exactly five questions');
  for(let i=0;i<groups.length;i++){
    const group=groups[i];
    const correct=group.opts.find(x=>x.value==='0');
    const wrong=group.opts.find(x=>x.value!=='0');
    assert.ok(correct&&wrong,'Missing a right/wrong option');
    for(const opt of group.opts)opt.checked=false;
    (i<correctCount?correct:wrong).checked=true;
  }
  return groups.map(g=>g.opts.map(x=>x.value).join('')).join('/');
}
const pilotHtml=fs.readFileSync(path.join(root,'traffic-interactive-pilot.html'),'utf8');
const p=makeDom(pilotHtml);
assert.equal(p.evaluate('lessons.length'),7);
for(let i=0;i<7;i++)assert.equal(p.evaluate('lessons['+i+'].facts.length'),5);
p.get('check').click();
assert.match(p.get('status').textContent,/جميع الأسئلة/,'Empty answers must be rejected');
answerQuestions(p.get('quiz'),3);
p.get('check').click();
assert.match(p.get('status').textContent,/60%/,'Three correct answers must fail');
assert.ok(p.get('next').classList.contains('hidden'),'Failure must not unlock next');
answerQuestions(p.get('quiz'),4);
p.get('check').click();
assert.match(p.get('status').textContent,/80%/,'Four correct answers must pass');
for(let i=1;i<7;i++){
  p.get('next').click();
  assert.match(p.get('counter').textContent,new RegExp('الدرس '+(i+1)+' من 7'));
  answerQuestions(p.get('quiz'),5);
  p.get('check').click();
  assert.match(p.get('status').textContent,/100%/);
}
p.get('next').click();
assert.match(p.get('status').textContent,/أكملت النموذج/);
console.log('PASS: seven lessons, missing-answer gate, 60% fail, 80% pass and final completion');
for(let num=1;num<=5;num++){
  const file='traffic-module-0'+num+'-enhanced.html';
  const t=makeDom(fs.readFileSync(path.join(root,file),'utf8'));
  assert.equal(t.evaluate('bank.length'),5,file+' bank size');
  assert.ok(t.get('toQuiz').disabled,file+' scenario must gate quiz');
  t.get('toActivity').click();
  assert.ok(!t.get('activity').classList.contains('hidden'));
  const right=t.get('decisions').children.find(b=>b.textContent.includes('Stop ')||b.textContent.includes('إيقاف')||b.textContent.includes('أوقف'));
  // Find by actual scenario model rather than guessed button wording.
  const correctIndex=t.evaluate('options.findIndex(o=>o.right)');
  const correctButton=t.get('decisions').children[correctIndex];
  assert.ok(correctButton,file+' scenario correct button');
  correctButton.click();
  assert.ok(!t.get('toQuiz').disabled,file+' scenario correct unlocks quiz');
  t.get('toQuiz').click();
  assert.ok(!t.get('assessment').classList.contains('hidden'));
  t.get('grade').click();
  assert.match(t.get('score').textContent,/Please answer all questions first/);
  const initial=answerQuestions(t.get('quiz'),3);
  t.get('grade').click();
  assert.match(t.get('score').textContent,/60%/);
  assert.ok(!t.get('retry').classList.contains('hidden'),'Fail must reveal retry');
  t.get('retry').click();
  const changed=new Set([initial,answerQuestions(t.get('quiz'),4)]);
  for(let attempt=0;attempt<10&&changed.size===1;attempt++){
    t.get('retry').click();
    changed.add(answerQuestions(t.get('quiz'),4));
  }
  assert.ok(changed.size>1,file+' shuffle remains static across retries');
  t.get('grade').click();
  assert.match(t.get('score').textContent,/80%/);
  assert.ok(!t.get('finish').classList.contains('hidden'),'80% must unlock finish');
  t.get('finish').click();
  assert.ok(!t.get('complete').classList.contains('hidden'));
  console.log('PASS: module '+num+' scenario gate, empty answer, retry, shuffle and pass');
}
console.log('PASS: ALL interactive flow smoke tests (review-only)');
