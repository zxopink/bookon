import SearchResults from '../components/SearchResults';
import { useReadingList } from '../contexts/ReadingListContext';

export default function ReadingListPage() {
  const { books, isLoading, error } = useReadingList();

  return (
    <div>
      <h1>My Reading List</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <SearchResults 
        results={books}
        isLoadingMore={isLoading}
        hasMore={false}
      />
    </div>
  );
}
