import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface CategoryCarouselProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function CategoryCarousel({ categories, selectedCategory, onSelectCategory }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-4 mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3 w-3 text-[#D4AF37]" />
          <span>Curated Categories</span>
        </div>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-xs font-bold text-[#10B981] hover:underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-2 pt-1"
      >
        {/* 'All' Option */}
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 shrink-0 shadow-sm border",
            selectedCategory === null
              ? "bg-[#064E3B] text-white border-[#D4AF37]/40 shadow-[0_4px_12px_rgba(6,78,59,0.25)] scale-[1.02]"
              : "bg-card border-border/80 text-foreground hover:bg-[#D1FAE5]/40 hover:border-[#10B981]/30"
          )}
        >
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span>All Items</span>
        </button>

        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 shrink-0 shadow-sm border",
                isSelected
                  ? "bg-[#064E3B] text-white border-[#D4AF37]/40 shadow-[0_4px_12px_rgba(6,78,59,0.25)] scale-[1.02]"
                  : "bg-card border-border/80 text-foreground hover:bg-[#D1FAE5]/40 hover:border-[#10B981]/30"
              )}
            >
              <span className={cn(
                "w-2 h-2 rounded-full",
                isSelected ? "bg-[#D4AF37]" : "bg-[#10B981]"
              )} />
              <span>{category}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
