import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function syncAllExamsAndQuestionsToCloud(): Promise<{ syncedExamsCount: number; syncedQuestionsCount: number }> {
  let syncedExamsCount = 0;
  let syncedQuestionsCount = 0;
  const uniqueQuestionsMap = new Map<string, any>();

  const defaultBundles = [
    {
      id: 'nck-mock-1',
      title: 'NCK Mock 1 - October 2025 (RN FQE)',
      category: 'NCK Registered Nurse (RN) FQE',
      domain: 'Medical-Surgical Nursing',
      price: 'Free Access',
      numericPrice: 0,
      questionCount: 10,
      durationMinutes: 30,
      difficulty: 'Advanced',
      isPremium: false,
      features: ['10 High-Yield RN FQE Questions', 'Detailed Clinical Rationales', 'Immediate Performance Analytics'],
      requiredPlan: 'free',
      questionLimits: { free: 10, basic: 10, gold: 0, platinum: 0 },
      isPublished: true,
      questions: [
        {
          id: 'mock1-q1',
          question: 'Which assessment finding is most indicative of acute respiratory distress syndrome (ARDS) in a post-operative patient?',
          options: ['Refractory hypoxemia despite high-flow oxygen', 'Productive cough with rust-colored sputum', 'Exertional dyspnea and wheezing', 'Intermittent chest pain relieved by nitroglycerin'],
          correctAnswer: 'Refractory hypoxemia despite high-flow oxygen',
          explanation: 'Refractory hypoxemia (low arterial oxygen that does not improve with supplemental oxygen delivery) is the hallmark physiological feature of ARDS.'
        },
        {
          id: 'mock1-q2',
          question: 'A nurse is caring for a client receiving digoxin 0.25 mg daily and furosemide 40 mg daily. Which symptom suggests digitalis toxicity?',
          options: ['Yellow-green visual halos and nausea', 'Hypertension and tachycardia', 'Fine motor tremors and muscle rigidity', 'Polyuria and excessive thirst'],
          correctAnswer: 'Yellow-green visual halos and nausea',
          explanation: 'Visual disturbances such as blurred vision, yellow-green halos, and gastrointestinal upset (nausea/vomiting) are classic signs of digitalis toxicity.'
        },
        {
          id: 'mock1-q3',
          question: 'A client with chronic kidney disease (CKD) has a serum potassium level of 6.2 mEq/L. Which ECG change should the nurse anticipate?',
          options: ['Tall, peaked T waves', 'Prolonged QT interval', 'Prominent U waves', 'Flattened P waves'],
          correctAnswer: 'Tall, peaked T waves',
          explanation: 'Hyperkalemia (potassium > 5.0 mEq/L) characteristically causes tall, peaked T waves on ECG, which can progress to widened QRS and ventricular arrhythmias if untreated.'
        },
        {
          id: 'mock1-q4',
          question: 'Which nursing intervention is top priority when caring for a client experiencing a sudden wound dehiscence with evisceration following abdominal surgery?',
          options: ['Cover the protruding viscera with sterile saline-soaked dressings', 'Attempt to gently push the organs back into the peritoneal cavity', 'Place the client in high-Fowler position without support', 'Administer prescribed oral analgesics immediately'],
          correctAnswer: 'Cover the protruding viscera with sterile saline-soaked dressings',
          explanation: 'Evisceration is a surgical emergency. The nurse must immediately cover the exposed viscera with sterile, saline-moistened dressings to prevent drying and infection, place client in low Fowler with knees flexed, and notify surgeon.'
        },
        {
          id: 'mock1-q5',
          question: 'A client is receiving a blood transfusion (PRBCs) and within 15 minutes develops chills, lower back pain, and tachycardia. What is the nurse\'s immediate action?',
          options: ['Stop the transfusion immediately and infuse normal saline through new tubing', 'Slow the transfusion rate by half and monitor vitals', 'Administer antihistamines and continue transfusion', 'Notify the blood bank after finishing the unit'],
          correctAnswer: 'Stop the transfusion immediately and infuse normal saline through new tubing',
          explanation: 'Chills, lower back pain, and fever during blood administration indicate an acute hemolytic transfusion reaction. The transfusion must be stopped immediately to prevent severe kidney injury.'
        },
        {
          id: 'mock1-q6',
          question: 'Which finding in a client with a chest tube connected to a water-seal drainage system indicates a normal or expected condition?',
          options: ['Continuous bubbling in the water-seal chamber', 'Fluctuation (tidaling) of water level in the water-seal chamber with respiration', 'Total absence of fluid movement in the suction control chamber', 'Continuous bubbling in the suction control chamber'],
          correctAnswer: 'Fluctuation (tidaling) of water level in the water-seal chamber with respiration',
          explanation: 'Tidaling (rising and falling of water level with inspiration/expiration) in the water-seal chamber is normal and indicates intact pleural pressure transmission. Continuous bubbling in the water-seal chamber indicates an air leak.'
        },
        {
          id: 'mock1-q7',
          question: 'A client with type 1 diabetes mellitus presents with fruity breath odor, Kussmaul respirations, and blood glucose of 480 mg/dL. Which intravenous fluid is initiated first?',
          options: ['0.9% Sodium Chloride (Normal Saline)', '5% Dextrose in Water', '0.45% Sodium Chloride without electrolytes', '5% Dextrose in 0.9% Normal Saline'],
          correctAnswer: '0.9% Sodium Chloride (Normal Saline)',
          explanation: 'Initial treatment for diabetic ketoacidosis (DKA) prioritizes rapid expansion of intravascular volume and restoration of renal perfusion using isotonic 0.9% NaCl before insulin administration.'
        },
        {
          id: 'mock1-q8',
          question: 'Which symptom is characteristic of left-sided heart failure compared to right-sided heart failure?',
          options: ['Pink frothy sputum and dyspnea on exertion', 'Dependent pitting peripheral edema', 'Jugular venous distension (JVD)', 'Hepatosplenomegaly and ascites'],
          correctAnswer: 'Pink frothy sputum and dyspnea on exertion',
          explanation: 'Left-sided heart failure causes pulmonary congestion resulting in dyspnea, orthopnea, crackles, and pink frothy sputum. Right-sided failure leads to systemic venous congestion (edema, JVD, ascites).'
        },
        {
          id: 'mock1-q9',
          question: 'A client is diagnosed with acute appendicitis. Where should the nurse expect the client to report maximum localized tenderness?',
          options: ['McBurney\'s point in the right lower quadrant', 'Left upper quadrant near the spleen', 'Epigastric region radiating to the scapula', 'Suprapubic region during bladder distension'],
          correctAnswer: 'McBurney\'s point in the right lower quadrant',
          explanation: 'Appendicitis typically causes localized tenderness at McBurney\'s point, located one-third of the distance from the right anterior superior iliac spine to the umbilicus.'
        },
        {
          id: 'mock1-q10',
          question: 'Which dietary instruction is most crucial for a client prescribed spironolactone, a potassium-sparing diuretic?',
          options: ['Avoid high-potassium foods such as bananas and salt substitutes', 'Increase intake of green leafy vegetables high in potassium', 'Restrict all fluid intake to less than 1,000 mL daily', 'Increase daily sodium consumption to prevent hyponatremia'],
          correctAnswer: 'Avoid high-potassium foods such as bananas and salt substitutes',
          explanation: 'Spironolactone spares potassium and can cause dangerous hyperkalemia. Clients must avoid potassium-rich foods and salt substitutes containing potassium chloride.'
        }
      ]
    },
    {
      id: 'nck-community-health',
      title: 'NCK Community Health Nursing Practice Bank',
      category: 'NCK Community Health Nurse',
      domain: 'Community & Public Health',
      price: 'Free Access',
      numericPrice: 0,
      questionCount: 10,
      durationMinutes: 30,
      difficulty: 'Medium',
      isPremium: false,
      features: ['10 Public Health Questions', 'MOH Immunization Protocols', 'Epidemiology & Disease Control'],
      requiredPlan: 'free',
      questionLimits: { free: 10, basic: 10, gold: 0, platinum: 0 },
      isPublished: true,
      questions: [
        {
          id: 'comm-q1',
          question: 'Which vaccine is routinely administered at birth in Kenya according to the Ministry of Health (MOH) immunization schedule?',
          options: ['BCG and Oral Polio Vaccine (OPV 0)', 'Measles-Rubella first dose', 'DPT-HepB-Hib pentavalent dose 1', 'HPV vaccine for adolescent girls'],
          correctAnswer: 'BCG and Oral Polio Vaccine (OPV 0)',
          explanation: 'According to the Kenya MOH immunization schedule, BCG (for tuberculosis protection) and OPV birth dose are administered at birth or within the first two weeks.'
        },
        {
          id: 'comm-q2',
          question: 'What is the recommended age for administering the first dose of Measles-Rubella (MR) vaccine in Kenya?',
          options: ['9 months', 'At birth', '6 weeks', '18 months'],
          correctAnswer: '9 months',
          explanation: 'In Kenya\'s immunization schedule, the first dose of Measles-Rubella vaccine is administered at 9 months of age, followed by the second dose at 18 months.'
        },
        {
          id: 'comm-q3',
          question: 'What is the safe temperature range for storing vaccines in the refrigerator cold chain unit?',
          options: ['+2°C to +8°C', '-15°C to -25°C', '+10°C to +15°C', '+20°C to +25°C'],
          correctAnswer: '+2°C to +8°C',
          explanation: 'Vaccine refrigerators must be maintained between +2°C and +8°C. Temperatures outside this range can damage vaccine potency.'
        },
        {
          id: 'comm-q4',
          question: 'Which strategy is recommended by the WHO for trachoma control globally and in endemic areas of Kenya?',
          options: ['SAFE strategy (Surgery, Antibiotics, Facial cleanliness, Environmental improvement)', 'Mass chemotherapy with praziquantel', 'Vector fogging with organophosphates', 'Chlorination of municipal water supplies'],
          correctAnswer: 'SAFE strategy (Surgery, Antibiotics, Facial cleanliness, Environmental improvement)',
          explanation: 'The SAFE strategy is the comprehensive global approach endorsed by WHO to eliminate blinding trachoma.'
        },
        {
          id: 'comm-q5',
          question: 'According to WHO and Kenya MOH guidelines, how many antenatal care (ANC) contacts are recommended for a pregnant woman with an uncomplicated pregnancy?',
          options: ['At least 8 contacts', 'Exactly 4 contacts', 'Only 2 contacts during third trimester', 'Monthly visits starting at week 36'],
          correctAnswer: 'At least 8 contacts',
          explanation: 'WHO updated ANC recommendations to at least 8 contacts to reduce perinatal mortality and improve maternal experience of care.'
        },
        {
          id: 'comm-q6',
          question: 'What is the recommended duration of exclusive breastfeeding for infants according to national and international health guidelines?',
          options: ['First 6 months of life', 'First 3 months of life', 'First 12 months of life', 'First 4 weeks of life'],
          correctAnswer: 'First 6 months of life',
          explanation: 'Exclusive breastfeeding for the first 6 months provides ideal nutrition and immunological protection against infections.'
        },
        {
          id: 'comm-q7',
          question: 'Which vector-control intervention is most effective and widely distributed to prevent malaria in endemic regions of Kenya?',
          options: ['Long-Lasting Insecticidal Nets (LLINs)', 'Indoor residual spraying with DDT in urban centers', 'Aerial larviciding of all running rivers', 'Personal repellent creams applied weekly'],
          correctAnswer: 'Long-Lasting Insecticidal Nets (LLINs)',
          explanation: 'LLIN distribution campaigns are the cornerstone of malaria prevention in endemic counties in Kenya.'
        },
        {
          id: 'comm-q8',
          question: 'What is the primary objective of Directly Observed Treatment, Short-course (DOTS) in tuberculosis control programs?',
          options: ['Ensuring treatment adherence and achieving high cure rates', 'Isolating all TB patients in specialized hospitals indefinitely', 'Providing free nutritional supplements only', 'Eliminating the need for sputum microscopy testing'],
          correctAnswer: 'Ensuring treatment adherence and achieving high cure rates',
          explanation: 'DOTS ensures patients take every dose of anti-TB medication under observation, preventing drug resistance and ensuring cure.'
        },
        {
          id: 'comm-q9',
          question: 'Which method is the most reliable household water treatment practice in rural community settings without piped treated water?',
          options: ['Boiling rolling water for at least one minute or certified chlorination', 'Storing water in copper containers for 2 hours', 'Filtering water through porous cotton cloth', 'Exposing water to sunlight in dark plastic bottles'],
          correctAnswer: 'Boiling rolling water for at least one minute or certified chlorination',
          explanation: 'Boiling or adding water treatment chemicals like sodium hypochlorite effectively eliminates pathogenic bacteria, viruses, and parasites.'
        },
        {
          id: 'comm-q10',
          question: 'What is the first step in conducting a community health diagnosis in a newly assigned sub-location?',
          options: ['Community needs assessment and baseline data collection', 'Constructing a permanent health dispensary', 'Imposing mandatory vaccination fines', 'Ordering pharmaceutical supplies without consultation'],
          correctAnswer: 'Community needs assessment and baseline data collection',
          explanation: 'A community diagnosis begins with systematic collection and analysis of community health data to identify priority health needs.'
        }
      ]
    },
    {
      id: 'nck-midwifery-obstetrics',
      title: 'NCK Midwifery & Obstetric Nursing Question Bank',
      category: 'NCK Midwifery & Obstetric Nursing',
      domain: 'Obstetric Nursing',
      price: 'Free Access',
      numericPrice: 0,
      questionCount: 10,
      durationMinutes: 30,
      difficulty: 'Medium',
      isPremium: false,
      features: ['10 Midwifery Questions', 'Labor & Delivery Protocols', 'Maternal & Newborn Care'],
      requiredPlan: 'free',
      questionLimits: { free: 10, basic: 10, gold: 0, platinum: 0 },
      isPublished: true,
      questions: [
        {
          id: 'mid-q1',
          question: 'What is the clinical definition of postpartum hemorrhage (PPH) following a vaginal delivery?',
          options: ['Blood loss exceeding 500 mL within 24 hours post-delivery', 'Blood loss exceeding 200 mL within 2 hours', 'Any bleeding that requires intravenous fluid replacement', 'Blood loss exceeding 1,000 mL regardless of delivery mode'],
          correctAnswer: 'Blood loss exceeding 500 mL within 24 hours post-delivery',
          explanation: 'Postpartum hemorrhage is defined as blood loss greater than 500 mL following vaginal delivery (or >1,000 mL following cesarean delivery) within the first 24 hours.'
        },
        {
          id: 'mid-q2',
          question: 'What is the priority medication administered to a pregnant client experiencing severe pre-eclampsia to prevent eclamptic seizures?',
          options: ['Magnesium sulfate IV/IM loading and maintenance infusion', 'Phenytoin sodium oral tablets', 'Diazepam rapid intravenous push', 'Hydralazine hydrochloride sublingual'],
          correctAnswer: 'Magnesium sulfate IV/IM loading and maintenance infusion',
          explanation: 'Magnesium sulfate is the anticonvulsant of choice for prevention and treatment of seizures in severe pre-eclampsia and eclampsia.'
        },
        {
          id: 'mid-q3',
          question: 'What is the normal baseline fetal heart rate range during intrapartum electronic fetal monitoring?',
          options: ['110 to 160 beats per minute', '80 to 100 beats per minute', '160 to 190 beats per minute', '60 to 90 beats per minute'],
          correctAnswer: '110 to 160 beats per minute',
          explanation: 'Normal baseline fetal heart rate ranges from 110 to 160 bpm.'
        },
        {
          id: 'mid-q4',
          question: 'What do early decelerations on an electronic fetal monitoring strip typically indicate?',
          options: ['Fetal head compression (benign finding)', 'Umbilical cord compression', 'Uteroplacental insufficiency', 'Fetal hypoxia and acidosis'],
          correctAnswer: 'Fetal head compression (benign finding)',
          explanation: 'Early decelerations mirror contractions and are caused by fetal head compression during labor, requiring no intervention.'
        },
        {
          id: 'mid-q5',
          question: 'At what standard intervals are Apgar scores assessed in a newborn infant after birth?',
          options: ['At 1 minute and 5 minutes after birth', 'At 5 minutes and 10 minutes only', 'Every 15 minutes for the first hour', 'At birth and 24 hours of life'],
          correctAnswer: 'At 1 minute and 5 minutes after birth',
          explanation: 'Apgar scoring is performed at 1 minute and 5 minutes of life to evaluate newborn transition and response to resuscitation.'
        },
        {
          id: 'mid-q6',
          question: 'Which clinical manifestation is classic for placenta previa in the third trimester?',
          options: ['Painless bright red vaginal bleeding', 'Sudden severe abdominal pain with rigid uterus', 'Continuous dark red bleeding with uterine tenderness', 'Painless foul-smelling amniotic fluid discharge'],
          correctAnswer: 'Painless bright red vaginal bleeding',
          explanation: 'Placenta previa presents classically as painless bright red vaginal bleeding during the second or third trimester due to lower uterine segment implantation.'
        },
        {
          id: 'mid-q7',
          question: 'What is the first-line nursing action when postpartum hemorrhage is detected due to uterine atony?',
          options: ['Perform immediate bimanual uterine massage and administer oxytocin', 'Prepare the client for emergency hysterectomy', 'Insert a Foley catheter and administer diuretics', 'Apply abdominal binder tightly'],
          correctAnswer: 'Perform immediate bimanual uterine massage and administer oxytocin',
          explanation: 'Uterine massage stimulates myometrial contraction to close open blood vessels at the placental site, paired with uterotonic agents.'
        },
        {
          id: 'mid-q8',
          question: 'When is routine screening for gestational diabetes mellitus (GDM) typically performed during pregnancy?',
          options: ['Between 24 and 28 weeks of gestation', 'At the first antenatal booking visit', 'During the 36th week of gestation', 'Only if the client develops glycosuria'],
          correctAnswer: 'Between 24 and 28 weeks of gestation',
          explanation: 'Screening for gestational diabetes using an oral glucose tolerance test is routinely recommended between 24 and 28 weeks gestation.'
        },
        {
          id: 'mid-q9',
          question: 'What defines the beginning and end of the second stage of labor?',
          options: ['Full cervical dilation (10 cm) to the birth of the baby', 'Onset of regular uterine contractions to 4 cm dilation', 'Delivery of the placenta to 2 hours postpartum', 'Rupture of membranes to complete cervical effacement'],
          correctAnswer: 'Full cervical dilation (10 cm) to the birth of the baby',
          explanation: 'The second stage of labor spans from 10 cm cervical dilation until the complete expulsion of the neonate.'
        },
        {
          id: 'mid-q10',
          question: 'What is the appropriate management for a postpartum client experiencing painful breast engorgement on day 3 post-delivery?',
          options: ['Frequent nursing or pumping, warm compresses before feeding, cold compresses after', 'Complete cessation of breastfeeding and firm breast binding', 'Applying restriction of fluids and administering strong analgesics only', 'Massaging the breasts vigorously with alcohol rub'],
          correctAnswer: 'Frequent nursing or pumping, warm compresses before feeding, cold compresses after',
          explanation: 'Frequent milk removal and temperature therapy relieve vascular congestion and engorgement safely.'
        }
      ]
    },
    {
      id: 'nck-psychiatric-mental',
      title: 'NCK Psychiatric & Mental Health Nursing Question Bank',
      category: 'NCK Psychiatric & Mental Health Nursing',
      domain: 'Mental Health & Psychiatric Nursing',
      price: 'Free Access',
      numericPrice: 0,
      questionCount: 10,
      durationMinutes: 30,
      difficulty: 'Medium',
      isPremium: false,
      features: ['10 Psychiatric Questions', 'Therapeutic Communication', 'Psychopharmacology & Safety'],
      requiredPlan: 'free',
      questionLimits: { free: 10, basic: 10, gold: 0, platinum: 0 },
      isPublished: true,
      questions: [
        {
          id: 'psych-q1',
          question: 'Which symptom is an early sign of lithium toxicity in a client receiving treatment for bipolar disorder?',
          options: ['Coarse hand tremors, nausea, vomiting, and ataxia', 'Hypertension and severe tachycardia', 'Constipation and excessive weight gain', 'Jaundice and elevated liver enzymes'],
          correctAnswer: 'Coarse hand tremors, nausea, vomiting, and ataxia',
          explanation: 'Lithium has a narrow therapeutic index (0.6 - 1.2 mEq/L). Early toxicity signs include coarse tremors, GI upset, and ataxia.'
        },
        {
          id: 'psych-q2',
          question: 'Which symptom represents a positive symptom of schizophrenia?',
          options: ['Auditory and visual hallucinations', 'Alogia (poverty of speech)', 'Avolition (lack of drive)', 'Affective flattening'],
          correctAnswer: 'Auditory and visual hallucinations',
          explanation: 'Positive symptoms reflect an excess or distortion of normal functions, such as hallucinations, delusions, and disorganized speech.'
        },
        {
          id: 'psych-q3',
          question: 'What is the minimum duration of depressed mood required to diagnose Major Depressive Disorder (MDD)?',
          options: ['At least 2 continuous weeks', 'At least 3 consecutive days', 'At least 6 months', 'At least 1 year'],
          correctAnswer: 'At least 2 continuous weeks',
          explanation: 'Diagnosis of MDD requires depressed mood or loss of interest/pleasure present nearly every day for at least 2 weeks.'
        },
        {
          id: 'psych-q4',
          question: 'What is the most appropriate environmental nursing intervention for a client admitted in an acute manic phase of bipolar disorder?',
          options: ['Providing a low-stimulus environment with simple, structured activities', 'Encouraging participation in large group competitive sports', 'Placing the client in a crowded dayroom to socialize', 'Assigning complex multi-step puzzles to stimulate cognition'],
          correctAnswer: 'Providing a low-stimulus environment with simple, structured activities',
          explanation: 'Clients in acute mania are easily agitated and distracted; a low-stimulus environment helps reduce overstimulation.'
        },
        {
          id: 'psych-q5',
          question: 'What is the nurse\'s highest priority action when a psychiatric client expresses suicidal ideation?',
          options: ['Directly asking the client about their suicide plan and intent', 'Promising absolute confidentiality regarding the conversation', 'Changing the subject to a neutral recreational topic', 'Leaving the client alone to ponder positive thoughts'],
          correctAnswer: 'Directly asking the client about their suicide plan and intent',
          explanation: 'Direct inquiry about suicide is safe, essential, and does not plant ideas. It evaluates immediate lethality and safety risk.'
        },
        {
          id: 'psych-q6',
          question: 'Which medication class is standard for managing acute alcohol withdrawal and preventing delirium tremens (DTs)?',
          options: ['Benzodiazepines (e.g., diazepam or chlordiazepoxide)', 'Typical antipsychotics (e.g., haloperidol)', 'Tricyclic antidepressants (e.g., amitriptyline)', 'Opioid agonists (e.g., morphine sulfate)'],
          correctAnswer: 'Benzodiazepines (e.g., diazepam or chlordiazepoxide)',
          explanation: 'Benzodiazepines provide cross-tolerance to alcohol, preventing seizures and delirium tremens during acute withdrawal.'
        },
        {
          id: 'psych-q7',
          question: 'How should a nurse initially manage a client with obsessive-compulsive disorder (OCD) who engages in time-consuming handwashing rituals?',
          options: ['Allow time for the ritual initially while setting gentle limits to reduce anxiety', 'Immediately forbid all handwashing to break the habit', 'Punish the client when rituals are performed', 'Ignore the behavior completely'],
          correctAnswer: 'Allow time for the ritual initially while setting gentle limits to reduce anxiety',
          explanation: 'Abruptly stopping compulsions increases severe anxiety. Nurses allow ritual time initially and structure gradual limits.'
        },
        {
          id: 'psych-q8',
          question: 'Which symptom category is characteristic of Post-Traumatic Stress Disorder (PTSD)?',
          options: ['Intrusive re-experiencing, avoidance, negative mood changes, and hyperarousal', 'Manic grandiosity and decreased need for sleep', 'Auditory command hallucinations and loose associations', 'Memory loss limited exclusively to childhood events'],
          correctAnswer: 'Intrusive re-experiencing, avoidance, negative mood changes, and hyperarousal',
          explanation: 'PTSD clusters comprise intrusion, avoidance, negative alterations in cognition/mood, and marked alterations in arousal/reactivity.'
        },
        {
          id: 'psych-q9',
          question: 'What is the primary medical emergency risk for a client with severe anorexia nervosa presenting with cachexia?',
          options: ['Cardiac arrhythmias secondary to severe electrolyte imbalance', 'Hypertensive crisis and stroke', 'Pathological fractures from hypercalcemia', 'Hyperglycemic hyperosmolar state'],
          correctAnswer: 'Cardiac arrhythmias secondary to severe electrolyte imbalance',
          explanation: 'Severe malnutrition and electrolyte shifts (potassium, magnesium) in anorexia nervosa pose life-threatening cardiac arrhythmia risks.'
        },
        {
          id: 'psych-q10',
          question: 'During which phase of the therapeutic nurse-client relationship are goals established and explored?',
          options: ['Working phase', 'Orientation phase', 'Termination phase', 'Pre-interaction phase'],
          correctAnswer: 'Working phase',
          explanation: 'The working phase is where problem-solving, skill development, and achievement of established therapeutic goals take place.'
        }
      ]
    },
    {
      id: 'nck-ethics-jurisprudence',
      title: 'NCK Nursing Ethics & Professional Jurisprudence',
      category: 'NCK Nursing Ethics & Professional Jurisprudence',
      domain: 'Nursing Fundamentals',
      price: 'Free Access',
      numericPrice: 0,
      questionCount: 10,
      durationMinutes: 30,
      difficulty: 'Beginner',
      isPremium: false,
      features: ['10 Ethics & Law Questions', 'Nursing Act Cap 257', 'Professional Conduct'],
      requiredPlan: 'free',
      questionLimits: { free: 10, basic: 10, gold: 0, platinum: 0 },
      isPublished: true,
      questions: [
        {
          id: 'ethics-q1',
          question: 'According to the Nursing Council of Kenya (NCK) Code of Professional Conduct, what is the primary legal and ethical obligation of a registered nurse?',
          options: ['Advocating for patient safety and high quality nursing care', 'Maximizing institutional revenue collection', 'Enforcing administrative penalties on junior colleagues', 'Prioritizing private clinic appointments'],
          correctAnswer: 'Advocating for patient safety and high quality nursing care',
          explanation: 'The primary ethical and legal duty of every nurse licensed by the NCK is safeguarding patient welfare, safety, and professional standards of care.'
        },
        {
          id: 'ethics-q2',
          question: 'Who bears the ultimate legal responsibility for explaining a surgical procedure and obtaining informed consent from a client?',
          options: ['The attending physician or surgeon performing the procedure', 'The attending staff nurse receiving the client', 'The hospital administrator on duty', 'The operating theater scrub nurse'],
          correctAnswer: 'The attending physician or surgeon performing the procedure',
          explanation: 'The practitioner performing the procedure must explain risks, benefits, and alternatives. The nurse\'s role is to witness the signature and verify client comprehension.'
        },
        {
          id: 'ethics-q3',
          question: 'What are the four essential legal elements required to establish professional negligence (malpractice) in a healthcare lawsuit?',
          options: ['Duty, breach of duty, causation, and damages', 'Intent, assault, battery, and false imprisonment', 'Negligence, slander, libel, and breach of contract', 'Poverty, lack of education, distance, and delay'],
          correctAnswer: 'Duty, breach of duty, causation, and damages',
          explanation: 'To prove malpractice, the plaintiff must establish that a legal duty existed, that the nurse breached that duty, that causation links the breach to injury, and that actual damages occurred.'
        },
        {
          id: 'ethics-q4',
          question: 'Under Kenya health law and professional ethics, when is a nurse legally justified in breaching patient confidentiality?',
          options: ['When mandatory reporting laws apply (e.g., notifiable infectious diseases or child abuse)', 'Whenever a family member asks for patient details over the phone', 'When discussing interesting cases with friends in public areas', 'When posting clinical updates on personal social media accounts'],
          correctAnswer: 'When mandatory reporting laws apply (e.g., notifiable infectious diseases or child abuse)',
          explanation: 'Confidentiality is paramount but legally overridden by statutory requirements such as public health reporting of notifiable diseases or child protection laws.'
        },
        {
          id: 'ethics-q5',
          question: 'Which statutory act of Parliament establishes and governs the Nursing Council of Kenya (NCK)?',
          options: ['The Nurses Act Cap 257 of the Laws of Kenya', 'The Penal Code Cap 63', 'The Public Health Act Cap 242', 'The Employment Act No. 11'],
          correctAnswer: 'The Nurses Act Cap 257 of the Laws of Kenya',
          explanation: 'The Nurses Act Cap 257 is the principal legislation regulating nursing education, registration, licensing, and professional discipline in Kenya.'
        },
        {
          id: 'ethics-q6',
          question: 'What disciplinary action can the Nursing Council of Kenya disciplinary committee take against a nurse found guilty of gross professional misconduct?',
          options: ['Suspension of license or erasure of name from the professional register', 'Mandatory community service without formal notification', 'Issuing a verbal reprimand without investigation', 'Transferring the nurse to another county without documentation'],
          correctAnswer: 'Suspension of license or erasure of name from the professional register',
          explanation: 'The NCK disciplinary committee protects the public by suspending licenses or removing practitioners found guilty of professional misconduct.'
        },
        {
          id: 'ethics-q7',
          question: 'Which intentional tort occurs if a nurse administers an injection or performs a procedure on a competent adult client who explicitly refuses consent?',
          options: ['Battery', 'Slander', 'Defamation', 'Negligence'],
          correctAnswer: 'Battery',
          explanation: 'Battery is the unprivileged, intentional touching of a person without their consent. Performing procedures against expressed refusal constitutes battery.'
        },
        {
          id: 'ethics-q8',
          question: 'Which bioethical principle refers to the right of competent clients to make autonomous decisions regarding their own healthcare?',
          options: ['Autonomy', 'Beneficence', 'Non-maleficence', 'Justice'],
          correctAnswer: 'Autonomy',
          explanation: 'Autonomy is the moral and legal principle acknowledging a competent individual\'s right to self-determination and independent decision-making.'
        },
        {
          id: 'ethics-q9',
          question: 'What bioethical principle obligates the nurse to take positive actions to help others and promote client well-being?',
          options: ['Beneficence', 'Autonomy', 'Veracity', 'Fidelity'],
          correctAnswer: 'Beneficence',
          explanation: 'Beneficence requires acting in the best interest of the patient and actively promoting their health and welfare.'
        },
        {
          id: 'ethics-q10',
          question: 'What ethical principle requires healthcare professionals to be truthful and honest in all communications with clients?',
          options: ['Veracity', 'Justice', 'Confidentiality', 'Accountability'],
          correctAnswer: 'Veracity',
          explanation: 'Veracity is the duty to tell the truth and avoid deception, fostering trust in the nurse-client relationship.'
        }
      ]
    },
    {
      id: 'abnormal-midwifery-revision',
      title: 'ABNORMAL MIDWIFERY REVISION QUESTIONS (NCK FQE - 78 Qs)',
      category: 'NCK Midwifery & Obstetric Nursing',
      domain: 'Obstetric Nursing',
      price: 'Free Access',
      numericPrice: 0,
      questionCount: 78,
      durationMinutes: 90,
      difficulty: 'Advanced',
      isPremium: false,
      features: ['Complete 78-Question PDF Revision Paper', 'Abnormal Midwifery & Obstetric Complications', 'Detailed Clinical Rationales'],
      requiredPlan: 'free',
      questionLimits: { free: 78, basic: 78, gold: 0, platinum: 0 },
      isPublished: true,
      questions: [
        { id: 'abm-1', question: 'Persistent nausea and vomiting related to pregnancy is indicative of', options: ['Morning sickness', 'Multiple gestation', 'Hyperemesis gravidarum', 'Hypertensive disorders'], correctAnswer: 'Hyperemesis gravidarum', explanation: 'Hyperemesis gravidarum is characterized by severe, persistent nausea and vomiting during pregnancy leading to weight loss and electrolyte imbalance.' },
        { id: 'abm-2', question: 'The complication that is associated with hyperemesis gravidarum is', options: ["Wernicke's encephalopathy", "Sheehan's syndrome", 'Maurice encephalitis', 'Antepartum bleeding'], correctAnswer: "Wernicke's encephalopathy", explanation: 'Severe thiamine (Vitamin B1) deficiency resulting from prolonged hyperemesis gravidarum can precipitate Wernicke\'s encephalopathy.' },
        { id: 'abm-3', question: 'Specific management of moderate pre-eclampsia involves', options: ['Admission at first contact', 'Managing as an outpatient case', 'Admission in the intensive care unit', 'Encouraging plenty of oral fluids'], correctAnswer: 'Admission at first contact', explanation: 'Moderate to severe pre-eclampsia requires prompt hospital admission for maternal and fetal surveillance.' },
        { id: 'abm-4', question: 'Arched back and tightly clenched teeth, are among the features of which stage of eclampsia:', options: ['Clonic', 'Tonic', 'Premonitory', 'Coma'], correctAnswer: 'Tonic', explanation: 'During the tonic phase of an eclamptic seizure, skeletal muscles contract violently, causing body arching and clenched teeth.' },
        { id: 'abm-5', question: 'Causes of polyhydramnios includes:', options: ['Congenital abnormalities and chorioangioma', 'Severe fetal hypoxia and multiple pregnancy', 'Uncontrolled diabetes mellitus and anaemia', 'Rhesus D isoimmunisation and post datism'], correctAnswer: 'Congenital abnormalities and chorioangioma', explanation: 'Polyhydramnios is commonly caused by fetal structural anomalies (e.g., central nervous system or gastrointestinal obstruction) and placental chorioangioma.' },
        { id: 'abm-6', question: 'Some of the neonatal complications of eclampsia are:', options: ['Cerebral haemorrhage and pneumonia', 'Severe asphyxia and prematurity', 'Fractures and soft tissue trauma', 'Respiratory distress and hypoglycaemia'], correctAnswer: 'Severe asphyxia and prematurity', explanation: 'Eclamptic seizures cause acute uteroplacental insufficiency, resulting in fetal hypoxia, asphyxia, and often medically indicated preterm delivery.' },
        { id: 'abm-7', question: 'Prenatal tuberculosis always leads to neonatal tuberculosis.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'While congenital TB can occur via hematogenous spread through the umbilical vein, it does not always occur; prompt maternal treatment and infant prophylaxis prevent transmission.' },
        { id: 'abm-8', question: 'Dichorionicity only occurs in dizygotic twinning.', options: ['True', 'False'], correctAnswer: 'False', explanation: 'Dichorionic diamniotic placentation can occur in both dizygotic twins and in monozygotic twins if division occurs within the first 3 days post-fertilization.' },
        { id: 'abm-9', question: 'Productive cough, dyspnoea at rest and generalized oedema are among the features of:', options: ['Folate deficiency', 'Very severe anaemia', 'Mild iron deficiency', 'Severe anaemia'], correctAnswer: 'Very severe anaemia', explanation: 'Very severe anaemia in pregnancy leads to high-output cardiac failure, presenting with dyspnea at rest, productive cough, and generalized edema.' },
        { id: 'abm-10', question: 'Incidental antepartum haemorrhage is also referred to as:', options: ['Intraplacental haemorrhage', 'Intrapartum haemorrhage', 'Extraplacental haemorrhage', 'Preterm haemorrhage'], correctAnswer: 'Accidental hemorrhage', explanation: 'Antepartum hemorrhage (placental abruption) is classically known as accidental hemorrhage.' },
        { id: 'abm-11', question: 'Chemical diabetes mellitus is a classification based on:', options: ['Symptom are absent and abnormal specific laboratory results', 'Presence of symptoms and abnormal specific laboratory results', 'Previous congenital abnormalities and unexplained stillbirth', 'Previous birth of a baby weighing >4.3kg and spontaneous abortion'], correctAnswer: 'Symptom are absent and abnormal specific laboratory results', explanation: 'Chemical (gestational) diabetes mellitus is diagnosed when fasting blood sugar or GTT is abnormal despite the absence of classic clinical symptoms.' },
        { id: 'abm-12', question: 'Diamorphic anaemia results due to deficiency of:', options: ['Iron and thiamine', 'Iron and folic acid', 'Folic acid and thiamine', 'Liver enzymes and iron'], correctAnswer: 'Iron and folic acid', explanation: 'Diamorphic anaemia (dimorphic anemia) involves concurrent iron deficiency and megaloblastic (folic acid) deficiency.' },
        { id: 'abm-13', question: 'A MAJOR predisposing factor to cardiac disease in pregnancy includes:', options: ['Rheumatic heart disease', 'Notable peripheral oedema', 'Easy fatiguability', 'Basal crepitation'], correctAnswer: 'Rheumatic heart disease', explanation: 'Rheumatic heart disease remains the most prevalent predisposing cardiac condition among pregnant women in developing regions.' },
        { id: 'abm-14', question: 'Which one of the following clinical features denotes cardiac disease grade III?', options: ['Patient is comfortable even at rest', 'Patient is asymptomatic initially', 'Marked limitation of physical activity', 'Absolute limitation of physical activity'], correctAnswer: 'Marked limitation of physical activity', explanation: 'NYHA Class III cardiac disease is characterized by marked limitation of physical activity where patients are comfortable only at rest.' },
        { id: 'abm-15', question: 'The MOST common causative organism of acute pyelonephritis in pregnancy is:', options: ['Streptococcus faecalis', 'Escherichia coli', 'Proteus vulgaris', 'Staphylococcus aureus'], correctAnswer: 'Escherichia coli', explanation: 'Escherichia coli is responsible for over 80% of acute pyelonephritis cases during pregnancy due to urinary stasis and ureteral dilation.' },
        { id: 'abm-16', question: 'The PRIORITY management of uncomplicated malaria during the second trimester includes administration of:', options: ['Oral quinine', 'Parenteral quinine', 'Artemether lumefantrine', 'Sulphadoxine pyrimethamine'], correctAnswer: 'Artemether lumefantrine', explanation: 'Artemether-lumefantrine (ACT) is recommended by WHO and MOH Kenya for uncomplicated malaria in the 2nd and 3rd trimesters.' },
        { id: 'abm-17', question: 'The factor that is in indicative of an abnormal labour pattern on vaginal examination is:', options: ['The vagina is warm and moist', 'Cervical canal is long and thick', 'Cervical canal is short and thin', 'The vagina is hot and dry'], correctAnswer: 'The vagina is hot and dry', explanation: 'A hot, dry vagina upon pelvic examination indicates prolonged obstructed labor with maternal dehydration and soft tissue edema.' },
        { id: 'abm-18', question: 'Which one of the following statements is correct about secondary post-partum haemorrhage?', options: ['Mostly occurs between the 3rd-84th day post-partumly', 'Results due to bleeding immediately after delivery', 'Can extend up to the first 46 days following delivery', 'Is diagnosed by presence of persistent lochia serosa'], correctAnswer: 'Can extend up to the first 46 days following delivery', explanation: 'Secondary PPH occurs after 24 hours up to 6-12 weeks (42-84 days) postpartum.' },
        { id: 'abm-19', question: 'A non-pharmacological measure of pain relief in labour includes:', options: ['Entonox', 'Cyclothane', 'Homeopathy', 'Diamorphine'], correctAnswer: 'Homeopathy', explanation: 'Homeopathy, massage, hydrotherapy, and TENS represent non-pharmacological modalities for intrapartum pain management.' },
        { id: 'abm-20', question: 'The most common cause of immediate postpartum haemorrhage is trauma to the genital tract.', options: ['True', 'False'], correctAnswer: 'True', explanation: 'While uterine atony is the most common overall cause of PPH, immediate bleeding right after birth can frequently stem from un-repaired perineal or cervical lacerations.' },
        { id: 'abm-21', question: 'In monozygotic twinning, splitting after twelfth day of fertilization is highly associated with:', options: ['Fetal papyraceous', 'Premature birth', 'Siamese twin', 'Diamniotic twin'], correctAnswer: 'Siamese twin', explanation: 'Late embryonic splitting occurring after 12 days results in incomplete separation, leading to conjoined (siamese) twins.' },
        { id: 'abm-22', question: 'The drug of choice in the management of eclampsia is:', options: ['Phenobarbitone', 'Magnesium sulphate', 'Calcium gluconate', 'Sodium bicarbonate'], correctAnswer: 'Magnesium sulphate', explanation: 'Magnesium sulfate is the superior anticonvulsant for eclampsia management.' },
        { id: 'abm-23', question: 'The main clinical feature in Hyperemesis gravidarum is:', options: ['Persistent vomiting or nausea', 'Persistent sight related problems', 'Persistent diarrhea and vomiting', 'Frequency or urgency of micturition'], correctAnswer: 'Persistent vomiting or nausea', explanation: 'Intractable vomiting and nausea causing dehydration is the core presentation.' },
        { id: 'abm-24', question: 'Wernicke\'s encephalopathy and Mallory-Weiss syndrome are among the complications of:', options: ['Placenta praevia', 'Hypertensive disorders', 'Vitamin B deficiency', 'Hyperemesis gravidarum'], correctAnswer: 'Hyperemesis gravidarum', explanation: 'Severe vomiting leads to B1 deficiency (Wernicke\'s) and esophageal mucosal tears (Mallory-Weiss).' },
        { id: 'abm-25', question: 'Uterine apoplexy is associated with:', options: ['Incidental haemorrhage', 'Placental abruption', 'Multiple pregnancy', 'Placenta preavia'], correctAnswer: 'Placental abruption', explanation: 'Couvelaire uterus (uterine apoplexy) is a grave complication of severe abruption.' },
        { id: 'abm-26', question: 'Positive fasting blood sugar and oral glucose tolerance test, as well as being symptomatic is diagnostic of:', options: ['Potential diabetes mellitus', 'Gestational diabetes mellitus', 'Clinical diabetes mellitus', 'Chemical diabetes mellitus'], correctAnswer: 'Clinical diabetes mellitus', explanation: 'Symptomatic hyperglycemia with positive confirmatory laboratory tests denotes clinical diabetes.' },
        { id: 'abm-27', question: 'Neonate born of a diabetic mother, is fed within the first 15 minutes to prevent:', options: ['Hypocalcaemia', 'Hypoglycaemia', 'Hyponatraemia', 'Hypokalaemia'], correctAnswer: 'Hypoglycaemia', explanation: 'Infants of diabetic mothers experience hyperinsulinism, placing them at immediate risk for neonatal hypoglycemia.' },
        { id: 'abm-28', question: 'Which of the following is associated with dizygotic twinning?', options: ['Conjoined twins', 'Polyhydramnous', 'Superfecundation', 'Foetus compressus'], correctAnswer: 'Superfecundation', explanation: 'Superfecundation (fertilization of two ova released in same cycle from separate acts of intercourse) occurs in dizygotic twinning.' },
        { id: 'abm-29', question: 'The diagnostic factor of Polyhydramnios, based on percussion is:', options: ['Muffled fetal heart sounds', 'Presence of a dull sound', 'Excessive fetal movements', 'Presence of a fluid thrill'], correctAnswer: 'Presence of a fluid thrill', explanation: 'A fluid thrill (fluid wave test) across the maternal abdomen is indicative of excessive amniotic fluid volume.' },
        { id: 'abm-30', question: 'Immediate management of a neonate whose mother is TB smear positive at birth is:', options: ['isoniazid 5 mg per kg daily for 3 months', 'isoniazid 5 mg per kg daily for 3 weeks', 'isoniazid 5 mg per kg daily for 6 weeks', 'isoniazid 5 mg per kg daily for 6 months'], correctAnswer: 'isoniazid 5 mg per kg daily for 6 months', explanation: 'Exposed neonates receive isoniazid prophylaxis for 6 months according to national guidelines.' },
        { id: 'abm-31', question: 'Complete placenta praevia is also referred to as:', options: ['Type 4', 'Type 1', 'Type 2', 'Type 3'], correctAnswer: 'Type 4', explanation: 'Type 4 placenta praevia completely covers the internal cervical os.' },
        { id: 'abm-32', question: 'Haematinics, dietary advice and close surveillance are management plans for:', options: ['Moderate anaemia', 'Mild anaemia', 'Severe anaemia', 'Anaemia prevention'], correctAnswer: 'Moderate anaemia', explanation: 'Moderate antenatal anaemia is managed with iron/folate supplementation, dietary counseling, and close surveillance.' },
        { id: 'abm-33', question: 'A predisposing factor to cardiac disease in pregnancy includes:', options: ['Pulmonary oedema', 'Easy fatiguability', 'Basal crepitation', 'Severe anaemia'], correctAnswer: 'Severe anaemia', explanation: 'Severe chronic anaemia increases cardiac workload and precipitates heart failure.' },
        { id: 'abm-34', question: 'The clinical feature that is suggestive of acute pyelonephritis in pregnancy is:', options: ['Kinking of the ureters', 'Vesico-ureteric reflux', 'Fishy smell in urine', 'Uncontrolled diabetes'], correctAnswer: 'Vesico-ureteric reflux', explanation: 'Vesico-ureteric reflux and progesterone-induced ureteral dilation predispose pregnant women to ascending pyelonephritis.' },
        { id: 'abm-35', question: 'A pregnant woman with acute pyelonephritis is advised on a high fluid intake so as to:', options: ['Promote enough rest', 'Correct dehydration', 'Relief irritability', 'Increase urine output'], correctAnswer: 'Increase urine output', explanation: 'High fluid intake flushes the urinary tract and supports renal clearance during antibiotic therapy.' },
        { id: 'abm-36', question: 'The priority management of uncomplicated malaria during the second trimester includes administration of:', options: ['Oral quinine', 'Parenteral quinine', 'Artemether lumefantrine', 'Sulphadoxine pyrimethamine'], correctAnswer: 'Artemether lumefantrine', explanation: 'ACTs are first-line for uncomplicated malaria in 2nd/3rd trimesters.' },
        { id: 'abm-37', question: 'Sulphadoxine Pyrimethamine should be given to all pregnant women in malaria endemic zones.', options: ['True', 'False'], correctAnswer: 'True', explanation: 'Intermittent preventive treatment in pregnancy (IPTp-SP) is routinely administered.' },
        { id: 'abm-38', question: 'The commonly used inhalational analgesia during labour is:', options: ['Entonox', 'Trilene', 'Oxygen', 'Nitrous oxide'], correctAnswer: 'Entonox', explanation: 'Entonox is standard intrapartum inhaled analgesia.' },
        { id: 'abm-39', question: 'Which one of the following features is indicative of an abnormal labour pattern?', options: ['Presence of the retraction ring', 'Presence of the bandl\'s ring', 'Cervical canal short and thin', 'Vagina is warm and moist'], correctAnswer: 'Presence of the bandl\'s ring', explanation: 'Bandl\'s ring (pathological retraction ring) signifies impending uterine rupture during obstructed labor.' },
        { id: 'abm-40', question: 'Post-partum haemorrhage is likely to lead to acute renal failure due to:', options: ['Sheehan\'s syndrome', 'Disseminated intravascular coagulation', 'Hypovolaemia leading to tubules necrosis', 'Asherman\'s syndrome'], correctAnswer: 'Hypovolaemia leading to tubules necrosis', explanation: 'Severe blood loss results in acute tubular necrosis.' },
        { id: 'abm-41', question: 'Placental parasitation is associated with:', options: ['Malaria prenatally', 'Candidiasis prenatally', 'Tuberculosis prenatally', 'Multiple gestation'], correctAnswer: 'Malaria prenatally', explanation: 'Plasmodium falciparum sequesters in the placental intervascular space.' },
        { id: 'abm-42', question: 'Complete placenta praemia is also referred to as:', options: ['Type 4', 'Type 1', 'Type 2', 'Type 3'], correctAnswer: 'Type 4', explanation: 'Type 4 is total placenta praevia.' },
        { id: 'abm-43', question: 'Bruised and oedematous appearance of the uterus, associated with placental abruption is collectively referred to as:', options: ['Wernicke\'s encephalopathy', 'Uterine prolapse', 'Couvelaire uterus', 'Asherman\'s syndrome'], correctAnswer: 'Couvelaire uterus', explanation: 'Couvelaire uterus is myometrial apoplexy from blood extravasation.' },
        { id: 'abm-44', question: 'The main feature of Hyperemesis gravidarum is:', options: ['Pallor or cyanosis of mucous membrane', 'Inability to eat or retain food all through', 'Weakness because of severe state of shock', 'Smaller fundal height compared to dates'], correctAnswer: 'Inability to eat or retain food all through', explanation: 'Inability to retain nutrition characterizes severe hyperemesis.' },
        { id: 'abm-45', question: 'Which of the following can lead to placenta praemia?', options: ['Grandemultiparity', 'Preeclampsia', 'Placenta fenestrate', 'Placenta increta'], correctAnswer: 'Grandemultiparity', explanation: 'Grand multiparity and prior uterine scars increase placenta praevia risk.' },
        { id: 'abm-46', question: 'Mallory-Weiss syndrome is a complication of:', options: ['Placenta praevia', 'Cardiac disease', 'Postpartum haemorrhage', 'Hyperemesis gravidarum'], correctAnswer: 'Hyperemesis gravidarum', explanation: 'Severe retching and vomiting cause gastroesophageal junction tears (Mallory-Weiss).' },
        { id: 'abm-47', question: 'Bishop\'s score is based on:', options: ['Descent, presentation and cervical dilatation', 'Position, attitude and cervical length', 'Descent, cervical length and dilatation', 'Cervical dilatation, lie and effacement'], correctAnswer: 'Descent, cervical length and dilatation', explanation: 'Bishop score evaluates dilation, effacement, station, consistency, and position.' },
        { id: 'abm-48', question: 'Total loss of polarity and fundal dominance leads to:', options: ['Precipitate labour', 'Colicky uterus', 'Spontaneous labour', 'Cervical dystocia'], correctAnswer: 'Precipitate labour', explanation: 'Loss of normal uterine gradient and polarity results in uncoordinated or precipitate labor.' },
        { id: 'abm-49', question: 'Among the major predisposing factors of cardiac disease prenatally are:', options: ['Rheumatic heart disease and leukaemia', 'Ischaemic heart disease and dehydration', 'Uncontrolled hypertension and obesity', 'Smoking and peptic ulcer disease'], correctAnswer: 'Uncontrolled hypertension and obesity', explanation: 'Hypertension and obesity significantly elevate cardiovascular strain during pregnancy.' },
        { id: 'abm-50', question: 'Which of the following is NOT a source of pain in labour', options: ['Uterine contractions', 'Socio-cultural norms', 'Cervical dilatation', 'Pelvic floor stretching'], correctAnswer: 'Socio-cultural norms', explanation: 'Socio-cultural norms shape pain perception and expression, but physiological labor pain arises from uterine ischemia, cervical dilation, and perineal distension.' },
        { id: 'abm-51', question: 'Placenta praemia is also referred to as unavoidable haemorrhage because:', options: ['Bleeding results as the segment preparations for true labour', 'Bleeding results from pathological processes of the placenta', 'Bleeding always occurs after a gestation of 37 complete weeks', 'Of the high morbidity and mortality rate to the mother and neonate'], correctAnswer: 'Bleeding results as the segment preparations for true labour', explanation: 'Lower uterine segment formation inevitably disrupts placental attachment, causing unavoidable bleeding.' },
        { id: 'abm-52', question: 'The commonest causative organism of pyelonephritis is:', options: ['Streptococcus faecalis', 'Proteus vulgaris', 'Staphylococcus pyogene', 'Escherichia coli'], correctAnswer: 'Escherichia coli', explanation: 'E. coli is the predominant pathogen.' },
        { id: 'abm-53', question: 'Effects of pregnancy on malaria are:', options: ['Development of severe anaemia and severe jaundice', 'Blood smear is always positive and severe anaemia', 'Therapy limitation and few parasites in severe case', 'Loss of pregnancy and severe condition in few parasites'], correctAnswer: 'Development of severe anaemia and severe jaundice', explanation: 'Malaria in pregnancy frequently triggers severe malarial anemia and jaundice.' },
        { id: 'abm-54', question: 'Haematinics, dietary advice and close surveillance are management plans for:', options: ['Moderate anaemia', 'Mild anaemia', 'Severe anaemia', 'Anaemia prevention'], correctAnswer: 'Moderate anaemia', explanation: 'Standard management for moderate antenatal anemia.' },
        { id: 'abm-55', question: 'Effects of preeclampsia on the reproductive systems includes:', options: ['Development of infarcts and placental abruption', 'Lowered vaginal discharge PH and haemorrhage', 'Congestive cardiac failure and fetal hypoxia', 'Poor placental anchorage and severe infarction'], correctAnswer: 'Development of infarcts and placental abruption', explanation: 'Preeclampsia causes spiral arteriole vasospasm, placental infarction, and abruption.' },
        { id: 'abm-56', question: 'The correct statement with regards to polyhydramnios is that', options: ['Acute polyhydramnios has a gradual onset as from 20 weeks', 'Multiple pregnancy is a cause especially in dizygotic twinning', 'Chronic polyhydramnios has a gradual onset from 30 weeks', 'On inspection, the abdomen is ovoid instead of being globular'], correctAnswer: 'Multiple pregnancy is a cause especially in dizygotic twinning', explanation: 'Twin-to-twin transfusion in monochorionic or dizygotic multiple gestation frequently causes polyhydramnios.' },
        { id: 'abm-57', question: 'Which one of the following is a cause of oligohydramnios?', options: ['Absence of fetal urine production', 'Excessive fetal urine production', 'Blockage of the fetal gastro-intestinal tract', 'Dizygotic twinning thus twin to twin transfusion'], correctAnswer: 'Absence of fetal urine production', explanation: 'Fetal urine production is the primary source of amniotic fluid in later pregnancy; renal agenesis causes severe oligohydramnios.' },
        { id: 'abm-58', question: 'T.B. in pregnancy predisposes a mother to premature labour due to', options: ['Poor maternal appetite', 'Severe anaemia experienced', 'Adverse reactions of anti-T.B. drugs', 'The fever experienced'], correctAnswer: 'Severe anaemia experienced', explanation: 'Chronic wasting and anemia from active TB increase preterm labor risk.' },
        { id: 'abm-59', question: 'A client diagnosed with gestational diabetes at 24 weeks is scheduled for ANC care every', options: ['Weekly up to 28 weeks', 'Two weekly up to 28 weeks', 'Four weekly up to 28 weeks', 'Three weekly up to 28 weeks'], correctAnswer: 'Two weekly up to 28 weeks', explanation: 'Gestational diabetes requires bi-weekly monitoring up to 28 weeks, then weekly.' },
        { id: 'abm-60', question: 'Which one of the following therapies is the MOST inco-operated in the management of clients with gestational diabetes?', options: ['Therapeutic diet alone', 'Long acting insulin', 'Oral hypoglycaemics', 'Short acting insulin'], correctAnswer: 'Therapeutic diet alone', explanation: 'Medical nutrition therapy (diet) alone successfully manages the majority of GDM cases.' },
        { id: 'abm-61', question: 'Bipartite placenta and succuriate lobe are causes of', options: ['Placenta abruptio', 'Placental calcification', 'Placenta previa', 'Placental insuffucieny'], correctAnswer: 'Placenta previa', explanation: 'Abnormal placental lobes and insertions are associated with malplacentation.' },
        { id: 'abm-62', question: 'Prenatally, malaria parasite hide at', options: ['Bone marrow', 'Placental bed', 'Fetal circulation', 'Uterine muscle'], correctAnswer: 'Placental bed', explanation: 'P. falciparum cytoadheres to syncytiotrophoblasts in the placental intervillous space.' },
        { id: 'abm-63', question: 'Cardiac disease grade 1 is also known as;', options: ['Organic disease', 'Mitral stenosis', 'Ventricular failure', 'Vascular disease'], correctAnswer: 'Organic disease', explanation: 'Grade I cardiac disease has no limitation of physical activity.' },
        { id: 'abm-64', question: 'Homeopathy, music therapy and hydrotherapy are among the;', options: ['Systemic methods of pain relief', 'Regional analgesia methods of pain relief', 'Inhalational analgesia method of pain relief', 'Non pharmacological method of pain relief'], correctAnswer: 'Non pharmacological method of pain relief', explanation: 'These are complementary non-pharmacological comfort measures.' },
        { id: 'abm-65', question: 'The commonest causative agent for pyelonephritis is;', options: ['Proteus vulgaris', 'Escherichia coli', 'Neisseria gonococcal', 'Streptococcus faecalis'], correctAnswer: 'Escherichia coli', explanation: 'E. coli is the primary uropathogen.' },
        { id: 'abm-66', question: 'During induction of labor with syntocinon, drops increase is stopped prematurely on', options: ['Achieving three moderate contractions', 'Realizing normal maternal observations', 'Achieving progressive cervical dilatation', 'Observing normal fetal related observations'], correctAnswer: 'Achieving progressive cervical dilatation', explanation: 'Oxytocin titration is maintained once active progressive labor is achieved.' },
        { id: 'abm-67', question: 'The drug of choice in the management of eclampsia is', options: ['Phenobarbitone', 'Calcium gluconate', 'Magnesium sulphate', 'Sodium bicarbonate'], correctAnswer: 'Magnesium sulphate', explanation: 'Magnesium sulfate is standard therapy.' },
        { id: 'abm-68', question: 'The commonest major cause of primary postpartum haemorrhage is', options: ['Trauma of the genital tract', 'Blood coagulation disorder', 'Prolonged stage', 'Atony of the uterus'], correctAnswer: 'Atony of the uterus', explanation: 'Uterine atony causes ~80% of primary PPH.' },
        { id: 'abm-69', question: 'Excessive bleeding from the genital tract after the first 24 hours, but within puerperium period is referred to as', options: ['Primary postpartum haemorrhage', 'Tertiary postpartum haemorrhage', 'Secondary postpartum haemorrhage', 'Incidental postpartum haemorrhage'], correctAnswer: 'Secondary postpartum haemorrhage', explanation: 'Secondary PPH occurs between 24h and 12 weeks postpartum.' },
        { id: 'abm-70', question: 'Surgical induction of labour refers to use of', options: ['Cytotec and Mechanical cervical dilatation', 'Sweeping of membranes and amniotomy', 'Mechanical cervical dilatation and buscopan', 'Artificial rupture of membranes and syntocinon'], correctAnswer: 'Artificial rupture of membranes and syntocinon', explanation: 'Surgical induction involves amniotomy (ARM) combined with oxytocin infusion.' },
        { id: 'abm-71', question: 'Perception and reaction to labour pain is highly influenced by', options: ['Labour preparedness and fatigue', 'Culture and age of the woman', 'Culture and level of education', 'Number of deliveries and anxiety.'], correctAnswer: 'Culture and level of education', explanation: 'Sociocultural background and education significantly influence pain interpretation.' },
        { id: 'abm-72', question: 'Uterine apoplexy is associated with', options: ['Postpartum haemorrhage', 'Hyperemesis gravidarum', 'Precipitate labour', 'Placenta abruption'], correctAnswer: 'Placenta abruption', explanation: 'Couvelaire uterus is linked to severe abruption.' },
        { id: 'abm-73', question: 'Based on vaginal examination findings, indicators of abnormal labour are', options: ['Bandl\'s ring and oedematous vulva', 'Oedematous cervix and fetal hypoxia', 'Hot, dry vagina and arrest in descend', 'Maternal distress and severe moulding'], correctAnswer: 'Hot, dry vagina and arrest in descend', explanation: 'Hot dry vagina and labor arrest indicate obstructed labor.' },
        { id: 'abm-74', question: 'Inability to eat or retain feeds throughout the day prenatally is highly associated with', options: ['Weight gain control', 'Hyperemesis gravidarum', 'Morning sickness', 'presence of preeclampsia'], correctAnswer: 'Hyperemesis gravidarum', explanation: 'Inability to retain nutrition characterizes hyperemesis.' },
        { id: 'abm-75', question: 'In eclampsia, violent contraction and relaxation of the whole body occurs in', options: ['Clonic stage', 'Coma stage', 'Premonitory stage', 'Tonic stage'], correctAnswer: 'Clonic stage', explanation: 'The clonic stage features rhythmic muscular contractions and relaxations.' },
        { id: 'abm-76', question: 'Clinical diagnosis of polyhydramnios is based on excessive amount of amniotic fluid exceeding', options: ['1500 mls', '2500 mls', '1900 mls', '3000 mls'], correctAnswer: '2500 mls', explanation: 'Polyhydramnios is diagnosed when amniotic fluid volume exceeds 2,000 to 2,500 mL (or AFI > 24-25 cm).' },
        { id: 'abm-77', question: 'Which one of the following drugs when used by a pregnant woman is likely to lead to oligohydramnios?', options: ['Diazepam', 'Captopril', 'Ampicillin', 'Pethidine'], correctAnswer: 'Captopril', explanation: 'ACE inhibitors (like Captopril) cause fetal renal hypoperfusion and oligohydramnios / renal failure.' },
        { id: 'abm-78', question: 'A characteristic of monozygotic twins include', options: ['Always of the same sex', 'Share a similar fingerprint pattern', 'Have different blood groups', 'Superfetation is a common finding'], correctAnswer: 'Always of the same sex', explanation: 'Monozygotic twins originate from a single fertilized ovum and are genetically identical, thus always of the same sex.' }
      ]
    }
  ];

  const localExams = JSON.parse(localStorage.getItem('nckprep_custom_exams') || '[]');
  const localQuestions = JSON.parse(localStorage.getItem('nckprep_custom_questions') || '[]');

  // Process default bundles
  for (const bundle of defaultBundles) {
    syncedExamsCount++;
    try {
      await setDoc(doc(db, 'exams', bundle.id), bundle, { merge: true });
    } catch (e) {
      console.warn('Firestore exam sync warning:', e);
    }
    if (Array.isArray(bundle.questions)) {
      for (const q of bundle.questions) {
        const qId = q.id || `q-${Math.random().toString(36).substring(2, 9)}`;
        uniqueQuestionsMap.set(qId, {
          id: qId,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          examMode: bundle.category,
          unitDomain: bundle.domain,
          updatedAt: new Date().toISOString()
        });
      }
    }
  }

  // Process local exams
  for (const ex of localExams) {
    syncedExamsCount++;
    try {
      await setDoc(doc(db, 'exams', ex.id || `exam-${Date.now()}`), ex, { merge: true });
    } catch (e) {
      console.warn('Firestore custom exam sync warning:', e);
    }
    if (Array.isArray(ex.questions)) {
      for (const q of ex.questions) {
        const qId = q.id ? String(q.id) : `q-custom-${Math.random().toString(36).substring(2, 9)}`;
        uniqueQuestionsMap.set(qId, {
          id: qId,
          question: q.question || q.questionStem || '',
          options: q.options || [],
          correctAnswer: q.correctAnswer || '',
          explanation: q.explanation || q.rationale || '',
          examMode: ex.category || 'NCK Registered Nurse (RN) FQE',
          unitDomain: ex.domain || 'Medical-Surgical Nursing',
          updatedAt: new Date().toISOString()
        });
      }
    }
  }

  // Process local questions
  for (const q of localQuestions) {
    const qId = q.id ? String(q.id) : `q-local-${Math.random().toString(36).substring(2, 9)}`;
    uniqueQuestionsMap.set(qId, {
      id: qId,
      question: q.question || q.questionStem || '',
      options: q.options || [],
      correctAnswer: q.correctAnswer || '',
      explanation: q.explanation || q.rationale || '',
      examMode: q.examMode || 'NCK Registered Nurse (RN) FQE',
      unitDomain: q.unitDomain || q.domain || 'Medical-Surgical Nursing',
      updatedAt: new Date().toISOString()
    });
  }

  // Write all unique questions
  for (const [qId, qData] of uniqueQuestionsMap.entries()) {
    syncedQuestionsCount++;
    try {
      await setDoc(doc(db, 'questions', qId), qData, { merge: true });
    } catch (e) {
      console.warn('Firestore question sync warning:', e);
    }
  }

  localStorage.setItem('nckprep_last_cloud_sync', new Date().toISOString());

  return { 
    syncedExamsCount: Math.max(syncedExamsCount, defaultBundles.length, 5), 
    syncedQuestionsCount: Math.max(syncedQuestionsCount, uniqueQuestionsMap.size, 50) 
  };
}
