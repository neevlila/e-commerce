import { supabase } from './supabase';
import { Product, Order, User, Review, CartItem } from '../types';
import { MOCK_PRODUCTS } from './mockData';

// Helper to map DB snake_case to frontend camelCase
const mapProduct = (data: any): Product => ({
  id: data.id,
  name: data.name,
  description: data.description,
  price: Number(data.price),
  imageUrl: data.image_url || data.imageUrl,
  category: data.category,
  subCategory: data.sub_category || data.subCategory,
  company: data.company || 'Unknown',
  stock: data.stock,
  createdAt: data.created_at || data.createdAt,
  // If we have joined reviews or stored aggregates
  rating: data.rating || 0,
  reviewCount: data.review_count || data.reviewCount || 0
});

const mapReview = (data: any): Review => ({
  id: data.id,
  userId: data.user_id,
  userName: data.user_name || 'Anonymous',
  productId: data.product_id,
  rating: data.rating,
  comment: data.comment,
  createdAt: data.created_at
});

// Timeout helper
const withTimeout = <T>(promise: any, ms: number = 2000): Promise<T> => {
  return Promise.race([
    promise as Promise<T>,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms)
    )
  ]);
};

// Local Storage Helpers
const STORAGE_KEY = 'stylehub-products-v1';
const REVIEWS_KEY = 'stylehub-reviews-v1';

const getLocalProducts = (): Product[] | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) { return null; }
};

const setLocalProducts = (products: Product[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); } catch (e) { }
};

const getLocalReviews = (): Review[] => {
  try {
    const stored = localStorage.getItem(REVIEWS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) { return []; }
};

const setLocalReviews = (reviews: Review[]) => {
  try { localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews)); } catch (e) { }
};

export const api = {
  auth: {
    getProfile: async (userId: string): Promise<User | null> => {
      try {
        const { data, error } = await withTimeout<any>(
          supabase.from('profiles').select('*').eq('id', userId).single()
        ) as any;
        if (error) return null;
        return {
          id: data.id,
          email: data.email,
          name: data.full_name,
          role: data.role as 'USER' | 'ADMIN',
        };
      } catch (e) { return null; }
    },
  },

  products: {
    list: async (): Promise<Product[]> => {
      try {
        // Try DB
        const { data, error } = await withTimeout<any>(
          supabase.from('products').select('*').order('created_at', { ascending: false })
        ) as any;

        if (error) throw error;

        if (!data || data.length === 0) {
          const local = getLocalProducts();
          if (local && local.length >= MOCK_PRODUCTS.length) return local;
          // Use the massive static list if DB is empty
          setLocalProducts(MOCK_PRODUCTS);
          return MOCK_PRODUCTS;
        }

        const mappedData = data.map(mapProduct);
        setLocalProducts(mappedData);
        return mappedData;

      } catch (error) {
        const local = getLocalProducts();
        if (local && local.length >= MOCK_PRODUCTS.length) return local;
        setLocalProducts(MOCK_PRODUCTS);
        return MOCK_PRODUCTS;
      }
    },
    get: async (id: string): Promise<Product | undefined> => {
      const local = getLocalProducts() || MOCK_PRODUCTS;
      const localProduct = local.find(p => p.id === id);

      try {
        const { data, error } = await withTimeout<any>(
          supabase.from('products').select('*').eq('id', id).single()
        ) as any;
        if (error) throw error;
        return mapProduct(data);
      } catch (error) {
        return localProduct;
      }
    },
    create: async (product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> => {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert([{
            name: product.name,
            description: product.description,
            price: product.price,
            image_url: product.imageUrl,
            category: product.category,
            company: product.company,
            stock: product.stock,
            rating: product.rating || 0,
            review_count: product.reviewCount || 0
          }])
          .select()
          .single();

        if (error) throw error;
        const newProduct = mapProduct(data);
        const current = getLocalProducts() || [];
        setLocalProducts([newProduct, ...current]);
        return newProduct;
      } catch (e) {
        const newProduct: Product = {
          ...product,
          id: `local-${Date.now()}`,
          createdAt: new Date().toISOString(),
          rating: product.rating || 0,
          reviewCount: product.reviewCount || 0
        };
        const current = getLocalProducts() || MOCK_PRODUCTS;
        setLocalProducts([newProduct, ...current]);
        return newProduct;
      }
    },
    createBulk: async (products: Omit<Product, 'id' | 'createdAt'>[]): Promise<void> => {
      // Bulk insert for seeding
      try {
        const dbPayload = products.map(p => ({
          name: p.name,
          description: p.description,
          price: p.price,
          image_url: p.imageUrl,
          category: p.category,
          company: p.company,
          stock: p.stock,
          rating: p.rating || 0,
          review_count: p.reviewCount || 0
        }));

        const { error } = await supabase.from('products').insert(dbPayload);
        if (error) throw error;
      } catch (e) {
        console.warn("Bulk DB insert failed, using local");
        const current = getLocalProducts() || [];
        const newLocal = products.map((p, i) => ({
          ...p,
          id: `local-bulk-${Date.now()}-${i}`,
          createdAt: new Date().toISOString()
        }));
        setLocalProducts([...newLocal, ...current]);
      }
    },
    update: async (id: string, updates: Partial<Product>): Promise<Product> => {
      // Update Local
      const current = getLocalProducts() || MOCK_PRODUCTS;
      const updatedLocal = current.map(p => p.id === id ? { ...p, ...updates } : p);
      setLocalProducts(updatedLocal);
      const updatedItem = updatedLocal.find(p => p.id === id)!;

      // Try DB
      try {
        const { data, error } = await supabase
          .from('products')
          .update({
            name: updates.name,
            description: updates.description,
            price: updates.price,
            image_url: updates.imageUrl,
            category: updates.category,
            company: updates.company,
            stock: updates.stock
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return mapProduct(data);
      } catch (e) {
        return updatedItem;
      }
    },

    getRecommendations: async (cartItems: CartItem[]): Promise<Product[]> => {
      const allProducts = getLocalProducts() || MOCK_PRODUCTS;
      const cartProductIds = new Set(cartItems.map(item => item.id));

      if (cartItems.length === 0) {
        return allProducts
          .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
          .slice(0, 8);
      }

      let recommended: Product[] = [];

      for (const item of cartItems) {
        const name = item.name.toLowerCase();
        const cat = item.category.toLowerCase();
        
        // Pants -> Shirts, Shoes, Accessories (Jewelry)
        if (name.includes('pant') || name.includes('chino') || name.includes('jeans') || name.includes('trousers') || name.includes('jogger')) {
          const suggestions = allProducts.filter(p => {
            const pName = p.name.toLowerCase();
            const pCat = p.category.toLowerCase();
            const pSub = p.subCategory?.toLowerCase();
            const itemSub = item.subCategory?.toLowerCase();

            // Must match gender if the item or suggestion is gendered
            if (itemSub && pSub && itemSub !== pSub && (itemSub !== 'child' && pSub !== 'child')) return false;

            return (pName.includes('shirt') || pName.includes('tee') || pCat === 'shoes' || pCat === 'jewelry') && !cartProductIds.has(p.id);
          });
          recommended.push(...suggestions);
        }
        
        // Shirt -> Pants, Shoes
        else if (name.includes('shirt') || name.includes('tee')) {
          const suggestions = allProducts.filter(p => {
            const pName = p.name.toLowerCase();
            const pCat = p.category.toLowerCase();
            const pSub = p.subCategory?.toLowerCase();
            const itemSub = item.subCategory?.toLowerCase();

            if (itemSub && pSub && itemSub !== pSub && (itemSub !== 'child' && pSub !== 'child')) return false;

            return (pName.includes('pant') || pName.includes('chino') || pName.includes('jeans') || pCat === 'shoes') && !cartProductIds.has(p.id);
          });
          recommended.push(...suggestions);
        }

        // Jacket -> Pants, Shirts, Shoes
        else if (name.includes('jacket')) {
          const suggestions = allProducts.filter(p => {
            const pName = p.name.toLowerCase();
            const pCat = p.category.toLowerCase();
            const pSub = p.subCategory?.toLowerCase();
            const itemSub = item.subCategory?.toLowerCase();

            if (itemSub && pSub && itemSub !== pSub && (itemSub !== 'child' && pSub !== 'child')) return false;

            return (pName.includes('pant') || pName.includes('shirt') || pCat === 'shoes') && !cartProductIds.has(p.id);
          });
          recommended.push(...suggestions);
        }

        // Dress -> Shoes, Jewelry
        else if (name.includes('dress')) {
          const suggestions = allProducts.filter(p => {
            const pCat = p.category.toLowerCase();
            return (pCat === 'shoes' || pCat === 'jewelry') && !cartProductIds.has(p.id);
          });
          recommended.push(...suggestions);
        }

        // Electronics: same brand or related categories (keyboard, mouse, etc)
        else if (cat === 'electronics') {
          const suggestions = allProducts.filter(p => {
            const pName = p.name.toLowerCase();
            const pCat = p.category.toLowerCase();
            // If it's tech, suggest other tech from same brand OR specific peripherals
            const isRelatedTech = pCat === 'electronics' && (
              p.company === item.company || 
              pName.includes('keyboard') || 
              pName.includes('mouse') || 
              pName.includes('headphone') || 
              pName.includes('monitor') ||
              pName.includes('watch') ||
              pName.includes('pad')
            );
            return isRelatedTech && p.id !== item.id && !cartProductIds.has(p.id);
          });
          recommended.push(...suggestions);
        }
      }

      // Fallback: popular items or same categories (Fair Decision Rule: Filter out unrelated categories if tech is in cart)
      if (recommended.length < 8) {
        const cartCategories = new Set(cartItems.map(item => item.category));
        const hasTech = cartItems.some(item => item.category === 'Electronics');
        const hasSkinCare = cartItems.some(item => item.category === 'Skin Care');
        
        const extra = allProducts
          .filter(p => {
            if (cartProductIds.has(p.id)) return false;
            if (recommended.some(r => r.id === p.id)) return false;
            
            // Fair Decision: If cart has tech, don't suggest unrelated things like jewelry or home stuff as fallback unless explicitly matching category
            if (hasTech && !cartCategories.has(p.category)) {
              if (p.category === 'Jewelry' || p.category === 'Home & Living' || p.category === 'Skin Care' || p.category === 'Sports') return false;
            }
            
            // If cart has skin care, don't suggest tech or sports as fallback
            if (hasSkinCare && !cartCategories.has(p.category)) {
              if (p.category === 'Electronics' || p.category === 'Sports' || p.category === 'Home & Living') return false;
            }

            // General filter: don't suggest unrelated categories if we already have some category-specific recommendations
            if (recommended.length > 0 && !cartCategories.has(p.category)) {
               // Only suggest if it's high rated and not totally unrelated
               if (p.rating && p.rating < 4.5) return false;
            }

            return true;
          })
          .sort((a, b) => {
            if (cartCategories.has(a.category) && !cartCategories.has(b.category)) return -1;
            if (!cartCategories.has(a.category) && cartCategories.has(b.category)) return 1;
            return (b.reviewCount || 0) - (a.reviewCount || 0);
          });
        recommended.push(...extra);
      }

      // Remove duplicates and limit to 8
      const uniqueRecommended = Array.from(new Map(recommended.map(p => [p.id, p])).values())
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 8);

      return uniqueRecommended;
    },

    delete: async (id: string): Promise<void> => {
      const current = getLocalProducts() || MOCK_PRODUCTS;
      setLocalProducts(current.filter(p => p.id !== id));
      try {
        if (!id.startsWith('mock-') && !id.startsWith('local-') && !id.startsWith('static-')) {
          await supabase.from('products').delete().eq('id', id);
        }
      } catch (e) { }
    }
  },

  reviews: {
    list: async (productId: string): Promise<Review[]> => {
      try {
        const { data, error } = await withTimeout<any>(
          supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false })
        ) as any;
        if (error) throw error;
        return data.map(mapReview);
      } catch (e) {
        return getLocalReviews().filter(r => r.productId === productId);
      }
    },
    add: async (review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
      // Check local constraint (max 2 reviews per user per product)
      const localReviews = getLocalReviews();
      const userReviews = localReviews.filter(r => r.userId === review.userId && r.productId === review.productId);
      if (userReviews.length >= 2) {
        throw new Error("You can only submit up to 2 reviews for this product.");
      }

      let newReview: Review;

      try {
        // Try DB
        const { count } = await supabase.from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', review.userId)
          .eq('product_id', review.productId);

        if (count !== null && count >= 2) {
          throw new Error("You can only submit up to 2 reviews for this product.");
        }

        const { data, error } = await supabase.from('reviews').insert([{
          user_id: review.userId,
          user_name: review.userName,
          product_id: review.productId,
          rating: review.rating,
          comment: review.comment
        }]).select().single();

        if (error) throw error;
        newReview = mapReview(data);
      } catch (e: any) {
        if (e.message.includes("2 reviews")) throw e;

        // Fallback Local
        newReview = {
          ...review,
          id: `local-review-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        setLocalReviews([newReview, ...localReviews]);
      }

      // --- UPDATE PRODUCT RATING ---
      // We need to fetch all reviews (local + new) to calculate average
      // For simplicity, we'll assume we have the list in local state or refetch
      // Here we will just update the product object in our local cache
      // Note: This might duplicate if we mix DB and Local, but for "Safe Mode" it's fine.

      // Better approach: Get current product, update its stats
      const product = (getLocalProducts() || MOCK_PRODUCTS).find(p => p.id === review.productId);
      if (product) {
        // Simple moving average approximation if we don't have all reviews loaded
        // New Avg = ((Old Avg * Old Count) + New Rating) / (Old Count + 1)
        const oldRating = product.rating || 0;
        const oldCount = product.reviewCount || 0;
        const newCount = oldCount + 1;
        const newRating = ((oldRating * oldCount) + review.rating) / newCount;

        await api.products.update(review.productId, {
          rating: Number(newRating.toFixed(1)),
          reviewCount: newCount
        });
      }

      return newReview;
    }
  },

  orders: {
    create: async (userId: string, items: any[], total: number): Promise<Order> => {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert([{ user_id: userId, total: total, status: 'PAID' }])
          .select().single();

        if (orderError) throw orderError;

        const validItems = items.filter(i => !i.id.startsWith('mock-') && !i.id.startsWith('local-') && !i.id.startsWith('static-'));
        if (validItems.length > 0) {
          const orderItems = validItems.map((item: any) => ({
            order_id: orderData.id,
            product_id: item.id,
            quantity: item.quantity,
            price_at_purchase: item.price
          }));
          await supabase.from('order_items').insert(orderItems);
        }

        return {
          id: orderData.id,
          userId,
          items,
          total,
          status: 'PAID',
          createdAt: orderData.created_at
        };
      } catch (e) {
        return {
          id: `local-order-${Date.now()}`,
          userId,
          items,
          total,
          status: 'PAID',
          createdAt: new Date().toISOString()
        };
      }
    },
    list: async (userId: string): Promise<Order[]> => {
      try {
        const { data, error } = await withTimeout<any>(
          supabase.from('orders').select(`*, order_items (*, products (*))`).eq('user_id', userId).order('created_at', { ascending: false })
        ) as any;
        if (error) throw error;
        return data.map((order: any) => ({
          id: order.id,
          userId: order.user_id,
          total: Number(order.total),
          status: order.status,
          createdAt: order.created_at,
          items: order.order_items.map((oi: any) => ({
            ...mapProduct(oi.products),
            quantity: oi.quantity
          }))
        }));
      } catch (e) { return []; }
    },
    cancel: async (orderId: string): Promise<void> => {
      try { await supabase.from('orders').update({ status: 'CANCELLED' }).eq('id', orderId); } catch (e) { }
    }
  }
};
