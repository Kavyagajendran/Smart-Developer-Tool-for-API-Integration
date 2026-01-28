# Smart Developer Tool for API Integration

An AI-powered developer tool designed to streamline API integration by parsing documentation, generating SDKs, and providing intelligent insights.

## Features

- **Automated Documentation Parsing**: Scrapes and extracts API details from documentation URLs.
- **AI-Powered Analysis**: Uses LLMs to understand API structure, endpoints, and data models.
- **SDK Generation**: Automatically generates Python SDKs for the parsed APIs.
- **Interactive Playground**: Test API endpoints and snippets directly within the tool.
- **Quality Analysis**: Evaluates the quality and completeness of API documentation.

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **AI/ML**: LLM Integration for parsing and code generation
- **Tools**: Playwright for scraping, Pydantic for data validation

### Frontend
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Modern, responsive UI

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- API Keys for LLM services (configure in `.env`)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Kavyagajendran/Smart-Developer-Tool-for-API-Integration.git
    cd Smart-Developer-Tool-for-API-Integration
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    python -m venv .venv
    source .venv/bin/activate  # On Windows: .venv\Scripts\activate
    pip install -r requirements.txt
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    ```

### Running the Application

1.  **Start the Backend**
    ```bash
    cd backend
    python main.py
    ```
    The backend runs on `http://localhost:8000`.

2.  **Start the Frontend**
    ```bash
    cd frontend
    npm run dev
    ```
    The frontend runs on `http://localhost:5173`.

## Usage
1. Open the frontend in your browser.
2. Enter the URL of an API documentation page.
3. Let the tool parse the documentation.
4. Explore the generated schemas, test endpoints, or download the generated SDK.
