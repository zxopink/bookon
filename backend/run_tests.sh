#!/bin/bash

# BookOn Backend - Test Runner
# This script runs the test suite for the FastAPI backend

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Running BookOn Backend Tests...${NC}"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if virtual environment exists
if [ ! -d "$SCRIPT_DIR/venv" ]; then
    echo -e "${RED}Virtual environment not found. Please run test.sh first to set up the environment.${NC}"
    exit 1
fi

# Activate virtual environment
echo -e "${GREEN}Activating virtual environment...${NC}"
source "$SCRIPT_DIR/venv/bin/activate"

# Install/update dependencies
echo -e "${GREEN}Ensuring test dependencies are installed...${NC}"
pip install -r requirements.txt

# Load environment variables
if [ -f "../.env.local" ]; then
    echo -e "${GREEN}Loading environment variables from .env.local...${NC}"
    export $(cat ../.env.local | grep -v '^#' | xargs)
elif [ -f "../.env" ]; then
    echo -e "${YELLOW}Warning: .env.local not found, falling back to .env${NC}"
    export $(cat ../.env | grep -v '^#' | xargs)
else
    echo -e "${RED}Error: Neither .env.local nor .env file found${NC}"
    exit 1
fi

echo -e "${GREEN}Running tests...${NC}"

# Run tests
cd testing
python test_read_list.py

# Check test results
if [ $? -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
else
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
fi