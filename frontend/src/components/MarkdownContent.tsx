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
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*') || token.startsWith('_')) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`')) {
      nodes.push(<code key={key} className="rounded bg-black/5 px-1 py-0.5">{token.slice(1, -1)}</code>);
    } else {
      const link = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
      if (link) {
        nodes.push(<a key={key} href={link[2]} target="_blank" rel="noreferrer" className="text-[#1D4ED8] underline">{link[1]}</a>);
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

export function MarkdownContent({ content }: { content: string }) {
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
      blocks.push(<Heading key={`heading-${index}`} className="mb-2 mt-5 font-bold">{inlineMarkdown(title)}</Heading>);
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
        <div key={`table-${index}`} className="my-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead><tr>{headers.map((cell, cellIndex) => <th key={cellIndex} className="border border-[#D9D7D0] bg-[#F5F3EE] p-2">{inlineMarkdown(cell)}</th>)}</tr></thead>
            <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{headers.map((_, cellIndex) => <td key={cellIndex} className="border border-[#D9D7D0] p-2 align-top">{inlineMarkdown(row[cellIndex] || '')}</td>)}</tr>)}</tbody>
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
      blocks.push(<ul key={`list-${index}`} className="my-3 list-disc space-y-1 pl-6">{items.map((item, itemIndex) => <li key={itemIndex}>{inlineMarkdown(item)}</li>)}</ul>);
      continue;
    }

    if (/^\d+[.)]\s/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+[.)]\s/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+[.)]\s+/, ''));
        index += 1;
      }
      blocks.push(<ol key={`ordered-${index}`} className="my-3 list-decimal space-y-1 pl-6">{items.map((item, itemIndex) => <li key={itemIndex}>{inlineMarkdown(item)}</li>)}</ol>);
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !/^#{1,6}\s|^[-*+]\s|^\d+[.)]\s|\|/.test(lines[index].trim())) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p key={`paragraph-${index}`} className="my-3 leading-7">{inlineMarkdown(paragraph.join(' '))}</p>);
  }

  return <div className="text-sm text-[#171717]">{blocks}</div>;
}
