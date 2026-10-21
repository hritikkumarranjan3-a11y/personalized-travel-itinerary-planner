from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List

app = FastAPI(title="Personalized Travel Itinerary Planner API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DESTINATIONS = {
    "bhopal": [
        ("Upper Lake / Boat Club", "Nature", 250, "Morning"),
        ("Van Vihar National Park", "Nature", 150, "Morning"),
        ("Tribal Museum", "Culture", 200, "Afternoon"),
        ("Taj-ul-Masajid area", "Culture", 100, "Afternoon"),
        ("New Market food walk", "Food", 350, "Evening"),
        ("DB City area", "Shopping", 500, "Evening"),
    ],
    "jaipur": [
        ("Amber Fort", "History", 500, "Morning"),
        ("Hawa Mahal viewpoint", "History", 200, "Morning"),
        ("City Palace", "Culture", 500, "Afternoon"),
        ("Jantar Mantar", "History", 250, "Afternoon"),
        ("Johari Bazaar food walk", "Food", 400, "Evening"),
        ("Patrika Gate", "Photography", 100, "Evening"),
    ],
    "goa": [
        ("Beach walk and sunrise", "Nature", 100, "Morning"),
        ("Old Goa heritage area", "History", 250, "Morning"),
        ("Local Goan lunch", "Food", 450, "Afternoon"),
        ("Fontainhas heritage lanes", "Culture", 150, "Afternoon"),
        ("Sunset at a public beach", "Nature", 100, "Evening"),
        ("Local market stroll", "Shopping", 300, "Evening"),
    ],
    "delhi": [
        ("Humayun's Tomb", "History", 350, "Morning"),
        ("India Gate area", "Photography", 100, "Morning"),
        ("National Museum", "Culture", 300, "Afternoon"),
        ("Local street-food stop", "Food", 350, "Afternoon"),
        ("Connaught Place walk", "Shopping", 300, "Evening"),
        ("Lodhi Garden", "Nature", 100, "Evening"),
    ],
}
DEFAULT = [
    ("Explore the city's main landmark", "Culture", 250, "Morning"),
    ("Visit a local museum or heritage site", "History", 300, "Morning"),
    ("Try a popular local lunch spot", "Food", 400, "Afternoon"),
    ("Explore a market or scenic neighborhood", "Shopping", 250, "Afternoon"),
    ("Relax at a park or viewpoint", "Nature", 150, "Evening"),
    ("Enjoy a local dinner", "Food", 450, "Evening"),
]

class TripRequest(BaseModel):
    destination: str = Field(min_length=2, max_length=80)
    days: int = Field(default=3, ge=1, le=14)
    budget: float = Field(default=10000, gt=0, le=10000000)
    interests: List[str] = []
    travel_style: str = "Balanced"
    group_size: int = Field(default=1, ge=1, le=30)

def build_itinerary(req: TripRequest):
    place_key = req.destination.strip().lower()
    places = DESTINATIONS.get(place_key, DEFAULT)
    interests = {x.lower() for x in req.interests}
    # Prefer requested interest categories, while always keeping enough options.
    preferred = [p for p in places if p[1].lower() in interests]
    ordered = preferred + [p for p in places if p not in preferred]
    if req.travel_style == "Relaxed":
        ordered = sorted(ordered, key=lambda p: 0 if p[3] in ("Morning", "Evening") else 1)
    elif req.travel_style == "Adventure":
        ordered = sorted(ordered, key=lambda p: 0 if p[1] == "Nature" else 1)

    daily = []
    for day in range(req.days):
        items = []
        # Two activities per day; rotate through the curated list.
        for slot in range(2):
            item = ordered[(day * 2 + slot) % len(ordered)]
            name, category, cost, time = item
            items.append({
                "time": time,
                "title": name,
                "category": category,
                "description": f"{'A good fit for your ' + category.lower() + ' interest.' if interests and category.lower() in interests else 'Suggested stop; check current opening times before visiting.'}",
                "estimated_cost": cost * req.group_size,
            })
        daily.append({"day": day + 1, "title": f"Day {day + 1} — Explore {req.destination.title()}",
                      "activities": items, "daily_estimate": sum(x["estimated_cost"] for x in items)})

    activities_total = sum(d["daily_estimate"] for d in daily)
    transport = int(req.days * 350 * req.group_size)
    food = int(req.days * 700 * req.group_size)
    total = activities_total + transport + food
    return {
        "destination": req.destination.title(),
        "days": req.days,
        "travel_style": req.travel_style,
        "group_size": req.group_size,
        "interests": req.interests,
        "budget": req.budget,
        "budget_estimate": total,
        "budget_remaining": round(req.budget - total, 2),
        "within_budget": total <= req.budget,
        "cost_breakdown": {"activities_and_entry": activities_total, "local_transport": transport, "food": food},
        "itinerary": daily,
        "note": "Demo estimates only. Verify prices, routes, opening hours and safety information before travelling."
    }

@app.get("/")
def home():
    return {"message": "Personalized Travel Itinerary Planner API is running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/itinerary")
def generate_itinerary(req: TripRequest):
    return build_itinerary(req)
