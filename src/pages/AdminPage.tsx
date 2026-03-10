import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/Input';
import { Plus, Trash2, Database, Loader2, RefreshCw, Edit, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Product } from '../types';
import { motion } from 'framer-motion';
import { formatPrice } from '../lib/utils';
import { generateProducts } from '../lib/mockDataGenerator';

export const AdminPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { register, handleSubmit, reset } = useForm();
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');

  React.useEffect(() => {
    refreshProducts();
  }, []);

  const refreshProducts = () => {
    api.products.list().then(setProducts);
  };

  const onSubmit = async (data: any) => {
    try {
      const newProduct = await api.products.create({
        ...data,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        category: data.category || 'Electronics',
        company: data.company || 'Generic'
      });
      setProducts([newProduct, ...products]);
      reset();
      toast.success('Product created');
    } catch (e) {
      toast.error('Failed to create product');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await api.products.delete(id);
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product deleted');
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm('WARNING: This will delete ALL existing products. Are you sure?')) return;
    setClearing(true);
    try {
      const currentProducts = await api.products.list();
      const dbProducts = currentProducts.filter(p => !p.id.startsWith('mock-') && !p.id.startsWith('static-'));
      await Promise.all(dbProducts.map(p => api.products.delete(p.id)));
      toast.success('Database cleared');
      refreshProducts();
    } catch (error) {
      toast.error('Failed to reset database');
    } finally {
      setClearing(false);
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      // Generate 140+ products with the new categories
      const newProducts = generateProducts(140);
      await api.products.createBulk(newProducts);
      toast.success('Database successfully seeded with 140+ new products!');
      refreshProducts();
    } catch (error) {
      console.error(error);
      toast.error('Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setEditPrice(product.price.toString());
  };

  const savePrice = async (id: string) => {
    const newPrice = parseFloat(editPrice);
    if (isNaN(newPrice) || newPrice < 0) {
      toast.error("Invalid price");
      return;
    }

    try {
      await api.products.update(id, { price: newPrice });
      setProducts(products.map(p => p.id === id ? { ...p, price: newPrice } : p));
      setEditingId(null);
      toast.success("Price updated");
    } catch (e) {
      toast.error("Failed to update price");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <div className="flex gap-2">
          <Button onClick={handleSeedData} disabled={seeding || clearing} variant="secondary">
            {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
            Reset & Seed 140+ Items
          </Button>

          <Button onClick={handleResetDatabase} disabled={seeding || clearing} variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
            {clearing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Clear Database
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-border shadow-sm sticky top-24">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2" /> Add New Product
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Product Name" {...register('name')} required />
              <Input label="Description" {...register('description')} required />
              <Input label="Category" {...register('category')} placeholder="Electronics" required />
              <Input label="Brand / Company" {...register('company')} placeholder="Apple, Nike, etc." required />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Price (₹)" type="number" step="1" {...register('price')} required />
                <Input label="Stock" type="number" {...register('stock')} required />
              </div>
              <Button type="submit" className="w-full">Create Product</Button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-gray-50 dark:bg-slate-900/50 flex justify-between items-center">
              <h2 className="font-semibold">Inventory ({products.length})</h2>
            </div>
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-slate-900 border-b border-border sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 font-medium text-muted-foreground">Product</th>
                    <th className="px-6 py-3 font-medium text-muted-foreground">Category</th>
                    <th className="px-6 py-3 font-medium text-muted-foreground">Price</th>
                    <th className="px-6 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map(product => (
                    <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                          <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                        </div>
                        <span className="truncate max-w-[150px]">{product.name}</span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{product.category}</td>
                      <td className="px-6 py-4">
                        {editingId === product.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-24 px-2 py-1 rounded border border-input bg-background"
                            />
                            <button onClick={() => savePrice(product.id)} className="text-green-600 hover:text-green-700"><Check className="h-4 w-4" /></button>
                            <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-600"><X className="h-4 w-4" /></button>
                          </div>
                        ) : (
                          formatPrice(product.price)
                        )}
                      </td>
                      <td className="px-6 py-4 flex items-center gap-2">
                        <button onClick={() => startEditing(product)} className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded" title="Edit Price">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
