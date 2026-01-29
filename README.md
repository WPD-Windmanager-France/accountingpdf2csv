# PDF to CSV - Accounting Tool

Convertit vos relevés bancaires PDF en fichiers CSV compatibles CEGID Expert (format ECREXCEL).

## Stack

- **Frontend**: Next.js 14 + Tailwind CSS
- **Backend**: FastAPI (Python) - Serverless functions
- **Deployment**: Vercel

## Features

- Upload multiple PDFs via drag & drop
- Preview transactions in editable table
- Edit JOURNAL, GENERAL, AUXILIAIRE per row
- Download individual or all CSVs
- Sequential processing for Vercel compatibility

## Local Development

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd api
pip install -r requirements.txt
uvicorn index:app --reload --port 8000
```

## Deployment

Deployed automatically via Vercel on push to main.
