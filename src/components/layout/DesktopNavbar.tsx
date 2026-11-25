import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Logo } from '@/components/common/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ShoppingCart, LogOut, Settings, User, UtensilsCrossed,
  ClipboardList, Clock, QrCode, Shield, ChefHat, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export function DesktopNavbar() {
  const { user, profile, role, signOut } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Student Navigation Links
  const studentLinks = [
    { to: '/menu', label: 'Explore Menu', icon: UtensilsCrossed },
    { to: '/orders', label: 'My Orders', icon: ClipboardList },
  ];

  // Admin Navigation Links
  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: Settings },
    { to: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
    { to: '/admin/slots', label: 'Slots', icon: Clock },
    { to: '/canteen', label: 'Kitchen Orders', icon: ChefHat },
    { to: '/admin/scan', label: 'Scanner', icon: QrCode },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: Shield },
  ];

  // Canteen Owner Navigation Links
  const canteenLinks = [
    { to: '/canteen', label: 'Live Kitchen Queue', icon: ChefHat },
    { to: '/admin/menu', label: 'Menu Items', icon: UtensilsCrossed },
  ];

  if (location.pathname === '/auth') return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FFFDF5]/90 dark:bg-[#1F2937]/90 backdrop-blur-md border-b border-[#064E3B]/10 dark:border-white/10 shadow-[0_2px_15px_-3px_rgba(6,78,59,0.05)] hidden sm:block">
      <div className="max-w-[1240px] mx-auto px-6 h-20 flex items-center justify-between gap-6">
        {/* Left: Logo */}
        <Link to="/" className="hover:opacity-95 transition-opacity flex items-center">
          <Logo />
        </Link>

        {/* Center: Navigation based on user role */}
        <nav className="flex items-center gap-1.5 bg-[#F3F4F6]/70 dark:bg-zinc-800/60 p-1.5 rounded-full border border-border/60">
          {user && role === 'student' && studentLinks.map((link) => {
            const isActive = location.pathname === link.to;
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'text-[#064E3B] bg-[#D1FAE5] dark:bg-emerald-950/60 dark:text-emerald-300 shadow-sm'
                    : 'text-[#1F2937]/70 dark:text-zinc-300 hover:text-[#064E3B] hover:bg-white/60 dark:hover:bg-zinc-700/60'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#10B981]' : ''}`} />
                <span>{link.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="desktopNavIndicator"
                    className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"
                  />
                )}
              </NavLink>
            );
          })}

          {user && role === 'admin' && adminLinks.map((link) => {
            const isActive = location.pathname === link.to;
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`relative px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#064E3B] bg-[#D1FAE5] dark:bg-emerald-950/60 dark:text-emerald-300 shadow-sm font-bold'
                    : 'text-[#1F2937]/70 dark:text-zinc-300 hover:text-[#064E3B] hover:bg-white/60 dark:hover:bg-zinc-700/60'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#10B981]' : ''}`} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}

          {user && role === 'canteen_owner' && canteenLinks.map((link) => {
            const isActive = location.pathname === link.to;
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'text-[#064E3B] bg-[#D1FAE5] dark:bg-emerald-950/60 dark:text-emerald-300 shadow-sm'
                    : 'text-[#1F2937]/70 dark:text-zinc-300 hover:text-[#064E3B] hover:bg-white/60 dark:hover:bg-zinc-700/60'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#10B981]' : ''}`} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}

          {!user && (
            <div className="flex items-center gap-4 px-3 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5 text-[#064E3B] font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" /> Next-Gen Campus Dining
              </span>
            </div>
          )}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {!user ? (
            <div className="flex items-center gap-2">
              <Link to="/auth">
                <Button variant="ghost" className="font-semibold text-xs h-10 px-4 rounded-xl">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button className="font-bold text-xs h-10 px-5 rounded-xl bg-[#064E3B] hover:bg-[#054030] text-white shadow-sm border border-[#D4AF37]/20">
                  Get Started
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {role === 'student' && (
                <Link to="/cart">
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative bg-white dark:bg-zinc-800 border-border/80 hover:border-[#10B981]/50 rounded-2xl h-11 w-11 shadow-sm transition-all"
                  >
                    <ShoppingCart className="h-5 w-5 text-[#064E3B] dark:text-white" />
                    {totalItems > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 bg-[#10B981] text-[11px] font-black text-white rounded-full flex items-center justify-center ring-2 ring-white shadow-md"
                      >
                        {totalItems}
                      </motion.span>
                    )}
                  </Button>
                </Link>
              )}

              {/* Role Indicator Badge */}
              <div className="hidden lg:flex items-center">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#D1FAE5] text-[#064E3B] border border-[#10B981]/30">
                  {role === 'student' ? 'Student' : role === 'admin' ? 'Administrator' : 'Kitchen Staff'}
                </span>
              </div>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="pl-2 pr-3 gap-2.5 rounded-2xl bg-white dark:bg-zinc-800 hover:bg-[#D1FAE5]/30 h-11 border-border/80 shadow-sm"
                  >
                    <Avatar className="h-8 w-8 rounded-xl border border-[#D4AF37]/30">
                      <AvatarFallback className="bg-[#064E3B] text-white font-bold text-xs rounded-xl">
                        {profile?.name ? getInitials(profile.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left leading-tight hidden md:block">
                      <span className="text-xs font-bold text-foreground max-w-[120px] truncate">
                        {profile?.name || 'My Account'}
                      </span>
                      <span className="text-[10px] text-muted-foreground capitalize">
                        {role}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 mt-2 p-2 rounded-2xl border-border/80 shadow-xl">
                  <div className="px-3 py-2.5 bg-[#FFFDF5] dark:bg-zinc-800 rounded-xl border border-border/50 mb-2">
                    <p className="font-bold text-sm text-[#064E3B] dark:text-emerald-300">{profile?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>

                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                    <Link to="/profile" className="flex items-center py-2">
                      <User className="h-4 w-4 mr-2.5 text-[#10B981]" />
                      Profile & Settings
                    </Link>
                  </DropdownMenuItem>

                  {role === 'student' && (
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link to="/orders" className="flex items-center py-2">
                        <ClipboardList className="h-4 w-4 mr-2.5 text-[#10B981]" />
                        Order History
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {(role === 'canteen_owner' || role === 'admin') && (
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link to={role === 'admin' ? '/admin' : '/canteen'} className="flex items-center py-2">
                        <Settings className="h-4 w-4 mr-2.5 text-[#D4AF37]" />
                        Management Console
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="my-1.5" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive focus:text-destructive rounded-xl cursor-pointer py-2"
                  >
                    <LogOut className="h-4 w-4 mr-2.5" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
