import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import PopularPage from './pages/PopularPage';
import SearchPage from './pages/SearchPage';
import ReadingListPage from './pages/ReadingListPage';
import BookPage from './pages/BookPage';
import { ReadingListProvider } from './contexts/ReadingListContext';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <ReadingListProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="popular" element={<PopularPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="reading-list" element={<ReadingListPage />} />
            <Route path="book/:id" element={<BookPage />} />
          </Route>
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </ReadingListProvider>
    </BrowserRouter>
  );
}

export default App;
