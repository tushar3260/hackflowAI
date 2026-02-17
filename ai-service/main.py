
from flask import Flask, request, jsonify
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

# Download NLTK data (lightweight)
try:
    nltk.data.find('vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')

try:
    nltk.data.find('punkt')
except LookupError:
    nltk.download('punkt')

app = Flask(__name__)

# --- IDEAL PROJECT ARCHETYPES (The "Training Data") ---
# We compare submissions against these "perfect" descriptions to measure alignment.

IDEAL_INNOVATION = """
This project introduces a novel, groundbreaking approach to solving a complex problem. 
It utilizes state-of-the-art technology, unique algorithms, and patent-pending methods. 
The solution is a game-changer, disrupting the current market with creativity and out-of-the-box thinking.
It leverages generative AI, blockchain, or quantum computing in a way never seen before.
"""

IDEAL_TECHNICAL = """
The system architecture is highly scalable, secure, and optimized for performance. 
It uses microservices, Docker, Kubernetes, and efficient database schemas. 
The code is clean, modular, and follows best practices with low latency and high throughput. 
API endpoints are RESTful or GraphQL, with robust authentication and encryption.
Implementation details show a deep understanding of the tech stack (React, Node, Python, cloud).
"""

IDEAL_BUSINESS = """
The product has a clear target audience and a strong business model. 
It addresses a significant market need with a cost-effective solution. 
The plan includes user acquisition strategies, retention metrics, and a path the monetization.
It demonstrates high ROI, financial feasibility, and real-world impact.
"""

# Combined corpus for vectorization training
CORPUS = [IDEAL_INNOVATION, IDEAL_TECHNICAL, IDEAL_BUSINESS]

# Initialize Vectorizer
vectorizer = TfidfVectorizer(stop_words='english')
# "Train" the vectorizer on our ideal archetypes
tfidf_matrix_archetypes = vectorizer.fit_transform(CORPUS)

# Initialize Sentiment Analyzer
sia = SentimentIntensityAnalyzer()

def get_similarity_scores(text):
    if not text or len(text.strip()) < 10:
        return 0, 0, 0
    
    # Transform submission text into the same vector space
    submission_vector = vectorizer.transform([text])
    
    # Calculate Cosine Similarity against each archetype
    # similarity_matrix shape: [1, 3] (1 submission vs 3 archetypes)
    similarities = cosine_similarity(submission_vector, tfidf_matrix_archetypes)
    
    inn_score = similarities[0][0] # Index 0: Innovation
    tech_score = similarities[0][1] # Index 1: Technical
    biz_score = similarities[0][2] # Index 2: Business
    
    return inn_score, tech_score, biz_score

@app.route('/analyze-submission', methods=['POST'])
def analyze_submission():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    notes_text = data.get('notesText', "")
    extracted_text = data.get('extractedText', "")
    github_url = data.get('githubUrl', "")
    criteria = data.get('criteria', [])
    
    combined_text = (notes_text or "") + "\n" + (extracted_text or "")
    
    # --- 1. ML Analysis via TF-IDF & Cosine Similarity ---
    sim_innovation, sim_technical, sim_business = get_similarity_scores(combined_text)
    
    # --- 2. Sentiment Analysis ---
    sentiment_score = sia.polarity_scores(combined_text)['compound'] # -1 to 1
    
    # Normalize scores (0.0 - 1.0) -> scaled to 0-10 or 0-100 logic
    # Similarity scores are usually low (0.1 - 0.4) for short text vs archetype.
    # We apply a scaling factor to make them human-readable "grades".
    # E.g., a similarity of 0.2 might be a "good" match in VSM.
    
    def scale_sim(score):
        return min(score * 4.0, 1.0) # Scale up: 0.25 -> 1.0 (100%)

    scaled_inn = scale_sim(sim_innovation)
    scaled_tech = scale_sim(sim_technical)
    scaled_biz = scale_sim(sim_business)
    
    scores = []
    total_score = 0
    total_max = 0
    
    strengths = []
    weaknesses = []
    tips = []
    risks = []
    
    # --- 3. Criteria Scoring ---
    for crit in criteria:
        c_title = crit.get('title', "").lower()
        c_max = crit.get('maxMarks', 0)
        c_score = 0
        reason = ""
        total_max += c_max
        
        # Smart Mapping based on Criteria Title
        if "innovation" in c_title or "novelty" in c_title:
            c_score = scaled_inn * c_max
            reason = f"ML Innovation Match: {int(scaled_inn*100)}%."
            if scaled_inn > 0.7: strengths.append("Concept is highly aligned with innovation standards.")
            else: tips.append("Try to describe unique value proposition more clearly.")
            
        elif "technical" in c_title or "code" in c_title:
            base_score = scaled_tech
            if github_url: 
                base_score = min(base_score + 0.2, 1.0) # Bonus for repo
                reason = "GitHub Repo Bonus + "
            
            c_score = base_score * c_max
            reason += f"ML Tech Match: {int(scaled_tech*100)}%."
            if scaled_tech < 0.4: weaknesses.append("Technical architecture description is vague.")
            
        elif "business" in c_title or "impact" in c_title:
            c_score = scaled_biz * c_max
            reason = f"ML Business Match: {int(scaled_biz*100)}%."
            
        else:
            # Fallback: lexical diversity (unique words / total words)
            words = nltk.word_tokenize(combined_text)
            unique_words = set(words)
            lexical_diversity = len(unique_words) / len(words) if words else 0
            
            # Length penalty
            length_factor = min(len(words) / 100.0, 1.0)
            
            c_score = (lexical_diversity * 0.5 + length_factor * 0.5) * c_max
            reason = f"Scored based on content richness ({int(lexical_diversity*100)}%)."

        # Sentiment Adjustment (Enthusiastic pitches get a small boost)
        if sentiment_score > 0.5:
             c_score = min(c_score * 1.05, c_max)
        
        c_score = round(max(c_score, c_max * 0.1), 1) # Min 10%
        scores.append({
            "criteriaTitle": crit.get('title', ""),
            "score": c_score,
            "reason": reason
        })
        total_score += c_score

    # --- 4. Summary Generation ---
    summary = "Analysis Complete. "
    if scaled_inn > 0.6: summary += "Strong innovative elements detected. "
    if scaled_tech > 0.6: summary += "Technical implementation appears robust. "
    if scaled_biz > 0.6: summary += "Business viability is clear. "
    
    if len(combined_text) < 50:
        risks.append("Submission text is extremely short.")
    if not github_url:
        risks.append("Missing source code link.")

    return jsonify({
        "aiScores": scores,
        "totalAiScore": round(total_score, 1),
        "summary": summary,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "improvementTips": tips,
        "innovationScore": round(scaled_inn * 10, 1),
        "riskFlags": risks
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
