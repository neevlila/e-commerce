import { supabase } from './supabase';
import { Product, Order, User, Review } from '../types';
import { MOCK_PRODUCTS } from './mockData';

// Helper to map DB snake_case to frontend camelCase
const mapProduct = (data: any): Product => ({
  id: data.id,
  name: data.name,
  description: data.description,
  price: Number(data.price),
  imageUrl: data.image_url,
  category: data.category,
  stock: data.stock,
  createdAt: data.created_at,
  // If we have joined reviews or stored aggregates
  rating: data.rating || 0,
  reviewCount: data.review_count || 0
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
const withTimeout = <T>(promise: Promise<T>, ms: number = 2000): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) => 
            setTimeout(() => reject(new Error('Request timed out')), ms)
        )
    ]);
};

// Local Storage Helpers
const STORAGE_KEY = 'novastore-products';
const REVIEWS_KEY = 'novastore-reviews';

const getLocalProducts = (): Product[] | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (e) { return null; }
};

const setLocalProducts = (products: Product[]) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); } catch (e) {}
};

const getLocalReviews = (): Review[] => {
    try {
        const stored = localStorage.getItem(REVIEWS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) { return []; }
};

const setLocalReviews = (reviews: Review[]) => {
    try { localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews)); } catch (e) {}
};

export const api = {
  auth: {
    getProfile: async (userId: string): Promise<User | null> => {
      try {
        const { data, error } = await withTimeout(
            supabase.from('profiles').select('*').eq('id', userId).single()
        );
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
        const { data, error } = await withTimeout(
            supabase.from('products').select('*').order('created_at', { ascending: false })
        );
          
        if (error) throw error;
        
        if (!data || data.length === 0) {
            const local = getLocalProducts();
            if (local && local.length > 0) return local;
            // Use the massive static list if DB is empty
            setLocalProducts(MOCK_PRODUCTS);
            return MOCK_PRODUCTS; 
        }
        
        const mappedData = data.map(mapProduct);
        setLocalProducts(mappedData);
        return mappedData;

      } catch (error) {
        const local = getLocalProducts();
        if (local && local.length > 0) return local;
        setLocalProducts(MOCK_PRODUCTS);
        return MOCK_PRODUCTS; 
      }
    },
    get: async (id: string): Promise<Product | undefined> => {
      const local = getLocalProducts() || MOCK_PRODUCTS;
      const localProduct = local.find(p => p.id === id);
      
      try {
        const { data, error } = await withTimeout(
            supabase.from('products').select('*').eq('id', id).single()
        );
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
            if (!id.startsWith('mock-') && !id.startsWith('local-') && !id.startsWith('static-')) {
                const dbPayload: any = {};
                if (updates.price !== undefined) dbPayload.price = updates.price;
                if (updates.name !== undefined) dbPayload.name = updates.name;
                if (updates.rating !== undefined) dbPayload.rating = updates.rating;
                if (updates.reviewCount !== undefined) dbPayload.review_count = updates.reviewCount;

                await supabase.from('products').update(dbPayload).eq('id', id);
            }
        } catch (e) {
            console.warn("Update DB failed, local only");
        }
        return updatedItem;
    },
    delete: async (id: string): Promise<void> => {
      const current = getLocalProducts() || MOCK_PRODUCTS;
      setLocalProducts(current.filter(p => p.id !== id));
      try {
          if (!id.startsWith('mock-') && !id.startsWith('local-') && !id.startsWith('static-')) {
            await supabase.from('products').delete().eq('id', id);
          }
      } catch (e) {}
    }
  },

  reviews: {
    list: async (productId: string): Promise<Review[]> => {
        try {
            const { data, error } = await withTimeout(
                supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false })
            );
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
        const allReviews = [...getLocalReviews().filter(r => r.productId === review.productId), newReview];
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
        const { data, error } = await withTimeout(
            supabase.from('orders').select(`*, order_items (*, products (*))`).eq('user_id', userId).order('created_at', { ascending: false })
        );
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
      try { await supabase.from('orders').update({ status: 'CANCELLED' }).eq('id', orderId); } catch (e) {}
    }
  }
};
