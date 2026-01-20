from app.models import ApiSchema
import google.generativeai as genai
import json
import os
from typing import Dict, Any, List

class QualityAnalyzer:
    def __init__(self):
        # Assumes GOOGLE_API_KEY is set in environment from main.py/config
        pass

    async def analyze_quality(self, schema: ApiSchema) -> Dict[str, Any]:
        """
        Analyzes the quality of the API documentation based on the schema.
        Scores based on completeness, descriptions, and authentication details.
        """
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""
        Analyze the quality of this API endpoint documentation schema and return a JSON object.
        
        Schema Title: {schema.title}
        Base URL: {schema.base_url}
        Endpoints: {len(schema.endpoints)}
        
        Evaluate based on:
        1. Clarity of descriptions (Are they vague or detailed?)
        2. Completeness of parameters (Are types and requirements clear?)
        3. Authentication information (Is it clear how to authenticate?)
        
        Return STRICTLY valid JSON with this structure:
        {{
            "score": <integer_0_to_10>,
            "summary": "<short_summary_text>",
            "issues": ["<list_of_specific_issues_found>"],
            "suggestions": ["<list_of_improvements>"]
        }}
        
        Do not include markdown formatting like ```json ... ```. Just the raw JSON string.
        """
        
        try:
            response = await model.generate_content_async(prompt)
            text = response.text.strip().replace('```json', '').replace('```', '')
            return json.loads(text)
        except Exception as e:
            print(f"Error in quality analysis: {e}")
            return {
                "score": 0,
                "summary": "Failed to analyze quality.",
                "issues": [f"Analysis error: {str(e)}"],
                "suggestions": []
            }
