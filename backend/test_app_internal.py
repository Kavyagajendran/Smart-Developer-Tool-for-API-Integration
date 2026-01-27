from fastapi.testclient import TestClient
import os
import sys

# Add app to path
sys.path.append(os.getcwd())

from main import app

client = TestClient(app)

def test_parse():
    url = "https://old.openweathermap.org/current"
    print(f"Testing local parse with URL: {url}")
    
    response = client.post("/api/parse", json={"url": url})
    
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    try:
        print(response.json())
    except:
        print(response.text)

if __name__ == "__main__":
    test_parse()
