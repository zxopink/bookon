import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { BookCardProps, ReadingStatusType } from '../components/BookCard';

interface ReadListEntry {
  id: number;
  book_external_id: string;
  title: string;
  author: string;
  description: string | null;
  cover_i: number | null;
  status: ReadingStatusType;
  created_at: string;
  updated_at: string;
}

export interface ReadBookCardProps extends BookCardProps {
  read_list_id: number;
}

interface ReadingListContextType {
  books: ReadBookCardProps[];
  isLoading: boolean;
  error: string | null;
  addBook: (book: BookCardProps) => Promise<boolean>;
  removeBook: (external_id: string) => Promise<boolean>;
  updateBookStatus: (external_id: string, status: ReadingStatusType) => Promise<boolean>;
  isBookInList: (external_id: string) => boolean;
  getBookInList: (external_id: string) => ReadBookCardProps | undefined;
  refreshList: () => Promise<void>;
}

const ReadingListContext = createContext<ReadingListContextType | undefined>(undefined);

interface ReadingListProviderProps {
  children: ReactNode;
}

export function ReadingListProvider({ children }: ReadingListProviderProps) {
  const [books, setBooks] = useState<ReadBookCardProps[]>([]);
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
      const bookCards: ReadBookCardProps[] = data.map(entry => ({
        read_list_id: entry.id,
        external_id: entry.book_external_id,
        title: entry.title,
        description: entry.description || '',
        authors: [entry.author],
        cover_i: entry.cover_i ? entry.cover_i : undefined,
        status: entry.status
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
          cover_i: book.cover_i,
          status: book.status  // Default status: Planned
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to reading list');
      }
      const data: ReadListEntry = await response.json();
      const newBook: ReadBookCardProps = {
        read_list_id: data.id,
        external_id: data.book_external_id,
        title: data.title,
        description: data.description || '',
        authors: [data.author],
        cover_i: data.cover_i ? data.cover_i : undefined,
        status: data.status
      };


      // Add book to local state
      setBooks(prevBooks => [newBook, ...prevBooks]);
      return true;
    } catch (error) {
      console.error('Error adding to reading list:', error);
      setError(error instanceof Error ? error.message : 'Failed to add book');
      return false;
    }
  };

  const removeBook = async (external_id: string): Promise<boolean> => {
    try {
      const bookToRemove = books.find(book => book.external_id === external_id);
      if (!bookToRemove)
        return false;

      const read_list_id = bookToRemove.read_list_id;
      const response = await fetch(`http://localhost:8000/api/reading-list/${read_list_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove from reading list');
      }

      // Remove book from local state
      setBooks(prevBooks => prevBooks.filter(book => book.read_list_id !== read_list_id));
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

  const getBookInList = (external_id: string): ReadBookCardProps | undefined => {
    return books.find(book => book.external_id === external_id);
  };

  const updateBookStatus = async (external_id: string, status: ReadingStatusType): Promise<boolean> => {
    try {
      const bookToUpdate = books.find(book => book.external_id === external_id);
      if (!bookToUpdate)
        return false;

      const read_list_id = bookToUpdate.read_list_id;
      const response = await fetch(`http://localhost:8000/api/reading-list/${read_list_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update book status');
      }

      const updatedEntry = await response.json();
      
      // Update book in local state
      setBooks(prevBooks => prevBooks.map(book => 
        book.external_id === external_id 
          ? { ...book, status: updatedEntry.status }
          : book
      ));
      return true;
    } catch (error) {
      console.error('Error updating book status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update book status');
      return false;
    }
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
    updateBookStatus,
    isBookInList,
    getBookInList,
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
