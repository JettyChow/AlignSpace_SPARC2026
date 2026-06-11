from fastapi import FastAPI

from app.routers import users, projects, pipeline, design, designer


app = FastAPI(title="AlignSpace Backend API")

app.include_router(users.router)
app.include_router(projects.router)
app.include_router(pipeline.router)
app.include_router(design.router)
app.include_router(designer.router)


@app.get("/")
def health_check():
    return {"message": "AlignSpace backend running"}