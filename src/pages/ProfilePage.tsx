import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { Order } from '../types';
import { formatPrice } from '../lib/utils';
import { SEOHead } from '../components/seo/SEOHead';
import { Package, Calendar, Loader2, User as UserIcon, ArrowLeft, XCircle, Edit2, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      api.orders.list(user.id)
        .then(setOrders)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      await api.orders.cancel(orderId);
      // Optimistically update UI
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
        // In a real app, this would call an API
        updateProfile({ name: editName });
        setIsEditing(false);
        toast.success("Profile updated successfully");
    } catch (error) {
        toast.error("Failed to update profile");
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <SEOHead title="My Profile" description="View your order history and account details." />
      
      <div className="max-w-4xl mx-auto">
        <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
        </Button>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-border p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="h-20 w-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                    <UserIcon className="h-10 w-10" />
                </div>
                
                <div className="flex-grow w-full">
                    {isEditing ? (
                        <div className="flex flex-col gap-3 max-w-md">
                            <label className="text-sm font-medium text-muted-foreground">Edit Name</label>
                            <div className="flex gap-2">
                                <Input 
                                    value={editName} 
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="h-10"
                                    autoFocus
                                />
                                <Button size="sm" onClick={handleUpdateProfile} className="h-10">
                                    <Save className="h-4 w-4 mr-2" /> Save
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-10">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-start w-full">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
                                    {user.name}
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="text-muted-foreground hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                                        title="Edit Name"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                </h1>
                                <p className="text-muted-foreground">{user.email}</p>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 mt-2">
                                    {user.role} Account
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <h2 className="text-xl font-bold mb-6 flex items-center text-foreground">
          <Package className="mr-2 h-5 w-5 text-blue-600" />
          Order History
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed border-border">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No orders found yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="font-mono text-xs text-muted-foreground/60">ID: {order.id}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${order.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}
                      `}>
                        {order.status}
                      </span>
                      <span className="text-lg font-bold text-foreground">{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gray-100 dark:bg-slate-700 rounded-md overflow-hidden">
                              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                            </div>
                            <span className="font-medium text-foreground">
                              {item.name} <span className="text-muted-foreground">x{item.quantity}</span>
                            </span>
                          </div>
                          <span className="text-muted-foreground">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cancel Button */}
                  {(order.status === 'PAID' || order.status === 'PENDING') && (
                    <div className="mt-4 pt-4 border-t border-border flex justify-end">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleCancelOrder(order.id)}
                        className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Order
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
