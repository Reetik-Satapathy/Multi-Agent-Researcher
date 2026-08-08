"""arXiv paper search client."""

from __future__ import annotations

import xml.etree.ElementTree as ET
from typing import Any

from knowledge_discovery.models.schemas import Paper
from knowledge_discovery.utils.http_client import get_text
from knowledge_discovery.utils.http_client import logger as http_logger

ARXIV_API = "https://export.arxiv.org/api/query"
ATOM_NS = {"atom": "http://www.w3.org/2005/Atom"}


def search_arxiv(query: str, limit: int = 10) -> list[Paper]:
    http_logger.debug("Searching arXiv for query=%s limit=%s", query, limit)
    xml_text = get_text(
        ARXIV_API,
        params={
            "search_query": f"all:{query}",
            "start": 0,
            "max_results": min(limit, 50),
        },
        timeout=30,
    )
    return _parse_feed(xml_text)


def _parse_feed(xml_text: str) -> list[Paper]:
    root = ET.fromstring(xml_text)
    papers: list[Paper] = []

    for entry in root.findall("atom:entry", ATOM_NS):
        papers.append(_parse_entry(entry))
    return papers


def _parse_entry(entry: ET.Element) -> Paper:
    title = _text(entry, "atom:title").replace("\n", " ").strip()
    abstract = _text(entry, "atom:summary").replace("\n", " ").strip()
    authors = [
        (author.find("atom:name", ATOM_NS).text or "").strip()
        for author in entry.findall("atom:author", ATOM_NS)
        if author.find("atom:name", ATOM_NS) is not None
    ]
    url = _text(entry, "atom:id").strip()
    year = _extract_year(entry)
    arxiv_id = url.split("/abs/")[-1] if "/abs/" in url else ""

    return Paper(
        title=title or "Untitled",
        authors=authors,
        year=year,
        abstract=abstract,
        citation_count=0,
        source="arXiv",
        url=url or (f"https://arxiv.org/abs/{arxiv_id}" if arxiv_id else ""),
    )


def _text(entry: ET.Element, tag: str) -> str:
    element = entry.find(tag, ATOM_NS)
    return element.text if element is not None and element.text else ""


def _extract_year(entry: ET.Element) -> int | None:
    published = _text(entry, "atom:published")
    if len(published) >= 4 and published[:4].isdigit():
        return int(published[:4])
    return None
