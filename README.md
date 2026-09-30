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

Google sign-in is optional. To enable it, configure the OAuth credentials and
callback URL described in [backend/LOCAL_SETUP.md](./backend/LOCAL_SETUP.md).
Users can defer sign-in and access it later from the sidebar profile control.

## Available workflows

The frontend currently supports these workflows:

- **Discover papers** — search verified scholarly records for a topic and display
  results in the workspace. Searches query Crossref, OpenAlex, and Semantic Scholar
  concurrently, retain partial results when a provider is unavailable, and let users
  choose 10, 15, 20, or 25 papers. Results can be filtered by year, sorted, bookmarked,
  and cleared to start over.
- **Generate a report** — use parallel scholarly search, deterministic research
  analysis, and one report-writing LLM call. The report retains the required ten-section
  Markdown structure and can be reopened from the Reports page.
- **Ask a PDF** — upload a selectable-text research paper, receive an LLM-generated
  summary, and ask grounded questions about the paper. The document, summary, and chat
  can be cleared when starting a new document.
- **Compare PDFs** — upload two papers, generate a structured comparison, and ask
  follow-up questions grounded in both documents. Uploaded documents, comparison, and
  chat can be cleared together.

The workspace contains Projects, Saved Papers, and Reports. Research History and the
Dashboard are not part of the current interface.

The PDF chat sends only the latest eight user/assistant messages from the current
document conversation with each question. This lets follow-up questions refer to
earlier answers without sending the broader application conversation to the LLM.
The PDF excerpts remain the source of truth, and answers are instructed to cite
supporting pages.

The Compare Papers page is intentionally upload-driven: it does not display a
pre-existing paper comparison. Each of the two upload slots shows a green
confirmation and the uploaded paper title after processing. A progress bar is
shown while a PDF is uploaded and processed, and either slot can be replaced
before comparison. The comparison button becomes available only after both
documents are ready.

Completed paper searches, uploaded-PDF summaries and chat, two-paper comparisons
and chat, generated reports, and report drafts are saved in the browser's local
storage. They remain available when navigating away and returning, or after
reloading in the same browser profile. This data is browser-local and is not
synced across browsers or devices; clearing site data removes the saved frontend
state. The report topic draft and bookmarked papers are also retained. Saved
papers appear under **Saved Papers** in the sidebar. Uploaded PDF files
themselves are not stored in browser local storage.

The frontend-facing API routes are:

```text
GET  /api/health
POST /api/papers/search
POST /api/research/report
POST /api/documents/upload
POST /api/documents/{document_id}/questions
POST /api/documents/compare
POST /api/documents/compare/questions
```

Comparison responses are normalized by the frontend so incomplete LLM output
does not blank the page; unavailable sections are shown as empty or
`Not specified` instead.

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
