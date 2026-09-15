"""Ask grounded questions about an ingested research-paper PDF."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from dotenv import load_dotenv

SRC = Path(__file__).resolve().parent / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from knowledge_discovery.pdf_processing import answer_question, extract_pdf

load_dotenv()


def main() -> int:
    parser = argparse.ArgumentParser(description="Ask questions about a research-paper PDF.")
    parser.add_argument("pdf", type=Path)
    parser.add_argument("question", nargs="?")
    parser.add_argument("--interactive", action="store_true")
    args = parser.parse_args()

    document_dir = extract_pdf(args.pdf)
    if args.interactive:
        print("Ask questions about the paper. Type 'exit' to quit.")
        while True:
            question = input("\nQuestion: ").strip()
            if question.lower() in {"exit", "quit"}:
                break
            print(answer_question(document_dir, question))
        return 0
    if not args.question:
        parser.error("provide a question or use --interactive")
    print(answer_question(document_dir, args.question))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
