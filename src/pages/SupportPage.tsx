import { SEOHead } from '../components/seo/SEOHead';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Headphones, FileText, HelpCircle, ShoppingBag, Truck, RotateCcw,
  CreditCard, Shield, ChevronRight, MessageSquare, Zap, BookOpen, ArrowRight
} from 'lucide-react';

const supportCategories = [
  {
    icon: ShoppingBag,
    title: 'Orders & Purchases',
    description: 'Track orders, manage returns, or view your purchase history.',
    link: '/profile',
    color: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    hoverShadow: 'hover:shadow-blue-500/10'
  },
  {
    icon: HelpCircle,
    title: 'FAQs',
    description: 'Find instant answers to the most common questions.',
    link: '/faq',
    color: 'from-purple-500 to-pink-600',
    lightBg: 'bg-purple-50 dark:bg-purple-950/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    hoverShadow: 'hover:shadow-purple-500/10'
  },
  {
    icon: Truck,
    title: 'Shipping & Delivery',
    description: 'Shipping times, methods, and international delivery info.',
    link: '/faq',
    color: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    hoverShadow: 'hover:shadow-emerald-500/10'
  },
  {
    icon: RotateCcw,
    title: 'Returns & Refunds',
    description: '7-day hassle-free returns for all unused items.',
    link: '/faq',
    color: 'from-orange-500 to-red-500',
    lightBg: 'bg-orange-50 dark:bg-orange-950/30',
    iconColor: 'text-orange-600 dark:text-orange-400',
    hoverShadow: 'hover:shadow-orange-500/10'
  },
  {
    icon: CreditCard,
    title: 'Payments & Billing',
    description: 'Payment methods, billing issues, and transaction queries.',
    link: '/faq',
    color: 'from-cyan-500 to-blue-600',
    lightBg: 'bg-cyan-50 dark:bg-cyan-950/30',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    hoverShadow: 'hover:shadow-cyan-500/10'
  },
  {
    icon: Shield,
    title: 'Security & Privacy',
    description: 'Account security, data privacy, and password help.',
    link: '/privacy',
    color: 'from-slate-500 to-slate-700',
    lightBg: 'bg-slate-100 dark:bg-slate-800/50',
    iconColor: 'text-slate-600 dark:text-slate-400',
    hoverShadow: 'hover:shadow-slate-500/10'
  }
];

const quickLinks = [
  { icon: FileText, label: 'Terms of Service', link: '/terms' },
  { icon: Shield, label: 'Privacy Policy', link: '/privacy' },
  { icon: BookOpen, label: 'FAQ Center', link: '/faq' },
  { icon: MessageSquare, label: 'Contact Us', link: '/contact' },
];

export const SupportPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <SEOHead title="Support | StyleHub" description="Get help with your StyleHub orders and products." />

      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 via-background to-indigo-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />

      {/* Floating orbs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -25, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-20 right-[15%] w-80 h-80 bg-blue-300/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 35, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute bottom-40 left-[10%] w-72 h-72 bg-purple-300/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 pt-10 pb-24">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
              className="flex justify-center mb-6"
            >
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/25">
                <Headphones className="h-10 w-10 text-white" />
              </div>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-5">
              How can we{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                help you?
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Browse our support categories or get in touch with our team for personalized assistance.
            </p>
          </motion.div>

          {/* Support Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
            {supportCategories.map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 + 0.2, duration: 0.4 }}
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => navigate(cat.link)}
                className={`group cursor-pointer bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm p-7 rounded-2xl border border-white/60 dark:border-slate-700/40 shadow-sm ${cat.hoverShadow} hover:shadow-xl transition-all duration-300 relative overflow-hidden`}
              >
                {/* Hover gradient bg */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />

                <div className="relative z-10">
                  <div className={`h-12 w-12 rounded-xl ${cat.lightBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <cat.icon className={`h-6 w-6 ${cat.iconColor}`} />
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {cat.description}
                  </p>

                  <div className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1">
                    Learn more <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Links Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Quick Links
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickLinks.map((item, i) => (
                <motion.button
                  key={item.label}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(item.link)}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-white/60 dark:border-slate-700/40 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/50 transition-all text-sm font-medium text-foreground group"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                  <span className="truncate">{item.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Contact CTA Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <div className="relative overflow-hidden rounded-3xl border border-border/30">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
              <div className="absolute inset-0">
                <motion.div
                  animate={{ x: [0, 80, 0], y: [0, -40, 0] }}
                  transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl"
                />
                <motion.div
                  animate={{ x: [0, -60, 0], y: [0, 50, 0] }}
                  transition={{ duration: 11, repeat: Infinity, ease: 'linear' }}
                  className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl"
                />
              </div>

              <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-4 backdrop-blur-sm">
                    <Headphones className="h-3.5 w-3.5" />
                    24/7 Support Available
                  </div>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                    Still need help?
                  </h3>
                  <p className="text-blue-100/80 text-base md:text-lg max-w-lg">
                    Our friendly customer support team is ready to assist you with anything. Reach out and we'll respond within 2 hours.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/contact')}
                    className="px-8 py-4 bg-white text-blue-700 font-bold rounded-xl shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/15 transition-all text-base flex items-center gap-2"
                  >
                    <MessageSquare className="h-5 w-5" />
                    Contact Us
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/faq')}
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all text-base flex items-center gap-2"
                  >
                    <BookOpen className="h-5 w-5" />
                    Browse FAQs
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
