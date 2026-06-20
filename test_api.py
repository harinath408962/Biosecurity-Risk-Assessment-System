import requests

test_cases = [
    "Researchers used CRISPR gene editing techniques.",
    "Researchers used CRISPR gene editing to modify bacterial virulence.",
    "Researchers enhanced aerosol transmission and virulence of a pathogen."
]

for text in test_cases:
    print(f"\n--- Testing: '{text}' ---")
    response = requests.post(
        "http://localhost:8000/api/analyze",
        json={"text": text}
    )
    print("Status:", response.status_code)
    print("Response:", response.json())