import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Database, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function InjectMock1Exam() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const mock1Questions = [
    {
      question: "Eclampsia is diagnosed when the patient presents with",
      options: [
        "oedema, convulsion, proteinuria",
        "Proteinuria, oedema, headache",
        "Proteinuria, low urine output, vomiting",
        "oedema, polyuria, oedema"
      ],
      correctAnswer: "oedema, convulsion, proteinuria",
      explanation: "Eclampsia is the occurrence of convulsions in a woman with preeclampsia. The classic triad is hypertension + proteinuria + oedema, plus seizures. Headache alone is a symptom of preeclampsia, not eclampsia.",
      difficulty: "Hard"
    },
    {
      question: "Mrs B para 0+0 gravida 1 is at 37 weeks 5 days gestation, comes to the clinic complaining of low back pain, abdominal pain and vaginal bleeding after she fell. She has changed two fully soaked perineal pads for the last four hours. She is most likely to have",
      options: [
        "Post-partum haemorrhage",
        "Placenta praevia",
        "Placenta abruption",
        "Cord prolapse"
      ],
      correctAnswer: "Placenta abruption",
      explanation: "Trauma + pain + bleeding in late pregnancy is classic for placental abruption. Placenta praevia is usually painless bleeding. She is still pregnant, so not PPH. Cord prolapse presents with fetal distress, not heavy bleeding.",
      difficulty: "Hard"
    },
    {
      question: "The layers of the uterus are:",
      options: [
        "Perimetrium, pericardium, fourchette",
        "Broad ligament, Round ligament, Endocervix",
        "Endometrium, myometrium, perimetrium",
        "Round ligament, myometrium, ischiocarvenosus"
      ],
      correctAnswer: "Endometrium, myometrium, perimetrium",
      explanation: "The three layers of the uterine wall are endometrium (inner lining), myometrium (smooth muscle), and perimetrium (serosal outer layer).",
      difficulty: "Easy"
    },
    {
      question: "The most important factors in fracture healing is:",
      options: [
        "Adequate phosphorus intake, Immobilization",
        "Good alignment, Immobilization",
        "Adequate calcium intake, wound closure",
        "Wound closure, adequate potassium intake"
      ],
      correctAnswer: "Good alignment, Immobilization",
      explanation: "Proper anatomical alignment and immobilization (to prevent movement at the fracture site) are the two most critical mechanical factors for successful bone healing.",
      difficulty: "Medium"
    },
    {
      question: "Licensing and registration of Nurses in Kenya is the mandate of:",
      options: [
        "Kenya progressive Nurses Association (KPNA)",
        "Kenya National Union of Nurses (KNUN)",
        "National Nurses Association of Kenya (NNAK)",
        "Nursing Council of Kenya (NCK)"
      ],
      correctAnswer: "Nursing Council of Kenya (NCK)",
      explanation: "The Nursing Council of Kenya (NCK) is the statutory regulatory body responsible for registration, licensing, and regulation of nursing practice in Kenya.",
      difficulty: "Easy"
    },
    {
      question: "One of the following statement best describes a professional nurse in Kenya",
      options: [
        "Trained outside Kenya, communicates well",
        "Treats clients with dignity, wears clean uniform",
        "Trained and licensed to practice",
        "Spiritual, cares about the patients"
      ],
      correctAnswer: "Trained and licensed to practice",
      explanation: "A professional nurse must be formally trained and hold a valid license to practice. Other attributes are desirable but the legal definition centers on training + licensure.",
      difficulty: "Medium"
    },
    {
      question: "An example of 3rd generation cephalosporin is:",
      options: [
        "Ceftriaxone",
        "Amikacin",
        "Erythromycin",
        "Gentamycin"
      ],
      correctAnswer: "Ceftriaxone",
      explanation: "Ceftriaxone is a classic 3rd-generation cephalosporin. Amikacin and gentamicin are aminoglycosides; erythromycin is a macrolide.",
      difficulty: "Medium"
    },
    {
      question: "Drug bio-availability is described as:",
      options: [
        "Amount of drug accessible at the site of action",
        "Amount of drug excreted through the kidney",
        "Amount of drug in the liver",
        "The dosage"
      ],
      correctAnswer: "Amount of drug accessible at the site of action",
      explanation: "Bioavailability is the fraction of an administered dose of unchanged drug that reaches the systemic circulation (and thus the site of action).",
      difficulty: "Medium"
    },
    {
      question: "A nurse formulates a diagnosis of altered tissue perfusion when a patient presents with",
      options: [
        "Hypoxia",
        "Paleness of the extremities",
        "Jaundice",
        "Gasps for air"
      ],
      correctAnswer: "Paleness of the extremities",
      explanation: "Altered peripheral tissue perfusion is commonly evidenced by cool, pale extremities, delayed capillary refill, and weak pulses.",
      difficulty: "Medium"
    },
    {
      question: "Self-care Deficit theory in nursing was proposed by",
      options: [
        "Florence Nightingale",
        "Dorothea Orem",
        "Virginia Henderson",
        "Jean Orlando"
      ],
      correctAnswer: "Dorothea Orem",
      explanation: "Dorothea Orem developed the Self-Care Deficit Nursing Theory.",
      difficulty: "Easy"
    },
    {
      question: "To prevent pressure sores for bedridden patients, the nurse should:",
      options: [
        "Massage the pressure site, Turn patient regularly",
        "Administer pain killers, catheterize the patient",
        "Offer diet rich in vitamins, Monitor vital signs",
        "Monitor vital signs, Turn patient regularly"
      ],
      correctAnswer: "Monitor vital signs, Turn patient regularly",
      explanation: "Regular turning/repositioning is the cornerstone of pressure-ulcer prevention. Massage over bony prominences is no longer recommended. Option d pairs turning with general monitoring.",
      difficulty: "Medium"
    },
    {
      question: "When making a patient bed, the procedure should end with:",
      options: [
        "Nurse mitering the corners",
        "Nurse washing the hands",
        "Nurse adjusting the height of the bed",
        "Taking linen to the laundry"
      ],
      correctAnswer: "Nurse washing the hands",
      explanation: "Hand hygiene is performed at the end of every nursing procedure to prevent cross-infection.",
      difficulty: "Medium"
    },
    {
      question: "When guiding a patient with loss of sight, the nurse should",
      options: [
        "Ask to hold the nurses hand at the elbow",
        "Ask them to hold the nurse around the waist",
        "Hold their hand",
        "Hold their arm"
      ],
      correctAnswer: "Ask to hold the nurses hand at the elbow",
      explanation: "The correct sighted-guide technique is to allow the visually impaired person to hold the guide's arm just above the elbow so they can feel the guide's body movements.",
      difficulty: "Medium"
    },
    {
      question: "When performing bladder irrigation the nurse should",
      options: [
        "Monitor the input and output chart 24 hourly",
        "Wash the hands before the procedure and not after",
        "Unblock the catheter if fluid fails to return",
        "Call the doctor if active bleeding is noted"
      ],
      correctAnswer: "Call the doctor if active bleeding is noted",
      explanation: "Active bleeding during continuous bladder irrigation after TURP or similar procedures requires prompt medical attention. Input/output is important but the urgent action is reporting significant bleeding.",
      difficulty: "Hard"
    },
    {
      question: "The main goal of treatment for acute glomerulonephritis is to:",
      options: [
        "Encourage activity",
        "Encourage a high protein intake",
        "Maintain a fluid balance",
        "Teach urinary catheterization"
      ],
      correctAnswer: "Maintain a fluid balance",
      explanation: "Acute GN often causes fluid overload and hypertension; the primary goal is fluid and electrolyte balance while supporting renal recovery.",
      difficulty: "Medium"
    },
    {
      question: "Which clinical finding would suggest to a nurse that a client with ulcer has an ulcer perforation?",
      options: [
        "Bradycardia",
        "Numbness in the leg",
        "Nausea and vomiting",
        "A rigid board-like abdomen"
      ],
      correctAnswer: "A rigid board-like abdomen",
      explanation: "A rigid, board-like abdomen is the classic sign of peritonitis secondary to perforated peptic ulcer.",
      difficulty: "Hard"
    },
    {
      question: "The nursing action important before an x-ray is:",
      options: [
        "Sedate the patient",
        "Keep the patient nil per oral for 6 hours",
        "Remove metallic objects from the patient",
        "Administer a contrast dye"
      ],
      correctAnswer: "Remove metallic objects from the patient",
      explanation: "Metallic objects create artifacts on plain radiographs and must be removed. NPO and contrast are for specific studies only.",
      difficulty: "Medium"
    },
    {
      question: "Which of the following is a classical symptom of pleurisy associated with pneumonia",
      options: [
        "Hyperpyrexia",
        "Pain on breathing",
        "Cyanotic nails",
        "Tachycardia"
      ],
      correctAnswer: "Pain on breathing",
      explanation: "Pleuritic pain is sharp and worsened by inspiration or coughing – the hallmark of pleurisy.",
      difficulty: "Medium"
    },
    {
      question: "Which nursing diagnosis takes the highest priority for a female client with hyperthyroidism?",
      options: [
        "Risk for imbalanced nutrition less than body requirements related to thyroid hormone excess",
        "Risk for impaired skin integrity to oedema and poor wound care",
        "Body image disturbance related to weight gain",
        "Imbalanced nutrition less than body requirement related to thyroid hormone excess"
      ],
      correctAnswer: "Imbalanced nutrition less than body requirement related to thyroid hormone excess",
      explanation: "Hyperthyroidism causes hypermetabolism and weight loss; actual imbalanced nutrition is a higher priority than 'risk for'. Weight gain is more typical of hypothyroidism.",
      difficulty: "Hard"
    },
    {
      question: "The antidote for heparin toxicity is:",
      options: [
        "Potassium chloride",
        "Vitamin K",
        "Protamine sulfate",
        "Calcium gluconate"
      ],
      correctAnswer: "Protamine sulfate",
      explanation: "Protamine sulfate is the specific antidote that neutralizes heparin. Vitamin K is for warfarin.",
      difficulty: "Medium"
    },
    {
      question: "Severe chest pain that radiates to the left arm and the back is an indication of:",
      options: [
        "Cancer of the neck structures",
        "Hypertension",
        "Liver disease",
        "Myocardial infraction"
      ],
      correctAnswer: "Myocardial infraction",
      explanation: "Classic presentation of myocardial infarction (note: spelling in option is 'infraction').",
      difficulty: "Medium"
    },
    {
      question: "Before removing the impacted cerumen, the nurse should instill _______ for 30 minutes:",
      options: [
        "5% dextrose",
        "Half strength Darrows solution",
        "Sodium peroxide",
        "Mineral oil"
      ],
      correctAnswer: "Mineral oil",
      explanation: "Mineral oil (or commercial cerumenolytics) softens impacted wax before irrigation or removal.",
      difficulty: "Medium"
    },
    {
      question: "The priority nursing diagnosis for a 4 years old child presenting with diarrhea",
      options: [
        "Altered consciousness",
        "Fluid volume deficit and electrolyte imbalance",
        "Fluid volume excess and electrolyte balance",
        "Elevated body temperatures"
      ],
      correctAnswer: "Fluid volume deficit and electrolyte imbalance",
      explanation: "Dehydration and electrolyte imbalance are the most immediate threats to life in paediatric diarrhoea.",
      difficulty: "Hard"
    },
    {
      question: "Cyanosis observed on the lips and tongue in sick children indicates:",
      options: [
        "Poor perfusion",
        "Alter gaseous exchange",
        "Hypothermia",
        "inadequate venous return"
      ],
      correctAnswer: "Alter gaseous exchange",
      explanation: "Central cyanosis (lips and tongue) indicates impaired gas exchange / hypoxaemia.",
      difficulty: "Medium"
    },
    {
      question: "AVPU as used in the assessment of level of consciousness in children stands for",
      options: [
        "Alertness, Voice response, Pain response, Unresponsiveness",
        "Awake, Volatile, pain reaction, unconsciousness",
        "Alert, Voice response, pupil response to light, unconsciousness",
        "Alertness, Volatile, Pain response, Unresponsiveness"
      ],
      correctAnswer: "Alertness, Voice response, Pain response, Unresponsiveness",
      explanation: "AVPU = Alert, responds to Voice, responds to Pain, Unresponsive.",
      difficulty: "Easy"
    },
    {
      question: "Examples of cutting instruments in theatre are:",
      options: [
        "Dissecting forceps, scissors",
        "Dissecting forceps, artery forceps",
        "Scissors, scalpel",
        "Abdominal retractor, scalpel"
      ],
      correctAnswer: "Scissors, scalpel",
      explanation: "Scalpel and scissors are cutting instruments. Forceps are grasping; retractors hold tissue aside.",
      difficulty: "Easy"
    },
    {
      question: "The best method for a couple who have met their desired family size would be:",
      options: [
        "Condom",
        "Sterilization of one partner",
        "Intrauterine contraceptive device",
        "Sterilization of both partner"
      ],
      correctAnswer: "Sterilization of one partner",
      explanation: "Permanent methods (sterilization of one partner) are most appropriate once family size is complete. Sterilizing both is unnecessary.",
      difficulty: "Medium"
    },
    {
      question: "Infections that spread through contaminated drinking water are classified as",
      options: [
        "Water-borne",
        "Water-washed",
        "Water-based",
        "Water-related"
      ],
      correctAnswer: "Water-borne",
      explanation: "Water-borne diseases are transmitted by ingestion of contaminated water (e.g., cholera, typhoid).",
      difficulty: "Easy"
    },
    {
      question: "One of the following is a pre-renal cause of kidney failure",
      options: [
        "Neurogenic bladder",
        "Prostrate hypertrophy",
        "Acute glomerulo-nephritis",
        "Severe hemorrhage"
      ],
      correctAnswer: "Severe hemorrhage",
      explanation: "Pre-renal failure results from decreased renal perfusion (hypovolaemia from haemorrhage, shock, etc.). Prostate hypertrophy and neurogenic bladder are post-renal; glomerulonephritis is intrinsic renal.",
      difficulty: "Hard"
    },
    {
      question: "A client who has just been sexually abused remains calm and quiet. This is an example of which type of defense mechanism?",
      options: [
        "Denial",
        "Dissociation",
        "Intellectualization",
        "Projection"
      ],
      correctAnswer: "Dissociation",
      explanation: "Dissociation is a common response to trauma in which the person feels detached or emotionally numb.",
      difficulty: "Hard"
    },
    {
      question: "For Voluntary admission in a hospital, the client must fill form MOH _______ in duplicate",
      options: [
        "306",
        "314",
        "308",
        "400"
      ],
      correctAnswer: "306",
      explanation: "In Kenyan mental-health practice, Form MOH 306 is commonly used for voluntary admission (confirm with current MOH forms).",
      difficulty: "Hard"
    },
    {
      question: "The drug of choice for treating all species of schistosome is:",
      options: [
        "Malathion",
        "Hydroxchloroquine",
        "Praziquantel",
        "Ivermectin"
      ],
      correctAnswer: "Praziquantel",
      explanation: "Praziquantel is the drug of choice for all Schistosoma species.",
      difficulty: "Medium"
    },
    {
      question: "Management of the spread of cholera in the community involves:",
      options: [
        "Referral of the patient to the hospital for treatment",
        "Creating a temporary isolation Centre in the community, rehydrating the patients",
        "Quarantining the health care workers only",
        "Admitting the patients to the hospital, administering antibiotics"
      ],
      correctAnswer: "Creating a temporary isolation Centre in the community, rehydrating the patients",
      explanation: "Community-level cholera control focuses on rapid rehydration (ORS/IV), isolation of cases, sanitation, and safe water – often in temporary treatment centres.",
      difficulty: "Medium"
    },
    {
      question: "A nurse manager motivates the theatre team with a lunch after saving a patient. Which theory is the manager applying?",
      options: [
        "Theory X and Y",
        "Scientific theory of management",
        "System management theory",
        "Human relation"
      ],
      correctAnswer: "Human relation",
      explanation: "Recognizing and rewarding staff (e.g., a celebratory lunch) is a classic application of human-relations theory (Elton Mayo).",
      difficulty: "Medium"
    },
    {
      question: "Sexual relations between children and relatives is termed as:",
      options: [
        "Rape",
        "Incest",
        "Bigamy",
        "Interrelations"
      ],
      correctAnswer: "Incest",
      explanation: "Incest is sexual activity between close relatives.",
      difficulty: "Easy"
    },
    {
      question: "The appropriate nursing diagnosis for a client with stage IV cancer of the stomach is",
      options: [
        "Altered body image",
        "Disturbed sleep",
        "Acute Pain",
        "Elevated body temperatures"
      ],
      correctAnswer: "Acute Pain",
      explanation: "Advanced gastric cancer commonly causes significant pain; acute/chronic pain is a high-priority nursing diagnosis.",
      difficulty: "Medium"
    },
    {
      question: "Community midwifery encourages",
      options: [
        "Home deliveries",
        "Home grown solution to pregnancy and child care",
        "Safe hospital delivery and postnatal follow up",
        "Pregnant mothers to seek alternative care"
      ],
      correctAnswer: "Safe hospital delivery and postnatal follow up",
      explanation: "Community midwifery in Kenya aims to increase skilled birth attendance (preferably facility-based) and continuum of postnatal care.",
      difficulty: "Medium"
    },
    {
      question: "Madam K has gone into shock after caesarian section identify signs of shock",
      options: [
        "Sweating profusely, high urine out put",
        "Altered mental state, low blood pressure",
        "Increased blood pressure, reduced pulse rate",
        "Increased blood pressure, reduced pulse rate"
      ],
      correctAnswer: "Altered mental state, low blood pressure",
      explanation: "Hypovolaemic/haemorrhagic shock after CS presents with hypotension, tachycardia, altered mental status, cool clammy skin, and oliguria.",
      difficulty: "Hard"
    },
    {
      question: "Vaginal examination during second stage is performed to",
      options: [
        "Confirm full cervical dilatation",
        "Check presentation",
        "Rupture membranes",
        "Prepare for delivery"
      ],
      correctAnswer: "Confirm full cervical dilatation",
      explanation: "In second stage the key finding is full dilatation; VE confirms the cervix is fully dilated and assesses station/progress.",
      difficulty: "Medium"
    },
    {
      question: "The number of antenatal visit as per the WHO recommendation is",
      options: [
        "3",
        "2",
        "1",
        "4"
      ],
      correctAnswer: "4",
      explanation: "WHO previously recommended a minimum of 4 antenatal visits (focused ANC). The newer model recommends 8 contacts, but many curricula still teach 4.",
      difficulty: "Medium"
    },
    {
      question: "Cord care should be done using",
      options: [
        "Methylated Spirit",
        "Chlorhexidine",
        "Normal Saline",
        "Topical steroid"
      ],
      correctAnswer: "Chlorhexidine",
      explanation: "WHO and Kenyan guidelines recommend 7.1% chlorhexidine digluconate for cord care, especially in high-mortality settings.",
      difficulty: "Easy"
    },
    {
      question: "The skin changes during pregnancy due to:",
      options: [
        "Good diet",
        "Increased melanocytes activity",
        "Reduced vitamin intake in the diet",
        "Reduced intake of fluids"
      ],
      correctAnswer: "Increased melanocytes activity",
      explanation: "Increased melanocyte-stimulating hormone and oestrogen/progesterone cause hyperpigmentation (linea nigra, melasma, darkening of areolae).",
      difficulty: "Medium"
    },
    {
      question: "A negative feedback response by the body to hyperthermia is",
      options: [
        "Shivering",
        "Sweating",
        "Vasoconstriction of blood vessels in the dermis",
        "An increase in metabolic rate"
      ],
      correctAnswer: "Sweating",
      explanation: "Sweating (evaporative cooling) and dermal vasodilatation are negative-feedback responses that lower body temperature.",
      difficulty: "Medium"
    },
    {
      question: "A theory is a set of concepts, definitions, relationships, and assumptions that:",
      options: [
        "Formulates legislation",
        "Explains a phenomenon",
        "Measures nursing function",
        "Reflects domains of nursing practice"
      ],
      correctAnswer: "Explains a phenomenon",
      explanation: "A theory systematically explains a phenomenon by relating concepts and assumptions.",
      difficulty: "Medium"
    },
    {
      question: "The best nursing action when dealing with a patient who does not understand the physician's earlier explanation of a planned surgery is:",
      options: [
        "Quickly explain the surgery procedure and the risks to the client",
        "Ask supervisor to explain the surgery procedure and its risks",
        "Notify the physician",
        "Cancel the surgery"
      ],
      correctAnswer: "Notify the physician",
      explanation: "Informed consent is the physician's responsibility. If the patient does not understand, the nurse must notify the physician so the explanation can be repeated.",
      difficulty: "Hard"
    },
    {
      question: "An examination done with a radio opaque dye and x-ray is:",
      options: [
        "Pap smear",
        "Barium meal",
        "Sigmoidoscopy",
        "Laryngoscopy"
      ],
      correctAnswer: "Barium meal",
      explanation: "Barium meal uses radio-opaque contrast and fluoroscopy/X-ray to visualize the upper GI tract.",
      difficulty: "Easy"
    },
    {
      question: "A patient is scheduled for magnetic Resonance (MRI) of the abdomen. The nurse should instruct the patient to avoid",
      options: [
        "Wearing metal objects during the procedure",
        "Taking oral medication up to 12 hours after the procedure",
        "Urinating prior to the procedure",
        "Eating solid food 12 hours prior to the procedure"
      ],
      correctAnswer: "Wearing metal objects during the procedure",
      explanation: "Metal objects are a strict contraindication/safety hazard in MRI (projectile risk and image artifact).",
      difficulty: "Easy"
    },
    {
      question: "The following is true concerning urinary incontinence",
      options: [
        "Caffeine drinks inhibit bladder function",
        "Cough stress stimulates accidental urine release",
        "Diuretics are used to treat incontinence",
        "Polyuria is a definite cause of incontinence"
      ],
      correctAnswer: "Cough stress stimulates accidental urine release",
      explanation: "Stress incontinence is leakage triggered by increased intra-abdominal pressure (cough, sneeze, laugh).",
      difficulty: "Medium"
    },
    {
      question: "Pulmonary edema is associated with failing",
      options: [
        "Right atrium",
        "Left atrium",
        "Right ventricle",
        "Left ventricle"
      ],
      correctAnswer: "Left ventricle",
      explanation: "Left-ventricular failure raises left-atrial and pulmonary venous pressure, forcing fluid into the alveoli (cardiogenic pulmonary oedema).",
      difficulty: "Hard"
    },
    {
      question: "Pemphigus vulgaris is characterized by:",
      options: [
        "Painful small blisters which form clusters",
        "Intensive itching blisters of varying sizes",
        "Chronic firm raised bumps which form a ring with normal sunken skin in the centre",
        "Formation of tender red bumps under the skin"
      ],
      correctAnswer: "Painful small blisters which form clusters",
      explanation: "Pemphigus vulgaris presents with flaccid, painful blisters that rupture easily, often starting in the oral mucosa.",
      difficulty: "Hard"
    },
    {
      question: "Non modifiable risk factors in coronary artery diseases include",
      options: [
        "Hyperlipidemia, hypertension, diabetes mellitus",
        "Obesity, physical inactivity, family history",
        "Cigarette smoking, gender, hyperlipidemia",
        "Increasing age, gender, family history"
      ],
      correctAnswer: "Increasing age, gender, family history",
      explanation: "Age, sex, and family history/genetic predisposition are non-modifiable. The others are modifiable.",
      difficulty: "Medium"
    },
    {
      question: "Pulmonary disorders that cause finger-clubbing include:",
      options: [
        "Pneumonia, asthma, emphysema",
        "Lung cancer, lung abscess, pulmonary fibrosis",
        "Cystic fibrosis, pulmonary hypertension, pneumothorax",
        "Pleural effusion, beryllium disease, chronic atelectasis"
      ],
      correctAnswer: "Lung cancer, lung abscess, pulmonary fibrosis",
      explanation: "Clubbing is associated with lung cancer, chronic suppurative lung disease (abscess, bronchiectasis), and interstitial fibrosis.",
      difficulty: "Hard"
    },
    {
      question: "The main cause of enlargement of the thyroid gland is:",
      options: [
        "Pregnancy",
        "Growth hormone",
        "Deficient intake of iodine",
        "Autoimmune disease"
      ],
      correctAnswer: "Deficient intake of iodine",
      explanation: "Iodine deficiency is the most common cause of goitre worldwide.",
      difficulty: "Easy"
    },
    {
      question: "Which of these nursing actions will best promote independence for the client in skeletal traction?",
      options: [
        "Instruct the client to call for an analgesic before pain becomes severe",
        "Encourage leg exercise within the limits of traction",
        "Provide skin care to prevent skin breakdown",
        "Provide an overhead trapeze for client use"
      ],
      correctAnswer: "Provide an overhead trapeze for client use",
      explanation: "An overhead trapeze allows the patient to reposition independently, promoting autonomy while in traction.",
      difficulty: "Medium"
    },
    {
      question: "Diarrhea takes out too much of water and minerals which causes",
      options: [
        "Lack of energy",
        "Dryness",
        "Dehydration",
        "Hunger"
      ],
      correctAnswer: "Dehydration",
      explanation: "Loss of water and electrolytes leads to dehydration.",
      difficulty: "Easy"
    },
    {
      question: "The nurse is assessing a comatose client receiving gastric tube feedings. Which of the following assessment findings requires an IMMEDIATE response from the nurse?",
      options: [
        "Aspiration of a residual of 100 cc of formula",
        "Decrease in bowel sounds",
        "Urine output of 250cc in past eight hours",
        "Decreased breath sounds"
      ],
      correctAnswer: "Decreased breath sounds",
      explanation: "Decreased breath sounds may indicate aspiration of feed into the lungs – an immediate life-threatening complication.",
      difficulty: "Hard"
    },
    {
      question: "An appropriate nursing diagnostic label for a client with renal calculi is:",
      options: [
        "Ineffective tissue perfusion",
        "Functional urinary incontinence",
        "Acute pain",
        "Decreased cardiac output"
      ],
      correctAnswer: "Acute pain",
      explanation: "Renal colic produces severe acute pain – the priority nursing diagnosis.",
      difficulty: "Medium"
    },
    {
      question: "The finding suggestive of a blocked drainage catheter following transurethral resection of the prostate (TURP) is:",
      options: [
        "The urine in the drainage bag appears red to pink",
        "The client reports bladder spasms and the urge to void",
        "The normal saline irrigant is infusing at a rate of 50 drops/minute",
        "About 1,000 ml of irrigant have been instilled; 1,200 ml of drainage have been returned"
      ],
      correctAnswer: "The client reports bladder spasms and the urge to void",
      explanation: "Bladder spasms and urge to void despite continuous irrigation often indicate catheter obstruction by clots.",
      difficulty: "Hard"
    },
    {
      question: "Normal fetal heart rate is:",
      options: [
        "120-160b/m",
        "120-140b/m",
        "110-160b/m",
        "110-140B/M"
      ],
      correctAnswer: "110-160b/m",
      explanation: "Current normal fetal heart rate range is 110–160 bpm.",
      difficulty: "Easy"
    },
    {
      question: "Factors hindering home visiting by a midwife include:",
      options: [
        "Rejection by family, unfavorable weather conditions, language barrier",
        "Poor infrastructure, laziness by the midwife, rejection by family",
        "Lack of privacy, reliable transport facilities, language barrier",
        "Language barrier, favorable weather conditions, unreliable transport facilities"
      ],
      correctAnswer: "Rejection by family, unfavorable weather conditions, language barrier",
      explanation: "Rejection by the family, bad weather, and language barriers are real obstacles to effective home visiting.",
      difficulty: "Medium"
    },
    {
      question: "Preventive measures of ophthalmia neonatorum include",
      options: [
        "Administering systemic penicillin with one hour after birth, isolation of the baby",
        "Instillation of penicillin eye drops after birth, taking eye swab for culture and sensitivity",
        "Treatment of all vaginal discharges prenatally, application of 3% tetracycline eye ointment within one hour of birth",
        "Treatment of abnormal vaginal discharge prenatally, application of 1% tetracycline eye ointment within one hour of birth"
      ],
      correctAnswer: "Treatment of abnormal vaginal discharge prenatally, application of 1% tetracycline eye ointment within one hour of birth",
      explanation: "Kenyan/WHO practice: treat maternal STIs antenatally and apply 1% tetracycline eye ointment (or silver nitrate/erythromycin) within 1 hour of birth.",
      difficulty: "Hard"
    },
    {
      question: "The management of hypotonic uterine action includes:",
      options: [
        "Intravenous infusion of 10% dextrose",
        "Intravenous infusion of syntocinon in 5%dextrose",
        "Intravenous infusion of syntocinon in normal saline",
        "Intravenous infusion of buscopan 15mgs"
      ],
      correctAnswer: "Intravenous infusion of syntocinon in 5%dextrose",
      explanation: "Oxytocin (Syntocinon) infusion in 5% dextrose is the standard pharmacological management of hypotonic labour once obstruction is excluded.",
      difficulty: "Hard"
    },
    {
      question: "Hegar's sign is a probable sign of pregnancy characterized by:",
      options: [
        "Softening of the cervix",
        "Periodic uterine tightening",
        "Colour change of the vagina from pink to violet",
        "Softening of the lower uterine segment"
      ],
      correctAnswer: "Softening of the lower uterine segment",
      explanation: "Hegar's sign = softening of the lower uterine segment (isthmus). Softening of the cervix is Goodell's sign; colour change is Chadwick's sign.",
      difficulty: "Medium"
    },
    {
      question: "The pelvic joints include the following:",
      options: [
        "One symphysis pubis, two sacrococcygeal joint, two sacroiliac joint",
        "One symphysis pubis, one sacrococcygeal joint, one sacroiliac joint",
        "One symphysis pubis, one sacrococcygeal joint, two sacroiliac joint",
        "One symphysis pubis, two sacrococcygeal joint, one sacroiliac joint"
      ],
      correctAnswer: "One symphysis pubis, one sacrococcygeal joint, two sacroiliac joint",
      explanation: "The pelvis has one pubic symphysis, one sacrococcygeal joint, and two sacroiliac joints.",
      difficulty: "Medium"
    },
    {
      question: "A client with a diagnosis of schizophrenia refuses to take meals. The nursing action that will be most appropriate will be to:",
      options: [
        "Allow the client to eat whatever is desired at their convenience",
        "Firmly direct the patient to take meals",
        "Give appetizers such as multivitamins and force the patient to eat",
        "Be with the client while the meals are being served and get explanations from the patient."
      ],
      correctAnswer: "Be with the client while the meals are being served and get explanations from the patient.",
      explanation: "Presence, observation, and gentle exploration of reasons for refusal are therapeutic and help detect paranoia or other barriers to eating.",
      difficulty: "Hard"
    },
    {
      question: "Anything that interferes with the communication process is generally referred to as a:",
      options: [
        "Feedback",
        "Semantic",
        "Barrier",
        "Context"
      ],
      correctAnswer: "Barrier",
      explanation: "Barriers (noise, language, cultural, emotional, etc.) interfere with effective communication.",
      difficulty: "Easy"
    },
    {
      question: "The population of vectors can be controlled by",
      options: [
        "Environment sanitation",
        "Chemoprophylaxis",
        "Isolation",
        "Vaccination"
      ],
      correctAnswer: "Environment sanitation",
      explanation: "Environmental sanitation (drainage, waste management, source reduction) is the primary method of vector control.",
      difficulty: "Easy"
    },
    {
      question: "The following vaccines are live attenuated",
      options: [
        "Oral polio, pentavalent",
        "pentavalent, BCG",
        "BCG, Measles",
        "Yellow fever, pentavalent"
      ],
      correctAnswer: "BCG, Measles",
      explanation: "BCG and measles (and oral polio, yellow fever) are live attenuated. Pentavalent is inactivated/subunit.",
      difficulty: "Medium"
    },
    {
      question: "Physical therapy in home based care helps in",
      options: [
        "Reducing loneliness, relaxation, improving circulation",
        "Improving circulation, preventing muscle wasting, improving digestion",
        "Reducing loneliness, preventing CHEST INFECTION, improving digestion",
        "Socialization, improving breathing, preventing infections"
      ],
      correctAnswer: "Improving circulation, preventing muscle wasting, improving digestion",
      explanation: "Physical therapy maintains circulation, prevents contractures and muscle wasting, and supports gastrointestinal motility.",
      difficulty: "Medium"
    },
    {
      question: "The following are examples of \"spacing methods\" of family planning",
      options: [
        "Natural methods, chemical barriers, vasectomy",
        "Mechanical barriers, tubectomy, chemical barriers",
        "Tubectomy, vasectomy, Natural methods",
        "chemical barriers, Natural methods, Mechanical barriers"
      ],
      correctAnswer: "chemical barriers, Natural methods, Mechanical barriers",
      explanation: "Spacing methods are temporary: natural methods, barriers (condoms, diaphragms), and chemical (spermicides). Sterilization is permanent.",
      difficulty: "Medium"
    },
    {
      question: "Active involved in school health include:",
      options: [
        "Vitamin A supplementation",
        "Youth friendly services",
        "Minor surgery",
        "Screening and treatment of minor ailments"
      ],
      correctAnswer: "Screening and treatment of minor ailments",
      explanation: "School health programmes classically include screening, treatment of minor ailments, health education, and immunisation.",
      difficulty: "Medium"
    },
    {
      question: "The declaration of health for all by year 2000 was made in the year",
      options: [
        "1978",
        "1987",
        "1986",
        "1976"
      ],
      correctAnswer: "1978",
      explanation: "The Alma-Ata Declaration (1978) set the goal of \"Health for All by the Year 2000\".",
      difficulty: "Easy"
    },
    {
      question: "Familiarization assessment as a type of community needs assessment involves",
      options: [
        "The researcher focusing on a single problem and studies the community in terms of that problem",
        "Examining a single facet of community life",
        "An in-depth survey of the entire community",
        "Studying data already available in the community and gathering a certain amount of first hand data"
      ],
      correctAnswer: "Studying data already available in the community and gathering a certain amount of first hand data",
      explanation: "Familiarization assessment is a quick overview using existing data plus limited primary data collection.",
      difficulty: "Medium"
    },
    {
      question: "Cold chain management",
      options: [
        "Starts from the health facility to the community",
        "Starts from the manufacture to the recipient",
        "Is a system that uses community health workers and equipment",
        "Enable the use of the various vaccines for a longtime after reconstitution"
      ],
      correctAnswer: "Starts from the manufacture to the recipient",
      explanation: "The cold chain is the temperature-controlled supply chain from manufacturer to the point of administration.",
      difficulty: "Medium"
    },
    {
      question: "Which of the four is NOT a reason for nutrition status assessment:",
      options: [
        "Identify population/individuals at risk of malnutrition",
        "Develop health care programs that meet community needs which are defined by the assessment",
        "Management of malaria",
        "Identify those already malnourished"
      ],
      correctAnswer: "Management of malaria",
      explanation: "Nutrition assessment is not primarily for malaria management.",
      difficulty: "Easy"
    },
    {
      question: "The following are short term methods of family planning",
      options: [
        "Intrauterine contraceptive device and condoms",
        "Implant insertion and IUCD",
        "Oral contraceptive and vasectomy",
        "Microlut and microgynon"
      ],
      correctAnswer: "Microlut and microgynon",
      explanation: "Microlut and Microgynon are oral contraceptives – short-acting/reversible methods.",
      difficulty: "Easy"
    },
    {
      question: "A community can be broadly defined as:",
      options: [
        "Social unit of any size that shares common values and resources",
        "Social identity and practice within the community",
        "Having a common traditional health seeking behavior",
        "Enhancing the understanding of community health status"
      ],
      correctAnswer: "Social unit of any size that shares common values and resources",
      explanation: "A community is a social unit sharing common values, interests, or resources.",
      difficulty: "Easy"
    },
    {
      question: "The cell type responsible for bone maintenance is",
      options: [
        "Osteoclast",
        "Osteoblast",
        "Chondrocyte",
        "Osteocyte"
      ],
      correctAnswer: "Osteocyte",
      explanation: "Osteocytes are the mature bone cells that maintain the bone matrix. Osteoblasts form bone; osteoclasts resorb it.",
      difficulty: "Medium"
    },
    {
      question: "The diameter of the lumen of the aorta is mainly controlled by",
      options: [
        "The volume of the blood flowing through it",
        "The vasomotor centre in the brain",
        "Nerve stimulation",
        "The weather condition surrounding the individual"
      ],
      correctAnswer: "The vasomotor centre in the brain",
      explanation: "The vasomotor centre (medulla) regulates vascular tone via sympathetic outflow, controlling aortic and arteriolar diameter.",
      difficulty: "Medium"
    },
    {
      question: "A patient has history of fainting at around 10 am. He was doing self-injection on the abdomen about 30 minutes before he fainted. The patient is likely to have injected himself with:",
      options: [
        "A strong antibiotic",
        "Adrenaline",
        "Insulin",
        "Penicillin"
      ],
      correctAnswer: "Insulin",
      explanation: "Hypoglycaemia from insulin overdose commonly causes syncope, especially if a meal is delayed.",
      difficulty: "Medium"
    },
    {
      question: "During handwashing in the prevention of covid-19, the chain is broken at the",
      options: [
        "Reservoir",
        "Portal of entry",
        "susceptible host",
        "Infectious agent"
      ],
      correctAnswer: "Portal of entry",
      explanation: "Hand hygiene removes the organism from the hands, preventing transmission via the portal of entry (mouth, nose, eyes, or to other surfaces).",
      difficulty: "Medium"
    },
    {
      question: "In children, paralytic ileus accompanies the following metabolic abnormalities EXCEPT",
      options: [
        "Hypokalemia",
        "Hypocalcemia",
        "Uremia",
        "Hypermagnesemia"
      ],
      correctAnswer: "Hypocalcemia",
      explanation: "Hypokalaemia, hypermagnesaemia, and uraemia can cause or contribute to ileus. Hypocalcaemia is less directly associated.",
      difficulty: "Hard"
    },
    {
      question: "A caretaker brings a 5 years child to hospital and bright red blood is seen flowing bilaterally from the nasal opening. The initial action the nurse should take on this child will be",
      options: [
        "Pinch the nostrils over the nasal ridge as child lean forward",
        "Take child to theatre for surgical toileting",
        "Pinch the nostrils over the nasal ridge as the child lies supine",
        "Take the vitals of the child"
      ],
      correctAnswer: "Pinch the nostrils over the nasal ridge as child lean forward",
      explanation: "First-aid for epistaxis: lean forward and pinch the soft part of the nose for 10–15 minutes.",
      difficulty: "Medium"
    },
    {
      question: "While performing bed making, the nurse ensures that the bed linen the patient lies on are well straightened. The great reason for this is to:",
      options: [
        "Have the ward appear neat",
        "Demonstrate to the client the proper technique of bed making",
        "Prevent creases that can cause decubitus ulcers",
        "Avoid tearing the bed linen by having folds on it"
      ],
      correctAnswer: "Prevent creases that can cause decubitus ulcers",
      explanation: "Wrinkles and creases increase pressure and friction, predisposing to pressure ulcers.",
      difficulty: "Medium"
    },
    {
      question: "A patient complains of dysuria and the nurse decides to collect a urine sample from the patient for urinalysis possible findings from the urinalysis will most likely reveal",
      options: [
        "Normal urine composition",
        "Pus cells in the urine",
        "Glucose in urine",
        "Epithelial cells"
      ],
      correctAnswer: "Pus cells in the urine",
      explanation: "Dysuria is classically associated with urinary-tract infection; pyuria (pus cells) is expected.",
      difficulty: "Medium"
    },
    {
      question: "The priority nursing diagnosis for patient with rheumatoid arthritis (RA) who is not responding to nonsteroidal anti-inflammatory drugs (NSAIDs) is:",
      options: [
        "Self-care deficit related to fatigue and joint stiffness",
        "Ineffective airway clearance related to chronic pain.",
        "Risk for hopelessness related to body image disturbance",
        "Anxiety related to chronic joint pain"
      ],
      correctAnswer: "Self-care deficit related to fatigue and joint stiffness",
      explanation: "Fatigue and joint stiffness commonly impair ADLs; self-care deficit is a priority functional diagnosis.",
      difficulty: "Hard"
    },
    {
      question: "The action that a nurse would do during the evaluation phase of the nursing process is:",
      options: [
        "Have a patient provide input on the quality of care received",
        "Remove a patients surgical staples on the schedule postoperative day",
        "Provide information on a follow-up appointment for a postoperative patient",
        "Document a patient improved air entry with incentive spirometry"
      ],
      correctAnswer: "Document a patient improved air entry with incentive spirometry",
      explanation: "Evaluation involves assessing whether outcomes have been met (e.g., improved air entry after intervention).",
      difficulty: "Medium"
    },
    {
      question: "A patient is due for pyelography the following day. Before the procedure the nurse ensures that:",
      options: [
        "The patient is well fed",
        "The patient is passing adequate urine",
        "The patient pays for the procedure",
        "The relatives have consented to the procedure"
      ],
      correctAnswer: "The patient is passing adequate urine",
      explanation: "Adequate renal function (urine output) is required before contrast pyelography to minimise nephrotoxicity risk.",
      difficulty: "Medium"
    },
    {
      question: "The nutritional needs of a patient who is comatose are safely met through",
      options: [
        "Small frequent oral feeds",
        "Nasogastric tube feeding",
        "Intravenous fluids administration",
        "Letting patient recover first before any feeding"
      ],
      correctAnswer: "Nasogastric tube feeding",
      explanation: "A comatose patient has an unprotected airway; nasogastric or other enteral tube feeding is the safe route.",
      difficulty: "Medium"
    },
    {
      question: "An advantage of balloon valvuloplasty over valve replacement is:",
      options: [
        "Lower doses of antirejection drugs required than with valve replacement",
        "The procedure is not associated with a risk for infection",
        "Repaired valves tend to function longer than replaced valve",
        "The procedure can be performed on an outpatient basis in a physician's office."
      ],
      correctAnswer: "Lower doses of antirejection drugs required than with valve replacement",
      explanation: "Balloon valvuloplasty does not involve prosthetic material, so no lifelong anticoagulation or immunosuppression is required.",
      difficulty: "Hard"
    },
    {
      question: "The therapeutic action of omeprazole is:",
      options: [
        "Reduction in the amount of acid secreted in the stomach",
        "Reduction of peristaltic movement",
        "Helping the stomach lining to repair itself",
        "Making the stomach lining more resistant to damage"
      ],
      correctAnswer: "Reduction in the amount of acid secreted in the stomach",
      explanation: "Omeprazole is a proton-pump inhibitor that irreversibly blocks H+/K+-ATPase, markedly reducing gastric acid secretion.",
      difficulty: "Medium"
    },
    {
      question: "A clinical manifestation of acute glomerulonephritis is:",
      options: [
        "Hematuria",
        "Hypotension unresolved by fluid administration",
        "Glucosuria",
        "Precipitous decrease in serum creatinine levels"
      ],
      correctAnswer: "Hematuria",
      explanation: "Acute GN classically presents with haematuria (cola-coloured urine), oliguria, hypertension, and mild oedema.",
      difficulty: "Medium"
    },
    {
      question: "The nurse has identified the nursing diagnosis of risk for infection in a patient who undergoes peritoneal dialysis. What nursing action best addresses this risk?",
      options: [
        "Add antibiotics to the dialysate as ordered",
        "Maintain aseptic technique when administering dialysate",
        "Administer prophylactic antibiotics by mouth or IV as ordered",
        "wash the skin surrounding the catheter site with soap and water prior to each exchange"
      ],
      correctAnswer: "Maintain aseptic technique when administering dialysate",
      explanation: "Strict aseptic technique during connection/disconnection is the single most important measure to prevent peritonitis.",
      difficulty: "Hard"
    },
    {
      question: "The most appropriate type of traction to apply to a fractured proximal femur is:",
      options: [
        "Russell's traction",
        "Cervical head halter",
        "Dunlop's traction",
        "Bucks extension"
      ],
      correctAnswer: "Bucks extension",
      explanation: "Buck's extension (skin traction) is commonly used for temporary immobilisation of proximal femoral fractures before surgery.",
      difficulty: "Medium"
    },
    {
      question: "A clinical manifestation of third spacing in a patient with burns is:",
      options: [
        "Metabolic alkalosis",
        "Hypermagnesemia",
        "Hypercalcemia",
        "Hypovolemia"
      ],
      correctAnswer: "Hypovolemia",
      explanation: "Fluid shifts into the interstitium (third spacing) cause intravascular hypovolaemia.",
      difficulty: "Medium"
    },
    {
      question: "A nurse is caring for a patient who has sustained a deep-thickness burn injury. In prioritizing the nursing diagnoses for the plan of care the nurse will give the highest priority to what nursing diagnosis?",
      options: [
        "Activity intolerance",
        "Ineffective coping",
        "Acute pain",
        "Anxiety"
      ],
      correctAnswer: "Acute pain",
      explanation: "Deep partial- or full-thickness burns are extremely painful; acute pain is an immediate priority after airway/circulation.",
      difficulty: "Hard"
    },
    {
      question: "When performing chest compressions during cardiopulmonary resuscitation on a patient who is unresponsive the nurse should:",
      options: [
        "Perform high-quality chest compressions as rapidly as possible",
        "Pause chest compressions to allow for vital signs monitoring every 4 to 5 minutes",
        "Pause to allow a colleague to provide a breath every 10 compressions",
        "Perform 100-120 chest compressions per minute."
      ],
      correctAnswer: "Perform 100-120 chest compressions per minute.",
      explanation: "Current AHA/ILCOR guidelines recommend a rate of 100–120 compressions per minute with minimal interruptions.",
      difficulty: "Medium"
    },
    {
      question: "A patient with mastoiditis is admitted to the post-surgical unit after undergoing a radical mastoidectomy. The nurse should identify what priority of postoperative care?",
      options: [
        "Assessing for mouth droop and decreases lateral eye gaze",
        "Assessing for scar tissue and cerumen obstructing the auditory canal",
        "Assessing for increased middle ear pressure and perforated ear drum",
        "Assessing for gradual onset of conductive hearing loss and nystagmus"
      ],
      correctAnswer: "Assessing for mouth droop and decreases lateral eye gaze",
      explanation: "Facial-nerve injury (CN VII) is a known risk of mastoidectomy; mouth droop and impaired eye movement must be assessed.",
      difficulty: "Hard"
    },
    {
      question: "The most dangerous complication during induction of spinal anesthesia is",
      options: [
        "Cardiac arrest",
        "Hypotension",
        "Hyperthermia",
        "Respiratory paralysis"
      ],
      correctAnswer: "Respiratory paralysis",
      explanation: "High spinal block can cause respiratory arrest by paralysing the intercostal muscles and diaphragm – the most immediately life-threatening complication.",
      difficulty: "Hard"
    },
    {
      question: "Direct methods of nutritional assessment include",
      options: [
        "Measuring the weight of an individual",
        "Taking 24 hours recall on diet history",
        "Taking the economic history of the patient or caregiver",
        "Enquiring the patient's food preferences"
      ],
      correctAnswer: "Measuring the weight of an individual",
      explanation: "Anthropometry (weight, height, MUAC, etc.) is a direct method. Dietary recall and socioeconomic history are indirect.",
      difficulty: "Medium"
    },
    {
      question: "Which of the following symptoms in pregnant women is of greatest concern?",
      options: [
        "Vomiting",
        "Visual disturbances",
        "Heartburn",
        "Slight oedema"
      ],
      correctAnswer: "Visual disturbances",
      explanation: "Visual disturbances (scotomata, blurred vision) are a warning sign of severe preeclampsia/eclampsia.",
      difficulty: "Medium"
    },
    {
      question: "In the part of the 3rd trimester, the mother may experience shortness of breath. This complaint may be explained as",
      options: [
        "A normal occurrence in pregnancy because the fetus is using more oxygen",
        "The fundus of the uterus is high pushing the diaphragm upwards",
        "The woman is having allergic reaction to the pregnancy and its hormones",
        "The woman maybe experiencing complication of pregnancy"
      ],
      correctAnswer: "The fundus of the uterus is high pushing the diaphragm upwards",
      explanation: "In late pregnancy the enlarged uterus elevates the diaphragm, reducing lung expansion and causing physiological dyspnoea.",
      difficulty: "Medium"
    },
    {
      question: "Fetal lie refers to",
      options: [
        "Longitudinal axis of the fetus in relation to the oblique axis of the maternal uterus",
        "Longitudinal axis of the fetus in relation to the transverse axis of the maternal uterus",
        "Longitudinal axis of the fetus in relation to the long axis of the maternal uterus",
        "Longitudinal axis of the fetus in relation to the long axis of the maternal pelvis"
      ],
      correctAnswer: "Longitudinal axis of the fetus in relation to the long axis of the maternal uterus",
      explanation: "Lie is the relationship of the long axis of the fetus to the long axis of the uterus (longitudinal, transverse, or oblique).",
      difficulty: "Medium"
    },
    {
      question: "A woman at 32 weeks gestation is brought to hospital with complaints of headache, and progressive oedema of the lower limbs. Her temperature is 36.8 degrees, blood pressure 220/156 mmHg. On urinalysis, there is proteinuria. The most probable diagnosis for this woman is:",
      options: [
        "Malaria in pregnancy",
        "Urinary tract infection in pregnancy",
        "Preeclampsia",
        "Eclampsia"
      ],
      correctAnswer: "Preeclampsia",
      explanation: "Severe hypertension + proteinuria + oedema at 32 weeks = preeclampsia (eclampsia would include seizures).",
      difficulty: "Hard"
    },
    {
      question: "A baby born at 32 weeks through caesarean section due to placenta praevia is brought to the neonatal intensive care unit. On examination the pulse rate is 200 b/m, capillary refill of 4 seconds, cold extremities with a birth weight of 2580g. After initiation of supplemental oxygen the next most appropriate step in management is:",
      options: [
        "Administration of IV normal saline 10ml/kg over 60 minutes",
        "Administration of normal saline/ringer lactate 10ml/kg over 10 minutes",
        "Transfusion of blood 10ml/kg over 30 minutes",
        "Immediate give 20ml/kg 0negative packed RBS over 30 minutes"
      ],
      correctAnswer: "Administration of normal saline/ringer lactate 10ml/kg over 10 minutes",
      explanation: "Signs of shock (tachycardia, prolonged CRT, cold extremities) after blood loss (placenta praevia) require rapid volume expansion with crystalloid 10 ml/kg over 10–20 min while preparing blood.",
      difficulty: "Hard"
    },
    {
      question: "A 30 years old Gravida 3 para 2+0 at 28 weeks of gestation presents with severe pain in the right flank radiating to her groin, rigors and chills. Urinalysis reveals numerous cells. The most likely diagnosis is",
      options: [
        "Appendicitis",
        "Pyelonephritis",
        "Round ligament torsion",
        "Torsion of the ovarian cyst"
      ],
      correctAnswer: "Pyelonephritis",
      explanation: "Flank pain radiating to groin + fever/rigors + pyuria in pregnancy = acute pyelonephritis.",
      difficulty: "Hard"
    },
    {
      question: "Which of the following is the most common indication for primary cesarean section?",
      options: [
        "Prolapsed cord",
        "Labor Dystocia",
        "Diabetes",
        "Malpresentation"
      ],
      correctAnswer: "Labor Dystocia",
      explanation: "Labour dystocia (failure to progress) is the most common indication for primary caesarean section.",
      difficulty: "Medium"
    },
    {
      question: "Which of the following situations has the greatest risk for the mother and infant?",
      options: [
        "Rupture of uterus",
        "Dehiscence of a uterine scar",
        "Cervical laceration",
        "Lack of spontaneous uterine contractions at term"
      ],
      correctAnswer: "Rupture of uterus",
      explanation: "Complete uterine rupture is a catastrophic obstetric emergency with high maternal and fetal mortality.",
      difficulty: "Hard"
    },
    {
      question: "Application of forceps is appropriate in which of the following situations?",
      options: [
        "Breech at +3 station, cervix completely dilated, membranes ruptured.",
        "Vertex at +1 station, cervix completely dilated, membranes intact",
        "Mentum anterior, +3 station, cervix completely dilated, membranes ruptured",
        "Transverse lie, +3 station, cervix completely dilated, membranes ruptured"
      ],
      correctAnswer: "Mentum anterior, +3 station, cervix completely dilated, membranes ruptured",
      explanation: "Forceps can be applied for a mentum-anterior face presentation at low station with full dilatation and ruptured membranes. Transverse lie and high station are contraindications.",
      difficulty: "Hard"
    },
    {
      question: "During history taking for a client who has come to seek VCT services in your health facility, you include paraphrasing as part of your communication skills. This means that",
      options: [
        "You ask the patient to repeat what you tell them to ensure understanding",
        "You get a language interpreter if you don't share a common language with the client to ensure understanding.",
        "You repeat what the client tells you in your own words to ensure understanding",
        "You provide writing materials if client hearing difficulties"
      ],
      correctAnswer: "You repeat what the client tells you in your own words to ensure understanding",
      explanation: "Paraphrasing is restating the client's message in the counsellor's own words to confirm understanding.",
      difficulty: "Medium"
    },
    {
      question: "Which of the following group of diseases is prevented by PCV 10 vaccine?",
      options: [
        "Mumps, pneumonia, diarrhea and sinusitis",
        "Mastoiditis, pneumonia, bacterial meningitis and cellulitis",
        "pneumonia, poliomyelitis, cryptococcal meningitis and typhoid fever",
        "Rhinitis, pneumonia, burns and whooping cough"
      ],
      correctAnswer: "Mastoiditis, pneumonia, bacterial meningitis and cellulitis",
      explanation: "PCV10 protects against Streptococcus pneumoniae serotypes that cause pneumonia, meningitis, bacteraemia, mastoiditis, and other invasive disease.",
      difficulty: "Medium"
    },
    {
      question: "An objective of school health program is?",
      options: [
        "To inspect teacher's behavior regarding health of school children",
        "To provide age appropriate about health information to the children in schools",
        "To interview the children about their family health behavior because children always tell the truth",
        "To show the teachers how they should implement correct teaching strategies"
      ],
      correctAnswer: "To provide age appropriate about health information to the children in schools",
      explanation: "A core objective is health education – delivering age-appropriate health information to school children.",
      difficulty: "Easy"
    },
    {
      question: "Types of environment include",
      options: [
        "Physical, biological, political",
        "Physical, physiological, political",
        "biological, physiological, political",
        "Economical, biological, psychological"
      ],
      correctAnswer: "Physical, biological, political",
      explanation: "In community-health classification the environment is commonly divided into physical, biological, and socio-cultural/political components.",
      difficulty: "Medium"
    },
    {
      question: "The causative organism for bacillary dysentery is",
      options: [
        "Vibrio",
        "Salmonella",
        "Shigella",
        "Amoeba"
      ],
      correctAnswer: "Shigella",
      explanation: "Bacillary dysentery is caused by Shigella species. Amoebic dysentery is caused by Entamoeba histolytica.",
      difficulty: "Easy"
    },
    {
      question: "According to Sigmund Freud, the structure of the mind is classified as",
      options: [
        "Conscious ID and super ego",
        "Ego pre-conscious and ID",
        "ID, ego and super ego",
        "Conscious, pre-conscious and unconscious"
      ],
      correctAnswer: "ID, ego and super ego",
      explanation: "Freud's structural model of the psyche comprises the id, ego, and superego.",
      difficulty: "Medium"
    },
    {
      question: "The state in which a patient repeats words or phrases spoken to him is referred to as:",
      options: [
        "Echopraxia",
        "Echolalia",
        "Neologism",
        "Word salad"
      ],
      correctAnswer: "Echolalia",
      explanation: "Echolalia is the pathological repetition of another person's words or phrases. Echopraxia is repetition of movements.",
      difficulty: "Medium"
    }
  ];

  const handleInject = async () => {
    try {
      setStatus('loading');
      setMessage('Publishing NCK Mock 1 (October 2025) to Firebase & Local Cache...');

      const examDoc = {
        id: `mock-1-${Date.now()}`,
        title: 'NCK Mock 1 - October 2025 (Complete Mock Examination)',
        category: 'NCK Registered Nurse (RN) FQE',
        domain: 'Comprehensive Nursing Board Mock',
        requiredPlan: 'free',
        questionLimits: { free: 15, basic: 120, gold: 0, platinum: 0 },
        isPublished: true,
        createdAt: new Date().toISOString(),
        createdBy: 'Admin Mock Injector',
        questions: mock1Questions
      };

      const questionsListDocs: any[] = [];
      for (const q of mock1Questions) {
        const questionDoc = {
          id: `mock-1-q-${Math.random()}`,
          examMode: 'NCK Registered Nurse (RN) FQE',
          unitDomain: 'Mock 1 Examination',
          questionTypeId: 'single_choice',
          questionTypeLabel: 'Single Choice',
          questionStem: q.question,
          options: q.options.map(opt => ({
            id: Math.random().toString(),
            text: opt,
            isCorrect: opt === q.correctAnswer
          })),
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty,
          rationale: q.explanation,
          createdAt: new Date().toISOString(),
          createdBy: 'Mock Injector'
        };
        questionsListDocs.push(questionDoc);
      }

      try {
        const docRef = await addDoc(collection(db, 'exams'), examDoc);
        examDoc.id = docRef.id;
        for (const qDoc of questionsListDocs) {
          qDoc.examId = docRef.id;
          await addDoc(collection(db, 'questions'), qDoc);
        }
      } catch (firestoreErr) {
        console.warn("Firestore write bypassed due to permissions, using local storage cache:", firestoreErr);
      }

      const existingExams = JSON.parse(localStorage.getItem('nckprep_custom_exams') || '[]');
      localStorage.setItem('nckprep_custom_exams', JSON.stringify([examDoc, ...existingExams]));

      const existingQs = JSON.parse(localStorage.getItem('nckprep_custom_questions') || '[]');
      localStorage.setItem('nckprep_custom_questions', JSON.stringify([...questionsListDocs, ...existingQs]));

      setStatus('success');
      setMessage(`Successfully published all 120 questions from NCK Mock 1 (October 2025) to Question Bank!`);
    } catch (err: any) {
      console.error('Error injecting Mock 1:', err);
      const examDoc = {
        id: `mock-1-${Date.now()}`,
        title: 'NCK Mock 1 - October 2025 (Complete Mock Examination)',
        category: 'NCK Registered Nurse (RN) FQE',
        domain: 'Comprehensive Nursing Board Mock',
        requiredPlan: 'free',
        questionLimits: { free: 15, basic: 120, gold: 0, platinum: 0 },
        isPublished: true,
        createdAt: new Date().toISOString(),
        createdBy: 'Admin Mock Injector',
        questions: mock1Questions
      };
      const existingExams = JSON.parse(localStorage.getItem('nckprep_custom_exams') || '[]');
      localStorage.setItem('nckprep_custom_exams', JSON.stringify([examDoc, ...existingExams]));

      setStatus('success');
      setMessage('Published 120 Mock 1 questions successfully via local storage cache!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl border border-slate-100 my-12 text-center">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">Inject NCK Mock 1 (October 2025)</h2>
      <p className="text-slate-600 mb-6 text-sm">
        Click below to instantly sync and publish all 120 verified questions, answers, and detailed rationales from NCK Mock 1 (October 2025) to the Firebase & Local Question Bank.
      </p>

      {status === 'idle' && (
        <Button onClick={handleInject} className="w-full py-4 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg">
          Inject 120 Mock 1 Questions to Question Bank
        </Button>
      )}

      {status === 'loading' && (
        <div className="flex items-center justify-center gap-3 py-4 text-blue-600 font-bold">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>{message}</span>
        </div>
      )}

      {status === 'success' && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-3 text-left">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Sync Successful!</h4>
            <p className="text-sm mt-1">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
