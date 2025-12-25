from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from fastapi.staticfiles import StaticFiles

from routes.book_routes import router as book_router
from routes.read_list_routes import router as read_list_router
from services.read_list_service import init_read_list_table


#on app startup and shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database tables
    init_read_list_table()
    yield
    # Shutdown: cleanup if needed


app = FastAPI(title="BookOn API", version="1.0.0", lifespan=lifespan)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(book_router)
app.include_router(read_list_router)


# Serve frontend
app.mount(
    "/",
    StaticFiles(directory="static", html=True),
    name="static"
)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
