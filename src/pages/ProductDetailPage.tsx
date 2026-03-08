import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { Product, Review } from '../types';
import { Button } from '../components/ui/Button';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { formatPrice } from '../lib/utils';
import { ShoppingCart, Check, Loader2, ArrowLeft, Shield, Truck, MessageSquare, Heart, FolderOpen } from 'lucide-react';
import { SEOHead } from '../components/seo/SEOHead';
import { ProductCard } from '../components/products/ProductCard';
import { StarRating } from '../components/ui/StarRating';
import { BookmarkIconButton } from '../components/ui/bookmark-icon-button';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
          setRelatedProducts(
            allProducts
              .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
              .slice(0, 4)
          );
          
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
      addItem(product);
      toast.success('Added to cart');
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!user) {
      toast.error('Please login to purchase');
      navigate('/login', { state: { from: location } });
      return;
    }
    navigate('/checkout', { state: { directCheckout: { ...product, quantity: 1 } } });
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

  if (loading) return <div className="flex h-[50vh] justify-center items-center"><Loader2 className="animate-spin text-blue-600" /></div>;
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

        <div className="space-y-8">
          <div>
            <span className="text-blue-600 dark:text-blue-400 font-medium text-sm tracking-wide uppercase">{product.category}</span>
            <h1 className="text-4xl font-bold text-foreground mt-2 leading-tight">{product.name}</h1>
            <div className="flex items-center gap-2 mt-3">
                <StarRating rating={product.rating || 0} size={20} />
                <span className="text-muted-foreground text-sm">({reviews.length} reviews)</span>
            </div>
          </div>
          
          <div className="flex items-baseline gap-4">
            <p className="text-4xl font-bold text-foreground">{formatPrice(product.price)}</p>
            <span className="text-sm text-muted-foreground">Inclusive of all taxes</span>
          </div>
          
          <div className="prose dark:prose-invert text-muted-foreground leading-relaxed">
            <p>{product.description}</p>
          </div>

          <div className="flex flex-col gap-3 py-6 border-y border-border">
            <div className="flex items-center text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 w-fit px-3 py-1 rounded-full text-sm font-medium">
              <Check className="h-4 w-4 mr-2" /> In Stock ({product.stock} units)
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <Truck className="h-4 w-4 mr-2" /> Free Delivery by {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </div>
            <div className="flex items-center text-muted-foreground text-sm">
              <Shield className="h-4 w-4 mr-2" /> 1 Year Warranty Included
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="w-full sm:w-auto min-w-[200px] h-14 text-lg shadow-lg shadow-blue-600/20" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
            <Button size="lg" className="w-full sm:w-auto min-w-[200px] h-14 text-lg bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg shadow-pink-500/20" onClick={handleBuyNow}>
              Buy Now
            </Button>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
        </section>
      )}
    </div>
  );
};
