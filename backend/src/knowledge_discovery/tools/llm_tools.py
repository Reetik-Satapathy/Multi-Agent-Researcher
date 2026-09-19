"""LLM-assisted tools: query expansion, semantic reranking, summarization, and novelty scoring."""
from __future__ import annotations

import json
from typing import Any

from crewai.tools import BaseTool
from pydantic import BaseModel, Field

from knowledge_discovery.utils.llm import get_llm


class QueryExpanderInput(BaseModel):
    research_topic: str = Field(..., description="Research topic to expand into multiple queries")
    num_expansions: int = Field(3, description="Number of expanded queries to produce")


def _safe_load_json(text: str):
    """Try to parse JSON from text robustly.

    - First attempt a direct json.loads.
    - If that fails, search for a JSON array/object substring and try to parse it.
    - If parsing fails due to invalid backslash escapes, re-escape backslashes and retry.
    Returns parsed Python object or raises the original JSONDecodeError.
    """
    try:
        return json.loads(text)
    except Exception as e:
        # Try to extract a JSON substring
        start_idx = text.find("{")
        arr_idx = text.find("[")
        if arr_idx != -1 and (arr_idx < start_idx or start_idx == -1):
            start = arr_idx
            end_char = "]"
        elif start_idx != -1:
            start = start_idx
            end_char = "}"
        else:
            raise

        end = text.rfind(end_char)
        if start == -1 or end == -1 or end <= start:
            raise

        candidate = text[start : end + 1]
        try:
            return json.loads(candidate)
        except Exception:
            # Attempt to escape stray backslashes and retry
            fixed = candidate.replace("\\", "\\\\")
            return json.loads(fixed)


class QueryExpanderTool(BaseTool):
    name: str = "query_expander"
    description: str = (
        "Use the LLM to produce multiple search query variants for a research topic."
    )
    args_schema: type[BaseModel] = QueryExpanderInput

    def _run(self, research_topic: str, num_expansions: int = 3) -> str:
        llm = get_llm()
        prompt = (
            f"Produce {num_expansions} concise, high-recall search query variations for the"
            f" research topic: \"{research_topic}\". Return a JSON array of strings."
        )
        messages = [{"role": "user", "content": prompt}]
        resp = llm.call(messages)
        # Ensure valid JSON output — try robust parsing
        try:
            parsed = _safe_load_json(resp)
            return json.dumps(parsed, indent=2)
        except Exception:
            return json.dumps([resp.strip()], indent=2)


class PaperSummarizerInput(BaseModel):
    papers_json: str = Field(..., description="JSON string of papers to summarize")
    max_summaries: int = Field(10, description="Maximum number of paper summaries to produce")


class PaperSummarizerTool(BaseTool):
    name: str = "paper_summarizer"
    description: str = (
        "Generate short (1-2 sentence) abstractive summaries for each paper using the LLM."
    )
    args_schema: type[BaseModel] = PaperSummarizerInput

    def _run(self, papers_json: str, max_summaries: int = 10) -> str:
        llm = get_llm()
        prompt = (
            "You are given a JSON array of papers, each with title, authors, year, abstract, source, and url. "
            f"Produce up to {max_summaries} concise (1-2 sentence) summaries for the first papers. "
            "Return a JSON object where keys are paper titles and values are the summaries.\n\n"
            f"PAPERS_JSON: {papers_json}"
        )
        messages = [{"role": "user", "content": prompt}]
        resp = llm.call(messages)
        # Try to extract JSON robustly
        try:
            parsed = _safe_load_json(resp)
            return json.dumps(parsed, indent=2)
        except Exception:
            # best-effort: return raw text
            return json.dumps({"raw": resp}, indent=2)


class SemanticRerankerInput(BaseModel):
    research_topic: str = Field(...)
    papers_json: str = Field(...)


class SemanticRerankerTool(BaseTool):
    name: str = "semantic_reranker"
    description: str = (
        "Use the LLM to rerank papers by semantic relevance to the topic and suggest duplicates to remove."
    )
    args_schema: type[BaseModel] = SemanticRerankerInput

    def _run(self, research_topic: str, papers_json: str) -> str:
        llm = get_llm()
        prompt = (
            "Given a research topic and a JSON array of papers (title, authors, year, abstract, url), "
            "return a JSON array of objects [{\"title\":..., \"score\":0.0, \"keep\":true}, ...] "
            "where score is a relevance score (0-100) and keep is false for near-duplicates to drop.\n\n"
            f"TOPIC: {research_topic}\nPAPERS: {papers_json}"
        )
        messages = [{"role": "user", "content": prompt}]
        resp = llm.call(messages)
        try:
            parsed = _safe_load_json(resp)
            return json.dumps(parsed, indent=2)
        except Exception:
            return json.dumps({"raw": resp}, indent=2)


class LLMNoveltyScorerInput(BaseModel):
    research_topic: str = Field(...)
    papers_json: str = Field(...)


class LLMNoveltyScorerTool(BaseTool):
    name: str = "llm_novelty_scorer"
    description: str = (
        "Ask the LLM to provide a novelty score (0-100) and a short rationale comparing the topic to the provided papers."
    )
    args_schema: type[BaseModel] = LLMNoveltyScorerInput

    def _run(self, research_topic: str, papers_json: str) -> str:
        llm = get_llm()
        prompt = (
            "Evaluate how novel the research topic is relative to the provided papers. "
            "Return a JSON object: {\"novelty_score\": number, \"rationale\": string, \"top_similar\": [titles]}.\n\n"
            f"TOPIC: {research_topic}\nPAPERS: {papers_json}"
        )
        messages = [{"role": "user", "content": prompt}]
        resp = llm.call(messages)
        try:
            parsed = _safe_load_json(resp)
            return json.dumps(parsed, indent=2)
        except Exception:
            return json.dumps({"raw": resp}, indent=2)
