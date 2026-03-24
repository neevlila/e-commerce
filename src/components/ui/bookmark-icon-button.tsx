"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "./button";

const animations = {
  icon: {
    initial: { scale: 1, rotate: 0 },
    tapActive: { scale: 0.85, rotate: -10 },
    tapCompleted: { scale: 1, rotate: 0 },
  },
  burst: {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: [0, 1.4, 1], opacity: [0, 0.4, 0] },
    transition: { duration: 0.7, ease: "easeOut" },
  },
  particles: (index: number) => {
    const angle = (index / 5) * (2 * Math.PI);
    const radius = 18 + Math.random() * 8;
    const scale = 0.8 + Math.random() * 0.4;
    const duration = 0.6 + Math.random() * 0.1;

    return {
      initial: { scale: 0, opacity: 0.3, x: 0, y: 0 },
      animate: {
        scale: [0, scale, 0],
        opacity: [0.3, 0.8, 0],
        x: [0, Math.cos(angle) * radius],
        y: [0, Math.sin(angle) * radius * 0.75],
      },
      transition: { duration, delay: index * 0.04, ease: "easeOut" },
    };
  },
};

export function BookmarkIconButton({
  isSaved,
  onClick,
  className,
}: {
  isSaved?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}) {
  const [internalSaved, setInternalSaved] = React.useState(false);
  
  // Use controlled state if provided, otherwise fallback to internal state
  const isCurrentlySaved = isSaved !== undefined ? isSaved : internalSaved;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onClick) {
      onClick(e);
    } else {
      setInternalSaved((prev) => !prev);
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        aria-pressed={isCurrentlySaved}
        className={`relative h-12 w-12 rounded-full hover:bg-transparent overflow-visible ${className || ''}`}
      >
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: isCurrentlySaved ? 1.1 : 1 }}
          whileTap={
            isCurrentlySaved ? animations.icon.tapCompleted : animations.icon.tapActive
          }
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="relative flex items-center justify-center"
        >
          <Heart className="opacity-60" size={20} aria-hidden="true" />

          <Heart
            className="absolute inset-0 text-pink-500 fill-pink-500 transition-all duration-300"
            size={20}
            aria-hidden="true"
            style={{ opacity: isCurrentlySaved ? 1 : 0 }}
          />

          <AnimatePresence>
            {isCurrentlySaved && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(236,72,153,0.4) 0%, rgba(236,72,153,0) 80%)",
                }}
                {...animations.burst}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </Button>

      <AnimatePresence>
        {isCurrentlySaved && (
          <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-pink-500"
                style={{
                  width: `${4 + Math.random() * 2}px`,
                  height: `${4 + Math.random() * 2}px`,
                  filter: "blur(1px)",
                  transform: "translate(-50%, -50%)",
                }}
                initial={animations.particles(i).initial}
                animate={animations.particles(i).animate}
                transition={animations.particles(i).transition}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}