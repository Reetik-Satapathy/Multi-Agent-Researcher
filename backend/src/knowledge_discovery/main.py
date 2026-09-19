"""Entry point for the AI Knowledge Discovery Platform."""

import argparse
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# Allow running as `python -m knowledge_discovery.main` from src/
SRC_DIR = Path(__file__).resolve().parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from knowledge_discovery.crew import KnowledgeDiscoveryCrew  # noqa: E402


DEFAULT_TOPIC = "AI for Crop Disease Detection using Drones"


def run(research_topic: str) -> str:
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)

    inputs = {"research_topic": research_topic}
    result = KnowledgeDiscoveryCrew().crew().kickoff(inputs=inputs)
    return str(result)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="AI Knowledge Discovery Platform — multi-agent research assistant"
    )
    parser.add_argument(
        "topic",
        nargs="?",
        default=DEFAULT_TOPIC,
        help=f"Research topic to explore (default: '{DEFAULT_TOPIC}')",
    )
    args = parser.parse_args()

    print(f"\nStarting research discovery for: {args.topic}\n")
    report = run(args.topic)
    print("\n" + "=" * 60)
    print("Research complete. Report saved to output/research_report.md")
    print("=" * 60 + "\n")
    print(report)


if __name__ == "__main__":
    main()
