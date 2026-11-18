/* SECURITY INSTRUCTOR Traffic — isolated staging only.
 * No production fallback, no public activation, no credentials here.
 * To run a connected staging test, deploy the isolated Traffic backend to the
 * approved staging service and explicitly set SI_TRAFFIC_STAGING_API below.
 * Never point this file at the production SI backend.
 */
window.SI_TRAFFIC_STAGING_API = 'https://si-avs-staging-test.onrender.com';

/* In-place Traffic media approvals, never a new course or deployment target.
 * Keep all false until each final live-motion video passes media QA and
 * a qualified instructor reviews the actual traffic-control instructions.
 */
window.SI_TRAFFIC_FINAL_MEDIA = {
  tm1s1: {file: 'assets/traffic-videos/01_where_traffic_marshal_works.mp4', approved: false},
  tm1s2: {file: 'assets/traffic-videos/02_tmp_and_risk_assessment.mp4', approved: false},
  tm2s1: {file: 'assets/traffic-videos/03_access_control_points.mp4', approved: false},
  tm2s2: {file: 'assets/traffic-videos/04_driver_induction.mp4', approved: false},
  tm3s1: {file: 'assets/traffic-videos/05_pedestrian_safety.mp4', approved: false},
  tm3s2: {file: 'assets/traffic-videos/06_parking_and_reversing.mp4', approved: false},
  tm4s1: {file: 'assets/traffic-videos/07_ppe_heat_weather.mp4', approved: false},
  tm4s2: {file: 'assets/traffic-videos/08_incident_reporting.mp4', approved: false},
  tm5s1: {file: 'assets/traffic-videos/09_six_hand_signals.mp4', approved: false},
  tm5s2: {file: 'assets/traffic-videos/10_radios_and_shift_handover.mp4', approved: false},
};
