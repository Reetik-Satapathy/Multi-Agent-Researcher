"""Preflight checks for the Knowledge Discovery Platform.

Run this script before attempting to run the full system. It checks for required
environment variables and required Python packages and prints actionable hints.

Not executed automatically by the application — run manually:

    python -m knowledge_discovery.preflight
"""

import importlib
import os
import sys
from dotenv import load_dotenv

# Load .env if present so checks reflect local environment file
load_dotenv()

REQUIRED_ENVS = ["OPENROUTER_API_KEY"]
REQUIRED_PACKAGES = [
    ("yaml", "PyYAML"),
    ("crewai", "crewai"),
    ("requests", "requests"),
    ("pydantic", "pydantic"),
    ("dotenv", "python-dotenv"),
]


def check_envs() -> bool:
    ok = True
    print("Checking required environment variables:")
    for name in REQUIRED_ENVS:
        val = os.getenv(name)
        if not val:
            print(f"  MISSING: {name} — set this in your .env or environment")
            ok = False
        else:
            print(f"  OK: {name} set")
    return ok


def check_packages() -> bool:
    ok = True
    print("\nChecking required Python packages:")
    for module_name, pkg_name in REQUIRED_PACKAGES:
        try:
            importlib.import_module(module_name)
            print(f"  OK: {pkg_name} (module {module_name}) is importable")
        except Exception:
            print(f"  MISSING: {pkg_name} — install with: pip install {pkg_name}")
            ok = False
    return ok


def main() -> int:
    env_ok = check_envs()
    pkgs_ok = check_packages()

    if env_ok and pkgs_ok:
        print("\nPreflight checks passed. You should be ready to run the platform.")
        return 0

    print("\nPreflight checks failed. Resolve the missing items above and retry.")
    return 2


if __name__ == "__main__":
    sys.exit(main())
