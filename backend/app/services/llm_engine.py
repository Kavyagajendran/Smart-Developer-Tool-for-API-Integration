import os
import json
import logging
from typing import Optional, Dict, Any
import google.generativeai as genai
from openai import OpenAI
from app.models import ApiSchema

logger = logging.getLogger(__name__)

class LLMEngine:
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        
        if self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
            self.gemini_model = genai.GenerativeModel('gemini-2.0-flash')
        
        if self.openai_api_key:
            self.openai_client = OpenAI(api_key=self.openai_api_key)

    async def parse_documentation(self, text_content: str, provider: str = "gemini") -> ApiSchema:
        """
        Parses raw text documentation into a structured ApiSchema using an LLM.
        """
        prompt = f"""
        You are an expert API documentation parser. Your task is to extract structured API information from the following raw text.
        
        Raw Text:
        {text_content[:30000]}  # Truncate to avoid context limits if necessary
        
        Return the result as a strict JSON object matching the following structure (do not include markdown code blocks):
        {{
            "title": "API Title",
            "description": "API Description",
            "base_url": "https://api.example.com",
            "endpoints": [
                {{
                    "path": "/endpoint",
                    "method": "GET",
                    "description": "Endpoint description",
                    "parameters": [
                        {{
                            "name": "param_name",
                            "type": "string",
                            "required": true,
                            "description": "Parameter description"
                        }}
                    ],
                    "response_schema": {{ "key": "value" }}
                }}
            ]
        }}
        """

        try:
            if provider == "gemini" and self.gemini_api_key:
                logger.info("Using Gemini for parsing")
                response = self.gemini_model.generate_content(prompt)
                json_str = response.text.replace("```json", "").replace("```", "").strip()
                data = json.loads(json_str)
                return ApiSchema(**data)
            
            elif provider == "openai" and self.openai_api_key:
                logger.info("Using OpenAI for parsing")
                response = self.openai_client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant that parses API documentation."},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"}
                )
                json_str = response.choices[0].message.content
                data = json.loads(json_str)
                return ApiSchema(**data)
            
            else:
                raise ValueError("Selected provider not available or API key missing.")

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON. Raw response: {json_str}")
            raise ValueError(f"LLM returned invalid JSON: {e}")
        except Exception as e:
            logger.error(f"Error extracting schema with LLM: {e}")
            raise
