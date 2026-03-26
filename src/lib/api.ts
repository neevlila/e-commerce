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
  rating: data.rating || 0,
  reviewCount: data.review_count || data.reviewCount || 0,
});

const mapReview = (data: any): Review => ({
  id: data.id,
  userId: data.user_id,
  userName: data.user_name || 'Anonymous',
  productId: data.product_id,
  rating: data.rating,
  comment: data.comment,
  createdAt: data.created_at,
});

// Timeout helper
const withTimeout = <T>(promise: any, ms: number = 2000): Promise<T> => {
  return Promise.race([
    promise as Promise<T>,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms)
    ),
  ]);
};

// ─── Local Storage Helpers ────────────────────────────────────────────────────
// Used as a performance cache only — never as a source of truth for auth/limits.
const STORAGE_KEY = 'stylehub-products-v1';
const ORDERS_STORAGE_KEY = 'stylehub-orders-v1';

const getLocalProducts = (): Product[] | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};

const setLocalProducts = (products: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    /* quota exceeded — non-fatal */
  }
};

// ─────────────────────────────────────────────────────────────────────────────

export const api = {
  auth: {
    getProfile: async (userId: string): Promise<User | null> => {
      try {
        const { data, error } = (await withTimeout<any>(
          supabase.from('profiles').select('*').eq('id', userId).single()
        )) as any;
        if (error) return null;
        return {
          id: data.id,
          email: data.email,
          name: data.full_name,
          role: data.role as 'USER' | 'ADMIN',
          addresses: data.addresses || [],
          upiDetails: data.upi_details || [],
          cardDetails: data.card_details || [],
        };
      } catch (e) {
        return null;
      }
    },
    updateProfile: async (userId: string, updates: Partial<User>): Promise<void> => {
      try {
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.full_name = updates.name;
        if (updates.addresses) dbUpdates.addresses = updates.addresses;
        if (updates.upiDetails) dbUpdates.upi_details = updates.upiDetails;
        if (updates.cardDetails) dbUpdates.card_details = updates.cardDetails;

        const { error } = await supabase
          .from('profiles')
          .update(dbUpdates)
          .eq('id', userId);
        if (error) throw error;
      } catch (e) {
        console.error('Update profile error:', e);
        throw e;
      }
    },
  },

  products: {
    list: async (): Promise<Product[]> => {
      try {
        const { data, error } = (await withTimeout<any>(
          supabase.from('products').select('*').order('created_at', { ascending: false })
        )) as any;

        if (error) throw error;

        if (!data || data.length === 0) {
          const local = getLocalProducts();
          if (local && local.length >= MOCK_PRODUCTS.length) return local;
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
      const localProduct = local.find((p) => p.id === id);

      try {
        const { data, error } = (await withTimeout<any>(
          supabase.from('products').select('*').eq('id', id).single()
        )) as any;
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
          .insert([
            {
              name: product.name,
              description: product.description,
              price: product.price,
              image_url: product.imageUrl,
              category: product.category,
              company: product.company,
              stock: product.stock,
              rating: product.rating || 0,
              review_count: product.reviewCount || 0,
            },
          ])
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
          reviewCount: product.reviewCount || 0,
        };
        const current = getLocalProducts() || MOCK_PRODUCTS;
        setLocalProducts([newProduct, ...current]);
        return newProduct;
      }
    },

    createBulk: async (products: Omit<Product, 'id' | 'createdAt'>[]): Promise<void> => {
      try {
        const dbPayload = products.map((p) => ({
          name: p.name,
          description: p.description,
          price: p.price,
          image_url: p.imageUrl,
          category: p.category,
          company: p.company,
          stock: p.stock,
          rating: p.rating || 0,
          review_count: p.reviewCount || 0,
        }));

        const { error } = await supabase.from('products').insert(dbPayload);
        if (error) throw error;
      } catch (e) {
        console.warn('Bulk DB insert failed, using local');
        const current = getLocalProducts() || [];
        const newLocal = products.map((p, i) => ({
          ...p,
          id: `local-bulk-${Date.now()}-${i}`,
          createdAt: new Date().toISOString(),
        }));
        setLocalProducts([...newLocal, ...current]);
      }
    },

    update: async (id: string, updates: Partial<Product>): Promise<Product> => {
      const current = getLocalProducts() || MOCK_PRODUCTS;
      const updatedLocal = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
      setLocalProducts(updatedLocal);
      const updatedItem = updatedLocal.find((p) => p.id === id)!;

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
            stock: updates.stock,
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
      const cartProductIds = new Set(cartItems.map((item) => item.id));

      if (cartItems.length === 0) {
        return allProducts
          .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
          .slice(0, 8);
      }

      // ✅ PERFORMANCE: Build lookup maps once instead of filtering arrays per cart item.
      const productsByCategory = new Map<string, Product[]>();
      for (const p of allProducts) {
        if (!productsByCategory.has(p.category)) productsByCategory.set(p.category, []);
        productsByCategory.get(p.category)!.push(p);
      }

      let recommended: Product[] = [];

      for (const item of cartItems) {
        const name = item.name.toLowerCase();
        const cat = item.category.toLowerCase();

        const notInCart = (p: Product) => !cartProductIds.has(p.id);
        const matchesGender = (p: Product) => {
          const pSub = p.subCategory?.toLowerCase();
          const itemSub = item.subCategory?.toLowerCase();
          if (itemSub && pSub && itemSub !== pSub) {
            if (itemSub !== 'child' && pSub !== 'child') return false;
          }
          return true;
        };

        if (
          name.includes('pant') ||
          name.includes('chino') ||
          name.includes('jeans') ||
          name.includes('trousers') ||
          name.includes('jogger')
        ) {
          const suggestions = allProducts.filter(
            (p) =>
              notInCart(p) &&
              matchesGender(p) &&
              (p.name.toLowerCase().includes('shirt') ||
                p.name.toLowerCase().includes('tee') ||
                p.category.toLowerCase() === 'shoes' ||
                p.category.toLowerCase() === 'jewelry')
          );
          recommended.push(...suggestions);
        } else if (name.includes('shirt') || name.includes('tee')) {
          const suggestions = allProducts.filter(
            (p) =>
              notInCart(p) &&
              matchesGender(p) &&
              (p.name.toLowerCase().includes('pant') ||
                p.name.toLowerCase().includes('chino') ||
                p.name.toLowerCase().includes('jeans') ||
                p.category.toLowerCase() === 'shoes')
          );
          recommended.push(...suggestions);
        } else if (name.includes('jacket')) {
          const suggestions = allProducts.filter(
            (p) =>
              notInCart(p) &&
              matchesGender(p) &&
              (p.name.toLowerCase().includes('pant') ||
                p.name.toLowerCase().includes('shirt') ||
                p.category.toLowerCase() === 'shoes')
          );
          recommended.push(...suggestions);
        } else if (name.includes('dress')) {
          const suggestions = allProducts.filter(
            (p) =>
              notInCart(p) &&
              (p.category.toLowerCase() === 'shoes' || p.category.toLowerCase() === 'jewelry')
          );
          recommended.push(...suggestions);
        } else if (cat === 'electronics') {
          const suggestions = (productsByCategory.get('electronics') || []).filter(
            (p) =>
              notInCart(p) &&
              p.id !== item.id &&
              (p.company === item.company ||
                p.name.toLowerCase().includes('keyboard') ||
                p.name.toLowerCase().includes('mouse') ||
                p.name.toLowerCase().includes('headphone') ||
                p.name.toLowerCase().includes('monitor') ||
                p.name.toLowerCase().includes('watch') ||
                p.name.toLowerCase().includes('pad'))
          );
          recommended.push(...suggestions);
        }
      }

      if (recommended.length < 8) {
        const cartCategories = new Set(cartItems.map((item) => item.category));
        const hasTech = cartItems.some((item) => item.category === 'Electronics');
        const hasSkinCare = cartItems.some((item) => item.category === 'Skin Care');

        const extra = allProducts
          .filter((p) => {
            if (cartProductIds.has(p.id)) return false;
            if (recommended.some((r) => r.id === p.id)) return false;

            if (hasTech && !cartCategories.has(p.category)) {
              if (
                p.category === 'Jewelry' ||
                p.category === 'Home & Living' ||
                p.category === 'Skin Care' ||
                p.category === 'Sports'
              )
                return false;
            }

            if (hasSkinCare && !cartCategories.has(p.category)) {
              if (
                p.category === 'Electronics' ||
                p.category === 'Sports' ||
                p.category === 'Home & Living'
              )
                return false;
            }

            if (recommended.length > 0 && !cartCategories.has(p.category)) {
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

      return Array.from(new Map(recommended.map((p) => [p.id, p])).values())
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 8);
    },

    delete: async (id: string): Promise<void> => {
      const current = getLocalProducts() || MOCK_PRODUCTS;
      setLocalProducts(current.filter((p) => p.id !== id));
      try {
        if (!id.startsWith('mock-') && !id.startsWith('local-') && !id.startsWith('static-')) {
          await supabase.from('products').delete().eq('id', id);
        }
      } catch (e) {
        /* non-fatal */
      }
    },
  },

  reviews: {
    list: async (productId: string): Promise<Review[]> => {
      try {
        const { data, error } = (await withTimeout<any>(
          supabase
            .from('reviews')
            .select('*')
            .eq('product_id', productId)
            .order('created_at', { ascending: false })
        )) as any;
        if (error) throw error;
        return data.map(mapReview);
      } catch (e) {
        return [];
      }
    },

    add: async (review: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
      // ✅ FIXED: The DB is the ONLY source of truth for the review limit.
      // localStorage is no longer used as a gate — it was trivially bypassable.
      // The actual enforcement happens via a Supabase DB constraint or RLS policy.
      //
      // Recommended: add this constraint to your `reviews` table in Supabase:
      //   ALTER TABLE reviews ADD CONSTRAINT max_reviews_per_user_per_product
      //   UNIQUE (user_id, product_id);   -- or use a trigger for a count limit
      //
      // For a soft 2-review limit, use a DB trigger or check in the Edge Function.

      try {
        // Check DB count FIRST — do not rely on localStorage
        const { count, error: countError } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', review.userId)
          .eq('product_id', review.productId);

        if (!countError && count !== null && count >= 2) {
          throw new Error('You can only submit up to 2 reviews for this product.');
        }

        const { data, error } = await supabase
          .from('reviews')
          .insert([
            {
              user_id: review.userId,
              user_name: review.userName,
              product_id: review.productId,
              rating: review.rating,
              comment: review.comment,
            },
          ])
          .select()
          .single();

        if (error) {
          // Surface the error message from DB (e.g. unique constraint violation)
          throw new Error(error.message);
        }

        const newReview = mapReview(data);

        // Update product rating average
        const product = (getLocalProducts() || MOCK_PRODUCTS).find(
          (p) => p.id === review.productId
        );
        if (product) {
          const oldRating = product.rating || 0;
          const oldCount = product.reviewCount || 0;
          const newCount = oldCount + 1;
          const newRating = (oldRating * oldCount + review.rating) / newCount;

          await api.products.update(review.productId, {
            rating: Number(newRating.toFixed(1)),
            reviewCount: newCount,
          });
        }

        return newReview;
      } catch (e: any) {
        throw e; // Propagate error to UI — do not silently swallow
      }
    },

    delete: async (reviewId: string, productId: string): Promise<void> => {
      try {
        const { error } = await supabase
          .from('reviews')
          .delete()
          .eq('id', reviewId);

        if (error) throw new Error(error.message);

        // Recalculate product rating after deletion
        const { data: remaining } = await supabase
          .from('reviews')
          .select('rating')
          .eq('product_id', productId);

        if (remaining !== null) {
          const newCount = remaining.length;
          const newRating =
            newCount > 0
              ? remaining.reduce((sum: number, r: any) => sum + r.rating, 0) / newCount
              : 0;

          await api.products.update(productId, {
            rating: Number(newRating.toFixed(1)),
            reviewCount: newCount,
          });
        }
      } catch (e: any) {
        throw e;
      }
    },
  },

  orders: {
    create: async (userId: string, items: any[], total: number, status: 'PENDING' | 'PAID' | 'CANCELLED' = 'PAID'): Promise<Order> => {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert([{ user_id: userId, total: total, status: status }])
          .select()
          .single();

        if (orderError) throw orderError;

        const validItems = items.filter(
          (i) =>
            !i.id.startsWith('mock-') &&
            !i.id.startsWith('local-') &&
            !i.id.startsWith('static-')
        );
        if (validItems.length > 0) {
          const orderItems = validItems.map((item: any) => ({
            order_id: orderData.id,
            product_id: item.id,
            quantity: item.quantity,
            price_at_purchase: item.price,
          }));
          await supabase.from('order_items').insert(orderItems);
        }

        return {
          id: orderData.id,
          userId,
          items,
          total,
          status: status,
          createdAt: orderData.created_at,
        };
      } catch (e) {
        // Fallback local order (for dev/demo only — will NOT persist refresh)
        return {
          id: `local-order-${Date.now()}`,
          userId,
          items,
          total,
          status: status,
          createdAt: new Date().toISOString(),
        };
      }
    },

    list: async (userId: string): Promise<Order[]> => {
      try {
        const { data, error } = (await withTimeout<any>(
          supabase
            .from('orders')
            .select(`*, order_items (*, products (*))`)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
        )) as any;

        if (error) throw error;

        return (data || []).map((order: any) => ({
          id: order.id,
          userId: order.user_id,
          total: Number(order.total),
          status: order.status,
          createdAt: order.created_at,
          items: (order.order_items || [])
            .map((oi: any) => ({
              ...(oi.products ? mapProduct(oi.products) : { 
                  id: oi.product_id, 
                  name: 'Product details unavailable', 
                  imageUrl: 'https://placehold.co/100x100?text=Product', 
                  price: oi.price_at_purchase || 0,
                  category: 'Unknown'
              } as any),
              quantity: oi.quantity,
            })),
        }));
      } catch (e) {
        return [];
      }
    },

    cancel: async (orderId: string): Promise<void> => {
      try {
        await supabase.from('orders').update({ status: 'CANCELLED' }).eq('id', orderId);
      } catch (e) {
        /* non-fatal */
      }
    },
  },
};