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
      title: 'ABNORMAL MIDWIFERY REVISION QUESTIONS (NCK FQE)',
      category: 'NCK Midwifery & Obstetric Nursing',
      domain: 'Obstetric Nursing',
      price: 'Free Access',
      numericPrice: 0,
      questionCount: 20,
      durationMinutes: 45,
      difficulty: 'Advanced',
      isPremium: false,
      features: ['Uploaded PDF Revision Paper', 'Abnormal Midwifery & Obstetric Complications', 'Detailed Clinical Rationales'],
      requiredPlan: 'free',
      questionLimits: { free: 20, basic: 20, gold: 0, platinum: 0 },
      isPublished: true,
      questions: [
        {
          id: 'abnormal-mid-1',
          question: 'Persistent nausea and vomiting related to pregnancy is indicative of',
          options: ['Morning sickness', 'Multiple gestation', 'Hyperemesis gravidarum', 'Hypertensive disorders'],
          correctAnswer: 'Hyperemesis gravidarum',
          explanation: 'Hyperemesis gravidarum is characterized by severe, persistent nausea and vomiting during pregnancy leading to weight loss and electrolyte imbalance.'
        },
        {
          id: 'abnormal-mid-2',
          question: 'The complication that is associated with hyperemesis gravidarum is',
          options: ['Wernicke\'s encephalopathy', 'Sheehan\'s syndrome', 'Maurice encephalitis', 'Antepartum bleeding'],
          correctAnswer: 'Wernicke\'s encephalopathy',
          explanation: 'Severe thiamine (Vitamin B1) deficiency resulting from prolonged hyperemesis gravidarum can precipitate Wernicke\'s encephalopathy.'
        },
        {
          id: 'abnormal-mid-3',
          question: 'Arching back and tightly clenched teeth are among the features of which stage of eclampsia:',
          options: ['Clonic', 'Tonic', 'Premonitory', 'Coma'],
          correctAnswer: 'Tonic',
          explanation: 'During the tonic phase of an eclamptic seizure, skeletal muscles contract violently, causing body arching and clenched teeth.'
        },
        {
          id: 'abnormal-mid-4',
          question: 'The drug of choice in the management of eclampsia is',
          options: ['Phenobarbitone', 'Magnesium sulphate', 'Calcium gluconate', 'Sodium bicarbonate'],
          correctAnswer: 'Magnesium sulphate',
          explanation: 'Magnesium sulfate is the definitive anticonvulsant of choice for arresting and preventing eclamptic seizures.'
        },
        {
          id: 'abnormal-mid-5',
          question: 'The main clinical feature in Hyperemesis gravidarum is',
          options: ['Persistent vomiting or nausea', 'Persistent sight related problems', 'Persistent diarrhea and vomiting', 'Frequency or urgency of micturition'],
          correctAnswer: 'Persistent vomiting or nausea',
          explanation: 'The hallmark presentation of hyperemesis gravidarum is intractable, persistent nausea and vomiting.'
        },
        {
          id: 'abnormal-mid-6',
          question: 'Wernicke\'s encephalopathy and Mallory-Weiss syndrome are among the complications of',
          options: ['Placenta praevia', 'Hypertensive disorders', 'Vitamin B deficiency', 'Hyperemesis gravidarum'],
          correctAnswer: 'Hyperemesis gravidarum',
          explanation: 'Hyperemesis gravidarum causes severe nutritional depletion resulting in Wernicke\'s encephalopathy and esophageal mucosal tears (Mallory-Weiss syndrome) from severe vomiting.'
        },
        {
          id: 'abnormal-mid-7',
          question: 'Uterine apoplexy is associated with',
          options: ['Postpartum haemorrhage', 'Hyperemesis gravidarum', 'Precipitate labour', 'Placental abruption'],
          correctAnswer: 'Placental abruption',
          explanation: 'Uterine apoplexy (Couvelaire uterus) occurs when blood infiltrates the myometrium in severe placental abruption.'
        },
        {
          id: 'abnormal-mid-8',
          question: 'Complete placenta praemia is also referred to as',
          options: ['Type 4', 'Type 1', 'Type 2', 'Type 3'],
          correctAnswer: 'Type 4',
          explanation: 'Placenta praemia is classified into four grades, where Type 4 represents total (complete) covering of the internal cervical os.'
        },
        {
          id: 'abnormal-mid-9',
          question: 'The commonest major cause of primary postpartum haemorrhage is',
          options: ['Trauma of the genital tract', 'Blood coagulation disorder', 'Prolonged stage of labor', 'Atony of the uterus'],
          correctAnswer: 'Atony of the uterus',
          explanation: 'Uterine atony (failure of the myometrium to contract post-delivery) accounts for approximately 70-80% of primary PPH cases.'
        },
        {
          id: 'abnormal-mid-10',
          question: 'Excessive bleeding from the genital tract after the first 24 hours, but within puerperium period is referred to as',
          options: ['Primary postpartum haemorrhage', 'Tertiary postpartum haemorrhage', 'Secondary postpartum haemorrhage', 'Incidental postpartum haemorrhage'],
          correctAnswer: 'Secondary postpartum haemorrhage',
          explanation: 'Secondary PPH occurs between 24 hours and 12 weeks post-delivery, often due to retained placental tissue or subinvolution/infection.'
        },
        {
          id: 'abnormal-mid-11',
          question: 'The MOST common causative organism of acute pyelonephritis in pregnancy is',
          options: ['Streptococcus faecalis', 'Escherichia coli', 'Proteus vulgaris', 'Staphylococcus aureus'],
          correctAnswer: 'Escherichia coli',
          explanation: 'Escherichia coli originating from the bowel flora is responsible for the vast majority of urinary tract infections and pyelonephritis during pregnancy.'
        },
        {
          id: 'abnormal-mid-12',
          question: 'The priority management of uncomplicated malaria during the second trimester includes administration of',
          options: ['Oral quinine', 'Parenteral quinine', 'Artemether lumefantrine', 'Sulphadoxine pyrimethamine'],
          correctAnswer: 'Artemether lumefantrine',
          explanation: 'ACTs such as artemether-lumefantrine are recommended by WHO and MOH Kenya as first-line treatment for uncomplicated malaria in second and third trimesters.'
        },
        {
          id: 'abnormal-mid-13',
          question: 'The commonly used inhalational analgesia during labour is',
          options: ['Entonox', 'Trilene', 'Oxygen', 'Nitrous oxide'],
          correctAnswer: 'Entonox',
          explanation: 'Entonox (50% nitrous oxide and 50% oxygen mix) is self-administered by laboring mothers for safe, intermittent pain relief.'
        },
        {
          id: 'abnormal-mid-14',
          question: 'Post-partum haemorrhage is likely to lead to acute renal failure due to',
          options: ['Sheehan\'s syndrome', 'Disseminated intravascular coagulation', 'Hypovolaemia leading to tubules necrosis', 'Asherman\'s syndrome'],
          correctAnswer: 'Hypovolaemia leading to tubules necrosis',
          explanation: 'Severe acute blood loss in PPH causes profound hypovolaemia and renal ischemia, leading to acute tubular necrosis (ATN).'
        },
        {
          id: 'abnormal-mid-15',
          question: 'Postmaturity is pregnancy equal to or more than',
          options: ['38 completed weeks', '42 completed weeks', '40 completed weeks', '36 completed weeks'],
          correctAnswer: '42 completed weeks',
          explanation: 'Postmaturity (post-term pregnancy) is clinically defined as pregnancy lasting 42 completed weeks (294 days) or more from the LMP.'
        },
        {
          id: 'abnormal-mid-16',
          question: 'In marginal cephalopelvic disproportion',
          options: ['All the patients will need an operative delivery', 'Half of the patients will need an operative delivery', 'The problem is always overcome during labour', 'The pelvis too is small for the fetus to pass through.'],
          correctAnswer: 'The problem is always overcome during labour',
          explanation: 'In marginal (mild) CPD, good uterine contractions and molding can frequently allow successful vaginal delivery.'
        },
        {
          id: 'abnormal-mid-17',
          question: 'The presenting diameter in brow presentation is',
          options: ['Submentobregmatic', 'Suboccipitofrontal', 'Mentovertical 13.5cm', 'Mentovertical 9.5cm'],
          correctAnswer: 'Mentovertical 13.5cm',
          explanation: 'In brow presentation, the fetal head presents by the mentovertical diameter (approximately 13.5 cm), which is the largest head diameter.'
        },
        {
          id: 'abnormal-mid-18',
          question: 'The lie is defined as unstable when it keeps varying after',
          options: ['36 weeks gestation', '42 weeks gestation', '38 weeks gestation', '40 weeks gestation'],
          correctAnswer: '38 weeks gestation',
          explanation: 'An unstable lie after 38 weeks gestation warrants close monitoring and hospital admission due to risks of cord prolapse and malpresentation.'
        },
        {
          id: 'abnormal-mid-19',
          question: 'A condition of trial of scar is',
          options: ['Estimated foetal weight of less than 3600g', 'Availability of a level one hospital nearby', 'Not more than two previous caesarean section scar', 'An adequate pelvis with true conjugate 10.5cm'],
          correctAnswer: 'An adequate pelvis with true conjugate 10.5cm',
          explanation: 'A successful trial of labor after cesarean (TOLAC) requires an adequate pelvis (true conjugate >= 10.5 cm), single previous low transverse scar, and vertex presentation.'
        },
        {
          id: 'abnormal-mid-20',
          question: 'Vaginal birth after caesarean section is known as',
          options: ['Spontaneous vaginal delivery', 'Trial of scar', 'Spontaneous vertex delivery', 'Elective operative delivery'],
          correctAnswer: 'Trial of scar',
          explanation: 'Vaginal birth after previous cesarean delivery is clinically termed a trial of scar (or TOLAC).'
        }
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
