import { MobileHeader } from './MobileHeader';
import { BottomNav } from './BottomNav';
import { DesktopNavbar } from './DesktopNavbar';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  headerTitle?: string;
  showBack?: boolean;
  showBottomNav?: boolean;
}

export function Layout({
  children,
  showHeader = true,
  headerTitle,
  showBack = false,
  showBottomNav = true,
}: LayoutProps) {
  const { user, role } = useAuth();
  const isStudent = user && role === 'student';

  return (
    <div className="min-h-screen bg-background flex flex-col relative selection:bg-[#D1FAE5] selection:text-[#064E3B]">
      {/* Ambient Luxury Lighting Orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#D1FAE5]/30 dark:bg-emerald-950/20 rounded-full blur-[120px] pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3" />
      <div className="fixed bottom-0 left-0 w-[450px] h-[450px] bg-[#D4AF37]/10 dark:bg-amber-950/10 rounded-full blur-[140px] pointer-events-none -z-10 -translate-x-1/3 translate-y-1/3" />

      {/* Desktop Header */}
      <DesktopNavbar />

      {/* Mobile Header */}
      <div className="sm:hidden">
        {showHeader && (
          <MobileHeader
            title={headerTitle}
            showBack={showBack}
          />
        )}
      </div>

      <main className={`flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 ${isStudent && showBottomNav ? 'pb-28 sm:pb-12' : 'pb-12'} pt-4 sm:pt-8`}>
        {children}
      </main>

      {/* Bottom Nav - Hidden on sm screens and up */}
      <div className="sm:hidden">
        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
}
