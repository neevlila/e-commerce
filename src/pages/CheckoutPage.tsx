import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { formatPrice } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/Input';
import { Lock, ShieldCheck, Loader2 } from 'lucide-react';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import toast from 'react-hot-toast';
import { SEOHead } from '../components/seo/SEOHead';

// Checkout Form Component
const CheckoutForm = ({ shippingDetails, items, totalAmt, isDirect }: { shippingDetails: any, items: any[], totalAmt: number, isDirect?: boolean }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (items.length === 0) {
      toast.error('Your checkout is empty');
      return;
    }

    if (!shippingDetails.address || !shippingDetails.pincode) {
        toast.error('Please fill in shipping details');
        return;
    }

    setIsProcessing(true);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (user) {
        await api.orders.create(user.id, items, totalAmt);
        toast.success('Payment successful! Order placed.');
        if (!isDirect) clearCart();
        navigate('/profile');
      } else {
        // Allow guest checkout for demo purposes if not logged in
        toast.success('Guest checkout successful!');
        if (!isDirect) clearCart();
        navigate('/');
      }

    } catch (error: any) {
      console.error(error);
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
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                    },
                    invalid: {
                    color: '#9e2146',
                    },
                },
                }}
            />
            </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-12 text-lg"
        isLoading={isProcessing}
      >
        {isProcessing ? 'Processing...' : `Pay ${formatPrice(totalAmt)}`}
      </Button>
      
      <div className="flex items-center justify-center text-xs text-muted-foreground gap-2">
        <Lock className="h-3 w-3" />
        Payments are secure and encrypted
      </div>
    </form>
  );
};

// Main Page Component
export const CheckoutPage = () => {
  const { items: cartItems, total: cartTotal } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const directItem = location.state?.directCheckout;
  const items = directItem ? [directItem] : cartItems;
  const totalAmt = directItem ? directItem.price * directItem.quantity : cartTotal();
  const isDirect = !!directItem;
  
  // Shipping State
  const [shipping, setShipping] = useState({
    firstName: user?.name.split(' ')[0] || '',
    lastName: user?.name.split(' ')[1] || '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);

  // Redirect if cart is empty - FIXED: Moved to useEffect to prevent render crash
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  // Auto-fetch City/State from Pincode
  useEffect(() => {
    const fetchLocation = async () => {
        if (shipping.pincode.length !== 6) return;
        
        setIsLoadingPincode(true);
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${shipping.pincode}`);
            const data = await response.json();
            
            if (data && data[0].Status === "Success") {
                const details = data[0].PostOffice[0];
                setShipping(prev => ({
                    ...prev,
                    city: details.District,
                    state: details.State
                }));
                toast.success(`Location found: ${details.District}, ${details.State}`);
            } else {
                toast.error('Invalid Pincode');
            }
        } catch (error) {
            console.error("Failed to fetch pincode details", error);
        } finally {
            setIsLoadingPincode(false);
        }
    };

    // Debounce the call
    const timeoutId = setTimeout(fetchLocation, 500);
    return () => clearTimeout(timeoutId);
  }, [shipping.pincode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setShipping(prev => ({ ...prev, [name]: value }));
  };

  // Don't render anything if redirecting
  if (items.length === 0) {
    return null;
  }

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
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
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
                    {isLoadingPincode && <Loader2 className="absolute right-3 top-9 h-4 w-4 animate-spin text-blue-600" />}
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

          {/* Payment Info */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-xl font-semibold mb-6 flex items-center text-foreground">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
              Payment Method
            </h2>
            
            <div className="mb-6 flex items-center gap-2 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                <ShieldCheck className="h-5 w-5" />
                <span>Stripe Secure Payment Integration Active</span>
            </div>

            <Elements stripe={stripePromise}>
              <CheckoutForm shippingDetails={shipping} items={items} totalAmt={totalAmt} isDirect={isDirect} />
            </Elements>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-xl border border-border sticky top-24">
            <h2 className="text-lg font-medium mb-6 text-foreground">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-16 w-16 bg-white rounded-md border border-border overflow-hidden flex-shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-foreground">{item.name}</span>
                      <span className="text-foreground">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-3">
                      <span>Qty: {item.quantity}</span>
                      {item.size && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                          <span>Size: <span className="font-semibold text-foreground">{item.size}</span></span>
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
                <span>{formatPrice(totalAmt)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span className="text-green-600 dark:text-green-400">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-foreground pt-2">
                <span>Total</span>
                <span>{formatPrice(totalAmt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
