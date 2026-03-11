import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Check, Sparkles, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { api } from '../../lib/api';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { Button } from '../ui/button';
import { ProductCard } from '../products/ProductCard';

export const CartRecommendationModal = () => {
  const { isRecommendationModalOpen, closeRecommendationModal, lastAddedItem, items } = useCartStore();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecs = async () => {
      if (lastAddedItem) {
        // Get recommendations based on the last added item specifically
        // We'll wrap it in an array since getRecommendations expects that
        const recs = await api.products.getRecommendations([lastAddedItem as any]);
        setRecommendations(recs.slice(0, 4)); // Show top 4
      }
    };

    if (isRecommendationModalOpen) {
      fetchRecs();
      // Disable body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isRecommendationModalOpen, lastAddedItem]);

  if (!isRecommendationModalOpen || !lastAddedItem) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeRecommendationModal}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-3xl shadow-2xl border border-border"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Added to Cart</h2>
                <p className="text-sm text-muted-foreground">Successfully added to your shopping bag</p>
              </div>
            </div>
            <button
              onClick={closeRecommendationModal}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Added Item Summary */}
            <div className="flex flex-col sm:flex-row gap-6 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
              <div className="h-24 w-24 shrink-0 rounded-xl overflow-hidden border border-border">
                <img src={lastAddedItem.imageUrl} alt={lastAddedItem.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-bold text-lg">{lastAddedItem.name}</h3>
                <p className="text-blue-600 dark:text-blue-400 font-semibold">{formatPrice(lastAddedItem.price)}</p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{lastAddedItem.description}</p>
              </div>
              <div className="flex flex-col sm:justify-center gap-2">
                <Button 
                  onClick={() => {
                    closeRecommendationModal();
                    navigate('/cart');
                  }}
                  className="w-full sm:w-auto px-6 py-2 h-11"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" /> View Cart
                </Button>
                <Button 
                  variant="outline" 
                  onClick={closeRecommendationModal}
                  className="w-full sm:w-auto px-6 py-2 h-11"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    Complete the Look
                  </h3>
                  <div className="h-px flex-1 mx-4 bg-border" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {recommendations.map((product) => (
                    <div key={product.id} className="transform scale-95 hover:scale-100 transition-transform">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-muted/30 border-t border-border flex justify-center">
            <button 
              onClick={() => {
                closeRecommendationModal();
                navigate('/cart');
              }}
              className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2 hover:underline group"
            >
              Checkout Now <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
