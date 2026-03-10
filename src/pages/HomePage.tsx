import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';
import { Button } from '../components/ui/button';
import { InteractiveHoverButton } from '../components/ui/InteractiveHoverButton';
import { HomeFeaturedSkeleton } from '../components/ui/Skeleton';
import { ProductCard } from '../components/products/ProductCard';
import { api } from '../lib/api';
import { Product } from '../types';
import { SEOHead } from '../components/seo/SEOHead';

// --- Parallax Hero wrapper ---
function useHeroParallax(scrollY: MotionValue<number>) {
  const y = useTransform(scrollY, [0, 700], [0, -140]);
  const scale = useTransform(scrollY, [0, 700], [1, 0.94]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const rotateX = useTransform(scrollY, [0, 700], [0, 10]);
  return { y, scale, opacity, rotateX };
}

export const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { scrollY } = useScroll();
  const hero = useHeroParallax(scrollY);

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

  const featuredProducts = products.slice(0, 8);

  return (
    <div className="flex flex-col relative w-full bg-background">
      <SEOHead title="StyleHub - Premium E-Commerce" />

      {/* ── HERO — parallax push-away on scroll ── */}
      <motion.section
        style={{
          y: hero.y,
          scale: hero.scale,
          opacity: hero.opacity,
          rotateX: hero.rotateX,
          transformOrigin: 'bottom center',
        }}
        className="sticky top-0 z-0 w-full h-[100dvh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white pt-16 sm:pt-20 md:pt-16"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80')] bg-cover bg-center opacity-50 dark:opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-slate-900/40 to-slate-900/80 dark:from-slate-950/40 dark:via-slate-950/60 dark:to-slate-950/90" />

        <div className="w-full container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 py-8 sm:py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 sm:mb-8 tracking-tight leading-tight"
            >
              Discover{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Extraordinary
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 dark:text-gray-300 mb-8 sm:mb-12 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed font-light px-2"
            >
              Curated collections of premium electronics, fashion, and lifestyle
              essentials. Elevate your everyday with StyleHub.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="flex flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 mt-2"
            >
              <Link to="/products">
                <InteractiveHoverButton text="Start Shopping" />
              </Link>
              <Link to="/products?category=Electronics">
                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-full h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base border border-white/40 text-white hover:bg-white/15 hover:text-white dark:border-white/30 dark:hover:bg-white/10 backdrop-blur-sm transition-all duration-300 whitespace-nowrap"
                >
                  Explore Tech
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50"
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-0.5 h-6 bg-white/30 rounded-full"
          />
        </motion.div>
      </motion.section>

      {/* ── CATEGORIES ── */}
      <section className="sticky top-0 z-10 w-full min-h-[100dvh] flex flex-col justify-center bg-background transition-colors duration-300 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] border-t border-border/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Find exactly what you're looking for
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {['Electronics', 'Fashion', 'Home & Living', 'Sports'].map((cat, i) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, rotateY: -15, z: -80 }}
                whileInView={{ opacity: 1, rotateY: 0, z: 0 }}
                viewport={{ once: false, margin: '-8%' }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                style={{ transformPerspective: 900 }}
                whileHover={{ scale: 1.04, rotateY: 3, z: 20 }}
              >
                <Link
                  to={`/products?category=${encodeURIComponent(cat === 'Fashion' ? 'Clothes' : cat)}`}
                  className="group relative h-40 sm:h-48 md:h-64 rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer block"
                >
                  <img
                    src={[
                      'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&q=80',
                      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
                      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80',
                      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80',
                    ][i]}
                    alt={cat}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <h3 className="text-white text-base sm:text-lg md:text-xl font-bold tracking-wide text-center px-2">
                      {cat}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="relative z-20 w-full flex flex-col justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pt-16 md:pt-24 pb-8 md:pb-12 border-t border-border/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-foreground">Trending Now</h2>
              <p className="text-muted-foreground">Top rated products by our community</p>
            </div>
            <Link
              to="/products"
              className="hidden md:flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <HomeFeaturedSkeleton count={8} />
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {featuredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  className={idx >= 6 ? 'hidden sm:block' : ''}
                  initial={{ opacity: 0, y: 40, rotateX: 20, z: -60 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0, z: 0 }}
                  viewport={{ once: false, margin: '-5%' }}
                  transition={{ delay: idx * 0.06, duration: 0.55, ease: 'easeOut' }}
                  style={{ transformPerspective: 900 }}
                  whileHover={{ y: -6, scale: 1.03, rotateX: -4 }}
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
    </div>
  );
};
