import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LogOut, Mail, Phone, GraduationCap,
  ChevronRight, Bell, Shield, HelpCircle,
  Moon, Sun, Monitor, Sparkles, UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, profile, role, signOut, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (authLoading || !user) {
    return (
      <Layout headerTitle="Profile">
        <div className="px-4 py-8 text-center">
          <p className="text-muted-foreground text-sm">Loading user profile...</p>
        </div>
      </Layout>
    );
  }

  const menuItems = [
    { icon: Bell, label: 'Notifications', description: 'Manage push notifications & alerts' },
    { icon: Shield, label: 'Security & Access', description: 'Account credentials and session control' },
    { icon: HelpCircle, label: 'Help & Campus Support', description: 'Kitchen guidelines & queries' },
  ];

  return (
    <Layout headerTitle="My Profile">
      <div className="space-y-6 max-w-xl mx-auto pb-24 pt-2">

        {/* Profile Digital Card */}
        <Card className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm">
          {/* Card Top Brand Stripe */}
          <div className="h-20 bg-gradient-to-r from-[#064E3B] via-[#047857] to-[#10B981] relative">
            <div className="absolute top-3 right-4">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                {role === 'student' ? 'Student ID' : role === 'admin' ? 'Administrator' : 'Kitchen Staff'}
              </span>
            </div>
          </div>

          <CardContent className="px-6 pb-6 pt-0 relative">
            <div className="flex flex-col items-center text-center -mt-10 mb-4">
              <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg mb-3">
                <AvatarFallback className="bg-[#064E3B] text-white font-black text-2xl border-2 border-[#D4AF37]">
                  {profile?.name ? getInitials(profile.name) : 'U'}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-xl font-bold font-display text-foreground">
                {profile?.name || 'Campus Student'}
              </h2>

              <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full bg-[#D1FAE5] text-[#064E3B] dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold">
                <GraduationCap className="h-3.5 w-3.5 text-[#10B981]" />
                <span>USN: {profile?.usn || 'Verified'}</span>
              </div>
            </div>

            {/* Information Rows */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-3 p-3.5 bg-muted/50 rounded-2xl border border-border/50">
                <div className="h-9 w-9 rounded-xl bg-card flex items-center justify-center shrink-0 shadow-xs">
                  <Mail className="h-4 w-4 text-[#064E3B] dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Campus Email</p>
                  <p className="text-xs font-semibold text-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {profile?.phone && (
                <div className="flex items-center gap-3 p-3.5 bg-muted/50 rounded-2xl border border-border/50">
                  <div className="h-9 w-9 rounded-xl bg-card flex items-center justify-center shrink-0 shadow-xs">
                    <Phone className="h-4 w-4 text-[#064E3B] dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Phone</p>
                    <p className="text-xs font-semibold text-foreground">
                      {profile.phone}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Theme Preference Card */}
        <Card className="rounded-3xl border border-border/80 bg-card shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm font-display text-foreground">Interface Theme</h3>
              <p className="text-xs text-muted-foreground">Select light cream or dark charcoal</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                theme === 'light'
                  ? 'border-[#064E3B] bg-[#D1FAE5]/40 text-[#064E3B] dark:text-emerald-300 shadow-sm'
                  : 'border-border/80 text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <Sun className="h-4 w-4 text-[#D4AF37]" />
              <span>Light</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                theme === 'dark'
                  ? 'border-[#064E3B] bg-[#D1FAE5]/40 text-[#064E3B] dark:text-emerald-300 shadow-sm'
                  : 'border-border/80 text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <Moon className="h-4 w-4 text-[#10B981]" />
              <span>Dark</span>
            </button>

            <button
              onClick={() => setTheme('system')}
              className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                theme === 'system'
                  ? 'border-[#064E3B] bg-[#D1FAE5]/40 text-[#064E3B] dark:text-emerald-300 shadow-sm'
                  : 'border-border/80 text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <Monitor className="h-4 w-4" />
              <span>System</span>
            </button>
          </div>
        </Card>

        {/* Menu Items List */}
        <Card className="rounded-3xl border border-border/80 bg-card shadow-sm divide-y divide-border/60 overflow-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#D1FAE5]/60 dark:bg-emerald-950/60 flex items-center justify-center text-[#064E3B] dark:text-emerald-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-foreground">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
              </div>
            );
          })}
        </Card>

        {/* Sign Out Button */}
        <div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full h-12 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 font-bold text-xs flex items-center justify-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out of CampusBite</span>
          </Button>
        </div>

      </div>
    </Layout>
  );
}
