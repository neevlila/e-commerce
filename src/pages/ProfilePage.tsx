import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { Order, Product } from '../types';
import { formatPrice } from '../lib/utils';
import { SEOHead } from '../components/seo/SEOHead';
import {
  Package, Loader2, User as UserIcon,
  ArrowLeft, X,
  MapPin, CreditCard, Bell, ChevronRight,
  LogOut, ShieldCheck, Power, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/Input';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Review } from '../types';
import { StarRating } from '../components/ui/StarRating';
import { Trash2, PlusCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

import { WishlistContent } from './WishlistPage';

type Section = 'orders' | 'profile' | 'wishlist' | 'addresses' | 'payments' | 'notifications' | 'reviews' | 'upi';

export const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [reviewProducts, setReviewProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Active section state
  const [activeSection, setActiveSection] = useState<Section | null>(null);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      setLoading(true);

      const fetchData = async () => {
        try {
          // Clear any stale localStorage order cache
          Object.keys(localStorage).forEach((key) => {
            if (key.toLowerCase().includes('order')) {
              localStorage.removeItem(key);
            }
          });

          const fetchedOrders = await api.orders.list(user.id);

          // Filter out orphaned orders (exist in `orders` table but have no items)
          const validOrders = fetchedOrders.filter(
            (o: any) => Array.isArray(o.items) && o.items.length > 0
          );
          setOrders(validOrders);

          // Fetch user's reviews
          const { data: reviewsData, error: reviewsError } = await supabase
            .from('reviews')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!reviewsError && reviewsData) {
            const mapped = reviewsData.map(r => ({
              id: r.id,
              userId: r.user_id,
              userName: r.user_name,
              productId: r.product_id,
              rating: r.rating,
              comment: r.comment,
              createdAt: r.created_at
            }));
            setUserReviews(mapped);

            // Fetch product details for each reviewed product
            const uniqueProductIds = [...new Set(mapped.map(r => r.productId))];
            if (uniqueProductIds.length > 0) {
              const { data: productsData } = await supabase
                .from('products')
                .select('id, name, image_url, category')
                .in('id', uniqueProductIds);
              if (productsData) {
                const productMap: Record<string, Product> = {};
                productsData.forEach((p: any) => {
                  productMap[p.id] = { id: p.id, name: p.name, imageUrl: p.image_url, category: p.category } as Product;
                });
                setReviewProducts(productMap);
              }
            }
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [user]);

  // Handle section from URL if needed
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section') as Section;
    if (section && ['orders', 'profile', 'wishlist', 'addresses', 'payments', 'notifications', 'reviews', 'upi'].includes(section)) {
      setActiveSection(section);
    } else {
      setActiveSection(null);
    }
  }, [location.search]);

  const handleSectionChange = (section: Section) => {
    setActiveSection(section);
    navigate(`/profile?section=${section}`, { replace: true });
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await logout();
      navigate('/');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      await api.orders.cancel(orderId);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
      toast.success("Order cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel order");
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      updateProfile({ name: editName });
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  if (!user) return null;

  return (
    <div className="bg-gray-50 dark:bg-slate-900/50 min-h-screen py-4 md:py-12">
      <SEOHead title={`My Profile | ${activeSection ? activeSection.charAt(0).toUpperCase() + activeSection.slice(1) : 'Menu'}`} />

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Flipkart Style Sidebar */}
          <aside className={`w-full lg:w-[300px] flex-shrink-0 space-y-4 ${activeSection ? 'hidden lg:block' : 'block'}`}>

            {/* User Info Card */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-sm shadow-sm flex items-center gap-4 border border-border/50">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <UserIcon className="h-6 w-6" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-muted-foreground">Hello,</p>
                <p className="font-bold text-foreground truncate">{user.name}</p>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white dark:bg-slate-800 rounded-sm shadow-sm border border-border/50 overflow-hidden">

              {/* My Orders Section */}
              <button
                onClick={() => handleSectionChange('orders')}
                className={`w-full flex items-center justify-between p-4 border-b border-border/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors group ${activeSection === 'orders' ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
              >
                <div className="flex items-center gap-4 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <Package className={`h-5 w-5 ${activeSection === 'orders' ? 'text-blue-600' : ''}`} />
                  <span className={`font-bold uppercase text-sm ${activeSection === 'orders' ? 'text-blue-600' : ''}`}>My Orders</span>
                </div>
                <ChevronRight className={`h-4 w-4 text-muted-foreground/50 transition-transform ${activeSection === 'orders' ? 'rotate-90 text-blue-600' : ''}`} />
              </button>

              {/* Account Settings */}
              <div className="border-b border-border/50">
                <div className="p-4 flex items-center gap-4 text-muted-foreground">
                  <User className={`h-5 w-5 ${(activeSection === 'profile' || activeSection === 'addresses') ? 'text-blue-600' : 'text-muted-foreground/60'}`} />
                  <span className="font-bold uppercase text-sm text-muted-foreground/60">Account Settings</span>
                </div>
                <div className="pb-2">
                  <SidebarItem
                    label="Profile Information"
                    active={activeSection === 'profile'}
                    onClick={() => handleSectionChange('profile')}
                  />
                  <SidebarItem
                    label="Manage Addresses"
                    active={activeSection === 'addresses'}
                    onClick={() => handleSectionChange('addresses')}
                  />
                </div>
              </div>

              {/* Payments Section */}
              <div className="border-b border-border/50">
                <div className="p-4 flex items-center gap-4 text-muted-foreground">
                  <CreditCard className={`h-5 w-5 ${(activeSection === 'payments' || activeSection === 'upi') ? 'text-blue-600' : 'text-muted-foreground/60'}`} />
                  <span className="font-bold uppercase text-sm text-muted-foreground/60">Payments</span>
                </div>
                <div className="pb-2">
                  <SidebarItem
                    label="Saved Cards"
                    active={activeSection === 'payments'}
                    onClick={() => handleSectionChange('payments')}
                  />
                  <SidebarItem
                    label="Saved UPI"
                    active={activeSection === 'upi'}
                    onClick={() => handleSectionChange('upi' as any)}
                  />
                </div>
              </div>

              {/* My Stuff Section */}
              <div className="border-b border-border/50">
                <div className="p-4 flex items-center gap-4 text-muted-foreground">
                  <Power className={`h-5 w-5 ${['wishlist', 'reviews', 'notifications'].includes(activeSection as string) ? 'text-blue-600' : 'text-muted-foreground/60'}`} />
                  <span className="font-bold uppercase text-sm text-muted-foreground/60">My Stuff</span>
                </div>
                <div className="pb-2">
                  <SidebarItem
                    label="My Wishlist"
                    active={activeSection === 'wishlist'}
                    onClick={() => handleSectionChange('wishlist')}
                  />
                  <SidebarItem
                    label="My Reviews & Ratings"
                    active={activeSection === 'reviews'}
                    onClick={() => handleSectionChange('reviews')}
                  />
                  <SidebarItem
                    label="All Notifications"
                    active={activeSection === 'notifications'}
                    onClick={() => handleSectionChange('notifications')}
                  />
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-900/10 text-muted-foreground hover:text-red-600 transition-colors group"
              >
                <LogOut className="h-5 w-5 group-hover:text-red-600" />
                <span className="font-bold uppercase text-sm">Logout</span>
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className={`flex-1 bg-white dark:bg-slate-800 rounded-sm shadow-sm border border-border/50 min-h-[600px] overflow-hidden ${!activeSection ? 'hidden lg:block' : 'block'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-4 md:p-8"
              >
                {/* Mobile Back Button */}
                {activeSection && (
                  <button
                    onClick={() => navigate('/profile')}
                    className="lg:hidden flex items-center gap-2 text-blue-600 mb-6 font-bold text-sm"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Menu
                  </button>
                )}

                {(activeSection === 'profile' || (!activeSection)) && (
                  <ProfileInfoSection
                    user={user}
                    isEditing={isEditing}
                    editName={editName}
                    setEditName={setEditName}
                    setIsEditing={setIsEditing}
                    handleUpdateProfile={handleUpdateProfile}
                  />
                )}
                {activeSection === 'orders' && (
                  <OrdersSection
                    orders={orders}
                    loading={loading}
                    handleCancelOrder={handleCancelOrder}
                    navigate={navigate}
                  />
                )}
                {activeSection === 'wishlist' && (
                  <div className="-m-6 md:-m-8">
                    <WishlistContent />
                  </div>
                )}
                {activeSection === 'notifications' && (
                  <PlaceholderSection title="Notifications" icon={Bell} />
                )}
                {activeSection === 'reviews' && (
                  <ReviewsSection
                    reviews={userReviews}
                    reviewProducts={reviewProducts}
                    loading={loading}
                    onDelete={async (reviewId: string, productId: string) => {
                      try {
                        await api.reviews.delete(reviewId, productId);
                        setUserReviews(prev => prev.filter(r => r.id !== reviewId));
                        toast.success('Review deleted');
                      } catch (err: any) {
                        toast.error(err.message || 'Failed to delete review');
                      }
                    }}
                  />
                )}
                {activeSection === 'addresses' && (
                  <AddressesSection user={user} updateProfile={updateProfile} />
                )}
                {activeSection === 'upi' && (
                  <UPISection user={user} updateProfile={updateProfile} />
                )}
                {activeSection === 'payments' && (
                  <CardsSection user={user} updateProfile={updateProfile} />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────

const SidebarItem = ({ label, active, onClick }: { label: string, active?: boolean, onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-14 py-2 text-sm transition-colors ${active ? 'bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 font-bold' : 'text-muted-foreground hover:bg-gray-50 dark:hover:bg-slate-700/50 hover:text-blue-600'}`}
  >
    {label}
  </button>
);

const ProfileInfoSection = ({ user, isEditing, editName, setEditName, setIsEditing, handleUpdateProfile }: any) => (
  <div className="max-w-2xl">
    <div className="flex items-center gap-4 mb-8">
      <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="text-blue-600 text-sm font-bold hover:underline"
        >
          Edit
        </button>
      )}
    </div>

    <div className="grid gap-8">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Full Name</label>
          {isEditing ? (
            <div className="flex gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-11"
                autoFocus
              />
              <Button onClick={handleUpdateProfile} className="h-11 px-6">Save</Button>
              <Button variant="ghost" onClick={() => setIsEditing(false)} className="h-11">Cancel</Button>
            </div>
          ) : (
            <p className="p-3 bg-gray-50 dark:bg-slate-900 rounded-sm border border-border/50 text-foreground font-medium">
              {user.name}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Email Address</label>
          <p className="p-3 bg-gray-50 dark:bg-slate-900 rounded-sm border border-border/50 text-muted-foreground">
            {user.email}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-foreground">Account Status</h3>
        <div className="flex items-center gap-3 p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-sm border border-blue-100 dark:border-blue-900/30">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-bold text-blue-600 uppercase tracking-tight">{user.role} ACCOUNT</p>
            <p className="text-xs text-muted-foreground mt-0.5">Your account is verified and secure.</p>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-border/50">
        <h3 className="font-bold text-foreground mb-4">FAQs</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-bold text-foreground">What happens when I update my email address (or mobile number)?</p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Your login email id (or mobile number) changes, too. You'll receive all your account-related communication on your updated email id (or mobile number).</p>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">When will my StyleHub account be updated with the new email address (or mobile number)?</p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">It happens as soon as you confirm the verification code sent to your email (or mobile) and save the changes.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const OrdersSection = ({ orders, loading, handleCancelOrder, navigate }: any) => {
  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-lg border border-border shadow-sm">
        <Package className="h-20 w-20 mx-auto text-muted-foreground/20 mb-6" />
        <h3 className="text-xl font-bold text-foreground">No orders found</h3>
        <p className="text-muted-foreground mb-8 text-sm">You haven't placed any orders yet or they were deleted from the database.</p>
        <Button 
          className="px-12 h-11 text-sm font-bold bg-blue-600 hover:bg-blue-700 transition-colors"
          onClick={() => navigate('/products')}
        >
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-xl font-black text-foreground tracking-tight">Order History</h2>
        <span className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-900/20 px-3 py-1 rounded-full font-black uppercase tracking-widest">{orders.length} Total Orders</span>
      </div>
      
      <div className="space-y-4 pb-12">
        {orders.map((order: any) => (
          <div 
            key={order.id} 
            className="group bg-white dark:bg-slate-900 border border-border/70 hover:shadow-[0_2px_15px_rgba(0,0,0,0.05)] transition-all duration-300 rounded-sm overflow-hidden"
          >
            {/* Horizontal Order Details (Flipkart-Style) */}
            <div className="divide-y divide-border/20">
              {order.items.length > 0 ? (
                order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-6 p-6 cursor-pointer" onClick={() => navigate(`/products/${item.id}`)}>
                    {/* Image */}
                    <div className="h-20 w-20 flex-shrink-0 bg-white border border-border/40 rounded-sm p-1 shadow-sm group-hover:shadow-md transition-shadow">
                      <img 
                        src={item.imageUrl} 
                        alt="" 
                        className="h-full w-full object-contain"
                      />
                    </div>
                    
                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight mb-1">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest mb-2">{item.category}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-base font-black text-foreground">{formatPrice(item.price)}</span>
                        <span className="text-[11px] text-muted-foreground border-l border-border pl-4">Quantity: {item.quantity}</span>
                      </div>
                    </div>
                    
                    {/* Status Display */}
                    <div className="md:w-56 shrink-0 flex flex-col md:items-end justify-start pt-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${order.status === 'PAID' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : order.status === 'CANCELLED' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]'}`} />
                        <span className="text-xs font-black text-foreground uppercase tracking-tight">
                          {order.status === 'PAID' ? 'Delivered successfully' : 
                          order.status === 'CANCELLED' ? 'Cancelled on request' : 
                          'Status: ' + order.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5 font-medium">
                        {order.status === 'PAID' ? 'Your order has been delivered.' : 
                        order.status === 'CANCELLED' ? 'The items were returned to stock.' : 
                        `Estimated delivery: 3-5 days.`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center bg-gray-50/30 dark:bg-slate-900/40">
                   <p className="text-[10px] font-black text-red-600/70 uppercase tracking-[0.2em] mb-2 px-4 py-1 bg-red-50 dark:bg-red-900/10 inline-block rounded">Database Sync Needed</p>
                   <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed mt-2 font-medium">
                     This order entry exists in the <code className="bg-muted px-1">orders</code> table, but its items were removed.
                     To fully remove this card, please delete the row from the <b className="text-blue-600 underline cursor-help" title="Go to Supabase Dashboard > Table Editor > orders">orders</b> table in Supabase.
                   </p>
                </div>
              )}
            </div>

            {/* Footer Row (Order Summary) */}
            <div className="bg-gray-50/50 dark:bg-slate-800/30 px-6 py-3 border-t border-border/30 flex flex-wrap justify-between items-center gap-4">
               <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Order ID</span>
                    <span className="text-[11px] font-bold text-foreground/80 font-mono">#{order.id.slice(0, 10).toUpperCase()}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Date</span>
                    <span className="text-[11px] font-bold text-foreground/80">{new Date(order.createdAt).toLocaleDateString()}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Payed</span>
                    <span className="text-base font-black text-blue-600">{formatPrice(order.total)}</span>
                 </div>
               </div>
               
               {/* Show cancel button ONLY if order has items AND is not already cancelled */}
               {order.items.length > 0 && (order.status === 'PAID' || order.status === 'PENDING') && (
                 <Button 
                   variant="ghost" 
                   onClick={(e) => {
                     e.stopPropagation();
                     handleCancelOrder(order.id);
                   }}
                   className="h-8 text-[10px] font-black text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 uppercase tracking-wider"
                 >
                   Cancel Order
                 </Button>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PlaceholderSection = ({ title, icon: Icon }: { title: string, icon: any }) => (
  <div className="text-center py-20">
    <Icon className="h-16 w-16 mx-auto text-muted-foreground/30 mb-6" />
    <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
    <p className="text-muted-foreground max-w-sm mx-auto">This section is currently under development. Please check back later for more features.</p>
  </div>
);

const ReviewsSection = ({
  reviews,
  reviewProducts,
  loading,
  onDelete,
}: {
  reviews: Review[];
  reviewProducts: Record<string, Product>;
  loading: boolean;
  onDelete: (reviewId: string, productId: string) => Promise<void>;
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (reviewId: string, productId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    setDeletingId(reviewId);
    try {
      await onDelete(reviewId, productId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-8">My Reviews & Ratings</h2>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-slate-900/50 rounded-sm border border-dashed border-border">
          <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">You haven't given any reviews yet.</p>
          <Link to="/products" className="text-blue-600 text-sm font-bold hover:underline mt-2 inline-block">
            Browse products to review
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => {
            const product = reviewProducts[review.productId];
            return (
              <div key={review.id} className="border border-border/50 rounded-sm bg-white dark:bg-slate-800 hover:shadow-sm transition-shadow overflow-hidden">
                {/* Product row — click to view product */}
                {product && (
                  <Link
                    to={`/products/${review.productId}`}
                    className="flex items-center gap-3 px-5 py-3 bg-gray-50 dark:bg-slate-900/60 border-b border-border/40 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors group"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-11 w-11 object-cover rounded-sm border border-border/40 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground group-hover:text-blue-600 transition-colors truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                    <span className="text-xs text-blue-500 font-bold shrink-0 group-hover:underline">View Product →</span>
                  </Link>
                )}

                {/* Review content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <StarRating rating={review.rating} size={16} />
                        <span className="text-sm font-bold text-foreground">{review.rating}/5</span>
                      </div>
                      <p className="text-foreground leading-relaxed text-sm">{review.comment}</p>
                    </div>
                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(review.id, review.productId)}
                      disabled={deletingId === review.id}
                      className="flex-shrink-0 p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm transition-colors disabled:opacity-40"
                      title="Delete review"
                    >
                      {deletingId === review.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />
                      }
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 pt-3 mt-4">
                    <span>Posted on {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" /> Verified Purchase
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const AddressesSection = ({ user, updateProfile }: { user: any, updateProfile: any }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newAddr, setNewAdd] = useState({ firstName: '', lastName: '', address: '', city: '', state: '', pincode: '' });

  const handleAdd = () => {
    const addresses = user.addresses || [];
    const id = `addr-${Date.now()}`;
    const updated = [...addresses, { ...newAddr, id, isDefault: addresses.length === 0 }];
    updateProfile({ addresses: updated });
    setShowAdd(false);
    setNewAdd({ firstName: '', lastName: '', address: '', city: '', state: '', pincode: '' });
    toast.success("Address added successfully");
  };

  const handleRemove = (id: string) => {
    const updated = (user.addresses || []).filter((a: any) => a.id !== id);
    updateProfile({ addresses: updated });
    toast.success("Address removed");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-foreground">Manage Addresses</h2>
        <Button onClick={() => setShowAdd(!showAdd)} variant="outline" className="gap-2">
          {showAdd ? <X className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
          {showAdd ? 'Cancel' : 'Add New Address'}
        </Button>
      </div>

      {showAdd && (
        <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-sm border border-border mb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={newAddr.firstName} onChange={e => setNewAdd({ ...newAddr, firstName: e.target.value })} />
            <Input label="Last Name" value={newAddr.lastName} onChange={e => setNewAdd({ ...newAddr, lastName: e.target.value })} />
          </div>
          <Input label="Address" value={newAddr.address} onChange={e => setNewAdd({ ...newAddr, address: e.target.value })} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="City" value={newAddr.city} onChange={e => setNewAdd({ ...newAddr, city: e.target.value })} />
            <Input label="State" value={newAddr.state} onChange={e => setNewAdd({ ...newAddr, state: e.target.value })} />
            <Input label="Pincode" value={newAddr.pincode} onChange={e => setNewAdd({ ...newAddr, pincode: e.target.value })} />
          </div>
          <Button onClick={handleAdd} className="w-full">Save Address</Button>
        </div>
      )}

      <div className="space-y-4">
        {(user.addresses || []).map((addr: any) => (
          <div key={addr.id} className="border border-border/50 rounded-sm p-6 relative group">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-foreground">{addr.firstName} {addr.lastName}</span>
                  {addr.isDefault && <span className="text-[10px] bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full font-bold uppercase">Default</span>}
                </div>
                <p className="text-sm text-muted-foreground">{addr.address}</p>
                <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</p>
              </div>
              <button onClick={() => handleRemove(addr.id)} className="text-muted-foreground hover:text-red-600 transition-colors p-2">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {(!user.addresses || user.addresses.length === 0) && !showAdd && (
          <div className="text-center py-12 bg-gray-50 dark:bg-slate-900/30 rounded-sm border border-dashed border-border">
            <MapPin className="h-10 w-10 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No addresses saved yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const UPISection = ({ user, updateProfile }: { user: any, updateProfile: any }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [name, setName] = useState('');

  const handleAdd = () => {
    if (!upiId.includes('@')) {
      toast.error("Invalid UPI ID");
      return;
    }
    const upis = user.upiDetails || [];
    const updated = [...upis, { id: `upi-${Date.now()}`, upiId, name, isDefault: upis.length === 0 }];
    updateProfile({ upiDetails: updated });
    setShowAdd(false);
    setUpiId('');
    setName('');
    toast.success("UPI ID added");
  };

  const handleRemove = (id: string) => {
    const updated = (user.upiDetails || []).filter((u: any) => u.id !== id);
    updateProfile({ upiDetails: updated });
    toast.success("UPI ID removed");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-foreground">Saved UPI Details</h2>
        <Button onClick={() => setShowAdd(!showAdd)} variant="outline" className="gap-2">
          {showAdd ? <X className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
          {showAdd ? 'Cancel' : 'Add New UPI'}
        </Button>
      </div>

      {showAdd && (
        <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-sm border border-border mb-8 space-y-4">
          <Input label="UPI ID (e.g., user@bank)" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="username@bank" />
          <Input label="Account Holder Name" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
          <Button onClick={handleAdd} className="w-full">Save UPI ID</Button>
        </div>
      )}

      <div className="space-y-4">
        {(user.upiDetails || []).map((upi: any) => (
          <div key={upi.id} className="border border-border/50 rounded-sm p-6 flex justify-between items-center bg-white dark:bg-slate-800">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600">
                <Power className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-foreground">{upi.upiId}</p>
                <p className="text-xs text-muted-foreground">{upi.name}</p>
              </div>
            </div>
            <button onClick={() => handleRemove(upi.id)} className="text-muted-foreground hover:text-red-600 p-2">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {(!user.upiDetails || user.upiDetails.length === 0) && !showAdd && (
          <div className="text-center py-12 bg-gray-50 dark:bg-slate-900/30 rounded-sm border border-dashed border-border">
            <Power className="h-10 w-10 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No UPI IDs saved yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CardsSection = ({ user, updateProfile }: { user: any, updateProfile: any }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [card, setCard] = useState({ holderName: '', last4: '', brand: 'Visa', expMonth: 12, expYear: 2030 });

  const handleAdd = () => {
    if (card.last4.length !== 4) {
      toast.error("Please enter last 4 digits");
      return;
    }
    const cards = user.cardDetails || [];
    const updated = [...cards, { ...card, id: `card-${Date.now()}`, isDefault: cards.length === 0 }];
    updateProfile({ cardDetails: updated });
    setShowAdd(false);
    setCard({ holderName: '', last4: '', brand: 'Visa', expMonth: 12, expYear: 2030 });
    toast.success("Card added successfully");
  };

  const handleRemove = (id: string) => {
    const updated = (user.cardDetails || []).filter((c: any) => c.id !== id);
    updateProfile({ cardDetails: updated });
    toast.success("Card removed");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-foreground">Saved Cards</h2>
        <Button onClick={() => setShowAdd(!showAdd)} variant="outline" className="gap-2">
          {showAdd ? <X className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
          {showAdd ? 'Cancel' : 'Add New Card'}
        </Button>
      </div>

      {showAdd && (
        <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-sm border border-border mb-8 space-y-4">
          <Input label="Card Holder Name" value={card.holderName} onChange={e => setCard({ ...card, holderName: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Last 4 Digits" maxLength={4} value={card.last4} onChange={e => setCard({ ...card, last4: e.target.value })} />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Card Type</label>
              <select className="w-full h-11 px-4 rounded-md border border-input bg-background" value={card.brand} onChange={e => setCard({ ...card, brand: e.target.value })}>
                <option>Visa</option>
                <option>Mastercard</option>
                <option>Rupay</option>
              </select>
            </div>
          </div>
          <Button onClick={handleAdd} className="w-full">Save Card</Button>
        </div>
      )}

      <div className="space-y-4">
        {(user.cardDetails || []).map((card: any) => (
          <div key={card.id} className="border border-border/50 rounded-sm p-6 relative bg-white dark:bg-slate-800">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="h-10 w-12 bg-gray-100 dark:bg-slate-700/50 rounded flex items-center justify-center font-bold text-[10px] uppercase">
                  {card.brand}
                </div>
                <div>
                  <p className="font-bold text-foreground">•••• •••• •••• {card.last4}</p>
                  <p className="text-xs text-muted-foreground">{card.holderName}</p>
                </div>
              </div>
              <button onClick={() => handleRemove(card.id)} className="text-muted-foreground hover:text-red-600 p-2">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {(!user.cardDetails || user.cardDetails.length === 0) && !showAdd && (
          <div className="text-center py-12 bg-gray-50 dark:bg-slate-900/30 rounded-sm border border-dashed border-border">
            <CreditCard className="h-10 w-10 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No cards saved yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};