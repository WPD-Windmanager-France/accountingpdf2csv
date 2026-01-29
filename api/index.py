from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import pandas as pd
import io
import sys
import os

# Add current directory to path for imports to work in Vercel
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pdf_processor import process_bank_statement_buffer

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "CGDMKR Backend is running"}

@app.post("/api/process")
async def process_files(
    files: list[UploadFile] = File(...),
    journal: Optional[str] = Form(None),
    general: Optional[str] = Form(None)
):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    processed_files = []
    errors = []

    for file in files:
        filename = file.filename or "unknown"
        if not filename.lower().endswith('.pdf'):
            errors.append(f"{filename}: Not a PDF")
            continue

        try:
            content = await file.read()
            buffer = io.BytesIO(content)

            df = process_bank_statement_buffer(buffer, journal=journal, general=general)

            if not df.empty:
                processed_files.append({
                    "filename": filename,
                    "data": df.to_dict(orient="records"),
                    "transaction_count": len(df)
                })
            else:
                errors.append(f"{filename}: No transactions found")

        except Exception as e:
            errors.append(f"{filename}: {str(e)}")

    if not processed_files and not errors:
        return {"message": "No valid data found", "files": [], "errors": errors}

    return {
        "message": f"{len(processed_files)} fichier(s) traite(s) avec succes.",
        "files": processed_files,
        "errors": errors,
        "total_files": len(processed_files)
    }
