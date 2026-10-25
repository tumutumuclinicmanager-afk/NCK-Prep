import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  MapPin, 
  Award, 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  CheckCircle,
  Stethoscope,
  ShieldCheck,
  GraduationCap,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface RoadmapMilestone {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  keyTopics: string[];
  actionLink: string;
  actionLabel: string;
  estimatedWeeks: string;
}

const DEFAULT_MILESTONES: RoadmapMilestone[] = [
  {
    id: 'milestone-1',
    title: '1. Academic & Clinical Clearance',
    subtitle: 'Training Completion & Logbooks',
    category: 'Foundation',
    description: 'Complete all required theory hours, clinical rotations, and case presentations in accredited Kenyan nursing training institutions.',
    keyTopics: ['Clinical hours sign-off', 'Case study presentation', 'Departmental rotations'],
    actionLink: '/dashboard/library',
    actionLabel: 'Explore Clinical Library',
    estimatedWeeks: 'Weeks 1-2'
  },
  {
    id: 'milestone-2',
    title: '2. NCK Indexing & Exam Eligibility',
    subtitle: 'Nursing Council Portal Verification',
    category: 'Regulatory',
    description: 'Verify your index number on the NCK portal, confirm index validity, and clear graduation requirements with your institution.',
    keyTopics: ['NCK Portal profile check', 'Institutional clearance', 'Index number activation'],
    actionLink: '/dashboard/exams',
    actionLabel: 'Check NCK Papers',
    estimatedWeeks: 'Week 3'
  },
  {
    id: 'milestone-3',
    title: '3. Med-Surg & Pharmacology Mastery',
    subtitle: 'Adult Health & High-Alert Meds',
    category: 'Core Clinical',
    description: 'Master adult medical-surgical pathology, emergency interventions, perioperative nursing, and ISMP high-alert medication protocols.',
    keyTopics: ['Cardiovascular & Respiratory disorders', 'Fluid & electrolyte balance', 'Pharmacological calculations'],
    actionLink: '/dashboard/exams?category=Medical-Surgical%20Nursing',
    actionLabel: 'Take Med-Surg Quiz',
    estimatedWeeks: 'Weeks 4-6'
  },
  {
    id: 'milestone-4',
    title: '4. Midwifery & Obstetric Competency',
    subtitle: 'Maternal Newborn & EMoC Protocols',
    category: 'Midwifery',
    description: 'Master Antenatal Care (ANC), intrapartum fetal monitoring (Partograph), Emergency Obstetric Care (EMoC), and postpartum management per MOH Kenya.',
    keyTopics: ['Partograph interpretation', 'Management of PPH & Preeclampsia', 'Neonatal resuscitation (NRP)'],
    actionLink: '/dashboard/exams?category=Obstetric%20Nursing%20%26%20Midwifery',
    actionLabel: 'Practice Midwifery',
    estimatedWeeks: 'Weeks 7-9'
  },
  {
    id: 'milestone-5',
    title: '5. Community Health & Paediatrics',
    subtitle: 'IMCI, EPI & Public Health',
    category: 'Public Health',
    description: 'Master Integrated Management of Childhood Illnesses (IMCI), Expanded Programme on Immunization (EPI Kenya), epidemiology, and primary health care.',
    keyTopics: ['IMCI clinical algorithms', 'Kenya immunization schedule', 'Epidemiological disease control'],
    actionLink: '/dashboard/exams?category=Community%20Health%20Nursing',
    actionLabel: 'Review Community Health',
    estimatedWeeks: 'Weeks 10-11'
  },
  {
    id: 'milestone-6',
    title: '6. Mental Health & Professional Ethics',
    subtitle: 'Psychiatry & NCK Jurisprudence',
    category: 'Law & Ethics',
    description: 'Review psychiatric nursing disorders, therapeutic communication, NCK code of professional conduct, and nursing jurisprudence in Kenya.',
    keyTopics: ['Psychopharmacology & de-escalation', 'NCK scope of practice & malpractice', 'Ethical dilemma resolution'],
    actionLink: '/dashboard/exams?category=Mental%20Health%20%26%20Psychiatric%20Nursing',
    actionLabel: 'Test Psych & Ethics',
    estimatedWeeks: 'Week 12'
  },
  {
    id: 'milestone-7',
    title: '7. Final Mock FQE Practice & Review',
    subtitle: 'Timed Board Simulation Papers',
    category: 'Simulation',
    description: 'Take timed NCK Final Qualifying Examination (FQE) mock papers under strict exam conditions and review expert rationales.',
    keyTopics: ['Timed 100-question mock exams', 'Weakness analytics breakdown', 'Diagnostic readiness score 75%+'],
    actionLink: '/dashboard/exams',
    actionLabel: 'Take Mock FQE',
    estimatedWeeks: 'Weeks 13-14'
  },
  {
    id: 'milestone-8',
    title: '8. NCK Board Exam Booking & Clearance',
    subtitle: 'Final Registration & Center Readiness',
    category: 'Licensure',
    description: 'Book your NCK examination center, print your official NCK examination card, and complete final mental & physical preparation.',
    keyTopics: ['Examination card printing', 'Center verification', 'Final readiness check'],
    actionLink: '/dashboard/performance',
    actionLabel: 'View Readiness Dashboard',
    estimatedWeeks: 'Exam Week'
  }
];

export function NckPreparationRoadmap() {
  const navigate = useNavigate();
  const [completedMilestones, setCompletedMilestones] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load progress from localStorage / Firestore
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const local = localStorage.getItem('nckprep_roadmap_progress');
        if (local) {
          setCompletedMilestones(JSON.parse(local));
        }

        if (auth.currentUser) {
          try {
            const docRef = doc(db, 'userRoadmap', auth.currentUser.uid);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
              const data = snap.data();
              if (data && Array.isArray(data.completed)) {
                setCompletedMilestones(data.completed);
                localStorage.setItem('nckprep_roadmap_progress', JSON.stringify(data.completed));
              }
            }
          } catch (fsErr) {
            // Graceful fallback to local cache on permission issues
          }
        }
      } catch (err) {
        // Fallback
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  const toggleMilestone = async (id: string) => {
    let updated: string[];
    if (completedMilestones.includes(id)) {
      updated = completedMilestones.filter(m => m !== id);
    } else {
      updated = [...completedMilestones, id];
    }
    
    setCompletedMilestones(updated);
    localStorage.setItem('nckprep_roadmap_progress', JSON.stringify(updated));

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'userRoadmap', auth.currentUser.uid), {
          completed: updated,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        // Graceful fallback
      }
    }
  };

  const progressPercentage = Math.round((completedMilestones.length / DEFAULT_MILESTONES.length) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 mb-8">
      {/* Header & Progress Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold tracking-wide uppercase">
              NCK FQE Roadmap
            </span>
            <span className="text-xs font-medium text-slate-500">
              Kenyan Final Year Nursing Journey
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-blue-600" />
            NCK Board Examination Preparation Roadmap
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Track your progress across the 8 essential milestones required to successfully clear your Nursing Council of Kenya licensure exams.
          </p>
        </div>

        {/* Progress Badge */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4 shrink-0 shadow-xs">
          <div className="relative w-14 h-14 flex items-center justify-center">
            {/* Simple circular progress ring indicator */}
            <svg className="w-14 h-14 transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="currentColor"
                strokeWidth="5"
                className="text-slate-200 fill-none"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="currentColor"
                strokeWidth="5"
                strokeDasharray={150.79}
                strokeDashoffset={150.79 - (150.79 * progressPercentage) / 100}
                strokeLinecap="round"
                className="text-blue-600 fill-none transition-all duration-500"
              />
            </svg>
            <span className="absolute text-xs font-black text-slate-900">
              {progressPercentage}%
            </span>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Readiness Score
            </div>
            <div className="text-lg font-black text-slate-900">
              {completedMilestones.length} of {DEFAULT_MILESTONES.length} Completed
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
              {progressPercentage === 100 ? 'Fully Prepared for NCK FQE!' : 'Keep pushing forward!'}
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DEFAULT_MILESTONES.map((milestone, idx) => {
          const isCompleted = completedMilestones.includes(milestone.id);
          return (
            <div 
              key={milestone.id}
              className={`relative rounded-2xl border transition-all duration-200 flex flex-col justify-between p-5 bg-white ${
                isCompleted 
                  ? 'border-emerald-300 bg-emerald-50/20 shadow-xs' 
                  : 'border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md'
              }`}
            >
              {/* Top Row: Category & Checkbox */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase ${
                    isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {milestone.category}
                  </span>
                  <button
                    onClick={() => toggleMilestone(milestone.id)}
                    className="flex items-center gap-1.5 cursor-pointer group p-1"
                    title={isCompleted ? "Mark as incomplete" : "Mark as completed"}
                  >
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-4 h-4 fill-emerald-600 text-white" />
                        Done
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400 hover:text-blue-600 font-semibold text-xs bg-slate-100 group-hover:bg-blue-50 px-2 py-0.5 rounded-full transition-colors">
                        <Circle className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                        Pending
                      </span>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {milestone.estimatedWeeks}
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mb-1 tracking-tight">
                  {milestone.title}
                </h3>
                <p className="text-xs font-semibold text-slate-500 mb-2.5">
                  {milestone.subtitle}
                </p>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed line-clamp-3">
                  {milestone.description}
                </p>

                {/* Key Topics List */}
                <div className="space-y-1 mb-5">
                  {milestone.keyTopics.map((topic, tIdx) => (
                    <div key={tIdx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                      <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <span className="leading-tight">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-bold text-blue-600 hover:bg-blue-600 hover:text-white border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  onClick={() => navigate(milestone.actionLink)}
                >
                  <span>{milestone.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
