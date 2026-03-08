import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  size = 16, 
  interactive = false,
  onRatingChange 
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => interactive && setHoverRating(0)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = displayRating >= star;
        const isHalf = displayRating >= star - 0.5 && displayRating < star;

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onClick={() => interactive && onRatingChange?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} relative`}
          >
            {isHalf ? (
                <div className="relative">
                    <Star size={size} className="text-gray-300 dark:text-gray-600" />
                    <div className="absolute inset-0 overflow-hidden w-1/2">
                        <Star size={size} className="fill-yellow-400 text-yellow-400" fill="currentColor" />
                    </div>
                </div>
            ) : (
                <Star 
                    size={size} 
                    className={`${isFull ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                    fill={isFull ? "currentColor" : "none"}
                />
            )}
          </button>
        );
      })}
    </div>
  );
};
