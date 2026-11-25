import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Settings, ArrowLeft, QrCode, User, Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Logo } from '@/components/common/Logo';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showProfile?: boolean;
}

export function MobileHeader({ title, showBack = false, showProfile = true }: MobileHeaderProps) {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFDF5]/95 dark:bg-[#1F2937]/95 backdrop-blur-md border-b border-[#064E3B]/10 dark:border-white/10 safe-area-top shadow-sm">
      <div className="flex h-[60px] items-center justify-between px-4">
        {/* Left section */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <Button
              variant="ghost"
              size="sm"
              className="pl-2 pr-3 -ml-2 gap-1.5 rounded-full hover:bg-[#D1FAE5]/40 text-[#064E3B] dark:text-emerald-300"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold text-xs">Back</span>
            </Button>
          ) : (
            <Link to="/" className="flex items-center active:opacity-80 transition-opacity">
              <Logo showText={!title} />
            </Link>
          )}

          {title && (
            <h1 className="font-display text-base font-bold text-[#064E3B] dark:text-emerald-300 truncate pl-3 border-l-2 border-[#10B981]/40 ml-1">
              {title}
            </h1>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {user && role === 'admin' && (
            <Link to="/admin/scan">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-[#064E3B] dark:text-white hover:bg-[#D1FAE5]/50">
                <QrCode className="h-5 w-5 text-[#10B981]" />
              </Button>
            </Link>
          )}

          {showProfile && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-[#D1FAE5]/40 p-0">
                  <Avatar className="h-8 w-8 rounded-xl border border-[#D4AF37]/40 shadow-sm">
                    <AvatarFallback className="bg-[#064E3B] text-white font-bold text-xs rounded-xl">
                      {profile?.name ? getInitials(profile.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl border-border/80 shadow-xl p-1.5">
                <div className="px-3 py-2 bg-[#FFFDF5] dark:bg-zinc-800 rounded-xl border border-border/50 mb-1">
                  <p className="font-bold text-sm text-[#064E3B] dark:text-emerald-300">{profile?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl">
                  <Link to="/profile" className="flex items-center py-2 text-xs font-semibold">
                    <User className="h-4 w-4 mr-2 text-[#10B981]" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                {(role === 'canteen_owner' || role === 'admin') && (
                  <DropdownMenuItem asChild className="rounded-xl">
                    <Link to={role === 'admin' ? '/admin' : '/canteen'} className="flex items-center py-2 text-xs font-semibold">
                      <Settings className="h-4 w-4 mr-2 text-[#D4AF37]" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive rounded-xl text-xs font-semibold py-2">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            !user && (
              <Link to="/auth">
                <Button size="sm" className="h-8 font-bold text-xs px-3.5 rounded-xl bg-[#064E3B] text-white hover:bg-[#054030]">
                  Sign In
                </Button>
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
