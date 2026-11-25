import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { MobileMenuCard } from '@/components/menu/MobileMenuCard';
import { MenuCard } from '@/components/menu/MenuCard';
import { CategoryCarousel } from '@/components/menu/CategoryCarousel';
import { StickyCartBar } from '@/components/cart/StickyCartBar';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Search, Mic, MapPin, Sparkles, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { NotificationsPopover } from '@/components/notifications/NotificationsPopover';
import { motion } from 'framer-motion';

// Basic types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

export default function Menu() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: menuItems, isLoading } = useMenuItems(true);
  const { data: settings } = useSystemSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const startListening = () => {
    const win = window as unknown as WindowWithSpeech;
    if ('webkitSpeechRecognition' in win || 'SpeechRecognition' in win) {
      const SpeechRecognition = (win.SpeechRecognition || win.webkitSpeechRecognition) as SpeechRecognitionConstructor;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        toast.info("Listening for dish name...", { duration: 2000 });
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        toast.success(`Searching for "${transcript}"`);
        setIsListening(false);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error("Microphone access denied. Please enable permissions.");
        } else if (event.error === 'no-speech') {
          toast.error("Didn't catch that. Please try again.");
        } else {
          toast.error(`Voice search error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      try {
        recognition.start();
      } catch (error) {
        setIsListening(false);
      }
    } else {
      toast.error("Voice search is not supported in this browser.");
    }
  };

  const orderingEnabled = settings?.ordering_enabled === 'true';
  const emergencyNotice = settings?.emergency_notice;

  // Get unique categories
  const categories = [...new Set(menuItems?.map(item => item.category || 'Other'))].sort();

  // Filter items by search and category
  const filteredItems = menuItems?.filter(item => {
    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory ||
      (item.category || 'Other') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (authLoading || isLoading) {
    return (
      <Layout showHeader={false} showBottomNav={true} headerTitle="Menu">
        <div className="space-y-4 pt-4 max-w-5xl mx-auto">
          <Skeleton className="h-14 w-full rounded-2xl bg-card border border-border" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3 bg-card p-4 rounded-3xl border border-border">
                <Skeleton className="h-44 w-full rounded-2xl" />
                <Skeleton className="h-5 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={false} showBottomNav={true} headerTitle="Campus Canteen">
      <div className="flex flex-col min-h-screen pb-24">

        {/* TOP MOBILE BAR (Location & Notifications) */}
        <div className="sm:hidden sticky top-0 z-40 bg-[#FFFDF5]/95 dark:bg-[#1F2937]/95 backdrop-blur-md pt-2 pb-3 border-b border-[#064E3B]/10 dark:border-white/10 shadow-sm -mx-4 px-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-[#D1FAE5] dark:bg-emerald-950/50 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-[#064E3B] dark:text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm text-[#064E3B] dark:text-emerald-300">
                  <span>Campus Main Canteen</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                </div>
                <span className="text-[11px] text-muted-foreground block">Block A • Counter Express</span>
              </div>
            </div>

            <NotificationsPopover />
          </div>

          {/* Mobile Search Input */}
          <div className="relative shadow-sm group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
              <Search className="h-4 w-4 text-[#064E3B] dark:text-emerald-400" />
              <div className="h-4 w-[1px] bg-border"></div>
            </div>

            <Input
              type="text"
              placeholder={isListening ? "Listening..." : "Search delicacies (e.g. Biryani, Dosa)..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-12 pr-12 h-11 rounded-2xl bg-card border border-border/80 text-foreground placeholder:text-muted-foreground text-sm font-medium shadow-sm focus-visible:ring-2 focus-visible:ring-[#10B981]",
                isListening && "ring-2 ring-[#10B981] animate-pulse placeholder:text-[#10B981]"
              )}
            />

            <button
              onClick={startListening}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2 active:scale-90 transition-transform"
              aria-label="Voice search"
            >
              <div className="h-4 w-[1px] bg-border mr-1"></div>
              <Mic className={cn("h-4 w-4 text-[#064E3B] dark:text-emerald-400", isListening && "fill-red-500 text-red-500 animate-bounce")} />
            </button>
          </div>
        </div>

        {/* DESKTOP HERO & SEARCH SECTION */}
        <div className="hidden sm:block pt-2 pb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D1FAE5] text-[#064E3B] dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold mb-2">
                <Sparkles className="h-3 w-3 text-[#D4AF37]" />
                <span>CAMPUS DINING CONSOLE</span>
              </div>
              <h1 className="text-3xl font-display font-extrabold text-[#1F2937] dark:text-white">
                Today's Fresh Canteen Menu
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Select your favorite dishes, schedule your pickup window, and receive a digital collection token.
              </p>
            </div>

            {/* Desktop Search Bar */}
            <div className="w-full md:w-96 relative shadow-sm">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <Search className="h-4 w-4 text-[#064E3B] dark:text-emerald-400" />
                <div className="h-4 w-[1px] bg-border"></div>
              </div>

              <Input
                type="text"
                placeholder="Search food, beverages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-10 h-12 rounded-2xl bg-card border border-border/80 text-foreground placeholder:text-muted-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-[#10B981] text-sm font-medium"
              />

              <button
                onClick={startListening}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#064E3B] dark:text-emerald-400 hover:text-[#10B981]"
                aria-label="Voice search"
              >
                <Mic className={cn("h-4 w-4", isListening && "fill-red-500 text-red-500")} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pill Carousel */}
        <CategoryCarousel
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* System & Emergency Notices */}
        <div className="space-y-3 my-4">
          {emergencyNotice && (
            <Alert variant="destructive" className="rounded-2xl border-red-200 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 shadow-sm">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="font-semibold text-xs">{emergencyNotice}</AlertDescription>
            </Alert>
          )}

          {!orderingEnabled && (
            <Alert className="rounded-2xl border-[#D4AF37]/40 bg-[#FFFBEB] dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 shadow-sm">
              <AlertTriangle className="h-4 w-4 text-[#D4AF37]" />
              <AlertDescription className="font-semibold text-xs">
                Ordering is temporarily paused by the kitchen manager. Please check back shortly.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Menu Items Grid Header */}
        <div className="flex items-center justify-between mb-4 mt-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-display font-bold text-[#1F2937] dark:text-white">
              {selectedCategory ? `${selectedCategory}` : 'Featured Selections'}
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#064E3B] dark:bg-emerald-950/60 dark:text-emerald-300">
              {filteredItems?.length || 0} items
            </span>
          </div>
        </div>

        {/* Food Items List: Adaptive for Mobile & Desktop */}
        {filteredItems?.length === 0 ? (
          <div className="text-center py-16 px-6 bg-card rounded-3xl border border-dashed border-border/80 my-4">
            <div className="h-14 w-14 rounded-full bg-[#D1FAE5] dark:bg-emerald-950/50 flex items-center justify-center mx-auto mb-3 text-[#064E3B] dark:text-emerald-400">
              <UtensilsCrossed className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1 font-display">No dishes found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              We couldn't find matches for "{searchQuery}". Try searching for another category or clearing your filter.
            </p>
          </div>
        ) : (
          <div>
            {/* Mobile View: High impact MobileMenuCard */}
            <div className="sm:hidden -mx-4">
              {filteredItems?.map(item => (
                <MobileMenuCard
                  key={item.id}
                  item={item}
                  showControls={orderingEnabled}
                />
              ))}
            </div>

            {/* Desktop View: Multi-column Card Grid */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems?.map(item => (
                <MenuCard
                  key={item.id}
                  item={item}
                  showControls={orderingEnabled}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Floating Checkout Bar for Mobile */}
      <StickyCartBar />
    </Layout>
  );
}
