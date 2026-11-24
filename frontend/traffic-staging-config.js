/* SECURITY INSTRUCTOR Traffic — isolated staging only.
 * The dedicated staging UI uses the staging API. A loopback UI uses the local API.
 */
const trafficHost = window.location.hostname;
window.SI_TRAFFIC_STAGING_API = trafficHost === 'si-staging-ui.onrender.com'
  ? 'https://si-avs-staging-test.onrender.com'
  : ['127.0.0.1', 'localhost'].includes(trafficHost)
    ? 'http://127.0.0.1:5000'
    : '';

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
