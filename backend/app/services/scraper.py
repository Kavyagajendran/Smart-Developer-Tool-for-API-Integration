from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

class ScraperService:
    async def fetch_page_content(self, url: str) -> str:
        """
        Fetches the raw HTML content of a page using Playwright to handle dynamic content.
        """
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                logger.info(f"Navigating to {url}")
                await page.goto(url, wait_until="networkidle", timeout=60000)
                content = await page.content()
                await browser.close()
                return content
        except Exception as e:
            logger.error(f"Error fetching page: {e}")
            raise

    def extract_text(self, html_content: str) -> str:
        """
        Extracts readable text from HTML content using BeautifulSoup.
        """
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.extract()
            
        text = soup.get_text(separator=' ', strip=True)
        return text
