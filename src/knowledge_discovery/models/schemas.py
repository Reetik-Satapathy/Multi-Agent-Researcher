"""Data models for papers and research analysis."""

from __future__ import annotations

from pydantic import BaseModel, Field


class Paper(BaseModel):
    title: str
    authors: list[str] = Field(default_factory=list)
    year: int | None = None
    abstract: str = ""
    citation_count: int = 0
    source: str = ""
    url: str = ""


class ResearchAnalysis(BaseModel):
    novelty_score: float = Field(ge=0, le=100)
    similar_papers: list[str] = Field(default_factory=list)
    existing_work: list[str] = Field(default_factory=list)
    research_gaps: list[str] = Field(default_factory=list)
    future_opportunities: list[str] = Field(default_factory=list)
