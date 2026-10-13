'use strict';

/**
 * Multi-course self-study path registry.
 *
 * SAFETY CONTRACT:
 * - This registry is deliberately not wired into live routes yet.
 * - Every new path remains disabled until content, assessments, and E2E tests
 *   have been reviewed and approved.
 * - Existing Fire Safety routes, records, grading, access links, and
 *   certificates must remain the source of truth until a separately reviewed
 *   migration is completed.
 * - Durations are intentionally unset here; never infer or overwrite a course
 *   policy from these defaults.
 */

const SHARED_RULES = Object.freeze({
  formativeQuestionCount: 5,
  formativePassPercent: 80,
  finalQuestionCount: 30,
  finalPassPercentExclusive: 70,
  finalMinimumCorrect: 22,
  totalAttempts: 3,
  shuffleQuestions: true,
  shuffleOptions: true,
  serverSideScoringRequired: true,
  answerKeyClientVisible: false
});

const planned = (slug, code, title, modules) => Object.freeze({
  slug,
  code,
  title,
  status: 'planned',
  enabled: false,
  languageSupport: ['en', 'ar'],
  durations: Object.freeze({
    trainingHours: null,
    accessLinkHours: null,
    activeStudyHours: null
  }),
  rules: SHARED_RULES,
  modules: Object.freeze(modules.map((module, index) => Object.freeze({
    id: `module-${index + 1}`,
    order: index + 1,
    title: module,
    contentStatus: 'needs-review',
    media: Object.freeze([]),
    questionBankVersion: null
  }))),
  releaseChecks: Object.freeze({
    contentReviewed: false,
    answerKeysValidated: false,
    serverSideGradingTested: false,
    randomizedGradingTested: false,
    expiryAndResumeTested: false,
    mobileAndDesktopTested: false,
    certificateFlowTested: false,
    endToEndTestsPassed: false
  })
});

const SELF_STUDY_PATHS = Object.freeze({
  'traffic-management-vehicle-control': planned(
    'traffic-management-vehicle-control',
    'CRS-TRAFFIC-001',
    'Traffic Management & Vehicle Control',
    [
      'Traffic risks, site layout, and vehicle/pedestrian interaction',
      'Traffic control zones, signs, and barriers',
      'Directing vehicle movement and safe positioning',
      'Incidents, breakdowns, emergency access, and escalation',
      'Practical scenarios, reporting, and final review'
    ]
  ),
  'crowd-management-event-security': planned(
    'crowd-management-event-security',
    'CRS-CROWD-001',
    'Crowd Management & Event Security',
    [
      'Crowd behavior, density, and early warning signs',
      'Access control, entry/exit flow, and screening interfaces',
      'Communication, queue management, and coordination',
      'Crowd incidents, emergency routes, and escalation',
      'Scenario practice, reporting, and final review'
    ]
  ),
  'fire-safety-emergency-response': planned(
    'fire-safety-emergency-response',
    'CRS-FIRE-001',
    'Fire Safety & Emergency Response',
    [
      'Fire science and building hazards',
      'Fire classifications and portable extinguishing agents',
      'Detection, alarms, and suppression',
      'Tactical response and facility fire plans',
      'Evacuation and incident command'
    ]
  ),
  'vehicle-search-security-inspection': planned(
    'vehicle-search-security-inspection',
    'CRS-VEHICLE-001',
    'Vehicle Search & Security Inspection',
    [
      'Purpose, authority, safety, and inspection boundaries',
      'Approach, positioning, and systematic external inspection',
      'Interior and compartment inspection principles',
      'Suspicious findings, scene safety, reporting, and escalation',
      'Scenario practice, documentation, and final review'
    ]
  ),
  'person-search-security-screening': planned(
    'person-search-security-screening',
    'CRS-PERSON-001',
    'Person Search & Security Screening',
    [
      'Lawful authority, consent/policy boundaries, dignity, and communication',
      'Preparation, positioning, and systematic screening principles',
      'Screening equipment awareness and safe use within training',
      'Prohibited/suspicious items, escalation, and privacy',
      'Scenario practice, reporting, and final review'
    ]
  )
});

function getPlannedPath(slug) {
  return Object.prototype.hasOwnProperty.call(SELF_STUDY_PATHS, slug)
    ? SELF_STUDY_PATHS[slug]
    : null;
}

module.exports = {
  SHARED_RULES,
  SELF_STUDY_PATHS,
  getPlannedPath
};
