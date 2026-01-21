import urllib.request
import json
import urllib.error

url = "http://127.0.0.1:8002/api/parse"
data = {"url": "https://old.openweathermap.org/current"}
headers = {"Content-Type": "application/json"}

req = urllib.request.Request(url, data=json.dumps(data).encode(), headers=headers)

print(f"Sending POST request to {url} with data: {data}")

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        print("Response Body:")
        print(response.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code} {e.reason}")
    print("Error Body:")
    print(e.read().decode())
except urllib.error.URLError as e:
    print(f"URL Error: {e.reason}")
except Exception as e:
    print(f"An error occurred: {e}")
