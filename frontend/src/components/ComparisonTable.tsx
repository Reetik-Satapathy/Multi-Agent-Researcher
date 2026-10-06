import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import type { Paper } from '../types/research';

interface ComparisonTableProps {
  papers: Paper[];
  metrics: Array<{
    metric: string;
    values: Record<string, string>;
  }>;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ papers, metrics }) => {
  const [highlightDifferences, setHighlightDifferences] = useState(true);

  const isRowDifferent = (values: Record<string, string>) => {
    const valList = Object.values(values);
    if (valList.length <= 1) return false;
    return valList.some((v) => v !== valList[0]);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs text-[#A5ADA7]">
          <Sparkles className="h-3.5 w-3.5 text-[#6F9B83]" />
          <span>Comparing {papers.length} selected publications</span>
        </div>

        <button
          type="button"
          onClick={() => setHighlightDifferences(!highlightDifferences)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
            highlightDifferences 
              ? 'border-[#6F9B83]/40 bg-[#16231D] text-[#F5F7F3]'
              : 'border-white/[0.08] bg-[#0C100E] text-[#A5ADA7] hover:border-white/[0.16]'
          }`}
        >
          {highlightDifferences ? <Eye className="h-3.5 w-3.5 text-[#6F9B83]" /> : <EyeOff className="h-3.5 w-3.5 text-[#737B76]" />}
          <span>Highlight Differences</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#101512]">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-white/[0.08] bg-[#0C100E]">
              <th className="p-4 text-xs font-mono uppercase text-[#6F9B83] w-48 shrink-0">
                Metric
              </th>
              {papers.map((paper, idx) => (
                <th key={paper.id} className="p-4 text-xs font-bold text-[#F5F7F3] min-w-[220px]">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#6F9B83] font-mono mb-1">Paper {String.fromCharCode(65 + idx)}</span>
                    <span className="line-clamp-2 leading-tight">{paper.title}</span>
                    <span className="text-[11px] font-normal text-[#A5ADA7] mt-1">{paper.authors[0]} et al. ({paper.year})</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-xs text-[#F5F7F3]">
            {metrics.map((row, idx) => {
              const differs = isRowDifferent(row.values);
              const isHighlighted = highlightDifferences && differs;

              return (
                <tr 
                  key={idx} 
                  className={`transition-colors hover:bg-[#141B17] ${
                    isHighlighted ? 'bg-[#16231D]/50' : ''
                  }`}
                >
                  <td className="p-4 font-semibold text-[#A5ADA7] bg-[#0C100E]/70 font-mono">
                    <div className="flex items-center justify-between">
                      <span>{row.metric}</span>
                      {isHighlighted && (
                        <span className="h-2 w-2 rounded-full bg-[#6F9B83]" title="Variance detected" />
                      )}
                    </div>
                  </td>
                  {papers.map((paper) => (
                    <td key={paper.id} className="p-4 leading-relaxed align-top">
                      {row.values[paper.id] || 'Not specified'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
