import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import BookCard from './BookCard';
import './SearchResults.css';
import Spinner from './Spinner';
import type { BookCardProps } from './BookCard';

interface SearchResultsProps {
  results: BookCardProps[];
  onScrollEnd?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  cardMinWidth?: string;
  cardMaxWidth?: string;
  cardHeight?: string;
}

export default function SearchResults({ 
  results, 
  onScrollEnd, 
  isLoadingMore = false, 
  hasMore = true,
  cardMinWidth = '250px',
  cardMaxWidth = '1fr',
  cardHeight = 'auto'
}: SearchResultsProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMore && onScrollEnd) {
          onScrollEnd();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [onScrollEnd, isLoadingMore, hasMore]);

  if (results.length === 0 && isLoadingMore) {
    return (
      <motion.div 
        className="results-placeholder"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Spinner />
      </motion.div>
    );
  }
  else if (results.length === 0) {
    return (
      <motion.div 
        className="results-placeholder"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <p>No results found.</p>
      </motion.div>
    );
  }

  return (
    <div>
      <div 
        className="results-grid"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${cardMinWidth}, ${cardMaxWidth}))`,
          ...(cardHeight !== 'auto' && { gridAutoRows: cardHeight })
        }}
      >
        <AnimatePresence mode="popLayout">
          {results.map((book, index) => (
            <motion.div
              key={book.external_id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 1.8, transition: { duration: 0.3 } }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.4, 0, 0.2, 1]
              }}
              layout
            >
              <BookCard {...book} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Intersection observer target */}
      <div ref={observerTarget} className="scroll-trigger" />
      
      {/* Show spinner when loading more */}
      {isLoadingMore && hasMore && (
        <div className="loading-more-container">
          <Spinner />
        </div>
      )}
    </div>
  );
}
