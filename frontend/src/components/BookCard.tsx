import './BookCard.css';
import { useState, useRef, useEffect } from 'react';
import { useReadingList } from '../contexts/ReadingListContext';

export interface BookCardProps {
  external_id: string;
  title: string;
  description?: string;
  authors?: string[];
  cover_i?: string;
}

export default function BookCard({ external_id, title, description, authors, cover_i }: BookCardProps) {
  const [transform, setTransform] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const { addBook, isBookInList } = useReadingList();
  const isInList = isBookInList(external_id);

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

  const handleAddToReadingList = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    
    if (isAddingToList || isInList) return;
    
    try {
      setIsAddingToList(true);
      
      const success = await addBook({
        external_id,
        title,
        description,
        authors,
        cover_i
      });

      if (!success) {
        alert('Failed to add book to reading list');
      }
    } catch (error) {
      console.error('Error adding to reading list:', error);
      alert('Failed to add book to reading list');
    } finally {
      setIsAddingToList(false);
    }
  };

  const coverUrl = cover_i 
    ? `https://covers.openlibrary.org/b/id/${cover_i}-L.jpg`
    : '/placeholder-book.png';

  return (
    <div 
      className="book-card"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        transform,
        transition: isHovering ? 'box-shadow 0.3s ease' : 'transform 0.4s ease, box-shadow 0.3s ease'
      }}
        >
      <button 
        className="book-card-star-btn" 
        onClick={handleAddToReadingList}
        disabled={isAddingToList || isInList}
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
            by {authors.join(', ')}
          </p>
        )}
        {description && (
          <p className="book-card-description">{description}</p>
        )}
      </div>
      <button className="book-card-menu-btn" onClick={(e) => e.stopPropagation()}>
        <i className="bi bi-three-dots"></i>
      </button>
    </div>
  );
}
