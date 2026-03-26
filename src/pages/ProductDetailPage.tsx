import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { Product, Review } from '../types';
import { Button } from '../components/ui/button';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { formatPrice } from '../lib/utils';
import { ShoppingCart, Check, Loader2, ArrowLeft, Shield, Truck, MessageSquare, Heart, FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import { ProductCard } from '../components/products/ProductCard';
import { StarRating } from '../components/ui/StarRating';
import { BookmarkIconButton } from '../components/ui/bookmark-icon-button';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// ── Stable discount seeded from product ID (stays in sync with HomePage) ──────
function seededDiscount(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return (hash % 31) + 20; // 20–50%, deterministic per product
}

// ─── Wishlist folder picker ───────────────────
function WishlistPicker({
  productId,
  onClose,
}: {
  productId: string;
  onClose: () => void;
}) {
  const { folders, items, moveItemToFolder, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(productId);
  const currentItem = items.find((i) => i.id === productId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.18 }}
      className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-2xl shadow-2xl min-w-[200px] py-2 overflow-hidden"
    >
      <p className="px-4 py-1 text-[11px] text-muted-foreground font-semibold uppercase tracking-widest">
        Save to collection
      </p>
      <button
        onClick={() => {
          if (wishlisted) {
            moveItemToFolder(productId, null);
            toast.success('Moved to All items');
          }
          onClose();
        }}
        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 hover:bg-muted dark:hover:bg-slate-700 transition-colors ${
          currentItem?.folderId === null && wishlisted
            ? 'text-pink-600 dark:text-pink-400 font-medium'
            : 'text-foreground'
        }`}
      >
        <Heart className="w-4 h-4 text-pink-400 fill-pink-400" /> All items
        {currentItem?.folderId === null && wishlisted && (
          <Check className="w-3.5 h-3.5 ml-auto text-pink-500" />
        )}
      </button>

      {folders.length > 0 && <div className="border-t border-border dark:border-slate-700 my-1" />}
      {folders.map((folder) => {
        const inFolder = currentItem?.folderId === folder.id;
        return (
          <button
            key={folder.id}
            onClick={() => {
              if (wishlisted) {
                moveItemToFolder(productId, folder.id);
              }
              toast.success(`Saved to "${folder.name}"`);
              onClose();
            }}
            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 hover:bg-muted dark:hover:bg-slate-700 transition-colors ${
              inFolder ? 'font-medium text-blue-600 dark:text-blue-400' : 'text-foreground'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{folder.name}</span>
            {inFolder && <Check className="w-3.5 h-3.5 ml-auto text-blue-500 flex-shrink-0" />}
          </button>
        );
      })}
    </motion.div>
  );
}

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);
  const { isWishlisted, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const wishlisted = product ? isWishlisted(product.id) : false;
  const [showWishlistPicker, setShowWishlistPicker] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  
  const isClothing = product ? ['clothing', 'clothes', 'apparel', 'fashion'].includes(product.category.toLowerCase()) : false;
  const isShoes = product ? ['shoes'].includes(product.category.toLowerCase()) : false;
  const requiresSize = isClothing || isShoes;

  // Review Form State
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const currentProduct = await api.products.get(id);
        setProduct(currentProduct || null);

        if (currentProduct) {
          const allProducts = await api.products.list();
          let related = allProducts.filter(p => p.id !== currentProduct.id);
          
          if (currentProduct.category.toLowerCase() === 'shoes') {
             // If viewing shoes, suggest other shoes (matching gender if possible)
             let shoeSuggestions = related.filter(p => p.category.toLowerCase() === 'shoes');
             if (currentProduct.subCategory) {
                 shoeSuggestions = shoeSuggestions.filter(p => p.subCategory === currentProduct.subCategory);
             }
             related = shoeSuggestions.sort(() => 0.5 - Math.random());
          } else if (['clothing', 'clothes', 'apparel', 'fashion'].includes(currentProduct.category.toLowerCase())) {
             // For clothes, strictly suggest other clothes of the exact same gender (subCategory)
             related = related.filter(p => 
               ['clothing', 'clothes', 'apparel', 'fashion'].includes(p.category.toLowerCase()) && 
               p.subCategory === currentProduct.subCategory
             );
             related = related.sort(() => 0.5 - Math.random());
          } else if (currentProduct.category.toLowerCase() === 'electronics') {
             // For Electronics, suggest other tech (same category or peripherals)
             related = related.filter(p => 
               p.category.toLowerCase() === 'electronics' || 
               p.name.toLowerCase().includes('keyboard') || 
               p.name.toLowerCase().includes('mouse') ||
               p.name.toLowerCase().includes('monitor')
             );
             related = related.sort(() => 0.5 - Math.random());
          } else {
             // For Home, Jewelry, Sports, etc. suggest from exact same category
             related = related.filter(p => p.category.toLowerCase() === currentProduct.category.toLowerCase());
             related = related.sort(() => 0.5 - Math.random());
          }
          
          setRelatedProducts(related.slice(0, 15));
          
          const productReviews = await api.reviews.list(id);
          setReviews(productReviews);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!showWishlistPicker) return;
    const handler = (e: MouseEvent) => {
      const el = document.getElementById('wishlist-picker-anchor');
      if (el && !el.contains(e.target as Node)) setShowWishlistPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showWishlistPicker]);

  const handleWishlistClick = () => {
    if (!product) return;
    if (!wishlisted) {
      addToWishlist(product, null);
      toast.success('Added to wishlist ❤️');
      setShowWishlistPicker(true);
    } else {
      removeFromWishlist(product.id);
      setShowWishlistPicker(false);
      toast.success('Removed from wishlist');
    }
  };

  const handleAddToCart = () => {
    if (product) {
      if (requiresSize && !selectedSize) {
        toast.error('Please select a size');
        return;
      }
      addItem({ ...product, size: requiresSize ? selectedSize : undefined } as any);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (requiresSize && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (!user) {
      toast.error('Please login to purchase');
      navigate('/login', { state: { from: location } });
      return;
    }
    navigate('/checkout', { state: { directCheckout: { ...product, quantity: 1, size: requiresSize ? selectedSize : undefined } } });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast.error("Please login to write a review");
        navigate('/login', { state: { from: location } });
        return;
    }
    if (rating === 0) {
        toast.error("Please select a rating");
        return;
    }

    setSubmittingReview(true);
    try {
        const newReview = await api.reviews.add({
            userId: user.id,
            userName: user.name,
            productId: product!.id,
            rating,
            comment
        });
        
        const updatedReviews = [newReview, ...reviews];
        setReviews(updatedReviews);
        
        // Calculate new average rating locally for immediate feedback
        const totalRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
        const newAverage = totalRating / updatedReviews.length;
        
        setProduct(prev => prev ? { ...prev, rating: newAverage, reviewCount: updatedReviews.length } : null);

        setRating(0);
        setComment('');
        toast.success("Review submitted successfully!");
    } catch (error: any) {
        toast.error(error.message || "Failed to submit review");
    } finally {
        setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="h-10 w-24 bg-gray-200 dark:bg-slate-700 rounded-lg mb-6"></div>
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="bg-gray-200 dark:bg-slate-700 rounded-2xl aspect-square w-full"></div>
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-border/60 shadow-sm flex flex-col space-y-6">
              <div>
                <div className="h-4 w-20 bg-gray-300 dark:bg-slate-600 rounded mb-4"></div>
                <div className="h-8 w-3/4 bg-gray-300 dark:bg-slate-600 rounded mb-4"></div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="pt-4 border-t border-border/40">
                <div className="h-12 w-40 bg-gray-300 dark:bg-slate-600 rounded mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <div className="h-14 flex-1 bg-gray-300 dark:bg-slate-600 rounded-lg"></div>
                <div className="h-14 flex-1 bg-gray-300 dark:bg-slate-600 rounded-lg"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="flex flex-col gap-4 py-6 border-y border-border">
              <div className="h-6 w-1/3 bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="h-6 w-1/2 bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="h-6 w-2/5 bg-gray-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!product) return <div className="container mx-auto px-4 py-8">Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <SEOHead title={product.name} description={product.description} image={product.imageUrl} />
      
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 hover:bg-gray-100 dark:hover:bg-slate-800">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        {/* Fixed: Added md: prefix to sticky and top-24 so it only applies on desktop */}
        <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-border h-fit md:sticky md:top-24 relative" id="wishlist-picker-anchor">
          <img src={product.imageUrl} alt={product.name} className="w-full h-auto object-cover aspect-square" />
          
          <div className="absolute top-4 right-4">
            <BookmarkIconButton isSaved={wishlisted} onClick={handleWishlistClick} />
            <AnimatePresence>
              {showWishlistPicker && (
                <WishlistPicker productId={product.id} onClose={() => setShowWishlistPicker(false)} />
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-8 flex flex-col h-full">
          {/* Gestalt Principle: Law of Proximity (Buy Box) */}
          <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-border/60 shadow-sm flex flex-col space-y-6">
            <div>
              <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs tracking-widest uppercase">{product.category}</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mt-2 leading-tight">{product.name}</h1>
              <div className="flex items-center gap-3 mt-4">
                  <StarRating rating={product.rating || 0} size={18} />
                  <span className="text-muted-foreground text-sm font-medium">({Math.max(product.reviewCount || 0, reviews.length)} customer reviews)</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/40">
              {(() => {
                const discount = seededDiscount(product.id);
                const discountedPrice = Math.round(product.price * (1 - discount / 100));
                return (
                  <div className="flex flex-wrap items-end gap-3">
                    <p className="text-5xl font-black text-foreground tracking-tight">
                      {formatPrice(discountedPrice)}
                    </p>
                    <div className="flex items-end gap-2 mb-1.5">
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-sm font-black text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-md">
                        {discount}% off
                      </span>
                    </div>
                  </div>
                );
              })()}
              <span className="text-xs text-muted-foreground mt-1 block">Inclusive of all taxes</span>
            </div>

            {requiresSize && (
              <div className="pt-2">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-sm">Select Size</span>
                  <button className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(isShoes ? ['6', '7', '8', '9', '10', '11', '12'] : ['S', 'M', 'L', 'XL', 'XXL']).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 min-w-[3rem] px-4 rounded-xl border border-border flex items-center justify-center text-sm font-semibold transition-all ${
                        selectedSize === size
                          ? 'bg-foreground text-background border-foreground shadow-md scale-105'
                          : 'bg-background hover:border-foreground/50 text-foreground'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-2 flex flex-col sm:flex-row gap-4">
              <Button size="lg" className=" h-16 w-full sm:h-14 text-[17px] sm:text-base font-semibold shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 transition-transform" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5 sm:h-6 sm:w-6" /> Add to Cart
              </Button>
              <Button size="lg" className=" h-16 w-full sm:h-14 text-[17px] sm:text-base font-semibold bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg shadow-pink-500/20 hover:-translate-y-0.5 transition-transform" onClick={handleBuyNow}>
                Buy Now
              </Button>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-base">
            <p>{product.description}</p>
          </div>

          <div className="flex flex-col gap-4 py-6 border-y border-border">
            <div className="flex items-center text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 w-fit px-4 py-2 rounded-lg text-sm font-semibold border border-green-200 dark:border-green-800/30">
              <Check className="h-4 w-4 mr-2" /> In Stock ({product.stock} units)
            </div>
            <div className="flex items-center text-muted-foreground text-sm font-medium">
              <Truck className="h-5 w-5 mr-3 text-blue-500" /> Free Delivery by {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </div>
            <div className="flex items-center text-muted-foreground text-sm font-medium">
              <Shield className="h-5 w-5 mr-3 text-blue-500" /> 1 Year Warranty Included
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-border pt-12 mb-16">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-600" /> Customer Reviews
        </h2>

        <div className="grid md:grid-cols-3 gap-12">
            {/* Write Review Form */}
            <div className="md:col-span-1">
                <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl border border-border">
                    <h3 className="font-semibold text-lg mb-4">Write a Review</h3>
                    {user ? (
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Rating</label>
                                <StarRating rating={rating} size={24} interactive onRatingChange={setRating} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Comment</label>
                                <textarea 
                                    className="w-full p-3 rounded-md border border-input bg-background dark:bg-slate-900 min-h-[100px] focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Share your thoughts..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" isLoading={submittingReview}>Submit Review</Button>
                        </form>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground mb-4">Please login to write a review.</p>
                            <Button variant="outline" onClick={() => navigate('/login')}>Login Now</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews List */}
            <div className="md:col-span-2 space-y-6">
                {reviews.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-xl">
                        <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="border-b border-border pb-6 last:border-0">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                                        {review.userName.charAt(0)}
                                    </div>
                                    <span className="font-semibold">{review.userName}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="mb-2">
                                <StarRating rating={review.rating} size={14} />
                            </div>
                            <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="border-t border-border pt-12">
            <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
            <div className="relative group">
               <button 
                  onClick={() => {
                     document.getElementById('similar-products-scroll')?.scrollBy({ left: -320, behavior: 'smooth' });
                  }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden group-hover:flex bg-white dark:bg-slate-800 shadow-xl border border-border rounded-full p-2 h-12 w-12 text-foreground items-center justify-center -ml-4 sm:-ml-6 hover:scale-105 transition-transform"
               >
                 <ChevronLeft className="h-6 w-6" />
               </button>

               <div 
                  id="similar-products-scroll" 
                  className="flex overflow-x-auto gap-6 pb-6 px-2 scroll-smooth snap-x snap-mandatory" 
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
               >
                 {/* Webkit scrollbar hiding injected via tailwind utilities or inline style won't perfectly work for webkit without a tag, 
                     but standard scrollbarWidth: none works in Firefox. To ensure neatness, tailwind plugins usually provide hide-scrollbar. */}
                 <style dangerouslySetInnerHTML={{__html: `\n#similar-products-scroll::-webkit-scrollbar { display: none; }\n`}} />
                 
                 {relatedProducts.map(p => (
                    <div key={p.id} className="w-[280px] sm:w-[320px] shrink-0 snap-start">
                       <ProductCard product={p} />
                    </div>
                 ))}
               </div>

               <button 
                  onClick={() => {
                     document.getElementById('similar-products-scroll')?.scrollBy({ left: 320, behavior: 'smooth' });
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden group-hover:flex bg-white dark:bg-slate-800 shadow-xl border border-border rounded-full p-2 h-12 w-12 text-foreground items-center justify-center -mr-4 sm:-mr-6 hover:scale-105 transition-transform"
               >
                 <ChevronRight className="h-6 w-6" />
               </button>
            </div>
        </section>
      )}
    </div>
  );
};