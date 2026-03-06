# GeoSentinel Backend - Landslide Prediction System

A FastAPI-based backend for real-time landslide risk prediction using an XGBoost machine learning model, with environmental data simulation and multi-region monitoring capabilities.

## Features

- ✅ **User Registration** - Register users with their monitoring regions
- 🎯 **Landslide Prediction** - XGBoost-powered risk classification
- 🌍 **Multi-Region Support** - Monitor 5+ landslide-prone regions
- 📊 **Environmental Simulation** - Realistic weather condition generation
- 🚨 **Alert System** - High-risk notifications via SMS/Email (mock implementation)
- 🗺️ **Map Visualization API** - Color-coded risk levels for frontend integration
- 📁 **JSON-Based Storage** - Lightweight file-based persistence (no database required)

## Technology Stack

- **Framework**: FastAPI + Uvicorn
- **ML Model**: XGBoost (via pickle)
- **Data Validation**: Pydantic
- **Storage**: JSON files
- **Python Version**: 3.8+

## Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── config.yaml            # Configuration file
├── requirements.txt       # Python dependencies
├── .env.example          # Environment variables template
│
├── api/                  # Route handlers
│   ├── users.py         # User registration & management
│   ├── regions.py       # Region-based predictions
│   ├── prediction.py    # Custom predictions & map API
│   ├── alerts.py        # Alert history queries
│   └── routes_predict.py # Legacy prediction endpoint
│
├── services/             # Business logic
│   ├── predictor.py     # ML model wrapper
│   ├── simulator.py     # Environmental data simulator
│   └── alert_service.py # Alert handling & notifications
│
├── schemas/              # Pydantic models
│   ├── request.py       # Request models
│   └── response.py      # Response models
│
├── model/                # ML models
│   └── landslide_model.pkl (place your model here)
│
└── data/                 # JSON data storage
    ├── users.json       # Registered users
    ├── alerts.json      # Alert history
    └── regions.json     # Monitoring regions
```

## Installation & Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Prepare Your ML Model

Place your trained XGBoost model at:
```
backend/model/landslide_model.pkl
```

**Model Expected Input**: Feature vector of 6 environmental parameters in this order:
```
[rainfall_6h, rainfall_12h, rainfall_24h, soil_saturation_index, 
 slope_stability_factor, terrain_vulnerability_index]
```

**Model Expected Output**: Binary classification probability (0-1)

If no model file is found, the system will use **mock predictions** based on simulated environmental factors.

### 3. Configure Environment

Copy `.env.example` to `.env` and update as needed:
```bash
cp .env.example .env
```

### 4. Run the Backend

```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at: `http://localhost:8000`

## API Endpoints

### 📋 User Management

#### Register User
```
POST /users/register
Content-Type: application/json

{
  "name": "Ashwat Kumar",
  "email": "ashwat@example.com",
  "phone": "+919999999999",
  "region": "Uttarakhand"
}

Response:
{
  "user_id": "U5A8F3C2B",
  "name": "Ashwat Kumar",
  "email": "ashwat@example.com",
  "phone": "+919999999999",
  "region": "Uttarakhand"
}
```

#### Get All Users
```
GET /users

Response:
[
  {
    "user_id": "U001",
    "name": "Ashwat Kumar",
    "email": "ashwat@example.com",
    "phone": "+919999999999",
    "region": "Uttarakhand"
  }
]
```

#### Get User by ID
```
GET /users/{user_id}
```

#### Delete User
```
DELETE /users/{user_id}
```

---

### 🎯 Predictions

#### Custom Prediction
```
POST /predict
Content-Type: application/json

{
  "rainfall_6h": 30,
  "rainfall_12h": 55,
  "rainfall_24h": 95,
  "soil_saturation_index": 0.72,
  "slope_stability_factor": 0.41,
  "terrain_vulnerability_index": 0.63
}

Response:
{
  "region": "Custom Input",
  "landslide_probability": 0.65,
  "risk_level": "MEDIUM",
  "environmental_data": {
    "rainfall_6h": 30,
    "rainfall_12h": 55,
    "rainfall_24h": 95,
    "soil_saturation_index": 0.72,
    "slope_stability_factor": 0.41,
    "terrain_vulnerability_index": 0.63
  }
}
```

---

### 🌍 Regions

#### Get All Regions
```
GET /regions

Response:
[
  {
    "region": "Uttarakhand",
    "lat": 30.0668,
    "lon": 79.0193,
    "risk_level": "LOW"
  },
  {
    "region": "Arunachal Corridor",
    "lat": 28.2180,
    "lon": 94.7278,
    "risk_level": "HIGH"
  }
]
```

#### Predict for Region
```
POST /regions/Uttarakhand/predict

Response:
{
  "region": "Uttarakhand",
  "landslide_probability": 0.45,
  "risk_level": "MEDIUM",
  "environmental_data": {
    "rainfall_6h": 42.5,
    "rainfall_12h": 78.3,
    "rainfall_24h": 125.6,
    "soil_saturation_index": 0.65,
    "slope_stability_factor": 0.55,
    "terrain_vulnerability_index": 0.72
  }
}
```

#### Get Region Alerts
```
GET /regions/Uttarakhand/alerts

Response:
[
  {
    "region": "Uttarakhand",
    "risk_level": "HIGH",
    "probability": 0.82,
    "timestamp": "2026-03-06T10:30:45.123456"
  }
]
```

---

### 🗺️ Map Visualization

#### Get Map Risk Levels
```
GET /map/risk

Response:
{
  "regions": [
    {
      "region": "Uttarakhand",
      "lat": 30.0668,
      "lon": 79.0193,
      "risk_level": "LOW"        // Green
    },
    {
      "region": "Arunachal Corridor",
      "lat": 28.2180,
      "lon": 94.7278,
      "risk_level": "HIGH"       // Red
    },
    {
      "region": "Himachal Pradesh",
      "lat": 31.7433,
      "lon": 77.1205,
      "risk_level": "MEDIUM"     // Yellow
    }
  ]
}
```

**Color Mapping for Frontend**:
- `LOW` → Green (#00AA00)
- `MEDIUM` → Yellow (#FFAA00)
- `HIGH` → Red (#FF0000)

---

### 🚨 Alerts

#### Get All Alerts
```
GET /alerts

Response:
[
  {
    "region": "Arunachal Corridor",
    "risk_level": "HIGH",
    "probability": 0.82,
    "timestamp": "2026-03-06T10:30:45.123456"
  }
]
```

#### Get Alerts by Region
```
GET /alerts/region/Uttarakhand

Response:
[
  {
    "region": "Uttarakhand",
    "risk_level": "HIGH",
    "probability": 0.78,
    "timestamp": "2026-03-06T11:15:22.654321"
  }
]
```

#### Get High-Risk Alerts Only
```
GET /alerts/high-risk

Response:
[
  {
    "region": "Arunachal Corridor",
    "risk_level": "HIGH",
    "probability": 0.82,
    "timestamp": "2026-03-06T10:30:45.123456"
  }
]
```

---

### 📊 Health Check

```
GET /health

Response:
{
  "status": "healthy",
  "service": "GeoSentinel Backend"
}
```

---

## Risk Classification

The system classifies landslide risk based on ML model predictions:

| Probability | Risk Level | Color | Action |
|------------|-----------|-------|--------|
| < 0.40 | **LOW** | 🟢 Green | Normal monitoring |
| 0.40 - 0.70 | **MEDIUM** | 🟡 Yellow | Increased vigilance |
| > 0.70 | **HIGH** | 🔴 Red | Send alerts, Issue warnings |

---

## Environmental Data Simulation

When predictions are made for regions, the system generates realistic environmental conditions:

| Parameter | Range | Unit |
|-----------|-------|------|
| rainfall_6h | 10 - 80 | mm |
| rainfall_12h | 20 - 120 | mm |
| rainfall_24h | 40 - 200 | mm |
| soil_saturation_index | 0.2 - 0.9 | (normalized) |
| slope_stability_factor | 0.3 - 0.8 | (normalized) |
| terrain_vulnerability_index | 0.3 - 0.9 | (normalized) |

These simulate monsoon conditions affecting landslide risk in mountainous regions.

---

## Monitored Regions

Default regions configured in `data/regions.json`:

1. **Uttarakhand** - 30.0668°N, 79.0193°E
2. **Arunachal Corridor** - 28.2180°N, 94.7278°E
3. **Himachal Pradesh** - 31.7433°N, 77.1205°E
4. **Nilgiris** - 11.4107°N, 76.7314°E
5. **Western Ghats** - 12.5000°N, 75.5000°E

Modify `data/regions.json` to add/remove regions.

---

## Alert System

When a **HIGH** risk is detected:

1. System finds all users subscribed to that region
2. Sends SMS and Email notifications (mock implementation)
3. Logs alert to `data/alerts.json`

### SMS Alert Format
```
GeoSentinel Alert

High landslide risk detected in Uttarakhand.

Probability: 0.82
Please avoid vulnerable terrain.
```

### Email Alert Format
```
Subject: GeoSentinel Landslide Warning

A high landslide risk has been detected in your region.

Region: Uttarakhand
Probability: 0.82
Risk Level: HIGH
Timestamp: 2026-03-06T10:30:45

Please take necessary precautions and avoid vulnerable terrain.
```

---

## JSON Data Storage

### users.json
```json
[
  {
    "user_id": "U5A8F3C2B",
    "name": "Ashwat Kumar",
    "email": "ashwat@example.com",
    "phone": "+919999999999",
    "region": "Uttarakhand"
  }
]
```

### alerts.json
```json
[
  {
    "region": "Arunachal Corridor",
    "risk_level": "HIGH",
    "probability": 0.82,
    "timestamp": "2026-03-06T10:30:45.123456"
  }
]
```

### regions.json
```json
[
  {
    "region": "Uttarakhand",
    "lat": 30.0668,
    "lon": 79.0193
  }
]
```

---

## Testing with cURL

### Test User Registration
```bash
curl -X POST "http://localhost:8000/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+911234567890",
    "region": "Uttarakhand"
  }'
```

### Test Prediction
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "rainfall_6h": 30,
    "rainfall_12h": 55,
    "rainfall_24h": 95,
    "soil_saturation_index": 0.72,
    "slope_stability_factor": 0.41,
    "terrain_vulnerability_index": 0.63
  }'
```

### Test Map API
```bash
curl -X GET "http://localhost:8000/map/risk"
```

---

## Interactive Documentation

After starting the server, access interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Extending the System

### Add Custom Alert Handler
Edit `services/alert_service.py`:
```python
def _send_custom_alert(self, user: Dict, region: str, probability: float):
    # Your custom implementation
    pass
```

### Train Your Own Model
1. Prepare features: [rainfall_6h, rainfall_12h, rainfall_24h, soil_saturation, slope_stability, terrain_vulnerability]
2. Train XGBoost model
3. Save as pickle: `model/landslide_model.pkl`
4. System will automatically load it on startup

### Add New Regions
Add to `data/regions.json`:
```json
{
  "region": "New Region Name",
  "lat": 25.5,
  "lon": 85.5
}
```

---

## Troubleshooting

**Q: Model not loading?**
- Check if `model/landslide_model.pkl` exists
- System will use mock predictions if model is missing
- Check model format (must be XGBoost classifier saved with pickle)

**Q: Alerts not triggering?**
- Register users first at `/users/register`
- Alert threshold is set to 0.7 by default (HIGH = >0.7)
- Check `data/alerts.json` for logged alerts

**Q: Import errors?**
- Ensure you're running from `backend/` directory
- Run `pip install -r requirements.txt`
- Python version must be 3.8+

**Q: Port already in use?**
- Change port in main.py or run: `uvicorn main:app --port 8001`

---

## License

GeoSentinel Backend - Landslide Prediction System  
Built for disaster management and early warning systems.

---

## Support

For issues or questions, refer to:
- API Documentation: http://localhost:8000/docs
- Code comments in respective modules
- Configuration in `config.yaml`

---

**Last Updated**: March 6, 2026  
**Version**: 1.0.0
