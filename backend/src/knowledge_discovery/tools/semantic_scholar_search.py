"""Semantic Scholar paper search client."""

from __future__ import annotations

import os
from typing import Any

from knowledge_discovery.models.schemas import Paper
from knowledge_discovery.utils.http_client import get_json, semantic_scholar_headers

SEMANTIC_SCHOLAR_BASE = "https://api.semanticscholar.org/graph/v1/paper/search"
SEARCH_FIELDS = (
    "title,authors,year,abstract,citationCount,externalIds,"
    "publicationTypes,journal,url"
)


def search_semantic_scholar(query: str, limit: int = 10) -> list[Paper]:
    """Search Semantic Scholar and return only records with usable publication metadata."""
    if not os.getenv("SEMANTIC_SCHOLAR_API_KEY"):
        raise ValueError("SEMANTIC_SCHOLAR_API_KEY is not set")

    data = get_json(
        SEMANTIC_SCHOLAR_BASE,
        params={
            "query": query,
            "limit": min(limit, 100),
            "fields": SEARCH_FIELDS,
        },
        headers=semantic_scholar_headers(),
    )
    return [_parse_paper(item) for item in data.get("data", [])]


def _parse_paper(item: dict[str, Any]) -> Paper:
    external_ids = item.get("externalIds") or {}
    doi = external_ids.get("DOI", "")
    publication_types = item.get("publicationTypes") or []
    publication_type = _publication_type(publication_types)
    journal = item.get("journal") or {}
    venue = journal.get("name", "") or ""
    is_preprint = "ArXiv" in publication_types or "ArXiv" in external_ids
    peer_review_status = (
        "verified"
        if publication_type in {"journal-article", "proceedings-article"}
        and bool(doi and venue and item.get("year"))
        and not is_preprint
        else "unknown"
    )

    return Paper(
        title=item.get("title") or "Untitled",
        authors=[
            author.get("name", "")
            for author in item.get("authors", [])
            if author.get("name")
        ],
        year=item.get("year"),
        abstract=item.get("abstract") or "",
        citation_count=item.get("citationCount") or 0,
        source="Semantic Scholar",
        url=f"https://doi.org/{doi}" if doi else item.get("url", ""),
        publication_type=publication_type,
        venue=venue,
        peer_review_status=peer_review_status,
    )


def _publication_type(publication_types: list[str]) -> str:
    if "JournalArticle" in publication_types:
        return "journal-article"
    if "Conference" in publication_types:
        return "proceedings-article"
    return ""
