import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, UtensilsCrossed, Clock, ChefHat,
  QrCode, Shield, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function AdminSubNav() {
  const location = useLocation();

  const links = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/menu', label: 'Menu Catalog', icon: UtensilsCrossed },
    { to: '/admin/slots', label: 'Pickup Slots', icon: Clock },
    { to: '/canteen', label: 'Kitchen Live KDS', icon: ChefHat },
    { to: '/admin/scan', label: 'QR Scanner', icon: QrCode },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: Shield },
  ];

  return (
    <div className="w-full bg-card/60 backdrop-blur-md rounded-2xl border border-border/80 p-1.5 shadow-sm mb-6 overflow-x-auto hide-scrollbar">
      <div className="flex items-center gap-1.5 min-w-max">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={cn(
                "relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 select-none",
                isActive
                  ? "bg-[#064E3B] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", isActive ? "text-[#10B981]" : "text-muted-foreground")} />
              <span>{link.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
