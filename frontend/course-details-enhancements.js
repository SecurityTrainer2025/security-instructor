/* Shared course-details enhancements. */
(function(){
  const API='https://security-instructor.onrender.com';
  const slug=new URLSearchParams(location.search).get('course');
  if(!slug) return;
  window.COURSE_STATS_API=API;
})();
