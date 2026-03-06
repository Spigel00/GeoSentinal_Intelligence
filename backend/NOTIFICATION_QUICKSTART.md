# GeoSentinel Notification System - Quick Start

## Overview

The GeoSentinel backend now supports **real-time SMTP email and SMS notifications** for landslide alerts. This document provides quick commands to test the notification system.

## Current Status

✅ **Notification Service**: Installed and running  
✅ **API Endpoints**: `/notifications/*` routes active  
⚠️ **Email Alerts**: Disabled (configure in .env to enable)  
⚠️ **SMS Alerts**: Disabled (configure in .env to enable)  

## Quick Test Commands

### 1. Check Notification Status

```bash
curl http://localhost:8001/notifications/status | python3 -m json.tool
```

### 2. Test Email (Mock Mode - No Real Send)

```bash
curl -X POST "http://localhost:8001/notifications/test/email" \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "test@example.com",
    "subject": "Test Email",
    "message": "This is a test"
  }' | python3 -m json.tool
```

Expected response when disabled:
```json
{
  "detail": "Email alerts are disabled"
}
```

### 3. Test SMS (Mock Mode - No Real Send)

```bash
curl -X POST "http://localhost:8001/notifications/test/sms" \
  -H "Content-Type: application/json" \
  -d '{
    "to_phone": "+919999999999",
    "message": "Test SMS"
  }' | python3 -m json.tool
```

### 4. Test Complete Landslide Alert

```bash
curl -X POST "http://localhost:8001/notifications/test/alert" \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "test@example.com",
    "user_phone": "+919999999999",
    "user_name": "Test User",
    "region": "Uttarakhand",
    "probability": 0.85,
    "risk_level": "HIGH"
  }' | python3 -m json.tool
```

### 5. Send Alert to All Users in a Region

```bash
# First, register a user
curl -X POST "http://localhost:8001/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+919999999999",
    "region": "Uttarakhand"
  }'

# Then send alert to all Uttarakhand users
curl -X POST "http://localhost:8001/notifications/send-region-alert/Uttarakhand?probability=0.85&risk_level=HIGH" | python3 -m json.tool
```

## Enable Real Notifications

Edit `backend/.env`:

```bash
# Enable Email (Gmail Example)
ENABLE_EMAIL_ALERTS=True
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
FROM_EMAIL=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Generate at https://myaccount.google.com/apppasswords

# Enable SMS (Twilio)
ENABLE_SMS_ALERTS=True
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

Then restart the server:
```bash
cd backend
pkill -f uvicorn
python main.py
```

## Installed Dependencies

- ✅ `twilio==8.10.0` - SMS notifications via Twilio
- ✅ `email-validator==2.3.0` - Email validation for Pydantic
- ✅ Built-in `smtplib` - SMTP email sending

## API Documentation

Interactive API docs with all notification endpoints:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

Look for the "notifications" tag to see all available endpoints.

## File Structure

```
backend/
├── services/
│   ├── notification_service.py  # NEW: SMTP & SMS core logic
│   └── alert_service.py         # UPDATED: Uses notification_service
├── api/
│   └── notifications.py         # NEW: Testing endpoints
├── requirements.txt             # UPDATED: Added twilio, email-validator
├── .env                         # UPDATED: Notification config
├── NOTIFICATIONS.md             # NEW: Detailed setup guide
└── README.md                    # UPDATED: Notification docs

```

## Next Steps

1. **Configure Credentials**: Update `.env` with real SMTP and Twilio credentials
2. **Test Notifications**: Use test endpoints to verify email/SMS delivery
3. **Monitor Logs**: Check server logs for notification status messages
4. **Frontend Integration**: Update UI to show notification status

## Support

- **Full Setup Guide**: See `backend/NOTIFICATIONS.md`
- **API Reference**: Visit `http://localhost:8001/docs`
- **Twilio Docs**: https://www.twilio.com/docs/sms
- **Gmail SMTP**: https://support.google.com/mail/answer/7126229

---

**Status**: ✅ Notification system fully integrated and ready for configuration
**Version**: 1.0.0
**Date**: March 7, 2026
