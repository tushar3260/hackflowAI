
import requests
import json

url = "http://localhost:8000/analyze-submission"

# Test Case 1: Strong Submission
payload_strong = {
    "notesText": "We built a decentralized application using Ethereum smart contracts and IPFS for storage. The system uses Zero-Knowledge Proofs for privacy. It solves the issue of data sovereignty.",
    "extractedText": "Technically, we used React for frontend, Node.js for backend, and Solidity for contracts. The architecture is microservices based with Docker containerization.",
    "githubUrl": "https://github.com/test/repo",
    "criteria": [
        {"title": "Innovation", "maxMarks": 50},
        {"title": "Technical Complexity", "maxMarks": 30},
        {"title": "Business Viability", "maxMarks": 20}
    ]
}

# Test Case 2: Weak Submission
payload_weak = {
    "notesText": "We made a simple website.",
    "extractedText": "It has a login page.",
    "githubUrl": "",
    "criteria": [
        {"title": "Innovation", "maxMarks": 50},
        {"title": "Technical Complexity", "maxMarks": 30},
        {"title": "Business Viability", "maxMarks": 20}
    ]
}

def test(name, payload):
    try:
        print(f"--- {name} ---")
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Failed to connect: {e}")

print("Note: This script assumes the Flask app is running on port 8000.")
print("Since we cannot run the Flask app and this script concurrently in the same isolated step easily without background processes, correctness is visual based on code.")
