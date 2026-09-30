import type { ReportSection } from '../types/research';

const REQUIRED_REPORT_SECTIONS = [
  '1. Executive Summary',
  '2. Scope and Search Method',
  '3. Research Landscape',
  '4. Related Papers',
  '5. Comparative Analysis',
  '6. Research Analysis and Novelty',
  '7. Research Gaps and Limitations',
  '8. Future Research Opportunities',
  '9. Practical Takeaways',
  '10. References',
];

export function parseReportMarkdown(markdown: string): ReportSection[] {
  const normalized = markdown.replace(/\r\n?/g, '\n');
  const headingPattern = /^##[ \t]+(.+?)[ \t]*#*[ \t]*$/gm;
  const headings = [...normalized.matchAll(headingPattern)];
  const parsed = headings.map((heading, index) => {
    const start = (heading.index ?? 0) + heading[0].length;
    const end = headings[index + 1]?.index ?? normalized.length;
    return {
      title: heading[1].trim(),
      content: normalized.slice(start, end).trim(),
    };
  });

  if (parsed.length === 0) {
    const withoutTitle = normalized.replace(/^#\s+.+\n+/, '').trim();
    return [{
      id: 'section-1',
      title: 'Research Report',
      content: withoutTitle || 'The report did not contain any readable content.',
    }];
  }

  return REQUIRED_REPORT_SECTIONS.map((requiredTitle, index) => {
    const section = parsed.find((item) =>
      item.title.toLocaleLowerCase().startsWith(requiredTitle.toLocaleLowerCase()),
    );
    return {
      id: `section-${index + 1}`,
      title: requiredTitle,
      content: section?.content || 'The generated report did not provide content for this section.',
    };
  });
}
