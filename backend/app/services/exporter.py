from app.models import ApiSchema
import json
from typing import Dict

class Exporter:
    def convert_to_markdown(self, schema: ApiSchema) -> str:
        """Convert API schema to Markdown documentation."""
        md = f"# {schema.title}\n\n"
        md += f"**Base URL**: {schema.base_url}\n\n"
        md += f"{schema.description or ''}\n\n"
        
        md += "## Endpoints\n\n"
        for ep in schema.endpoints:
            md += f"### {ep.method} {ep.path}\n\n"
            md += f"{ep.description or 'No description'}\n\n"
            
            if ep.parameters:
                md += "**Parameters**:\n"
                md += "| Name | Type | Required | Description |\n"
                md += "|------|------|----------|-------------|\n"
                for p in ep.parameters:
                    req = "Yes" if p.required else "No"
                    md += f"| {p.name} | {p.type} | {req} | {p.description or ''} |\n"
                md += "\n"
                
            md += "---\n\n"
        return md

    def convert_to_postman(self, schema: ApiSchema) -> Dict:
        """Convert API schema to Postman Collection JSON format."""
        item = []
        for ep in schema.endpoints:
            request = {
                "method": ep.method,
                "header": [{"key": "Content-Type", "value": "application/json"}],
                "url": {
                    "raw": f"{schema.base_url}{ep.path}",
                    "protocol": schema.base_url.split("://")[0],
                    "host": schema.base_url.split("://")[1].split("/"),
                    "path": ep.path.strip("/").split("/")
                },
                "description": ep.description
            }
            
            # Add basic query params if needed (simplification)
            if ep.parameters and ep.method == "GET":
                request["url"]["query"] = [
                    {"key": p.name, "value": "", "description": p.description} for p in ep.parameters
                ]
            
            item.append({
                "name": f"{ep.method} {ep.path}",
                "request": request
            })

        return {
            "info": {
                "name": schema.title,
                "description": schema.description,
                "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
            },
            "item": item
        }
