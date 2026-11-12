/* SECURITY INSTRUCTOR Traffic — isolated staging only.
 * No production fallback, no public activation, no credentials here.
 * To run a connected staging test, deploy the isolated Traffic backend to the
 * approved staging service and explicitly set SI_TRAFFIC_STAGING_API below.
 * Never point this file at the production SI backend.
 */
window.SI_TRAFFIC_STAGING_API = 'https://si-avs-staging-test.onrender.com';
