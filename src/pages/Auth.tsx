import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';
import { Loader2, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15, 'Phone is too long').regex(/^[0-9+\s-]+$/, 'Invalid phone format'),
  usn: z.string().min(3, 'USN must be at least 3 characters').max(20, 'USN is too long').regex(/^[A-Za-z0-9]+$/, 'USN must be alphanumeric')
});

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [usn, setUsn] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, user, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && role) {
      switch (role) {
        case 'canteen_owner':
          navigate('/canteen');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          navigate('/menu');
      }
    }
  }, [user, role, navigate]);

  const validateForm = () => {
    try {
      if (isLogin) {
        loginSchema.parse({ email, password });
      } else {
        signupSchema.parse({ email, password, name, phone, usn });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back!');
        }
      } else {
        const { error } = await signUp(email, password, name, phone, usn);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created! You can now sign in.');
          setIsLogin(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showHeader={false} showBottomNav={false}>
      <div className="min-h-[90vh] flex flex-col justify-center items-center py-6 px-4">
        
        {/* Back Link */}
        <div className="w-full max-w-md mb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full gap-1.5 hover:bg-[#D1FAE5]/40 text-[#064E3B] dark:text-emerald-300"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs font-semibold">Home</span>
          </Button>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#10B981]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Secure Campus Auth</span>
          </div>
        </div>

        {/* Auth Box */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card className="rounded-[2.5rem] border border-border/80 bg-card shadow-xl overflow-hidden p-6 sm:p-8">
            {/* Logo & Headline */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <Logo variant="large" />
              </div>
              <h1 className="text-2xl font-display font-extrabold text-foreground">
                {isLogin ? 'Welcome Back' : 'Create Campus Account'}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {isLogin
                  ? 'Access your food tray, active tokens, and order history'
                  : 'Join the campus express dining platform with your student ID'
                }
              </p>
            </div>

            {/* Segmented Mode Switcher */}
            <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-2xl mb-6 border border-border/60">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setErrors({}); }}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  isLogin
                    ? 'bg-card text-[#064E3B] dark:text-emerald-300 shadow-sm border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setErrors({}); }}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  !isLogin
                    ? 'bg-card text-[#064E3B] dark:text-emerald-300 shadow-sm border border-border/60'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-bold text-foreground">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`h-11 rounded-xl text-sm ${errors.name ? 'border-destructive ring-1 ring-destructive' : ''}`}
                    />
                    {errors.name && (
                      <p className="text-[11px] text-destructive font-semibold">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="usn" className="text-xs font-bold text-foreground">
                      USN (University Serial Number)
                    </Label>
                    <Input
                      id="usn"
                      type="text"
                      placeholder="e.g. 1MS21CS001"
                      value={usn}
                      onChange={(e) => setUsn(e.target.value.toUpperCase())}
                      className={`h-11 rounded-xl text-sm ${errors.usn ? 'border-destructive ring-1 ring-destructive' : ''}`}
                    />
                    {errors.usn && (
                      <p className="text-[11px] text-destructive font-semibold">{errors.usn}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-bold text-foreground">
                      Mobile Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`h-11 rounded-xl text-sm ${errors.phone ? 'border-destructive ring-1 ring-destructive' : ''}`}
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-destructive font-semibold">{errors.phone}</p>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`h-11 rounded-xl text-sm ${errors.email ? 'border-destructive ring-1 ring-destructive' : ''}`}
                />
                {errors.email && (
                  <p className="text-[11px] text-destructive font-semibold">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-bold text-foreground">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-11 rounded-xl text-sm ${errors.password ? 'border-destructive ring-1 ring-destructive' : ''}`}
                />
                {errors.password && (
                  <p className="text-[11px] text-destructive font-semibold">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#064E3B] hover:bg-[#054030] text-white border border-[#D4AF37]/30 rounded-2xl text-sm font-bold shadow-md transition-all active:scale-[0.98] mt-2"
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin text-[#10B981]" />}
                {isLogin ? 'Sign In to CampusBite' : 'Complete Registration'}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-border/60 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="text-xs font-semibold text-[#064E3B] dark:text-emerald-400 hover:text-[#10B981] transition-colors"
              >
                {isLogin
                  ? "Don't have an account? Create one now"
                  : 'Already registered? Sign in here'
                }
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
