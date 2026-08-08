"""CrewAI orchestrator for the AI Knowledge Discovery Platform."""

from pathlib import Path

from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task

from knowledge_discovery.tools.analysis_tools import NoveltyAnalysisTool
from knowledge_discovery.tools.search_tools import PaperSearchTool
from knowledge_discovery.utils.llm import get_llm

CONFIG_DIR = Path(__file__).parent / "config"

import yaml

# Load YAML configurations at module import so crew and agents receive dict configs
with open(CONFIG_DIR / "agents.yaml", "r", encoding="utf-8") as f:
    AGENTS_CONFIG = yaml.safe_load(f)

with open(CONFIG_DIR / "tasks.yaml", "r", encoding="utf-8") as f:
    TASKS_CONFIG = yaml.safe_load(f)


@CrewBase
class KnowledgeDiscoveryCrew:
    """Multi-agent crew for automated research discovery and reporting."""

    # Provide parsed YAML mappings (not raw file paths) to agents/tasks
    agents_config = AGENTS_CONFIG
    tasks_config = TASKS_CONFIG

    @agent
    def paper_search_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["paper_search_agent"],
            tools=[PaperSearchTool()],
            llm=get_llm(),
            verbose=True,
        )

    @agent
    def research_analysis_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["research_analysis_agent"],
            tools=[NoveltyAnalysisTool()],
            llm=get_llm(),
            verbose=True,
        )

    @agent
    def report_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["report_agent"],
            llm=get_llm(),
            verbose=True,
        )

    @task
    def paper_search_task(self) -> Task:
        return Task(config=self.tasks_config["paper_search_task"])

    @task
    def research_analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config["research_analysis_task"],
            context=[self.paper_search_task()],
        )

    @task
    def report_generation_task(self) -> Task:
        return Task(
            config=self.tasks_config["report_generation_task"],
            context=[
                self.paper_search_task(),
                self.research_analysis_task(),
            ],
            output_file="output/research_report.md",
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )
