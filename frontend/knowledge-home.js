const API=(window.APP_CONFIG&&window.APP_CONFIG.API_BASE)||'https://security-instructor.onrender.com';
const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
const excerpt=s=>{const t=String(s??'').replace(/\s+/g,' ').trim();return t.length>260?t.slice(0,257)+'…':t};
const lang=()=>document.documentElement.dir==='rtl'?'ar':'en';
fetch(API+'/api/articles',{cache:'no-store'}).then(r=>r.ok?r.json():[]).then(rows=>{
  const host=document.getElementById('featuredArticle');
  if(!host)return;
  if(!Array.isArray(rows)||!rows.length){
    host.innerHTML='<div class="featured-card"><div class="article-meta">KNOWLEDGE HUB · FEATURED ARTICLE</div><h3>Be the first expert contributor</h3><p>Share a practical security, safety, leadership or training insight and help build the SECURITY INSTRUCTOR knowledge community.</p><div class="launch-cta"><a class="btn gold" href="article-submit.html">Submit an Article</a><a class="btn outline" href="knowledge-hub.html">Open Knowledge Hub</a></div></div><div class="featured-side"><h3>What belongs here</h3><ul><li>Practical field knowledge</li><li>Professional lessons and insights</li><li>Training and competency development</li><li>Non-confidential case studies</li></ul></div>';
    return;
  }
  const a=rows[0];
  const titleEn=a.titleEn||a.titleAr||'Featured Article';
  const titleAr=a.titleAr||titleEn;
  const content=lang()==='ar'?(a.contentAr||a.contentEn):(a.contentEn||a.contentAr);
  const title=lang()==='ar'?titleAr:titleEn;
  host.innerHTML=`<div class="featured-card"><div class="article-meta">${esc(a.category||'Professional Insight')} · Featured</div><h3>${esc(title)}</h3><p>${esc(excerpt(content))}</p><div class="launch-cta"><a class="btn gold" href="article-view.html?slug=${encodeURIComponent(a.slug||'')}">Read Full Article</a><a class="btn outline" href="knowledge-hub.html">Knowledge Hub</a></div></div><div class="featured-side"><h3>Contributor</h3><p><strong>${esc(a.authorName||'Expert Contributor')}</strong></p><p>${esc(a.authorTitle||'Security & Training Professional')}</p><hr><p>Explore more approved articles, professional insights and contributor opportunities through the Knowledge Hub.</p><a class="btn gold" href="experts.html">Meet Contributors</a></div>`;
}).catch(()=>{});
