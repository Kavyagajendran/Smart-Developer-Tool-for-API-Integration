import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"

def test_health_check():
    print("\n--- Testing Health Check ---")
    payload = {
        "url": "https://httpbin.org/get",
        "method": "GET"
    }
    response = requests.post(f"{BASE_URL}/health-check", json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

def test_generate_snippet():
    print("\n--- Testing Generate Snippet ---")
    payload = {
        "endpoint": {
            "path": "/data/2.5/weather",
            "method": "GET",
            "description": "Get current weather",
            "parameters": [
                {"name": "q", "type": "string", "required": True, "description": "City name"},
                {"name": "appid", "type": "string", "required": True, "description": "API Key"}
            ]
        },
        "base_url": "https://api.openweathermap.org",
        "language": "python"
    }
    response = requests.post(f"{BASE_URL}/generate-snippet", json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response Code Snippet:\n{response.json().get('code')}")

def test_export_markdown():
    print("\n--- Testing Export Markdown ---")
    payload = {
        "title": "OpenWeatherMap API",
        "base_url": "https://api.openweathermap.org",
        "endpoints": [
            {
                "path": "/data/2.5/weather",
                "method": "GET",
                "description": "Get current weather",
                "parameters": [
                    {"name": "q", "type": "string", "required": True, "description": "City name"}
                ]
            }
        ]
    }
    response = requests.post(f"{BASE_URL}/export-markdown", json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response (Prefix): {response.json().get('markdown')[:50]}...")

if __name__ == "__main__":
    # Wait for server to start
    print("Waiting for server to start...")
    time.sleep(3) 
    
    try:
        test_health_check()
        test_generate_snippet()
        test_export_markdown()
        # Skipped heavy LLM tests (analyze-quality, semantic-map) for quick verification
        # to avoid exceeding quotas or waiting too long, but they are implemented similarly.
    except Exception as e:
        print(f"Test failed: {e}")
