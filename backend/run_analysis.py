from pathlib import Path
import sys

# Ensure src is importable when running from repo root
SRC = Path(__file__).resolve().parent / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from knowledge_discovery.tools.analysis_tools import NoveltyAnalysisTool


def main():
    q = "deep learning using python"
    papers_path = Path("output") / "papers.json"
    if not papers_path.exists():
        print(f"Missing {papers_path}. Run run_paper_search.py first to create it.")
        raise SystemExit(1)
    try:
        papers = papers_path.read_text(encoding="utf-8")
        tool = NoveltyAnalysisTool()
        print(f"Running novelty analysis for query: '{q}'")
        out = tool._run(q, papers)
        out_path = Path("output") / "analysis.json"
        out_path.parent.mkdir(exist_ok=True)
        out_path.write_text(out, encoding="utf-8")
        print(f"Saved {out_path}")
    except Exception as e:
        print("Analysis failed:", e)
        raise


if __name__ == "__main__":
    main()
