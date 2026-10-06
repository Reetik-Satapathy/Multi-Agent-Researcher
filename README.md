# REWORK Ai — Multi-Agent Researcher

REWORK Ai is a research discovery and synthesis platform for students,
researchers, and technical teams. It brings scholarly paper discovery,
paper-level exploration, PDF question answering, two-paper comparison, and
structured research-report writing into one browser workspace.

The repository contains a React/TypeScript frontend and a Python/FastAPI
backend. The backend also exposes a full sequential CrewAI workflow through the
command line. Some screens are demonstrations rather than live AI features;
the implementation status section below identifies those boundaries.

## Contents

- [What the platform offers](#what-the-platform-offers)
- [Research workflows](#research-workflows)
- [How research data is handled](#how-research-data-is-handled)
- [Architecture and technology](#architecture-and-technology)
- [API reference](#api-reference)
- [Current implementation status and limitations](#current-implementation-status-and-limitations)
- [Run locally](#run-locally)
- [Validation](#validation)
- [Project structure](#project-structure)

## What the platform offers

### Discover scholarly papers

Search by research topic or keywords, author, or DOI. The backend searches
Crossref, OpenAlex, and Semantic Scholar concurrently, combines results,
deduplicates records, and ranks eligible papers by topic relevance, citation
count, and recency. Partial results can still be returned when a provider is
unavailable, with provider warnings included where available.

The production search policy is conservative: arXiv preprints and records
without sufficient publication metadata are excluded. A record is marked
`verified` only when the available metadata meets the project's publication
checks; this is not an independent audit that a publisher actually performed
peer review.

In the Discover Papers screen, users can:

- Request 10, 15, 20, or 25 papers.
- Filter the current result set by publication year.
- Sort the visible results by relevance, citation count, or year.
- Reset filters, clear the search, and revisit saved search results.
- Save or unsave papers for the My Research area.
- Open a paper record, launch its paper assistant or summary screen, and mark
  it for comparison.

### Explore a paper

The paper detail screen presents the search record's title, authors,
publication metadata, abstract, DOI/source link, and a PDF link when available.
It also offers actions to save the paper, mark it for comparison, open the
summary screen, or go to report generation.

The paper assistant accepts free-form questions and provides quick prompts for
summarizing key points, explaining methodology, extracting findings, and
identifying limitations. Its live backend endpoint is instructed to answer
from the paper's metadata and abstract, distinguish evidence from
interpretation, and state when that context is insufficient. Recent
conversation is stored per paper in browser storage.

### Ask a PDF

Upload a selectable-text PDF to extract its metadata and text, create a
page-aware summary, and ask follow-up questions in a document chat. The
interface shows upload progress, document title and page count, the summary,
and the conversation. The workspace can be cleared or a different PDF
uploaded.

Question answering retrieves relevant page-aware text chunks and asks the
configured language model to answer from those excerpts. Answers are asked to
cite supporting pages using `[p. N]`; recent chat is included only for
conversation continuity, not as evidence. The conversation is limited to the
latest eight messages.

### Compare Papers (PDF comparison)

The Compare Papers screen is upload-driven: it accepts exactly two PDFs rather
than comparing the papers marked from search cards. Once both uploads are
processed, users can request a structured comparison with:

- An overview.
- Similarities and differences.
- Research gaps.
- A comparison table.
- A follow-up chat that asks questions across both papers and cites document
  and page where supported.

Upload progress and completion are shown per workflow; either file can be
replaced before comparison. Clear resets the uploaded-document references,
comparison, and chat. Follow-up questions use relevant excerpts from each
paper and the latest eight conversation messages.

### Generate research reports

Enter a topic in the Reports screen to run the live report-generation API. The
browser-facing pipeline searches for verified scholarly records, runs
deterministic novelty/gap analysis, and makes a report-writing LLM call using
the search and analysis outputs. The report is returned as Markdown and parsed
into sections for the report workspace.

Reports follow a required ten-part structure:

1. Executive Summary
2. Scope and Search Method
3. Research Landscape
4. Related Papers
5. Comparative Analysis
6. Research Analysis and Novelty
7. Research Gaps and Limitations
8. Future Research Opportunities
9. Practical Takeaways
10. References

The report instructions ask the writer to synthesize evidence, cite supplied
metadata or URLs, describe limitations in the search data, and avoid inventing
paper facts. The heuristic novelty score is a signal based on word overlap
with retrieved titles and abstracts—not a guarantee of originality.

### Read and edit reports

Generated reports can be opened from the Reports screen or My Research.
The report workspace provides:

- **Section view:** a table of contents, one selected section at a time, and
  Markdown rendering.
- **Full report view:** a continuous, scrollable report with formatted
  headings, paragraphs, lists, and tables.
- **Manual edits:** edit a section in the section view and preview its
  rendered Markdown.
- **AI Document Copilot:** improve writing and flow, shorten a section, expand
  technical detail, improve citation formatting using report references, or
  provide a custom edit instruction. Edits apply to the selected section.
- **Save Draft:** save the current report sections and word count.
- **Export PDF:** open the browser print dialog for the complete report. Use
  the browser's “Save as PDF” destination to create a PDF; export is intended
  to include the entire report from either view mode.
- **Share:** copy the current browser URL to the clipboard.

### My Research, profile, and navigation

The sidebar links to My Research, Discover Papers, Ask a PDF, Compare Papers,
Reports, and Settings. My Research currently contains Saved Papers and Reports
tabs; the former Projects tab and New Project button have been removed.

The sidebar profile menu supports optional Google sign-in and sign-out. Google
sign-in displays the verified account name and email. It is an identity
display/session feature; it does not provide cross-device synchronization or
protect the research APIs with per-user authorization.

The Profile and Settings screens are present as UI demonstrations. Their
displayed account statistics, AI model choices, data-source descriptions, and
security settings are not connected to persisted settings or enforcement.

## Research workflows

### Search and save papers

1. Open **Discover Papers** and enter a topic, author, keyword, or DOI.
2. Choose a requested result count and submit the search.
3. Filter results by year or change their sort order.
4. Save papers for later, open a paper record, or use the paper assistant.
5. Return to **My Research → Saved Papers** to revisit saved records.

The “Compare” control on search results records a paper as selected and shows
its selected state. The current Compare Papers screen is PDF-upload-based, so
these selected search papers are not automatically loaded into its comparison.

### Ask questions about a PDF

1. Open **Ask a PDF** and upload a PDF with selectable text.
2. Wait for extraction and summary generation to complete.
3. Ask questions in the chat; use follow-ups to refer to the recent exchange.
4. Clear the workspace or upload a replacement PDF to start over.

### Compare two PDFs

1. Open **Compare Papers** and upload one PDF into each slot.
2. Replace either PDF if needed.
3. Select **Compare Uploaded PDFs** after both documents are ready.
4. Review the structured comparison and ask follow-up questions.
5. Clear the workspace to remove the current comparison from the UI.

### Generate and refine a report

1. Open **Reports**, enter a research topic, and generate a report.
2. Review the report in section view or switch to the full continuous view.
3. Use the Copilot or manual editor to revise a section.
4. Save the draft, reopen it later from Reports or My Research, or export via
   the browser print dialog.

## How research data is handled

### Browser-local state

Search query/results and filters, saved papers, report topic, generated reports
and drafts, uploaded-document metadata and summary/chat, and PDF comparison
metadata/results/chat are stored in the browser's `localStorage`. This state
survives navigation and page reload in the same browser profile, but is not
synced across browsers or devices. Clearing site data removes it.

The uploaded PDF bytes are not stored in `localStorage`. The backend extracts
the PDF into files under `backend/output/documents/`; these include document
metadata, extracted Markdown, page-aware chunks, and a summary. The original
temporary upload file is removed after processing. Generated reports and
research artifacts are written under `backend/output/` when running commands
from the backend directory.

Google sign-in state is held in a signed backend session cookie. Set a stable
`SESSION_SECRET_KEY` so sessions remain valid across backend restarts.

### PDF constraints

- Maximum upload size: 50 MB.
- Maximum PDF length: 500 pages.
- Encrypted PDFs, PDFs with no pages, and PDFs with no selectable text are
  rejected.
- OCR is not configured; scanned/image-only PDFs are not supported.
- PDF extraction uses PyMuPDF and PyMuPDF4LLM. Question answering uses
  page-aware chunks and lexical overlap retrieval before the language-model
  call.

### External services and credentials

- **OpenRouter:** required for backend report generation, PDF summaries and
  questions, PDF comparison, paper Q&A, and Copilot report edits.
- **Crossref and OpenAlex:** public scholarly metadata services; contact email
  configuration is recommended.
- **Semantic Scholar:** optional API key can improve access to its scholarly
  metadata service.
- **Google OAuth:** optional, used for sign-in identity display.

Configure credentials in `backend/.env`. Do not commit that file. The detailed
fresh-machine Bash setup, OAuth instructions, environment variables, and
troubleshooting guidance are in
[backend/LOCAL_SETUP.md](./backend/LOCAL_SETUP.md).

## Architecture and technology

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Lucide icons |
| Backend API | Python, FastAPI, Pydantic, Uvicorn |
| Multi-agent workflow | CrewAI with YAML-defined agents and tasks |
| LLM access | OpenRouter, configured by `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` |
| Scholarly search | Crossref, OpenAlex, Semantic Scholar |
| PDF processing | PyMuPDF, PyMuPDF4LLM |
| Frontend state | React state and browser `localStorage` |

### Browser application

The React app calls the backend through frontend service modules:

- `paperService` searches scholarly papers.
- `aiService` generates and edits reports and asks questions about papers.
- `documentService` uploads PDFs, asks document questions, and runs two-PDF
  comparison and follow-up chat.
- `authService` checks the current Google session and starts or ends sign-in.

The default backend URL is `http://localhost:8000`. Set
`VITE_API_BASE_URL` in `frontend/.env.local` to use a different API origin.

### Report pipelines

The browser report endpoint uses a direct pipeline: parallel search, novelty
analysis, then one report-writing LLM call. It shares the backend search,
analysis, and report instructions with the CrewAI project, but does not run the
full CrewAI agent orchestration for each browser request.

The CLI runs the sequential three-agent CrewAI workflow:

1. **Paper Search Specialist** expands topic queries and searches for verified
   papers.
2. **Research Analysis Specialist** runs novelty analysis, reranking, and
   research-gap analysis.
3. **Research Report Writer** synthesizes the search and analysis into a
   structured report.

The CLI artifacts are `backend/output/papers.json`,
`backend/output/analysis.json`, and `backend/output/research_report.md`.
Run details and CLI examples are in [backend/README.md](./backend/README.md).

## API reference

The frontend uses these FastAPI endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Backend health check |
| `GET` | `/api/auth/me` | Return current Google identity and whether OAuth is configured |
| `GET` | `/api/auth/google/login` | Begin Google OAuth login |
| `GET` | `/api/auth/google/callback` | Complete OAuth callback and establish session |
| `POST` | `/api/auth/logout` | Clear the current session |
| `POST` | `/api/papers/search` | Search and return eligible scholarly records |
| `POST` | `/api/papers/questions` | Ask a question grounded in one paper's metadata/abstract |
| `POST` | `/api/research/report` | Search, analyze, and generate a Markdown research report |
| `POST` | `/api/research/report/edit` | Edit one report section using a Copilot action or custom prompt |
| `POST` | `/api/documents/upload` | Validate, extract, and summarize a PDF |
| `POST` | `/api/documents/{document_id}/questions` | Ask a question about one uploaded PDF |
| `POST` | `/api/documents/compare` | Compare exactly two uploaded PDFs |
| `POST` | `/api/documents/compare/questions` | Ask a follow-up question across two PDFs |

Interactive API documentation is available at `http://localhost:8000/docs`
while the backend is running.

## Current implementation status and limitations

These notes distinguish live functionality from UI demonstrations:

- **Live backend-backed workflows:** scholarly search, report generation,
  report-section Copilot edits, paper questions, PDF upload/extraction and
  summary, PDF questions, two-PDF comparison and comparison questions, and
  optional Google OAuth.
- **Frontend demonstration data:** the bundled paper/report records shown
  before users create or search for their own content are sample data.
- **Paper AI Summary screen:** its structured summary content and
  “Regenerate,” “Make Shorter,” and “Explain Simply” actions are currently
  frontend-generated/demo behavior, not a live backend summarization call.
- **Profile and Settings:** shown controls, stats, model selection, and
  security claims are demo UI and are not backed by settings persistence or
  access-control enforcement.
- **Paper comparison selection:** paper cards show selected/compare state, but
  the Compare Papers destination currently compares uploaded PDFs, not the
  selected scholarly search records.
- **Authentication:** Google sign-in is optional and identifies a user in the
  UI; application data remains browser-local, and the research APIs are not
  protected by user-specific authorization.
- **Novelty:** scores and gap hints are heuristic and depend on search
  coverage and metadata. They must not be treated as proof of originality.
- **Search quality:** scholarly provider metadata can be incomplete, API
  coverage differs, and “verified” reflects the project's metadata checks—not
  an independent peer-review audit.
- **PDF input:** OCR is unavailable; scanned PDFs and unsupported/encrypted
  files cannot be processed.
- **Cross-device persistence:** there is no account-backed synchronization or
  server-side report library.

## Run locally

For a complete setup from a fresh checkout—including system packages, Python
and Node.js installation, environment configuration, and Google OAuth—follow
[backend/LOCAL_SETUP.md](./backend/LOCAL_SETUP.md).

Once dependencies and `backend/.env` are configured, start the backend and
frontend in separate Bash terminals from the repository root.

**Terminal 1 — backend API**

```bash
source .venv/bin/activate
cd backend
PYTHONPATH=src uvicorn knowledge_discovery.api:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 — frontend**

```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

Open <http://localhost:5173/>. The frontend uses `http://localhost:8000` by
default. Keep both processes running while using the app.

## Validation

From the repository root:

```bash
source .venv/bin/activate
cd backend
PYTHONPATH=src ../.venv/bin/pytest -q

cd ../frontend
npm run build
npm run lint
```

## Project structure

```text
backend/
  src/knowledge_discovery/
    api.py                 FastAPI routes and browser-facing pipelines
    crew.py                Sequential CrewAI orchestration
    config/agents.yaml     Agent roles and goals
    config/tasks.yaml      Search, analysis, and report instructions
    pdf_processing.py      PDF extraction, chunking, summary, and Q&A
    tools/                 Scholarly search, ranking, and research analysis
    utils/                 LLM and HTTP client configuration
  tests/                   Backend tests
  LOCAL_SETUP.md           Detailed Bash setup and OAuth guide
frontend/
  src/App.tsx              Application shell and view routing
  src/components/          Shared UI components
  src/services/            API clients and frontend data helpers
  src/views/               Research, PDF, report, and profile screens
.venv/                     Shared Python virtual environment (local)
```

## License

Apache License 2.0. See [LICENSE](./LICENSE).
