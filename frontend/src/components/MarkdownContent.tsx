import type { ReactNode } from 'react';

function inlineMarkdown(text: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;
  const nodes: ReactNode[] = [];
  let previous = 0;

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > previous) nodes.push(text.slice(previous, index));
    const token = match[0];
    const key = `inline-${index}`;
    if (token.startsWith('**') || token.startsWith('__')) {
      nodes.push(<strong key={key} className="font-semibold text-[#F5F7F3]">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*') || token.startsWith('_')) {
      nodes.push(<em key={key} className="italic text-[#F5F7F3]">{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`')) {
      nodes.push(<code key={key} className="rounded bg-[#16231D] px-1.5 py-0.5 font-mono text-[11px] text-[#6F9B83] border border-white/[0.06]">{token.slice(1, -1)}</code>);
    } else {
      const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
      if (link) {
        nodes.push(<a key={key} href={link[2]} target="_blank" rel="noreferrer" className="text-[#6F9B83] underline hover:text-[#F5F7F3]">{link[1]}</a>);
      } else {
        nodes.push(token);
      }
    }
    previous = index + token.length;
  }
  if (previous < text.length) nodes.push(text.slice(previous));
  return nodes;
}

function isTableDivider(line: string): boolean {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
}

function tableCells(line: string): string[] {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
}

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  const lines = content.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    if (/^#{1,6}\s/.test(line)) {
      const level = Math.min(line.match(/^#+/)?.[0].length || 3, 4);
      const title = line.replace(/^#{1,6}\s+/, '');
      const Heading = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4';
      blocks.push(<Heading key={`heading-${index}`} className="mb-2 mt-4 font-bold text-[#F5F7F3]">{inlineMarkdown(title)}</Heading>);
      index += 1;
      continue;
    }

    if (line.startsWith('|') && lines[index + 1] && isTableDivider(lines[index + 1])) {
      const headers = tableCells(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      blocks.push(
        <div key={`table-${index}`} className="my-4 overflow-x-auto rounded-lg border border-white/[0.08]">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#0C100E] border-b border-white/[0.08]">
                {headers.map((cell, cellIndex) => (
                  <th key={cellIndex} className="p-2.5 font-semibold text-[#6F9B83]">{inlineMarkdown(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-[#141B17]">
                  {headers.map((_, cellIndex) => (
                    <td key={cellIndex} className="p-2.5 align-top text-[#F5F7F3]">{inlineMarkdown(row[cellIndex] || '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (/^[-*+]\s/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*+]\s/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*+]\s+/, ''));
        index += 1;
      }
      blocks.push(
        <ul key={`list-${index}`} className="my-2.5 list-disc space-y-1 pl-5 text-[#F5F7F3]">
          {items.map((item, itemIndex) => <li key={itemIndex}>{inlineMarkdown(item)}</li>)}
        </ul>
      );
      continue;
    }

    if (/^\d+[.)]\s/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+[.)]\s/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+[.)]\s+/, ''));
        index += 1;
      }
      blocks.push(
        <ol key={`ordered-${index}`} className="my-2.5 list-decimal space-y-1 pl-5 text-[#F5F7F3]">
          {items.map((item, itemIndex) => <li key={itemIndex}>{inlineMarkdown(item)}</li>)}
        </ol>
      );
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^#{1,6}\s|^[-*+]\s|^\d+[.)]\s|\|/.test(lines[index].trim())) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p key={`paragraph-${index}`} className="my-2.5 leading-relaxed text-[#F5F7F3]">{inlineMarkdown(paragraph.join(' '))}</p>);
  }

  return <div className={`text-xs sm:text-sm text-[#F5F7F3] ${className}`}>{blocks}</div>;
}
