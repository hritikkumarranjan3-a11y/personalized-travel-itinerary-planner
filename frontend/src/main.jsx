import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { MapPin, CalendarDays, Wallet, Sparkles, Compass, Clock3, Utensils, Train, Bookmark, Trash2, RefreshCw, ArrowRight, CheckCircle2 } from "lucide-react";
import "./styles.css";

const API = "http://127.0.0.1:8000";
const initial = { destination: "Jaipur", days: 3, budget: 10000, interests: ["Culture", "Food", "Photography"], travel_style: "Balanced", group_size: 1 };
function App() {
  const [form, setForm] = useState(initial);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(() => JSON.parse(localStorage.getItem("wanderplan-trips") || "[]"));
  const [tab, setTab] = useState("planner");
  useEffect(() => localStorage.setItem("wanderplan-trips", JSON.stringify(saved)), [saved]);
  const update = (key, value) => setForm(old => ({ ...old, [key]: value }));
  const toggleInterest = (name) => update("interests", form.interests.includes(name) ? form.interests.filter(x => x !== name) : [...form.interests, name]);
  async function generate(e) {
    e?.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch(`${API}/api/itinerary`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({...form, days:Number(form.days), budget:Number(form.budget), group_size:Number(form.group_size)}) });
      if (!response.ok) throw new Error("The backend returned an error. Check that FastAPI is running.");
      setTrip(await response.json()); setTab("planner");
    } catch (err) { setError("Could not connect to the backend. Start FastAPI using the instructions in README.md. " + err.message); }
    finally { setLoading(false); }
  }
  function saveTrip() {
    if (!trip) return;
    setSaved(old => [{...trip, savedAt:new Date().toLocaleString(), id:Date.now()}, ...old]);
  }
  const money = n => "₹" + Number(n || 0).toLocaleString("en-IN");
  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><span className="brand-icon"><Compass size={22}/></span><span>Wander<span className="brand-light">Plan</span></span></div>
      <div className="side-label">WORKSPACE</div>
      <button className={`nav ${tab==="planner"?"active":""}`} onClick={()=>setTab("planner")}><Sparkles size={18}/> Trip planner</button>
      <button className={`nav ${tab==="saved"?"active":""}`} onClick={()=>setTab("saved")}><Bookmark size={18}/> Saved trips <span className="count">{saved.length}</span></button>
      <div className="sidebar-bottom"><div className="avatar">WP</div><div><b>Travel workspace</b><small>Personal trip planning</small></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><span className="eyebrow">YOUR NEXT ADVENTURE STARTS HERE</span><h1>{tab==="saved"?"Saved journeys":"Personalized travel planner"}</h1><p>Thoughtful itineraries, shaped around you.</p></div><div className="status"><span className="status-dot"/> Planner ready</div></header>
      {tab==="saved" ? <section className="saved-page">
        {saved.length===0 ? <div className="empty"><Bookmark size={35}/><h2>No saved trips yet</h2><p>Generate an itinerary and save it here for later.</p><button className="primary" onClick={()=>setTab("planner")}>Plan a trip <ArrowRight size={16}/></button></div> :
          <div className="saved-grid">{saved.map(s=><article className="saved-card" key={s.id}><div className="saved-cover"><MapPin size={23}/><span>{s.destination}</span></div><div className="saved-content"><b>{s.days} days · {s.travel_style}</b><p>Estimated total: {money(s.budget_estimate)}</p><div className="saved-actions"><button className="secondary" onClick={()=>{setTrip(s);setTab("planner")}}>View itinerary</button><button className="icon-btn" aria-label="Delete trip" onClick={()=>setSaved(old=>old.filter(x=>x.id!==s.id))}><Trash2 size={17}/></button></div></div></article>)}</div>}
      </section> : <div className="layout">
        <section className="form-panel">
          <div className="section-heading"><div className="heading-icon"><Compass size={20}/></div><div><h2>Build your trip</h2><p>Tell us what your ideal getaway looks like.</p></div></div>
          <form onSubmit={generate}>
            <label>Where do you want to go?</label><div className="input-wrap"><MapPin size={18}/><input required minLength="2" value={form.destination} onChange={e=>update("destination",e.target.value)} placeholder="e.g. Jaipur, Goa, Bhopal"/></div>
            <div className="two-col"><div><label>Duration (days)</label><div className="input-wrap"><CalendarDays size={17}/><input type="number" min="1" max="14" value={form.days} onChange={e=>update("days",e.target.value)} required/></div></div><div><label>Group size</label><div className="input-wrap"><Compass size={17}/><input type="number" min="1" max="30" value={form.group_size} onChange={e=>update("group_size",e.target.value)} required/></div></div></div>
            <label>Total budget (₹)</label><div className="input-wrap"><Wallet size={18}/><input type="number" min="1" value={form.budget} onChange={e=>update("budget",e.target.value)} required/></div>
            <label>What are you interested in?</label><div className="chips">{["Culture","Food","Nature","History","Photography","Shopping"].map(x=><button type="button" key={x} className={`chip ${form.interests.includes(x)?"selected":""}`} onClick={()=>toggleInterest(x)}>{form.interests.includes(x)&&<CheckCircle2 size={14}/>} {x}</button>)}</div>
            <label>Travel style</label><div className="style-options">{["Relaxed","Balanced","Adventure"].map(x=><button type="button" key={x} onClick={()=>update("travel_style",x)} className={`style-option ${form.travel_style===x?"selected":""}`}><span>{x==="Relaxed"?"☁️":x==="Balanced"?"🌿":"🧭"}</span><b>{x}</b><small>{x==="Relaxed"?"Slow and easy":x==="Balanced"?"A bit of everything":"Active exploring"}</small></button>)}</div>
            {error&&<div className="error">{error}</div>}
            <button className="primary generate" type="submit" disabled={loading}>{loading?<><RefreshCw className="spin" size={17}/> Creating your plan…</>:<><Sparkles size={17}/> Generate my itinerary</>}</button>
            <p className="privacy-note">✨ Personalized to your interests and budget</p>
          </form>
        </section>
        <section className="results-panel">
          {!trip ? <div className="welcome">
            <div className="hero-art"><div className="sun"/><div className="mountain m1"/><div className="mountain m2"/><div className="path"/></div>
            <span className="eyebrow">LESS PLANNING, MORE EXPLORING</span><h2>Your next story is<br/>waiting to happen.</h2><p>Choose your destination and preferences. We'll turn them into a day-by-day plan with activities and an estimated budget.</p>
            <div className="feature-list"><div><span><CalendarDays size={17}/></span><div><b>Day-by-day schedule</b><small>Activities arranged into a clear plan</small></div></div><div><span><Wallet size={17}/></span><div><b>Budget-aware suggestions</b><small>Keep estimated costs in view</small></div></div><div><span><Sparkles size={17}/></span><div><b>Made for your interests</b><small>Culture, food, nature and more</small></div></div></div>
          </div> : <div className="itinerary">
            <div className="result-top"><div><span className="eyebrow">YOUR PERSONALIZED ITINERARY</span><h2><MapPin size={23}/> {trip.destination}</h2><p>{trip.days} days <span>·</span> {trip.travel_style} <span>·</span> {trip.group_size} traveler{trip.group_size>1?"s":""}</p></div><button className="secondary" onClick={saveTrip}><Bookmark size={16}/> Save trip</button></div>
            <div className="budget-card"><div><span>ESTIMATED TOTAL</span><strong>{money(trip.budget_estimate)}</strong><small>Budget: {money(trip.budget)}</small></div><div className={`budget-status ${trip.within_budget?"good":"warn"}`}>{trip.within_budget?"Within budget":"Over budget"}<b>{money(Math.abs(trip.budget_remaining))} {trip.within_budget?"left":"over"}</b></div></div>
            <div className="cost-row"><div><span>🎟️</span><small>Activities</small><b>{money(trip.cost_breakdown.activities_and_entry)}</b></div><div><span>🚕</span><small>Transport</small><b>{money(trip.cost_breakdown.local_transport)}</b></div><div><span>🍽️</span><small>Food</small><b>{money(trip.cost_breakdown.food)}</b></div></div>
            <div className="days-heading"><h3>Your day-by-day plan</h3><button className="text-btn" onClick={generate}><RefreshCw size={14}/> Regenerate</button></div>
            {trip.itinerary.map(day=><article className="day-card" key={day.day}><div className="day-number">DAY <b>{day.day}</b></div><div className="day-content"><h4>{day.title}</h4>{day.activities.map((a,i)=><div className="activity" key={i}><div className="activity-time"><Clock3 size={14}/>{a.time}</div><div className="activity-info"><b>{a.title}</b><small>{a.description}</small><span className="category">{a.category}</span></div><strong>{money(a.estimated_cost)}</strong></div>)}<div className="day-total">Daily activity estimate <b>{money(day.daily_estimate)}</b></div></div></article>)}
            <p className="disclaimer">{trip.note}</p>
          </div>}
        </section>
      </div>}
      <footer>WanderPlan <span>·</span> Personalized Travel Itinerary Planner <span>·</span> Academic project MVP</footer>
    </main>
  </div>;
}
createRoot(document.getElementById("root")).render(<App/>);
