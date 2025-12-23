import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { BookCardProps } from '../components/BookCard';

interface ReadListEntry {
  id: number;
  book_external_id: string;
  title: string;
  author: string;
  description: string | null;
  cover_i: number | null;
  status: number;
  created_at: string;
  updated_at: string;
}

interface ReadingListContextType {
  books: BookCardProps[];
  isLoading: boolean;
  error: string | null;
  addBook: (book: BookCardProps) => Promise<boolean>;
  removeBook: (external_id: string) => Promise<boolean>;
  isBookInList: (external_id: string) => boolean;
  refreshList: () => Promise<void>;
}

const ReadingListContext = createContext<ReadingListContextType | undefined>(undefined);

interface ReadingListProviderProps {
  children: ReactNode;
}

export function ReadingListProvider({ children }: ReadingListProviderProps) {
  const [books, setBooks] = useState<BookCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReadingList = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/api/reading-list/');
      
      if (!response.ok) {
        throw new Error('Failed to fetch reading list');
      }
      
      const data: ReadListEntry[] = await response.json();
      
      const bookCards: BookCardProps[] = data.map(entry => ({
        external_id: entry.book_external_id,
        title: entry.title,
        description: entry.description || '',
        authors: [entry.author],
        cover_i: entry.cover_i ? entry.cover_i.toString() : undefined
      }));
      
      setBooks(bookCards);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReadingList();
  }, []);

  const addBook = async (book: BookCardProps): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8000/api/reading-list/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          external_id: book.external_id,
          title: book.title,
          author: book.authors && book.authors.length > 0 ? book.authors.join('; ') : 'Unknown Author',
          description: book.description || null,
          cover_i: book.cover_i ? parseInt(book.cover_i) : null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to reading list');
      }

      // Add book to local state
      setBooks(prevBooks => [...prevBooks, book]);
      return true;
    } catch (error) {
      console.error('Error adding to reading list:', error);
      setError(error instanceof Error ? error.message : 'Failed to add book');
      return false;
    }
  };

  const removeBook = async (external_id: string): Promise<boolean> => {
    try {
      const response = await fetch(`http://localhost:8000/api/reading-list/${external_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove from reading list');
      }

      // Remove book from local state
      setBooks(prevBooks => prevBooks.filter(book => book.external_id !== external_id));
      return true;
    } catch (error) {
      console.error('Error removing from reading list:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove book');
      return false;
    }
  };

  const isBookInList = (external_id: string): boolean => {
    return books.some(book => book.external_id === external_id);
  };

  const refreshList = async () => {
    await fetchReadingList();
  };

  const value: ReadingListContextType = {
    books,
    isLoading,
    error,
    addBook,
    removeBook,
    isBookInList,
    refreshList
  };

  return (
    <ReadingListContext.Provider value={value}>
      {children}
    </ReadingListContext.Provider>
  );
}

export function useReadingList() {
  const context = useContext(ReadingListContext);
  if (context === undefined) {
    throw new Error('useReadingList must be used within a ReadingListProvider');
  }
  return context;
}
