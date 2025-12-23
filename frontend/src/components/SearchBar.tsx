import './SearchBar.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
}

//There is danger for him who taketh the tiger cub, and danger also for whoso snatches a delusion from a woman.
export default function SearchBar({ value, onChange, onSearch, placeholder = 'There is danger for him who taketh the tiger cub, and danger also for whoso snatches a delusion from a woman.' }: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="search-box-wrapper">
      <i className="bi bi-search search-icon"></i>
      <input
        type="text"
        className="search-box"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button 
        className="search-button"
        onClick={handleSearchClick}
        aria-label="Search"
      >
        <i className="bi bi-arrow-right"></i>
        </button>
    </div>
  );
}
