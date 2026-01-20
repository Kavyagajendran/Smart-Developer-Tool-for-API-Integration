from jinja2 import Template
from app.models import ApiSchema, Endpoint
import json

class CodeGenerator:
    def generate_python_sdk(self, schema: ApiSchema) -> str:
        """
        Generates a Python SDK based on the provided ApiSchema using Jinja2 templates.
        """
        template_str = """import requests

class Client:
    def __init__(self, base_url="{{ schema.base_url }}", api_key=None):
        self.base_url = base_url
        self.session = requests.Session()
        if api_key:
            self.session.headers.update({"Authorization": f"Bearer {api_key}"})

    {% for endpoint in schema.endpoints %}
    def {{ endpoint.method | lower }}_{{ endpoint.path | replace("/", "_") | replace("{", "") | replace("}", "") | trim("_") }}(self, {% for param in endpoint.parameters %}{{ param.name }}=None, {% endfor %}**kwargs):
        test_url = f"{self.base_url}{{ endpoint.path }}"
        {% if endpoint.parameters %}
        params = { {% for param in endpoint.parameters %}"{{ param.name }}": {{ param.name }},{% endfor %} }
        params = {k: v for k, v in params.items() if v is not None}
        {% endif %}
        
        return self.session.request(
            "{{ endpoint.method }}", 
            test_url, 
            {% if endpoint.method == "GET" and endpoint.parameters %}params=params,{% endif %}
            {% if endpoint.method != "GET" and endpoint.parameters %}json=params,{% endif %}
            **kwargs
        )
    {% endfor %}
"""
        template = Template(template_str)
        return template.render(schema=schema)

    def generate_snippet(self, endpoint: Endpoint, base_url: str, language: str) -> str:
        """
        Generates a code snippet for a specific endpoint in the requested language.
        Supported languages: python, javascript, curl
        """
        if language.lower() == "curl":
            return self._generate_curl_snippet(endpoint, base_url)
        elif language.lower() == "javascript":
            return self._generate_js_snippet(endpoint, base_url)
        else:
            return self._generate_python_snippet(endpoint, base_url)

    def _generate_curl_snippet(self, endpoint: Endpoint, base_url: str) -> str:
        url = f"{base_url}{endpoint.path}"
        cmd = f"curl -X {endpoint.method} \"{url}\""
        
        # Add headers (generic example)
        cmd += " \\\n  -H \"Content-Type: application/json\""
        
        # Add data if not GET
        if endpoint.method != "GET" and endpoint.parameters:
            data = {p.name: "value" for p in endpoint.parameters}
            cmd += f" \\\n  -d '{json.dumps(data)}'"
            
        return cmd

    def _generate_js_snippet(self, endpoint: Endpoint, base_url: str) -> str:
        url = f"{base_url}{endpoint.path}"
        data_str = ""
        
        if endpoint.method != "GET" and endpoint.parameters:
            data = {p.name: "value" for p in endpoint.parameters}
            data_str = f",\n  body: JSON.stringify({json.dumps(data)})"

        return f"""fetch("{url}", {{
  method: "{endpoint.method}",
  headers: {{
    "Content-Type": "application/json"
  }}{data_str}
}})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));"""

    def _generate_python_snippet(self, endpoint: Endpoint, base_url: str) -> str:
        url = f"{base_url}{endpoint.path}"
        payload_section = ""
        
        if endpoint.method != "GET" and endpoint.parameters:
            data = {p.name: "value" for p in endpoint.parameters}
            payload_section = f"\npayload = {json.dumps(data)}\n"
            
        req_call = f'response = requests.request("{endpoint.method}", url'
        if payload_section:
            req_call += ", json=payload"
        req_call += ")"
        
        return f"""import requests
{payload_section}
url = "{url}"

{req_call}

print(response.text)"""
