from fastapi import FastAPI
from routers import assessment, report

app = FastAPI(title="SHEALTH AI Service", version="1.0.0")

# Register routers
# Node backend calls:  /start  /next-question  /generate-report  → mapped below
app.include_router(assessment.router)   # /assessment/start, /assessment/next-question
app.include_router(report.router)       # /report/generate, /report/generate-pdf


@app.get("/health")
async def health():
    return {"status": "ok", "service": "SHEALTH AI"}

