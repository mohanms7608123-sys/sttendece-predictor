import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { UtensilsCrossed, ClipboardList, User, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function BottomNav() {
  const { user, role } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();

  // Don't show bottom nav for staff/admin or on auth page
  if (!user || role !== 'student' || location.pathname === '/auth') {
    return null;
  }

  const navItems = [
    { to: '/menu', icon: UtensilsCrossed, label: 'Menu' },
    { to: '/cart', icon: ShoppingBag, label: 'Cart', badge: totalItems },
    { to: '/orders', icon: ClipboardList, label: 'Orders' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#FFFDF5]/95 dark:bg-[#1F2937]/95 backdrop-blur-md border-t border-[#064E3B]/10 dark:border-white/10 safe-area-bottom shadow-[0_-8px_25px_rgba(6,78,59,0.08)] sm:hidden">
      <div className="flex items-center justify-around h-[62px] px-2 max-w-md mx-auto">
        {navItems.map(({ to, icon: Icon, label, badge }) => {
          const isActive =
            location.pathname === to ||
            (to === '/menu' && location.pathname.startsWith('/menu')) ||
            (to === '/orders' && location.pathname.startsWith('/order'));

          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all select-none active:scale-95",
                isActive ? "text-[#064E3B] dark:text-emerald-300" : "text-muted-foreground/70 hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavActivePill"
                  className="absolute inset-x-2 top-1.5 bottom-1.5 bg-[#D1FAE5] dark:bg-emerald-950/50 rounded-2xl -z-10 border border-[#10B981]/20 shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <div className="relative">
                <Icon
                  className={cn("h-5 w-5 transition-transform", isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.75]")}
                />

                {badge !== undefined && badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-3 h-4 min-w-4 flex items-center justify-center px-1 text-[10px] font-black text-white bg-[#10B981] rounded-full ring-2 ring-white shadow-sm"
                  >
                    {badge > 9 ? '9+' : badge}
                  </motion.span>
                )}
              </div>

              <span className={cn("text-[10px] font-bold tracking-tight mt-1", isActive ? "text-[#064E3B] dark:text-emerald-300" : "text-muted-foreground")}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
