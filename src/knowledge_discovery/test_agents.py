import sys
import json
import traceback

SRC = 'C:/Agentic AI/agents/Multi-Agent-Researcher/src'
if SRC not in sys.path:
    sys.path.insert(0, SRC)

from knowledge_discovery.tools.search_tools import PaperSearchTool
from knowledge_discovery.tools.analysis_tools import NoveltyAnalysisTool
from knowledge_discovery.utils.llm import get_llm

QUERY = 'deep learning using python'

def run_paper_search():
    try:
        tool = PaperSearchTool()
        print('\n=== Running PaperSearchTool ===')
        out = tool._run(QUERY, limit=8)
        data = json.loads(out)
        print('Query:', data.get('query'))
        print('Total papers count (deduped):', data.get('count'))
        papers = data.get('papers', [])
        print('Top papers:')
        for i, p in enumerate(papers[:5], 1):
            print(f"  {i}. {p.get('title')} ({p.get('source')}) {p.get('year')} — {p.get('url')}")
        if 'warnings' in data:
            print('\nWarnings from sources:')
            for w in data['warnings']:
                print(' -', w)
        return out
    except Exception as e:
        print('Paper search failed:', e)
        traceback.print_exc()
        return None


def run_analysis(papers_json):
    try:
        tool = NoveltyAnalysisTool()
        print('\n=== Running NoveltyAnalysisTool ===')
        out = tool._run(QUERY, papers_json)
        parsed = json.loads(out)
        print('Novelty score:', parsed.get('novelty_score'))
        print('Similar papers (top):')
        for s in parsed.get('similar_papers', [])[:5]:
            print(' -', s)
        print('Research gaps:')
        for g in parsed.get('research_gaps', []):
            print(' -', g)
        return out
    except Exception as e:
        print('Analysis failed:', e)
        traceback.print_exc()
        return None


def check_llm_interface():
    try:
        print('\n=== Inspecting LLM interface ===')
        llm = get_llm()
        print('LLM object type:', type(llm))
        # Print some callable methods
        methods = [m for m in dir(llm) if not m.startswith('_')]
        print('LLM public members (sample):', methods[:40])
        # Try a lightweight LLM call if `llm` exposes a .generate or .chat method
        if hasattr(llm, 'chat'):
            print('\nCalling llm.chat with short prompt (sanity check)')
            res = llm.chat('Write a one-sentence summary of "deep learning using python".')
            print('LLM chat result:', res)
        elif hasattr(llm, 'generate'):
            print('\nCalling llm.generate with short prompt (sanity check)')
            res = llm.generate('Write a one-sentence summary of "deep learning using python".')
            print('LLM generate result:', res)
        else:
            print('\nLLM object has no chat/generate method; skipping live prompt.')
    except Exception as e:
        print('LLM check failed:', e)
        traceback.print_exc()


if __name__ == '__main__':
    pj = run_paper_search()
    if pj:
        run_analysis(pj)
    check_llm_interface()
