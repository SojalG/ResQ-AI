# ResQAI

**Predict. Prepare. Protect.** A full-stack disaster and community intelligence platform with a citizen dashboard, AI preparedness assistant, incident reporting, and an operations command center.

## Quick start

1. Copy `.env.example` to `.env` and add any available cloud keys. All core flows work in demo mode without keys.
2. Install dependencies: `npm run install:all`
3. Start all services: `npm run dev`
4. Open `http://localhost:5173`

Individual services run on ports 5173 (React), 3001 (Express), and 5001 (Flask). The admin login is `admin` / `resqai2024`.

## Cloud integrations

- `MONGODB_URI`: enables persistent incidents, alerts, and chat sessions. Without it, the API uses seeded in-memory data.
- `GEMINI_API_KEY`: enables live chat, incident image analysis, and recommendations. Without it, safety-focused deterministic responses are used.
- `VITE_GOOGLE_MAPS_KEY`: enables Google Maps, markers, and the heatmap. A functional incident canvas is shown without it.
- `VITE_OPENWEATHER_API_KEY`: enables live local weather. Lucknow demo conditions are shown without it.
- `ML_SERVICE_URL`: defaults to `http://localhost:5001`; the Express API includes a safe local prediction fallback.

To seed MongoDB, run `npm run seed`. To run the containerized API and ML services, use `docker compose up --build`.

