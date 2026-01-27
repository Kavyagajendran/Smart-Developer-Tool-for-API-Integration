import os
import logging
import asyncio
import sys
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Enforce ProactorEventLoop on Windows for Playwright compatibility
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from app.models import ApiSchema, Endpoint
from app.services.scraper import ScraperService
from app.services.llm_engine import LLMEngine
from app.services.code_generator import CodeGenerator
from app.services.health_checker import HealthChecker
from app.services.quality_analyzer import QualityAnalyzer
from app.services.semantic_mapper import SemanticMapper
from app.services.exporter import Exporter

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Smart API Tool Backend")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Services
scraper_service = ScraperService()
llm_engine = LLMEngine()
code_generator = CodeGenerator()
health_checker = HealthChecker()
quality_analyzer = QualityAnalyzer()
semantic_mapper = SemanticMapper()
exporter = Exporter()

# Mount frontend static files
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Serve assets first to avoid conflict with catch-all
# app.mount("/assets", StaticFiles(directory="../frontend/dist/assets"), name="assets")

@app.get("/")
async def serve_frontend():
    return FileResponse("../frontend/dist/index.html")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Backend is running"}

@app.post("/api/parse", response_model=ApiSchema)
async def parse_documentation(url: str = Body(..., embed=True)):
    """
    Scrapes the given URL and uses LLM to parse it into an API Schema.
    """
    try:
        logger.info(f"Received request to parse URL: {url}")
        
        # 1. Scrape content
        html_content = await scraper_service.fetch_page_content(url)
        text_content = scraper_service.extract_text(html_content)
        
        if not text_content:
            raise HTTPException(status_code=400, detail="Failed to extract content from URL")

        # 2. Parse with LLM
        schema = await llm_engine.parse_documentation(text_content)
        return schema

    except Exception as e:
        logger.error(f"Error processing URL: {e}")
        # Re-raise so the global handler catches it and logs to file
        raise e 

@app.post("/api/generate-sdk")
async def generate_sdk(schema: ApiSchema):
    """
    Generates a Python SDK based on the provided ApiSchema.
    """
    try:
        sdk_code = code_generator.generate_python_sdk(schema)
        return {"language": "python", "code": sdk_code}
    except Exception as e:
        logger.error(f"Error generating SDK: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/health-check")
async def check_endpoint_health(
    url: str = Body(...),
    method: str = Body("GET"),
    params: Dict = Body(None),
    headers: Dict = Body(None),
    body: Any = Body(None)
):
    """
    Checks the health of a specific external API endpoint.
    """
    return await health_checker.check_endpoint_health(url, method, params, headers, body)

@app.post("/api/analyze-quality")
async def analyze_quality(schema: ApiSchema):
    """
    Analyzes the quality of the API documentation Schema using LLM.
    """
    return await quality_analyzer.analyze_quality(schema)

@app.post("/api/semantic-map")
async def semantic_map(schema: ApiSchema, query: str = Body(...)):
    """
    Maps a natural language query to the best matching endpoint in the schema.
    """
    return await semantic_mapper.map_query_to_endpoint(schema, query)

@app.post("/api/generate-snippet")
async def generate_snippet(endpoint: Endpoint, base_url: str = Body(...), language: str = Body(...)):
    """
    Generates a code snippet for a specific endpoint in the requested language.
    """
    return {"code": code_generator.generate_snippet(endpoint, base_url, language)}

@app.post("/api/export-markdown")
async def export_markdown(schema: ApiSchema):
    """
    Exports the API schema to Markdown format.
    """
    return {"markdown": exporter.convert_to_markdown(schema)}

@app.post("/api/export-postman")
async def export_postman(schema: ApiSchema):
    """
    Exports the API schema to Postman Collection format.
    """
    return exporter.convert_to_postman(schema)

from fastapi.exceptions import RequestValidationError
from starlette.requests import Request
from starlette.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": "Validation Error", "errors": exc.errors()},
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Unhandled exception: {exc}")
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"},
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
