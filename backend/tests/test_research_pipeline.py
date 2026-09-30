import asyncio
import json
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

from fastapi import HTTPException

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
from knowledge_discovery.api import (
    PaperSearchRequest,
    ReportRequest,
    generate_report,
    get_current_user,
    google_login,
    logout,
    search_papers,
)
from starlette.requests import Request
from knowledge_discovery.tools.analysis_tools import (
    NoveltyAnalysisTool,
    compute_novelty_score,
    detect_research_gaps,
)
from knowledge_discovery.tools.llm_tools import _safe_load_json
from knowledge_discovery.tools.crossref_search import _parse_item
from knowledge_discovery.tools.openalex_search import _reconstruct_abstract, _parse_work
from knowledge_discovery.tools.semantic_scholar_search import _parse_paper
from knowledge_discovery.tools.search_tools import PaperSearchTool, _dedupe_papers


class ResearchPipelineTests(unittest.TestCase):
    def test_google_login_requires_oauth_configuration(self):
        scope = {
            "type": "http",
            "method": "GET",
            "path": "/api/auth/google/login",
            "headers": [],
            "query_string": b"",
            "session": {},
        }
        with patch("knowledge_discovery.api.google_enabled", False):
            with self.assertRaises(HTTPException) as raised:
                asyncio.run(google_login(Request(scope), "http://localhost:5173"))
        self.assertEqual(raised.exception.status_code, 503)

    def test_google_login_rejects_untrusted_frontend_origin(self):
        scope = {
            "type": "http",
            "method": "GET",
            "path": "/api/auth/google/login",
            "headers": [],
            "query_string": b"",
            "session": {},
        }
        with patch("knowledge_discovery.api.google_enabled", True):
            with self.assertRaises(HTTPException) as raised:
                asyncio.run(google_login(Request(scope), "https://example.invalid"))
        self.assertEqual(raised.exception.status_code, 400)

    def test_auth_session_reports_user_and_clears_on_logout(self):
        scope = {
            "type": "http",
            "method": "POST",
            "path": "/api/auth/logout",
            "headers": [],
            "query_string": b"",
            "session": {
                "google_user": {
                    "name": "Research User",
                    "email": "user@example.com",
                }
            },
        }
        request = Request(scope)

        session = asyncio.run(get_current_user(request))
        self.assertEqual(session["user"]["name"], "Research User")
        self.assertEqual(session["user"]["email"], "user@example.com")

        result = asyncio.run(logout(request))
        self.assertEqual(result, {"logged_out": True})
        self.assertEqual(request.session, {})

    def test_novelty_analysis_accepts_list_and_object_paper_inputs(self):
        tool = NoveltyAnalysisTool()
        papers = [{"title": "Federated learning for medical imaging", "abstract": "Privacy preserving learning."}]

        list_result = json.loads(tool._run("federated learning medical imaging", json.dumps(papers)))
        object_result = json.loads(
            tool._run("federated learning medical imaging", json.dumps({"papers": papers}))
        )

        self.assertEqual(list_result["similar_papers"], object_result["similar_papers"])
        self.assertEqual(list_result["novelty_score"], object_result["novelty_score"])

    def test_novelty_analysis_rejects_invalid_paper_shapes(self):
        with self.assertRaisesRegex(ValueError, "JSON object or array"):
            NoveltyAnalysisTool()._run("research topic", json.dumps("invalid shape"))

        with self.assertRaisesRegex(ValueError, "list of paper objects"):
            NoveltyAnalysisTool()._run("research topic", json.dumps({"papers": ["not a paper"]}))

    def test_report_api_runs_direct_search_analysis_and_one_writer_call(self):
        paper_results = {
            "query": "federated learning medical imaging",
            "count": 1,
            "papers": [{"title": "Verified paper", "peer_review_status": "verified"}],
            "warnings": [],
        }
        analysis = {"novelty_score": 70, "similar_papers": [], "research_gaps": []}
        writer = types.SimpleNamespace(
            call=Mock(return_value="# Research Report\n\n## 1. Executive Summary")
        )
        with tempfile.TemporaryDirectory() as temp_dir, patch(
            "knowledge_discovery.tools.search_tools.PaperSearchTool._run",
            return_value=json.dumps(paper_results),
        ) as search, patch(
            "knowledge_discovery.tools.analysis_tools.NoveltyAnalysisTool._run",
            return_value=json.dumps(analysis),
        ) as analyze, patch(
            "knowledge_discovery.utils.llm.get_llm",
            return_value=writer,
        ), patch("knowledge_discovery.api.OUTPUT_ROOT", Path(temp_dir)):
            response = generate_report(ReportRequest(topic="federated learning medical imaging"))
            self.assertEqual(response["markdown"], "# Research Report\n\n## 1. Executive Summary")
            search.assert_called_once_with("federated learning medical imaging", limit=10)
            analyze.assert_called_once()
            writer.call.assert_called_once()
            prompt = writer.call.call_args.args[0][0]["content"]
            for section in (
                "## 1. Executive Summary",
                "## 4. Related Papers",
                "## 5. Comparative Analysis",
                "## 10. References",
                "Preserve the requested level of detail and length.",
            ):
                self.assertIn(section, prompt)
            self.assertTrue((Path(temp_dir) / "papers.json").exists())
            self.assertTrue((Path(temp_dir) / "analysis.json").exists())
            self.assertEqual(
                (Path(temp_dir) / "research_report.md").read_text(encoding="utf-8"),
                response["markdown"],
            )

    def test_search_api_returns_all_available_papers_below_requested_count(self):
        available_papers = [{"title": f"Available paper {index}"} for index in range(3)]
        for topic, requested_count in (
            ("short query", 10),
            ("medium query", 15),
            ("common topic", 20),
            ("broad subject", 25),
        ):
            with self.subTest(topic=topic, requested_count=requested_count), patch(
                "knowledge_discovery.tools.search_tools.PaperSearchTool._run",
                return_value=json.dumps({"papers": available_papers, "count": 3}),
            ):
                result = search_papers(
                    PaperSearchRequest(topic=topic, count=requested_count)
                )

            self.assertEqual(result["papers"], available_papers)
            self.assertEqual(result["count"], 3)
            self.assertEqual(result["requested_count"], requested_count)

    def test_search_api_caps_results_at_requested_count(self):
        available_papers = [{"title": f"Paper {index}"} for index in range(30)]
        with patch(
            "knowledge_discovery.tools.search_tools.PaperSearchTool._run",
            return_value=json.dumps({"papers": available_papers, "count": 30}),
        ):
            result = search_papers(PaperSearchRequest(topic="broad research", count=10))

        self.assertEqual(len(result["papers"]), 10)
        self.assertEqual(result["count"], 10)
        self.assertEqual(result["requested_count"], 10)

    def test_paper_search_returns_partial_results_when_provider_fails(self):
        available = Paper(
            title="Verified paper",
            year=2024,
            citation_count=5,
            source="Crossref",
            url="https://doi.org/10.1000/available",
            publication_type="journal-article",
            venue="Journal",
            peer_review_status="verified",
        )
        with patch(
            "knowledge_discovery.tools.search_tools.search_crossref",
            return_value=[available],
        ), patch(
            "knowledge_discovery.tools.search_tools.search_openalex",
            side_effect=TimeoutError("provider timed out"),
        ), patch(
            "knowledge_discovery.tools.search_tools.search_semantic_scholar",
            return_value=[],
        ):
            result = json.loads(PaperSearchTool()._run("research topic", limit=20))

        self.assertEqual(result["count"], 1)
        self.assertEqual(result["papers"][0]["title"], "Verified paper")
        self.assertTrue(any("OpenAlex error" in warning for warning in result["warnings"]))

    def test_paper_search_keeps_only_verified_papers_and_formats(self):
        with patch("knowledge_discovery.tools.search_tools.search_crossref") as mock_crossref, patch(
            "knowledge_discovery.tools.search_tools.search_openalex"
        ) as mock_openalex, patch(
            "knowledge_discovery.tools.search_tools.search_semantic_scholar",
            return_value=[],
        ):
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
        ) as mock_openalex, patch(
            "knowledge_discovery.tools.search_tools.search_semantic_scholar",
            return_value=[],
        ):
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

    def test_semantic_scholar_parser_maps_verified_journal_metadata(self):
        paper = _parse_paper(
            {
                "title": "Drone crop disease detection",
                "authors": [{"name": "Alice Green"}],
                "year": 2024,
                "abstract": "A verified journal study.",
                "citationCount": 42,
                "externalIds": {"DOI": "10.1000/semantic-paper"},
                "publicationTypes": ["JournalArticle"],
                "journal": {"name": "Agricultural AI Journal"},
            }
        )
        self.assertEqual(paper.source, "Semantic Scholar")
        self.assertEqual(paper.publication_type, "journal-article")
        self.assertEqual(paper.peer_review_status, "verified")
        self.assertEqual(paper.url, "https://doi.org/10.1000/semantic-paper")

    def test_semantic_scholar_parser_excludes_arxiv_records(self):
        paper = _parse_paper(
            {
                "title": "A preprint",
                "year": 2024,
                "externalIds": {"ArXiv": "2401.00001", "DOI": "10.48550/arXiv.2401.00001"},
                "publicationTypes": ["JournalArticle", "ArXiv"],
                "journal": {"name": "Repository"},
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
