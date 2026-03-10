import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CartPage = () => {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-blue-400 dark:text-blue-300" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">Looks like you haven't added anything yet.</p>
          <Link to="/products">
            <Button size="lg">Start Shopping <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-4 p-4 bg-card border border-border rounded-2xl dark:bg-slate-800/60 dark:border-slate-700 hover:border-blue-500/30 dark:hover:border-blue-400/30 transition-colors duration-200"
              >
                {/* Image */}
                <Link to={`/products/${item.id}`} className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted dark:bg-slate-700 border border-border dark:border-slate-700 cursor-pointer hover:opacity-90 transition-opacity">
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                </Link>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link to={`/products/${item.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                      </Link>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-0.5 flex items-center gap-2">
                        {item.category}
                        {item.size && (
                          <span className="text-muted-foreground text-xs font-semibold px-1.5 py-0.5 rounded bg-muted/50 border border-border">
                            Size: {item.size}
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="font-bold text-foreground text-lg">{formatPrice(item.price * item.quantity)}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Qty Controls */}
                    <div className="flex items-center border border-border dark:border-slate-600 rounded-xl overflow-hidden bg-background dark:bg-slate-900">
                      <button
                        className="px-3 py-1.5 hover:bg-muted dark:hover:bg-slate-700 text-foreground transition-colors"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-4 py-1.5 text-sm font-semibold text-foreground border-x border-border dark:border-slate-600 min-w-[2.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        className="px-3 py-1.5 hover:bg-muted dark:hover:bg-slate-700 text-foreground transition-colors"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-sm font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="bg-card dark:bg-slate-800/60 border border-border dark:border-slate-700 p-6 rounded-2xl sticky top-24"
          >
            <h2 className="text-lg font-bold text-foreground mb-5">Order Summary</h2>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} items)</span>
                <span className="font-semibold text-foreground">{formatPrice(total())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-500 dark:text-green-400 font-semibold">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (est.)</span>
                <span className="font-semibold text-foreground">{formatPrice(total() * 0.08)}</span>
              </div>
            </div>
            <div className="border-t border-border dark:border-slate-700 pt-4 mb-5 flex justify-between font-bold text-lg text-foreground">
              <span>Total</span>
              <span>{formatPrice(total() * 1.08)}</span>
            </div>
            <Button className="w-full" size="lg" onClick={() => navigate('/checkout')}>
              Checkout <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Link to="/products" className="block text-center mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Continue shopping
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
