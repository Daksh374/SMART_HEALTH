"""
SmartHealth ML Service — Flask API
Provides: /predict, /chat, /analyze
"""
import os, re, pickle
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

app = Flask(__name__)
CORS(app)

# ─── Load & Train Model ────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'data', 'symptoms_dataset.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'disease_model.pkl')
os.makedirs(os.path.join(BASE_DIR, 'models'), exist_ok=True)

ALL_SYMPTOMS = [
    'fever','cough','headache','fatigue','nausea','vomiting','chest_pain',
    'shortness_of_breath','sore_throat','runny_nose','body_ache','diarrhea',
    'loss_of_appetite','skin_rash','joint_pain','abdominal_pain','dizziness',
    'chills','sweating','high_fever','weight_loss','back_pain','neck_stiffness',
    'blurred_vision','yellow_skin','itching','high_fever'
]
ALL_SYMPTOMS = list(dict.fromkeys(ALL_SYMPTOMS))  # deduplicate, preserve order

def train_model():
    df = pd.read_csv(DATA_PATH)
    symptom_cols = [c for c in df.columns if c.startswith('Symptom')]
    
    # Build binary feature matrix
    records = []
    for _, row in df.iterrows():
        vec = {s: 0 for s in ALL_SYMPTOMS}
        for col in symptom_cols:
            val = str(row[col]).strip().lower()
            if val in vec:
                vec[val] = 1
        vec['_disease'] = row['Disease']
        records.append(vec)
    
    feat_df = pd.DataFrame(records)
    X = feat_df[ALL_SYMPTOMS]
    y = feat_df['_disease']
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    with open(MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    return model

# Load or train
if os.path.exists(MODEL_PATH):
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    print("✅ Model loaded from disk")
else:
    model = train_model()
    print("✅ Model trained and saved")

# ─── Disease Descriptions & Precautions ────────────────────────────────────────

DISEASE_INFO = {
    "Influenza": {
        "description": "A contagious respiratory illness caused by influenza viruses.",
        "precautions": ["Rest and drink plenty of fluids", "Take antiviral medications if prescribed", "Stay home to avoid spreading", "Get annual flu vaccine"]
    },
    "Common Cold": {
        "description": "A viral infection of your nose and throat.",
        "precautions": ["Stay hydrated", "Rest adequately", "Use OTC cold medicines", "Wash hands frequently"]
    },
    "Malaria": {
        "description": "A mosquito-borne disease caused by Plasmodium parasites.",
        "precautions": ["Take antimalarial medications", "Use mosquito repellent", "Sleep under mosquito nets", "Consult a doctor immediately"]
    },
    "Dengue Fever": {
        "description": "A mosquito-borne viral disease with high fever and severe joint pain.",
        "precautions": ["Stay hydrated", "Avoid aspirin/ibuprofen", "Seek immediate medical care", "Use mosquito protection"]
    },
    "Heart Disease": {
        "description": "Conditions affecting heart function including coronary artery disease.",
        "precautions": ["See a cardiologist immediately", "Monitor blood pressure", "Adopt heart-healthy diet", "Avoid strenuous activity until evaluated"]
    },
    "Pneumonia": {
        "description": "Infection that inflames air sacs in one or both lungs.",
        "precautions": ["Seek medical care promptly", "Complete prescribed antibiotics", "Rest and stay hydrated", "Monitor oxygen levels"]
    },
    "Migraine": {
        "description": "A headache disorder causing severe, recurring headaches.",
        "precautions": ["Rest in a dark, quiet room", "Apply cold or warm compress", "Stay hydrated", "Take prescribed migraine medication"]
    },
    "COVID-19": {
        "description": "Infectious disease caused by the SARS-CoV-2 coronavirus.",
        "precautions": ["Isolate immediately", "Monitor oxygen saturation", "Consult doctor for treatment", "Stay hydrated and rest"]
    },
    "Diabetes": {
        "description": "Chronic condition affecting how your body processes blood sugar.",
        "precautions": ["Monitor blood sugar regularly", "Follow prescribed diet", "Take medications as directed", "Exercise regularly"]
    },
    "Typhoid Fever": {
        "description": "Bacterial infection caused by Salmonella typhi.",
        "precautions": ["Get medical treatment immediately", "Drink only purified water", "Avoid raw foods", "Complete antibiotic course"]
    },
}

def get_disease_info(disease):
    return DISEASE_INFO.get(disease, {
        "description": f"A medical condition characterized by the presented symptoms.",
        "precautions": ["Consult a doctor", "Rest adequately", "Stay hydrated", "Monitor symptoms"]
    })

# ─── /predict endpoint ─────────────────────────────────────────────────────────

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    symptoms = data.get('symptoms', [])
    
    if not symptoms:
        return jsonify({"error": "No symptoms provided"}), 400
    
    # Build feature vector
    vec = {s: 0 for s in ALL_SYMPTOMS}
    for s in symptoms:
        s = s.strip().lower()
        if s in vec:
            vec[s] = 1
    
    X = pd.DataFrame([vec])[ALL_SYMPTOMS]
    
    # Predict
    pred = model.predict(X)[0]
    proba = model.predict_proba(X)[0]
    confidence = float(max(proba))
    
    info = get_disease_info(pred)
    
    return jsonify({
        "disease": pred,
        "confidence": round(confidence, 3),
        "description": info.get("description", ""),
        "precautions": info.get("precautions", [])
    })

# ─── /chat endpoint ────────────────────────────────────────────────────────────

CHAT_KB = {
    "diabetes": "**Diabetes** is a chronic condition affecting blood sugar levels. Symptoms include frequent urination, excessive thirst, fatigue, and blurred vision. Type 1 requires insulin; Type 2 may be managed with diet, exercise, and medications.",
    "headache": "**Headaches** can be caused by tension, dehydration, stress, lack of sleep, or migraines. Stay hydrated, rest in a quiet dark room, and take OTC pain relief. See a doctor if headaches are severe or frequent.",
    "blood pressure": "**High blood pressure (Hypertension)** is often symptomless but can lead to stroke or heart disease. Reduce salt intake, exercise regularly, manage stress, limit alcohol, and take prescribed medications.",
    "fever": "**Fever** is a sign your body is fighting an infection. For adults: rest, drink fluids, take acetaminophen or ibuprofen. See a doctor if fever exceeds 103°F (39.4°C) or lasts more than 3 days.",
    "covid": "**COVID-19** symptoms include fever, cough, shortness of breath, fatigue, and loss of taste/smell. Isolate if positive, monitor oxygen levels, stay hydrated. Seek emergency care if oxygen drops below 94%.",
    "water": "Adults should drink about **8 glasses (2 liters)** of water daily, but this varies based on body size, activity level, and climate. Well-hydrated urine should be pale yellow.",
    "iron deficiency": "Signs of **iron deficiency** include fatigue, pale skin, weakness, shortness of breath, and brittle nails. Eat iron-rich foods (red meat, spinach, lentils) or take prescribed iron supplements.",
    "cholesterol": "**High cholesterol** can be lowered through diet (reduce saturated fats, avoid trans fats), exercise, and medications like statins. Regular screening after age 20 is recommended.",
    "sleep": "Adults need **7–9 hours** of sleep per night. Maintain a consistent sleep schedule, avoid screens before bed, keep your bedroom cool and dark, and limit caffeine after 2 PM.",
    "stress": "To manage **stress**: exercise regularly, practice deep breathing or meditation, maintain social connections, take breaks, limit caffeine and alcohol, and consider speaking with a therapist.",
    "vitamin d": "**Vitamin D** deficiency can cause bone pain, fatigue, and depression. Get 10–30 minutes of sunlight daily, eat fatty fish and fortified foods, and consider supplements if deficient.",
    "heart": "**Heart health** tips: exercise 150 min/week, eat Mediterranean diet, don't smoke, limit alcohol, keep blood pressure and cholesterol in check, manage stress, and get regular checkups.",
    "cough": "**Coughs** can be dry (viral) or productive (bacterial/allergic). Stay hydrated, use honey for soothing, try steam inhalation. See a doctor if cough lasts over 3 weeks or produces blood.",
    "weight loss": "**Healthy weight loss** involves creating a calorie deficit through balanced diet and exercise. Aim for 0.5–1 kg/week. Avoid crash diets. Focus on whole foods, protein, and regular activity.",
    "back pain": "For **back pain**: maintain good posture, strengthen core muscles, use proper lifting techniques, apply ice/heat, take OTC pain relievers, and see a doctor if pain radiates down your leg.",
}

def answer_health_question(message):
    message_lower = message.lower()
    for keyword, response in CHAT_KB.items():
        if keyword in message_lower:
            return response
    
    # Generic health tips
    health_tips = [
        "I'm not trained on that specific topic. General health advice: stay hydrated, exercise regularly, sleep 7-9 hours, eat a balanced diet, and schedule regular checkups with your doctor.",
        "That's a great health question! I recommend consulting a healthcare professional for personalized advice. General wellbeing tip: regular exercise and a balanced diet are foundational to good health.",
        "I don't have specific information on that. Please consult your doctor. Remember: preventive care through healthy lifestyle choices is the best medicine.",
    ]
    import random
    return random.choice(health_tips)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '').strip()
    
    if not message:
        return jsonify({"error": "No message provided"}), 400
    
    reply = answer_health_question(message)
    return jsonify({"reply": reply})

# ─── /analyze endpoint ─────────────────────────────────────────────────────────

def extract_abnormal_values(text):
    """Extract lab values that are marked high/low/elevated."""
    abnormals = []
    text_lower = text.lower()
    
    # Look for patterns like "value: X (High/Low/Elevated)"
    patterns = [
        (r'blood pressure[:\s]+([\d/]+)\s*mmhg.*?high', 'Blood Pressure', 'high'),
        (r'hemoglobin[:\s]+([\d.]+)\s*g/dl.*?low', 'Hemoglobin', 'low'),
        (r'wbc[:\s]+([\d,]+).*?elevated', 'WBC Count', 'high'),
        (r'total cholesterol[:\s]+([\d]+)\s*mg/dl.*?high', 'Total Cholesterol', 'high'),
        (r'ldl[:\s]+([\d]+)\s*mg/dl.*?high', 'LDL Cholesterol', 'high'),
        (r'hdl[:\s]+([\d]+)\s*mg/dl.*?low', 'HDL Cholesterol', 'low'),
        (r'triglycerides[:\s]+([\d]+)\s*mg/dl.*?high', 'Triglycerides', 'high'),
        (r'blood sugar.*?fasting.*?[:\s]+([\d]+)\s*mg/dl', 'Blood Sugar', 'high'),
        (r'creatinine[:\s]+([\d.]+)\s*mg/dl.*?elevated', 'Creatinine', 'high'),
    ]
    
    for pat, name, status in patterns:
        match = re.search(pat, text_lower)
        if match:
            abnormals.append({"name": name, "value": match.group(1), "status": status})
    
    return abnormals

def summarize_report(text):
    """Rule-based text summarizer for medical reports."""
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    # Extract key sections
    findings = []
    recommendations = []
    summary_parts = []
    
    for line in lines:
        line_lower = line.lower()
        if any(k in line_lower for k in ['diagnosis:', 'impression:', 'conclusion:']):
            summary_parts.append(line.split(':', 1)[-1].strip())
        if any(k in line_lower for k in ['elevated', 'high', 'low', 'abnormal', 'poor']):
            findings.append(f"⚠️ {line}")
        elif any(k in line_lower for k in ['normal', 'within range']):
            findings.append(f"✅ {line}")
        if any(k in line_lower for k in ['prescribed', 'recommended', 'advised', 'follow-up', 'medication']):
            recommendations.append(line)
    
    summary = ' '.join(summary_parts) if summary_parts else "Review of the provided medical report indicates multiple health parameters for evaluation."
    
    # Ensure we always return some findings
    if not findings and lines:
        findings = [f"📋 {l}" for l in lines[:5] if len(l) > 20]
    
    if not recommendations:
        recommendations = [
            "Follow up with your primary care physician",
            "Monitor flagged parameters regularly",
            "Maintain a healthy diet and exercise routine",
            "Take prescribed medications as directed"
        ]
    
    return summary, findings[:8], recommendations[:5]

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    report = data.get('report', '').strip()
    
    if not report:
        return jsonify({"error": "No report text provided"}), 400
    
    summary, key_findings, recommendations = summarize_report(report)
    abnormal_values = extract_abnormal_values(report)
    
    return jsonify({
        "summary": summary,
        "key_findings": key_findings,
        "abnormal_values": abnormal_values,
        "recommendations": recommendations
    })

# ─── Health check ──────────────────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "OK", "message": "ML Service running"})

if __name__ == '__main__':
    print("🚀 ML Service starting on port 8000...")
    app.run(port=8000, debug=True)
