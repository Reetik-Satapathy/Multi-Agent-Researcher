from pathlib import Path
import sys

# Ensure src is importable when running from repo root
SRC = Path(__file__).resolve().parent / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from knowledge_discovery.tools.search_tools import PaperSearchTool


def main():
    q = "deep learning using python"
    try:
        tool = PaperSearchTool()
        print(f"Running paper search for query: '{q}'")
        out = tool._run(q, limit=50)
        out_path = Path("output") / "papers.json"
        out_path.parent.mkdir(exist_ok=True)
        out_path.write_text(out, encoding="utf-8")
        print(f"Saved {out_path}")
    except Exception as e:
        print("Paper search failed:", e)
        raise


if __name__ == "__main__":
    main()
