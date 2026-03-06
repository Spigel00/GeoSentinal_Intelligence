# GeoSentinel Backend - Landslide Prediction System

A FastAPI-based backend for real-time landslide risk prediction using an XGBoost machine learning model, with environmental data simulation and multi-region monitoring capabilities.

## Features

- ✅ **User Registration** - Register users with their monitoring regions
- 🎯 **Landslide Prediction** - XGBoost-powered risk classification
- 🌍 **Multi-Region Support** - Monitor 5+ landslide-prone regions
- 📊 **Environmental Simulation** - Realistic weather condition generation
- 🚨 **Alert System** - Real-time notifications via SMTP Email & Twilio SMS
- 📧 **Email Alerts** - HTML & plain-text emails with risk details
- 📱 **SMS Alerts** - Instant SMS via Twilio to registered users
- 🗺️ **Map Visualization API** - Color-coded risk levels for frontend integration
- 📁 **JSON-Based Storage** - Lightweight file-based persistence (no database required)
- 🧪 **Notification Testing** - Built-in endpoints to test email/SMS delivery

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
│   ├── notifications.py # Notification testing endpoints
│   └── routes_predict.py # Legacy prediction endpoint
│
├── services/             # Business logic
│   ├── predictor.py     # ML model wrapper
│   ├── simulator.py     # Environmental data simulator
│   ├── alert_service.py # Alert handling & notifications
│   └── notification_service.py # SMTP & SMS notification engine
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

**Installed Libraries**:
- FastAPI + Uvicorn - Web framework
- XGBoost - ML model
- Pydantic - Data validation
- Python-dotenv - Environment config
- Twilio - SMS notifications
- Built-in smtplib - Email notifications

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

Configure real-time weather API variables:
```bash
INDIAN_WEATHER_API_KEY=your_key_here
INDIAN_WEATHER_BASE_URL=https://weather.indianapi.in
INDIAN_WEATHER_ENDPOINT=/weather
INDIAN_WEATHER_ENDPOINTS=/weather,/current,/forecast
INDIAN_WEATHER_TIMEOUT_SECONDS=8
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

#### Get Live Weather For All Regions
```
GET /regions/live-weather?mock=false

Query Parameters:
  - mock (optional): Set to true for simulated weather data (default: false)

Response (with mock=true):
{
  "source": "Mock Weather Data",
  "generated_at": "2026-03-06T16:20:15.235901",
  "regions": [
    {
      "region": "Uttarakhand",
      "lat": 30.25,
      "lon": 79.0,
      "success": true,
      "weather_data": {
        "location": {"name": "Uttarakhand", "lat": 30.25, "lon": 79.0},
        "current": {
          "temp_c": 15.2,
          "condition": "Partly cloudy",
          "humidity": 39,
          "precip_mm": 135.85,
          "wind_kph": 14.0
        },
        "note": "Mock data - set mock=false for live API data"
      },
      "error": null
    }
  ]
}
```

**Mock Mode (`?mock=true`)**: Use this during development/testing when the weather API key has access issues. It generates realistic weather data based on environmental simulation.

When one region fails with real API, the endpoint still returns the remaining regions with an error string only for failed entries.

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

### � Notifications

#### Get Notification Status
Check current SMTP and SMS configuration status.

```
GET /notifications/status

Response:
{
  "email": {
    "enabled": true,
    "configured": true,
    "server": "smtp.gmail.com",
    "port": 587,
    "from_email": "geosEntinel@example.com"
  },
  "sms": {
    "enabled": true,
    "configured": true,
    "provider": "Twilio",
    "from_phone": "+1234567890"
  }
}
```

#### Test Email Notification
```
POST /notifications/test/email
Content-Type: application/json

{
  "to_email": "test@example.com",
  "subject": "Test Email",
  "message": "This is a test email from GeoSentinel"
}

Response:
{
  "status": "success",
  "message": "Email sent to test@example.com",
  "mode": "live"
}
```

#### Test SMS Notification
```
POST /notifications/test/sms
Content-Type: application/json

{
  "to_phone": "+919999999999",
  "message": "This is a test SMS from GeoSentinel"
}

Response:
{
  "status": "success",
  "message": "SMS sent to +919999999999",
  "mode": "live",
  "message_sid": "SM..."
}
```

#### Test Complete Alert
Test both email and SMS for landslide alert.

```
POST /notifications/test/alert
Content-Type: application/json

{
  "user_email": "test@example.com",
  "user_phone": "+919999999999",
  "user_name": "Test User",
  "region": "Uttarakhand",
  "probability": 0.85,
  "risk_level": "HIGH"
}

Response:
{
  "status": "completed",
  "user": "Test User",
  "region": "Uttarakhand",
  "probability": 0.85,
  "risk_level": "HIGH",
  "results": {
    "email": {
      "success": true,
      "message": "Email sent to test@example.com",
      "mode": "live"
    },
    "sms": {
      "success": true,
      "message": "SMS sent to +919999999999",
      "mode": "live",
      "message_sid": "SM..."
    }
  }
}
```

#### Send Alert to Region Users
Send alert to all users monitoring a specific region.

```
POST /notifications/send-region-alert/Uttarakhand?probability=0.85&risk_level=HIGH

Response:
{
  "status": "completed",
  "region": "Uttarakhand",
  "users_notified": 1,
  "results": [
    {
      "user": "Ashwat Kumar",
      "email": {
        "success": true,
        "message": "Email sent to ashwat@example.com",
        "mode": "live"
      },
      "sms": {
        "success": true,
        "message": "SMS sent to +919999999999",
        "mode": "live"
      }
    }
  ]
}
```

---

### �📊 Health Check

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

The system supports **real-time SMTP email and SMS notifications** via Twilio when HIGH risk is detected.

### Configuration

Update `.env` to enable notifications:

```bash
# Enable notifications
ENABLE_EMAIL_ALERTS=True
ENABLE_SMS_ALERTS=True

# SMTP Configuration (Gmail example)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
FROM_EMAIL=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Use App Password for Gmail

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number
```

**Note**: For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833?hl=en) instead of your regular password.

### How Alerts Work

When a **HIGH** risk is detected (probability > 0.7):

1. System finds all users subscribed to that region
2. Sends SMS notifications via Twilio (if enabled)
3. Sends Email notifications via SMTP (if enabled)
4. Logs alert to `data/alerts.json`

If notifications are disabled, the system will log the alert but won't send messages.

### SMS Alert Format
```
GeoSentinel Alert

HIGH landslide risk in Uttarakhand!

Probability: 82%
Time: 10:30

Avoid vulnerable terrain. Stay safe!
```

### Email Alert Format
```
Subject: GeoSentinel HIGH Landslide Warning - Uttarakhand

Dear Ashwat Kumar,

A high landslide risk has been detected in your monitored region.

Region: Uttarakhand
Risk Level: HIGH
Probability: 82.0%
Timestamp: 2026-03-07 10:30:45

RECOMMENDED ACTIONS:
- Avoid vulnerable terrain and steep slopes
- Stay informed about weather conditions
- Follow local authority instructions
- Keep emergency contacts ready

This is an automated alert from the GeoSentinel Intelligence System.

Stay safe,
GeoSentinel Alerts Team
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
