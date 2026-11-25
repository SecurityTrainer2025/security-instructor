(() => {
 const staging = location.hostname === 'si-staging-ui.onrender.com' ||
   new URLSearchParams(location.search).get('api') === 'staging';
 window.SI_ADMIN_CONFIG = Object.freeze({
  staging,
  api: staging ? window.SI_STAGING_API_ORIGIN : 'https://security-instructor.onrender.com',
  tokenKey: staging ? 'securityInstructorAdminToken:staging' : 'securityInstructorAdminToken',
 });
})();
