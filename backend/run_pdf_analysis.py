"""Extract and summarize a research-paper PDF."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from dotenv import load_dotenv

SRC = Path(__file__).resolve().parent / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from knowledge_discovery.pdf_processing import extract_pdf, summarize_document

load_dotenv()


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract and summarize a research-paper PDF.")
    parser.add_argument("pdf", type=Path)
    args = parser.parse_args()
    document_dir = extract_pdf(args.pdf)
    summary = summarize_document(document_dir)
    print(json.dumps(summary, indent=2))
    print(f"\nSaved document artifacts to {document_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
