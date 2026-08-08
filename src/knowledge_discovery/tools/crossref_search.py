"""Crossref paper search client."""

from __future__ import annotations

from typing import Any

from knowledge_discovery.models.schemas import Paper
from knowledge_discovery.utils.http_client import crossref_headers, get_json

CROSSREF_BASE = "https://api.crossref.org/works"


def search_crossref(query: str, limit: int = 10) -> list[Paper]:
    data = get_json(
        CROSSREF_BASE,
        params={
            "query": query,
            "rows": min(limit, 100),
            "sort": "relevance",
            "select": "DOI,title,author,published-print,published-online,abstract,is-referenced-by-count,type",
        },
        headers=crossref_headers(),
    )

    papers: list[Paper] = []
    for item in data.get("message", {}).get("items", []):
        papers.append(_parse_item(item))
    return papers


def _parse_item(item: dict[str, Any]) -> Paper:
    title_list = item.get("title") or []
    title = title_list[0] if title_list else "Untitled"
    authors = _parse_authors(item.get("author", []))
    year = _extract_year(item)
    doi = item.get("DOI", "")
    abstract = item.get("abstract", "") or ""

    return Paper(
        title=title,
        authors=authors,
        year=year,
        abstract=abstract,
        citation_count=item.get("is-referenced-by-count") or 0,
        source="Crossref",
        url=f"https://doi.org/{doi}" if doi else "",
    )


def _parse_authors(authors: list[dict[str, Any]]) -> list[str]:
    names: list[str] = []
    for author in authors:
        given = author.get("given", "")
        family = author.get("family", "")
        full_name = f"{given} {family}".strip()
        if full_name:
            names.append(full_name)
    return names


def _extract_year(item: dict[str, Any]) -> int | None:
    for field in ("published-print", "published-online", "created"):
        date_parts = item.get(field, {}).get("date-parts", [[]])
        if date_parts and date_parts[0] and date_parts[0][0]:
            return int(date_parts[0][0])
    return None
