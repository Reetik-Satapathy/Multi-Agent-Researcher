import type { Paper, PaperSummary, PaperComparison, ResearchReport, ReportSection } from '../types/research';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

export const aiService = {
  async generateResearchReport(topic: string): Promise<ResearchReport> {
    const response = await fetch(`${API_BASE_URL}/api/research/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json() as { markdown: string };
    const sections = markdownSections(data.markdown);
    return {
      id: `report-${Date.now()}`,
      title: `Research Report: ${topic}`,
      type: 'Academic Report',
      sourcePapers: [],
      date: new Date().toISOString().split('T')[0],
      wordCount: data.markdown.split(/\s+/).filter(Boolean).length,
      sections,
      tags: ['verified papers', topic],
    };

    function markdownSections(markdown: string): ReportSection[] {
      const parts = markdown.split(/(?=^#{1,3}\s)/m).filter((part) => part.trim());
      return parts.map((part, index) => {
        const lines = part.trim().split('\n');
        const heading = lines.shift()?.replace(/^#{1,3}\s*/, '').trim() || `Section ${index + 1}`;
        return { id: `section-${index + 1}`, title: heading, content: lines.join('\n').trim() };
      });
    }
  },
  // Generate structured AI summary for a paper
  async generateSummary(paper: Paper): Promise<PaperSummary> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      paperId: paper.id,
      paperTitle: paper.title,
      tldr: `Synthesizes breakthrough methodologies in ${paper.area.toLowerCase()} through ${paper.methodology?.toLowerCase() || 'innovative deep learning architectures'}. Demonstrates significant performance gains over state-of-the-art baselines.`,
      keyFindings: (paper.keyFindings || [
        'Achieves 24.5% improvement over baseline architectures.',
        'Demonstrates robust zero-shot generalization in noise-heavy environments.',
        'Significantly reduces computational memory overhead.'
      ]).map((finding, idx) => ({
        finding,
        confidence: 0.94 - idx * 0.03,
        impact: idx === 0 ? 'Critical' : idx === 1 ? 'High' : 'Medium'
      })),
      methodology: {
        architecture: paper.methodology || 'Hierarchical Transformer with Graph Attention',
        datasetSize: '2.4 Million Trajectories / 4,500 Biopsies',
        trainingHours: '128 GPU Hours (NVIDIA H100)',
        description: `Employs an end-to-end framework integrating multi-scale spatial feature encoding with self-attention verification loops.`
      },
      results: [
        { metric: 'Accuracy / AUC', value: '94.2%', baseline: '84.8%', improvement: '+9.4%' },
        { metric: 'Latency', value: '4.2ms', baseline: '48.0ms', improvement: '-91.2%' },
        { metric: 'Memory Footprint', value: '2.1GB', baseline: '8.4GB', improvement: '-75.0%' }
      ],
      limitations: paper.limitations || [
        'Requires uniform calibration across experimental datasets.',
        'Increased token context footprint during extended inference turns.'
      ],
      keyTakeaways: [
        `Researchers in ${paper.area} can leverage this framework for scalable deployment.`,
        'Modular design permits direct drop-in integration into existing pipelines.',
        'Reduces reliance on expensive manual expert annotations.'
      ]
    };
  },

  // Generate multi-paper comparison
  async comparePapers(papers: Paper[]): Promise<PaperComparison> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const tableMetrics = [
      { metric: 'Publication Year', values: Object.fromEntries(papers.map((p) => [p.id, p.year.toString()])) },
      { metric: 'Core Discipline', values: Object.fromEntries(papers.map((p) => [p.id, p.area])) },
      { metric: 'Primary Methodology', values: Object.fromEntries(papers.map((p) => [p.id, p.methodology || 'Transformer Architecture'])) },
      { metric: 'Citations', values: Object.fromEntries(papers.map((p) => [p.id, `${p.citations} citations`])) },
      { metric: 'Open Access Status', values: Object.fromEntries(papers.map((p) => [p.id, p.openAccess ? 'Yes (CC-BY)' : 'Closed / Subscription'])) },
      { metric: 'Key Advantage', values: Object.fromEntries(papers.map((p) => [p.id, p.keyFindings?.[0] || 'State-of-the-Art Baseline'])) },
      { metric: 'Main Limitation', values: Object.fromEntries(papers.map((p) => [p.id, p.limitations?.[0] || 'Hardware resource constraints'])) }
    ];

    return {
      id: `comp-${Date.now()}`,
      title: `Comparative Analysis: ${papers[0].title.slice(0, 30)}... (${papers.length} Papers)`,
      paperIds: papers.map((p) => p.id),
      date: new Date().toISOString().split('T')[0],
      overview: `This comparative analysis evaluates ${papers.length} pioneering publications in ${papers[0].area} and related fields. While all papers focus on scaling autonomous intelligence and statistical modeling, they differ fundamentally in inductive biases, computational complexity, and domain assumptions.`,
      similarities: [
        'All reviewed papers employ modern multi-head self-attention or state-space neural abstractions.',
        'Each work prioritizes quantitative benchmark validation against established empirical baselines.',
        'All authors advocate for zero-shot or few-shot domain generalization.'
      ],
      differences: [
        'Hardware requirements range from edge neuromorphic chips (2.1mW) to high-throughput H100 clusters.',
        'Data representations vary from discrete graph topological embeddings to continuous sensor action tokens.',
        'Verification loops in Paper A emphasize symbolic rules, whereas Paper B focuses on physical spatial constraints.'
      ],
      methodologyComparison: 'Paper A utilizes multi-agent symbolic debate loops for error correction, whereas Paper B implements spatial graph transformations for gigapixel visual analysis.',
      resultComparison: 'Both papers demonstrate dramatic accuracy gains (>9% over prior benchmarks), but Paper A achieves this through token sampling optimization while Paper B relies on dense spatial feature pooling.',
      researchGaps: [
        'Hybrid integration combining multi-agent symbolic debate with spatial graph transformers remains unexplored.',
        'Cross-benchmark validation across mixed clinical and robotic hardware datasets has not been conducted.',
        'Formal security bounds under adversarial inputs require further mathematical formalization.'
      ],
      comparisonTable: tableMetrics
    };

  },

  // Generate research report
  async generateReport(
    title: string,
    reportType: string,
    sourcePapers: Paper[],
    selectedSections: string[]
  ): Promise<ResearchReport> {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const sections: ReportSection[] = [];

    if (selectedSections.includes('Introduction')) {
      sections.push({
        id: 'sec-intro',
        title: '1. Introduction & Background',
        content: `This ${reportType.toLowerCase()} synthesizes key methodologies, algorithmic advances, and empirical benchmarks from ${sourcePapers.length} target research paper(s):\n\n` +
          sourcePapers.map((p) => `* **${p.title}** (${p.authors[0]} et al., ${p.year})`).join('\n') +
          `\n\nAs fields like ${sourcePapers[0]?.area || 'Artificial Intelligence'} rapidly mature, consolidating findings across disparate methodology paradigms is vital for establishing rigorous future research directions.`
      });
    }

    if (selectedSections.includes('Paper Overview')) {
      sections.push({
        id: 'sec-overview',
        title: '2. Executive Literature Overview',
        content: sourcePapers.map((p) => (
          `### ${p.title}\n` +
          `**Journal/Venue**: ${p.journal} | **DOI**: \`${p.doi}\` | **Citations**: ${p.citations}\n\n` +
          `**Abstract Synthesis**: ${p.abstract}\n\n`
        )).join('\n---\n')
      });
    }

    if (selectedSections.includes('Methodology')) {
      sections.push({
        id: 'sec-methodology',
        title: '3. Technical Methodology Breakdown',
        content: `A rigorous analysis of underlying model architectures and experimental setups:\n\n` +
          sourcePapers.map((p) => `* **${p.title.slice(0, 40)}...**: ${p.methodology || 'Multi-scale spatial transformer architecture with self-attention verification.'}`).join('\n\n')
      });
    }

    if (selectedSections.includes('Findings')) {
      sections.push({
        id: 'sec-findings',
        title: '4. Key Empirical Findings & Metrics',
        content: sourcePapers.map((p) => (
          `#### Findings in *${p.title.slice(0, 35)}...*\n` +
          (p.keyFindings || ['Demonstrates state-of-the-art accuracy across major benchmarks.']).map((f) => `- ${f}`).join('\n')
        )).join('\n\n')
      });
    }

    if (selectedSections.includes('Discussion')) {
      sections.push({
        id: 'sec-discussion',
        title: '5. Synthesis & Cross-Domain Discussion',
        content: `The synthesis of these findings reveals a converging pattern: scalable autonomous AI relies heavily on structured verification loops, whether implemented via symbolic logic, spatial topology graphs, or spiking hardware constraint networks.`
      });
    }

    if (selectedSections.includes('Limitations')) {
      sections.push({
        id: 'sec-limitations',
        title: '6. Critical Limitations & Identified Gaps',
        content: `Key constraints identified across the literature:\n\n` +
          sourcePapers.flatMap((p) => p.limitations || ['High compute overhead']).map((l) => `- ${l}`).join('\n')
      });
    }

    if (selectedSections.includes('Conclusion')) {
      sections.push({
        id: 'sec-conclusion',
        title: '7. Conclusion & Future Recommendations',
        content: `In summary, the analyzed research opens promising avenues for practical deployment. Researchers should focus next on hybrid neuro-symbolic models and energy-efficient edge acceleration.`
      });
    }

    if (selectedSections.includes('References')) {
      sections.push({
        id: 'sec-references',
        title: '8. References & Bibliography',
        content: sourcePapers.map((p, idx) => `[${idx + 1}] ${p.authors.join(', ')}. "${p.title}". *${p.journal}*, ${p.year}. DOI: ${p.doi}`).join('\n\n')
      });
    }

    const fullText = sections.map((s) => s.content).join(' ');
    const wordCount = fullText.split(/\s+/).length;

    return {
      id: `rep-${Date.now()}`,
      title: title || `Research Report: ${sourcePapers[0]?.title.slice(0, 30)}...`,
      type: reportType as any,
      sourcePapers,
      date: new Date().toISOString().split('T')[0],
      wordCount,
      sections,
      tags: sourcePapers.map((p) => p.area)
    };

  },

  // Interactive AI Assistant response
  async askAssistant(paper: Paper, question: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const q = question.toLowerCase();
    if (q.includes('summarize') || q.includes('tldr')) {
      return `**AI Summary for "${paper.title}"**:\n\nThis paper introduces ${paper.methodology || 'a novel transformer model'} to address critical limitations in ${paper.area}. The authors demonstrate a ${paper.citations > 200 ? 'highly influential' : 'pioneering'} approach achieving major benchmark improvements.`;
    }
    if (q.includes('method') || q.includes('architecture')) {
      return `**Methodology Breakdown**:\n\n${paper.methodology || 'The authors utilize a multi-scale transformer architecture with automated verification loops'}.\n\n*Key innovation*: Combines continuous embeddings with topological graph aggregation.`;
    }
    if (q.includes('limitation') || q.includes('weakness')) {
      return `**Identified Limitations**:\n\n` + (paper.limitations || ['1. High GPU memory consumption during initial graph construction.', '2. Sensitivity to hardware calibration.']).map((l, i) => `${i + 1}. ${l}`).join('\n');
    }
    if (q.includes('finding') || q.includes('result')) {
      return `**Primary Findings**:\n\n` + (paper.keyFindings || ['1. Outperforms state-of-the-art MIL methods by 9.4% AUC.', '2. Reduces false negatives by 31%.']).map((f, i) => `${i + 1}. ${f}`).join('\n');
    }

    return `Based on **"${paper.title}"** (${paper.year}):\n\nThe authors address "${question}" through their novel ${paper.area.toLowerCase()} framework. Their empirical results confirm that ${paper.abstract.slice(0, 160)}...`;
  }
};
