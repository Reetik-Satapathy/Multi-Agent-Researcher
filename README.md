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
