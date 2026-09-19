# Multi-Agent Researcher

This project contains the Python research backend and React research workspace
in one repository:

```text
backend/   CrewAI workflow, paper search, PDF processing, and FastAPI API
frontend/  React/Vite user interface
.venv/     shared Python environment for backend commands
```

## Install

### Backend

```bash
uv pip install --python .venv/bin/python -e 'backend[dev]'
```

### Frontend

```bash
cd frontend
npm ci
```

The frontend uses Node.js/npm, so it cannot share the Python virtual
environment. Both environments are managed from this project directory.

## Run

Start the backend API:

```bash
cd backend
source ../.venv/bin/activate
PYTHONPATH=src uvicorn knowledge_discovery.api:app --reload --port 8000
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

For Fish shell, do not use Bash-style `export PATH=...:$PATH`; Fish treats
`PATH` as a list and that form can remove `/usr/bin` from the environment. Use
this instead:

```fish
set -gx PATH /home/reet/.local/node-v22.14.0-linux-x64/bin /home/reet/.local/bin /usr/local/sbin /usr/local/bin /usr/sbin /usr/bin /sbin /bin
cd frontend
npm run dev
```

The frontend connects to `http://localhost:8000` by default. Set
`VITE_API_BASE_URL` in `frontend/.env.local` to override it.

## Available workflows

The frontend currently supports three backend-powered workflows:

- **Discover papers** — search verified scholarly records for a topic and display
  the results in the workspace.
- **Generate a report** — run the complete sequential CrewAI workflow and render
  the generated report in the report workspace.
- **Ask a PDF** — upload a selectable-text research paper, receive an LLM-generated
  summary, and ask grounded questions about the paper.

The PDF chat sends only the latest eight user/assistant messages from the current
document conversation with each question. This lets follow-up questions refer to
earlier answers without sending the broader application conversation to the LLM.
The PDF excerpts remain the source of truth, and answers are instructed to cite
supporting pages.

The frontend-facing API routes are:

```text
GET  /api/health
POST /api/papers/search
POST /api/research/report
POST /api/documents/upload
POST /api/documents/{document_id}/questions
```

## Validate

```bash
cd backend
PYTHONPATH=src ../.venv/bin/pytest -q

cd ../frontend
npm run build
npm run lint
```

See [backend/README.md](backend/README.md) and
[backend/LOCAL_SETUP.md](backend/LOCAL_SETUP.md) for backend workflows.
