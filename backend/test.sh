#!/bin/bash

# BookOn Backend - Local Development Runner
# This script sets up and runs the FastAPI backend locally without Docker

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting BookOn Backend...${NC}"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if virtual environment exists
if [ ! -d "$SCRIPT_DIR/venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    if ! python3 -m venv "$SCRIPT_DIR/venv" 2>/dev/null; then
        echo -e "${RED}Failed to create virtual environment.${NC}"
        echo -e "${YELLOW}Please install python3-venv: sudo apt install python3-venv${NC}"
        exit 1
    fi
fi

# Check if activate script exists
if [ ! -f "$SCRIPT_DIR/venv/bin/activate" ]; then
    echo -e "${RED}Virtual environment is incomplete.${NC}"
    echo -e "${YELLOW}Installing python3-venv and recreating...${NC}"
    rm -rf "$SCRIPT_DIR/venv"
    echo -e "${YELLOW}Run: sudo apt install python3-venv${NC}"
    echo -e "${YELLOW}Then run this script again.${NC}"
    exit 1
fi

# Activate virtual environment
echo -e "${GREEN}Activating virtual environment...${NC}"
source "$SCRIPT_DIR/venv/bin/activate"

# Install/update dependencies only if requirements.txt changed or not installed yet
if [ ! -f "$SCRIPT_DIR/venv/.requirements_installed" ] || [ "requirements.txt" -nt "$SCRIPT_DIR/venv/.requirements_installed" ]; then
    echo -e "${GREEN}Installing dependencies...${NC}"
    pip install --upgrade pip
    pip install -r requirements.txt
    touch "$SCRIPT_DIR/venv/.requirements_installed"
else
    echo -e "${GREEN}Dependencies already up to date${NC}"
fi

# Load environment variables from .env.local
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

# Check if local PostgreSQL is running
echo -e "${GREEN}Checking local PostgreSQL connection...${NC}"
if ! pg_isready -h localhost -p 5432 -U postgres > /dev/null 2>&1; then
    echo -e "${RED}Local PostgreSQL server is not running!${NC}"
    echo -e "${YELLOW}Please start PostgreSQL service:${NC}"
    echo -e "${YELLOW}  sudo systemctl start postgresql${NC}"
    echo -e "${YELLOW}Or check connection settings${NC}"
    exit 1
fi
echo -e "${GREEN}PostgreSQL is ready${NC}"

# Run the application
echo -e "${GREEN}Starting FastAPI server...${NC}"
cd app
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
