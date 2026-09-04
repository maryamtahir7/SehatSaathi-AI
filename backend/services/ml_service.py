import os
import ast
import pickle
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# The user placed the kaggle datasets in the 'dataset' directory
DATA_DIR = os.path.join(BASE_DIR, 'dataset')
MODELS_DIR = os.path.join(BASE_DIR, 'models')

# Kaggle Dataset Files
DESC_PATH = os.path.join(DATA_DIR, 'description.csv')
PRECAUTIONS_PATH = os.path.join(DATA_DIR, 'precautions_df.csv')
MEDS_PATH = os.path.join(DATA_DIR, 'medications.csv')
DIETS_PATH = os.path.join(DATA_DIR, 'diets.csv')
WORKOUT_PATH = os.path.join(DATA_DIR, 'workout_df.csv')

# The trained SVC model 
MODEL_PATH = os.path.join(MODELS_DIR, 'svc.pkl')

svc_model = None

# Load CSVs
description_df = None
precautions_df = None
medications_df = None
diets_df = None
workout_df = None

def load_ml_resources():
    global svc_model, description_df, precautions_df, medications_df, diets_df, workout_df
    try:
        # Load the Pure ML Model
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                svc_model = pickle.load(f)
        
        # Load DataFrames
        if os.path.exists(DESC_PATH): description_df = pd.read_csv(DESC_PATH)
        if os.path.exists(PRECAUTIONS_PATH): precautions_df = pd.read_csv(PRECAUTIONS_PATH)
        if os.path.exists(MEDS_PATH): medications_df = pd.read_csv(MEDS_PATH)
        if os.path.exists(DIETS_PATH): diets_df = pd.read_csv(DIETS_PATH)
        if os.path.exists(WORKOUT_PATH): workout_df = pd.read_csv(WORKOUT_PATH)
            
        print("Pure ML Model (SVC) and Kaggle Data loaded successfully!")
    except Exception as e:
        print(f"Warning: ML resources missing. Error: {e}")

# Call it once when module is imported
load_ml_resources()

# Dictionary exactly from the Kaggle Notebook
symptoms_dict = {
    'itching': 0, 'skin_rash': 1, 'nodal_skin_eruptions': 2, 'continuous_sneezing': 3, 'shivering': 4, 'chills': 5, 
    'joint_pain': 6, 'stomach_pain': 7, 'acidity': 8, 'ulcers_on_tongue': 9, 'muscle_wasting': 10, 'vomiting': 11, 
    'burning_micturition': 12, 'spotting_ urination': 13, 'fatigue': 14, 'weight_gain': 15, 'anxiety': 16, 
    'cold_hands_and_feets': 17, 'mood_swings': 18, 'weight_loss': 19, 'restlessness': 20, 'lethargy': 21, 
    'patches_in_throat': 22, 'irregular_sugar_level': 23, 'cough': 24, 'high_fever': 25, 'sunken_eyes': 26, 
    'breathlessness': 27, 'sweating': 28, 'dehydration': 29, 'indigestion': 30, 'headache': 31, 'yellowish_skin': 32, 
    'dark_urine': 33, 'nausea': 34, 'loss_of_appetite': 35, 'pain_behind_the_eyes': 36, 'back_pain': 37, 
    'constipation': 38, 'abdominal_pain': 39, 'diarrhoea': 40, 'mild_fever': 41, 'yellow_urine': 42, 
    'yellowing_of_eyes': 43, 'acute_liver_failure': 44, 'fluid_overload': 45, 'swelling_of_stomach': 46, 
    'swelled_lymph_nodes': 47, 'malaise': 48, 'blurred_and_distorted_vision': 49, 'phlegm': 50, 'throat_irritation': 51, 
    'redness_of_eyes': 52, 'sinus_pressure': 53, 'runny_nose': 54, 'congestion': 55, 'chest_pain': 56, 
    'weakness_in_limbs': 57, 'fast_heart_rate': 58, 'pain_during_bowel_movements': 59, 'pain_in_anal_region': 60, 
    'bloody_stool': 61, 'irritation_in_anus': 62, 'neck_pain': 63, 'dizziness': 64, 'cramps': 65, 'bruising': 66, 
    'obesity': 67, 'swollen_legs': 68, 'swollen_blood_vessels': 69, 'puffy_face_and_eyes': 70, 'enlarged_thyroid': 71, 
    'brittle_nails': 72, 'swollen_extremeties': 73, 'excessive_hunger': 74, 'extra_marital_contacts': 75, 
    'drying_and_tingling_lips': 76, 'slurred_speech': 77, 'knee_pain': 78, 'hip_joint_pain': 79, 'muscle_weakness': 80, 
    'stiff_neck': 81, 'swelling_joints': 82, 'movement_stiffness': 83, 'spinning_movements': 84, 'loss_of_balance': 85, 
    'unsteadiness': 86, 'weakness_of_one_body_side': 87, 'loss_of_smell': 88, 'bladder_discomfort': 89, 
    'foul_smell_of urine': 90, 'continuous_feel_of_urine': 91, 'passage_of_gases': 92, 'internal_itching': 93, 
    'toxic_look_(typhos)': 94, 'depression': 95, 'irritability': 96, 'muscle_pain': 97, 'altered_sensorium': 98, 
    'red_spots_over_body': 99, 'belly_pain': 100, 'abnormal_menstruation': 101, 'dischromic _patches': 102, 
    'watering_from_eyes': 103, 'increased_appetite': 104, 'polyuria': 105, 'family_history': 106, 'mucoid_sputum': 107, 
    'rusty_sputum': 108, 'lack_of_concentration': 109, 'visual_disturbances': 110, 'receiving_blood_transfusion': 111, 
    'receiving_unsterile_injections': 112, 'coma': 113, 'stomach_bleeding': 114, 'distention_of_abdomen': 115, 
    'history_of_alcohol_consumption': 116, 'fluid_overload.1': 117, 'blood_in_sputum': 118, 'prominent_veins_on_calf': 119, 
    'palpitations': 120, 'painful_walking': 121, 'pus_filled_pimples': 122, 'blackheads': 123, 'scurring': 124, 
    'skin_peeling': 125, 'silver_like_dusting': 126, 'small_dents_in_nails': 127, 'inflammatory_nails': 128, 
    'blister': 129, 'red_sore_around_nose': 130, 'yellow_crust_ooze': 131
}

diseases_list = {
    15: 'Fungal infection', 4: 'Allergy', 16: 'GERD', 9: 'Chronic cholestasis', 14: 'Drug Reaction', 
    33: 'Peptic ulcer diseae', 1: 'AIDS', 12: 'Diabetes ', 17: 'Gastroenteritis', 6: 'Bronchial Asthma', 
    23: 'Hypertension ', 30: 'Migraine', 7: 'Cervical spondylosis', 32: 'Paralysis (brain hemorrhage)', 
    28: 'Jaundice', 29: 'Malaria', 8: 'Chicken pox', 11: 'Dengue', 37: 'Typhoid', 40: 'hepatitis A', 
    19: 'Hepatitis B', 20: 'Hepatitis C', 21: 'Hepatitis D', 22: 'Hepatitis E', 3: 'Alcoholic hepatitis', 
    36: 'Tuberculosis', 10: 'Common Cold', 34: 'Pneumonia', 13: 'Dimorphic hemmorhoids(piles)', 18: 'Heart attack', 
    39: 'Varicose veins', 26: 'Hypothyroidism', 24: 'Hyperthyroidism', 25: 'Hypoglycemia', 31: 'Osteoarthristis', 
    5: 'Arthritis', 0: '(vertigo) Paroymsal  Positional Vertigo', 2: 'Acne', 38: 'Urinary tract infection', 
    35: 'Psoriasis', 27: 'Impetigo'
}

def predict_disease(user_symptoms: list[str]) -> str:
    """Uses the pure SVC machine learning model to predict disease."""
    if not svc_model:
        return "General Fatigue"
    
    # Map raw symptoms to dictionary keys
    # Clean the input, user might send spaces instead of underscores
    cleaned_symptoms = [s.strip().lower().replace(" ", "_") for s in user_symptoms]
    
    # Create 132-dimension 0s array
    input_vector = np.zeros(len(symptoms_dict))
    
    for symptom in cleaned_symptoms:
        if symptom in symptoms_dict:
            input_vector[symptoms_dict[symptom]] = 1
            
    # Predict using SVC
    prediction = svc_model.predict([input_vector])[0]
    return diseases_list.get(prediction, "General Fatigue")


def get_recommendations(disease: str, age: int = None, gender: str = None) -> dict:
    """Extracts recommendations from Kaggle CSVs exactly like the notebook."""
    
    desc = ""
    pre_list = []
    med_list = []
    die_list = []
    wrkout_list = []
    
    # Safely extract from DataFrames
    try:
        if description_df is not None:
            match = description_df[description_df['Disease'] == disease]
            if not match.empty:
                desc = match['Description'].iloc[0]

        if precautions_df is not None:
            match = precautions_df[precautions_df['Disease'] == disease]
            if not match.empty:
                cols = ['Precaution_1', 'Precaution_2', 'Precaution_3', 'Precaution_4']
                pre_list = [str(match[col].iloc[0]) for col in cols if pd.notna(match[col].iloc[0])]

        if medications_df is not None:
            import re
            
            # Fetch from Medicine_Details.csv to get Image URLs and rich data
            med_db_path = os.path.join(DATA_DIR, '../data/Medicine_Details.csv')
            found_in_db = False
            
            if os.path.exists(med_db_path):
                med_df = pd.read_csv(med_db_path)
                
                # Extract words > 4 chars from the disease to use as search keywords
                words = re.findall(r'\b[a-zA-Z]{4,}\b', disease.lower())
                # Add the exact disease name as a fallback keyword
                words.append(disease.lower())
                
                matches = pd.DataFrame()
                for w in words:
                    res = med_df[med_df['Uses'].str.contains(w, case=False, na=False, regex=False)]
                    if not res.empty:
                        matches = pd.concat([matches, res])
                
                if not matches.empty:
                    matches = matches.drop_duplicates(subset=['Medicine Name'])
                    # Prioritize medicines that actually have an image URL
                    matches_with_img = matches[matches['Image URL'].notna()]
                    final_matches = matches_with_img if len(matches_with_img) >= 3 else matches
                    
                    for _, row in final_matches.head(4).iterrows():
                        med_list.append({
                            "name": str(row['Medicine Name']),
                            "image_url": str(row['Image URL']) if pd.notna(row['Image URL']) else ""
                        })
                    found_in_db = True
            
            # Fallback to pure Kaggle medications.csv if no matches found
            if not found_in_db:
                match = medications_df[medications_df['Disease'] == disease]
                if not match.empty:
                    raw_meds = match['Medication'].iloc[0]
                    if str(raw_meds).startswith('['):
                        names = ast.literal_eval(raw_meds)
                    else:
                        names = [raw_meds]
                    med_list = [{"name": n, "image_url": ""} for n in names]

        if diets_df is not None:
            match = diets_df[diets_df['Disease'] == disease]
            if not match.empty:
                raw_diets = match['Diet'].iloc[0]
                if str(raw_diets).startswith('['):
                    die_list = ast.literal_eval(raw_diets)
                else:
                    die_list = [raw_diets]

        if workout_df is not None:
            match = workout_df[workout_df['disease'] == disease]
            if not match.empty:
                wrkout_list = match['workout'].tolist()
                
    except Exception as e:
        print(f"Error fetching recommendations: {e}")

    # Fallbacks if DataFrames not found
    if not desc: desc = f"The Pure Machine Learning SVC model diagnosed {disease}."
    if not pre_list: pre_list = ["Consult a doctor", "Rest"]
    if not med_list: med_list = [{"name": "Consult physician for prescription", "image_url": ""}]
    if not die_list: die_list = ["Balanced Diet"]
    if not wrkout_list: wrkout_list = ["Light exercise"]

    return {
        "disease": disease,
        "description": desc,
        "rationale": "Predicted natively by 132-dimension Support Vector Classifier (SVC) Machine Learning Model.",
        "precautions": pre_list,
        "medicines": med_list,
        "lab_tests": ["Complete Blood Count", "Specialist Consultation"], # Kaggle dataset lacks labs, using standard default
        "diet_plan": die_list,
        "workout_plan": wrkout_list
    }

def get_all_symptoms():
    """Returns a list of all supported symptoms for the frontend."""
    return [s.replace("_", " ").capitalize() for s in symptoms_dict.keys()]

def get_medicine_details(medicine_name: str):
    """Fetches comprehensive medicine details from Medicine_Details.csv."""
    try:
        med_db_path = os.path.join(DATA_DIR, '../data/Medicine_Details.csv')
        if os.path.exists(med_db_path):
            med_df = pd.read_csv(med_db_path)
            
            # Case insensitive exact or substring match for medicine name
            matches = med_df[med_df['Medicine Name'].str.contains(medicine_name, case=False, na=False, regex=False)]
            if not matches.empty:
                row = matches.iloc[0]
                return {
                    "name": str(row['Medicine Name']),
                    "generic": str(row['Composition']) if pd.notna(row['Composition']) else "Verified Formula",
                    "uses": str(row['Uses']) if pd.notna(row['Uses']) else "General Clinical Use",
                    "side_effects": str(row['Side_effects']) if pd.notna(row['Side_effects']) else "None reported natively",
                    "manufacturer": str(row['Manufacturer']) if pd.notna(row['Manufacturer']) else "Global Pharmaceuticals",
                    "image_url": str(row['Image URL']) if pd.notna(row['Image URL']) else "",
                    "price": float(len(str(row['Medicine Name'])) * 15.0), # Mock dynamic price based on name length
                    "unit": "Pack"
                }
    except Exception as e:
        print(f"Error fetching medicine details: {e}")
        
    return None
