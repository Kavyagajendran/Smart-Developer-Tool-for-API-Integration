import requests
import sys

try:
    print("Testing Health Endpoint...")
    r = requests.get("http://localhost:8000/api/health", timeout=5)
    print(f"Health Response: {r.status_code} {r.text}")
    
    print("Testing Root Endpoint (Frontend)...")
    r2 = requests.get("http://localhost:8000/", timeout=5)
    print(f"Root Response: {r2.status_code} Content-Type: {r2.headers.get('content-type')}")
    
    if r.status_code == 200 and r2.status_code == 200:
         print("SUCCESS")
    else:
         print("FAILURE")
         sys.exit(1)

except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
