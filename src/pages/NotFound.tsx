import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/common/Logo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-6">
        <Logo variant="large" />
      </div>
      <div className="h-20 w-20 rounded-3xl bg-[#D1FAE5] dark:bg-emerald-950/60 flex items-center justify-center mb-6 text-[#064E3B] dark:text-emerald-300 shadow-sm border border-[#10B981]/20">
        <UtensilsCrossed className="h-10 w-10" />
      </div>
      <h1 className="mb-2 text-4xl sm:text-5xl font-display font-black text-foreground">
        404
      </h1>
      <p className="mb-2 text-xl font-bold font-display text-foreground">
        Dish or Page Not Found
      </p>
      <p className="mb-8 max-w-sm text-sm text-muted-foreground leading-relaxed">
        The table or menu item you're looking for doesn't exist or was moved to another counter.
      </p>
      <Link to="/">
        <Button className="h-12 px-7 rounded-2xl bg-[#064E3B] hover:bg-[#054030] text-white font-bold text-xs shadow-md border border-[#D4AF37]/30">
          <ArrowLeft className="h-4 w-4 mr-2 text-[#10B981]" />
          Return to Main Cafeteria
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;
