import asyncio
import os
import sys
from dotenv import load_dotenv

# Add app to path
sys.path.append(os.getcwd())

from app.services.scraper import ScraperService
from app.services.llm_engine import LLMEngine
from app.models import ApiSchema

# Enforce ProactorEventLoop on Windows
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

async def main():
    load_dotenv()
    url = "https://old.openweathermap.org/current"
    
    print(f"Testing with URL: {url}")
    
    scraper = ScraperService()
    llm = LLMEngine()
    
    try:
        print("1. Scraping...")
        content = await scraper.fetch_page_content(url)
        print(f"   Scraped content length: {len(content)}")
        
        text = scraper.extract_text(content)
        print(f"   Extracted text length: {len(text)}")
        
        print("2. Parsing with LLM...")
        try:
            schema = await llm.parse_documentation(text)
            print("   Success!")
            print(schema)
        except Exception as e:
            print(f"   LLM Parsing failed: {e}")
            import traceback
            traceback.print_exc()

    except Exception as e:
        print(f"Scraping failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
