# AI Knowledge Discovery Platform

A multi-agent AI research system that helps researchers, students, and innovators explore existing knowledge before starting new research. Instead of manually searching multiple sources, specialized CrewAI agents search academic literature, analyze prior work, estimate novelty, and generate a structured research report.

## Features (MVP)

| Feature | Description |
|---------|-------------|
| Research Topic Search | Enter any research topic to start discovery |
| Paper Search | Crossref + OpenAlex + Semantic Scholar with conservative peer-reviewed-only filtering |
| Research Analysis | Novelty scoring, similarity, gap detection |
| Report Generation | Markdown report with executive summary and references |

## Architecture

```
User → CrewAI Orchestrator (OpenRouter LLM)
         ├── Paper Search Agent       → paper_search tool       → Crossref / OpenAlex / Semantic Scholar
         ├── Research Analysis Agent  → novelty_analysis tool
         └── Report Agent
                    ↓
           Final Research Report (output/research_report.md)
```

Agents never call APIs directly — all external services are accessed through the tool layer.

## Project Structure

```
src/knowledge_discovery/
├── config/
│   ├── agents.yaml          # Agent roles, goals, backstories
│   └── tasks.yaml           # Task descriptions and expected outputs
├── tools/
│   ├── search_tools.py      # CrewAI paper search tools
│   ├── analysis_tools.py    # Novelty analysis tool
│   ├── arxiv_search.py      # arXiv client
│   ├── crossref_search.py   # Crossref client
│   └── openalex_search.py   # OpenAlex client
├── utils/
│   └── llm.py               # OpenRouter LLM configuration
├── models/
│   └── schemas.py           # Paper, ResearchAnalysis models
├── crew.py                  # CrewAI orchestrator
└── main.py                  # CLI entry point
```

## Setup

### 1. Prerequisites

- **Python 3.10–3.13** (CrewAI does not yet support Python 3.14+)
- [OpenRouter](https://openrouter.ai/) API key

All literature search APIs (arXiv, Crossref, OpenAlex) are free and require no API keys.
Semantic Scholar uses the optional API key shown below for reliable access. arXiv remains
available as a parser in the source tree, but is intentionally excluded from the peer-reviewed-only
production search.

### 2. Install

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure Environment

```bash
copy .env.example .env   # Windows
# cp .env.example .env   # macOS / Linux
```

Edit `.env`:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openrouter/openai/gpt-4o-mini
CROSSREF_MAILTO=your@email.com
OPENALEX_MAILTO=your@email.com
SEMANTIC_SCHOLAR_API_KEY=your_semantic_scholar_api_key
```

## Usage

From the project root:

```bash
# Activate the environment first
source .venv/bin/activate

# Default example topic
PYTHONPATH=src python src/knowledge_discovery/main.py

# Custom research topic
PYTHONPATH=src python src/knowledge_discovery/main.py "AI for Crop Disease Detection using Drones"

# Independently list exactly 30 verified papers
PYTHONPATH=src python run_paper_search_agent.py "AI for Crop Disease Detection using Drones" 30

# Extract and summarize a local research-paper PDF
PYTHONPATH=src python run_pdf_analysis.py paper.pdf

# Ask a grounded question about a local research-paper PDF
PYTHONPATH=src python ask_pdf.py paper.pdf "What dataset did the authors use?"

# Start an interactive question session
PYTHONPATH=src python ask_pdf.py paper.pdf --interactive
```

The final report is saved to `output/research_report.md`.
The independent search command saves its exact-count result to
`output/paper_search_results.json`.
PDF artifacts are saved under `output/documents/<document_id>/`, including metadata, extracted
Markdown, page-aware chunks, and the generated summary.

### Running the full CrewAI workflow

The full crew runs three sequential agents:

1. **Paper Search Agent** — expands the topic and searches Crossref, OpenAlex, and Semantic
   Scholar for verified papers.
2. **Research Analysis Agent** — calculates novelty, identifies similar work, and analyzes gaps.
3. **Report Agent** — generates the detailed Markdown report.

The crew writes:

```text
output/papers.json
output/analysis.json
output/research_report.md
```

The report includes executive summary, search methodology, research landscape, related papers,
comparative analysis, novelty analysis, research gaps, future opportunities, practical takeaways,
and references.

You can also install the project as an editable package:

```bash
uv pip install -e .
research "AI for Crop Disease Detection using Drones"
```

If `research` is unavailable, use the explicit `PYTHONPATH=src python ...` command above.

## Example Output

The platform produces a report containing:

- **Executive Summary** — overview of the research landscape
- **Related Papers** — title, authors, year, citations, URLs
- **Research Analysis** — novelty score, similar prior work
- **Research Gaps** — underexplored areas
- **References** — full citation list with links

### Peer-reviewed-only output

The final paper set is filtered conservatively. arXiv results are excluded because they are
preprints, and Crossref/OpenAlex/Semantic Scholar results are included only when their metadata identifies an
accepted publication type, DOI, publication year, and journal or conference venue. Records that
cannot meet these checks are excluded before novelty analysis and report generation. Every
accepted paper includes `peer_review_status: "verified"`. This is an automated metadata policy,
not an independent guarantee from the APIs that a review process occurred.

### PDF analysis

The PDF feature is separate from paper search and the full research crew. It uses PyMuPDF for
validation, metadata, and page text, and PyMuPDF4LLM for Markdown extraction. It rejects encrypted,
empty, oversized, and image-only PDFs because OCR is not configured yet. Questions use lexical
retrieval over page-aware chunks and the OpenRouter LLM; answers are instructed to cite source
pages and to say when the paper does not support an answer.

## API Keys

| Service | Required | Purpose |
|---------|----------|---------|
| OpenRouter | Yes | Powers all CrewAI agents via `gpt-4o-mini` |
| arXiv | No | Free public API |
| Crossref | No | Free public API (contact email recommended) |
| OpenAlex | No | Free public API (contact email recommended) |

## Extending the Platform

The modular design supports future additions:

- Add Semantic Scholar or similar sources in `tools/`
- Add new agents in `config/agents.yaml` and register them in `crew.py`
- Change the OpenRouter model via `OPENROUTER_MODEL` in `.env`
- Add a web UI or REST API on top of `main.run()`

## License

Apache License 2.0 — see [LICENSE](LICENSE).