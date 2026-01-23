# Forgot Password Testing Guide

## Overview
The forgot password feature has been fully implemented! Here's how to test it.

## Prerequisites
- Backend must be running: `python manage.py runserver`
- Frontend must be running: `npm start`
- You need a user account with an email address

## Testing Steps

### Step 1: Access Forgot Password
1. Go to http://localhost:3000
2. Click "Login" in the menu bar
3. In the login modal, look for the **"Forgot Password?"** button below the submit button
4. Click it

### Step 2: Request Password Reset
1. The Password Reset modal should open with the title "Reset Password"
2. Enter your email address (the one you registered with)
3. Click "Send Reset Link"
4. You should see a success message: "Password reset link sent to your email!"

### Step 3: Get Reset Link from Console
Since we're using console email backend for development, the email is printed in the Django terminal:

1. Look at your Django terminal (where you ran `python manage.py runserver`)
2. You'll see an email like this:
   ```
   Content-Type: text/plain; charset="utf-8"
   MIME-Version: 1.0
   Content-Transfer-Encoding: 7bit
   Subject: Password Reset Request
   From: noreply@ghotidle.com
   To: yourname@example.com
   Date: Thu, 16 Jan 2025 10:30:00 -0000
   Message-ID: <...>

   Click the link below to reset your password:
   http://localhost:3000/reset-password?token=abcdef123456&uid=1
   ```
3. Copy the entire reset link (including token and uid parameters)

### Step 4: Reset Password
1. Paste the reset link in your browser OR click it if your terminal supports clickable links
2. The app will automatically:
   - Parse the token and uid from the URL
   - Open the "Set New Password" modal
   - Clear the URL parameters for security
3. Enter your new password (minimum 6 characters)
4. Click "Reset Password"
5. You should see: "Password reset successful! Redirecting to login..."
6. After 2 seconds, the auth modal will open in login mode

### Step 5: Test New Password
1. Login with your username and **new password**
2. You should be logged in successfully!

## Edge Cases to Test

### Invalid Email
- Enter an email that doesn't exist
- **Expected**: Still shows success message (prevents email enumeration attacks)
- **Backend**: No email sent, but user doesn't know if email exists

### Expired Token
- Request a reset link
- Wait more than 1 hour (PASSWORD_RESET_TIMEOUT = 3600 seconds)
- Try to use the link
- **Expected**: "Invalid or expired reset link" error

### Invalid Token
- Manually edit the token parameter in the URL
- **Expected**: "Invalid or expired reset link" error

### Short Password
- Try to enter a password less than 6 characters
- **Expected**: HTML5 validation prevents submission (minLength={6})

## Production Setup

When deploying to production:

1. **Enable Gmail SMTP** in `backend/ghotidle_backend/settings.py`:
   ```python
   # Comment out console backend
   # EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

   # Uncomment SMTP settings
   EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
   EMAIL_HOST = 'smtp.gmail.com'
   EMAIL_PORT = 587
   EMAIL_USE_TLS = True
   EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')  # Add to .env
   EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')  # App password
   ```

2. **Set environment variables**:
   ```
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-specific-password
   ```

3. **Generate Gmail App Password**:
   - Go to Google Account → Security → 2-Step Verification
   - Scroll down to "App passwords"
   - Generate a new app password for "Mail"
   - Use this 16-character password (not your regular Gmail password)

4. **Update reset link domain**:
   - In `backend/game/views.py`, line 169:
   - Change `http://localhost:3000` to your production domain
   - Example: `https://ghotidle.com/reset-password?token={token}&uid={uid}`

## Security Features

✅ **Token expiry**: Tokens expire after 1 hour (configurable)  
✅ **Email enumeration prevention**: Always returns success message  
✅ **Secure token generation**: Uses Django's built-in `default_token_generator`  
✅ **URL cleanup**: Token removed from URL bar after parsing  
✅ **Password validation**: Minimum 6 characters (can be increased)  
✅ **CSRF exempt**: Uses token-based validation instead

## Files Modified

### Backend
- `backend/ghotidle_backend/settings.py` - Email configuration
- `backend/game/views.py` - Added `request_password_reset()` and `reset_password()` views
- `backend/game/urls.py` - Added `/auth/password-reset/request/` and `/confirm/` routes

### Frontend
- `frontend/src/App.tsx` - Added password reset modal, state, and handlers
- `frontend/src/App.css` - Added `.forgot-password-link` styling

## API Endpoints

### POST `/api/auth/password-reset/request/`
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset link sent to your email!"
}
```

### POST `/api/auth/password-reset/confirm/`
**Request:**
```json
{
  "token": "abc123...",
  "uid": "1",
  "new_password": "newpassword123"
}
```

**Success Response:**
```json
{
  "message": "Password reset successful!"
}
```

**Error Response:**
```json
{
  "error": "Invalid or expired reset link"
}
```

## Troubleshooting

**Problem**: Modal doesn't open when clicking "Forgot Password?"  
**Solution**: Check browser console for errors, ensure state is updating correctly

**Problem**: Email not appearing in Django console  
**Solution**: Ensure `EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'` is set

**Problem**: Token validation fails  
**Solution**: Check that token hasn't expired (1 hour limit), ensure uid matches user ID

**Problem**: Password won't update  
**Solution**: Check minimum length (6 chars), ensure backend received correct parameters

**Problem**: Reset link has wrong domain  
**Solution**: Update line 169 in `backend/game/views.py` with correct domain

---

Happy testing! 🎉
