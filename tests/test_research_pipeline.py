import json
import sys
import types
import unittest
from pathlib import Path
from unittest.mock import patch

# The app depends on CrewAI, but that package is not compatible with Python 3.14 in this
# environment. Stub the minimal CrewAI surface needed for the unit tests so the project logic
# can be validated without invoking the full runtime stack.
crewai_module = types.ModuleType("crewai")
crewai_tools_module = types.ModuleType("crewai.tools")

class BaseTool:
    name = "tool"
    description = "tool description"

class LLM:
    def __init__(self, *args, **kwargs):
        pass

crewai_tools_module.BaseTool = BaseTool
crewai_module.LLM = LLM
crewai_module.tools = crewai_tools_module

sys.modules.setdefault("crewai", crewai_module)
sys.modules.setdefault("crewai.tools", crewai_tools_module)

SRC = Path(__file__).resolve().parents[1] / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from knowledge_discovery.models.schemas import Paper
from knowledge_discovery.tools.analysis_tools import (
    NoveltyAnalysisTool,
    compute_novelty_score,
    detect_research_gaps,
)
from knowledge_discovery.tools.llm_tools import _safe_load_json
from knowledge_discovery.tools.crossref_search import _parse_item
from knowledge_discovery.tools.openalex_search import _reconstruct_abstract, _parse_work
from knowledge_discovery.tools.search_tools import PaperSearchTool, _dedupe_papers


class ResearchPipelineTests(unittest.TestCase):
    def test_paper_search_keeps_only_verified_papers_and_formats(self):
        with patch("knowledge_discovery.tools.search_tools.search_crossref") as mock_crossref, patch(
            "knowledge_discovery.tools.search_tools.search_openalex"
        ) as mock_openalex:
            mock_crossref.return_value = [
                Paper(
                    title="Crop disease detection using drones",
                    authors=["Alice Green"],
                    year=2024,
                    abstract="Detect plant disease using drone imagery and deep learning.",
                    citation_count=8,
                    source="Crossref",
                    url="https://doi.org/10.1000/duplicate-id",
                    publication_type="journal-article",
                    venue="Journal of Agricultural AI",
                    peer_review_status="verified",
                ),
                Paper(
                    title="Drone imaging and crop stress classification",
                    authors=["Bob White"],
                    year=2023,
                    abstract="A study of crop stress classification from aerial images.",
                    citation_count=3,
                    source="Crossref",
                    url="https://doi.org/10.1000/unique-id",
                    publication_type="posted-content",
                    venue="A preprint server",
                    peer_review_status="unknown",
                )
            ]
            mock_openalex.return_value = []

            output = json.loads(PaperSearchTool()._run("crop disease detection using drones", limit=5))

            self.assertEqual(output["count"], 1)
            self.assertEqual(output["excluded_count"], 1)
            self.assertEqual(len(output["papers"]), 1)
            self.assertTrue(all("title" in paper for paper in output["papers"]))
            self.assertTrue(all("url" in paper for paper in output["papers"]))
            self.assertEqual(output["papers"][0]["peer_review_status"], "verified")

    def test_paper_search_ranks_by_citations_then_recency(self):
        with patch("knowledge_discovery.tools.search_tools.search_crossref") as mock_crossref, patch(
            "knowledge_discovery.tools.search_tools.search_openalex"
        ) as mock_openalex:
            mock_crossref.return_value = [
                Paper(
                    title="Recent low-impact paper",
                    year=2025,
                    citation_count=2,
                    source="Crossref",
                    url="https://doi.org/10.1000/recent",
                    publication_type="journal-article",
                    venue="Journal",
                    peer_review_status="verified",
                ),
                Paper(
                    title="Highly cited paper",
                    year=2018,
                    citation_count=100,
                    source="Crossref",
                    url="https://doi.org/10.1000/cited",
                    publication_type="journal-article",
                    venue="Journal",
                    peer_review_status="verified",
                ),
            ]
            mock_openalex.return_value = []

            output = json.loads(PaperSearchTool()._run("recent paper", limit=10))
            self.assertEqual(output["papers"][0]["title"], "Recent low-impact paper")

    def test_dedupe_prefers_doi_key(self):
        papers = [
            Paper(
                title="A",
                authors=["Alice Green"],
                year=2024,
                abstract="Alpha",
                citation_count=1,
                source="arXiv",
                url="https://doi.org/10.1000/abc",
            ),
            Paper(
                title="A",
                authors=["Alice Green"],
                year=2024,
                abstract="Alpha",
                citation_count=1,
                source="Crossref",
                url="https://doi.org/10.1000/abc",
            ),
            Paper(
                title="B",
                authors=["John Smith"],
                year=2024,
                abstract="Bravo",
                citation_count=2,
                source="OpenAlex",
                url="https://doi.org/10.1000/def",
            ),
        ]
        self.assertEqual(len(_dedupe_papers(papers)), 2)

    def test_novelty_score_and_gap_detection(self):
        topic = "federated learning for low-cost crop disease detection using drones"
        papers = [
            {
                "title": "Deep learning for crop disease detection",
                "abstract": "Machine learning models detect crop disease using image classification and computer vision.",
            },
            {
                "title": "Drone imaging for agriculture monitoring",
                "abstract": "Unmanned aerial vehicles monitor crop health using remote sensing and environmental data.",
            },
            {
                "title": "Edge AI for agricultural sensor networks",
                "abstract": "Resource-constrained devices support real-time inference on field sensors.",
            },
        ]

        novelty = compute_novelty_score(topic, papers)
        gaps = detect_research_gaps(topic, papers)

        self.assertGreaterEqual(novelty, 5.0)
        self.assertLessEqual(novelty, 95.0)
        self.assertTrue(len(gaps) >= 1)

        analysis = json.loads(
            NoveltyAnalysisTool()._run(topic, json.dumps({"papers": papers}))
        )
        self.assertIn("novelty_score", analysis)
        self.assertIn("research_gaps", analysis)
        self.assertTrue(len(analysis["research_gaps"]) >= 1)

    def test_openalex_parser_reconstructs_abstract(self):
        abstract = _reconstruct_abstract({"disease": [0], "detection": [1], "using": [2], "drones": [3]})
        self.assertEqual(abstract, "disease detection using drones")

    def test_openalex_work_parse_handles_missing_abstract(self):
        item = {
            "display_name": "Large-scale crop monitoring",
            "publication_year": 2024,
            "cited_by_count": 12,
            "authorships": [{"author": {"display_name": "Alice Green"}}],
            "abstract_inverted_index": None,
            "doi": "10.1000/new-paper",
        }
        paper = _parse_work(item)
        self.assertEqual(paper.title, "Large-scale crop monitoring")
        self.assertEqual(paper.source, "OpenAlex")
        self.assertEqual(paper.year, 2024)
        self.assertEqual(paper.url, "https://doi.org/10.1000/new-paper")
        self.assertEqual(paper.peer_review_status, "unknown")

    def test_crossref_parser_verifies_supported_publication_metadata(self):
        paper = _parse_item(
            {
                "title": ["A peer-reviewed article"],
                "author": [{"given": "Alice", "family": "Green"}],
                "DOI": "10.1000/article",
                "type": "journal-article",
                "container-title": ["Journal of Agricultural AI"],
                "published-online": {"date-parts": [[2024]]},
                "is-referenced-by-count": 4,
            }
        )
        self.assertEqual(paper.peer_review_status, "verified")
        self.assertEqual(paper.publication_type, "journal-article")
        self.assertEqual(paper.venue, "Journal of Agricultural AI")

    def test_crossref_parser_rejects_missing_venue_or_unsupported_type(self):
        paper = _parse_item(
            {
                "title": ["A preprint"],
                "DOI": "10.1000/preprint",
                "type": "posted-content",
                "published-online": {"date-parts": [[2024]]},
            }
        )
        self.assertEqual(paper.peer_review_status, "unknown")

    def test_safe_load_json_handles_trailing_text(self):
        payload = 'Here is the answer: {"status": "ok", "items": [1, 2, 3]} trailing noise'
        data = _safe_load_json(payload)
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["items"], [1, 2, 3])

    def test_safe_load_json_rejects_plain_invalid_input(self):
        with self.assertRaises(ValueError):
            _safe_load_json("this is just plain text without json")


if __name__ == "__main__":
    unittest.main()
