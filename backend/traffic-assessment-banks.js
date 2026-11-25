const {readFileSync}=require('node:fs');
const {join}=require('node:path');

function readBank(name){
  const sections=new Map();
  let current;
  for(const line of readFileSync(join(__dirname,'traffic-assessments',name+'.txt'),'utf8').trim().split(/\r?\n/)){
    const section=/^\[(\w+)\]$/.exec(line);
    if(section){
      if(sections.has(section[1]))throw new Error('Duplicate Traffic assessment section: '+section[1]);
      current=[];
      sections.set(section[1],current);
      continue;
    }
    const fields=line.split('|');
    if(!current||![4,10].includes(fields.length)||fields.some(field=>!field.trim()))
      throw new Error('Invalid Traffic assessment row in '+name);
    current.push(fields);
  }
  return sections;
}

const joinLanguages=(en,ar)=>en+' / '+ar;
function choices(rows,nearby=rows){
  return rows.map(([en,ar,answerEn,answerAr,...alternatives],index)=>{
    const correct=joinLanguages(answerEn,answerAr);
    const explicit=alternatives.length?Array.from({length:3},(_,i)=>joinLanguages(...alternatives.slice(i*2,i*2+2))):null;
    const offset=(index*3)%nearby.length;
    const neighbors=[...nearby.slice(offset),...nearby.slice(0,offset)].map(row=>joinLanguages(row[2],row[3]));
    const distractors=explicit||[...new Set(neighbors.filter(answer=>answer!==correct))].slice(0,3);
    const options=[correct,...distractors];
    if(options.length!==4||new Set(options).size!==4)throw new Error('Invalid Traffic answers: '+en);
    return {q:joinLanguages(en,ar),a:options,correct:0};
  });
}

const lessonRows=readBank('lessons');
const unitRows=readBank('units');
const initialRows=readBank('diagnostic');
const finalRows=readBank('final');
const lessons=new Map([...lessonRows].map(([id,rows])=>[id,choices(rows)]));
const units=new Map([...unitRows].map(([id,rows])=>[id,choices(rows)]));
const diagnostic=choices(initialRows.get('diagnostic'));
const final=[...finalRows].flatMap(([id,rows])=>choices(rows,[...rows,...unitRows.get(id)]));
const all=[...lessons.values(),...units.values(),diagnostic,final].flat();
const normalize=stem=>stem.normalize('NFKC').toLowerCase().replace(/[\p{P}\p{Z}]/gu,'');
const stems=all.map(item=>item.q.split(' / '));
if(lessons.size!==40||[...lessons.values()].some(q=>q.length!==5)||
   units.size!==8||[...units.values()].some(q=>q.length!==10)||
   diagnostic.length!==10||final.length!==30||all.length!==320||
   new Set(stems.map(([en])=>normalize(en))).size!==all.length||
   new Set(stems.map(([,ar])=>normalize(ar))).size!==all.length){
  throw new Error('Traffic assessment bank counts or uniqueness invalid');
}

module.exports={lessons,units,diagnostic,final};
