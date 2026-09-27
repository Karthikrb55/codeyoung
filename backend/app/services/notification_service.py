import smtplib
from email.message import EmailMessage
from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.core.config import settings

class NotificationService:
    @staticmethod
    def _send_email(to_email: str, subject: str, body: str):
        if not settings.SMTP_HOST:
            print("SMTP_HOST not configured. Mocking email to", to_email)
            print("Subject:", subject)
            print(body)
            return

        try:
            msg = EmailMessage()
            msg.set_content(body)
            msg['Subject'] = subject
            msg['From'] = settings.EMAIL_FROM or settings.SMTP_USERNAME
            msg['To'] = to_email

            # Choose SMTP_SSL or starttls based on port or standard practice. 
            # Usually port 465 is SMTP_SSL, 587 is STARTTLS. Let's try starttls generally.
            if settings.SMTP_PORT == 465:
                server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT)
            else:
                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
                server.ehlo()
                if settings.SMTP_USE_TLS:
                    server.starttls()
                    server.ehlo()
            
            with server:
                if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.send_message(msg)
            print(f"--- EMAIL SENT SUCCESSFULLY TO {to_email} ---")
        except Exception as e:
            print(f"--- FAILED TO SEND EMAIL TO {to_email} ---")
            print(f"Error: {str(e)}")

    @staticmethod
    def send_parent_confirmation(db: Session, booking):
        content = f"""Hi {booking.parent_name},
        
Your child {booking.child_name}'s trial class for {booking.subject} is confirmed!
Mentor: {booking.mentor.name}

Join Demo Class: {booking.meeting_url}
"""
        NotificationService._send_email(
            to_email=booking.parent_email,
            subject="Your Trial Class is Confirmed",
            body=content
        )
        
        notif = Notification(
            booking_id=booking.id,
            recipient_type="PARENT",
            recipient_email=booking.parent_email,
            content=content
        )
        db.add(notif)

    @staticmethod
    def send_mentor_confirmation(db: Session, booking):
        content = f"""Hi {booking.mentor.name},
        
You have a new trial class for {booking.subject} with {booking.child_name}.
Parent: {booking.parent_name}

Join Demo Class: {booking.meeting_url}
"""
        NotificationService._send_email(
            to_email=booking.mentor.email,
            subject="New Trial Class Assigned",
            body=content
        )
        
        notif = Notification(
            booking_id=booking.id,
            recipient_type="MENTOR",
            recipient_email=booking.mentor.email,
            content=content
        )
        db.add(notif)
