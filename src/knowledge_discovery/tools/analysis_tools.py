"""Heuristic novelty and gap analysis utilities."""

import json
import re

from crewai.tools import BaseTool
from pydantic import BaseModel, Field


class NoveltyAnalysisInput(BaseModel):
    research_topic: str = Field(..., description="The proposed research topic or idea.")
    papers_json: str = Field(..., description="JSON string of papers from paper search.")


def _tokenize(text: str) -> set[str]:
    tokens = re.findall(r"[a-z0-9]+", text.lower())
    stopwords = {
        "the", "and", "for", "with", "using", "based", "from", "that", "this",
        "are", "was", "were", "have", "has", "into", "via", "over", "under",
    }
    return {token for token in tokens if len(token) > 2 and token not in stopwords}


def compute_novelty_score(topic: str, papers: list[dict]) -> float:
    topic_tokens = _tokenize(topic)
    if not topic_tokens:
        return 50.0

    overlaps: list[float] = []
    for item in papers:
        text = " ".join(
            [
                str(item.get("title", "")),
                str(item.get("abstract", "")),
            ]
        )
        item_tokens = _tokenize(text)
        if not item_tokens:
            continue
        overlap = len(topic_tokens & item_tokens) / len(topic_tokens)
        overlaps.append(overlap)

    if not overlaps:
        return 85.0

    max_overlap = max(overlaps)
    avg_overlap = sum(overlaps) / len(overlaps)
    novelty = 100 - ((0.7 * max_overlap) + (0.3 * avg_overlap)) * 100
    return round(max(5.0, min(95.0, novelty)), 1)


def detect_research_gaps(topic: str, papers: list[dict]) -> list[str]:
    corpus = " ".join(
        [
            str(item.get("title", "")) + " " + str(item.get("abstract", ""))
            for item in papers
        ]
    ).lower()

    topic_tokens = _tokenize(topic)
    common_terms = [token for token in topic_tokens if token in corpus]

    gap_templates = [
        ("mobile", "No mobile or edge deployment implementation found in existing work."),
        ("low-cost", "No low-cost deployment strategy identified in existing literature."),
        ("rural", "Limited rural or field case studies in existing literature."),
        ("real-time", "Real-time processing capabilities are underexplored."),
        ("multilingual", "Multilingual or regional language support appears missing."),
        ("privacy", "Privacy-preserving approaches are not well represented."),
        ("open-source", "Open-source reproducible implementations are scarce."),
    ]

    gaps: list[str] = []
    for keyword, message in gap_templates:
        if keyword not in corpus:
            gaps.append(message)

    if len(common_terms) >= 3:
        gaps.append(
            "High overlap with existing work suggests focusing on a narrower sub-problem or novel application domain."
        )

    if not gaps:
        gaps.append("Consider validating findings with domain experts and recent preprints.")

    return gaps[:5]


def rank_similar_items(topic: str, items: list[dict], title_key: str = "title") -> list[str]:
    topic_tokens = _tokenize(topic)
    scored: list[tuple[float, str]] = []

    for item in items:
        title = str(item.get(title_key, "Untitled"))
        abstract = str(item.get("abstract", ""))
        tokens = _tokenize(title + " " + abstract)
        if not tokens or not topic_tokens:
            score = 0.0
        else:
            score = len(topic_tokens & tokens) / len(topic_tokens)
        scored.append((score, title))

    scored.sort(key=lambda pair: pair[0], reverse=True)
    return [title for _, title in scored[:5]]


class NoveltyAnalysisTool(BaseTool):
    name: str = "novelty_analysis"
    description: str = (
        "Compute a heuristic novelty score, identify similar papers, and suggest research gaps "
        "based on search results. Input must include the research topic and JSON output from paper search."
    )
    args_schema: type[BaseModel] = NoveltyAnalysisInput

    def _run(self, research_topic: str, papers_json: str) -> str:
        papers_data = json.loads(papers_json)
        papers = papers_data.get("papers", papers_data if isinstance(papers_data, list) else [])

        novelty_score = compute_novelty_score(research_topic, papers)
        similar_papers = rank_similar_items(research_topic, papers)
        research_gaps = detect_research_gaps(research_topic, papers)

        result = {
            # 'novelty_score' is a percentage in range 0.0 - 100.0 to match ResearchAnalysis schema
            "novelty_score": novelty_score,
            "similar_papers": similar_papers,
            "existing_work": similar_papers[:3],
            "research_gaps": research_gaps,
            "future_opportunities": [
                f"Investigate underrepresented aspects of '{research_topic}' highlighted in gap analysis.",
                "Design experiments that differentiate from the most similar prior papers.",
            ],
        }
        return json.dumps(result, indent=2)