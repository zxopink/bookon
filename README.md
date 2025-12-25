# BookOn📚

A web application built with FastAPI backend and PostgreSQL database.

## Prerequisites

- Docker and Docker Compose installed
- User added to docker group (`sudo usermod -aG docker $USER`)

## Environment Setup

Create a `.env` file in the project root:

```env
POSTGRES_DB=bookon
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here
DATABASE_URL=postgresql://postgres:your_password_here@db:5432/bookon
```

## Getting Started

### Start the Application

```bash
# First time or after code changes
docker-compose up --build

# Subsequent runs
docker-compose up
```

### Stop the Application

```bash
docker-compose down
```

### Access the Application

- **API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## API Endpoints

### Books API

#### Search Books
- **GET** `/api/search/books?q=search_term&limit=20&page=1`

#### Get Popular Books
- **GET** `/api/popular/books?limit=12&page=1&duration=monthly`

#### Get Book Details
- **GET** `/api/books/{external_book_id}`

### Reading List API

#### Get Reading List
- **GET** `/api/reading-list/`

#### Get Reading List Entry
- **GET** `/api/reading-list/{id}`

#### Add Book to Reading List
- **POST** `/api/reading-list/`
- **Body**: `{"external_id": "OL123456M", "title": "Book Title", "author": "Author", "description": "Optional", "cover_i": 12345}`

#### Update Reading Status
- **PUT** `/api/reading-list/{id}`
- **Body**: `{"status": "READING|PLANNED|DONE"}`

#### Remove from Reading List
- **DELETE** `/api/reading-list/{id}`

## Testing

Run tests with:

```bash
cd backend
./run_tests.sh
```
