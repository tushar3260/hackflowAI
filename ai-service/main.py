from flask import Flask, request, jsonify
import re

app = Flask(__name__)

# --- HEURISTIC KNOWLEDGE BASE ---
INNOVATION_KEYWORDS = [
    "novel", "unique", "patent", "breakthrough", "cutting-edge", "proprietary",
    "state-of-the-art", "revolutionize", "game-changer", "advanced algorithm",
    "machine learning", "blockchain", "generative ai", "neural network", "quantum"
]

TECHNICAL_KEYWORDS = [
    "architecture", "scalability", "latency", "throughput", "endpoint", "api",
    "database", "schema", "microservices", "docker", "kubernetes", "react", "node",
    "optimization", "security", "authentication", "encryption"
]

BUSINESS_KEYWORDS = [
    "market fit", "target audience", "revenue model", "monetization", "cost-effective",
    "scalability", "user acquisition", "retention", "roi", "business plan"
]

def calculate_keyword_score(text: str, keywords: list) -> float:
    text_lower = text.lower()
    count = 0
    for kw in keywords:
        if kw in text_lower:
            count += 1
    # Simple sigmoid-like saturation: 0 keywords = 0, 5+ keywords = 1.0
    score = min(count / 5.0, 1.0)
    return score

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
    
    # 1. Innovation Score
    inn_score = calculate_keyword_score(combined_text, INNOVATION_KEYWORDS) * 10 
    
    scores = []
    total_score = 0
    total_max = 0
    
    strengths = []
    weaknesses = []
    tips = []
    risks = []
    
    # Sum maxMarks
    for c in criteria:
        total_max += c.get('maxMarks', 0)

    # 2. Criteria Analysis
    for crit in criteria:
        c_title = crit.get('title', "").lower()
        c_max = crit.get('maxMarks', 0)
        c_score = 0
        reason = ""
        
        # Heuristic mapping based on title
        if "innovation" in c_title or "novelty" in c_title:
            ratio = calculate_keyword_score(combined_text, INNOVATION_KEYWORDS)
            c_score = ratio * c_max
            reason = f"Detected {int(ratio*5)} innovation keywords."
            if ratio > 0.6: strengths.append("Strong usage of innovation terminology.")
            else: tips.append("Highlight more innovative aspects or technologies used.")
            
        elif "technical" in c_title or "code" in c_title or "implementation" in c_title:
            ratio = calculate_keyword_score(combined_text, TECHNICAL_KEYWORDS)
            # Github URL bonus
            if github_url:
                ratio = min(ratio + 0.3, 1.0)
                reason += " GitHub URL provided (+)."
            
            c_score = ratio * c_max
            reason = f"Technical content analysis score: {int(ratio*100)}%."
            if ratio < 0.4: weaknesses.append("Technical implementation details seem sparse.")
            
        elif "business" in c_title or "feasibility" in c_title or "impact" in c_title:
            ratio = calculate_keyword_score(combined_text, BUSINESS_KEYWORDS)
            c_score = ratio * c_max
            reason = f"Business/Impact terms found."
            if ratio < 0.3: tips.append("Elaborate on the business model or real-world impact.")
            
        else:
            # Default generic scoring based on length/structure
            length_ratio = min(len(combined_text) / 1000.0, 1.0) # 1000 chars = max score
            c_score = length_ratio * c_max
            reason = "Scored based on description completeness."
            
        # Rounding & ensuring minimum 20%
        c_score = round(max(c_score, c_max * 0.2), 1) 
        scores.append({
            "criteriaTitle": crit.get('title', ""),
            "score": c_score,
            "reason": reason
        })
        total_score += c_score

    # 3. Overall Summary
    summary = "The submission "
    if total_max > 0 and total_score / total_max > 0.7:
        summary += "shows strong potential with detailed descriptions. "
    else:
        summary += "appears to be an early stage prototype or lacks detailed documentation. "
        
    if "python" in combined_text.lower(): summary += "Python detected. "
    if "javascript" in combined_text.lower() or "js" in combined_text.lower(): summary += "JavaScript detected. "
    
    if len(combined_text) < 100:
        risks.append("Description is very short.")
    if not github_url:
        risks.append("No GitHub URL provided.")

    return jsonify({
        "aiScores": scores,
        "totalAiScore": round(total_score, 1),
        "summary": summary,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "improvementTips": tips,
        "innovationScore": round(inn_score, 1),
        "riskFlags": risks
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
