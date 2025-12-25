import './BookCard.css';
import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useReadingList } from '../contexts/ReadingListContext';
import { motion, AnimatePresence } from 'framer-motion';

const ReadingStatus = {
  Planned: 'PLANNED',
  Reading: 'READING',
  Done: 'DONE'
} as const;

export type ReadingStatusType = 'PLANNED' | 'READING' | 'DONE';

export interface BookCardProps {
  external_id: string;
  title: string;
  description?: string;
  authors?: string[];
  cover_i?: number;
  status?: ReadingStatusType; //Different than undefined only if in reading list
}

export default function BookCard({ external_id, title, description, authors, cover_i, status }: BookCardProps) {
  const [transform, setTransform] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { addBook, isBookInList, removeBook, updateBookStatus, getBookInList } = useReadingList();
  const isInList = isBookInList(external_id);
  if(isInList && !status) {
      const bookInList = getBookInList(external_id);
      status = bookInList!.status;
    }


  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    setIsHovering(true);
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTransform('');
  };

  const handleToggleReadingList = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      if (isInList) {
        const success = await removeBook(external_id);
        if (!success) {
          toast.error('Failed to remove book from reading list');
        }
        else
          toast.info(`${title} removed from reading list`);
      } else {
        const success = await addBook({
          external_id,
          title,
          description,
          authors,
          cover_i,
          status: ReadingStatus.Planned
        });
        if (!success) {
          toast.error('Failed to add book to reading list');
        }
        else
          toast.success(`${title} added to reading list!`);
      }
    } catch (error) {
      console.error('Error updating reading list:', error);
      toast.error(`Failed to ${isInList ? 'remove' : 'add'} book ${isInList ? 'from' : 'to'} reading list`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: ReadingStatusType) => {
    try {
      const success = await updateBookStatus(external_id, newStatus);
      if (success) {
        const statusText = newStatus === 'PLANNED' ? 'Planned' : newStatus === 'READING' ? 'Reading' : 'Done';
        toast.success(`Status updated to ${statusText}`);
        setShowStatusMenu(false);
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleMenuToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowStatusMenu(!showStatusMenu);
  };

  const coverUrl = cover_i 
    ? `https://covers.openlibrary.org/b/id/${cover_i}-L.jpg`
    : '/placeholder-book.png';

  const handleCardClick = () => {
    navigate(`/book/${external_id}`);
  };

  // Close status menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
      }
    };

    if (showStatusMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusMenu]);

  return (
    <div 
      className="book-card"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      style={{ 
        transform,
        transition: isHovering ? 'box-shadow 0.3s ease' : 'transform 0.4s ease, box-shadow 0.3s ease',
        cursor: 'pointer'
      }}
        >
      {isInList && (
        <div className="book-card-status-ribbon">
          {status === 'PLANNED' && <><i className="bi bi-clipboard"></i> Planned</>}
          {status === 'READING' && <><i className="bi bi-book"></i> Reading</>}
          {status === 'DONE' && <><i className="bi bi-check-circle"></i> Done</>}
        </div>
      )}
      <button 
        className="book-card-star-btn" 
        onClick={handleToggleReadingList}
        disabled={isLoading}
      >
        <i 
          key={isInList ? 'filled' : 'empty'}
          className={isInList ? "bi bi-star-fill" : "bi bi-star"}
        ></i>
      </button>
      <div className="book-card-image">
        <img src={coverUrl} alt={`${title} cover`} />
      </div>
      <div className="book-card-content">
        <h3 className="book-card-title">{title}</h3>
        {authors && authors.length > 0 && (
          <p className="book-card-authors">
            by {authors.slice(0, 3).join(', ')}
          </p>
        )}
      </div>
      {isInList && (
        <div className="book-card-menu-container">
          <button 
            className="book-card-menu-btn" 
            onClick={handleMenuToggle}
          >
            <i className="bi bi-three-dots"></i>
          </button>
          <AnimatePresence>
            {showStatusMenu && (
              <motion.div 
                className="status-menu"
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                transition={{ 
                  duration: 0.2,
                  ease: "easeOut"
                }}
              >
                <button 
                  className={`status-option ${status === ReadingStatus.Planned ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleStatusUpdate(ReadingStatus.Planned); }}
                >
                  <i className="bi bi-clipboard"></i> Planned {status === ReadingStatus.Planned && <i className="bi bi-check-lg"></i>}
                </button>
                <button 
                  className={`status-option ${status === ReadingStatus.Reading ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleStatusUpdate(ReadingStatus.Reading); }}
                >
                  <i className="bi bi-book"></i> Reading {status === ReadingStatus.Reading && <i className="bi bi-check-lg"></i>}
                </button>
                <button 
                  className={`status-option ${status === ReadingStatus.Done ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleStatusUpdate(ReadingStatus.Done); }}
                >
                  <i className="bi bi-check-circle"></i> Done {status === ReadingStatus.Done && <i className="bi bi-check-lg"></i>}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
