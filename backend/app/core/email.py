
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import settings
from pathlib import Path

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=settings.USE_CREDENTIALS,
    VALIDATE_CERTS=settings.VALIDATE_CERTS
)

html = """
<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <h2>Password Reset Request</h2>
    <p>You requested a password reset for your ExpenseX account.</p>
    <p>Your verification code is:</p>
    <h1 style="color: #10b981; font-size: 32px; letter-spacing: 5px;">{code}</h1>
    <p>This code will expire in 15 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
</div>
"""

async def send_reset_password_email(email_to: str, code: str):
    body = html.format(code=code)

    message = MessageSchema(
        subject="Reset Code for ExpenseX",
        recipients=[email_to],
        body=body,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)
