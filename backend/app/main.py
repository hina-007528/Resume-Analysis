from fastapi import FastAPI
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.config import settings
import structlog
import uuid

# Set up logging
structlog.configure()
logger = structlog.get_logger()

app = FastAPI(
    title="AI Resume Analyzer API",
    description="NLP-powered resume analysis and job matching backend",
    version="1.0.0"
)

# CORS Middleware
# If allow_credentials is True, allow_origins cannot be ["*"].
# We handle this by explicitly listing allowed origins or using allow_origin_regex.
origins = settings.cors_origins if isinstance(settings.cors_origins, list) else settings.cors_origins.split(",")

# Add common local development origins
extra_dev_origins = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"]
for origin in extra_dev_origins:
    if origin not in origins:
        origins.append(origin)

allow_all_origins = "*" in origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=[] if allow_all_origins else origins,
    allow_origin_regex=".*" if allow_all_origins else None,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "X-User-ID",
        "X-Request-ID",
        "Accept",
        "Origin",
    ],
    expose_headers=["X-Request-ID", "Content-Disposition", "Content-Length"],
)

# Note: FastAPI's CORSMiddleware has a quirk: if allow_credentials is True, 
# and allow_origins is ["*"], it might fail in some browsers.
# Actually, if allow_origins is ["*"], it's better to set allow_credentials to False
# OR use a specific list of origins.


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# Include routers
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to the AI Resume Analyzer API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
