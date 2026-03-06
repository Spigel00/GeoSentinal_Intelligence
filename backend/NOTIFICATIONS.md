# GeoSentinel Notifications Setup Guide

This guide walks you through setting up **SMTP Email** and **Twilio SMS** notifications for the GeoSentinel landslide alert system.

## Table of Contents
- [Overview](#overview)
- [Email Setup (SMTP)](#email-setup-smtp)
- [SMS Setup (Twilio)](#sms-setup-twilio)
- [Configuration](#configuration)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Overview

GeoSentinel supports two notification channels:

1. **Email (SMTP)** - Sends HTML and plain-text emails via SMTP server
2. **SMS (Twilio)** - Sends text messages via Twilio API

Both can be enabled/disabled independently in the `.env` file.

**When alerts are triggered**:
- System finds users monitoring the affected region
- Sends notifications via enabled channels
- Logs alert to `data/alerts.json`

---

## Email Setup (SMTP)

### Option 1: Gmail (Recommended for Testing)

#### Step 1: Create an App Password

1. Enable 2-Factor Authentication on your Google Account
2. Go to: https://myaccount.google.com/apppasswords
3. Select "Mail" and your device
4. Click "Generate"
5. Copy the 16-character password

#### Step 2: Update .env

```bash
ENABLE_EMAIL_ALERTS=True
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
FROM_EMAIL=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

**Important**: 
- Use the App Password, NOT your regular Gmail password
- App Passwords require 2FA to be enabled
- Remove spaces from the 16-character password

### Option 2: Other SMTP Providers

#### Outlook/Hotmail
```bash
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
FROM_EMAIL=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

#### SendGrid
```bash
SMTP_SERVER=smtp.sendgrid.net
SMTP_PORT=587
FROM_EMAIL=your-verified-sender@example.com
EMAIL_PASSWORD=your-sendgrid-api-key
```

#### Custom SMTP Server
```bash
SMTP_SERVER=mail.yourdomain.com
SMTP_PORT=587  # Or 465 for SSL
FROM_EMAIL=alerts@yourdomain.com
EMAIL_PASSWORD=your-password
```

### Email Features

- ✅ HTML and plain-text versions
- ✅ Color-coded risk levels
- ✅ Recommended safety actions
- ✅ Timestamp and location details
- ✅ Professional formatting

---

## SMS Setup (Twilio)

### Step 1: Create Twilio Account

1. Sign up at: https://www.twilio.com/try-twilio
2. Complete phone verification
3. You'll receive **$15 trial credit** (enough for ~500 SMS)

### Step 2: Get Credentials

From the Twilio Console (https://console.twilio.com):

1. **Account SID**: Find on dashboard (starts with "AC...")
2. **Auth Token**: Click "Show" to reveal (keep secret!)
3. **Phone Number**: Get a free trial number in "Phone Numbers" section

### Step 3: Verify Test Numbers (Trial Account)

Trial accounts can only send to verified numbers:

1. Go to "Phone Numbers" → "Verified Caller IDs"
2. Click "+" to add a number
3. Enter number in E.164 format: `+919999999999`
4. Complete verification code

### Step 4: Update .env

```bash
ENABLE_SMS_ALERTS=True
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio number
```

### SMS Features

- ✅ Short, concise alerts (under 160 chars)
- ✅ Risk level and probability
- ✅ Timestamp
- ✅ Action-oriented message
- ✅ Works on any mobile device

### Twilio Pricing (After Trial)

- **Standard SMS**: $0.0079/message (US)
- **International**: Varies by country
- **India SMS**: ~$0.0075/message
- See: https://www.twilio.com/sms/pricing

---

## Configuration

### Full .env Example

```bash
# Notification Toggle
ENABLE_EMAIL_ALERTS=True
ENABLE_SMS_ALERTS=True

# SMTP Configuration (Gmail)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
FROM_EMAIL=geosEntinel@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # App Password

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_secret_auth_token
TWILIO_PHONE_NUMBER=+12025551234

# Alert Threshold
HIGH_RISK_THRESHOLD=0.7
```

### Notification Modes

| Mode | Email | SMS | Use Case |
|------|-------|-----|----------|
| **Both Enabled** | ✅ Live | ✅ Live | Production |
| **Email Only** | ✅ Live | ⚠️ Mock | Testing, Low budget |
| **SMS Only** | ⚠️ Mock | ✅ Live | Mobile-first alerts |
| **Both Disabled** | ⚠️ Mock | ⚠️ Mock | Development |

Mock mode prints to console instead of sending real messages.

---

## Testing

### 1. Check Notification Status

```bash
curl http://localhost:8000/notifications/status
```

Expected response:
```json
{
  "email": {
    "enabled": true,
    "configured": true,
    "server": "smtp.gmail.com",
    "port": 587,
    "from_email": "geosEntinel@gmail.com"
  },
  "sms": {
    "enabled": true,
    "configured": true,
    "provider": "Twilio",
    "from_phone": "+12025551234"
  }
}
```

### 2. Test Email

```bash
curl -X POST "http://localhost:8000/notifications/test/email" \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "your-test@email.com",
    "subject": "GeoSentinel Test Email",
    "message": "This is a test email from GeoSentinel backend."
  }'
```

### 3. Test SMS

```bash
curl -X POST "http://localhost:8000/notifications/test/sms" \
  -H "Content-Type: application/json" \
  -d '{
    "to_phone": "+919999999999",
    "message": "This is a test SMS from GeoSentinel."
  }'
```

### 4. Test Complete Alert

```bash
curl -X POST "http://localhost:8000/notifications/test/alert" \
  -H "Content-Type: application/json" \
  -d '{
    "user_email": "your-test@email.com",
    "user_phone": "+919999999999",
    "user_name": "Test User",
    "region": "Test Region",
    "probability": 0.85,
    "risk_level": "HIGH"
  }'
```

### 5. Test Region Alert

First, register a user:
```bash
curl -X POST "http://localhost:8000/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your-test@email.com",
    "phone": "+919999999999",
    "region": "Uttarakhand"
  }'
```

Then trigger alert for all users in that region:
```bash
curl -X POST "http://localhost:8000/notifications/send-region-alert/Uttarakhand?probability=0.85&risk_level=HIGH"
```

---

## Troubleshooting

### Email Issues

#### ❌ SMTP Authentication Failed

**Problem**: Invalid credentials or App Password not set up

**Solutions**:
- ✅ Enable 2FA on Google Account
- ✅ Generate new App Password
- ✅ Use 16-character password without spaces
- ✅ Check `FROM_EMAIL` matches the account

#### ❌ Connection Timeout

**Problem**: Firewall blocking SMTP port

**Solutions**:
- ✅ Check port 587 is open
- ✅ Try port 465 with SSL
- ✅ Disable VPN temporarily
- ✅ Check corporate firewall rules

#### ❌ "Email alerts are disabled"

**Problem**: `ENABLE_EMAIL_ALERTS=False` in .env

**Solution**:
```bash
ENABLE_EMAIL_ALERTS=True  # Change to True
```

Then restart the server.

### SMS Issues

#### ❌ Twilio Client Not Initialized

**Problem**: Missing or invalid Twilio credentials

**Solutions**:
- ✅ Check `TWILIO_ACCOUNT_SID` starts with "AC"
- ✅ Verify `TWILIO_AUTH_TOKEN` is correct
- ✅ Ensure no extra spaces in credentials
- ✅ Install Twilio: `pip install twilio`

#### ❌ "Unable to create record"

**Problem**: Trial account sending to unverified number

**Solutions**:
- ✅ Verify recipient number in Twilio Console
- ✅ Use E.164 format: `+919999999999`
- ✅ Upgrade to paid account (removes restriction)

#### ❌ "The 'To' number is not a valid phone number"

**Problem**: Invalid phone number format

**Solution**: Use E.164 international format:
- ✅ Correct: `+919999999999` (India)
- ✅ Correct: `+12025551234` (US)
- ❌ Wrong: `9999999999` (missing country code)
- ❌ Wrong: `+91 9999 999 999` (has spaces)

#### ❌ "SMS alerts are disabled"

**Problem**: `ENABLE_SMS_ALERTS=False` in .env

**Solution**:
```bash
ENABLE_SMS_ALERTS=True  # Change to True
```

Then restart the server.

### General Debugging

#### Check Server Logs

Look for initialization messages:
```
✓ Twilio SMS client initialized successfully
Notification Service Configuration:
  Email Alerts: Enabled
  SMS Alerts: Enabled
```

Or error messages:
```
✗ Failed to initialize Twilio client: ...
⚠ Twilio library not installed. SMS will be disabled.
```

#### Test Individual Components

1. **Email Service**:
   ```python
   from services.notification_service import get_notification_service
   ns = get_notification_service()
   result = ns.send_email("test@example.com", "Test", "Message")
   print(result)
   ```

2. **SMS Service**:
   ```python
   from services.notification_service import get_notification_service
   ns = get_notification_service()
   result = ns.send_sms("+919999999999", "Test message")
   print(result)
   ```

#### Restart Server After Config Changes

```bash
# Kill existing server
pkill -f uvicorn

# Restart
cd backend
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Production Deployment

### Security Best Practices

1. **Never commit .env file**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Use environment variables** on production server:
   ```bash
   export SMTP_SERVER=smtp.gmail.com
   export EMAIL_PASSWORD=your-app-password
   export TWILIO_AUTH_TOKEN=your-secret-token
   ```

3. **Rotate credentials periodically**
   - Generate new App Passwords every 90 days
   - Rotate Twilio Auth Token if compromised

4. **Monitor usage**
   - Check Twilio Console for SMS delivery status
   - Monitor SMTP logs for failed deliveries
   - Set budget alerts in Twilio dashboard

### Rate Limiting

For high-volume deployments, add rate limiting:

```python
# In alert_service.py
from time import sleep

for user in users:
    send_alert(user)
    sleep(0.1)  # 10 alerts/second max
```

### Backup Notification Channels

Consider adding:
- **Slack/Teams** webhooks
- **WhatsApp** via Twilio API
- **Push notifications** via Firebase
- **Voice calls** for critical alerts

---

## Support

### Official Documentation

- **Twilio SMS**: https://www.twilio.com/docs/sms
- **Gmail SMTP**: https://support.google.com/mail/answer/7126229
- **Python smtplib**: https://docs.python.org/3/library/smtplib.html

### Common Resources

- Twilio Trial Account: https://www.twilio.com/try-twilio
- Gmail App Passwords: https://myaccount.google.com/apppasswords
- E.164 Format Guide: https://www.twilio.com/docs/glossary/what-e164

---

**Last Updated**: March 7, 2026  
**Version**: 1.0.0
