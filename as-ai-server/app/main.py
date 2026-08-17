import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import ai_proxy, catalog, design, designer, pipeline, projects, users


app = FastAPI(title="AlignSpace Backend API")

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "BACKEND_CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(projects.router)
app.include_router(pipeline.router)
app.include_router(design.router)
app.include_router(designer.router)
app.include_router(ai_proxy.router)
app.include_router(catalog.router)


@app.get("/")
def health_check():
    return {"message": "AlignSpace backend running"}
