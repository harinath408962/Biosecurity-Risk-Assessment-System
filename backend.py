import os
import json
import joblib
from http.server import HTTPServer, BaseHTTPRequestHandler

# Resolve paths to model files in the same directory as this script
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'biosecurity_model.pkl')
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), 'biosecurity_vectorizer.pkl')

model = None
vectorizer = None

# Attempt to load the trained model and vectorizer
try:
    if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
        model = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)
        print("Successfully loaded biosecurity_model.pkl and biosecurity_vectorizer.pkl.")
    else:
        print("Warning: biosecurity_model.pkl or biosecurity_vectorizer.pkl not found. Running in rule-based simulation fallback mode.")
except Exception as e:
    print(f"Error loading machine learning model: {e}. Running in simulation fallback mode.")


def explain_prediction(prediction, score, indicators):
    """
    Generates a log output explaining the ML prediction.
    """
    print(f"[ML Engine] Raw Prediction: {prediction} ({score}%) | Indicators detected: {indicators}")


def determine_final_risk(prediction, indicators):
    """
    If prediction is Medium or High but no critical biosecurity indicators are detected,
    downgrade the risk level to Low.
    """
    high_keywords = {"bacillus anthracis", "anthrax", "ebola", "aerosolization", 
                     "vaccine-induced immunity", "lethality", "spore wall modifications", "exosporium", "virulence"}
    medium_keywords = {"h5n1", "aerosol transmission", "exposure chamber", "dual-use"}

    ind_lower = [ind.lower() for ind in indicators]

    has_high = any(k in ind_lower for k in high_keywords)
    has_medium = any(k in ind_lower for k in medium_keywords)

    if prediction == "High" and not has_high:
        return "Medium" if has_medium else "Low"
    if prediction == "Medium" and not (has_high or has_medium):
        return "Low"
        
    return prediction


def recommend_bsl(risk_level, text):
    """
    Determines BSL level recommendation based on final risk level and keyword contexts.
    """
    text_lower = text.lower()
    if risk_level == "High":
        if "ebola" in text_lower:
            return "BSL-4"
        return "BSL-3"
    elif risk_level == "Medium":
        if "influenza" in text_lower or "h5n1" in text_lower or "aerosol" in text_lower:
            return "BSL-3"
        return "BSL-2"
    return "BSL-1"


def analyze_research_text(text):
    """
    ML Prediction Pipeline using Final Decision Flow:
    ML Prediction -> Indicator Detection -> determine_final_risk() -> recommend_bsl() -> Response
    """
    if model is None or vectorizer is None:
        # Fallback simulation if model files are missing on start
        return {
            "Risk Level": "Low",
            "Prediction Score": 10,
            "Indicators": [],
            "BSL": "BSL-1"
        }

    # 1. Transform text using the loaded TF-IDF vectorizer
    vectorized_text = vectorizer.transform([text])

    # 2. Predict raw Risk Level class
    raw_prediction = model.predict(vectorized_text)[0]  # E.g., 'Low', 'Medium', 'High'

    # Calculate raw Prediction Score (probability percentage)
    try:
        probabilities = model.predict_proba(vectorized_text)[0]
        classes = list(model.classes_)
        pred_idx = classes.index(raw_prediction)
        raw_score = int(round(probabilities[pred_idx] * 100))
    except Exception:
        raw_score = 90  # Fallback score if predict_proba is not supported

    # 3. Extract active Indicators (matching words present in the TF-IDF feature vocabulary)
    try:
        feature_names = vectorizer.get_feature_names_out()
    except Exception:
        try:
            feature_names = vectorizer.get_feature_names()
        except Exception:
            feature_names = []

    words = text.lower().split()
    detected_indicators = []
    for word in words:
        # Strip punctuation
        cleaned_word = "".join(char for char in word if char.isalnum())
        if cleaned_word in feature_names and cleaned_word not in detected_indicators:
            detected_indicators.append(cleaned_word)

    # Detect multi-word biosecurity phrases
    biosecurity_phrases = ["bacillus anthracis", "vaccine-induced immunity", "spore wall modifications", "aerosol transmission", "exposure chamber"]
    text_lower = text.lower()
    for phrase in biosecurity_phrases:
        if phrase in text_lower:
            detected_indicators.append(phrase)

    # 4. Call explain_prediction()
    explain_prediction(raw_prediction, raw_score, detected_indicators)

    # 5. Call determine_final_risk()
    final_risk = determine_final_risk(raw_prediction, detected_indicators)

    # 6. Call recommend_bsl()
    bsl = recommend_bsl(final_risk, text)

    # Adjust Prediction Score based on the final determined risk level
    final_score = raw_score
    if final_risk == "Low" and raw_prediction != "Low":
        # Scale score down to low range (5% - 20%)
        final_score = max(5, int(round(raw_score * 0.15)))
    elif final_risk == "Medium" and raw_prediction == "High":
        # Scale score down to medium range (35% - 65%)
        final_score = max(35, int(round(raw_score * 0.6)))
    elif final_risk == "High" and raw_prediction != "High":
        # Scale score up to high range (75% - 98%)
        final_score = min(98, max(75, raw_score))

    # Filter indicators to return only valid biosecurity keywords for frontend mapping
    biosecurity_keywords = {
        "bacillus anthracis", "anthrax", "ebola", "aerosolization", 
        "vaccine-induced immunity", "lethality", "spore wall modifications", "exosporium", "virulence",
        "h5n1", "aerosol transmission", "exposure chamber", "dual-use"
    }
    
    final_indicators = []
    for kw in biosecurity_keywords:
        if kw in text_lower:
            original_kw = kw
            if kw == "bacillus anthracis":
                original_kw = "Bacillus anthracis"
            elif kw == "ebola":
                original_kw = "Ebola"
            elif kw == "h5n1":
                original_kw = "H5N1"
            elif kw == "vaccine-induced immunity":
                original_kw = "vaccine-induced immunity"
            elif kw == "spore wall modifications":
                original_kw = "spore wall modifications"
            elif kw == "aerosol transmission":
                original_kw = "aerosol transmission"
            elif kw == "exposure chamber":
                original_kw = "exposure chamber"
            elif kw == "dual-use":
                original_kw = "dual-use"
            elif kw == "aerosolization":
                original_kw = "aerosolization"
            elif kw == "lethality":
                original_kw = "lethality"
            elif kw == "exosporium":
                original_kw = "exosporium"
            elif kw == "anthrax":
                original_kw = "anthrax"
            elif kw == "virulence":
                original_kw = "virulence"
            final_indicators.append(original_kw)

    return {
        "Risk Level": final_risk,
        "Prediction Score": final_score,
        "Indicators": final_indicators,
        "BSL": bsl
    }


class MLAPIRequestHandler(BaseHTTPRequestHandler):
    """
    HTTP Request Handler serving CORS headers and POST /api/analyze endpoint
    """
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/analyze':
            content_length_header = self.headers.get('Content-Length')
            content_length = int(content_length_header) if content_length_header else 0
            post_data = self.rfile.read(content_length) if content_length > 0 else b'{}'

            try:
                payload = json.loads(post_data.decode('utf-8'))
                if not payload or 'text' not in payload:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Missing 'text' property in request body"}).encode('utf-8'))
                    return

                # Execute classification pipeline
                result = analyze_research_text(payload['text'])

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode('utf-8'))

            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()


def serve(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, MLAPIRequestHandler)
    print(f"Python ML Backend Server running at http://localhost:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Python ML Backend Server...")
        pass


if __name__ == '__main__':
    serve()
