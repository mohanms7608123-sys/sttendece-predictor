import { ListFilter, ChevronDown, Sparkles } from 'lucide-react';

export function FilterBar() {
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto hide-scrollbar px-4 py-2 sticky top-[72px] z-10 bg-background/95 backdrop-blur-md pb-3">
      {/* Main Filter Button */}
      <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#064E3B] text-white shrink-0 shadow-sm border border-[#D4AF37]/30">
        <ListFilter className="h-3.5 w-3.5 text-[#10B981]" />
        <span>Filters</span>
        <span className="bg-[#D4AF37] text-[#1F2937] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center -mr-1">
          1
        </span>
      </button>

      {/* Quick Filters */}
      <button className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-card border border-border/80 text-foreground hover:bg-[#D1FAE5]/40 hover:border-[#10B981]/30 shrink-0 shadow-xs transition-colors">
        <span>Under ₹150</span>
      </button>

      <button className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-card border border-border/80 text-foreground hover:bg-[#D1FAE5]/40 shrink-0 shadow-xs transition-colors">
        <span>Pickup Window</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#064E3B] border border-[#10B981]/40 shrink-0 shadow-xs">
        <Sparkles className="h-3 w-3 text-[#D4AF37]" />
        <span>Student Specials</span>
      </button>

      <button className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-card border border-border/80 text-foreground hover:bg-[#D1FAE5]/40 shrink-0 shadow-xs transition-colors">
        <span>Pure Veg 🌱</span>
      </button>
    </div>
  );
}
