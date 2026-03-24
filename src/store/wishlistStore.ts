import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WishlistFolder {
  id: string;
  name: string;
  color: string; // Tailwind colour token for visual identity
  createdAt: number;
}

export interface WishlistItem extends Product {
  folderId: string | null; // null = "All / Uncategorised"
  addedAt: number;
}

// Pre-built palette so every new folder gets a distinct colour automatically
const FOLDER_COLORS = [
  'pink', 'violet', 'blue', 'emerald', 'amber', 'rose', 'cyan', 'orange',
];

// ─── Store ────────────────────────────────────────────────────────────────────

interface WishlistState {
  items: WishlistItem[];
  folders: WishlistFolder[];

  // Item actions
  addItem: (product: Product, folderId?: string | null) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
  moveItemToFolder: (productId: string, folderId: string | null) => void;
  clearWishlist: () => void;

  // Folder actions
  createFolder: (name: string) => WishlistFolder;
  deleteFolder: (folderId: string, moveItemsToUncategorised?: boolean) => void;
  renameFolder: (folderId: string, name: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      folders: [],

      // ── Item actions ──────────────────────────────────────────────────────
      addItem: (product, folderId = null) => {
        if (!get().isWishlisted(product.id)) {
          const item: WishlistItem = { ...product, folderId, addedAt: Date.now() };
          set({ items: [...get().items, item] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.id !== productId) });
      },

      toggleItem: (product) => {
        if (get().isWishlisted(product.id)) {
          get().removeItem(product.id);
        } else {
          get().addItem(product, null);
        }
      },

      isWishlisted: (productId) => {
        if (!productId) return false;
        const items = get().items || [];
        return items.some((i) => String(i.id) === String(productId));
      },

      moveItemToFolder: (productId, folderId) => {
        set({
          items: get().items.map((i) =>
            i.id === productId ? { ...i, folderId } : i
          ),
        });
      },

      clearWishlist: () => set({ items: [] }),

      // ── Folder actions ────────────────────────────────────────────────────
      createFolder: (name) => {
        const usedColors = get().folders.map((f) => f.color);
        const color =
          FOLDER_COLORS.find((c) => !usedColors.includes(c)) ??
          FOLDER_COLORS[get().folders.length % FOLDER_COLORS.length];

        const folder: WishlistFolder = {
          id: `folder_${Date.now()}`,
          name: name.trim(),
          color,
          createdAt: Date.now(),
        };
        set({ folders: [...get().folders, folder] });
        return folder;
      },

      deleteFolder: (folderId, moveItemsToUncategorised = true) => {
        set({
          folders: get().folders.filter((f) => f.id !== folderId),
          items: moveItemsToUncategorised
            ? get().items.map((i) =>
                i.folderId === folderId ? { ...i, folderId: null } : i
              )
            : get().items.filter((i) => i.folderId !== folderId),
        });
      },

      renameFolder: (folderId, name) => {
        set({
          folders: get().folders.map((f) =>
            f.id === folderId ? { ...f, name: name.trim() } : f
          ),
        });
      },
    }),
    {
      name: 'wishlist-storage-v2',
      partialize: (state) => ({
        items: state.items,
        folders: state.folders,
      }),
    }
  )
);
