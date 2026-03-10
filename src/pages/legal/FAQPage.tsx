import { useState } from 'react';
import { SEOHead } from '../../components/seo/SEOHead';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, ShoppingBag, Truck, RotateCcw, CreditCard, Shield, Headphones } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
  icon: React.ReactNode;
  category: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    q: 'How do I track my order?',
    a: 'Once your order ships, you will receive an email with a tracking number and link to track your package. You can also visit your Profile page and click on "My Orders" to view real-time tracking updates for all your orders.',
    icon: <Truck className="h-5 w-5" />,
    category: 'Shipping'
  },
  {
    q: 'What is your return policy?',
    a: 'We offer a 7-day return policy for all unused items in original packaging. Simply go to your order history, select the item you wish to return, and our team will guide you through the process. Refunds are processed within 5-7 business days.',
    icon: <RotateCcw className="h-5 w-5" />,
    category: 'Returns'
  },
  {
    q: 'Do you ship internationally?',
    a: 'Currently, we only ship within India. We are working on expanding to other countries soon. Stay tuned for updates! You can subscribe to our newsletter to be the first to know.',
    icon: <Truck className="h-5 w-5" />,
    category: 'Shipping'
  },
  {
    q: 'Are the products authentic?',
    a: 'Yes, all our products are 100% authentic and sourced directly from manufacturers or authorized distributors. We provide certificates of authenticity for premium products and back every purchase with our genuine product guarantee.',
    icon: <Shield className="h-5 w-5" />,
    category: 'Products'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit/debit cards (Visa, MasterCard, RuPay), UPI payments (Google Pay, PhonePe, Paytm), Net Banking from all major banks, and Cash on Delivery for select locations. All transactions are secured with 256-bit SSL encryption.',
    icon: <CreditCard className="h-5 w-5" />,
    category: 'Payments'
  },
  {
    q: 'How can I contact customer support?',
    a: 'Our customer support team is available 24/7. You can reach us through our Contact page, email us at support@stylehub.com, or call us at 1800-STYLE-HUB. We typically respond within 2 hours during business hours.',
    icon: <Headphones className="h-5 w-5" />,
    category: 'Support'
  },
  {
    q: 'Can I modify or cancel my order after placing it?',
    a: 'Orders can be modified or cancelled within 1 hour of placement. After that, the order enters processing and cannot be changed. For urgent modifications, please contact our support team immediately.',
    icon: <ShoppingBag className="h-5 w-5" />,
    category: 'Orders'
  },
  {
    q: 'Do you offer gift wrapping?',
    a: 'Yes! We offer premium gift wrapping for a small additional charge. You can select the gift wrap option during checkout and even add a personalized message card to make it extra special.',
    icon: <ShoppingBag className="h-5 w-5" />,
    category: 'Orders'
  },
  {
    q: 'Is my personal information safe?',
    a: 'Absolutely. We use industry-standard encryption to protect your personal and payment information. We never share your data with third parties. Please read our Privacy Policy for more details on how we handle your information.',
    icon: <Shield className="h-5 w-5" />,
    category: 'Security'
  },
  {
    q: 'Do you have a loyalty or rewards program?',
    a: 'Yes! StyleHub Rewards lets you earn points on every purchase. Accumulate points to unlock exclusive discounts, early access to sales, and special member-only deals. Sign up or log in to start earning today.',
    icon: <HelpCircle className="h-5 w-5" />,
    category: 'General'
  }
];

const CATEGORIES = ['All', 'Shipping', 'Returns', 'Payments', 'Products', 'Orders', 'Security', 'Support', 'General'];

const AccordionItem = ({ item, index, isOpen, toggle }: { item: FAQItem; index: number; isOpen: boolean; toggle: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05, duration: 0.4 }}
    className="group"
  >
    <div
      className={`
        relative overflow-hidden rounded-2xl border transition-all duration-500 cursor-pointer
        ${isOpen
          ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/20 border-blue-200/60 dark:border-blue-800/40 shadow-lg shadow-blue-500/10'
          : 'bg-white dark:bg-slate-800/60 border-border/40 hover:border-blue-200 dark:hover:border-blue-800/50 hover:shadow-md hover:shadow-blue-500/5'
        }
      `}
      style={{ perspective: '1000px' }}
    >
      {/* 3D Glow effect on hover */}
      <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'}`}>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl" />
      </div>

      <button
        onClick={toggle}
        className="relative z-10 w-full flex items-center gap-4 p-5 sm:p-6 text-left focus:outline-none"
      >
        {/* Animated Icon Container */}
        <motion.div
          animate={{
            rotateY: isOpen ? 180 : 0,
            scale: isOpen ? 1.1 : 1
          }}
          transition={{ duration: 0.5, type: 'spring' }}
          className={`
            shrink-0 h-11 w-11 rounded-xl flex items-center justify-center shadow-sm transition-colors duration-500
            ${isOpen
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/25'
              : 'bg-gray-100 dark:bg-slate-700/60 text-gray-500 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600'
            }
          `}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div style={{ backfaceVisibility: 'hidden' }}>
            {item.icon}
          </div>
        </motion.div>

        <div className="flex-1 min-w-0">
          <span className={`text-xs font-medium uppercase tracking-wider mb-1 block transition-colors duration-300 ${isOpen ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>
            {item.category}
          </span>
          <h3 className={`font-semibold text-base sm:text-lg transition-colors duration-300 ${isOpen ? 'text-blue-900 dark:text-blue-100' : 'text-foreground'}`}>
            {item.q}
          </h3>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300 ${isOpen ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-500'}`}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="relative z-10 px-5 sm:px-6 pb-6 pl-20 sm:pl-[5.5rem]">
              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-muted-foreground leading-relaxed text-sm sm:text-base"
              >
                {item.a}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);

export const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredFAQs = activeCategory === 'All'
    ? FAQ_DATA
    : FAQ_DATA.filter(f => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30 pt-12 pb-24">
      <SEOHead title="FAQ" description="Frequently Asked Questions about StyleHub." />

      {/* Hero Section with 3D floating elements */}
      <div className="relative overflow-x-clip">
        {/* Animated background spheres */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ y: [-20, 20, -20], x: [-10, 10, -10], rotateZ: [0, 5, -5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-10 left-[10%] w-64 h-64 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [15, -25, 15], x: [10, -15, 10] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-20 right-[15%] w-52 h-52 bg-purple-400/10 dark:bg-purple-400/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ y: [10, -10, 10], scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute -bottom-10 left-[40%] w-72 h-72 bg-indigo-400/10 dark:bg-indigo-400/5 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          {/* 3D floating icon */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, scale: 0.5, rotateX: 45 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.7, type: 'spring', bounce: 0.4 }}
          >
            <motion.div
              animate={{ rotateY: [0, 10, -10, 0], y: [-4, 4, -4] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/30"
              style={{ perspective: '600px', transformStyle: 'preserve-3d' }}
            >
              <HelpCircle className="h-10 w-10 text-white" />
            </motion.div>
          </motion.div>

          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-4">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Questions
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Find quick answers to the most common questions about our products, shipping, payments, and more.
            </p>
          </motion.div>

          {/* Category Pills */}
          <motion.div
            className="flex flex-wrap justify-center gap-2 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {CATEGORIES.filter(cat => cat === 'All' || FAQ_DATA.some(f => f.category === cat)).map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                  ${activeCategory === cat
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                    : 'bg-white dark:bg-slate-800 text-muted-foreground border border-border/50 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 hover:shadow-sm'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            <AnimatePresence mode="wait">
              {filteredFAQs.map((item, i) => (
                <AccordionItem
                  key={`${activeCategory}-${i}`}
                  item={item}
                  index={i}
                  isOpen={openIndex === i}
                  toggle={() => setOpenIndex(openIndex === i ? null : i)}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16"
          >
            <div className="relative overflow-hidden rounded-3xl border border-border/30">
              {/* 3D-perspectived background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
              <div className="absolute inset-0">
                <motion.div
                  animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-2xl"
                />
                <motion.div
                  animate={{ x: [0, -80, 0], y: [0, 60, 0] }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                  className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-2xl"
                />
              </div>

              <div className="relative z-10 p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Still have questions?
                  </h3>
                  <p className="text-blue-100/80 text-base md:text-lg max-w-md">
                    Our customer support team is available 24/7 to help you with anything.
                  </p>
                </div>
                <motion.a
                  href="/contact"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="shrink-0 px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/15 transition-shadow text-base"
                >
                  Contact Support →
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
