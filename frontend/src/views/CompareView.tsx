import { PdfComparisonPanel } from '../components/PdfComparisonPanel';

export function CompareView() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Compare Research Papers</h2>
        <p className="mt-1 text-xs text-[#6B6B67]">
          Upload two research papers to compare their methods, findings, limitations, and research gaps.
        </p>
      </div>
      <PdfComparisonPanel />
    </div>
  );
}
