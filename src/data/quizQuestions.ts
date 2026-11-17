import { QuestionData } from '@/types';

export const NURSING_UNITS = [
  'Custom',
  'Medical-Surgical Nursing',
  'Obstetric Nursing & Midwifery',
  'Community Health Nursing',
  'Paediatric Nursing',
  'Mental Health & Psychiatric Nursing',
  'Nursing Ethics, Jurisprudence & Professional Practice',
  'Nursing Fundamentals & Health Assessment',
  'Pharmacology & Therapeutics'
] as const;

export type NursingUnit = typeof NURSING_UNITS[number];

// NCK Licensure Papers for Kenyan Final Year Nursing Students
export const NCK_EXAMS = [
  'NCK Registered Nurse (RN) FQE',
  'NCK Community Health Nursing',
  'NCK Midwifery & Obstetric Nursing',
  'NCK Psychiatric & Mental Health Nursing',
  'NCK Nursing Ethics & Professional Jurisprudence'
] as const;

export const ENTRANCE_EXAMS = [] as const;
export const NURSING_EXAMS = NCK_EXAMS;
export const EXIT_EXAMS = [] as const;

export const EXAM_GROUPS: Record<string, readonly string[]> = {
  'NCK Licensure Papers': NCK_EXAMS
};

export const POPULAR_EXAM_ORDER: readonly string[] = [
  'NCK Registered Nurse (RN) FQE',
  'NCK Community Health Nursing',
  'NCK Midwifery & Obstetric Nursing',
  'NCK Psychiatric & Mental Health Nursing',
  'NCK Nursing Ethics & Professional Jurisprudence'
];

export function sortExamCategories(categories: string[]): string[] {
  return [...categories].sort((a, b) => {
    const idxA = POPULAR_EXAM_ORDER.indexOf(a);
    const idxB = POPULAR_EXAM_ORDER.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });
}

export const ALL_EXAM_TYPES = [
  'NCK Registered Nurse (RN) FQE',
  'NCK Community Health Nursing',
  'NCK Midwifery & Obstetric Nursing',
  'NCK Psychiatric & Mental Health Nursing',
  'NCK Nursing Ethics & Professional Jurisprudence'
] as const;

export function normalizeExamCategory(mode?: string): string {
  if (!mode) return 'NCK Registered Nurse (RN) FQE';
  const m = mode.trim();
  const upper = m.toUpperCase();

  if (upper.includes('COMMUNITY') || upper.includes('PUBLIC HEALTH')) return 'NCK Community Health Nursing';
  if (upper.includes('MIDWIFERY') || upper.includes('OBSTETRIC')) return 'NCK Midwifery & Obstetric Nursing';
  if (upper.includes('PSYCHIATRIC') || upper.includes('MENTAL')) return 'NCK Psychiatric & Mental Health Nursing';
  if (upper.includes('ETHICS') || upper.includes('JURISPRUDENCE') || upper.includes('PROFESSIONAL')) return 'NCK Nursing Ethics & Professional Jurisprudence';

  return 'NCK Registered Nurse (RN) FQE';
}

export const ALL_QUIZ_QUESTIONS: QuestionData[] = [
  {
    id: 'nck-rn-1',
    examMode: 'NCK Registered Nurse (RN) FQE',
    unitDomain: 'Medical-Surgical Nursing',
    questionTypeId: 'single_choice',
    questionTypeLabel: 'Single Choice',
    difficulty: 'Hard',
    questionStem: 'A client with acute myocardial infarction develops sudden dyspnea, tachypnea, and pink frothy sputum. Auscultation reveals bilateral crackles. Which nursing action is priority?',
    options: [
      { id: 'o1', text: 'Administer high-flow oxygen via non-rebreather mask and position in high-Fowler', isCorrect: true, explanation: 'Correct. Acute pulmonary edema requires immediate oxygenation and upright positioning to decrease venous return.' },
      { id: 'o2', text: 'Place client in Trendelenburg position to improve cerebral perfusion', isCorrect: false, explanation: 'Trendelenburg position would worsen respiratory distress by pushing abdominal contents against the diaphragm.' },
      { id: 'o3', text: 'Prepare the client for immediate ambulation in the corridor', isCorrect: false, explanation: 'Ambulation is strictly contraindicated during acute decompensated heart failure.' },
      { id: 'o4', text: 'Administer oral glucose tablets immediately', isCorrect: false, explanation: 'This is not indicative of hypoglycemia.' }
    ],
    rationale: 'Acute pulmonary edema is a medical emergency requiring rapid oxygenation, upright posture, and diuretics/vasodilators.'
  },
  {
    id: 'nck-rn-2',
    examMode: 'NCK Registered Nurse (RN) FQE',
    unitDomain: 'Medical-Surgical Nursing',
    questionTypeId: 'single_choice',
    questionTypeLabel: 'Single Choice',
    difficulty: 'Medium',
    questionStem: 'Which laboratory finding is most critical to report immediately for a client receiving heparin infusion for pulmonary embolism?',
    options: [
      { id: 'o1', text: 'Activated Partial Thromboplastin Time (aPTT) of 98 seconds', isCorrect: true, explanation: 'Correct. An aPTT above 80-100 seconds indicates excessive anticoagulation and high bleeding risk.' },
      { id: 'o2', text: 'Serum potassium of 4.2 mEq/L', isCorrect: false, explanation: 'Serum potassium of 4.2 mEq/L is within normal limits.' },
      { id: 'o3', text: 'White blood cell count of 7,500/mcL', isCorrect: false, explanation: 'WBC count is within normal limits.' },
      { id: 'o4', text: 'Hemoglobin of 13.5 g/dL', isCorrect: false, explanation: 'Hemoglobin is within normal limits.' }
    ],
    rationale: 'Heparin therapy is monitored via aPTT, aiming for 1.5 to 2.5 times control. Values significantly above range require dose reduction.'
  },
  {
    id: 'nck-comm-1',
    examMode: 'NCK Community Health Nursing',
    unitDomain: 'Community Health Nursing',
    questionTypeId: 'single_choice',
    questionTypeLabel: 'Single Choice',
    difficulty: 'Medium',
    questionStem: 'According to the Kenya Ministry of Health immunization schedule, at what age is the first dose of oral polio vaccine (OPV 1) administered?',
    options: [
      { id: 'o1', text: '6 weeks', isCorrect: true, explanation: 'Correct. OPV 1, Pentavalent 1, and PCV 1 are administered at 6 weeks of age.' },
      { id: 'o2', text: 'At birth', isCorrect: false, explanation: 'At birth, BCG and OPV 0 are administered.' },
      { id: 'o3', text: '10 weeks', isCorrect: false, explanation: '10 weeks is dose 2 for Pentavalent, PCV, and OPV.' },
      { id: 'o4', text: '9 months', isCorrect: false, explanation: '9 months is for Measles-Rubella and Yellow Fever.' }
    ],
    rationale: 'The routine infant immunization schedule in Kenya specifies 6, 10, and 14 weeks for primary vaccination series.'
  },
  {
    id: 'nck-mid-1',
    examMode: 'NCK Midwifery & Obstetric Nursing',
    unitDomain: 'Obstetric Nursing & Midwifery',
    questionTypeId: 'single_choice',
    questionTypeLabel: 'Single Choice',
    difficulty: 'Hard',
    questionStem: 'A primigravida at 38 weeks gestation presents with sudden onset of severe abdominal pain and a rigid, tender uterus. Fetal heart rate is 90 bpm. What is the suspected diagnosis?',
    options: [
      { id: 'o1', text: 'Placental abruption', isCorrect: true, explanation: 'Correct. Painful vaginal bleeding (or concealed) with uterine tenderness and fetal distress characterizes placental abruption.' },
      { id: 'o2', text: 'Placenta previa', isCorrect: false, explanation: 'Placenta previa typically presents with painless bright red bleeding.' },
      { id: 'o3', text: 'Normal latent phase of labor', isCorrect: false, explanation: 'Severe pain and rigid uterus with fetal bradycardia are pathological.' },
      { id: 'o4', text: 'Uterine rupture in unscarred uterus', isCorrect: false, explanation: 'Abruption is the primary differential for painful bleeding with rigid uterus.' }
    ],
    rationale: 'Placental abruption is a life-threatening obstetric emergency causing retroplacental hemorrhage.'
  },
  {
    id: 'nck-psych-1',
    examMode: 'NCK Psychiatric & Mental Health Nursing',
    unitDomain: 'Mental Health & Psychiatric Nursing',
    questionTypeId: 'single_choice',
    questionTypeLabel: 'Single Choice',
    difficulty: 'Hard',
    questionStem: 'A client admitted to the psychiatric unit believes that television broadcasts are sending secret coded messages specifically meant for them. What type of delusion is this?',
    options: [
      { id: 'o1', text: 'Delusion of reference', isCorrect: true, explanation: 'Correct. Believing neutral environmental events or broadcasts have personal significance is a delusion of reference.' },
      { id: 'o2', text: 'Grandiose delusion', isCorrect: false, explanation: 'Grandiose delusions involve inflated self-importance or power.' },
      { id: 'o3', text: 'Persecutory delusion', isCorrect: false, explanation: 'Persecutory delusions involve belief of being targeted for harm or surveillance.' },
      { id: 'o4', text: 'Somatic delusion', isCorrect: false, explanation: 'Somatic delusions involve bodily functions or sensations.' }
    ],
    rationale: 'Delusions of reference involve misinterpreting harmless external occurrences as having direct personal meaning.'
  },
  {
    id: 'nck-eth-1',
    examMode: 'NCK Nursing Ethics & Professional Jurisprudence',
    unitDomain: 'Nursing Ethics, Jurisprudence & Professional Practice',
    questionTypeId: 'single_choice',
    questionTypeLabel: 'Single Choice',
    difficulty: 'Medium',
    questionStem: 'Which ethical principle is upheld when a nurse respects a competent client\'s informed decision to refuse life-saving blood transfusion?',
    options: [
      { id: 'o1', text: 'Autonomy', isCorrect: true, explanation: 'Correct. Autonomy is the right of competent individuals to make self-determined health care choices.' },
      { id: 'o2', text: 'Beneficence', isCorrect: false, explanation: 'Beneficence requires acting in the best interest of the client.' },
      { id: 'o3', text: 'Maleficence', isCorrect: false, explanation: 'Maleficence refers to doing harm.' },
      { id: 'o4', text: 'Paternalism', isCorrect: false, explanation: 'Paternalism overrides client autonomy for perceived benefit.' }
    ],
    rationale: 'Patient autonomy allows competent adults to accept or refuse medical treatments.'
  }
];
