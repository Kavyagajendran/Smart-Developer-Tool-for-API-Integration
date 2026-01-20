from app.models import ApiSchema
import google.generativeai as genai
import json
from typing import Dict, Any

class SemanticMapper:
    def __init__(self):
        pass

    async def map_query_to_endpoint(self, schema: ApiSchema, query: str) -> Dict[str, Any]:
        """
        Finds the best matching endpoint for a natural language query.
        """
        model = genai.GenerativeModel('gemini-pro')
        
        # Simplify schema for prompt to save tokens
        endpoints_summary = []
        for ep in schema.endpoints:
            endpoints_summary.append(f"{ep.method} {ep.path}: {ep.description}")
        
        prompt = f"""
        Given the following API endpoints and a user query, identify the single best matching endpoint.
        
        Endpoints:
        {json.dumps(endpoints_summary, indent=2)}
        
        User Query: "{query}"
        
        Return a JSON object with:
        {{
            "method": "<method>",
            "path": "<path>",
            "reasoning": "<why_this_matches>"
        }}
        
        If no endpoint matches well, return null for method and path.
        Do not include markdown formatting.
        """
        
        try:
            response = await model.generate_content_async(prompt)
            text = response.text.strip().replace('```json', '').replace('```', '')
            return json.loads(text)
        except Exception as e:
            print(f"Error in semantic mapping: {e}")
            return {"method": None, "path": None, "reasoning": "Error processing query"}
