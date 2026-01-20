import httpx
import time
from typing import Dict, Any

class HealthChecker:
    async def check_endpoint_health(self, url: str, method: str = "GET", params: Dict = None, headers: Dict = None, body: Any = None) -> Dict[str, Any]:
        """
        Checks the health of an API endpoint by making a real HTTP request.
        Returns the status code, latency (ms), and a success boolean.
        """
        start_time = time.time()
        try:
            async with httpx.AsyncClient() as client:
                response = await client.request(method, url, params=params, headers=headers, json=body, timeout=10.0)
                latency = (time.time() - start_time) * 1000  # Convert to ms
                
                return {
                    "status_code": response.status_code,
                    "latency_ms": round(latency, 2),
                    "is_healthy": 200 <= response.status_code < 300,
                    "error": None
                }
        except Exception as e:
            latency = (time.time() - start_time) * 1000
            return {
                "status_code": None,
                "latency_ms": round(latency, 2),
                "is_healthy": False,
                "error": str(e)
            }
