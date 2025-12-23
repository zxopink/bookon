import './HomePage.css';

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <h1>Welcome to BookOn</h1>
        <p>Discover, track, and manage your reading journey</p>
      </section>
      
      <section className="features">
        <div className="feature-card">
          <h3>📖 Discover Books</h3>
          <p>Browse millions of books from Open Library</p>
        </div>
        <div className="feature-card">
          <h3>⭐ Track Progress</h3>
          <p>Keep track of what you're reading and your progress</p>
        </div>
        <div className="feature-card">
          <h3>📚 Build Your List</h3>
          <p>Create and organize your personal reading list</p>
        </div>
      </section>
    </div>
  );
}
