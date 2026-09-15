"""Run the peer-reviewed paper search independently from the full research crew."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

SRC = Path(__file__).resolve().parent / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from knowledge_discovery.tools.search_tools import PaperSearchTool


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="List an exact number of verified peer-reviewed papers for a topic."
    )
    parser.add_argument("topic", help="Research topic to search for.")
    parser.add_argument(
        "count",
        type=int,
        help="Number of papers required (between 1 and 100).",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not 1 <= args.count <= 100:
        print("Error: count must be between 1 and 100.", file=sys.stderr)
        return 2

    # Request enough candidates from both sources, then enforce the exact final count here.
    result = json.loads(PaperSearchTool()._run(args.topic, limit=max(args.count, 10)))
    papers = result.get("papers", [])

    if len(papers) < args.count:
        print(
            f"Only {len(papers)} verified papers were found; "
            f"{args.count} were requested. No partial result was written.",
            file=sys.stderr,
        )
        return 1

    selected = papers[: args.count]
    output = {
        "query": args.topic,
        "requested_count": args.count,
        "count": len(selected),
        "peer_review_policy": (
            "Only papers marked peer_review_status='verified' by the "
            "Crossref/OpenAlex metadata filter are included."
        ),
        "papers": selected,
    }

    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)
    output_path = output_dir / "paper_search_results.json"
    output_path.write_text(json.dumps(output, indent=2), encoding="utf-8")

    print(f"Found exactly {len(selected)} verified papers for: {args.topic}")
    for index, paper in enumerate(selected, start=1):
        print(
            f"{index}. {paper['title']} "
            f"({paper.get('year') or 'year unknown'}; "
            f"{paper.get('citation_count', 0)} citations) - {paper['url']}"
        )
    print(f"\nSaved results to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
