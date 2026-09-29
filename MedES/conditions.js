/* ==========================================================================
   data/conditions.js — ALL medical content lives here (and only here).
   Every entry was written from the NHS page named in its `source` field.
   To add a condition: copy an entry, fill it from the NHS page, add its
   source. Do not add text from any non-NHS site.
   ========================================================================== */
const NHS = "https://www.nhs.uk/conditions/";

// Canonical symptom vocabulary (chips). `group` decides which category shows it.
const SYMPTOMS = [
  { id: "fever", label: "High temperature / fever", group: ["general","respiratory"] },
  { id: "tired", label: "Tired or exhausted", group: ["general","respiratory"] },
  { id: "aching", label: "Aching body", group: ["general","respiratory"] },
  { id: "loss of appetite", label: "Loss of appetite", group: ["general"] },
  { id: "difficulty sleeping", label: "Difficulty sleeping", group: ["general"] },
  { id: "nausea", label: "Feeling sick", group: ["general","head"] },
  { id: "cough", label: "Cough", group: ["respiratory"] },
  { id: "sore throat", label: "Sore throat", group: ["respiratory"] },
  { id: "shortness of breath", label: "Shortness of breath", group: ["respiratory"] },
  { id: "runny nose", label: "Blocked or runny nose", group: ["respiratory"] },
  { id: "loss of smell or taste", label: "Loss of smell or taste", group: ["respiratory"] },
  { id: "diarrhoea", label: "Diarrhoea", group: ["general"] },
  { id: "burning urination", label: "Pain or burning when peeing", group: ["urinary"] },
  { id: "frequent urination", label: "Needing to pee more often", group: ["urinary"] },
  { id: "cloudy urine", label: "Cloudy pee", group: ["urinary"] },
  { id: "blood in urine", label: "Blood in pee", group: ["urinary"] },
  { id: "lower tummy pain", label: "Lower tummy or back pain (under ribs)", group: ["urinary"] },
  { id: "headache", label: "Headache", group: ["head","general"] },
  { id: "throbbing", label: "Throbbing head pain", group: ["head"] },
  { id: "one side", label: "Pain on one side of the head", group: ["head"] },
  { id: "light sensitivity", label: "Sensitive to light", group: ["head"] },
  { id: "sound sensitivity", label: "Sensitive to sound", group: ["head"] },
  { id: "visual aura", label: "Warning signs first (e.g. visual changes)", group: ["head"] },
  { id: "pain", label: "Pain or tenderness at the injury", group: ["injury"] },
  { id: "swelling", label: "Swelling", group: ["injury"] },
  { id: "bruising", label: "Bruising", group: ["injury"] },
  { id: "cannot put weight", label: "Cannot put weight on it / use it normally", group: ["injury"] },
  { id: "stiff", label: "Stiff or difficult to move", group: ["injury"] },
  { id: "weakness", label: "Weakness", group: ["injury"] },
  { id: "muscle spasm", label: "Muscle spasms or cramping", group: ["injury"] },
  { id: "deformity", label: "Looks out of shape or at an odd angle", group: ["injury"] },
  { id: "snap or grinding", label: "Heard/felt a snap, grinding or popping", group: ["injury"] },
  { id: "numbness", label: "Numbness or tingling", group: ["injury"] },
  { id: "gradual onset", label: "Pain built up over weeks (not one moment)", group: ["injury"] },
  { id: "repetitive activity", label: "Repetitive activity such as running", group: ["injury"] }
];

// Everyday wording -> canonical symptom (used for the free-text box)
const SYNONYMS = {
  "temperature": "fever", "hot and shivery": "fever", "shivery": "fever", "exhausted": "tired",
  "fatigue": "tired", "achy": "aching", "body ache": "aching", "sick": "nausea", "vomit": "nausea",
  "peeing": "burning urination", "burning": "burning urination", "stinging": "burning urination",
  "stuffy": "runny nose", "blocked nose": "runny nose", "swollen": "swelling", "bruised": "bruising",
  "weight": "cannot put weight", "misshapen": "deformity", "bent": "deformity", "tingling": "numbness",
  "numb": "numbness", "running": "repetitive activity", "breathless": "shortness of breath"
};

/* category: "general" conditions feed the Symptom Checker; "injury" feed the Injury Checker.
   required = AND, optional+threshold = OR (min count), exclude = NOT.
   risk.age = [min,max] range that adds to the score; risk.text = words in the
   free-text "conditions/behaviours" boxes that add to the score. */
const CONDITIONS = [
  {
    id: "flu", name: "Flu (influenza)", category: "general", urgency: "low",
    required: ["fever"],
    optional: ["cough","aching","tired","sore throat","headache","loss of appetite","difficulty sleeping","nausea","diarrhoea"],
    threshold: 2, exclude: ["burning urination"],
    risk: { age: [65, 120], text: ["diabetes","heart","lung","kidney","liver","pregnan","immune"] },
    description: "Flu symptoms come on very quickly and can include a sudden high temperature, an aching body, tiredness, a dry cough, a sore throat and a headache. Flu tends to be more severe than a cold.",
    nextSteps: "Rest and sleep, drink plenty of water, and take paracetamol or ibuprofen to lower your temperature and treat aches. A pharmacist can recommend flu remedies. Antibiotics do not work for viral infections such as flu.",
    warnings: "Ask for an urgent GP appointment or call NHS 111 if you are 65 or over, pregnant, have a long-term condition or weakened immune system, feel very unwell or short of breath, or symptoms do not improve after 7 days.",
    source: { title: "Flu - NHS", url: NHS + "flu/" }
  },
  {
    id: "covid", name: "COVID-19", category: "general", urgency: "moderate",
    required: [],
    optional: ["fever","cough","loss of smell or taste","shortness of breath","tired","aching","headache","sore throat","runny nose","loss of appetite","diarrhoea","nausea"],
    threshold: 2, exclude: ["burning urination"],
    risk: { age: [60, 120], text: ["diabetes","heart","lung","kidney","immune","travel"] },
    description: "The NHS lists a high temperature, a new continuous cough and a change in sense of smell or taste among the symptoms of COVID-19. The symptoms are very similar to those of other illnesses, such as colds and flu.",
    nextSteps: "Try to stay at home and avoid contact with other people while you have symptoms and a high temperature. You can go back to normal activities when you feel better or do not have a high temperature. Follow the current NHS page for testing and treatment eligibility.",
    warnings: "Get medical help if your symptoms get worse or you are struggling to breathe. See the NHS page for full guidance.",
    source: { title: "COVID-19 symptoms and what to do - NHS", url: NHS + "covid-19/covid-19-symptoms-and-what-to-do/" }
  },
  {
    id: "uti", name: "Urinary tract infection (UTI)", category: "general", urgency: "moderate",
    required: ["burning urination"],
    optional: ["frequent urination","cloudy urine","blood in urine","lower tummy pain","fever","tired"],
    threshold: 1, exclude: ["cough","sore throat"],
    risk: { age: [65, 120], text: ["diabetes","catheter","pregnan","immune"] },
    description: "UTIs affect the urinary tract and include cystitis (bladder infection), urethritis and kidney infection. Symptoms include pain or burning when peeing, needing to pee more often or more urgently, cloudy pee and lower tummy pain.",
    nextSteps: "A woman or girl aged 16 to 64 who is not pregnant or breastfeeding can see a pharmacist. Rest and drink enough fluids so you pass pale pee regularly, and avoid drinks that may irritate the bladder, like fruit juices, coffee and alcohol.",
    warnings: "Ask for an urgent GP appointment or call NHS 111 if you are a man, aged 65+, pregnant, have diabetes, have blood in your pee, pain in your lower tummy or back under the ribs, a very high or low temperature, or symptoms that get worse quickly or do not improve within 48 hours. Some of these could be a kidney infection, which can be serious.",
    source: { title: "Urinary tract infections (UTIs) - NHS", url: NHS + "urinary-tract-infections-utis/" }
  },
  {
    id: "migraine", name: "Migraine", category: "general", urgency: "low",
    required: ["headache"],
    optional: ["throbbing","one side","nausea","light sensitivity","sound sensitivity","visual aura","tired"],
    threshold: 2, exclude: ["fever","cough","burning urination"],
    risk: { age: [15, 55], text: ["stress","poor sleep","migraine"] },
    description: "Migraine is a condition that causes symptoms such as a severe, throbbing headache (often on one side), feeling sick and sensitivity to light. Attacks usually last between 4 hours and 3 days.",
    nextSteps: "The NHS says you should see a GP if you have frequent or severe migraine symptoms that cannot be managed with occasional use of over-the-counter painkillers such as paracetamol.",
    warnings: "Get immediate medical help for a high temperature with a stiff neck, pain looking at bright lights, a rash that does not fade under a glass, or sudden weakness on one side of the body or face (NHS retinal migraine page).",
    source: { title: "Migraine - NHS", url: NHS + "migraine/" }
  },
  {
    id: "sprain", name: "Sprain or strain", category: "injury", urgency: "low",
    required: [],
    optional: ["pain","swelling","bruising","cannot put weight","weakness","muscle spasm","stiff"],
    threshold: 2, exclude: ["deformity","snap or grinding"],
    risk: { age: [0, 120], text: ["sport","football","twist","fall"] },
    description: "Sprains and strains are common injuries affecting ligaments (sprains: a torn or twisted ligament) and muscles (strains: an overstretched or torn muscle). Symptoms include pain, tenderness or weakness, swelling or bruising, and being unable to use the area normally.",
    nextSteps: "For the first couple of days: protect the injury, rest, apply an ice pack for up to 20 minutes every 2 to 3 hours, use a compression bandage and keep it raised. A pharmacist can suggest painkillers, creams or gels. Keep moving the area gently once movement no longer causes stopping pain.",
    warnings: "Call NHS 111 if it is very painful or getting worse, there is a large or worsening amount of swelling or bruising, it hurts to put weight on it, it is very stiff, it is not improving with self-care, or you also have a very high temperature or feel hot and shivery (could be infection).",
    source: { title: "Sprains and strains - NHS", url: NHS + "sprains-and-strains/" }
  },
  {
    id: "fracture", name: "Broken bone (fracture)", category: "injury", urgency: "urgent",
    required: [],
    optional: ["pain","swelling","bruising","deformity","cannot put weight","numbness","snap or grinding","stiff"],
    threshold: 2, exclude: [],
    risk: { age: [65, 120], text: ["osteoporosis","fall","accident"] },
    description: "The three most common signs of a broken bone are pain, swelling and deformity. You may hear or feel a snap, grinding or popping, have bruising or tenderness, pain when putting weight on it or moving it, or tingling or numbness. A small crack may not hurt much.",
    nextSteps: "The NHS says to get medical help as soon as possible if you think you have broken a bone. You may need an X-ray. Go to A&E for a broken arm or leg. If you are not sure what to do, call 111.",
    warnings: "Call 999 or go to A&E if a bone is sticking out, the limb is bent or at an odd angle, the area is numb or tingling, there is heavy bleeding, or your skin is cold and sweaty. Always call 999 for very severe suspected breaks such as a broken hip, neck or back.",
    source: { title: "Broken leg / Broken arm or wrist - NHS", url: NHS + "broken-leg/" }
  },
  {
    id: "stress-fracture", name: "Stress fracture (leg)", category: "injury", urgency: "moderate",
    required: ["gradual onset"],
    optional: ["pain","repetitive activity","swelling"],
    threshold: 1, exclude: [],
    risk: { age: [0, 120], text: ["running","runner","training"] },
    description: "The NHS says pain in the leg that has come on over a few weeks could be due to small cracks or breaks in the bone, known as a stress fracture. They are usually caused by repetitive activity such as running.",
    nextSteps: "The NHS broken-leg page does not give self-care steps for stress fractures. Get it assessed: call NHS 111 or see a GP.",
    warnings: "Call NHS 111 if the leg is very painful or getting worse, there is a large amount of swelling or bruising, it hurts to put weight on it, or it is very stiff or hard to move.",
    source: { title: "Broken leg (stress fractures) - NHS", url: NHS + "broken-leg/" }
  }
];

/* Emergency / urgent rules. These run BEFORE scoring and are never
   affected by confidence. `any` = free-text or chip keywords that trigger. */
const RED_FLAGS = [
  { level: "999", any: ["chest pain","coughing up blood","cough blood","gasping","choking","cannot speak"],
    text: "The NHS flu page says to call 999 or go to A&E for sudden chest pain, severe difficulty breathing (gasping, choking or not able to get words out) or coughing up blood.",
    source: { title: "Flu - NHS", url: NHS + "flu/" } },
  { level: "999", any: ["confused","drowsy","difficulty speaking"],
    text: "The NHS UTI page says to call 999 or go to A&E if you or your child are confused, drowsy or have difficulty speaking.",
    source: { title: "Urinary tract infections (UTIs) - NHS", url: NHS + "urinary-tract-infections-utis/" } },
  { level: "999", any: ["bone sticking out","bone poking","cold and sweaty","blue lips","heavy bleeding"],
    text: "The NHS says to call 999 or go to A&E after an injury if a bone is sticking out, there is heavy bleeding, your skin is cold and sweaty, or your skin, lips or tongue are blue, grey or pale.",
    source: { title: "Broken leg - NHS", url: NHS + "broken-leg/" } },
  { level: "999", any: ["stiff neck"],
    text: "The NHS says a high temperature with a stiff neck, pain looking at bright lights or a rash that does not fade under a glass needs immediate medical help.",
    source: { title: "Retinal migraine - NHS", url: NHS + "retinal-migraine/" } }
];
/* Symptom ids that also trigger an urgent notice */
const FLAG_SYMPTOMS = {
  "deformity": { level: "999", text: "The NHS says to call 999 or go to A&E if an injured limb has changed shape or is at an odd angle.", source: { title: "Broken arm or wrist - NHS", url: NHS + "broken-arm-or-wrist/" } },
  "numbness": { level: "999", text: "The NHS says to go to A&E or call 999 if an injured arm or wrist is numb, tingling or has pins and needles.", source: { title: "Broken arm or wrist - NHS", url: NHS + "broken-arm-or-wrist/" } },
  "shortness of breath": { level: "111", text: "The NHS flu page says to ask for an urgent GP appointment or get help from NHS 111 if you have flu symptoms and feel short of breath.", source: { title: "Flu - NHS", url: NHS + "flu/" } }
};

/* NHS-only Q&A for the "General medical questions" page.
   `keys` = words that must appear; `answer` is paraphrased from `source`. */
const QA = [
  { keys: ["sprain","recover"], q: "How long does a sprain take to recover?",
    answer: "According to the NHS, after about 2 weeks most sprains and strains feel better. Avoid strenuous exercise such as running for up to 8 weeks because of the risk of further damage, and severe sprains and strains can take months to get back to normal. See a GP if it is getting worse or not improving with self-care.",
    source: { title: "Sprains and strains - NHS", url: NHS + "sprains-and-strains/" } },
  { keys: ["sprain","treat"], q: "How do I treat a sprain at home?",
    answer: "The NHS advises protecting the injury, resting it, using an ice pack (wrapped) for up to 20 minutes every 2 to 3 hours, using a compression bandage and keeping it raised. Avoid heat, alcohol and massage for the first couple of days. A pharmacist can suggest painkillers, creams or gels.",
    source: { title: "Sprains and strains - NHS", url: NHS + "sprains-and-strains/" } },
  { keys: ["antibiotic","flu"], q: "Do antibiotics work for flu?",
    answer: "No. The NHS says antibiotics do not work for viral infections such as flu, and GPs do not recommend them because they will not relieve symptoms or speed up recovery.",
    source: { title: "Flu - NHS", url: NHS + "flu/" } },
  { keys: ["paracetamol"], q: "Any warnings about paracetamol?",
    answer: "The NHS flu page warns not to take paracetamol at the same time as flu remedies that contain paracetamol, because it is easy to take more than the recommended dose. Check the packaging or ask a pharmacist. This tool cannot advise on doses.",
    source: { title: "Flu - NHS", url: NHS + "flu/" } },
  { keys: ["aspirin"], q: "Can children take aspirin?",
    answer: "The NHS flu page says not to give aspirin to children under the age of 16. Ask a pharmacist or GP if you are unsure about any medicine for a child.",
    source: { title: "Flu - NHS", url: NHS + "flu/" } },
  { keys: ["flu","spread"], q: "How long is flu infectious?",
    answer: "The NHS says flu is very infectious and you are more likely to give it to others in the first 5 days after getting infected. Wash hands often, use tissues, and bin them quickly.",
    source: { title: "Flu - NHS", url: NHS + "flu/" } },
  { keys: ["flu","doctor"], q: "When should I get help for flu?",
    answer: "The NHS says to ask for an urgent GP appointment or get help from NHS 111 if you are worried about a baby or child, are 65+, pregnant, have a long-term condition or weakened immune system, feel very unwell or short of breath, or symptoms do not improve after 7 days. Call 999 for sudden chest pain, severe difficulty breathing or coughing up blood.",
    source: { title: "Flu - NHS", url: NHS + "flu/" } },
  { keys: ["migraine","last"], q: "How long does a migraine last?",
    answer: "The NHS says migraine attacks usually last between 4 hours and 3 days, with early symptoms (such as feeling very tired) starting hours or up to 2 days before the head pain.",
    source: { title: "Migraine - NHS", url: NHS + "migraine/" } },
  { keys: ["uti","pharmacist"], q: "Can a pharmacist help with a UTI?",
    answer: "The NHS says a woman or girl aged 16 to 64 who is not pregnant or breastfeeding and thinks she has a UTI can see a pharmacist, who can give the same medicines as a GP or direct you to other help.",
    source: { title: "Urinary tract infections (UTIs) - NHS", url: NHS + "urinary-tract-infections-utis/" } },
  { keys: ["broken","wait"], q: "What should I do while waiting for help with a broken leg?",
    answer: "The NHS says to avoid moving the leg or putting weight on it, avoid raising it, put padding such as clothing or a blanket around it, and stop any bleeding by pressing a clean cloth on the wound.",
    source: { title: "Broken leg - NHS", url: NHS + "broken-leg/" } },
  { keys: ["stress","fracture"], q: "What is a stress fracture?",
    answer: "The NHS describes leg pain that comes on over a few weeks as possibly due to small cracks or breaks in the bone (a stress fracture), usually caused by repetitive activity such as running.",
    source: { title: "Broken leg - NHS", url: NHS + "broken-leg/" } }
];
