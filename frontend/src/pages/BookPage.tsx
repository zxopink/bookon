import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useReadingList } from '../contexts/ReadingListContext';
import { motion, AnimatePresence } from 'framer-motion';
import Spinner from '../components/Spinner';
import './BookPage.css';
import type { BookCardProps } from '../components/BookCard';

interface BookDetails extends BookCardProps {
  first_publish_year?: number | string;
  number_of_pages?: number;
  publishers?: string[];
  isbn_13?: string[];
  isbn_10?: string[];
}

export default function BookPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
    if(!id) {
    navigate('/');
  }
  
  const [book, setBook] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const { addBook, isBookInList, removeBook, getBookInList, updateBookStatus } = useReadingList();

  const isBookSaved = isBookInList(id!);
  const basicBookInfo: BookCardProps | undefined = isBookSaved ? getBookInList(id!) : undefined;
  if (basicBookInfo && !book)
  {
    setBook(basicBookInfo); //initialize with basic info while detailed info is loading
  }
    

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/books/${id}`);
        
        if (!response.ok) {
          throw new Error('Book not found');
        }

        const data: BookDetails = await response.json();
        setBook(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load book');
        toast.error('Failed to load book details');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.status-dropdown-container')) {
        setShowStatusDropdown(false);
      }
    };

    if (showStatusDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusDropdown]);

  const handleAddToList = () => {
    if (!book) return;
    
    addBook({
        external_id: book.external_id,
        title: book.title,
        authors: book.authors,
        cover_i: book.cover_i,
        description: book.description,
        status: 'PLANNED' // Planned
    });
    toast.success(`${book.title} added to reading list!`);
  };

  const handleRemoveFromList = () => {
    if (!book) return;
    
    removeBook(book.external_id);
    toast.info(`${book.title} removed from reading list`);
  };

  const handleStatusUpdate = async (newStatus: 'PLANNED' | 'READING' | 'DONE') => {
    if (!book) return;
    
    const success = await updateBookStatus(book.external_id, newStatus);
    if (success) {
      const statusText = newStatus === 'PLANNED' ? 'Planned' : newStatus === 'READING' ? 'Reading' : 'Done';
      toast.success(`Status updated to ${statusText}`);
      setShowStatusDropdown(false);
    } else {
      toast.error('Failed to update status');
    }
  };

  const toggleStatusDropdown = () => {
    setShowStatusDropdown(!showStatusDropdown);
  };

  const getCoverUrl = (coverId?: number) => {
    if (!coverId) return '/placeholder-book.png';
    return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
  };

  //if book is saved but details are not loaded yet, use basic info
  if (loading && !isBookSaved) {
    return (
      <div className="book-page loading">
        <Spinner />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="book-page error">
        <div className="error-container">
          <h2>📚 Book Not Found</h2>
          <p>{error || 'The book you are looking for does not exist.'}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-page">
      <button onClick={() => navigate(-1)} className="back-button">
        <i className="bi bi-arrow-left"></i> Back
      </button>

      <div className="book-details">
        <div className="book-cover-section">
          <img
            src={getCoverUrl(book.cover_i)}
            alt={book.title}
            className="book-cover-large"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-book.png';
            }}
          />
        </div>

        <div className="book-info-section">
          <h1 className="book-title">{book.title}</h1>
          
          {book.authors && book.authors.length > 0 && (
            <div className="book-authors">
              <i className="bi bi-person"></i>
              <span>by {book.authors.join(', ')}</span>
            </div>
          )}

          { !loading && book.first_publish_year && (
            <div className="book-year">
              <i className="bi bi-calendar"></i>
              <span>First published in {book.first_publish_year}</span>
            </div>
          )}

          <div className="book-actions">
            {isBookSaved ? (
              <>
                <button onClick={handleRemoveFromList} className="btn-secondary">
                  <i className="bi bi-dash-circle"></i> Remove from Reading List
                </button>
                <div className="status-dropdown-container">
                  <button onClick={toggleStatusDropdown} className="btn-status">
                    <i className={`bi ${showStatusDropdown ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i> 
                    {basicBookInfo?.status === 'PLANNED' ? 'Planned' :
                     basicBookInfo?.status === 'READING' ? 'Reading' :
                     basicBookInfo?.status === 'DONE' ? 'Done' : 'Update Status'}
                  </button>
                  <AnimatePresence>
                    {showStatusDropdown && (
                      <motion.div 
                        className="status-dropdown"
                        initial={{ opacity: 0, scale: 0.8, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -10 }}
                        transition={{ 
                          duration: 0.2,
                          ease: "easeOut"
                        }}
                      >
                        <button 
                          className={`status-option ${basicBookInfo?.status === 'PLANNED' ? 'active' : ''}`}
                          onClick={() => handleStatusUpdate('PLANNED')}
                        >
                          <i className="bi bi-clipboard"></i> Planned {basicBookInfo?.status === 'PLANNED' && <i className="bi bi-check-lg"></i>}
                        </button>
                        <button 
                          className={`status-option ${basicBookInfo?.status === 'READING' ? 'active' : ''}`}
                          onClick={() => handleStatusUpdate('READING')}
                        >
                          <i className="bi bi-book"></i> Reading {basicBookInfo?.status === 'READING' && <i className="bi bi-check-lg"></i>}
                        </button>
                        <button 
                          className={`status-option ${basicBookInfo?.status === 'DONE' ? 'active' : ''}`}
                          onClick={() => handleStatusUpdate('DONE')}
                        >
                          <i className="bi bi-check-circle"></i> Done {basicBookInfo?.status === 'DONE' && <i className="bi bi-check-lg"></i>}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <button onClick={handleAddToList} className="btn-primary">
                <i className="bi bi-plus-circle"></i> Add to Reading List
              </button>
            )}
          </div>

          {book.description && (
            <div className="book-description">
              <h2>Description</h2>
              <p>{book.description}</p>
            </div>
          )}

          <div className="book-metadata">
            <h2>Book Details</h2>
            
            <div className="metadata-item">
              <span className="metadata-label">Book ID:</span>
              <span className="metadata-value">{book.external_id}</span>
            </div>

            {/* Detailed fields, only loaded after fetch */}
            { loading ? <Spinner />
            :<>
                {book.number_of_pages && (
                <div className="metadata-item">
                    <span className="metadata-label">Pages:</span>
                    <span className="metadata-value">{book.number_of_pages}</span>
                </div>
                )}

                {book.publishers && book.publishers.length > 0 && (
                <div className="metadata-item">
                    <span className="metadata-label">Publisher(s):</span>
                    <span className="metadata-value">{book.publishers.join(', ')}</span>
                </div>
                )}

                {book.isbn_13 && book.isbn_13.length > 0 && (
                <div className="metadata-item">
                    <span className="metadata-label">ISBN-13:</span>
                    <span className="metadata-value">{book.isbn_13[0]}</span>
                </div>
                )}

                {book.isbn_10 && book.isbn_10.length > 0 && (
                <div className="metadata-item">
                    <span className="metadata-label">ISBN-10:</span>
                    <span className="metadata-value">{book.isbn_10[0]}</span>
                </div>
                )}
            </> 
            }
          </div>
        </div>
      </div>
    </div>
  );
}
