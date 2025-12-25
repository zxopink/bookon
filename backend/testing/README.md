# BookOn Backend Testing

This directory contains integration tests for the BookOn backend API that use the `requests` library to test against a running server.

## Running Tests

To run the tests, use the `run_tests.sh` script from the backend directory:

```bash
cd backend
./run_tests.sh
```

The script will:
1. Start the FastAPI server in the background
2. Wait for it to be ready
3. Run the tests using `requests` to make HTTP calls
4. Stop the server when done

## Test Coverage

The tests cover the following functionality:

1. **Adding books to reading list** - Tests that books can be successfully added via HTTP POST
2. **Duplicate prevention** - Tests that adding the same book twice returns the existing book instead of creating duplicates
3. **Status updates** - Tests that reading status can be updated correctly via HTTP PUT (PLANNED → READING → DONE)

## Test Structure

- `test_read_list.py` - Contains all reading list API integration tests
- Uses `requests` library for HTTP calls to the running server
- Tests run against the actual running FastAPI application
- Simple Python script with custom test runner

## Configuration

The tests use the following environment variables:
- `API_BASE_URL` - Base URL for the API (defaults to `http://localhost:8000`)

## Requirements

- requests
- FastAPI server running on localhost:8000
- PostgreSQL database running