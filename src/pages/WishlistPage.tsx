import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, ShoppingCart, Trash2, ArrowRight, Plus, FolderOpen, Folder,
  MoreVertical, Pencil, Check, X, ChevronDown, Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlistStore, type WishlistFolder, type WishlistItem } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { formatPrice } from '../lib/utils';
import { Button } from '../components/ui/button';
import { StarRating } from '../components/ui/StarRating';
import toast from 'react-hot-toast';

// ─── Colour map ───────────────────────────────────────────────────────────────
const COLOR_MAP: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  pink:    { bg: 'bg-pink-100 dark:bg-pink-900/30',   text: 'text-pink-600 dark:text-pink-400',   border: 'border-pink-400',   dot: 'bg-pink-500' },
  violet:  { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-400', dot: 'bg-violet-500' },
  blue:    { bg: 'bg-blue-100 dark:bg-blue-900/30',   text: 'text-blue-600 dark:text-blue-400',   border: 'border-blue-400',   dot: 'bg-blue-500' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-400', dot: 'bg-emerald-500' },
  amber:   { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-400',   dot: 'bg-amber-500' },
  rose:    { bg: 'bg-rose-100 dark:bg-rose-900/30',   text: 'text-rose-600 dark:text-rose-400',   border: 'border-rose-400',   dot: 'bg-rose-500' },
  cyan:    { bg: 'bg-cyan-100 dark:bg-cyan-900/30',   text: 'text-cyan-600 dark:text-cyan-400',   border: 'border-cyan-400',   dot: 'bg-cyan-500' },
  orange:  { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-400', dot: 'bg-orange-500' },
};
const getColor = (color: string) => COLOR_MAP[color] ?? COLOR_MAP.blue;

// ─── Move-to-folder dropdown ──────────────────────────────────────────────────
function MoveToFolderMenu({
  item,
  folders,
  onMove,
}: {
  item: WishlistItem;
  folders: WishlistFolder[];
  onMove: (folderId: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.preventDefault(); setOpen((v) => !v); }}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border dark:border-slate-600 rounded-lg px-2 py-1 transition-colors bg-background dark:bg-slate-900"
      >
        <Folder className="w-3 h-3" />
        {item.folderId
          ? (folders.find((f) => f.id === item.folderId)?.name ?? 'Folder')
          : 'Move to…'}
        <ChevronDown className="w-3 h-3" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full mb-1 left-0 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl shadow-xl min-w-[160px] py-1 overflow-hidden"
          >
            {/* Uncategorised option */}
            <button
              onClick={(e) => { e.preventDefault(); onMove(null); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted dark:hover:bg-slate-700 transition-colors ${item.folderId === null ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-foreground'}`}
            >
              <Heart className="w-3.5 h-3.5" /> All items
              {item.folderId === null && <Check className="w-3 h-3 ml-auto" />}
            </button>

            {folders.length > 0 && <div className="border-t border-border dark:border-slate-700 my-1" />}

            {folders.map((folder) => {
              const c = getColor(folder.color);
              return (
                <button
                  key={folder.id}
                  onClick={(e) => { e.preventDefault(); onMove(folder.id); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted dark:hover:bg-slate-700 transition-colors ${item.folderId === folder.id ? 'font-medium' : 'text-foreground'}`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.dot}`} />
                  <span className="truncate">{folder.name}</span>
                  {item.folderId === folder.id && <Check className="w-3 h-3 ml-auto flex-shrink-0" />}
                </button>
              );
            })}

            {folders.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground italic">No folders yet</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Product card ──────────────────────────────────────────────────────────────
function WishlistCard({
  product,
  folders,
}: {
  product: WishlistItem;
  folders: WishlistFolder[];
}) {
  const { removeItem, moveItemToFolder } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    removeItem(product.id);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    removeItem(product.id);
    toast.success('Removed from wishlist');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group bg-card border border-border dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-xl hover:border-pink-400/40 dark:hover:border-pink-500/30 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <Link to={`/products/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-muted dark:bg-slate-800 flex-shrink-0">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
          <span className="text-white text-sm font-medium">View Details</span>
        </div>
        {/* Remove heart */}
        <button
          onClick={handleRemove}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm flex items-center justify-center shadow hover:scale-110 transition-transform duration-200"
        >
          <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
        </button>
      </Link>

      {/* Body */}
      <div className="p-3 flex flex-col flex-grow">
        <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mb-1">{product.category}</p>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-foreground text-sm line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-1.5">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mb-3">
          <StarRating rating={product.rating || 0} size={11} />
          <span className="text-[10px] text-muted-foreground">({product.reviewCount || 0})</span>
        </div>

        <div className="mt-auto space-y-2">
          {/* Price + cart */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">{formatPrice(product.price)}</span>
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add to Cart
            </button>
          </div>

          {/* Move-to-folder */}
          <MoveToFolderMenu
            item={product}
            folders={folders}
            onMove={(folderId) => {
              moveItemToFolder(product.id, folderId);
              const name = folderId ? (folders.find((f) => f.id === folderId)?.name ?? 'folder') : 'All items';
              toast.success(`Moved to "${name}"`);
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export const WishlistContent = () => {
  const { items, folders, createFolder, deleteFolder, renameFolder, clearWishlist } = useWishlistStore();

  // Active folder: null = "All items", string = folder id
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [folderMenuOpen, setFolderMenuOpen] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const folder = createFolder(newFolderName);
    setNewFolderName('');
    setShowCreateInput(false);
    setActiveFolder(folder.id);
    toast.success(`Folder "${folder.name}" created!`);
  };

  const handleRename = (folderId: string) => {
    if (!editingName.trim()) return;
    renameFolder(folderId, editingName);
    setEditingFolderId(null);
    toast.success('Folder renamed');
  };

  const handleDeleteFolder = (folderId: string, itemCount: number) => {
    if (itemCount > 0 && deleteConfirm !== folderId) {
      setDeleteConfirm(folderId);
      return;
    }
    const name = folders.find((f) => f.id === folderId)?.name ?? 'Folder';
    deleteFolder(folderId, true); // moves items back to uncategorised
    if (activeFolder === folderId) setActiveFolder(null);
    setDeleteConfirm(null);
    setFolderMenuOpen(null);
    toast.success(`"${name}" deleted — items moved to All items`);
  };

  // Filtered items for active view
  const visibleItems =
    activeFolder === null
      ? items
      : items.filter((i) => i.folderId === activeFolder);

  const getFolderCount = (folderId: string | null) =>
    folderId === null ? items.length : items.filter((i) => i.folderId === folderId).length;

  // Empty state
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <div className="w-24 h-24 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-6">
            <Heart className="w-12 h-12 text-pink-400 dark:text-pink-300" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Save items you love by clicking the ❤️ icon on any product.
          </p>
          <Link to="/products">
            <Button size="lg">Browse Products <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
            <Heart className="w-5 h-5 text-pink-500 dark:text-pink-400 fill-pink-500 dark:fill-pink-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Wishlist</h1>
            <p className="text-sm text-muted-foreground">{items.length} saved item{items.length !== 1 ? 's' : ''} across {folders.length + 1} collection{folders.length > 0 ? 's' : ''}</p>
          </div>
        </div>
        {items.length > 0 && (
          <button
            onClick={() => { clearWishlist(); toast.success('Wishlist cleared'); }}
            className="text-sm text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Clear all
          </button>
        )}
      </div>

      {/* Two-column layout: sidebar + grid */}
      <div className="flex flex-col md:flex-row gap-6">

        {/* ── Folder Sidebar ────────────────────────────────────────────── */}
        <aside className="w-full md:w-56 flex-shrink-0 space-y-1 md:sticky md:top-24">
          {/* All items */}
          <button
            onClick={() => setActiveFolder(null)}
            className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              activeFolder === null
                ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 shadow-sm'
                : 'text-foreground hover:bg-muted dark:hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2">
              <Heart className={`w-4 h-4 ${activeFolder === null ? 'fill-pink-500 text-pink-500' : 'text-muted-foreground'}`} />
              All items
            </span>
            <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${activeFolder === null ? 'bg-pink-200 dark:bg-pink-800 text-pink-700 dark:text-pink-300' : 'bg-muted text-muted-foreground'}`}>
              {items.length}
            </span>
          </button>

          {folders.length > 0 && (
            <div className="pt-2 pb-1 px-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Collections</p>
            </div>
          )}

          {/* Folder list */}
          <AnimatePresence>
            {folders.map((folder) => {
              const c = getColor(folder.color);
              const count = getFolderCount(folder.id);
              const isActive = activeFolder === folder.id;
              const isEditing = editingFolderId === folder.id;

              return (
                <motion.div
                  key={folder.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.25 }}
                  className={`group relative rounded-xl transition-all duration-200 ${
                    isActive ? `${c.bg} shadow-sm` : 'hover:bg-muted dark:hover:bg-slate-800'
                  }`}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1 px-2 py-2">
                      <input
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(folder.id);
                          if (e.key === 'Escape') setEditingFolderId(null);
                        }}
                        className="flex-1 text-sm bg-background dark:bg-slate-900 border border-border dark:border-slate-600 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                      />
                      <button onClick={() => handleRename(folder.id)} className="text-green-500 hover:text-green-600"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setEditingFolderId(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setActiveFolder(folder.id); setFolderMenuOpen(null); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left"
                    >
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.dot}`} />
                      <span className={`flex-1 truncate font-medium ${isActive ? c.text : 'text-foreground'}`}>{folder.name}</span>
                      <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold flex-shrink-0 ${isActive ? `${c.bg} ${c.text}` : 'bg-muted text-muted-foreground'}`}>
                        {count}
                      </span>
                    </button>
                  )}

                  {/* Folder kebab menu */}
                  {!isEditing && (
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setFolderMenuOpen(folderMenuOpen === folder.id ? null : folder.id); }}
                          className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-border dark:hover:bg-slate-700 text-muted-foreground"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        <AnimatePresence>
                          {folderMenuOpen === folder.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.12 }}
                              className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 min-w-[130px]"
                            >
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingFolderId(folder.id); setEditingName(folder.name); setFolderMenuOpen(null); }}
                                className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted dark:hover:bg-slate-700 text-foreground transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" /> Rename
                              </button>
                              {deleteConfirm === folder.id ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id, count); }}
                                  className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-medium transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Confirm delete
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id, count); }}
                                  className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                  {count > 0 && <span className="text-xs opacity-70">({count} items back)</span>}
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Create new folder */}
          <div className="pt-2">
            {showCreateInput ? (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 px-1"
              >
                <input
                  ref={createInputRef}
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateFolder();
                    if (e.key === 'Escape') { setShowCreateInput(false); setNewFolderName(''); }
                  }}
                  placeholder="Folder name…"
                  className="flex-1 text-sm bg-background dark:bg-slate-900 border border-blue-400 dark:border-blue-500 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-foreground placeholder:text-muted-foreground"
                />
                <button
                  onClick={handleCreateFolder}
                  className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center flex-shrink-0 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setShowCreateInput(false); setNewFolderName(''); }}
                  className="w-8 h-8 rounded-xl hover:bg-muted dark:hover:bg-slate-800 text-muted-foreground flex items-center justify-center flex-shrink-0 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <button
                onClick={() => setShowCreateInput(true)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                New collection
              </button>
            )}
          </div>
        </aside>

        {/* ── Items Grid ───────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Active folder header */}
          <div className="flex items-center gap-2 mb-4">
            {activeFolder !== null ? (
              (() => {
                const folder = folders.find((f) => f.id === activeFolder);
                if (!folder) return null;
                const c = getColor(folder.color);
                return (
                  <>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${c.bg}`}>
                      <FolderOpen className={`w-4 h-4 ${c.text}`} />
                    </div>
                    <h2 className={`font-semibold text-lg ${c.text}`}>{folder.name}</h2>
                    <span className="text-sm text-muted-foreground">· {visibleItems.length} item{visibleItems.length !== 1 ? 's' : ''}</span>
                  </>
                );
              })()
            ) : (
              <>
                <div className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                </div>
                <h2 className="font-semibold text-lg text-foreground">All items</h2>
                <span className="text-sm text-muted-foreground">· {visibleItems.length} item{visibleItems.length !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>

          {/* Empty folder state */}
          {visibleItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted dark:bg-slate-800 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">This collection is empty</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Move items here using the "Move to…" button on any saved item.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {visibleItems.map((product, i) => (
                  <motion.div
                    key={product.id}
                    layout
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    <WishlistCard product={product} folders={folders} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const WishlistPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <WishlistContent />
    </div>
  );
};
