import { useEffect, useState, useRef} from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Clock, ShieldCheck, Truck, RefreshCcw, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductCard } from '../components/products/ProductCard';
import { HomeFeaturedSkeleton } from '../components/ui/Skeleton';
import { api } from '../lib/api';
import { Product } from '../types';
import { SEOHead } from '../components/seo/SEOHead';

// ── Banner slides ──────────────────────────────────────────────────────────────
const BANNERS = [
  {
    id: 1,
    bg: 'from-[#2874f0] to-[#0c47a1]',
    badge: '🔥 Big Billion Days',
    title: 'Electronics Fest',
    sub: 'Up to 80% off on Mobiles, Laptops & more',
    cta: 'Shop Now',
    link: '/products?category=Electronics',
    img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80',
  },
  {
    id: 2,
    bg: 'from-[#ff6161] to-[#c0392b]',
    badge: '💥 Fashion Carnival',
    title: 'Style up to 70% Off',
    sub: 'Top brands • New arrivals • Exclusive deals',
    cta: 'Explore Now',
    link: '/products?category=Clothes',
    img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80',
  },
  {
    id: 3,
    bg: 'from-[#00897b] to-[#00574b]',
    badge: '🏠 Home Makeover Sale',
    title: 'Home & Living',
    sub: 'Furniture, decor & kitchen — all at jaw-drop prices',
    cta: 'Discover Deals',
    link: '/products?category=Home & Living',
    img: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&q=80',
  },
];

// ── Category quick links ───────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Electronics', icon: '📱', link: '/products?category=Electronics' },
  { name: 'Fashion', icon: '👗', link: '/products?category=Clothes' },
  { name: 'Home & Living', icon: '🛋️', link: '/products?category=Home+%26+Living' },
  { name: 'Sports', icon: '⚽', link: '/products?category=Sports' },
  { name: 'Beauty', icon: '💄', link: '/products?category=Skin+Care' },
  { name: 'Shoes', icon: '👟', link: '/products?category=Shoes' },
  { name: 'Jewellery', icon: '💍', link: '/products?category=Jewelry' },
  { name: 'View All', icon: '🔍', link: '/products' },
];

// ── Countdown hook ─────────────────────────────────────────────────────────────
function useCountdown(hours = 8) {
  const end = useRef(Date.now() + hours * 60 * 60 * 1000);
  const [time, setTime] = useState({ h: hours, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, end.current - Date.now());
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const pad = (n: number) => String(n).padStart(2, '0');

// ── Stable discount seeded from product ID (never re-rolls on re-render) ───────
function seededDiscount(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return (hash % 31) + 20; // 20–50%, deterministic per product
}

// ── Main Component ─────────────────────────────────────────────────────────────
export const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const countdown = useCountdown(7);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await api.products.list();
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Banner autoplay
  useEffect(() => {
    if (!isAutoplay) return;
    const id = setInterval(() => setBannerIdx(i => (i + 1) % BANNERS.length), 4000);
    return () => clearInterval(id);
  }, [isAutoplay]);

  const prevBanner = () => { setIsAutoplay(false); setBannerIdx(i => (i - 1 + BANNERS.length) % BANNERS.length); };
  const nextBanner = () => { setIsAutoplay(false); setBannerIdx(i => (i + 1) % BANNERS.length); };

  const featuredProducts = products.slice(0, 8);
  const dealProducts = products.slice(0, 6);
  const banner = BANNERS[bannerIdx];

  return (
    <div className="flex flex-col bg-[#f1f3f6] dark:bg-slate-950 min-h-screen">
      <SEOHead title="StyleHub - Premium E-Commerce" />

      {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
      <section className="w-full bg-white dark:bg-slate-900 shadow-sm">
        <div className="container mx-auto px-2 sm:px-4 py-2">
          <div className="relative rounded-xl overflow-hidden" style={{ minHeight: 220 }}>

            <AnimatePresence mode="wait">
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                className={`bg-gradient-to-r ${banner.bg} flex flex-col md:flex-row items-center justify-between px-6 sm:px-10 md:px-16 py-8 md:py-10 gap-6 min-h-[220px] md:min-h-[300px]`}
              >
                {/* Text side */}
                <div className="flex-1 text-white z-10">
                  <span className="inline-block text-xs font-black uppercase tracking-widest bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-3">
                    {banner.badge}
                  </span>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-2 drop-shadow-lg">
                    {banner.title}
                  </h1>
                  <p className="text-white/80 text-sm sm:text-base mb-6 max-w-sm font-medium">
                    {banner.sub}
                  </p>
                  <Link to={banner.link}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      className="bg-[#FFD700] text-slate-900 font-black text-sm px-7 py-2.5 rounded-full shadow-lg hover:brightness-105 transition-all"
                    >
                      {banner.cta} →
                    </motion.button>
                  </Link>
                </div>

                {/* Image side */}
                <div className="flex-shrink-0 w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px]">
                  <motion.img
                    key={banner.img}
                    initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5 }}
                    src={banner.img}
                    alt=""
                    className="w-full h-40 md:h-56 object-cover rounded-2xl shadow-2xl ring-4 ring-white/20"
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Prev / Next */}
            <button onClick={prevBanner} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-lg flex items-center justify-center z-20 hover:bg-white transition">
              <ChevronLeft className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            </button>
            <button onClick={nextBanner} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-lg flex items-center justify-center z-20 hover:bg-white transition">
              <ChevronRight className="h-4 w-4 text-slate-700 dark:text-slate-300" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
              {BANNERS.map((_, i) => (
                <button key={i} onClick={() => { setIsAutoplay(false); setBannerIdx(i); }}
                  className={`rounded-full transition-all duration-300 ${i === bannerIdx ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ────────────────────────────────────────────────── */}
      <section className="w-full bg-white dark:bg-slate-900 border-b border-border/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/20">
            {[
              { icon: Truck, label: 'Free Delivery', sub: 'On orders over ₹499' },
              { icon: RefreshCcw, label: 'Easy Returns', sub: '10-day return policy' },
              { icon: ShieldCheck, label: '100% Secure', sub: 'Payments & Data' },
              { icon: Headphones, label: '24/7 Support', sub: 'Dedicated team' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-[#2874f0]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORY QUICK LINKS ────────────────────────────────────────── */}
      <section className="w-full bg-white dark:bg-slate-900 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 sm:gap-2">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={cat.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={cat.link} className="group flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-xl hover:bg-blue-50/60 dark:hover:bg-blue-900/10 transition-colors cursor-pointer">
                  <motion.span whileHover={{ scale: 1.18, rotate: [0, -8, 8, 0] }} transition={{ duration: 0.35 }} className="text-2xl sm:text-3xl">
                    {cat.icon}
                  </motion.span>
                  <span className="text-[10px] sm:text-xs font-bold text-center text-foreground group-hover:text-[#2874f0] transition-colors leading-tight">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEAL OF THE DAY ─────────────────────────────────────────────── */}
      <section className="w-full bg-white dark:bg-slate-900 shadow-sm mt-3">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-black text-foreground uppercase tracking-tight">Deal of the Day</h2>
              <div className="flex items-center gap-1.5 bg-slate-900 dark:bg-slate-700 text-white px-3 py-1.5 rounded-lg">
                <Clock className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                <div className="flex items-center gap-1 text-xs font-black font-mono">
                  <span className="bg-white/10 px-1 py-0.5 rounded">{pad(countdown.h)}</span>
                  <span className="text-yellow-400">:</span>
                  <span className="bg-white/10 px-1 py-0.5 rounded">{pad(countdown.m)}</span>
                  <span className="text-yellow-400">:</span>
                  <span className="bg-white/10 px-1 py-0.5 rounded">{pad(countdown.s)}</span>
                </div>
                <span className="text-[9px] text-white/50 ml-1 hidden sm:block">LEFT</span>
              </div>
            </div>
            <Link to="/products" className="flex items-center gap-1 text-[#2874f0] hover:text-blue-700 font-bold text-xs sm:text-sm transition-colors">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <HomeFeaturedSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {dealProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className={idx >= 3 ? 'hidden md:block' : ''}
                >
                  <Link to={`/products/${product.id}`} className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-border/40 hover:border-[#2874f0]/40 hover:shadow-md transition-all bg-white dark:bg-slate-800">
                    <div className="w-full aspect-square bg-gray-50 dark:bg-slate-700 rounded-lg overflow-hidden">
                      <img
                        src={(product as any).imageUrl || (product as any).image_url}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-1"
                      />
                    </div>
                    <p className="text-[11px] font-bold text-center text-foreground line-clamp-2 leading-tight w-full">{product.name}</p>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-sm font-black text-[#2874f0]">₹{((product as any).price ?? 0).toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-bold text-green-600">{seededDiscount(product.id)}% off</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── OFFER BANNERS (2-col) ────────────────────────────────────────── */}
      <section className="w-full mt-3">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { bg: 'from-[#ff6161] to-[#c0392b]', title: 'Fashion Sale', sub: 'Up to 70% Off', cta: 'Shop Fashion', link: '/products?category=Clothes', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&q=80' },
              { bg: 'from-[#2874f0] to-[#0c47a1]', title: 'Electronics Fest', sub: 'Grab the Best Deals', cta: 'Shop Electronics', link: '/products?category=Electronics', img: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&q=80' },
            ].map((b) => (
              <Link key={b.title} to={b.link}>
                <motion.div
                  whileHover={{ scale: 1.015 }}
                  className={`bg-gradient-to-r ${b.bg} flex items-center justify-between rounded-xl overflow-hidden px-6 py-5 gap-4 cursor-pointer shadow-sm`}
                >
                  <div className="text-white">
                    <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-1">{b.sub}</p>
                    <h3 className="text-xl sm:text-2xl font-black leading-tight mb-3">{b.title}</h3>
                    <span className="inline-flex items-center gap-1 bg-[#FFD700] text-slate-900 text-xs font-black px-4 py-1.5 rounded-full">
                      {b.cta} →
                    </span>
                  </div>
                  <img src={b.img} alt="" className="w-24 sm:w-28 h-20 sm:h-24 object-cover rounded-xl flex-shrink-0 shadow-xl ring-2 ring-white/20" />
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING NOW ────────────────────────────────────────────────── */}
      <section className="w-full bg-white dark:bg-slate-900 shadow-sm mt-3">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-7 bg-[#2874f0] rounded-full" />
              <h2 className="text-lg sm:text-xl font-black text-foreground uppercase tracking-tight">Trending Now</h2>
              <span className="text-[10px] bg-[#2874f0] text-white px-2 py-0.5 rounded-full font-bold uppercase">Top Rated</span>
            </div>
            <Link to="/products" className="flex items-center gap-1 text-[#2874f0] hover:text-blue-700 font-bold text-xs sm:text-sm transition-colors">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <HomeFeaturedSkeleton count={8} />
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {featuredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  className={idx >= 6 ? 'hidden sm:block' : ''}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-5%' }}
                  transition={{ delay: idx * 0.06, duration: 0.45, ease: 'easeOut' }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <p className="text-muted-foreground">No products available. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── BOTTOM CTA STRIP ────────────────────────────────────────────── */}
      <section className="w-full mt-3 mb-4">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-[#2874f0] to-[#0c47a1] rounded-2xl px-6 sm:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-lg">
            <div>
              <h3 className="text-xl sm:text-2xl font-black mb-1">Explore All Products</h3>
              <p className="text-white/70 text-sm">Thousands of products across every category</p>
            </div>
            <Link to="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="bg-[#FFD700] text-slate-900 font-black text-sm px-8 py-3 rounded-full shadow-lg hover:brightness-105 transition-all whitespace-nowrap"
              >
                Browse All →
              </motion.button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};