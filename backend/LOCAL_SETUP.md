# Local Setup Guide

This guide takes a new user from a fresh checkout to the running React
workspace and FastAPI backend. Commands are written for **Bash**. Ubuntu/Debian
commands are shown first; macOS notes are included where system package
installation differs.

The project has two parts:

- `backend/` — Python 3.12, FastAPI, CrewAI, PDF processing, and the research API.
- `frontend/` — React, TypeScript, and Vite; it requires Node.js and npm.

You need an OpenRouter API key for report generation and PDF summaries and
questions. Google sign-in is optional. Paper search uses public scholarly APIs;
the optional Semantic Scholar key can improve access to that provider.

## 1. Install system prerequisites

### Ubuntu or Debian

Open a Bash terminal and install Git, curl, compiler tools, and libraries used
by Python packages:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git nano openssl build-essential pkg-config libffi-dev libssl-dev
```

### macOS

Install Apple's command-line tools and Homebrew packages:

```bash
xcode-select --install
brew install git curl nano openssl pkg-config
```

If Homebrew is not installed, install it using the instructions at
https://brew.sh/ and then run the commands above.

## 2. Clone the repository

If you have not already downloaded the project:

```bash
git clone https://github.com/Reetik-Satapathy/Multi-Agent-Researcher.git
cd Multi-Agent-Researcher
```

For an existing checkout, open a Bash terminal in the repository root instead.
The following commands assume the current directory contains `backend/` and
`frontend/`.

## 3. Install Python 3.12 and backend dependencies

Install `uv`, which will download and manage the Python version for this
project:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source "$HOME/.local/bin/env"
```

Create the project's root-level virtual environment and install the backend,
including its test dependencies:

```bash
uv python install 3.12
uv venv --python 3.12 .venv
source .venv/bin/activate
uv sync --project backend --extra dev --locked --active
```

This installs the dependencies recorded in `backend/uv.lock` and the packages
declared in `backend/pyproject.toml`, including FastAPI/Uvicorn, CrewAI,
PyMuPDF, PyMuPDF4LLM, OAuth/session support, and pytest. The environment is
local to this checkout. Whenever you open a new terminal to run the backend,
activate it again:

```bash
source .venv/bin/activate
```

Python 3.10–3.13 is supported by the project configuration; Python 3.12 is the
recommended version.

## 4. Install Node.js 22 and frontend dependencies

Vite 8 requires a recent Node.js release. The following uses `nvm` to install
Node.js 22 on Linux or macOS:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm install 22
nvm use 22
```

Check that both Node.js and npm are available:

```bash
node --version
npm --version
```

Install the exact frontend dependencies from the lockfile:

```bash
cd frontend
npm ci
cd ..
```

If you open a new terminal later and `nvm` or `node` is not available, load
`nvm` again with the `export NVM_DIR=...` and `source .../nvm.sh` commands above.

## 5. Configure backend environment variables

Create a local environment file:

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

At minimum, replace the `OPENROUTER_API_KEY` example value with an API key from
https://openrouter.ai/keys. Keep the default model unless you have configured a
different model available through OpenRouter:

```dotenv
OPENROUTER_API_KEY=your_real_openrouter_api_key
OPENROUTER_MODEL=openrouter/openai/gpt-4o-mini
```

The following settings are optional:

- `CROSSREF_MAILTO` and `OPENALEX_MAILTO` — your contact email for the providers'
  polite API usage.
- `SEMANTIC_SCHOLAR_API_KEY` — a key from Semantic Scholar for more reliable
  access to its API.
- Google OAuth variables — see [Optional Google sign-in](#optional-google-sign-in).

Generate a private session signing key and set it as `SESSION_SECRET_KEY` in
`backend/.env`:

```bash
openssl rand -hex 32
```

Paste the command's output as the value, for example:

```dotenv
SESSION_SECRET_KEY=paste_the_generated_value_here
```

Keep `backend/.env` private and do not commit it. It is ignored by Git. The
frontend uses `http://localhost:8000` as its backend by default, so no frontend
environment file is required for the default local setup.

## 6. Check the backend configuration

From the repository root, activate the environment and run the preflight check
from `backend/` so it can load `backend/.env`:

```bash
source .venv/bin/activate
cd backend
PYTHONPATH=src python -m knowledge_discovery.preflight
cd ..
```

The check should report that the required OpenRouter key and Python packages
are available. If it reports a missing key, update `backend/.env` and run the
check again.

## 7. Start the application

Run the backend and frontend in **two separate Bash terminals**. In each
terminal, first change to the repository root.

### Terminal 1: backend API

```bash
source .venv/bin/activate
cd backend
PYTHONPATH=src uvicorn knowledge_discovery.api:app --reload --host 127.0.0.1 --port 8000
```

The API loads configuration from `backend/.env`. Verify it in another terminal:

```bash
curl -fsS http://127.0.0.1:8000/api/health
```

### Terminal 2: frontend

```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

Open http://localhost:5173/ in your browser. Leave both terminal processes
running while using the application. Press `Ctrl+C` in each terminal to stop
the corresponding server.

## Optional Google sign-in

Google sign-in is not required to run or use the research features. To enable it:

1. In Google Cloud Console, create or select a project and configure its OAuth
   consent screen.
2. Create an OAuth client with application type **Web application**.
3. Add `http://localhost:5173` as an authorized JavaScript origin.
4. Add `http://localhost:8000/api/auth/google/callback` as an authorized
   redirect URI.
5. Put the client ID and secret in `backend/.env`:

   ```dotenv
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
   SESSION_SECRET_KEY=your_generated_random_session_key
   SESSION_COOKIE_SECURE=false
   CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
   ```

Restart the backend after changing environment variables. Use `localhost`
consistently in the browser and OAuth URLs. For an HTTPS deployment, set
`SESSION_COOKIE_SECURE=true` and configure the matching production origins and
redirect URI.

Google sign-in displays the signed-in user's identity; it does not create a
server-side account or make saved browser data available on other devices.

## Run the command-line research workflow

From the repository root, run:

```bash
source .venv/bin/activate
cd backend
PYTHONPATH=src python src/knowledge_discovery/main.py "AI for Crop Disease Detection using Drones"
```

The full CrewAI workflow searches scholarly APIs, analyzes the retrieved
records, and generates a Markdown report. Its output files are written under
`backend/output/`, including `research_report.md`.

## Run tests and build checks

From the repository root:

```bash
source .venv/bin/activate
cd backend
PYTHONPATH=src ../.venv/bin/pytest -q
cd ../frontend
npm run build
npm run lint
cd ..
```

## Troubleshooting

### `uv: command not found`

Load the `uv` shell environment and retry:

```bash
source "$HOME/.local/bin/env"
```

If that file is unavailable, open a new Bash terminal after installing `uv`.

### `nvm: command not found` or Node.js is too old

Load `nvm` and select Node.js 22:

```bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm install 22
nvm use 22
```

### Python package installation fails

Confirm the project virtual environment is active and uses Python 3.12:

```bash
source .venv/bin/activate
python --version
```

Then reinstall the backend package from the repository root:

```bash
uv sync --project backend --extra dev --locked --active
```

### The backend says `OPENROUTER_API_KEY` is missing

Confirm `backend/.env` exists, has a real API key rather than the example
placeholder, and that the backend is being started with its working directory
set to `backend/`.

### The frontend cannot reach the backend

Keep both servers running and check the API health URL. For the default setup,
the backend is at `http://127.0.0.1:8000` and the frontend is at
`http://localhost:5173`. If you change the backend host or port, set
`VITE_API_BASE_URL` in `frontend/.env.local` to that backend URL and restart
Vite.

### PDF upload succeeds but answers or summaries fail

The API key is needed for LLM-generated summaries and answers. The PDF must be
an unencrypted PDF with selectable text, no larger than 50 MB or 500 pages.
Scanned image-only PDFs are not supported because OCR is not configured.

## Data and local storage

The frontend stores saved searches, reports, drafts, and selected workflow
state in the current browser's local storage. This information is not synced
across browsers or devices. Uploaded PDF artifacts and backend-generated
reports are stored locally under `backend/output/`. Back up any files you need
to keep before removing that directory.
