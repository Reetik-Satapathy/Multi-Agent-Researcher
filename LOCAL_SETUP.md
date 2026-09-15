# Local Setup and Run Guide

This repository is a Python-based multi-agent research system for literature discovery. It searches academic databases, analyzes novelty and research gaps, and generates a structured markdown research report.

## Project Summary

What it does:
- Accepts a research topic from the user
- Searches academic sources (arXiv, Crossref, OpenAlex)
- Uses only records that pass the peer-reviewed-only metadata filter for analysis and reporting
- Deduplicates and normalizes results
- Analyzes novelty, similar work, and research gaps
- Produces a final markdown report saved to `output/research_report.md`

Key runtime files:
- `src/knowledge_discovery/main.py` — CLI entry point
- `src/knowledge_discovery/crew.py` — CrewAI orchestration
- `src/knowledge_discovery/tools/search_tools.py` — paper search tool
- `src/knowledge_discovery/tools/analysis_tools.py` — novelty and gap analysis
- `src/knowledge_discovery/tools/llm_tools.py` — optional LLM-assisted tools
- `src/knowledge_discovery/utils/llm.py` — OpenRouter configuration

## Prerequisites

Required:
- Python 3.12 (recommended and tested)
- A valid OpenRouter API key
- Internet access for arXiv / Crossref / OpenAlex access

Important:
- Python 3.14 is not currently compatible with the toolchain used here (`crewai` + `chromadb` stack).
- Use Python 3.12 or 3.11 if available. This project is documented for Python 3.10–3.13, but 3.12 is the safest tested option for this environment.

## 1) Clone the repository

```bash
cd /path/to/project
```

## 2) Create a local environment

### Option A: Use uv (recommended)

Install `uv` if needed:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Then create and activate the environment:

```bash
cd /home/reet/Projects/Multi-Agent-Researcher.worktrees/project-analysis-and-understanding
uv python install 3.12
uv venv --python 3.12 .venv
source .venv/bin/activate
```

### Option B: Use standard venv

```bash
cd /home/reet/Projects/Multi-Agent-Researcher.worktrees/project-analysis-and-understanding
python3.12 -m venv .venv
source .venv/bin/activate
```

## 3) Install dependencies

With the venv activated:

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

If using `uv`:

```bash
uv pip install -r requirements.txt
```

## 4) Set up environment variables

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

Then edit `.env` and fill in the required values:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openrouter/openai/gpt-4o-mini
CROSSREF_MAILTO=your_email@example.com
OPENALEX_MAILTO=your_email@example.com
SEMANTIC_SCHOLAR_API_KEY=your_semantic_scholar_api_key
CREWAI_TELEMETRY_OPT_OUT=true
```

Notes:
- `OPENROUTER_API_KEY` is required.
- `OPENROUTER_MODEL` is optional, but recommended.
- `CROSSREF_MAILTO` and `OPENALEX_MAILTO` help with polite API usage and are optional but recommended.
- `SEMANTIC_SCHOLAR_API_KEY` enables Semantic Scholar discovery and citation metadata.
- `.env` is local-only and should not be committed to Git.

## 5) Validate the setup

Before running the full research flow, run the preflight check:

```bash
PYTHONPATH=src python -m knowledge_discovery.preflight
```

Expected behavior:
- It should report whether required environment variables and Python packages are available.
- If it fails, fix the missing dependency or `.env` value before continuing.

## 6) Run the app

From the project root:

```bash
PYTHONPATH=src python src/knowledge_discovery/main.py
```

This uses the default topic:

```text
AI for Crop Disease Detection using Drones
```

To run for a custom topic:

```bash
PYTHONPATH=src python src/knowledge_discovery/main.py "AI for Crop Disease Detection using Drones"
```

Or another example:

```bash
PYTHONPATH=src python src/knowledge_discovery/main.py "Graph Neural Networks for Drug Discovery"
```

## 7) Expected output

The application writes output files to:

```bash
output/
```

Main outputs:
- `output/papers.json` — paper search results
- `output/analysis.json` — novelty analysis output
- `output/research_report.md` — final generated report

The search output excludes arXiv preprints and excludes Crossref/OpenAlex records unless they
have a DOI, publication year, accepted publication type, and journal or conference venue.
Accepted records are marked with `peer_review_status: "verified"`. This is a conservative
automated metadata policy; it does not independently audit the publisher's peer-review process.

## 8) Manual helper scripts

This project also includes helper scripts for testing pieces of the workflow:

### Search papers manually

```bash
PYTHONPATH=src python run_paper_search.py
```

### Run novelty analysis on saved paper JSON

```bash
PYTHONPATH=src python run_analysis.py
```

These are useful for manual debugging and isolated checks, but the main system entry point is `src/knowledge_discovery/main.py`.

### List an exact number of papers independently

To use the paper-search component without running novelty analysis or report generation:

```bash
PYTHONPATH=src python run_paper_search_agent.py "AI for Crop Disease Detection using Drones" 30
```

The second argument is the requested number of papers. It must be between 1 and 100. The command:

- searches Crossref and OpenAlex
- excludes arXiv and all records that fail the peer-reviewed metadata filter
- ranks eligible papers by topic relevance, then citation count and publication year
- prints the selected papers in the terminal
- writes exactly that number to `output/paper_search_results.json`
- exits with an error instead of writing a partial result if fewer papers are available

The current ranking is deterministic and combines title/abstract topic overlap with citation
impact and recency. If future product requirements call for deeper semantic relevance ranking,
the ranking step can be replaced with the LLM reranker while retaining the same verification and
exact-count checks.

## 9) Analyze a research-paper PDF

The PDF workflow is independent of paper search and the full CrewAI report workflow.

Extract and summarize a PDF:

```bash
PYTHONPATH=src python run_pdf_analysis.py /path/to/paper.pdf
```

Ask one question:

```bash
PYTHONPATH=src python ask_pdf.py /path/to/paper.pdf "What dataset did the authors use?"
```

Start an interactive session:

```bash
PYTHONPATH=src python ask_pdf.py /path/to/paper.pdf --interactive
```

Artifacts are written to:

```text
output/documents/<document_id>/
├── metadata.json
├── extracted.md
├── chunks.json
└── summary.json
```

The PDF must be a non-encrypted, text-based PDF no larger than 50 MB and 500 pages. Scanned
image-only PDFs are detected and rejected because OCR is not configured in this first version.
Question answers use page-aware lexical retrieval and the OpenRouter LLM, and are instructed to
cite pages and avoid inventing information.

## 10) Troubleshooting

### Problem: ImportError or package issues

Check the Python version:

```bash
python -V
```

Use Python 3.12 if needed.

### Problem: missing `dotenv`

Make sure dependencies are installed:

```bash
python -m pip install -r requirements.txt
```

### Problem: `OPENROUTER_API_KEY` is missing

Make sure `.env` exists and contains the key:

```bash
cat .env
```

### Problem: CrewAI crashes in Python 3.14

Use Python 3.12:

```bash
uv venv --python 3.12 .venv
source .venv/bin/activate
```

## 11) Typical Local Workflow

```bash
cd /home/reet/Projects/Multi-Agent-Researcher.worktrees/project-analysis-and-understanding
uv venv --python 3.12 .venv
source .venv/bin/activate
uv pip install -r requirements.txt
cp .env.example .env
# edit .env with your OpenRouter and contact info
PYTHONPATH=src python -m knowledge_discovery.preflight
PYTHONPATH=src python src/knowledge_discovery/main.py "AI for Crop Disease Detection using Drones"
```

## 11) Notes for Contributors

- Keep `.env` local and do not commit it.
- `output/` is generated during runtime and may be safely ignored or cleaned as appropriate.
- The app is a CLI-based research assistant; it is not a web application or database-backed API by default.
- To improve reproducibility, prefer using a supported Python version and a clean local venv for each environment.
