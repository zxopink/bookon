import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import './SearchPage.css';
import type { BookCardProps } from '../components/BookCard';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<BookCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 40;

  const fetchBooks = async (searchValue: string, isNewSearch: boolean = false) => {
    if (isLoading || (!isNewSearch && !hasMore)) return;
    
    setIsLoading(true);
    
    const currentPage = isNewSearch ? 1 : page;
    
    if (isNewSearch) {
      setHasSearched(true);
      setSearchResults([]);
    }
    
    try {
      const response = await fetch(
        `http://localhost:8000/api/search/books?q=${encodeURIComponent(searchValue)}&limit=${limit}&page=${currentPage}`
      );
      
      if (!response.ok) {
        throw new Error(isNewSearch ? 'Failed to fetch search results' : 'Failed to fetch more results');
      }
      
      const data = await response.json();
      
      // Transform API response to BookCardProps format
      const books: BookCardProps[] = data.books?.map((book: any) => ({
        title: book.title,
        authors: book.author_name || [],
        description: book.first_sentence?.[0] || '',
        cover_i: book.cover_i?.toString()
      })) || [];
      const totalResults = data.total || 0;
      console.log('total found results:', totalResults);
      
      setSearchResults(prev => isNewSearch ? books : [...prev, ...books]);
      setHasMore(totalResults > currentPage * limit);
      setPage(currentPage + 1);
    } catch (error) {
      console.error('Search error:', error);
      toast.error(isNewSearch ? 'Failed to search books. Please try again.' : 'Failed to load more results. Please try again.');
      if (isNewSearch) {
        setSearchResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (searchValue: string) => {
    if (searchValue.trim()) {
      await fetchBooks(searchValue, true);
    }
  };

  const loadMore = async () => {
    await fetchBooks(searchQuery, false);
  };

  return (
    <motion.div 
      className={`search-page ${hasSearched ? 'search-active' : ''}`}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      <motion.div 
        className="search-container"
        layout
        transition={{
          layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
        }}
      >
        <motion.h1 
          className="search-title"
          layout
          transition={{
            layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
          }}
        >
          Search Books
        </motion.h1>
        <SearchBar 
          value={searchQuery} 
          onChange={setSearchQuery} 
          onSearch={handleSearch}
        />
      </motion.div>
      
      <AnimatePresence>
        {hasSearched && (
          <motion.div 
            className="search-results-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="search-results">
              <SearchResults 
                results={searchResults} 
                onScrollEnd={loadMore}
                isLoadingMore={isLoading}
                hasMore={hasMore}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
