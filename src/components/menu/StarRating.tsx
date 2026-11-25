import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  onRate?: (rating: number) => void;
  size?: "xs" | "sm" | "md" | "lg";
  showValue?: boolean;
  totalRatings?: number;
  readonly?: boolean;
}

export function StarRating({
  rating,
  maxRating = 5,
  onRate,
  size = "md",
  showValue = false,
  totalRatings,
  readonly = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    xs: "h-2.5 w-2.5",
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const displayRating = hoverRating || rating;

  const handleClick = (index: number) => {
    if (readonly || !onRate) return;
    
    // If clicking on the same rating, remove it
    if (index === rating) {
      onRate(0);
    } else {
      onRate(index);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div 
        className="flex items-center gap-0.5"
        onMouseLeave={() => !readonly && setHoverRating(0)}
      >
        {Array.from({ length: maxRating }, (_, i) => {
          const starIndex = i + 1;
          const isFilled = starIndex <= displayRating;
          const isHalfFilled = !isFilled && starIndex - 0.5 <= displayRating;

          return (
            <button
              key={i}
              type="button"
              disabled={readonly}
              className={cn(
                "transition-colors focus:outline-none",
                !readonly && "cursor-pointer hover:scale-110",
                readonly && "cursor-default"
              )}
              onClick={() => handleClick(starIndex)}
              onMouseEnter={() => !readonly && setHoverRating(starIndex)}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors",
                  isFilled
                    ? "fill-[#D4AF37] text-[#D4AF37]"
                    : isHalfFilled
                    ? "fill-[#D4AF37]/50 text-[#D4AF37]"
                    : "fill-transparent text-muted-foreground/30"
                )}
              />
            </button>
          );
        })}
      </div>
      
      {showValue && rating > 0 && (
        <span className="text-xs text-muted-foreground ml-1">
          {rating.toFixed(1)}
          {totalRatings !== undefined && ` (${totalRatings})`}
        </span>
      )}
    </div>
  );
}