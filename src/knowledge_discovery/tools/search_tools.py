"""CrewAI tools for paper search."""

import json
import math
import re

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

from knowledge_discovery.tools.crossref_search import search_crossref
from knowledge_discovery.tools.openalex_search import search_openalex
from knowledge_discovery.tools.semantic_scholar_search import search_semantic_scholar


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
        "publication_type": paper.publication_type,
        "venue": paper.venue,
        "peer_review_status": paper.peer_review_status,
    }


class PaperSearchTool(BaseTool):
    name: str = "paper_search"
    description: str = (
        "Search academic research papers using Crossref, OpenAlex, and Semantic Scholar, excluding preprints and "
        "records whose peer-review status cannot be verified. Returns structured JSON with "
        "publication metadata and only verified peer-reviewed candidates."
    )
    args_schema: type[BaseModel] = PaperSearchInput

    def _run(self, query: str, limit: int = 10) -> str:
        papers = []
        errors = []

        for name, search_fn in (
            ("Crossref", search_crossref),
            ("OpenAlex", search_openalex),
            ("Semantic Scholar", search_semantic_scholar),
        ):
            try:
                papers.extend(search_fn(query, limit=limit))
            except Exception as exc:
                errors.append(f"{name} error: {exc}")

        unique = _dedupe_papers(papers)
        eligible = rank_papers(
            query,
            (paper for paper in unique if paper.peer_review_status == "verified"),
        )
        result = {
            "query": query,
            "count": len(eligible),
            "excluded_count": len(unique) - len(eligible),
            "papers": [_paper_to_dict(p) for p in eligible[: limit * 3]],
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


def rank_papers(query: str, papers):
    """Rank verified papers by topic relevance, impact, recency, and title."""
    query_tokens = _tokens(query)

    def sort_key(paper):
        title_score = _overlap(query_tokens, _tokens(paper.title))
        abstract_score = _overlap(query_tokens, _tokens(paper.abstract))
        relevance = (0.7 * title_score) + (0.3 * abstract_score)
        return (
            -relevance,
            -math.log1p(getattr(paper, "citation_count", 0) or 0),
            -(getattr(paper, "year", 0) or 0),
            (getattr(paper, "title", "") or "").casefold(),
        )

    return sorted(papers, key=sort_key)


def _tokens(text: str) -> set[str]:
    stopwords = {
        "and", "for", "from", "the", "using", "with", "based", "into",
        "this", "that", "are", "its", "via",
    }
    return {
        token
        for token in re.findall(r"[a-z0-9]+", text.lower())
        if len(token) > 2 and token not in stopwords
    }


def _overlap(query_tokens: set[str], paper_tokens: set[str]) -> float:
    if not query_tokens:
        return 0.0
    return len(query_tokens & paper_tokens) / len(query_tokens)