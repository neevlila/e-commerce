import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../../types';
import { Button } from '../ui/button';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { StarRating } from '../ui/StarRating';
import { BookmarkIconButton } from '../ui/bookmark-icon-button';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// ✅ PERFORMANCE: Wrapped in React.memo so the card only re-renders when its
// own `product` prop changes — not when parent filter/sort state updates.
export const ProductCard = React.memo(({ product }: { product: Product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️');
  };

  return (
    <Link to={`/products/${product.id}`} className="group block h-full">
      {/* ✅ PERFORMANCE: whileHover only — no layout animation on individual cards.
          Framer Motion layout animations on 100+ cards causes massive re-paints.
          The parent grid handles layout transitions instead. */}
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-xl border border-border overflow-hidden hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 h-full flex flex-col"
      >
        <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-slate-900 relative">
          {/* ✅ SECURITY + PERFORMANCE: lazy loading prevents 100+ images firing at once.
              decoding="async" offloads image decoding off the main thread. */}
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
            <span className="text-white font-medium text-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              View Details
            </span>
          </div>

          {/* Wishlist heart button */}
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <BookmarkIconButton
              isSaved={wishlisted}
              onClick={handleWishlist}
              className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-md h-9 w-9"
            />
          </div>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="flex flex-col 2xl:flex-row justify-between items-start 2xl:items-center mb-1 2xl:mb-2 gap-1 2xl:gap-2 overflow-hidden w-full">
            <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider truncate max-w-full">
              {product.category}
            </p>
            <div className="flex items-center gap-1 shrink-0">
              <StarRating rating={product.rating || 0} size={12} />
              <span className="text-[10px] text-muted-foreground">({product.reviewCount || 0})</span>
            </div>
          </div>

          <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>

          <div className="mt-auto pt-4 flex flex-col sm:flex-row items-center sm:justify-between gap-3">
            <span className="text-base sm:text-lg font-bold text-foreground self-start sm:self-auto">
              ₹{product.price.toLocaleString()}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddToCart}
              className="w-full sm:w-auto border border-border/80 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-sm"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';