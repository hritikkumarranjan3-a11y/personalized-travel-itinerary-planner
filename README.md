# Personalized Travel Itinerary Planner

A deadline-friendly MVP built with React + Vite (frontend) and FastAPI (backend).
It generates day-by-day travel plans based on destination, budget, trip duration, interests and travel style.
Trips can be saved in the browser using localStorage. The itinerary generator works without API keys using a demo data set and sensible fallbacks.

## Requirements
- Python 3.10+
- Node.js 18+

## Run the backend
Open a terminal in `backend`:

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend: http://127.0.0.1:8000  
API docs: http://127.0.0.1:8000/docs

## Run the frontend
Open a second terminal in `frontend`:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).

## Features
- Trip form: destination, number of days, total budget, interests, travel style, group size
- FastAPI REST endpoint for itinerary generation
- Day-by-day schedule with activities and estimated expenses
- Budget summary and basic budget warning
- Regenerate itinerary
- Save and remove saved trips in browser storage
- Responsive dashboard UI

## Important project notes
- This is an MVP/demo, not a live travel-booking system. Place suggestions and prices are illustrative and must be verified before real travel.
- Browser-saved trips use localStorage, not Supabase. Supabase can be added for authentication and cloud persistence.
- The backend uses a built-in destination dataset so the project runs immediately. To add a real LLM, replace `build_itinerary()` in `backend/main.py` with a call to a model provider and store its API key in an environment variable. Never commit API keys.
