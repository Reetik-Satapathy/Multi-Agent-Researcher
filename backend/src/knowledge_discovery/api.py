"""HTTP API for the research workspace frontend."""

from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

OUTPUT_ROOT = Path("output")
DOCUMENT_ROOT = OUTPUT_ROOT / "documents"

app = FastAPI(title="Knowledge Discovery API", version="1.0.0")
allowed_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PaperSearchRequest(BaseModel):
    topic: str = Field(min_length=2, max_length=500)
    count: int = Field(default=20, ge=1, le=100)


class ReportRequest(BaseModel):
    topic: str = Field(min_length=2, max_length=500)


class QuestionRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/papers/search")
def search_papers(request: PaperSearchRequest) -> dict[str, Any]:
    from knowledge_discovery.tools.search_tools import PaperSearchTool

    try:
        raw = PaperSearchTool()._run(request.topic, limit=request.count)
        result = json.loads(raw)
    except (TypeError, ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=502, detail="Paper search returned invalid data.") from exc
    result["papers"] = result.get("papers", [])[: request.count]
    result["count"] = len(result["papers"])
    return result


@app.post("/api/research/report")
def generate_report(request: ReportRequest) -> dict[str, Any]:
    from knowledge_discovery.crew import KnowledgeDiscoveryCrew

    OUTPUT_ROOT.mkdir(exist_ok=True)
    result = KnowledgeDiscoveryCrew().crew().kickoff(
        inputs={"research_topic": request.topic}
    )
    report_path = OUTPUT_ROOT / "research_report.md"
    markdown = report_path.read_text(encoding="utf-8") if report_path.exists() else str(result)
    return {"topic": request.topic, "markdown": markdown}


@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)) -> dict[str, Any]:
    from knowledge_discovery.pdf_processing import extract_pdf, summarize_document

    if not file.filename:
        raise HTTPException(status_code=400, detail="A PDF filename is required.")
    suffix = Path(file.filename).suffix.lower()
    if suffix != ".pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    data = await file.read()
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temporary:
        temporary.write(data)
        temporary_path = Path(temporary.name)
    try:
        document_dir = extract_pdf(temporary_path, DOCUMENT_ROOT)
        summary = summarize_document(document_dir)
        metadata = json.loads((document_dir / "metadata.json").read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    finally:
        temporary_path.unlink(missing_ok=True)
    return {"metadata": metadata, "summary": summary}


@app.post("/api/documents/{document_id}/questions")
def ask_document(document_id: str, request: QuestionRequest) -> dict[str, str]:
    from knowledge_discovery.pdf_processing import answer_question

    document_dir = DOCUMENT_ROOT / document_id
    if not document_dir.is_dir():
        raise HTTPException(status_code=404, detail="Document not found.")
    try:
        answer = answer_question(document_dir, request.question)
    except (OSError, ValueError) as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return {"document_id": document_id, "question": request.question, "answer": answer}
