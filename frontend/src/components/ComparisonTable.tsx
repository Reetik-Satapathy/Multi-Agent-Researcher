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

  // Helper to check if row values differ across papers
  const isRowDifferent = (values: Record<string, string>) => {
    const valList = Object.values(values);
    if (valList.length <= 1) return false;
    return valList.some((v) => v !== valList[0]);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2 text-xs text-[#6B6B67]">
          <Sparkles className="w-3.5 h-3.5 text-[#1D4ED8]" />
          <span>Comparing {papers.length} selected publications</span>
        </div>

        <button
          onClick={() => setHighlightDifferences(!highlightDifferences)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
            highlightDifferences 
              ? 'bg-[#DBEAFE] text-[#1D4ED8] border-[#1D4ED8]/40 shadow-glow-purple'
              : 'bg-black/5 text-[#6B6B67] border-[#D9D7D0]'
          }`}
        >
          {highlightDifferences ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>Highlight Differences</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="glass-panel rounded-2xl overflow-x-auto border border-[#D9D7D0] shadow-card">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[#D9D7D0] bg-[#F5F3EE]">
              <th className="p-4 text-xs font-mono uppercase text-[#6B6B67] w-48 shrink-0">
                Evaluation Metric
              </th>
              {papers.map((paper, idx) => (
                <th key={paper.id} className="p-4 text-sm font-bold text-[#171717] min-w-[220px]">
                  <div className="flex flex-col">
                    <span className="text-xs text-[#1D4ED8] font-mono mb-1">Paper {String.fromCharCode(65 + idx)}</span>
                    <span className="line-clamp-2 leading-tight">{paper.title}</span>
                    <span className="text-[11px] font-normal text-[#6B6B67] mt-1">{paper.authors[0]} et al. ({paper.year})</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D7D0] text-xs text-[#171717]">
            {metrics.map((row, idx) => {
              const differs = isRowDifferent(row.values);
              const isHighlighted = highlightDifferences && differs;

              return (
                <tr 
                  key={idx} 
                  className={`transition-colors hover:bg-black/5 ${
                    isHighlighted ? 'bg-[#1D4ED8]/10' : ''
                  }`}
                >
                  <td className="p-4 font-semibold text-[#6B6B67] bg-[#ECEAE4] font-mono flex items-center justify-between">
                    <span>{row.metric}</span>
                    {isHighlighted && (
                      <span className="w-2 h-2 rounded-full bg-[#1D4ED8] shadow-glow-purple" title="Variance detected" />
                    )}
                  </td>
                  {papers.map((paper) => (
                    <td key={paper.id} className="p-4 leading-relaxed align-top">
                      {row.values[paper.id] || 'N/A'}
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
