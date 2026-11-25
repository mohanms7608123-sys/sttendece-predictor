import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "large" | "footer";
  showText?: boolean;
}

export function Logo({ className, variant = "default", showText = true }: LogoProps) {
  const iconSize = variant === "large" ? "h-12 w-12 text-2xl" : "h-11 w-11 text-xl";
  const textSize = variant === "large" ? "text-2xl" : "text-[22px]";
  const gap = "gap-3";

  return (
    <div className={cn("flex items-center font-display select-none h-11", gap, className)}>
      {/* Icon: CB inside Deep Emerald Green rounded square with subtle Champagne Gold ring */}
      <div
        className={cn(
          "flex items-center justify-center bg-[#064E3B] text-white font-extrabold rounded-2xl shadow-md border border-[#D4AF37]/30 relative overflow-hidden shrink-0 transition-transform duration-300 hover:scale-105",
          iconSize
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
        <span className="relative z-10 tracking-tight font-black flex items-center justify-center">
          <span>C</span>
          <span className="text-[#10B981]">B</span>
        </span>
        <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
      </div>

      {/* Wordmark: CampusBite text */}
      {showText && (
        <div className={cn("font-bold tracking-tight flex items-baseline leading-none whitespace-nowrap text-foreground", textSize)}>
          <span className="font-extrabold">Campus</span>
          <span className="text-[#10B981] font-black">Bite</span>
          <span className="text-[#D4AF37] text-xs ml-0.5 font-bold">.</span>
        </div>
      )}
    </div>
  );
}
