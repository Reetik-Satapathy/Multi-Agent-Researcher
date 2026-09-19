import { Search } from 'lucide-react';

interface SearchSuggestionProps {
  label: string;
  onSelect: (label: string) => void;
}

export function SearchSuggestion({ label, onSelect }: SearchSuggestionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(label)}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#D9D7D0] bg-white px-3 py-1.5 text-[12px] text-[#171717] transition-all duration-200 hover:border-[#1D4ED8]/40 hover:bg-[#DBEAFE]/50 hover:text-[#172554]"
    >
      <Search className="h-3 w-3 text-[#1D4ED8]" />
      <span>{label}</span>
    </button>
  );
}
