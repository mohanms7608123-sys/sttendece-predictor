import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
  UtensilsCrossed, Clock, QrCode, Bell,
  ChevronRight, Zap, Star, ArrowRight,
  Users, CheckCircle2, Sparkles, ShieldCheck, Flame, ArrowUpRight
} from 'lucide-react';
import { useMenuItems } from '@/hooks/useMenuItems';
import { Logo } from '@/components/common/Logo';
import { motion } from 'framer-motion';

export default function Index() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { data: menuItems, isLoading } = useMenuItems(true);

  useEffect(() => {
    if (!loading && user && role) {
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
  }, [user, role, loading, navigate]);

  const features = [
    {
      icon: UtensilsCrossed,
      title: 'Artisan Menu Selection',
      description: 'Explore live cafeteria specials, dietary preferences, and fresh seasonal ingredients.',
      tag: 'Curation'
    },
    {
      icon: Clock,
      title: 'Precision Time Slots',
      description: 'Schedule pick-up times between lectures and never stand in an unorganized crowd.',
      tag: 'Zero Wait'
    },
    {
      icon: QrCode,
      title: 'Contactless Digital Tokens',
      description: 'Flash your unique dynamic QR ticket at express counters for effortless verification.',
      tag: 'Express'
    },
    {
      icon: Bell,
      title: 'Real-Time Kitchen Sync',
      description: 'Receive instant notifications the precise second your meal is packaged and plated.',
      tag: 'Live Alerts'
    }
  ];

  const displayItems = menuItems?.slice(0, 3) || [];

  return (
    <Layout showBottomNav={false} showHeader={false}>
      <div className="flex flex-col min-h-[100dvh] relative overflow-hidden bg-background">

        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#D1FAE5]/30 rounded-full blur-[130px] -translate-y-1/2 pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-[#D4AF37]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* Hero Section */}
        <section className="relative pt-16 pb-16 lg:pt-24 lg:pb-24 overflow-hidden">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

              {/* Left Column: Hero Text */}
              <div className="flex-1 text-center lg:text-left z-10 max-w-2xl mx-auto lg:mx-0">
                
                {/* Pill Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 bg-[#D1FAE5]/80 dark:bg-emerald-950/60 border border-[#10B981]/30 text-[#064E3B] dark:text-emerald-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide mb-6 shadow-sm"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                  <span>NEXT-GEN CAMPUS FOOD PLATFORM</span>
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-[#1F2937] dark:text-white mb-6 leading-[1.08] tracking-tight"
                >
                  Skip the line. <br />
                  <span className="bg-gradient-to-r from-[#064E3B] via-[#047857] to-[#10B981] bg-clip-text text-transparent">
                    Savor every bite.
                  </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-base sm:text-lg text-muted-foreground mb-8 leading-relaxed font-normal"
                >
                  CampusBite transforms your university dining experience into an express, high-tech SaaS flow. Pre-order gourmet meals, reserve collection slots, and pick up in seconds.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                >
                  <Link to="/auth?mode=signup" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto h-13 px-8 bg-[#064E3B] hover:bg-[#054030] text-white font-bold rounded-2xl shadow-[0_8px_25px_rgba(6,78,59,0.25)] border border-[#D4AF37]/30 transition-all hover:scale-105"
                    >
                      <span>Explore Menu & Order</span>
                      <ArrowRight className="ml-2 h-4 w-4 text-[#D4AF37]" />
                    </Button>
                  </Link>
                  <Link to="/auth" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto h-13 px-7 rounded-2xl border border-border/80 bg-white/70 dark:bg-zinc-800/70 hover:bg-[#D1FAE5]/30 text-foreground font-semibold backdrop-blur-sm"
                    >
                      Sign In to Account
                    </Button>
                  </Link>
                </motion.div>

                {/* Micro Stats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mt-10 pt-8 border-t border-border/70 flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-10 text-xs font-semibold text-muted-foreground"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                      <Users className="h-3.5 w-3.5 text-[#064E3B]" />
                    </div>
                    <span>10,000+ Campus Orders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-[#FEF3C7] flex items-center justify-center">
                      <Star className="h-3.5 w-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                    </div>
                    <span>4.9 / 5 Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                      <Zap className="h-3.5 w-3.5 text-[#10B981]" />
                    </div>
                    <span>Zero Wait Queue</span>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Hero Visual Showcase */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex-1 relative w-full max-w-[540px] lg:max-w-none"
              >
                {/* Main Hero Card Container */}
                <div className="relative rounded-[2.5rem] bg-gradient-to-br from-white via-[#FFFDF5] to-[#F3F4F6] dark:from-zinc-900 dark:to-zinc-800 p-3 sm:p-5 shadow-[0_20px_50px_rgba(6,78,59,0.12)] border border-[#064E3B]/10">
                  <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 shadow-inner">
                    <img
                      src="/hero-food.png"
                      alt="Fresh campus dining"
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        // Fallback image if hero-food.png is missing
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#064E3B]/80 via-transparent to-black/20" />

                    {/* Badge inside image */}
                    <div className="absolute bottom-4 left-4 z-20 text-white">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] block mb-0.5">
                        Chef's Selection
                      </span>
                      <h4 className="font-bold text-lg leading-tight text-white drop-shadow">
                        Fresh Daily Specialties
                      </h4>
                    </div>
                  </div>

                  {/* Floating Digital Token Preview Card */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="absolute -bottom-6 -left-4 sm:bottom-4 sm:-left-6 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-[#064E3B]/15 flex items-center gap-3.5 max-w-[260px]"
                  >
                    <div className="h-11 w-11 rounded-xl bg-[#064E3B] text-white flex flex-col items-center justify-center font-bold shrink-0 shadow-sm border border-[#D4AF37]/30">
                      <span className="text-[9px] uppercase tracking-tighter opacity-80">TOKEN</span>
                      <span className="text-sm font-black text-[#10B981]">#042</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                        <p className="font-bold text-xs text-[#064E3B] dark:text-emerald-300">Ready at Counter</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Pickup in 2 minutes</p>
                    </div>
                  </motion.div>

                  {/* Floating Rating Pill */}
                  <div className="absolute top-6 right-6 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-border/80 flex items-center gap-1.5 text-xs font-bold text-[#1F2937] dark:text-white">
                    <Star className="h-3.5 w-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                    <span>4.9 / 5.0</span>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Features Grid Section */}
        <section className="py-20 bg-[#F3F4F6]/60 dark:bg-zinc-900/40 border-y border-border/70 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold text-[#10B981] uppercase tracking-widest block mb-2">
                ENGINEERED FOR EFFICIENCY
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-[#1F2937] dark:text-white tracking-tight">
                How CampusBite Powers Your Day
              </h2>
              <p className="text-muted-foreground mt-3 text-sm md:text-base leading-relaxed">
                A seamless 4-step pipeline designed to eliminate queues and maximize student productivity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="bg-card border border-border/80 p-7 rounded-3xl shadow-sm hover:shadow-xl hover:border-[#10B981]/40 transition-all flex flex-col items-start relative group"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-[#D1FAE5] dark:bg-emerald-950/60 flex items-center justify-center mb-5 text-[#064E3B] dark:text-emerald-300 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] mb-1">
                      {feature.tag}
                    </span>
                    <h3 className="font-bold text-base text-[#1F2937] dark:text-white mb-2 font-display">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Trending Dishes / Live Menu Showcase */}
        <section className="py-20 relative overflow-hidden">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
              <div>
                <span className="text-xs font-bold text-[#10B981] uppercase tracking-widest block mb-1">
                  TODAY'S HIGHLIGHTS
                </span>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-[#1F2937] dark:text-white">
                  Trending on Campus
                </h2>
              </div>
              <Link
                to="/auth"
                className="text-sm font-bold text-[#064E3B] dark:text-emerald-400 hover:text-[#10B981] flex items-center gap-1 group bg-[#D1FAE5]/50 px-4 py-2 rounded-full border border-[#10B981]/20 transition-all"
              >
                <span>View Full Menu</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-80 bg-card border border-border/80 animate-pulse rounded-3xl" />
                ))}
              </div>
            ) : displayItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayItems.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="group bg-card rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(6,78,59,0.06)] hover:shadow-xl border border-border/80 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Header */}
                      <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#D1FAE5]/30 flex items-center justify-center text-[#064E3B]/40">
                            <UtensilsCrossed className="h-12 w-12" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 z-20">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm ${
                            item.is_veg !== false ? 'bg-[#D1FAE5] text-[#064E3B]' : 'bg-red-100 text-red-700'
                          }`}>
                            {item.is_veg !== false ? '🌱 Pure Veg' : '🍖 Non-Veg'}
                          </span>
                        </div>

                        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 text-white">
                          <div className="flex items-center gap-1 bg-[#064E3B]/80 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-bold">
                            <Star className="h-3 w-3 fill-[#D4AF37] text-[#D4AF37]" />
                            <span>4.8</span>
                          </div>
                          <span className="text-xs text-white/80 font-medium">
                            • {item.prep_time} min prep
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h3 className="font-bold text-base text-foreground group-hover:text-[#064E3B] dark:group-hover:text-emerald-400 transition-colors line-clamp-1 font-display">
                            {item.name}
                          </h3>
                          <span className="font-display font-extrabold text-lg text-[#064E3B] dark:text-emerald-400">
                            ₹{item.price}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.category || 'Special Dish'} • Prepared fresh by university culinary specialists.
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pb-5">
                      <Link to="/auth">
                        <Button className="w-full rounded-xl bg-[#064E3B] hover:bg-[#054030] text-white font-semibold text-xs h-10 shadow-sm border border-[#D4AF37]/20">
                          Order Now
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-3xl border border-dashed border-border p-8">
                <UtensilsCrossed className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Kitchen menu loading or updated soon.</p>
              </div>
            )}
          </div>
        </section>

        {/* Enterprise Call To Action Banner */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#064E3B] rounded-[2.5rem] p-8 sm:p-14 text-center text-white relative overflow-hidden shadow-2xl border border-[#D4AF37]/40">
              {/* Background Luxury Texture */}
              <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
              
              <div className="relative z-10 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D4AF37] text-xs font-bold mb-4 backdrop-blur-sm border border-white/10">
                  <Flame className="h-3.5 w-3.5" />
                  <span>START SAVING 30 MINUTES EVERY MEAL</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-display font-black mb-4 tracking-tight leading-tight">
                  Hungry? Stop Waiting in Lines.
                </h2>
                <p className="text-white/80 text-sm sm:text-base mb-8 max-w-lg mx-auto leading-relaxed">
                  Join thousands of campus students enjoying priority pickups, fresh meals, and seamless digital token checkout.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/auth?mode=signup" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto h-13 px-8 bg-[#10B981] hover:bg-[#0ea572] text-white font-bold text-sm rounded-xl shadow-lg shadow-black/20"
                    >
                      <span>Create Free Account</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/auth" className="w-full sm:w-auto">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto h-13 px-7 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm"
                    >
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#FFFDF5] dark:bg-zinc-900/60 py-14 border-t border-border/80">
          <div className="container px-4 mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-xs">
            <div className="space-y-3">
              <Logo showText={true} />
              <p className="text-muted-foreground leading-relaxed">
                The premier digital food-tech platform for universities and modern collegiate campuses.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#10B981]">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>All Kitchen Systems Operational</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] mb-3">Platform</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/menu" className="hover:text-[#064E3B] dark:hover:text-emerald-400">Cafeteria Menu</Link></li>
                <li><Link to="/orders" className="hover:text-[#064E3B] dark:hover:text-emerald-400">Order Tracking</Link></li>
                <li><Link to="/auth" className="hover:text-[#064E3B] dark:hover:text-emerald-400">Student Portal</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] mb-3">Administration</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/canteen" className="hover:text-[#064E3B] dark:hover:text-emerald-400">Kitchen Display (KDS)</Link></li>
                <li><Link to="/admin" className="hover:text-[#064E3B] dark:hover:text-emerald-400">Canteen Manager</Link></li>
                <li><Link to="/admin/scan" className="hover:text-[#064E3B] dark:hover:text-emerald-400">Express QR Scanner</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px] mb-3">Compliance & Quality</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" /> 100% Hygiene Certified</li>
                <li>Encrypted Student USN Authentication</li>
                <li>Instant Digital Invoicing</li>
              </ul>
            </div>
          </div>

          <div className="container px-4 mx-auto mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} CampusBite SaaS. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Crafted with <span className="text-[#10B981]">Deep Emerald</span> & <span className="text-[#D4AF37]">Champagne Gold</span>
            </p>
          </div>
        </footer>

      </div>
    </Layout>
  );
}
