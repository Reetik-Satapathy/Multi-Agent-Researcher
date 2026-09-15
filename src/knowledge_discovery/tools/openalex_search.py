"""OpenAlex paper search client."""

from __future__ import annotations

from typing import Any

from knowledge_discovery.models.schemas import Paper
from knowledge_discovery.utils.http_client import get_json, openalex_headers

OPENALEX_BASE = "https://api.openalex.org/works"


def search_openalex(query: str, limit: int = 10) -> list[Paper]:
    data = get_json(
        OPENALEX_BASE,
        params={
            "search": query,
            "per_page": min(limit, 100),
            "sort": "relevance_score:desc",
        },
        headers=openalex_headers(),
    )

    papers: list[Paper] = []
    for item in data.get("results", []):
        papers.append(_parse_work(item))
    return papers


def _parse_work(item: dict[str, Any]) -> Paper:
    authors = [
        author.get("author", {}).get("display_name", "")
        for author in item.get("authorships", [])
        if author.get("author", {}).get("display_name")
    ]
    year = item.get("publication_year")
    abstract = _reconstruct_abstract(item.get("abstract_inverted_index"))
    url = item.get("doi") or item.get("id") or ""
    if url and not url.startswith("http"):
        url = f"https://doi.org/{url}"
    publication_type = item.get("type", "") or ""
    primary_source = (item.get("primary_location") or {}).get("source") or {}
    venue = primary_source.get("display_name", "") or ""
    source_type = primary_source.get("type", "") or ""
    peer_review_status = (
        "verified"
        if publication_type in {"article", "conference-paper"}
        and source_type in {"journal", "conference"}
        and bool(item.get("doi") and venue and year)
        else "unknown"
    )

    return Paper(
        title=item.get("display_name") or item.get("title") or "Untitled",
        authors=authors,
        year=year,
        abstract=abstract,
        citation_count=item.get("cited_by_count") or 0,
        source="OpenAlex",
        url=url,
        publication_type=publication_type,
        venue=venue,
        peer_review_status=peer_review_status,
    )


def _reconstruct_abstract(inverted_index: dict[str, list[int]] | None) -> str:
    if not inverted_index:
        return ""
    words: dict[int, str] = {}
    for word, positions in inverted_index.items():
        for position in positions:
            words[position] = word
    return " ".join(words[i] for i in sorted(words))
