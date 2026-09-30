"""Shared HTTP utilities for external API calls with retries and basic logging."""

from __future__ import annotations

import os
import logging
import threading
from typing import Any

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger(__name__)
logger.addHandler(logging.NullHandler())

# Create a session with retry/backoff to improve resiliency for external APIs
_DEFAULT_RETRY = Retry(
    total=3,
    backoff_factor=1,
    status_forcelist=(429, 500, 502, 503, 504),
    allowed_methods=("GET", "POST"),
)
_SEARCH_RETRY = Retry(
    total=1,
    connect=1,
    read=1,
    status=1,
    backoff_factor=0.2,
    status_forcelist=(500, 502, 503, 504),
    allowed_methods=frozenset({"GET"}),
    respect_retry_after_header=False,
)

_thread_local = threading.local()


def get_session() -> requests.Session:
    session = getattr(_thread_local, "session", None)
    if session is None:
        session = requests.Session()
        adapter = HTTPAdapter(max_retries=_DEFAULT_RETRY)
        session.mount("https://", adapter)
        session.mount("http://", adapter)
        _thread_local.session = session
    return session


def get_search_session() -> requests.Session:
    session = getattr(_thread_local, "search_session", None)
    if session is None:
        session = requests.Session()
        adapter = HTTPAdapter(max_retries=_SEARCH_RETRY)
        session.mount("https://", adapter)
        session.mount("http://", adapter)
        _thread_local.search_session = session
    return session


def get_text(
    url: str,
    *,
    params: dict[str, Any] | None = None,
    headers: dict[str, str] | None = None,
    timeout: int = 30,
) -> str:
    """Return raw text response from a GET request using a resilient session."""
    session = get_session()
    logger.debug("GET text %s params=%s headers=%s", url, params, headers)
    response = session.get(url, params=params, headers=headers, timeout=timeout)
    response.raise_for_status()
    return response.text


def get_json(
    url: str,
    *,
    params: dict[str, Any] | None = None,
    headers: dict[str, str] | None = None,
    timeout: int | tuple[int, int] = 30,
    search: bool = False,
) -> dict[str, Any]:
    """GET and decode JSON with retries/backoff.

    Uses a shared requests.Session configured with urllib3 Retry.
    """
    session = get_search_session() if search else get_session()
    logger.debug("GET json %s params=%s headers=%s", url, params, headers)
    response = session.get(url, params=params, headers=headers, timeout=timeout)
    response.raise_for_status()
    try:
        return response.json()
    except ValueError as exc:
        logger.exception("Failed to decode JSON from %s: %s", url, exc)
        raise


def build_headers(*extra: dict[str, str]) -> dict[str, str]:
    headers = {"Accept": "application/json"}
    for d in extra:
        if d:
            headers.update(d)
    return headers


def crossref_headers() -> dict[str, str]:
    """Crossref polite pool — include contact email when available."""
    contact = os.getenv("CROSSREF_MAILTO", "research@example.com")
    return build_headers({"User-Agent": f"KnowledgeDiscoveryPlatform/0.1 (mailto:{contact})"})


def openalex_headers() -> dict[str, str]:
    """OpenAlex recommends including a contact email in requests."""
    contact = os.getenv("OPENALEX_MAILTO", "research@example.com")
    return build_headers({"User-Agent": f"KnowledgeDiscoveryPlatform/0.1 (mailto:{contact})"})


def semantic_scholar_headers() -> dict[str, str]:
    """Return headers for the Semantic Scholar API."""
    api_key = os.getenv("SEMANTIC_SCHOLAR_API_KEY")
    if not api_key:
        return build_headers()
    return build_headers({"x-api-key": api_key})
