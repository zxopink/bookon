import { useState, useEffect, useRef } from 'react';
import BookCard from './BookCard';
import './HorizontalSection.css';
import Spinner from './Spinner';

interface Book {
  external_id: string;
  title: string;
  authors: string[];
  description?: string;
  first_publish_year?: number;
  cover_i?: string;
}

interface HorizontalSectionProps {
  title: string;
  url: string;
  width?: number; // Card width in pixels, default is 280
  height?: number; // Card height in pixels, default is auto
  limit?: number; // Number of books per page, default is 12
}

export default function HorizontalSection({ title, url, width = 280, height, limit = 12 }: HorizontalSectionProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const buildUrl = (pageNum: number) => {
    const urlObj = new URL(url, window.location.origin);
    urlObj.searchParams.set('limit', limit.toString());
    urlObj.searchParams.set('page', pageNum.toString());
    return urlObj.toString();
  };

  const fetchBooks = async (pageNum: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const response = await fetch(buildUrl(pageNum));
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      const data = await response.json();
      // Handle both { books: [] } and direct array responses
      const booksList = data.books || data;
      
      if (booksList.length < limit) {
        setHasMore(false);
      }
      
      if (append) {
        setBooks(prev => [...prev, ...booksList]);
      } else {
        setBooks(booksList);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchBooks(1, false);
  }, [url]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
      const isNearEnd = scrollLeft + clientWidth >= scrollWidth - 100;

      if (isNearEnd && !loadingMore && !loading && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchBooks(nextPage, true);
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [loadingMore, loading, hasMore, page]);

  if (loading) {
    return (
      <section className="horizontal-section">
        <h2 className="section-title">{title}</h2>
        <Spinner style={{ width: `${width}px`, minWidth: `${width}px` }} />
      </section>
    );
  }

  if (error) {
    return (
      <section className="horizontal-section">
        <h2 className="section-title">{title}</h2>
        <p className="error-text">Error: {error}</p>
      </section>
    );
  }

  return (
    <section className="horizontal-section">
      <h2 className="section-title">{title}</h2>
      <div className="horizontal-scroll" ref={scrollRef}>
        <div className="books-container">
          {books.map((book) => (
            <div 
              key={book.external_id} 
              className="book-item"
              style={{ 
                flex: `0 0 ${width}px`, 
                minWidth: `${width}px`,
                maxWidth: `${width}px`,
                height: height ? `${height}px` : 'auto'
              }}
            >
              <BookCard
                external_id={book.external_id}
                title={book.title}
                authors={book.authors}
                description={book.description}
                cover_i={book.cover_i?.toString()}
              />
            </div>
          ))}
          {loadingMore && (
            <Spinner style={{ width: `${width}px`, minWidth: `${width}px` }} />
          )}
        </div>
      </div>
    </section>
  );
}
