"""CrewAI tools for paper search."""

import json

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

from knowledge_discovery.tools.arxiv_search import search_arxiv
from knowledge_discovery.tools.crossref_search import search_crossref
from knowledge_discovery.tools.openalex_search import search_openalex


class PaperSearchInput(BaseModel):
    query: str = Field(..., description="Research topic or keywords to search for papers.")
    limit: int = Field(default=10, description="Maximum number of papers to return per source.")


def _paper_to_dict(paper) -> dict:
    return {
        "title": paper.title,
        "authors": paper.authors,
        "year": paper.year,
        "abstract": paper.abstract,
        "citation_count": paper.citation_count,
        "source": paper.source,
        "url": paper.url,
    }


class PaperSearchTool(BaseTool):
    name: str = "paper_search"
    description: str = (
        "Search academic research papers using arXiv, Crossref, and OpenAlex. "
        "Returns structured JSON with title, authors, year, abstract, citation count, source, and URL."
    )
    args_schema: type[BaseModel] = PaperSearchInput

    def _run(self, query: str, limit: int = 10) -> str:
        papers = []
        errors = []

        for name, search_fn in (
            ("arXiv", search_arxiv),
            ("Crossref", search_crossref),
            ("OpenAlex", search_openalex),
        ):
            try:
                papers.extend(search_fn(query, limit=limit))
            except Exception as exc:
                errors.append(f"{name} error: {exc}")

        unique = _dedupe_papers(papers)
        result = {
            "query": query,
            "count": len(unique),
            "papers": [_paper_to_dict(p) for p in unique[: limit * 3]],
        }
        if errors:
            result["warnings"] = errors
        return json.dumps(result, indent=2)


def _dedupe_papers(papers):
    """Deduplicate papers preferring DOI when available, otherwise using a
    normalized title + first-author-lastname + year key.
    """
    seen: set[str] = set()
    unique = []
    for paper in papers:
        # Attempt DOI-based dedupe if URL includes doi.org
        url = getattr(paper, "url", "") or ""
        lower_url = url.lower()
        doi_key = None
        if "doi.org/" in lower_url:
            doi_key = lower_url.split("doi.org/")[-1].strip()
        # Build deterministic key
        if doi_key:
            key = f"doi:{doi_key}"
        else:
            title = (getattr(paper, "title", "") or "").lower().strip()
            authors = getattr(paper, "authors", []) or []
            # use last token of first author as a lightweight stable author id
            first_author = ""
            if authors:
                try:
                    first_author = authors[0].split()[-1].lower()
                except Exception:
                    first_author = authors[0].lower()
            year = str(getattr(paper, "year", "") or "")
            key = f"title:{title}|author:{first_author}|year:{year}"

        if key in seen:
            continue
        seen.add(key)
        unique.append(paper)
    return unique