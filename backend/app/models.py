from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Parameter(BaseModel):
    name: str = Field(..., description="Name of the parameter")
    type: str = Field(..., description="Type of the parameter (e.g., string, integer)")
    required: bool = Field(..., description="Whether the parameter is required")
    description: Optional[str] = Field(None, description="Description of the parameter")

class Endpoint(BaseModel):
    path: str = Field(..., description="URL path of the endpoint")
    method: str = Field(..., description="HTTP method (GET, POST, etc.)")
    description: Optional[str] = Field(None, description="Description of what the endpoint does")
    parameters: List[Parameter] = Field(default_factory=list, description="List of parameters")
    response_schema: Optional[Dict[str, Any]] = Field(None, description="JSON schema of the response")

class ApiSchema(BaseModel):
    title: str = Field(..., description="Title of the API")
    description: Optional[str] = Field(None, description="Description of the API")
    base_url: Optional[str] = Field(None, description="Base URL for the API")
    endpoints: List[Endpoint] = Field(default_factory=list, description="List of endpoints found in the documentation")
