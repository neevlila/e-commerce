import { cn } from "../../lib/utils";

// Base skeleton pulse element
export const Skeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "animate-pulse rounded-md bg-gray-200 dark:bg-slate-700",
      className
    )}
  />
);

// Product Card Skeleton
export const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-border overflow-hidden h-full flex flex-col">
    {/* Image area */}
    <Skeleton className="aspect-square w-full rounded-none" />
    {/* Content area */}
    <div className="p-4 flex flex-col gap-3 flex-grow">
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="mt-auto pt-4 flex items-center justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
    </div>
  </div>
);

// Products Page Skeleton Grid
export const ProductsSkeletonGrid = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

// Home Page Featured Products Skeleton Grid
export const HomeFeaturedSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);
