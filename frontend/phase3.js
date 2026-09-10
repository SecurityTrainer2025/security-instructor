/* Phase 3 — responsive QA guardrails for all public pages.
   Adds only responsive behavior; existing desktop styling remains the source of truth. */
(function(){
  var id='phase3-responsive-runtime';
  if(document.getElementById(id)) return;
  var s=document.createElement('style'); s.id=id;
  s.textContent=`
    html{overflow-x:hidden!important} body{overflow-x:hidden!important}
    img{max-width:100%}
    @media(max-width:900px){
      .course-grid,.courses-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      .details-wrap .course-hero{grid-template-columns:1fr!important}
      .details-wrap .objectives-grid{grid-template-columns:1fr!important}
      .details-wrap .modules{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      .details-wrap .stats-content{grid-template-columns:1fr!important}
      .details-wrap .stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      .details-wrap .rating-box{border-left:0!important;border-top:1px solid #718191!important;padding:18px 0 0!important}
    }
    @media(max-width:600px){
      .course-grid,.courses-grid{grid-template-columns:1fr!important}
      .course-card{min-width:0!important}
      .course-card img,.course-card .course-image{height:auto!important;aspect-ratio:16/10;object-fit:cover}
      .course-card .course-actions,.course-card .actions{display:flex!important;flex-direction:column!important;gap:8px!important}
      .course-card .course-actions a,.course-card .actions a,.course-card button{width:100%!important;min-height:44px!important}
      .details-wrap{width:100%;max-width:100%}
      .details-wrap .course-image{height:auto!important;aspect-ratio:4/3;object-fit:cover}
      .details-wrap .title-en{font-size:clamp(27px,8vw,38px)!important;line-height:1.08!important;overflow-wrap:anywhere}
      .details-wrap .title-ar{font-size:clamp(21px,6vw,29px)!important;line-height:1.4!important}
      .details-wrap .modules{grid-template-columns:1fr!important}
      .details-wrap .practical{grid-template-columns:1fr!important}
      .details-wrap .practical img{height:auto!important;aspect-ratio:16/9;object-fit:cover}
      .details-wrap .stats-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      .details-wrap .stars{flex-wrap:wrap!important}
      .details-wrap .footer-actions{grid-template-columns:1fr!important}
      .details-wrap .action{width:100%!important;min-height:46px!important}
      .details-wrap .stats,.details-wrap .rating-box,.details-wrap .panel,.details-wrap .module{min-width:0!important;max-width:100%!important;overflow-wrap:anywhere}
    }
    @media(max-width:380px){.details-wrap .stats-grid{grid-template-columns:1fr!important}.details-wrap .star-btn{width:44px!important;height:44px!important}}
  `;
  document.head.appendChild(s);
})();
