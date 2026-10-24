import logging
import smtplib
import uuid
from datetime import UTC, datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import httpx

from app.core.config import settings
from app.schemas.registration import DispatchedEmailPreview

logger = logging.getLogger(__name__)

# In-memory store of recent dispatched emails for developer/staging preview
_RECENT_DISPATCHED_EMAILS: list[DispatchedEmailPreview] = []


class EmailService:
    @staticmethod
    def _dispatch_via_resend(
        to_email: str, subject: str, html_content: str
    ) -> tuple[bool, str | None, str | None]:
        """Dispatch email using Resend REST API (HTTPS port 443)."""
        api_key = settings.RESEND_API_KEY.strip()
        if not api_key:
            return False, None, None

        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "from": settings.FROM_EMAIL,
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }

        try:
            with httpx.Client(timeout=10.0) as client:
                resp = client.post(url, headers=headers, json=payload)
                if resp.status_code in (200, 201):
                    res_data = resp.json()
                    external_id = res_data.get("id")
                    logger.info("Resend email dispatched successfully: %s to %s", external_id, to_email)
                    return True, external_id, None
                else:
                    err_detail = f"Resend API error {resp.status_code}: {resp.text}"
                    logger.warning(err_detail)
                    return False, None, err_detail
        except Exception as e:
            err_detail = f"Resend request exception: {e!s}"
            logger.error(err_detail)
            return False, None, err_detail

    @staticmethod
    def _dispatch_via_smtp(
        to_email: str, subject: str, html_content: str
    ) -> tuple[bool, str | None, str | None]:
        """Dispatch email using standard SMTP with STARTTLS."""
        if not settings.SMTP_HOST.strip() or not settings.SMTP_USER.strip():
            return False, None, None

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.FROM_EMAIL
            msg["To"] = to_email

            part = MIMEText(html_content, "html")
            msg.attach(part)

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10.0) as server:
                server.starttls()
                if settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.FROM_EMAIL, [to_email], msg.as_string())

            logger.info("SMTP email dispatched successfully to %s", to_email)
            return True, f"smtp-{uuid.uuid4().hex[:8]}", None
        except Exception as e:
            err_detail = f"SMTP error: {e!s}"
            logger.error(err_detail)
            return False, None, err_detail

    @staticmethod
    def send_parent_invitation(
        to_email: str,
        parent_name: str,
        child_name: str,
        school_name: str,
        token: str,
        base_url: str = "https://see-my-mind.onrender.com",
    ) -> DispatchedEmailPreview:
        """Render and dispatch parent onboarding invitation email.
        Delivers via Resend REST API if configured, SMTP if set, or saves to in-app preview queue.
        """
        activation_url = f"{base_url}/onboard?token={token}&role=parent"
        email_id = str(uuid.uuid4())
        subject = f"Welcome to See My Mind — Connect with {school_name} for {child_name}"

        html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F7FAFB; color: #1A3A4A; line-height: 1.6; margin: 0; padding: 0; }}
    .container {{ max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 18px rgba(26,58,74,0.08); border: 1px solid #EDF2F4; }}
    .header {{ background: #1A3A4A; padding: 28px 32px; text-align: left; color: #ffffff; }}
    .brand {{ font-family: 'Fraunces', Georgia, serif; font-size: 19px; font-weight: bold; letter-spacing: 0.02em; display: flex; align-items: center; gap: 10px; }}
    .orb {{ display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: #9ECFC4; }}
    .content {{ padding: 32px; }}
    .greeting {{ font-family: 'Fraunces', Georgia, serif; font-size: 20px; color: #1A3A4A; margin-bottom: 12px; font-weight: 600; }}
    .card {{ background: #F7FAFB; border-left: 4px solid #2A6B62; padding: 16px 18px; border-radius: 12px; margin: 20px 0; font-size: 13px; color: #2D5A6E; }}
    .features {{ margin: 24px 0; }}
    .feat-item {{ display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 13px; }}
    .btn {{ display: inline-block; background: #2A6B62; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 26px; border-radius: 14px; margin: 18px 0; text-align: center; }}
    .footer {{ background: #EDF2F4; padding: 18px 32px; font-size: 11px; color: #627984; text-align: center; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand"><span class="orb"></span> SEE MY MIND <span>· Inclusive Education</span></div>
    </div>
    <div class="content">
      <div class="greeting">Welcome to See My Mind, {parent_name}! 👋</div>
      <p style="font-size: 13.5px; color: #3D4F5A;">
        The SEND and inclusion team at <strong>{school_name}</strong> has registered <strong>{child_name}</strong> on See My Mind — our collaborative platform connecting school and home.
      </p>

      <div class="card">
        <strong>What See My Mind does for your family:</strong>
        <div class="features">
          <div class="feat-item">
            <span>🌅</span>
            <div><strong>Pre-Flight Morning Handover:</strong> Send a 20-second note each morning so teachers know how {child_name} slept, mood, and breakfast status before registration.</div>
          </div>
          <div class="feat-item">
            <span>⭐</span>
            <div><strong>Celebration of Daily Breakthroughs:</strong> Real-time alerts when {child_name} masters an adapted learning milestone or achieves a personal win.</div>
          </div>
          <div class="feat-item">
            <span>🧒</span>
            <div><strong>Pupil Voice Account:</strong> Empower {child_name} to check in with emoji moods, request quiet breaks, and track personal goals.</div>
          </div>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="{activation_url}" class="btn">Activate Your Parent Portal Account →</a>
      </div>

      <p style="font-size: 11.5px; color: #627984; margin-top: 20px;">
        For your family's privacy and security, this activation link expires in <strong>72 hours</strong>. If you did not expect this invitation, please contact {school_name}.
      </p>
    </div>
    <div class="footer">
      Sent with care by {school_name} & See My Mind Platform<br>
      UK SEND Code of Practice & GDPR Compliant
    </div>
  </div>
</body>
</html>
        """

        delivery_channel = "preview"
        external_id = None
        delivery_error = None

        # 1. Attempt Resend REST API delivery
        if settings.RESEND_API_KEY.strip():
            success, ext_id, err = EmailService._dispatch_via_resend(
                to_email=to_email, subject=subject, html_content=html_content
            )
            if success:
                delivery_channel = "resend"
                external_id = ext_id
            else:
                delivery_error = err
        # 2. Fallback to standard SMTP
        elif settings.SMTP_HOST.strip() and settings.SMTP_USER.strip():
            success, ext_id, err = EmailService._dispatch_via_smtp(
                to_email=to_email, subject=subject, html_content=html_content
            )
            if success:
                delivery_channel = "smtp"
                external_id = ext_id
            else:
                delivery_error = err

        preview = DispatchedEmailPreview(
            id=email_id,
            to_email=to_email,
            recipient_name=parent_name,
            subject=subject,
            html_content=html_content,
            sent_at=datetime.now(UTC),
            activation_url=activation_url,
            delivery_channel=delivery_channel,
            external_id=external_id,
            delivery_error=delivery_error,
        )

        _RECENT_DISPATCHED_EMAILS.insert(0, preview)
        # Keep only the latest 20 previews
        if len(_RECENT_DISPATCHED_EMAILS) > 20:
            _RECENT_DISPATCHED_EMAILS.pop()

        return preview

    @staticmethod
    def get_recent_invitations() -> list[DispatchedEmailPreview]:
        return _RECENT_DISPATCHED_EMAILS

    @staticmethod
    def get_latest_invitation_for_email(email: str) -> DispatchedEmailPreview | None:
        for em in _RECENT_DISPATCHED_EMAILS:
            if em.to_email.lower() == email.lower():
                return em
        return None
