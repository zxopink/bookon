import HorizontalSection from '../components/HorizontalSection';
import './PopularPage.css';

export default function PopularPage() {
  return (
    <div className="popular-page">
        <HorizontalSection 
            title="Popular Books This Week" 
            url="http://localhost:8000/api/popular/books?duration=weekly" 
            width={280}
            height={320}
          />
      <HorizontalSection 
        title="The Best of Sherlock Holmes🕵️" 
        url="http://localhost:8000/api/search/books?q=sherlock" 
        width={280}
        height={480}
      />
    </div>
    
  );
}
