"""LLM configuration for OpenRouter."""

import os

from crewai import LLM

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
DEFAULT_MODEL = "openrouter/openai/gpt-4o-mini"


def get_llm() -> LLM:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError(
            "OPENROUTER_API_KEY is not set. Add it to your .env file."
        )

    model = os.getenv("OPENROUTER_MODEL", DEFAULT_MODEL)
    return LLM(
        model=model,
        base_url=OPENROUTER_BASE_URL,
        api_key=api_key,
    )
