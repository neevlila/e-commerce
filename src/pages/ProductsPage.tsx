import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Product } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { ProductsSkeletonGrid } from '../components/ui/Skeleton';
import { Filter, X, Star, ChevronDown, Building2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/Slider';
import { motion, AnimatePresence } from 'framer-motion';

type SortOption = 'most-popular' | 'top-rated' | 'latest' | 'price-low-high' | 'price-high-low';

// ── Stable discount seeded from product ID (stays in sync with HomePage) ──────
function seededDiscount(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return (hash % 31) + 20; // 20–50%, deterministic per product
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'latest', label: 'Latest' },
  { value: 'most-popular', label: 'Most Popular' },
  { value: 'top-rated', label: 'Top Rated' },
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'price-high-low', label: 'Price: High to Low' },
];

// ✅ PERFORMANCE: Custom debounce hook — prevents filtering on every keystroke.
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Initial values from URL
  const urlCategory = searchParams.get('category');
  const urlSubCategory = searchParams.get('subCategory');

  // Filter States
  const searchQuery = searchParams.get('search') || '';
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory || 'All');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(urlSubCategory || 'All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [maxPrice, setMaxPrice] = useState(500000);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [showAllCompanies, setShowAllCompanies] = useState(false);

  // ✅ PERFORMANCE: Debounce the search query by 150ms to avoid filtering on
  // every keystroke when the user types quickly.
  const debouncedSearch = useDebounce(searchQuery, 150);

  // Sync state if URL changes
  useEffect(() => {
    setSelectedCategory(urlCategory || 'All');
    setSelectedSubCategory(urlSubCategory || 'All');
  }, [urlCategory, urlSubCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await api.products.list();
        setProducts(data);

        if (data.length > 0) {
          const highestPrice = Math.max(...data.map((p) => p.price));
          const roundedMax = Math.ceil(highestPrice / 1000) * 1000;
          const stableMax = Math.max(roundedMax, 10000);
          setMaxPrice(stableMax);
          setPriceRange([0, stableMax]);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ✅ PERFORMANCE: Memoize categories — previously this was recomputed on EVERY render.
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  // Get unique companies from filtered products (by current category)
  const availableCompanies = useMemo(() => {
    const categoryFiltered =
      selectedCategory === 'All'
        ? products
        : products.filter((p) => p.category === selectedCategory);
    return Array.from(new Set(categoryFiltered.map((p) => p.company))).sort();
  }, [products, selectedCategory]);

  // ✅ PERFORMANCE: Use debouncedSearch in the filter memo so it only recalculates
  // after the user pauses typing, not on every character.
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        product.description.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSubCategory =
        selectedSubCategory === 'All' ||
        ((selectedCategory === 'Clothes' || selectedCategory === 'Shoes') &&
          product.name.includes(selectedSubCategory));
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesRating = (product.rating || 0) >= minRating;
      const matchesCompany =
        selectedCompanies.length === 0 || selectedCompanies.includes(product.company);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesSubCategory &&
        matchesRating &&
        matchesCompany
      );
    });

    switch (sortBy) {
      case 'most-popular':
        result = [...result].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      case 'top-rated':
        result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'latest':
        result = [...result].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'price-low-high':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [products, debouncedSearch, selectedCategory, selectedSubCategory, priceRange, minRating, selectedCompanies, sortBy]);

  const clearFilters = useCallback(() => {
    setSelectedCategory('All');
    setSelectedSubCategory('All');
    setPriceRange([0, maxPrice]);
    setMinRating(0);
    setSelectedCompanies([]);
    setSortBy('latest');
    setSearchParams({});
  }, [maxPrice, setSearchParams]);

  const toggleCompany = useCallback((company: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company]
    );
  }, []);

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    priceRange[1] !== maxPrice ||
    !!searchQuery ||
    minRating > 0 ||
    selectedCompanies.length > 0 ||
    sortBy !== 'latest';

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#sort-dropdown-container')) {
        setSortDropdownOpen(false);
      }
    };
    // ✅ PERFORMANCE: passive listener — tells browser no preventDefault() so it
    // can optimise scroll handling.
    document.addEventListener('click', handleClickOutside, { passive: true });
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const COMPANIES_TO_SHOW = 5;
  const displayedCompanies = showAllCompanies
    ? availableCompanies
    : availableCompanies.slice(0, COMPANIES_TO_SHOW);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="hidden md:block w-64 shrink-0">
            <div className="space-y-6">
              {[48, 36, 56, 32, 40].map((w, i) => (
                <div
                  key={i}
                  className="animate-pulse h-4 rounded-md bg-gray-200 dark:bg-slate-700"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          </div>
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
        <div
          className={`
            fixed inset-0 z-50 md:z-0 bg-background/95 backdrop-blur-sm md:backdrop-blur-none p-6 transform transition-transform duration-300 ease-in-out md:relative md:transform-none md:bg-transparent md:p-0 md:w-64 md:block
            ${showMobileFilters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="flex justify-between items-center md:hidden mb-6">
            <h2 className="text-xl font-bold">Filters</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowMobileFilters(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <FilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedSubCategory={selectedSubCategory}
            setSelectedSubCategory={setSelectedSubCategory}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            minRating={minRating}
            setMinRating={setMinRating}
            availableCompanies={availableCompanies}
            displayedCompanies={displayedCompanies}
            selectedCompanies={selectedCompanies}
            toggleCompany={toggleCompany}
            showAllCompanies={showAllCompanies}
            setShowAllCompanies={setShowAllCompanies}
            COMPANIES_TO_SHOW={COMPANIES_TO_SHOW}
            maxPrice={maxPrice}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            clearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="hidden md:flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">
              {searchQuery
                ? `Search results for "${searchQuery}"`
                : selectedCategory !== 'All'
                ? selectedCategory
                : 'All Products'}
            </h1>

            {/* Sort Dropdown */}
            <div id="sort-dropdown-container" className="relative">
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-accent/50 transition-all duration-200 text-sm font-medium shadow-sm"
              >
                <span className="text-muted-foreground">Sort by:</span>
                <span className="text-foreground">
                  {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                    sortDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {sortDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setSortDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors duration-150 flex items-center justify-between
                          ${
                            sortBy === option.value
                              ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 font-medium'
                              : 'hover:bg-accent/50 text-foreground'
                          }
                        `}
                      >
                        {option.label}
                        {sortBy === option.value && (
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Sort Bar */}
          <div className="md:hidden mb-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort: {option.label}
                </option>
              ))}
            </select>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-slate-800 rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground text-lg">
                No products found matching your criteria.
              </p>
              <Button variant="ghost" className="mt-4" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          ) : (
            // ✅ PERFORMANCE: `layout` only on the container grid, not individual cards.
            // This means only the grid transitions animate, not every card re-rendering.
            <motion.div layout className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="relative">
                  <span className="absolute top-2 left-2 z-10 bg-[#2874f0] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow pointer-events-none">
                    {seededDiscount(product.id)}% off
                  </span>
                  <ProductCard product={product} />
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── FilterSidebar ────────────────────────────────────────────────────────────

interface FilterSidebarProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedSubCategory: string;
  setSelectedSubCategory: (s: string) => void;
  searchParams: URLSearchParams;
  setSearchParams: (p: any) => void;
  minRating: number;
  setMinRating: (r: number) => void;
  availableCompanies: string[];
  displayedCompanies: string[];
  selectedCompanies: string[];
  toggleCompany: (c: string) => void;
  showAllCompanies: boolean;
  setShowAllCompanies: (b: boolean) => void;
  COMPANIES_TO_SHOW: number;
  maxPrice: number;
  priceRange: [number, number];
  setPriceRange: (r: [number, number]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const FilterSidebar = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  searchParams,
  setSearchParams,
  minRating,
  setMinRating,
  availableCompanies,
  displayedCompanies,
  selectedCompanies,
  toggleCompany,
  showAllCompanies,
  setShowAllCompanies,
  COMPANIES_TO_SHOW,
  maxPrice,
  priceRange,
  setPriceRange,
  clearFilters,
  hasActiveFilters,
}: FilterSidebarProps) => (
  <div className="space-y-8 sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto pb-10 scrollbar-hide">
    {/* Categories */}
    <div>
      <h3 className="font-semibold text-lg mb-4">Categories</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <label key={category} className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === category}
              onChange={() => {
                setSelectedCategory(category);
                setSelectedSubCategory('All');

                const newParams = new URLSearchParams(searchParams);
                if (category === 'All') {
                  newParams.delete('category');
                } else {
                  newParams.set('category', category);
                }
                newParams.delete('subCategory');
                setSearchParams(newParams);
              }}
              className="form-radio text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-300 dark:border-gray-600 dark:bg-slate-800"
            />
            <span
              className={`text-sm group-hover:text-blue-600 transition-colors ${
                selectedCategory === category
                  ? 'font-medium text-blue-600'
                  : 'text-muted-foreground'
              }`}
            >
              {category}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* Sub-Categories (Only for Clothes and Shoes) */}
    {(selectedCategory === 'Clothes' || selectedCategory === 'Shoes') && (
      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
        <h3 className="font-semibold text-lg mb-4">Gender / Type</h3>
        <div className="space-y-2 pl-4 border-l-2 border-border">
          {['All', 'Men', 'Women', 'Child'].map((sub) => (
            <label key={sub} className="flex items-center space-x-2 cursor-pointer group">
              <input
                type="radio"
                name="subCategory"
                checked={selectedSubCategory === sub}
                onChange={() => {
                  setSelectedSubCategory(sub);
                  const newParams = new URLSearchParams(searchParams);
                  if (sub === 'All') {
                    newParams.delete('subCategory');
                  } else {
                    newParams.set('subCategory', sub);
                  }
                  setSearchParams(newParams);
                }}
                className="form-radio text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-300 dark:border-gray-600 dark:bg-slate-800"
              />
              <span
                className={`text-sm group-hover:text-blue-600 transition-colors ${
                  selectedSubCategory === sub
                    ? 'font-medium text-blue-600'
                    : 'text-muted-foreground'
                }`}
              >
                {sub}
              </span>
            </label>
          ))}
        </div>
      </motion.div>
    )}

    {/* Rating Filter */}
    <div>
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        Rating
      </h3>
      <div className="space-y-2">
        {[0, 4.5, 4, 3].map((rating) => (
          <label key={rating} className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="radio"
              name="rating"
              checked={minRating === rating}
              onChange={() => setMinRating(rating)}
              className="form-radio text-yellow-500 focus:ring-yellow-500 h-4 w-4 border-gray-300 dark:border-gray-600 dark:bg-slate-800"
            />
            <span
              className={`text-sm group-hover:text-yellow-600 transition-colors flex items-center gap-1.5 ${
                minRating === rating ? 'font-medium text-yellow-600' : 'text-muted-foreground'
              }`}
            >
              {rating === 0 ? (
                'All Ratings'
              ) : (
                <>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(rating)
                            ? 'text-yellow-500 fill-yellow-500'
                            : i < rating
                            ? 'text-yellow-500 fill-yellow-500 opacity-50'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </span>
                  <span>{rating} & above</span>
                </>
              )}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* Company / Brand Filter */}
    <div>
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <Building2 className="h-4 w-4 text-blue-500" />
        Brand
      </h3>
      <div className="space-y-2">
        {displayedCompanies.map((company) => (
          <label key={company} className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={selectedCompanies.includes(company)}
              onChange={() => toggleCompany(company)}
              className="form-checkbox text-blue-600 focus:ring-blue-500 h-4 w-4 rounded border-gray-300 dark:border-gray-600 dark:bg-slate-800"
            />
            <span
              className={`text-sm group-hover:text-blue-600 transition-colors ${
                selectedCompanies.includes(company)
                  ? 'font-medium text-blue-600'
                  : 'text-muted-foreground'
              }`}
            >
              {company}
            </span>
          </label>
        ))}
        {availableCompanies.length > COMPANIES_TO_SHOW && (
          <button
            onClick={() => setShowAllCompanies(!showAllCompanies)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-1 transition-colors"
          >
            {showAllCompanies
              ? '− Show Less'
              : `+ ${availableCompanies.length - COMPANIES_TO_SHOW} More`}
          </button>
        )}
      </div>
    </div>

    {/* Price Range */}
    <div>
      <h3 className="font-semibold text-lg mb-4">Price Range</h3>
      <div className="px-2 space-y-4">
        <Slider
          defaultValue={[0, maxPrice]}
          max={maxPrice}
          step={50}
          value={priceRange}
          onValueChange={(value) => setPriceRange(value as [number, number])}
          className="py-4"
        />
        <div className="flex justify-between items-center text-xs font-medium">
          <div className="flex flex-col">
            <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
              Min Price
            </span>
            <span className="text-foreground">₹{priceRange[0].toLocaleString('en-IN')}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
              Max Price
            </span>
            <span className="text-foreground">₹{priceRange[1].toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Clear Filters */}
    <Button
      variant="outline"
      className="w-full"
      onClick={clearFilters}
      disabled={!hasActiveFilters}
    >
      Clear Filters
    </Button>
  </div>
);