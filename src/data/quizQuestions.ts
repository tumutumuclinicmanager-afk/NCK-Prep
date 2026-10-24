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

export const ALL_QUIZ_QUESTIONS: QuestionData[] = [];
