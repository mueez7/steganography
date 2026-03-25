# StealthSpace

A full-stack multimodal steganography web application that allows users to hide secret messages inside ordinary files — text, images, audio, and video — and extract them on demand.

---

## Overview

StealthSpace is built with a React frontend and a FastAPI backend. Authentication is handled through Supabase. Users must sign in to access the encoding and decoding tools, while the landing page is publicly accessible.

**Supported media types:**
- Plain text files
- Images (PNG)
- Audio (WAV)
- Video (AVI)

---

## Project Structure

```
Steganography/
├── backend/          # FastAPI application
│   ├── main.py       # API routes and CORS configuration
│   ├── stego.py      # Steganography encoding/decoding logic
│   ├── requirements.txt
│   └── .env.example
└── frontend/         # React + Vite application
    ├── src/
    │   ├── App.jsx
    │   ├── Auth.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

---

## Prerequisites

- **Python** 3.9 or higher
- **Node.js** 18 or higher
- A **Supabase** project (for authentication)

---

## Running Locally

### 1. Backend

Navigate to the backend directory and set up a virtual environment:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

- **Windows:** `venv\Scripts\activate`
- **macOS / Linux:** `source venv/bin/activate`

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file based on the example:

```bash
copy .env.example .env   # Windows
cp .env.example .env     # macOS / Linux
```

Edit `.env` and set your frontend URL:

```
FRONTEND_URL=http://localhost:5173
```

Start the development server:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

---

### 2. Frontend

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000
```

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## Deployment

### Backend — Render

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your repository and set the root directory to `backend`.
3. Set the following build and start commands:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port 10000`
4. Add the following environment variable under **Environment**:
   - `FRONTEND_URL` — your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

### Frontend — Vercel

1. Import your repository on [Vercel](https://vercel.com).
2. Set the **Root Directory** to `frontend`.
3. Vercel will auto-detect the Vite framework. The build command (`npm run build`) and output directory (`dist`) are set automatically.
4. Add the following environment variables under **Settings > Environment Variables**:
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — your Supabase anonymous key
   - `VITE_API_URL` — your Render backend URL (e.g., `https://your-api.onrender.com`)
5. Deploy.

---

## Authentication

Authentication is powered by [Supabase](https://supabase.com). Users can register with an email and password. Email verification is enabled by default through your Supabase project settings. The application allows guest access to the landing page, but encoding and decoding operations require a valid session.

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable       | Description                                         |
|----------------|-----------------------------------------------------|
| `FRONTEND_URL` | Comma-separated list of allowed frontend origins    |

### Frontend (`frontend/.env`)

| Variable               | Description                                      |
|------------------------|--------------------------------------------------|
| `VITE_SUPABASE_URL`    | Your Supabase project URL                        |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase project anonymous (public) key   |
| `VITE_API_URL`         | The URL of the running FastAPI backend           |

---

## License

This project is intended for educational and academic purposes.
