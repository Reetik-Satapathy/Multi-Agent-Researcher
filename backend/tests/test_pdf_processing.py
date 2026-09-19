import json
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest.mock import patch

crewai_module = types.ModuleType("crewai")
crewai_tools_module = types.ModuleType("crewai.tools")

class BaseTool:
    pass

class LLM:
    pass

crewai_tools_module.BaseTool = BaseTool
crewai_module.LLM = LLM
crewai_module.tools = crewai_tools_module
sys.modules.setdefault("crewai", crewai_module)
sys.modules.setdefault("crewai.tools", crewai_tools_module)

SRC = Path(__file__).resolve().parents[1] / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

import fitz

from knowledge_discovery.pdf_processing import (
    answer_question,
    answer_documents_question,
    compare_documents,
    extract_pdf,
    validate_pdf,
)


class PdfProcessingTests(unittest.TestCase):
    def test_extract_pdf_writes_metadata_markdown_and_chunks(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            pdf_path = root / "paper.pdf"
            document = fitz.open()
            page = document.new_page()
            page.insert_text((72, 72), "Research question: What is the result?\nThe result is positive.")
            document.save(pdf_path)
            document.close()

            output_dir = extract_pdf(pdf_path, root / "documents")

            self.assertTrue((output_dir / "metadata.json").exists())
            self.assertTrue((output_dir / "extracted.md").exists())
            self.assertTrue((output_dir / "chunks.json").exists())
            chunks = json.loads((output_dir / "chunks.json").read_text())
            self.assertEqual(chunks[0]["page_start"], 1)
            self.assertIn("positive", chunks[0]["text"])

    def test_validate_pdf_rejects_non_pdf(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "paper.txt"
            path.write_text("not a pdf")
            with self.assertRaises(ValueError):
                validate_pdf(path)

    def test_answer_question_uses_retrieved_pages(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            chunks_path = root / "chunks.json"
            chunks_path.write_text(json.dumps([
                {
                    "chunk_id": "chunk-1",
                    "document_id": "doc",
                    "text": "The authors used the PlantVillage dataset.",
                    "page_start": 4,
                    "page_end": 4,
                    "section": "Methods",
                },
                {
                    "chunk_id": "chunk-2",
                    "document_id": "doc",
                    "text": "The conclusion discusses future work.",
                    "page_start": 8,
                    "page_end": 8,
                    "section": "Conclusion",
                },
            ]))

            fake_llm = types.SimpleNamespace(
                call=lambda messages: "They used PlantVillage. [p. 4]"
            )
            with patch("knowledge_discovery.pdf_processing.get_llm", return_value=fake_llm):
                answer = answer_question(root, "What dataset did they use?")

            self.assertIn("PlantVillage", answer)
            self.assertIn("[p. 4]", answer)

    def test_compare_documents_and_questions_use_both_papers(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            document_dirs = []
            for index, text in enumerate([
                "Paper one uses CNNs for crop classification.",
                "Paper two uses transformers for crop classification.",
            ], start=1):
                document_dir = root / f"doc-{index}"
                document_dir.mkdir()
                (document_dir / "metadata.json").write_text(json.dumps({
                    "document_id": f"doc-{index}",
                    "filename": f"paper-{index}.pdf",
                    "title": f"Paper {index}",
                    "authors": [],
                    "page_count": 1,
                    "subject": "",
                    "doi": None,
                }))
                (document_dir / "chunks.json").write_text(json.dumps([{
                    "chunk_id": f"chunk-{index}",
                    "document_id": f"doc-{index}",
                    "text": text,
                    "page_start": 1,
                    "page_end": 1,
                    "section": "Methods",
                }]))
                document_dirs.append(document_dir)

            fake_llm = types.SimpleNamespace(call=lambda messages: json.dumps({
                "overview": "The papers use different model families.",
                "similarities": ["Both classify crops."],
                "differences": ["CNNs versus transformers."],
                "research_gaps": ["Cross-dataset validation."],
                "comparison_table": [{"metric": "Model", "values": {"Paper 1": "CNN", "Paper 2": "Transformer"}}],
            }) if "Compare the two" in messages[0]["content"] else "Paper 1 uses CNNs; Paper 2 uses transformers. [Document 1, p. 1] [Document 2, p. 1]")
            with patch("knowledge_discovery.pdf_processing.get_llm", return_value=fake_llm):
                comparison = compare_documents(document_dirs)
                answer = answer_documents_question(document_dirs, "crop classification")

            self.assertEqual(comparison["comparison_table"][0]["values"]["Paper 2"], "Transformer")
            self.assertIn("Paper 1", answer)
            self.assertIn("Paper 2", answer)


if __name__ == "__main__":
    unittest.main()
