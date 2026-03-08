import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Product } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { ProductsSkeletonGrid } from '../components/ui/Skeleton';
import { Filter, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter States
  const searchQuery = searchParams.get('search') || '';
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [maxPrice, setMaxPrice] = useState(500000);

  // Initial Category from URL
  const urlCategory = searchParams.get('category');
  useEffect(() => {
    if (urlCategory) {
        setSelectedCategory(urlCategory);
    }
  }, [urlCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await api.products.list();
        setProducts(data);
        
        if (data.length > 0) {
            const highestPrice = Math.max(...data.map(p => p.price));
            const roundedMax = Math.ceil(highestPrice / 1000) * 1000;
            const stableMax = Math.max(roundedMax, 10000);
            setMaxPrice(stableMax);
            setPriceRange([0, stableMax]);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Derived Data
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSubCategory = selectedSubCategory === 'All' || 
                                 (selectedCategory === 'Clothes' && product.name.includes(selectedSubCategory)); // Simple name check for sub-category if field missing
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice && matchesSubCategory;
    });
  }, [products, searchQuery, selectedCategory, selectedSubCategory, priceRange]);

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedSubCategory('All');
    setPriceRange([0, maxPrice]);
    setSearchParams({});
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Skeleton */}
          <div className="hidden md:block w-64 shrink-0">
            <div className="space-y-6">
              {[48, 36, 56, 32, 40].map((w, i) => (
                <div key={i} className="animate-pulse h-4 rounded-md bg-gray-200 dark:bg-slate-700" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
          {/* Grid Skeleton */}
          <div className="flex-1">
            <div className="animate-pulse h-8 w-40 rounded-md bg-gray-200 dark:bg-slate-700 mb-6" />
            <ProductsSkeletonGrid count={9} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center flex-col gap-4">
        <p className="text-red-500">Failed to load products. Please try again later.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Products</h1>
          <Button variant="outline" size="sm" onClick={() => setShowMobileFilters(true)}>
            <Filter className="h-4 w-4 mr-2" /> Filters
          </Button>
        </div>

        {/* Sidebar Filters */}
        <div className={`
          fixed inset-0 z-50 bg-background/95 backdrop-blur-sm md:backdrop-blur-none p-6 transform transition-transform duration-300 ease-in-out md:relative md:transform-none md:bg-transparent md:p-0 md:w-64 md:block
          ${showMobileFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="flex justify-between items-center md:hidden mb-6">
            <h2 className="text-xl font-bold">Filters</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowMobileFilters(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-8 sticky top-24">
            {/* Categories */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <label key={category} className="flex items-center space-x-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category"
                      checked={selectedCategory === category}
                      onChange={() => {
                          setSelectedCategory(category);
                          setSelectedSubCategory('All'); // Reset sub-category on main change
                      }}
                      className="form-radio text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-300 dark:border-gray-600 dark:bg-slate-800"
                    />
                    <span className={`text-sm group-hover:text-blue-600 transition-colors ${selectedCategory === category ? 'font-medium text-blue-600' : 'text-muted-foreground'}`}>
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sub-Categories (Only for Clothes) */}
            {selectedCategory === 'Clothes' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                    <h3 className="font-semibold text-lg mb-4">Gender / Type</h3>
                    <div className="space-y-2 pl-4 border-l-2 border-border">
                        {['All', 'Men', 'Women', 'Child'].map(sub => (
                            <label key={sub} className="flex items-center space-x-2 cursor-pointer group">
                                <input 
                                type="radio" 
                                name="subCategory"
                                checked={selectedSubCategory === sub}
                                onChange={() => setSelectedSubCategory(sub)}
                                className="form-radio text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-300 dark:border-gray-600 dark:bg-slate-800"
                                />
                                <span className={`text-sm group-hover:text-blue-600 transition-colors ${selectedSubCategory === sub ? 'font-medium text-blue-600' : 'text-muted-foreground'}`}>
                                {sub}
                                </span>
                            </label>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Price Range</h3>
              <div className="px-2">
                <input 
                  type="range"
                  min={0}
                  max={maxPrice}
                  step={100}
                  value={priceRange[1]}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) {
                        setPriceRange([0, val]);
                    }
                  }}
                  className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>₹0</span>
                  <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={clearFilters}
              disabled={selectedCategory === 'All' && priceRange[1] === maxPrice && !searchQuery}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="hidden md:flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">
              {searchQuery ? `Search results for "${searchQuery}"` : 
               selectedCategory !== 'All' ? selectedCategory : 'All Products'}
            </h1>
            <span className="text-muted-foreground">
              {filteredProducts.length} items found
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
              <Button variant="ghost" className="mt-4" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6"
            >
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
