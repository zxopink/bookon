# BookOn📚

A web application built with FastAPI backend and PostgreSQL database.

## Prerequisites

- Docker and Docker Compose installed
- User added to docker group (run `sudo usermod -aG docker $USER` and log out/in)

## Getting Started

### 1. Environment Setup

Create a `.env` file in the project root with the following variables:

```env
POSTGRES_DB=bookon
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here
DATABASE_URL=postgresql://postgres:your_password_here@db:5432/bookon
```

### 2. Start the Application

For first time or after code changes:

```bash
docker-compose up --build
```

For subsequent runs:

```bash
docker-compose up
```

### 3. Access the Application

- **API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432

### 4. Stop the Application

Press `Ctrl+C` in the terminal, then run:

```bash
docker-compose down
```

To also remove volumes (database data):

```bash
docker-compose down -v
```

## Testing

The backend includes automated tests for the API endpoints.

### Running Tests

1. Ensure PostgreSQL is running (either via Docker or locally)
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Run the test script:
   ```bash
   ./run_tests.sh
   ```

### Test Coverage

The tests verify:
- Adding books to the reading list
- Prevention of duplicate book entries
- Reading status updates (PLANNED → READING → DONE)

## Troubleshooting

### Permission Denied Error

If you get a Docker socket permission error:

1. Apply group changes in current terminal:
   ```bash
   newgrp docker
   ```

2. Or log out and log back in to apply the docker group membership permanently.

### Database Connection Issues

Ensure the `DATABASE_URL` in `.env` matches your PostgreSQL credentials and uses `db` as the hostname (the Docker service name).
