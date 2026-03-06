"""
Notification service for sending SMTP emails and SMS messages.
Supports Gmail SMTP and Twilio SMS.
"""
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class NotificationService:
    """Handles email and SMS notifications"""
    
    def __init__(self):
        """Initialize notification service with environment configuration"""
        # SMTP Configuration
        self.smtp_enabled = os.getenv("ENABLE_EMAIL_ALERTS", "False").lower() == "true"
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.from_email = os.getenv("FROM_EMAIL", "")
        self.email_password = os.getenv("EMAIL_PASSWORD", "")
        
        # SMS Configuration (Twilio)
        self.sms_enabled = os.getenv("ENABLE_SMS_ALERTS", "False").lower() == "true"
        self.twilio_account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        self.twilio_auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
        self.twilio_phone = os.getenv("TWILIO_PHONE_NUMBER", "")
        
        # Initialize Twilio client if SMS is enabled
        self.twilio_client = None
        if self.sms_enabled and self.twilio_account_sid and self.twilio_auth_token:
            try:
                from twilio.rest import Client
                self.twilio_client = Client(self.twilio_account_sid, self.twilio_auth_token)
                logger.info("✓ Twilio SMS client initialized successfully")
            except ImportError:
                logger.warning("⚠ Twilio library not installed. SMS will be disabled.")
                self.sms_enabled = False
            except Exception as e:
                logger.error(f"✗ Failed to initialize Twilio client: {e}")
                self.sms_enabled = False
        
        # Log configuration status
        logger.info(f"Notification Service Configuration:")
        logger.info(f"  Email Alerts: {'Enabled' if self.smtp_enabled else 'Disabled'}")
        logger.info(f"  SMS Alerts: {'Enabled' if self.sms_enabled else 'Disabled'}")
    
    def send_email(
        self, 
        to_email: str, 
        subject: str, 
        body: str, 
        html_body: Optional[str] = None
    ) -> Dict[str, any]:
        """
        Send email via SMTP.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Plain text email body
            html_body: Optional HTML email body
            
        Returns:
            Dict with success status and message
        """
        if not self.smtp_enabled:
            logger.info(f"📧 EMAIL [Mock - Disabled]: To={to_email}, Subject={subject}")
            return {
                "success": False,
                "message": "Email alerts are disabled",
                "mode": "mock"
            }
        
        if not self.from_email or not self.email_password:
            logger.error("✗ SMTP credentials not configured")
            return {
                "success": False,
                "message": "SMTP credentials not configured",
                "mode": "error"
            }
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = subject
            msg['Date'] = datetime.now().strftime("%a, %d %b %Y %H:%M:%S %z")
            
            # Add plain text body
            msg.attach(MIMEText(body, 'plain'))
            
            # Add HTML body if provided
            if html_body:
                msg.attach(MIMEText(html_body, 'html'))
            
            # Connect to SMTP server and send
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()  # Secure connection
                server.login(self.from_email, self.email_password)
                server.send_message(msg)
            
            logger.info(f"✓ Email sent successfully to {to_email}")
            return {
                "success": True,
                "message": f"Email sent to {to_email}",
                "mode": "live"
            }
            
        except smtplib.SMTPAuthenticationError:
            logger.error("✗ SMTP authentication failed. Check credentials.")
            return {
                "success": False,
                "message": "SMTP authentication failed",
                "mode": "error"
            }
        except smtplib.SMTPException as e:
            logger.error(f"✗ SMTP error: {e}")
            return {
                "success": False,
                "message": f"SMTP error: {str(e)}",
                "mode": "error"
            }
        except Exception as e:
            logger.error(f"✗ Failed to send email: {e}")
            return {
                "success": False,
                "message": f"Failed to send email: {str(e)}",
                "mode": "error"
            }
    
    def send_sms(self, to_phone: str, message: str) -> Dict[str, any]:
        """
        Send SMS via Twilio.
        
        Args:
            to_phone: Recipient phone number (E.164 format, e.g., +919999999999)
            message: SMS message body
            
        Returns:
            Dict with success status and message
        """
        if not self.sms_enabled:
            logger.info(f"📱 SMS [Mock - Disabled]: To={to_phone}, Message={message[:50]}...")
            return {
                "success": False,
                "message": "SMS alerts are disabled",
                "mode": "mock"
            }
        
        if not self.twilio_client:
            logger.error("✗ Twilio client not initialized")
            return {
                "success": False,
                "message": "Twilio client not initialized",
                "mode": "error"
            }
        
        try:
            # Send SMS via Twilio
            twilio_message = self.twilio_client.messages.create(
                body=message,
                from_=self.twilio_phone,
                to=to_phone
            )
            
            logger.info(f"✓ SMS sent successfully to {to_phone} (SID: {twilio_message.sid})")
            return {
                "success": True,
                "message": f"SMS sent to {to_phone}",
                "message_sid": twilio_message.sid,
                "mode": "live"
            }
            
        except Exception as e:
            logger.error(f"✗ Failed to send SMS to {to_phone}: {e}")
            return {
                "success": False,
                "message": f"Failed to send SMS: {str(e)}",
                "mode": "error"
            }
    
    def send_landslide_alert(
        self, 
        user: Dict, 
        region: str, 
        probability: float,
        risk_level: str = "HIGH"
    ) -> Dict[str, any]:
        """
        Send both email and SMS landslide alert to a user.
        
        Args:
            user: User dictionary with email, phone, and name
            region: Region name
            probability: Landslide probability (0-1)
            risk_level: Risk level (LOW, MEDIUM, HIGH)
            
        Returns:
            Dict with results for both email and SMS
        """
        results = {
            "email": None,
            "sms": None
        }
        
        # Email content
        email_subject = f"GeoSentinel {risk_level} Landslide Warning - {region}"
        email_body = f"""
Dear {user.get('name', 'User')},

A {risk_level.lower()} landslide risk has been detected in your monitored region.

Region: {region}
Risk Level: {risk_level}
Probability: {probability:.1%}
Timestamp: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}

RECOMMENDED ACTIONS:
- Avoid vulnerable terrain and steep slopes
- Stay informed about weather conditions
- Follow local authority instructions
- Keep emergency contacts ready

This is an automated alert from the GeoSentinel Intelligence System.

Stay safe,
GeoSentinel Alerts Team
        """.strip()
        
        # HTML version of email (optional)
        email_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: {'#d32f2f' if risk_level == 'HIGH' else '#f57c00'};">
                ⚠️ GeoSentinel {risk_level} Landslide Warning
            </h2>
            <p>Dear <strong>{user.get('name', 'User')}</strong>,</p>
            <p>A {risk_level.lower()} landslide risk has been detected in your monitored region.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid {'#d32f2f' if risk_level == 'HIGH' else '#f57c00'};">
                <p><strong>Region:</strong> {region}</p>
                <p><strong>Risk Level:</strong> <span style="color: {'#d32f2f' if risk_level == 'HIGH' else '#f57c00'};">{risk_level}</span></p>
                <p><strong>Probability:</strong> {probability:.1%}</p>
                <p><strong>Timestamp:</strong> {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
            </div>
            
            <h3>Recommended Actions:</h3>
            <ul>
                <li>Avoid vulnerable terrain and steep slopes</li>
                <li>Stay informed about weather conditions</li>
                <li>Follow local authority instructions</li>
                <li>Keep emergency contacts ready</li>
            </ul>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
                This is an automated alert from the GeoSentinel Intelligence System.
            </p>
        </body>
        </html>
        """
        
        # SMS content (keep it short for SMS limits)
        sms_body = f"""GeoSentinel Alert

{risk_level} landslide risk in {region}!

Probability: {probability:.0%}
Time: {datetime.now().strftime("%H:%M")}

Avoid vulnerable terrain. Stay safe!"""
        
        # Send email
        if user.get('email'):
            results['email'] = self.send_email(
                to_email=user['email'],
                subject=email_subject,
                body=email_body,
                html_body=email_html
            )
        
        # Send SMS
        if user.get('phone'):
            results['sms'] = self.send_sms(
                to_phone=user['phone'],
                message=sms_body
            )
        
        return results


# Singleton instance
_notification_service = None


def get_notification_service() -> NotificationService:
    """Get or create the notification service instance"""
    global _notification_service
    if _notification_service is None:
        _notification_service = NotificationService()
    return _notification_service
