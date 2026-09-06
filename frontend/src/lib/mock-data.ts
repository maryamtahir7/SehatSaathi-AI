export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: "Vitamins" | "First Aid" | "Supplements" | "Equipment" | "Prescription";
  rating: number;
  emoji: string;
  tag?: string;
};

export const products: Product[] = [
  { id: "p1", name: "Panadol Extra 500mg", brand: "GSK", price: 120, category: "Prescription", rating: 4.8, emoji: "💊", tag: "Best seller" },
  { id: "p2", name: "Vitamin D3 2000 IU", brand: "NutraLife", price: 950, category: "Vitamins", rating: 4.7, emoji: "🌞" },
  { id: "p3", name: "Omega-3 Fish Oil", brand: "SeaCore", price: 1450, category: "Supplements", rating: 4.6, emoji: "🐟" },
  { id: "p4", name: "Digital BP Monitor", brand: "Omron", price: 8900, category: "Equipment", rating: 4.9, emoji: "🩺", tag: "Top rated" },
  { id: "p5", name: "Pulse Oximeter", brand: "Beurer", price: 3200, category: "Equipment", rating: 4.5, emoji: "❤️" },
  { id: "p6", name: "First Aid Kit (42 pcs)", brand: "SafeGuard", price: 2100, category: "First Aid", rating: 4.4, emoji: "🧰" },
  { id: "p7", name: "Antiseptic Solution 500ml", brand: "Dettol", price: 480, category: "First Aid", rating: 4.6, emoji: "🧴" },
  { id: "p8", name: "Multivitamin Gummies", brand: "VitaBear", price: 1750, category: "Vitamins", rating: 4.3, emoji: "🐻" },
  { id: "p9", name: "Whey Protein 1kg", brand: "PureFuel", price: 6400, category: "Supplements", rating: 4.7, emoji: "🥛" },
  { id: "p10", name: "Glucometer Strips (50)", brand: "Accu-Chek", price: 2750, category: "Equipment", rating: 4.8, emoji: "🩸" },
  { id: "p11", name: "Zincor Tablets", brand: "Hilton", price: 260, category: "Supplements", rating: 4.2, emoji: "⚪" },
  { id: "p12", name: "Cough Syrup 120ml", brand: "Hydryllin", price: 340, category: "Prescription", rating: 4.1, emoji: "🍯" },
];

export const categories = ["All", "Vitamins", "First Aid", "Supplements", "Equipment", "Prescription"] as const;

export const symptomOptions = [
  "Fever", "Headache", "Cough", "Sore throat", "Fatigue", "Shortness of breath",
  "Chest pain", "Nausea", "Vomiting", "Diarrhea", "Muscle pain", "Joint pain",
  "Skin rash", "Dizziness", "Loss of appetite", "Night sweats", "Chills",
  "Runny nose", "Sneezing", "Abdominal pain", "Frequent urination", "Blurred vision",
];

export type Prediction = {
  disease: string;
  probability: number;
  summary: string;
  precautions: string[];
};

export const predictionBank: Prediction[] = [
  {
    disease: "Influenza (Seasonal Flu)",
    probability: 82,
    summary: "Viral infection of the respiratory tract, common with fever, body aches and fatigue.",
    precautions: ["Rest and hydrate with 3L fluids daily", "Paracetamol for fever as directed", "Isolate for 5 days to avoid spread", "Seek care if breathing worsens"],
  },
  {
    disease: "Acute Bronchitis",
    probability: 64,
    summary: "Inflammation of the bronchial tubes, usually following a viral upper-respiratory infection.",
    precautions: ["Steam inhalation twice a day", "Avoid smoke and dust exposure", "Warm fluids and honey for cough", "Chest X-ray if cough exceeds 3 weeks"],
  },
  {
    disease: "Viral Pharyngitis",
    probability: 47,
    summary: "Throat inflammation causing pain on swallowing, often self-limiting within a week.",
    precautions: ["Saltwater gargles 3x daily", "Soft, non-spicy diet", "Lozenges for symptom relief", "Throat swab if white patches appear"],
  },
  {
    disease: "Migraine",
    probability: 58,
    summary: "Recurrent moderate-to-severe headache, often one-sided with light sensitivity.",
    precautions: ["Rest in a dark, quiet room", "Track and avoid triggers", "Maintain regular sleep hours", "Neurology referral if frequency rises"],
  },
  {
    disease: "Gastroenteritis",
    probability: 61,
    summary: "Infection of the stomach and intestines causing nausea, cramps and loose stools.",
    precautions: ["ORS after every loose motion", "Bland BRAT diet for 48 hours", "Strict hand hygiene", "Urgent care if signs of dehydration"],
  },
  {
    disease: "Iron-deficiency Anaemia",
    probability: 43,
    summary: "Low haemoglobin leading to tiredness, dizziness and reduced exercise tolerance.",
    precautions: ["Iron-rich foods with vitamin C", "Avoid tea with meals", "CBC and ferritin testing", "Iron supplements only after labs"],
  },
];

export type ScanResult = {
  finding: string;
  confidence: number;
  notes: string;
  severity: "low" | "moderate" | "high";
};

export const scanResults: Record<string, ScanResult> = {
  xray: {
    finding: "Pneumonia Detected",
    confidence: 89,
    severity: "high",
    notes:
      "Patchy consolidation observed in the right lower lobe with air bronchograms, consistent with community-acquired pneumonia. Cardiac silhouette is within normal limits and no pleural effusion is evident. Recommend clinical correlation with CBC and CRP, empiric antibiotic therapy per local protocol, and a follow-up radiograph in 4–6 weeks.",
  },
  mri: {
    finding: "No Tumor Detected",
    confidence: 94,
    severity: "low",
    notes:
      "No abnormal mass, midline shift or restricted diffusion identified across the acquired axial sequences. Ventricular system and grey–white differentiation appear preserved. If symptoms persist, consider contrast-enhanced imaging and neurology review.",
  },
  skin: {
    finding: "Benign Melanocytic Nevus",
    confidence: 76,
    severity: "moderate",
    notes:
      "Lesion shows symmetric borders and homogeneous pigmentation with no ulceration. Low suspicion of malignancy, though borderline confidence warrants dermoscopic evaluation. Photograph monthly and report any change in size, colour or bleeding immediately.",
  },
};

export type Meal = { slot: string; title: string; items: string[]; calories: number; emoji: string };

export const mealPlan: Meal[] = [
  { slot: "Breakfast", title: "Protein Oats Bowl", items: ["Steel-cut oats with cinnamon", "Greek yogurt (150g)", "Walnuts & blueberries", "Green tea"], calories: 420, emoji: "🥣" },
  { slot: "Mid-morning Snack", title: "Fruit & Nuts", items: ["1 apple with skin", "6 almonds", "Water 500ml"], calories: 180, emoji: "🍎" },
  { slot: "Lunch", title: "Grilled Chicken & Chapati", items: ["Grilled chicken breast (150g)", "2 whole-wheat chapati", "Mixed salad with lemon", "Plain yogurt"], calories: 610, emoji: "🍽️" },
  { slot: "Evening Snack", title: "Chana Chaat", items: ["Boiled chickpeas (1 cup)", "Onion, tomato, coriander", "Lemon & black pepper"], calories: 220, emoji: "🥗" },
  { slot: "Dinner", title: "Baked Fish & Veg", items: ["Baked salmon or rahu (140g)", "Steamed broccoli & carrots", "Half cup brown rice"], calories: 520, emoji: "🐟" },
];

export type ScriptRow = { id: string; medicine: string; dosage: string; frequency: string; duration: string; price: number };

export const prescriptionRows: ScriptRow[] = [
  { id: "r1", medicine: "Amoxicillin 500mg", dosage: "1 capsule", frequency: "3 times daily after meals", duration: "7 days", price: 480 },
  { id: "r2", medicine: "Paracetamol 500mg", dosage: "1 tablet", frequency: "As needed, max 4/day", duration: "5 days", price: 120 },
  { id: "r3", medicine: "Montelukast 10mg", dosage: "1 tablet", frequency: "Once at bedtime", duration: "14 days", price: 760 },
  { id: "r4", medicine: "Vitamin C 1000mg", dosage: "1 effervescent", frequency: "Once daily", duration: "10 days", price: 350 },
];

export const suggestedPrompts = [
  "What are the symptoms of flu?",
  "How to reduce blood pressure?",
  "Is my sugar level of 160 normal?",
  "Best diet for weight loss in Ramadan",
  "When should I go to the ER for chest pain?",
];

export const chatReplies: string[] = [
  "Based on what you've shared, this most often points to a mild viral infection. Keep hydrated, rest, and monitor your temperature twice a day. If fever crosses 39°C for more than three days, please see a physician.",
  "Great question. Lifestyle changes carry most of the benefit: reduce salt to under 5g/day, walk briskly 30 minutes five times a week, sleep 7–8 hours, and limit caffeine. Track your readings each morning for two weeks and share the log with your doctor.",
  "Here's a simple plan: prioritise protein at every meal, keep refined sugar minimal, and aim for a 400–500 kcal daily deficit. I can generate a full personalised plan in the Diet Planner if you share your age, weight and height.",
  "That's worth taking seriously. Chest pain with sweating, breathlessness or pain radiating to the arm or jaw needs emergency care immediately — call 1122 or go to the nearest ER. Do not drive yourself.",
];
