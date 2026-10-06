# Local Setup Guide

This guide takes a new user from a fresh checkout to the running React workspace and FastAPI backend.

The project has two parts:

- `backend/` — Python 3.12, FastAPI, CrewAI, PDF processing, and the research API.
- `frontend/` — React, TypeScript, and Vite; it requires Node.js and npm.

You need an OpenRouter API key for report generation and PDF summaries and questions. Google sign-in is optional. Paper search uses public scholarly APIs; the optional Semantic Scholar key can improve access to that provider.

---

## 1. Install system prerequisites

### Windows
Open PowerShell as Administrator (or standard user) and ensure Git, Node.js, and Python/uv are installed:
```powershell
# Install uv package manager
powershell -ExecutionPolicy ByPass -Command "irm https://astral.sh/uv/install.ps1 | iex"
```

### Ubuntu / Debian
```bash
sudo apt update
sudo apt install -y ca-certificates curl git nano openssl build-essential pkg-config libffi-dev libssl-dev
```

### macOS
```bash
xcode-select --install
brew install git curl nano openssl pkg-config
```

---

## 2. Clone the repository

```bash
git clone https://github.com/Reetik-Satapathy/Multi-Agent-Researcher.git
cd Multi-Agent-Researcher
```

All commands below assume your terminal working directory is the repository root (`Multi-Agent-Researcher`).

---

## 3. Install Python 3.12 and backend dependencies

Install `uv` (if not done in step 1), then install Python 3.12 and create/sync backend dependencies:

### Universal (Recommended for all platforms: Windows / Linux / macOS)
From the repository root:
```bash
uv python install 3.12
uv sync --project backend --extra dev --locked
```

This automatically downloads Python 3.12, creates a virtual environment at `backend/.venv`, and installs all lockfile dependencies including FastAPI, CrewAI, PyMuPDF, PyMuPDF4LLM, and pytest.

---

## 4. Install Node.js 22 and frontend dependencies

Check that Node.js (>= 20, recommended 22) and npm are available:
```bash
node --version
npm --version
```

Install frontend dependencies from the lockfile:
```bash
cd frontend
npm ci
cd ..
```

---

## 5. Configure backend environment variables

Create a local environment file in `backend/.env`:

```bash
# Linux / macOS / Git Bash
cp backend/.env.example backend/.env
```
Or on Windows PowerShell:
```powershell
Copy-Item backend/.env.example backend/.env
```

Edit `backend/.env` and replace `OPENROUTER_API_KEY` with your key from https://openrouter.ai/keys:

```dotenv
OPENROUTER_API_KEY=your_real_openrouter_api_key
OPENROUTER_MODEL=openrouter/openai/gpt-4o-mini
```

Generate a session secret key:
- **PowerShell (Windows)**:
  ```powershell
  [Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Min 0 -Max 256 }))
  ```
- **Bash (Linux/macOS)**:
  ```bash
  openssl rand -hex 32
  ```

Paste the output as `SESSION_SECRET_KEY` in `backend/.env`.

---

## 6. Check the backend configuration

Run the preflight check from the repository root:

### Universal (Works in PowerShell, Git Bash, CMD, Linux, macOS):
```bash
uv run --project backend python -m knowledge_discovery.preflight
```

### Alternative using Shell Virtual Environment:
- **Windows PowerShell**:
  ```powershell
  cd backend
  $env:PYTHONPATH="src"
  .\.venv\Scripts\python.exe -m knowledge_discovery.preflight
  cd ..
  ```
- **Windows Git Bash**:
  ```bash
  source backend/.venv/Scripts/activate
  cd backend
  PYTHONPATH=src python -m knowledge_discovery.preflight
  cd ..
  ```
- **Linux / macOS Bash**:
  ```bash
  source backend/.venv/bin/activate
  cd backend
  PYTHONPATH=src python -m knowledge_discovery.preflight
  cd ..
  ```

---

## 7. Start the application

Run the backend and frontend in **two separate terminal windows** from the repository root.

### Terminal 1: Backend API

> **Note on PATH:** If Git Bash says `bash: uv: command not found`, run `export PATH="$HOME/.local/bin:$PATH"` first.

#### **If your terminal is ALREADY inside `backend/` (`.../Multi-Agent-Researcher/backend`):**

- **Git Bash:**
  ```bash
  PYTHONPATH=src .venv/Scripts/python -m uvicorn knowledge_discovery.api:app --reload --host 127.0.0.1 --port 8000
  ```
  *(Or with `uv`: `export PATH="$HOME/.local/bin:$PATH" && uv run uvicorn knowledge_discovery.api:app --reload --host 127.0.0.1 --port 8000`)*

- **PowerShell:**
  ```powershell
  $env:PYTHONPATH="src"
  .\.venv\Scripts\python.exe -m uvicorn knowledge_discovery.api:app --reload --host 127.0.0.1 --port 8000
  ```

#### **If your terminal is in the Root Directory (`.../Multi-Agent-Researcher`):**

- **Git Bash:**
  ```bash
  cd backend
  PYTHONPATH=src .venv/Scripts/python -m uvicorn knowledge_discovery.api:app --reload --host 127.0.0.1 --port 8000
  ```

- **PowerShell:**
  ```powershell
  cd backend
  $env:PYTHONPATH="src"
  .\.venv\Scripts\python.exe -m uvicorn knowledge_discovery.api:app --reload --host 127.0.0.1 --port 8000
  ```

Verify backend health in another terminal:
```bash
curl http://127.0.0.1:8000/api/health
```

---

### Terminal 2: Frontend

From the repository root:
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

Open http://localhost:5173/ in your browser.

---

## Optional Google Sign-In

Google sign-in is not required to run or use the research features. To enable it:
1. In Google Cloud Console, create an OAuth 2.0 Web Client.
2. Set JavaScript origin: `http://localhost:5173`
3. Set Redirect URI: `http://localhost:8000/api/auth/google/callback`
4. Set credentials in `backend/.env`:
   ```dotenv
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
   ```

---

## Run Command-Line Research Workflow

From the repository root:
```bash
uv run --project backend python src/knowledge_discovery/main.py "AI for Crop Disease Detection using Drones"
```

The output report will be generated at `backend/output/research_report.md`.

---

## Run Tests and Build Checks

From the repository root:
```bash
# Run backend pytest
uv run --project backend pytest -q

# Run frontend build & lint
cd frontend
npm run build
npm run lint
cd ..
```

---

## Troubleshooting Summary

1. **`bash: .venv/bin/activate: No such file or directory` / `cd: backend: No such file or directory`**:
   - On Windows, virtual environments use `Scripts/activate` (or `Scripts/Activate.ps1`), located at `backend/.venv/Scripts/activate`.
   - Alternatively, use `uv run --project backend <command>` which works automatically without activating any shell environment!

2. **`PYTHONPATH=src : The term 'PYTHONPATH=src' is not recognized`**:
   - `VAR=val` inline syntax is Linux Bash only.
   - In PowerShell, use `$env:PYTHONPATH="src"` or run via `uv run --project backend ...`.

3. **`uvicorn: command not found`**:
   - Occurs when the virtual environment is not activated in PATH.
   - Solution: Use `uv run --project backend uvicorn knowledge_discovery.api:app --reload --host 127.0.0.1 --port 8000`.
