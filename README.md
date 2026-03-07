# GeoSentinal Intelligence

GeoSentinal Intelligence is a full-stack landslide early warning platform with:

- A FastAPI backend for prediction, alerts, notifications, and region/weather APIs
- A React + TypeScript frontend for dashboards, maps, analytics, and operations
- Lightweight JSON-based storage for users, regions, and alert history

This repository is structured for local development and demo deployments.

## 1. What This Project Does

GeoSentinal helps monitor high-risk regions and generate early warnings using environmental inputs.

Core capabilities:

- Predict landslide probability from six environmental features
- Classify risks into `LOW`, `MEDIUM`, `HIGH`
- Run region-level predictions and store high-risk alerts
- Send notifications through SMTP email and Twilio SMS
- Visualize risk and alert data in an interactive frontend
- Pull rainfall/weather-like records from `data.gov.in` (when configured)

## 2. Repository Layout

```text
GeoSentinal_Intelligence/
├── backend/                      # FastAPI backend
│   ├── main.py                   # App entry point
│   ├── api/                      # Route modules
│   ├── services/                 # Business logic (predictor, alerts, notifications, weather)
│   ├── schemas/                  # Pydantic request/response models
│   ├── data/                     # JSON persistence (users, alerts, regions)
│   ├── model/                    # ML model file location
│   ├── requirements.txt
│   ├── .env.example
│   ├── NOTIFICATIONS.md
│   └── NOTIFICATION_QUICKSTART.md
├── frontend/                     # Vite + React + TS application
│   ├── src/
│   │   ├── pages/               # Dashboard, map, users, alerts, analytics, settings
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/api.ts      # API client + endpoint wrappers
│   ├── package.json
│   └── vite.config.ts
├── docs/                         # Supplemental project documentation
├── data/                         # Additional data copies/artifacts
└── GEOSENTIAL_OPENAPI.json       # OpenAPI export
```

## 3. Architecture Overview

```text
Frontend (React + Vite)
	|
	| HTTP (Axios)
	v
Backend (FastAPI)
  |- api/* routes
  |- services/predictor.py (ML or mock)
  |- services/alert_service.py
  |- services/notification_service.py (SMTP/Twilio)
  |- services/weather_client.py (data.gov.in)
	|
	v
JSON Files (backend/data/*.json)
```

Risk thresholds used by the backend predictor:

- `LOW`: probability `< 0.4`
- `MEDIUM`: `0.4 <= probability < 0.7`
- `HIGH`: probability `>= 0.7`

If no model file is available at `backend/model/landslide_model.pkl` (or `MODEL_PATH`), the backend automatically falls back to mock prediction logic.

## 4. Tech Stack

Backend:

- FastAPI
- Uvicorn
- Pydantic v2
- XGBoost + scikit-learn + NumPy
- Python `smtplib` for email
- Twilio SDK for SMS

Frontend:

- React 18 + TypeScript
- Vite
- TanStack Query
- React Router
- Axios
- Tailwind + shadcn/radix UI
- Recharts
- Leaflet / React-Leaflet

## 5. Prerequisites

- Python 3.10+ (3.8+ may work, but modern Python is recommended)
- Node.js 18+ and npm
- Optional: Twilio account for live SMS
- Optional: SMTP credentials (for live email alerts)
- Optional: `data.gov.in` API key (for live weather endpoint)

## 6. Local Setup

### 6.1 Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create env file:

```bash
cp .env.example .env
```

Minimal `.env` (safe defaults for local dev):

```env
# Prediction/model
MODEL_PATH=model/landslide_model.pkl

# Notification toggles
ENABLE_EMAIL_ALERTS=False
ENABLE_SMS_ALERTS=False

# SMTP (used only when ENABLE_EMAIL_ALERTS=True)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
FROM_EMAIL=
EMAIL_PASSWORD=

# Twilio (used only when ENABLE_SMS_ALERTS=True)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Live weather (data.gov.in)
INDIAN_WEATHER_API_KEY=
INDIAN_WEATHER_BASE_URL=https://api.data.gov.in/resource/6c05cd1b-ed59-40c2-bc31-e314f39c6971
INDIAN_WEATHER_TIMEOUT_SECONDS=8
INDIAN_WEATHER_MAX_RETRIES=2
INDIAN_WEATHER_RETRY_BACKOFF_SECONDS=0.5
INDIAN_WEATHER_MAX_WORKERS=5
```

Run backend:

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend URLs:

- API root: `http://localhost:8000/`
- Health: `http://localhost:8000/health`
- Swagger: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 6.2 Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_DEBUG=false
```

Run frontend:

```bash
cd frontend
npm run dev
```

Frontend default URL: `http://localhost:5173`

## 7. Run Order

1. Start backend first (`backend` directory).
2. Start frontend second (`frontend` directory).
3. Open frontend at `http://localhost:5173`.

## 8. API Overview

Main route groups:

- `users`: registration and CRUD-lite operations
- `predictions`: custom prediction + map risk aggregation
- `regions`: region listing, region prediction, region alerts, live weather
- `alerts`: global and filtered alert history
- `notifications`: status + email/SMS/alert test endpoints

### 8.1 Core Endpoints

Health and base:

- `GET /`
- `GET /health`

Users:

- `POST /users/register`
- `GET /users/`
- `GET /users/{user_id}`
- `DELETE /users/{user_id}`

Predictions and map:

- `POST /predict`
- `GET /map/risk`
- `POST /regions/{region_name}/predict`
- `GET /regions`
- `GET /regions/{region_name}/alerts`

Alerts:

- `GET /alerts`
- `GET /alerts/region/{region_name}`
- `GET /alerts/high-risk`

Notifications:

- `GET /notifications/status`
- `POST /notifications/test/email`
- `POST /notifications/test/sms`
- `POST /notifications/test/alert`
- `POST /notifications/send-region-alert/{region_name}?probability=0.85&risk_level=HIGH`

Weather data:

- `GET /regions/live-weather?mock=true`
- `GET /regions/live-weather?mock=false` (requires `INDIAN_WEATHER_API_KEY`)

Legacy compatibility endpoint:

- `POST /api/predict`

### 8.2 Prediction Input Schema

`POST /predict` expects:

- `rainfall_6h`: `0..200`
- `rainfall_12h`: `0..250`
- `rainfall_24h`: `0..500`
- `soil_saturation_index`: `0..1`
- `slope_stability_factor`: `0..1`
- `terrain_vulnerability_index`: `0..1`

## 9. Frontend Features

Implemented pages include:

- `Dashboard`
- `MapView`
- `Users`
- `Predictions`
- `Alerts`
- `Analytics`
- `Settings`
- Auth pages: `Login`, `Register`

Frontend API behavior highlights:

- Uses `VITE_API_URL` with fallback to `http://localhost:8000`
- Axios interceptors attach `Authorization` if `geosentinel_auth` exists in localStorage
- On `401`, frontend clears auth keys and redirects to `/login`

## 10. Data and Persistence

Backend persistence is file-based JSON:

- `backend/data/users.json`
- `backend/data/alerts.json`
- `backend/data/regions.json`

Seeded regions include:

- Ladakh
- Himachal Pradesh
- Uttarakhand
- Sikkim
- Arunachal Pradesh

## 11. Notifications

For full notification setup and troubleshooting, see:

- `backend/NOTIFICATIONS.md`
- `backend/NOTIFICATION_QUICKSTART.md`

Behavior summary:

- When disabled, notification endpoints return mock/disabled behavior
- High-risk events (`HIGH`) trigger alert logging and region user notifications

## 12. Development Notes

- Start backend from `backend/` to avoid path confusion for model/data files.
- Start frontend from `frontend/`; running `npm run dev` at repo root will fail because no root `package.json` script exists.
- The repository currently contains both `backend/main.py` and `backend/mian.py`; only `backend/main.py` is the active entry point.
- Extra environment templates like `backend/.evn.example` appear to be a typo/duplicate and can be ignored unless intentionally used.

## 13. Testing

Frontend tests:

```bash
cd frontend
npm test
```

Backend currently has no formal automated test suite in this repo. Use `/docs` and curl/Postman for API verification.

## 14. Troubleshooting

`ModuleNotFoundError` or import issues when starting backend:

- Ensure you run from `backend/` with activated virtual environment.

Frontend cannot connect to backend:

- Confirm backend is running on `:8000`.
- Confirm `frontend/.env` has `VITE_API_URL=http://localhost:8000`.
- Restart Vite after changing env vars.

`/regions/live-weather?mock=false` returns config error:

- Set `INDIAN_WEATHER_API_KEY` in `backend/.env`.

Email/SMS tests fail:

- Verify `ENABLE_EMAIL_ALERTS` / `ENABLE_SMS_ALERTS` are set to `True`.
- Verify SMTP and Twilio credentials.

## 15. Useful Commands

Backend:

```bash
cd backend && source venv/bin/activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd frontend && npm run dev
```

Check backend health:

```bash
curl http://localhost:8000/health
```

## 16. License

No explicit license file is currently present in this repository. Add one if you plan to distribute or open-source this project.