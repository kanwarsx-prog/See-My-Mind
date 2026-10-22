import uuid
from datetime import UTC, datetime

from app.schemas.registration import DispatchedEmailPreview

# In-memory store of recent dispatched emails for developer/staging preview
_RECENT_DISPATCHED_EMAILS: list[DispatchedEmailPreview] = []


class EmailService:
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
        In dev/staging, registers in the preview queue for immediate verification.
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
      Sent with care by St. Jude's Academy & See My Mind Platform<br>
      UK SEND Code of Practice & GDPR Compliant
    </div>
  </div>
</body>
</html>
        """

        preview = DispatchedEmailPreview(
            id=email_id,
            to_email=to_email,
            recipient_name=parent_name,
            subject=subject,
            html_content=html_content,
            sent_at=datetime.now(UTC),
            activation_url=activation_url,
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
