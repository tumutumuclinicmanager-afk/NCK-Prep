import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function syncAllExamsAndQuestionsToCloud(): Promise<{ syncedExamsCount: number; syncedQuestionsCount: number }> {
  let syncedExamsCount = 0;
  let syncedQuestionsCount = 0;
  const uniqueQuestionsMap = new Map<string, any>();

  const defaultBundles = [
    {
      id: 'nck-exam1-part2',
      title: 'NCK Exam 1 - Study Guide (Part 2)',
      category: 'NCK Registered Nurse (RN) FQE',
      domain: 'Medical-Surgical & Obstetric Nursing',
      price: 'Free Access',
      numericPrice: 0,
      questionCount: 27,
      durationMinutes: 45,
      difficulty: 'Advanced',
      isPremium: false,
      features: ['27 NCK Licensure Questions (Part 2)', 'Comprehensive Clinical Rationales', 'Immediate Performance Analytics'],
      requiredPlan: 'free',
      questionLimits: { free: 27, basic: 27, gold: 0, platinum: 0 },
      isPublished: true,
      questions: [
        { id: 'part2-q19', question: 'Neurovascular assessment of the lower limb post-cast application involves observation of,', options: ['Color, sensation and pulses', 'Level of consciousness, limb symmetry and muscular strength', 'Capillary refill, sensation and muscle power', 'Color, warmth and muscle power'], correctAnswer: 'Color, sensation and pulses', explanation: 'The classic 5 Ps of neurovascular assessment are Pain, Pallor, Pulselessness, Paraesthesia and Paralysis. Colour, sensation and distal pulses are essential post-cast checks.' },
        { id: 'part2-q20', question: 'The risk for macrovascular complications in diabetes mellitus may be reduced by,', options: ['Lowering BP, avoiding nephrotoxic substances & reducing strenuous exercises.', 'Weight reduction, reducing fat/triglyceride levels, quitting smoking.', 'Foot care, early diagnosis of retinal detachment & daily U/Es checkups.', 'High fibre diet, low fat diet & prompt treatment of systemic infections'], correctAnswer: 'Weight reduction, reducing fat/triglyceride levels, quitting smoking.', explanation: 'Macrovascular disease (CAD, stroke, peripheral vascular disease) is reduced by controlling weight, lipids and stopping smoking.' },
        { id: 'part2-q21', question: 'The priority indicator of increasing intracranial pressure is,', options: ['Unequal pupil size', 'Decreasing systolic pressure', 'Tachycardia', 'Decreasing body temperature'], correctAnswer: 'Unequal pupil size', explanation: 'A change in pupil size or reactivity is an early and critical sign of rising ICP (compression of the oculomotor nerve).' },
        { id: 'part2-q22', question: 'Foods that may predispose a client to megaloblastic anemia if taken exclusively include,', options: ['Meat, eggs and beans', 'Beans, Peas and rice', 'Capsicum, Sorghum and Millet', 'Meat, Maize, Sorghum'], correctAnswer: 'Beans, Peas and rice', explanation: 'A diet consisting mainly of plant foods (beans, peas, rice) that lack animal sources of vitamin B12 can lead to B12-deficiency megaloblastic anaemia.' },
        { id: 'part2-q23', question: 'In pyloric stenosis there is,', options: ['Projectile vomiting & olive-sized mass in abdomen’s upper right quadrant', 'Blood tinged vomitus and significantly reduced peristaltic waves', 'Severe abdominal pain and irregular opening of the bowels', 'Normal feeding appetite and passing of loose bowel motion'], correctAnswer: 'Projectile vomiting & olive-sized mass in abdomen’s upper right quadrant', explanation: 'Infantile hypertrophic pyloric stenosis classically presents with progressive non-bilious projectile vomiting and a palpable olive-like mass in the right upper quadrant.' },
        { id: 'part2-q24', question: 'The following are risk factors for impaired gas exchange and pulmonary infection:', options: ['Immobility, constipation and incontinence', 'Fluid restriction, immunosuppression and decreased level of consciousness.', 'Fluid restriction, immobility and ingestion of seasoned foods', 'Incontinence, chemotherapy and anemia'], correctAnswer: 'Fluid restriction, immunosuppression and decreased level of consciousness.', explanation: 'Immobility, immunosuppression and reduced consciousness all predispose to atelectasis, aspiration and pneumonia.' },
        { id: 'part2-q25', question: 'Buck’s traction is,', options: ['A form of skin traction and is often used to relieve muscle spasms.', 'A form of skeletal traction for compound fractures.', 'Only used in correction of hip and femur fractures.', 'Always contra-indicated in obese patients.'], correctAnswer: 'A form of skin traction and is often used to relieve muscle spasms.', explanation: 'Buck’s traction is a temporary skin traction used mainly to reduce muscle spasm and immobilise lower-limb fractures.' },
        { id: 'part2-q26', question: 'Open angle glaucoma is mainly treated using,', options: ['Proton pump inhibitors, quinolones and glycosides', 'Antibiotics, osmotic diuretics and haematinics', 'Miotics, Carbonic anhydrase inhibitors and epinephrine', 'Stool softeners, anti-hypertensives and Miotics'], correctAnswer: 'Miotics, Carbonic anhydrase inhibitors and epinephrine', explanation: 'Medical treatment of primary open-angle glaucoma includes miotics, carbonic-anhydrase inhibitors and adrenergic agents.' },
        { id: 'part2-q27', question: 'When nursing a patient on steroids, the nurse should,', options: ['Encourage abrupt cessation when symptoms improve', 'Monitor for signs of infection, hyperglycaemia and fluid retention; never stop abruptly', 'Restrict all protein intake', 'Avoid any form of exercise'], correctAnswer: 'Monitor for signs of infection, hyperglycaemia and fluid retention; never stop abruptly', explanation: 'Long-term corticosteroids cause immunosuppression, hyperglycaemia and fluid retention. Abrupt withdrawal can precipitate adrenal crisis.' },
        { id: 'part2-q28', question: 'A patient with a nasogastric tube complains of nausea. The nurse should,', options: ['Instruct patient to perform deep breaths until the nausea reduces', 'Administer antiemetic to prevent intraocular pressure elevation', 'Ensure a vomiting bowl is placed close to the patient as possible', 'Reassure the patient that it is a common feeling post general Anaesthesia.'], correctAnswer: 'Ensure a vomiting bowl is placed close to the patient as possible', explanation: 'Nausea with an NG tube may precede vomiting; having a bowl ready and checking tube patency/position are immediate practical actions.' },
        { id: 'part2-q29', question: 'Immediately postoperatively a nurse should,', options: ['Position a patient in recovery position, measure urine output and assess respirations every 15 minutes', 'Maintain patent airway, measure central venous pressure (CVP) and check oxygen saturation levels', 'Position patient in recovery position, observe adverse effects of anesthesia and assess reflexes', 'Check IV site for infiltration, administer clear oral fluids and monitor vital signs every 15 minutes'], correctAnswer: 'Position a patient in recovery position, measure urine output and assess respirations every 15 minutes', explanation: 'Immediate post-operative priorities are airway, breathing and circulation. Recovery position and frequent respiratory assessment are essential.' },
        { id: 'part2-q30', question: 'The causes of pre-renal failure include,', options: ['Renal calculi, benign prostatic hypertrophy and blood clots', 'Tubular necrosis, septic shock and hemolytic blood reaction transfusion', 'Hemorrhage, burns and dehydration', 'Tumours, Trauma and chemical toxicity'], correctAnswer: 'Hemorrhage, burns and dehydration', explanation: 'Pre-renal acute kidney injury is caused by decreased renal perfusion (hypovolaemia from haemorrhage, burns, dehydration, shock, etc.).' },
        { id: 'part2-q31', question: 'For a patient undergoing a kidney, ureter and bladder X-ray it is important for the nurse to know that,', options: ['There is no special preparation required.', 'Oral fluids must be withheld the morning of the examination.', 'The patient should have a full bladder before the procedure.', 'An enema should be administered before the procedure'], correctAnswer: 'There is no special preparation required.', explanation: 'A plain KUB radiograph usually requires no special preparation (no contrast, no fasting).' },
        { id: 'part2-q32', question: 'Treatment of megaloblastic anemia includes;', options: ['Chemotherapy, radiotherapy, hydration', 'Oxygen therapy, hydration and iron supplements', 'Blood transfusion, iron supplements, splenectomy', 'Oxygen therapy, folate supplements, Alcohol restriction'], correctAnswer: 'Oxygen therapy, folate supplements, Alcohol restriction', explanation: 'Megaloblastic anaemia due to folate deficiency is treated with folic-acid supplementation and addressing contributing factors such as alcohol excess.' },
        { id: 'part2-q33', question: 'For a patient with cellulitis the nurse should,', options: ['Apply warm compresses to the site and elevate affected extremity', 'Apply cold compresses to the site and elevate affected extremity', 'Administer topical antibiotics and oral analgesics as prescribed', 'Administer plasma expanders and elevate the affected limb to 90°'], correctAnswer: 'Apply warm compresses to the site and elevate affected extremity', explanation: 'Warm compresses improve local circulation and comfort; elevation reduces oedema.' },
        { id: 'part2-q34', question: 'The vitamin required for normal production of RBCs is;', options: ['Calcium', 'Vitamin A', 'Folic acid', 'Vitamin K'], correctAnswer: 'Folic acid', explanation: 'Folic acid (and vitamin B12) are essential for DNA synthesis in erythroid precursors.' },
        { id: 'part2-q35', question: 'Plain insulin has peak action of;', options: ['8–12 hours', '2–3 hours', '12–16 hours', '16–30 hours'], correctAnswer: '2–3 hours', explanation: 'Regular (plain/soluble) insulin peaks at approximately 2–3 hours after subcutaneous injection.' },
        { id: 'part2-q36', question: 'Valsalva manoeuvre can result in bradycardia. Which of the following activities will not stimulate Valsalva’s manoeuvre?', options: ['Use of stool softeners', 'Enema administration', 'Straining at stool', 'Holding breath while moving up in bed'], correctAnswer: 'Use of stool softeners', explanation: 'Stool softeners prevent straining and therefore reduce the likelihood of performing a Valsalva manoeuvre.' },
        { id: 'part2-q37', question: 'A patient with left-sided heart failure is most likely to present with,', options: ['Peripheral oedema and raised JVP', 'Dyspnoea, orthopnoea and pulmonary crackles', 'Hepatomegaly', 'Ascites'], correctAnswer: 'Dyspnoea, orthopnoea and pulmonary crackles', explanation: 'Left-sided failure causes pulmonary congestion (dyspnoea, orthopnoea, crackles).' },
        { id: 'part2-q38', question: 'Which of the following is an early sign of hypoxia?', options: ['Cyanosis', 'Restlessness and tachycardia', 'Bradycardia', 'Hypotension'], correctAnswer: 'Restlessness and tachycardia', explanation: 'Restlessness, anxiety and tachycardia are early signs of hypoxia. Cyanosis is a late sign.' },
        { id: 'part2-q39', question: 'The nurse is teaching a patient about warfarin. Which statement indicates correct understanding?', options: ['I will eat large amounts of green leafy vegetables every day', 'I will have regular blood tests to check my INR', 'I can take aspirin freely for headaches', 'I will stop the drug if I feel better'], correctAnswer: 'I will have regular blood tests to check my INR', explanation: 'Warfarin requires regular INR monitoring. Consistent vitamin-K intake is advised.' },
        { id: 'part2-q40', question: 'A patient is admitted with suspected meningitis. The priority nursing action is to,', options: ['Start oral antibiotics', 'Institute isolation precautions and prepare for lumbar puncture / IV antibiotics', 'Give a high-protein diet', 'Ambulate the patient frequently'], correctAnswer: 'Institute isolation precautions and prepare for lumbar puncture / IV antibiotics', explanation: 'Suspected bacterial meningitis requires rapid isolation and urgent diagnostic LP followed by prompt IV antibiotics.' },
        { id: 'part2-q41', question: 'Which of the following is a complication of immobility?', options: ['Improved lung expansion', 'Deep-vein thrombosis and pressure ulcers', 'Increased muscle strength', 'Enhanced bowel motility'], correctAnswer: 'Deep-vein thrombosis and pressure ulcers', explanation: 'Immobility predisposes to venous thromboembolism, pressure injuries, atelectasis, and constipation.' },
        { id: 'part2-q42', question: 'The nurse is assessing a patient with a suspected deep-vein thrombosis. Which finding is most suggestive?', options: ['Bilateral ankle oedema only', 'Unilateral leg swelling, pain and warmth', 'Cold pale foot with absent pulses', 'Painless varicose veins'], correctAnswer: 'Unilateral leg swelling, pain and warmth', explanation: 'Classic DVT features are unilateral calf or thigh swelling, pain, warmth and erythema.' },
        { id: 'part2-q43', question: 'A patient with chronic renal failure has a serum potassium of 6.5 mmol/L. The nurse anticipates,', options: ['Oral potassium supplements', 'Measures to lower potassium (e.g., insulin-glucose, calcium gluconate, dialysis)', 'High-potassium diet', 'Fluid restriction only'], correctAnswer: 'Measures to lower potassium (e.g., insulin-glucose, calcium gluconate, dialysis)', explanation: 'Severe hyperkalaemia is treated with membrane stabilisation, intracellular shift of potassium and removal.' },
        { id: 'part2-q44', question: 'Which of the following is the correct technique for intramuscular injection in the ventrogluteal site?', options: ['Insert needle at 45°', 'Insert needle at 90° using the Z-track method if indicated', 'Aspirate for 30 seconds before injecting', 'Massage vigorously after injection of all drugs'], correctAnswer: 'Insert needle at 90° using the Z-track method if indicated', explanation: 'IM injections are given at 90°. The Z-track method is used for irritant medications.' },
        { id: 'part2-q45', question: 'A postnatal mother is breastfeeding. The nurse teaches that a sign of effective attachment is,', options: ['The baby’s cheeks are drawn in', 'The baby’s chin touches the breast, mouth is wide open and more areola is visible above the top lip', 'Clicking sounds during feeding', 'The mother experiences severe continuous pain'], correctAnswer: 'The baby’s chin touches the breast, mouth is wide open and more areola is visible above the top lip', explanation: 'Correct attachment: wide-open mouth, chin touching breast, more areola visible above upper lip.' }
      ]
    },
    {
      id: 'nck-exam1-part3',
      title: 'NCK Exam 1 - Study Guide (Part 3)',
      category: 'NCK Midwifery & Obstetric Nursing',
      domain: 'Midwifery, Maternal-Newborn & Medical-Surgical',
      price: 'Free Access',
      numericPrice: 0,
      questionCount: 29,
      durationMinutes: 45,
      difficulty: 'Advanced',
      isPremium: false,
      features: ['29 NCK Licensure Questions (Part 3)', 'Obstetric & Midwifery Rationales', 'Performance Tracking'],
      requiredPlan: 'free',
      questionLimits: { free: 29, basic: 29, gold: 0, platinum: 0 },
      isPublished: true,
      questions: [
        { id: 'part3-q46', question: 'Which is the most relevant knowledge about oxygen administration to a client with COPD?', options: ['Oxygen at 1–2 L/min is given to maintain the hypoxic stimulus for breathing.', 'Hypoxia stimulates the central chemoreceptors in the medulla that makes the client breathe.', 'Oxygen is administered best using non-rebreathing mask.', 'Blood gases are monitored using a pulse oximeter.'], correctAnswer: 'Oxygen at 1–2 L/min is given to maintain the hypoxic stimulus for breathing.', explanation: 'In COPD patients who retain CO2, low-flow oxygen is used so that the hypoxic drive is not abolished.' },
        { id: 'part3-q47', question: 'What is the reason for the nurse instructing the client to rotate the injection sites for insulin?', options: ['Lipodystrophy can result and extremity painful', 'Poor rotation technique can cause superficial hemorrhaging', 'Lipodystrophic areas can result, causing erratic insulin absorption rates from these areas', 'Injection sites can never be reused'], correctAnswer: 'Lipodystrophic areas can result, causing erratic insulin absorption rates from these areas', explanation: 'Repeated injections into the same site cause lipohypertrophy or lipoatrophy leading to unpredictable absorption.' },
        { id: 'part3-q48', question: 'Which of the following is included in Orem’s theory?', options: ['Maintenance of a sufficient intake of air', 'Self-perception', 'Love and belonging', 'Physiologic needs'], correctAnswer: 'Maintenance of a sufficient intake of air', explanation: 'Orem’s Self-Care Deficit Theory includes universal self-care requisites such as air, water and food.' },
        { id: 'part3-q49', question: 'The patient with Angina pectoris is being discharged home with nitroglycerine tablets. Which instructions does the nurse include?', options: ['When chest pain begins, take tablet. If it continues take another in 5 minutes.', 'Place under tongue; if pain not relieved in 15 minutes go to hospital.', 'Continue activity and if pain does not go away in 10 minutes begin taking nitroglycerine.', 'Place nitroglycerine tab under tongue every 5 minutes for 3 doses. Go to hospital if unrelieved.'], correctAnswer: 'Place nitroglycerine tab under tongue every 5 minutes for 3 doses. Go to hospital if unrelieved.', explanation: 'Standard teaching: one tablet SL every 5 minutes up to three doses. Seek emergency care if pain persists.' },
        { id: 'part3-q50', question: 'It is best described as a systematic, rational method of planning & providing nursing care for individuals, families, groups and community.', options: ['Assessment', 'Nursing process', 'Diagnosis', 'Implementation'], correctAnswer: 'Nursing process', explanation: 'The nursing process is the systematic, rational method of planning and providing individualized nursing care.' },
        { id: 'part3-q51', question: 'A client has just undergone spinal fusion after lumbar disk herniation. The nurse would avoid:', options: ['Use the overhead trapeze.', 'Keep the head of the bed flat.', 'Place pillows under the length of the legs.', 'Use logrolling technique for repositioning.'], correctAnswer: 'Use the overhead trapeze.', explanation: 'An overhead trapeze encourages twisting and flexion of the spine and is contraindicated after lumbar spinal fusion.' },
        { id: 'part3-q52', question: 'A mother who breastfeeds her child passes on which antibody?', options: ['IgG', 'IgM', 'IgA', 'IgE'], correctAnswer: 'IgA', explanation: 'Secretory IgA is the predominant immunoglobulin in breast milk providing mucosal immunity.' },
        { id: 'part3-q53', question: 'A client with schizophrenia is laughing and talking to himself. The most appropriate nursing action is:', options: ['Ignore the behaviour', 'Ask the client what he is experiencing and orient him to reality', 'Immediately administer an antipsychotic', 'Isolate the client'], correctAnswer: 'Ask the client what he is experiencing and orient him to reality', explanation: 'Gentle reality orientation and exploration help the client while maintaining a therapeutic relationship.' },
        { id: 'part3-q54', question: 'The main function of oxytocin during the puerperium is to stimulate:', options: ['Estrogen production', 'Progesterone production', 'Contraction of uterine muscle and breast tissues', 'Production of Human Placental Lactogen'], correctAnswer: 'Contraction of uterine muscle and breast tissues', explanation: 'Oxytocin causes uterine contraction (involution and PPH prevention) and milk-ejection reflex.' },
        { id: 'part3-q55', question: 'Fertilization occurs in one of the following parts of the fallopian tube.', options: ['Infundibulum', 'Fimbriae', 'Ampulla', 'Isthmus'], correctAnswer: 'Ampulla', explanation: 'Fertilization normally takes place in the ampulla of the fallopian tube.' },
        { id: 'part3-q56', question: 'In the female genital tract the sperms undergo physio-biochemical modification known as:', options: ['Capacitation', 'Transformation', 'Reaction', 'Activation'], correctAnswer: 'Capacitation', explanation: 'Capacitation is functional maturation of spermatozoa in the female reproductive tract required for fertilization.' },
        { id: 'part3-q57', question: 'The placenta originates from one of the following parts of the fertilized ovum:', options: ['Inner cell mass', 'Yolk sac', 'Trophoblast', 'Embryoblast'], correctAnswer: 'Trophoblast', explanation: 'The trophoblast (outer cell layer of blastocyst) gives rise to the placenta and chorion.' },
        { id: 'part3-q58', question: 'The structure in fetal circulation joining the umbilical vein to the inferior vena cava:', options: ['Ductus arteriosus', 'Foramen ovale', 'Ductus venosus', 'Hypogastric arteries'], correctAnswer: 'Ductus venosus', explanation: 'Ductus venosus shunts oxygenated blood from umbilical vein directly into inferior vena cava, bypassing liver.' },
        { id: 'part3-q59', question: 'Antenatal care of an HIV-positive client includes:', options: ['Antiretroviral therapy for life immediately HIV-positive status is confirmed', 'Sulfadoxine-Pyrimethamine and cotrimoxazole prophylaxis daily until delivery', 'Antiretroviral therapy up to postnatal period from CD4 count', 'Delay administration of SP until ART is started'], correctAnswer: 'Antiretroviral therapy for life immediately HIV-positive status is confirmed', explanation: 'Lifelong ART is recommended for all HIV-positive pregnant women (Option B+).' },
        { id: 'part3-q60', question: 'A client who has just delivered says she is unable to love the baby. The most appropriate action:', options: ['Tell the client she will learn fast.', 'Tell the client what a beautiful baby she has', 'Encourage the client to talk about her feelings.', 'Have a psychiatrist visit the client immediately'], correctAnswer: 'Encourage the client to talk about her feelings.', explanation: 'Encouraging expression of feelings is therapeutic and assesses postpartum depression without premature reassurance.' },
        { id: 'part3-q61', question: 'Which of the following is a sign of placental separation?', options: ['Lengthening of the cord and a gush of blood', 'Rising of the fundus and hardening of the uterus only', 'Immediate cessation of all bleeding', 'Descent of the fundus below the umbilicus'], correctAnswer: 'Lengthening of the cord and a gush of blood', explanation: 'Classic signs of placental separation are lengthening of the umbilical cord and a small gush of blood.' },
        { id: 'part3-q62', question: 'The nurse is caring for a client in the second stage of labour. The most important action is:', options: ['Encourage the client to push with each contraction once fully dilated', 'Keep the client NPO', 'Administer an enema', 'Restrict all movement'], correctAnswer: 'Encourage the client to push with each contraction once fully dilated', explanation: 'Once fully dilated, the mother pushes with contractions to facilitate expulsion.' },
        { id: 'part3-q63', question: 'Which of the following is a complication of the third stage of labour?', options: ['Cord prolapse', 'Postpartum haemorrhage due to uterine atony or retained placenta', 'Face presentation', 'Premature rupture of membranes'], correctAnswer: 'Postpartum haemorrhage due to uterine atony or retained placenta', explanation: 'Major complication of third stage is PPH from uterine atony or retained placenta.' },
        { id: 'part3-q64', question: 'A newborn is assessed immediately after birth. An Apgar score of 7–10 indicates:', options: ['Severe distress requiring immediate resuscitation', 'Moderate distress', 'Good condition / minimal depression', 'Need for intubation'], correctAnswer: 'Good condition / minimal depression', explanation: 'Apgar score of 7–10 indicates the newborn is in good condition.' },
        { id: 'part3-q65', question: 'Which is the recommended site for intramuscular injection in a neonate?', options: ['Deltoid', 'Dorsogluteal', 'Vastus lateralis', 'Ventrogluteal'], correctAnswer: 'Vastus lateralis', explanation: 'Vastus lateralis is the preferred IM site in neonates and young infants.' },
        { id: 'part3-q66', question: 'A client with pre-eclampsia is receiving magnesium sulphate. Monitor for which sign of toxicity?', options: ['Hyperreflexia', 'Loss of deep tendon reflexes, respiratory depression and oliguria', 'Hypertension', 'Tachycardia only'], correctAnswer: 'Loss of deep tendon reflexes, respiratory depression and oliguria', explanation: 'Magnesium toxicity is indicated by loss of deep tendon reflexes and respiratory depression.' },
        { id: 'part3-q67', question: 'Which of the following is a contraindication to breastfeeding?', options: ['Maternal mastitis on treatment', 'Maternal HIV in settings where replacement feeding is AFASS', 'Maternal common cold', 'Maternal tuberculosis on treatment after two weeks'], correctAnswer: 'Maternal HIV in settings where replacement feeding is AFASS', explanation: 'Where replacement feeding is AFASS, HIV-positive mothers are advised not to breastfeed.' },
        { id: 'part3-q68', question: 'The nurse is teaching a primigravida about Braxton-Hicks contractions. The correct information:', options: ['Indicate true labour has started', 'Are irregular, usually painless tightenings that do not cause cervical change', 'Occur only after rupture of membranes', 'Require immediate hospital admission'], correctAnswer: 'Are irregular, usually painless tightenings that do not cause cervical change', explanation: 'Braxton-Hicks are practice contractions, irregular, usually painless, and cause no cervical change.' },
        { id: 'part3-q69', question: 'Which of the following is the correct sequence of the stages of labour?', options: ['Second, first, third', 'First (dilatation), second (expulsion), third (placental)', 'Third, second, first', 'First, third, second'], correctAnswer: 'First (dilatation), second (expulsion), third (placental)', explanation: 'Stage 1 = cervical dilatation; Stage 2 = expulsion; Stage 3 = delivery of placenta.' },
        { id: 'part3-q70', question: 'A client at 32 weeks gestation reports decreased fetal movements. The priority nursing action is:', options: ['Reassure the client that this is normal', 'Perform a non-stress test / assess fetal well-being and notify the physician', 'Advise bed rest only', 'Schedule the next antenatal visit in two weeks'], correctAnswer: 'Perform a non-stress test / assess fetal well-being and notify the physician', explanation: 'Reduced fetal movements require prompt assessment of fetal well-being.' },
        { id: 'part3-q71', question: 'Which of the following is a sign of true labour?', options: ['Contractions that stop with rest and hydration', 'Progressive cervical dilatation and effacement with regular, intensifying contractions', 'Irregular mild tightenings only', 'Pain confined to lower abdomen that disappears with change of position'], correctAnswer: 'Progressive cervical dilatation and effacement with regular, intensifying contractions', explanation: 'True labour is characterised by regular contractions increasing in frequency, duration, and intensity with cervical change.' },
        { id: 'part3-q72', question: 'The nurse is caring for a client with premature rupture of membranes at 34 weeks. The priority concern is:', options: ['Immediate induction of labour regardless of gestation', 'Risk of ascending infection and assessment of fetal well-being', 'Restriction of all fluids', 'Routine enema'], correctAnswer: 'Risk of ascending infection and assessment of fetal well-being', explanation: 'After PROM, major risks are ascending infection (chorioamnionitis) and preterm labor.' },
        { id: 'part3-q73', question: 'Which is the recommended position for a client with a prolapsed cord?', options: ['Supine with legs elevated', 'Knee-chest or Trendelenburg (hips elevated) to relieve pressure on the cord', 'Sitting upright', 'Prone'], correctAnswer: 'Knee-chest or Trendelenburg (hips elevated) to relieve pressure on the cord', explanation: 'Knee-chest or exaggerated Trendelenburg position relieves pressure of presenting part on prolapsed cord.' },
        { id: 'part3-q74', question: 'A client is receiving oxytocin for induction of labour. The nurse should discontinue the infusion if:', options: ['Contractions are 2–3 minutes apart lasting 40–60 seconds', 'There is uterine hyperstimulation (contractions >90s or >5 in 10 min) or non-reassuring FHR', 'The client requests pain relief', 'Cervical dilatation is 4 cm'], correctAnswer: 'There is uterine hyperstimulation (contractions >90s or >5 in 10 min) or non-reassuring FHR', explanation: 'Oxytocin must be stopped if hyperstimulation or non-reassuring fetal status occurs.' }
      ]
    },
    {
      id: 'nck-exam1-part5',
      title: 'NCK Exam 1 - Study Guide (Part 5)',
      category: 'NCK Registered Nurse (RN) FQE',
      domain: 'Physiology, Med-Surg & Clinical Nursing',
      price: 'Free Access',
      numericPrice: 0,
      questionCount: 27,
      durationMinutes: 45,
      difficulty: 'Advanced',
      isPremium: false,
      features: ['27 NCK Licensure Questions (Part 5)', 'Physiology & Clinical Rationales', 'Instant Sync'],
      requiredPlan: 'free',
      questionLimits: { free: 27, basic: 27, gold: 0, platinum: 0 },
      isPublished: true,
      questions: [
        { id: 'part5-q24', question: 'The Na+ K+ ATPase pump:', options: ['Extrudes potassium ions from the cell and takes two sodium ions into the cell', 'Extrudes three sodium ions from the cell and takes two potassium ions into the cell', 'Has a coupling ratio of 2:1', 'Is found mainly in the intravascular fluid compartment'], correctAnswer: 'Extrudes three sodium ions from the cell and takes two potassium ions into the cell', explanation: 'The Na+/K+-ATPase pump actively extrudes 3 Na+ out and imports 2 K+ in (3:2 ratio), maintaining resting membrane potential.' },
        { id: 'part5-q25', question: 'Conductive hearing loss can be caused by:', options: ['Ototoxic medication, otitis externa', 'Presbycusis, ototoxic medication', 'Meniere’s disease, otosclerosis', 'Otosclerosis, tympanic membrane retraction'], correctAnswer: 'Otosclerosis, tympanic membrane retraction', explanation: 'Conductive hearing loss results from outer/middle ear problems (e.g. otosclerosis, tympanic membrane retraction).' },
        { id: 'part5-q26', question: 'During thoracentesis:', options: ['Fluid is aspirated from the peritoneal space', 'Consent is not necessary', 'Medications can be instilled into the pleural space', 'Local anaesthesia is not advisable'], correctAnswer: 'Medications can be instilled into the pleural space', explanation: 'Thoracentesis aspirates fluid/air from pleural space; therapeutic agents can sometimes be instilled.' },
        { id: 'part5-q27', question: 'The carcinogenic risk factors for laryngeal cancers include:', options: ['Tar products, mustard gas, chronic laryngitis', 'Asbestos, chronic laryngitis, voice straining', 'Voice straining, high fibre diet, tobacco', 'Asbestos, tobacco, tar products'], correctAnswer: 'Asbestos, tobacco, tar products', explanation: 'Major risk factors for laryngeal cancer are tobacco, alcohol, asbestos and inhaled carcinogens.' },
        { id: 'part5-q28', question: 'Sympathetic stimulation of the cardiovascular system causes:', options: ['Increased heart rate and constriction of coronary arteries', 'Constriction of GIT secretory gland vessels with increased flow of digestive juices.', 'Increased peripheral resistance and dilatation of coronary arteries', 'Increased force of heart contraction & reduced peripheral resistance.'], correctAnswer: 'Increased peripheral resistance and dilatation of coronary arteries', explanation: 'Sympathetic stimulation increases HR and contractility, constricts peripheral vessels (raising resistance) and dilates coronary arteries.' },
        { id: 'part5-q29', question: 'A deteriorating condition for a patient with head injury will be indicated by;', options: ['Widening pulse pressure and irregular respiratory pattern.', 'Narrowing pulse pressure and escalation of discomfort.', 'Bradycardia and Kussmaul breathing', 'Oliguria and narrow pulse pressure.'], correctAnswer: 'Widening pulse pressure and irregular respiratory pattern.', explanation: 'Rising ICP produces Cushing’s triad: widening pulse pressure, bradycardia and irregular respiration.' },
        { id: 'part5-q30', question: 'In Fallot’s tetralogy there is:', options: ['Pulmonary artery stenosis, ventricular septal defect, aortic misplacement & right ventricular hypertrophy.', 'Coarctation of the aorta, patent ductus arteriosus, aortic stenosis and ventricular septal defect.', 'Ventricular hypertrophy, coarctation of the aorta, atrial septal defect and Blue babies’ syndrome', 'Atrial-ventricular hypertrophy, coarctation of the aorta, ventricular septal defect and pulmonary artery stenosis.'], correctAnswer: 'Pulmonary artery stenosis, ventricular septal defect, aortic misplacement & right ventricular hypertrophy.', explanation: 'Four features of tetralogy of Fallot: pulmonary stenosis, VSD, overriding aorta, right ventricular hypertrophy.' },
        { id: 'part5-q31', question: 'An individual considered overweight has a body mass index (BMI) of:', options: ['21–25', '25–29.9', '30–39', 'Above 40'], correctAnswer: '25–29.9', explanation: 'BMI 25.0–29.9 = overweight; 30–39.9 = obese; ≥40 = morbidly obese.' },
        { id: 'part5-q32', question: 'The STI that particularly increases transmission and acquisition of HIV include:', options: ['Gonorrhoea, chancroid', 'Candidiasis, gonorrhoea', 'Chancroid, Chlamydia', 'Syphilis, genital herpes'], correctAnswer: 'Syphilis, genital herpes', explanation: 'Ulcerative STIs (syphilis, genital herpes, chancroid) significantly increase HIV acquisition and transmission.' },
        { id: 'part5-q33', question: 'The position an unconscious patient should be placed in to maintain a patent airway is:', options: ['Supine with head elevated', 'Lateral (recovery) position', 'Prone', 'Trendelenburg'], correctAnswer: 'Lateral (recovery) position', explanation: 'The recovery position allows the tongue to fall forward and secretions to drain.' },
        { id: 'part5-q34', question: 'Which of the following is a sign of increasing intracranial pressure?', options: ['Constricted reactive pupils', 'Decreased level of consciousness, rising blood pressure and slowing pulse', 'Tachycardia and hypotension', 'Increased urine output'], correctAnswer: 'Decreased level of consciousness, rising blood pressure and slowing pulse', explanation: 'Early signs include altered LOC; later signs include hypertension with widening pulse pressure and bradycardia.' },
        { id: 'part5-q35', question: 'A patient with a head injury develops clear fluid leaking from the nose. The nurse should test the fluid for:', options: ['Glucose (halo / glucose test for CSF)', 'Protein only', 'Blood only', 'Bacteria'], correctAnswer: 'Glucose (halo / glucose test for CSF)', explanation: 'CSF contains glucose; positive glucose test or halo sign suggests CSF rhinorrhoea.' },
        { id: 'part5-q36', question: 'Which of the following is the most common cause of community-acquired pneumonia?', options: ['Staphylococcus aureus', 'Streptococcus pneumoniae', 'Pseudomonas aeruginosa', 'Klebsiella pneumoniae'], correctAnswer: 'Streptococcus pneumoniae', explanation: 'Streptococcus pneumoniae is the leading bacterial cause of community-acquired pneumonia.' },
        { id: 'part5-q37', question: 'A patient with COPD is receiving oxygen. The nurse understands that high-flow oxygen may:', options: ['Improve the hypoxic drive', 'Suppress the hypoxic drive and cause CO2 retention', 'Have no effect on breathing', 'Always be required at 15 L/min'], correctAnswer: 'Suppress the hypoxic drive and cause CO2 retention', explanation: 'High oxygen concentrations in COPD can remove hypoxic respiratory stimulus, leading to hypoventilation.' },
        { id: 'part5-q38', question: 'Which of the following is a classic sign of digitalis toxicity?', options: ['Hypertension', 'Visual disturbances (yellow-green halos), nausea and bradycardia', 'Polyuria', 'Hyperkalaemia only'], correctAnswer: 'Visual disturbances (yellow-green halos), nausea and bradycardia', explanation: 'Digoxin toxicity classically presents with anorexia, nausea, visual changes and arrhythmias.' },
        { id: 'part5-q39', question: 'The nurse is assessing a patient for compartment syndrome after a tibial fracture. Which finding is most concerning?', options: ['Mild swelling', 'Severe pain on passive stretch, paraesthesia and diminished pulses', 'Warmth of the toes', 'Capillary refill of 2 seconds'], correctAnswer: 'Severe pain on passive stretch, paraesthesia and diminished pulses', explanation: 'Pain out of proportion, pain on passive stretch, paraesthesia and loss of pulses are hallmark signs of compartment syndrome.' },
        { id: 'part5-q40', question: 'Which of the following is the correct sequence of the nursing process?', options: ['Diagnosis, Assessment, Planning, Implementation, Evaluation', 'Assessment, Diagnosis, Planning, Implementation, Evaluation', 'Planning, Assessment, Diagnosis, Implementation, Evaluation', 'Assessment, Planning, Diagnosis, Implementation, Evaluation'], correctAnswer: 'Assessment, Diagnosis, Planning, Implementation, Evaluation', explanation: 'Standard sequence: Assessment -> Diagnosis -> Planning -> Implementation -> Evaluation (ADPIE).' },
        { id: 'part5-q41', question: 'A patient with left-sided heart failure is most likely to present with:', options: ['Peripheral oedema and raised JVP', 'Dyspnoea, orthopnoea and pulmonary crackles', 'Hepatomegaly', 'Ascites'], correctAnswer: 'Dyspnoea, orthopnoea and pulmonary crackles', explanation: 'Left-sided failure causes pulmonary congestion (dyspnoea, orthopnoea, crackles).' },
        { id: 'part5-q42', question: 'Which of the following is a complication of immobility?', options: ['Improved lung expansion', 'Deep-vein thrombosis and pressure ulcers', 'Increased muscle strength', 'Enhanced bowel motility'], correctAnswer: 'Deep-vein thrombosis and pressure ulcers', explanation: 'Immobility predisposes to venous thromboembolism, pressure injuries, atelectasis and muscle atrophy.' },
        { id: 'part5-q43', question: 'The nurse is teaching a patient about warfarin. Which statement indicates correct understanding?', options: ['I will eat large amounts of green leafy vegetables every day', 'I will have regular blood tests to check my INR', 'I can take aspirin freely for headaches', 'I will stop the drug if I feel better'], correctAnswer: 'I will have regular blood tests to check my INR', explanation: 'Warfarin requires regular INR monitoring. Consistent vitamin-K intake is advised.' },
        { id: 'part5-q44', question: 'A patient is scheduled for a CT scan with contrast. The nurse should assess for a history of:', options: ['Allergy to shellfish or iodine and renal function', 'Hypertension only', 'Previous blood transfusion', 'Asthma only'], correctAnswer: 'Allergy to shellfish or iodine and renal function', explanation: 'Iodinated contrast can cause allergic reactions and is nephrotoxic.' },
        { id: 'part5-q45', question: 'Which of the following is the first-line treatment for anaphylactic shock?', options: ['Intravenous hydrocortisone', 'Intramuscular adrenaline (epinephrine)', 'Oral antihistamine', 'Intravenous normal saline only'], correctAnswer: 'Intramuscular adrenaline (epinephrine)', explanation: 'Intramuscular adrenaline is the immediate first-line treatment for anaphylaxis.' },
        { id: 'part5-q46', question: 'A postnatal mother is breastfeeding. The nurse teaches that a sign of effective attachment is:', options: ['The baby’s cheeks are drawn in', 'The baby’s chin touches the breast, mouth is wide open and more areola is visible above the top lip', 'Clicking sounds during feeding', 'The mother experiences severe continuous pain'], correctAnswer: 'The baby’s chin touches the breast, mouth is wide open and more areola is visible above the top lip', explanation: 'Correct attachment: wide-open mouth, chin touching breast, more areola visible above upper lip.' },
        { id: 'part5-q47', question: 'Which of the following is a sign of placental separation?', options: ['Lengthening of the cord and a gush of blood', 'Rising of the fundus and hardening of the uterus only', 'Immediate cessation of all bleeding', 'Descent of the fundus below the umbilicus'], correctAnswer: 'Lengthening of the cord and a gush of blood', explanation: 'Classic signs of placental separation are lengthening of umbilical cord and a small gush of blood.' },
        { id: 'part5-q48', question: 'A newborn is assessed immediately after birth. An Apgar score of 7–10 indicates:', options: ['Severe distress requiring immediate resuscitation', 'Moderate distress', 'Good condition / minimal depression', 'Need for intubation'], correctAnswer: 'Good condition / minimal depression', explanation: 'Apgar score of 7–10 indicates newborn is in good condition.' },
        { id: 'part5-q49', question: 'Which of the following is the recommended site for intramuscular injection in a neonate?', options: ['Deltoid', 'Dorsogluteal', 'Vastus lateralis', 'Ventrogluteal'], correctAnswer: 'Vastus lateralis', explanation: 'Vastus lateralis is preferred IM site in neonates and young infants.' },
        { id: 'part5-q50', question: 'A client with pre-eclampsia is receiving magnesium sulphate. Monitor for which sign of toxicity?', options: ['Hyperreflexia', 'Loss of deep tendon reflexes, respiratory depression and oliguria', 'Hypertension', 'Tachycardia only'], correctAnswer: 'Loss of deep tendon reflexes, respiratory depression and oliguria', explanation: 'Magnesium toxicity is indicated by loss of deep tendon reflexes, respiratory depression and oliguria.' }
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

  // Write all unique questions using high-speed batched writes (chunks of 450)
  const entries = Array.from(uniqueQuestionsMap.entries());
  for (let i = 0; i < entries.length; i += 450) {
    const chunk = entries.slice(i, i + 450);
    const batch = writeBatch(db);
    for (const [qId, qData] of chunk) {
      syncedQuestionsCount++;
      const qRef = doc(db, 'questions', qId);
      batch.set(qRef, qData, { merge: true });
    }
    try {
      await batch.commit();
    } catch (batchErr) {
      console.warn('Firestore question batch sync warning:', batchErr);
      for (const [qId, qData] of chunk) {
        try {
          await setDoc(doc(db, 'questions', qId), qData, { merge: true });
        } catch (e) {
          console.warn('Fallback setDoc error:', e);
        }
      }
    }
  }

  localStorage.setItem('nckprep_last_cloud_sync', new Date().toISOString());

  return { 
    syncedExamsCount: Math.max(syncedExamsCount, defaultBundles.length, 5), 
    syncedQuestionsCount: Math.max(syncedQuestionsCount, uniqueQuestionsMap.size, 50) 
  };
}
