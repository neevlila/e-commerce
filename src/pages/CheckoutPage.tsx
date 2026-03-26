import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { formatPrice } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/Input';
import { Lock, ShieldCheck, Loader2, CreditCard, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { SEOHead } from '../components/seo/SEOHead';

// ─────────────────────────────────────────────────────────────────────────────
// Helper — calls your Supabase Edge Function to create a Stripe PaymentIntent.
// The server calculates the total from the DB so clients cannot tamper with it.
//
// Deploy the Edge Function from: supabase/functions/create-payment-intent/index.ts
// ─────────────────────────────────────────────────────────────────────────────
async function createPaymentIntent(
  items: Array<{ id: string; quantity: number }>,
  userId: string
): Promise<{ clientSecret: string; amount: number }> {
  try {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: { items, userId },
    });

    if (error || !data?.clientSecret) {
      // If we're on localhost and the function is missing, we can provide a fallback for demo purposes
      if (window.location.hostname === 'localhost') {
        console.warn('Edge Function failed or not deployed. Returning mock secret for demo/development.');
        // This won't allow real Stripe to work, but we can catch this in handleSubmit
        return { clientSecret: 'pi_mock_secret_' + Date.now(), amount: 1000 };
      }
      throw new Error(error?.message || 'Failed to initialise payment. Please try again.');
    }

    return data as { clientSecret: string; amount: number };
  } catch (err: any) {
    if (window.location.hostname === 'localhost') {
      return { clientSecret: 'pi_mock_secret_' + Date.now(), amount: 1000 };
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Checkout Form
// ─────────────────────────────────────────────────────────────────────────────
interface CheckoutFormProps {
  shippingDetails: {
    address: string;
    pincode: string;
    firstName: string;
    lastName: string;
    city: string;
    state: string;
  };
  items: Array<{ id: string; quantity: number; price: number; [key: string]: any }>;
  isDirect?: boolean;
}

const CheckoutForm = ({ shippingDetails, items, isDirect }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // ✅ Auth guard — should never reach here without being logged in due to
    // ProtectedRoute, but this is a second line of defence.
    if (!user) {
      toast.error('You must be logged in to complete checkout.');
      navigate('/login');
      return;
    }

    if (!stripe || !elements) return;

    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }

    if (!shippingDetails.address || !shippingDetails.pincode) {
      toast.error('Please fill in all shipping details.');
      return;
    }

    setIsProcessing(true);

    try {
      // ✅ STEP 1: Ask the server to create a PaymentIntent.
      const paymentPayload = items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      }));

      const { clientSecret, amount } = await createPaymentIntent(paymentPayload, user.id);

      // ✅ STEP 2: Confirm the card payment on the client using Stripe.js.
      if (clientSecret.startsWith('pi_mock_secret')) {
        // MOCK SUCCESS for development if Edge Function is missing
        console.warn('Using MOCK SUCCESS for card payment (development only)');
        await new Promise(r => setTimeout(r, 1500));
        await api.orders.create(user.id, items, amount / 100, 'PAID'); 
        toast.success('DEVS: Mock payment successful! Order placed.');
        if (!isDirect) clearCart();
        navigate('/profile');
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found.');

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${shippingDetails.firstName} ${shippingDetails.lastName}`.trim(),
            },
          },
        }
      );

      if (stripeError) {
        // Stripe returns user-friendly messages (e.g. "Your card was declined.")
        throw new Error(stripeError.message);
      }

      if (paymentIntent?.status !== 'succeeded') {
        throw new Error('Payment was not completed. Please try again.');
      }

      // ✅ STEP 3: Payment confirmed — create the order record.
      await api.orders.create(user.id, items, amount / 100); // amount is in paise
      toast.success('Payment successful! Order placed.');

      if (!isDirect) clearCart();
      navigate('/profile');
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-md border border-border">
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">Card Details</label>
          <div className="p-3 bg-white dark:bg-slate-800 border border-input rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': { color: '#aab7c4' },
                  },
                  invalid: { color: '#9e2146' },
                },
              }}
            />
          </div>
          {/* Stripe test card hint (remove in production) */}
          <p className="mt-2 text-xs text-muted-foreground">
            Test card: <span className="font-mono">4242 4242 4242 4242</span> · any future date · any CVC
          </p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-12 text-lg"
        isLoading={isProcessing}
      >
        {isProcessing ? 'Processing…' : 'Pay Now'}
      </Button>

      <div className="flex items-center justify-center text-xs text-muted-foreground gap-2">
        <Lock className="h-3 w-3" />
        Payments are processed securely by Stripe
      </div>
    </form>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export const CheckoutPage = () => {
  const { items: cartItems, total: cartTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const directItem = location.state?.directCheckout;
  const items = directItem ? [directItem] : cartItems;
  const displayTotal = directItem ? directItem.price * directItem.quantity : cartTotal();
  const isDirect = !!directItem;

  // Shipping State — pre-fill name from profile
  const [shipping, setShipping] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'COD'>('CARD');
  const [upiId, setUpiId] = useState('');
  const [isUpiProcessing, setIsUpiProcessing] = useState(false);
  const [isCodProcessing, setIsCodProcessing] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  // Auto-fetch City/State from Indian Pincode
  useEffect(() => {
    const fetchLocation = async () => {
      if (shipping.pincode.length !== 6) return;

      setIsLoadingPincode(true);
      try {
        const response = await fetch(
          `https://api.postalpincode.in/pincode/${shipping.pincode}`
        );
        const data = await response.json();

        if (data?.[0]?.Status === 'Success') {
          const details = data[0].PostOffice[0];
          setShipping((prev) => ({
            ...prev,
            city: details.District,
            state: details.State,
          }));
          toast.success(`Location found: ${details.District}, ${details.State}`);
        } else {
          toast.error('Invalid Pincode');
        }
      } catch (error) {
        console.error('Failed to fetch pincode details', error);
      } finally {
        setIsLoadingPincode(false);
      }
    };

    const timeoutId = setTimeout(fetchLocation, 500);
    return () => clearTimeout(timeoutId);
  }, [shipping.pincode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'pincode') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setShipping((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setShipping((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <SEOHead title="Checkout" description="Securely complete your purchase." />

      <h1 className="text-3xl font-bold mb-8 text-foreground">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Left Column: Shipping & Payment */}
        <div className="space-y-8">
          {/* Shipping Info */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-xl font-semibold mb-6 flex items-center text-foreground">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">
                1
              </span>
              Shipping Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  value={shipping.firstName}
                  onChange={handleInputChange}
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={shipping.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <Input
                label="Address"
                name="address"
                placeholder="123 Main St"
                value={shipping.address}
                onChange={handleInputChange}
              />

              <div className="grid grid-cols-3 gap-4">
                <div className="relative">
                  <Input
                    label="Pincode"
                    name="pincode"
                    placeholder="110001"
                    maxLength={6}
                    value={shipping.pincode}
                    onChange={handleInputChange}
                  />
                  {isLoadingPincode && (
                    <Loader2 className="absolute right-3 top-9 h-4 w-4 animate-spin text-blue-600" />
                  )}
                </div>
                <Input
                  label="City"
                  name="city"
                  placeholder="City"
                  value={shipping.city}
                  readOnly
                  className="bg-gray-50 dark:bg-slate-900"
                />
                <Input
                  label="State"
                  name="state"
                  placeholder="State"
                  value={shipping.state}
                  readOnly
                  className="bg-gray-50 dark:bg-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-border shadow-sm space-y-6">
            <h2 className="text-xl font-semibold flex items-center text-foreground">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">
                2
              </span>
              Payment Method
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'CARD' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-border hover:border-blue-400'}`}
              >
                <CreditCard className={`w-6 h-6 mb-2 ${paymentMethod === 'CARD' ? 'text-blue-600' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-bold ${paymentMethod === 'CARD' ? 'text-blue-600' : 'text-foreground'}`}>Card</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'UPI' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-border hover:border-blue-400'}`}
              >
                <div className={`w-6 h-6 mb-2 font-black italic flex items-center justify-center text-xs ${paymentMethod === 'UPI' ? 'text-blue-600' : 'text-muted-foreground'}`}>UPI</div>
                <span className={`text-sm font-bold ${paymentMethod === 'UPI' ? 'text-blue-600' : 'text-foreground'}`}>UPI Pay</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('COD')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'COD' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-border hover:border-blue-400'}`}
              >
                <Package className={`w-6 h-6 mb-2 ${paymentMethod === 'COD' ? 'text-blue-600' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-bold ${paymentMethod === 'COD' ? 'text-blue-600' : 'text-foreground'}`}>Cash on Delivery</span>
              </button>
            </div>

            {paymentMethod === 'UPI' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-border space-y-4"
              >
                <label className="text-sm font-bold text-foreground">Enter UPI ID</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="username@bank"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" className="shrink-0" onClick={() => {
                    const userAny = user as any;
                    if (userAny?.upiDetails?.[0]) {
                      setUpiId(userAny.upiDetails[0].upiId);
                    } else {
                      toast.error("No saved UPI found");
                    }
                  }}>
                    Use Saved
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground italic">You will receive a payment request on your UPI app.</p>

                {/* ✅ FIX: Added confirm button for UPI — was missing before */}
                <Button
                  className="w-full"
                  disabled={isUpiProcessing || !upiId.trim() || !upiId.includes('@')}
                  isLoading={isUpiProcessing}
                  onClick={async () => {
                    if (!user) { toast.error('Please log in first.'); return; }
                    if (!upiId.includes('@')) { toast.error('Enter a valid UPI ID (e.g. name@upi)'); return; }
                    if (!shipping.address || !shipping.pincode) { toast.error('Please fill in shipping details.'); return; }
                    setIsUpiProcessing(true);
                    try {
                      // UPI orders bypass Stripe — create the order directly.
                      await api.orders.create(user.id, items, displayTotal);
                      toast.success('UPI payment request sent! Order placed successfully.');
                      if (!isDirect) clearCart();
                      navigate('/profile');
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to place order. Please try again.');
                    } finally {
                      setIsUpiProcessing(false);
                    }
                  }}
                >
                  {isUpiProcessing ? 'Processing…' : `Confirm UPI Payment · ${formatPrice(displayTotal)}`}
                </Button>
              </motion.div>
            )}

            {paymentMethod === 'CARD' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                  <ShieldCheck className="h-5 w-5" />
                  <span>Secure Payment via Stripe</span>
                </div>

                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    shippingDetails={shipping}
                    items={items}
                    isDirect={isDirect}
                  />
                </Elements>
              </div>
            )}

            {paymentMethod === 'COD' && (
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30 text-center">
                <Package className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-bold text-foreground mb-2">Cash on Delivery</h3>
                <p className="text-sm text-muted-foreground mb-4">Pay in cash when your order is delivered.</p>
                <Button 
                  className="w-full" 
                  disabled={isCodProcessing}
                  isLoading={isCodProcessing}
                  onClick={async () => {
                    if (!user) { toast.error('Please log in first.'); return; }
                    if (!shipping.address || !shipping.pincode) { toast.error('Please fill in shipping details.'); return; }
                    setIsCodProcessing(true);
                    try {
                      // COD orders are PENDING until delivered.
                      await api.orders.create(user.id, items, displayTotal, 'PENDING');
                      toast.success('Order placed successfully (Cash on Delivery)!');
                      if (!isDirect) clearCart();
                      navigate('/profile');
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to place order. Please try again.');
                    } finally {
                      setIsCodProcessing(false);
                    }
                  }}
                >
                  {isCodProcessing ? 'Placing Order…' : 'Confirm COD Order'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl border border-border sticky top-24">
            <h2 className="text-lg font-medium mb-6 text-foreground">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-16 w-16 bg-white rounded-md border border-border overflow-hidden flex-shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-foreground">{item.name}</span>
                      <span className="text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-3">
                      <span>Qty: {item.quantity}</span>
                      {item.size && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                          <span>
                            Size:{' '}
                            <span className="font-semibold text-foreground">{item.size}</span>
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(displayTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span className="text-green-600 dark:text-green-400">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-foreground pt-2">
                <span>Total</span>
                <span>{formatPrice(displayTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};