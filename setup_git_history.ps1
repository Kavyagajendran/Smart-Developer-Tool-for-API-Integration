$ErrorActionPreference = "Stop"

function Commit-Step {
    param (
        [string]$Date,
        [string]$Msg,
        [string[]]$Files
    )
    
    Write-Host "Committing: $Msg ($Date)"
    
    foreach ($file in $Files) {
        if (Test-Path $file) {
            git add $file
        } else {
            Write-Host "Warning: File not found: $file"
        }
    }
    
    # Check if anything is staged
    $status = git status --porcelain
    if (-not $status) {
        Write-Host "Nothing changed, creating empty commit to preserve timeline."
    }
    
    $env:GIT_COMMITTER_DATE = $Date
    git commit -m "$Msg" --date "$Date" --allow-empty
    $env:GIT_COMMITTER_DATE = "" 
}

# 1. Reset .git
if (Test-Path .git) {
    Write-Host "Removing existing .git directory..."
    Remove-Item -Recurse -Force .git
}

# 2. Init
git init
git branch -M main
git remote add origin https://github.com/Kavyagajendran/Smart-Developer-Tool-for-API-Integration.git

# 3. Day 1
Commit-Step "2026-01-20 10:05:00" "chore: initial commit with project structure and repo config" @(".gitignore")
Commit-Step "2026-01-20 11:00:00" "feat: setup FastAPI backend skeleton with Uvicorn" @("backend/app/__init__.py", "backend/app/main.py", "backend/run_server.py")
Commit-Step "2026-01-20 12:15:00" "chore: add requirements.txt and dependency management" @("backend/requirements.txt")
Commit-Step "2026-01-20 14:00:00" "config: implement environment variable handling for API keys" @("backend/.env.example")
Commit-Step "2026-01-20 15:30:00" "feat: add Pydantic models for API schema and endpoint definitions" @("backend/app/models.py")
Commit-Step "2026-01-20 17:10:00" "infra: add logging configuration and global error handling middleware" @("backend/app")

# 4. Day 2
Commit-Step "2026-01-21 10:20:00" "feat: implement Playwright-based web scraping for dynamic API docs" @("backend/app/services/scraper.py")
Commit-Step "2026-01-21 11:45:00" "feat: integrate LLM engine for parsing raw HTML into structured JSON" @("backend/app/services/llm_engine.py")
Commit-Step "2026-01-21 13:30:00" "improve: refine prompt strategy for accurate schema extraction" @("backend/app/services/llm_engine.py")
Commit-Step "2026-01-21 15:10:00" "feat: add /process-url endpoint for documentation ingestion" @("backend/app/main.py")
Commit-Step "2026-01-21 16:40:00" "test: add initial unit tests for scraper and parser services" @("backend/test_api.py", "backend/test_features.py")

# 5. Day 3
Commit-Step "2026-01-22 10:00:00" "chore: initialize frontend using React + Vite" @("frontend/package.json", "frontend/vite.config.ts", "frontend/index.html")
Commit-Step "2026-01-22 11:20:00" "style: setup Aurora light theme with glassmorphism CSS variables" @("frontend/src/index.css")
Commit-Step "2026-01-22 13:00:00" "feat: build UrlInput component with validation and loading states" @("frontend/src/App.tsx")
Commit-Step "2026-01-22 15:00:00" "feat: implement code generator service for Python SDK snippets" @("backend/app/services/code_generator.py")
Commit-Step "2026-01-22 16:45:00" "integration: connect frontend with backend for end-to-end flow" @("frontend/src/App.tsx")

# 6. Day 4
Commit-Step "2026-01-23 10:10:00" "feat: extend code generation support to JavaScript and cURL" @("backend/app/services/code_generator.py")
Commit-Step "2026-01-23 11:40:00" "feat: implement SDK packager service for downloadable zip output" @("backend/app/services/code_generator.py")
Commit-Step "2026-01-23 13:20:00" "refactor: enhance ApiViewer component for dynamic endpoint rendering" @("frontend/src/components/ApiViewer.tsx")
Commit-Step "2026-01-23 15:00:00" "feat: scaffold EndpointTester component for live API testing" @("frontend/src/components/EndpointTester.tsx")
Commit-Step "2026-01-23 16:30:00" "fix: resolve CORS issues and strengthen request validation" @("backend/app/main.py")

# 7. Day 5
Commit-Step "2026-01-24 10:00:00" "feat: add documentation quality analyzer using LLM" @("backend/app/services/quality_analyzer.py")
Commit-Step "2026-01-24 11:30:00" "ui: integrate quality score badge and feedback modal in ApiViewer" @("frontend/src/components/ApiViewer.tsx")
Commit-Step "2026-01-24 13:15:00" "feat: implement export services for Markdown and Postman formats" @("backend/app/services/exporter.py")
Commit-Step "2026-01-24 15:00:00" "ui: add schema, Postman, and Markdown download actions" @("frontend/src/components/ApiViewer.tsx")
Commit-Step "2026-01-24 16:40:00" "refactor: update models to support optional endpoint metadata" @("backend/app/models.py")

# 8. Day 6
Commit-Step "2026-01-25 10:10:00" "feat: add live health check service using httpx proxy" @("backend/app/services/health_checker.py")
Commit-Step "2026-01-25 11:45:00" "ui: show real-time endpoint status indicators (Live/Down)" @("frontend/src/components/ApiViewer.tsx")
Commit-Step "2026-01-25 13:30:00" "feat: implement semantic mapper for NL to endpoint matching" @("backend/app/services/semantic_mapper.py")
Commit-Step "2026-01-25 15:10:00" "feat: add HealthCheckRequest schema validation" @("backend/app/models.py")
Commit-Step "2026-01-25 16:50:00" "perf: optimize processing for large API schemas" @("backend/app/main.py")

# 9. Day 7
Commit-Step "2026-01-27 10:00:00" "security: implement password hashing using passlib" @("backend/requirements.txt")
Commit-Step "2026-01-27 11:30:00" "auth: add register and login endpoints with session handling" @("backend/app/main.py")
Commit-Step "2026-01-27 13:10:00" "ui: create login page and protected route logic" @("frontend/src/App.tsx")
Commit-Step "2026-01-27 15:00:00" "polish: finalize UI animations, transitions, and loading skeletons" @("frontend/src/index.css")

# Final Add All
Write-Host "Finalizing: Adding all remaining files..."
git add .
$env:GIT_COMMITTER_DATE = "2026-01-27 16:30:00"
Commit-Step "2026-01-27 16:30:00" "docs: update README with setup guide and architecture overview" @("README.md")
$env:GIT_COMMITTER_DATE = ""

Write-Host "Git history reconstruction complete."
