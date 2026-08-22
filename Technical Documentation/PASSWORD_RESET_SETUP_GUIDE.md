# Password Reset Email Configuration Guide

## ⚠️ What Was Wrong?

The password reset feature was **fully implemented in the code**, but **email sending was NOT configured**. When you clicked "Forgot Password", the system:

✅ Generated a secure reset token  
✅ Saved it to the database  
✅ **Tried to send email BUT failed** (SMTP not configured)  
❌ You never received the reset link email  

---

## ✅ Solution: Configure Gmail SMTP

I've added SMTP configuration to `application.properties`. Now follow these steps to make it work:

### Step 1: Generate Gmail App Password

**Why?** Gmail blocks regular passwords for third-party apps. You need a special "App Password".

**Follow these steps**:

1. **Open Google Account**
   - Go to: https://myaccount.google.com/
   - Login with: **nayakshakti999@gmail.com**

2. **Enable 2-Factor Authentication** (Required for App Passwords)
   - Click: **Security** (left panel)
   - Find: **2-Step Verification**
   - Click: **Get Started**
   - Follow Google's steps to enable it
   - Verify your phone number

3. **Generate App Password**
   - Go back to: https://myaccount.google.com/security
   - Scroll down to: **App passwords** (appears after 2FA is enabled)
   - Select: **Mail** and **Windows Computer**
   - Google generates a **16-character password**
   - **Copy this password** (you'll use it in Step 2)

4. **Take Screenshot**
   - The app password looks like: `abcd efgh ijkl mnop`
   - Save it safely - you'll need it now

---

### Step 2: Update Password in Configuration

**File**: `backend/src/main/resources/application.properties` (Already updated, just edit one line)

Find this line (around line 31):
```properties
spring.mail.password=YOUR_GMAIL_APP_PASSWORD_HERE
```

Replace `YOUR_GMAIL_APP_PASSWORD_HERE` with your **16-character app password** from Step 1:

```properties
spring.mail.password=abcdefghijklmnop
```

**Example** (if your app password is from Google):
```properties
spring.mail.password=nvza lsbb cvfr sxyz
```

---

### Step 3: Restart Backend Service

Stop and restart the backend:

```powershell
# In backend terminal:
# Press Ctrl + C to stop
# Then run:
mvn spring-boot:run
```

Wait for: `Tomcat started on port(s): 8080`

---

## 🧪 Step 4: Test Password Reset

Now let's test if email sending works:

### Test 1: Try Forgot Password Flow

1. **Open Frontend** 
   - Go to: http://localhost:5173/forgot-password
   - (Or login page → click "Forgot Password")

2. **Submit Your Email**
   - Enter: `nayakshakti999@gmail.com`
   - Click: **[Send Reset Link]**
   - You should see: "✓ Check your email for reset link"

3. **Check Email** 
   - Go to: https://mail.google.com
   - Check inbox for email from: `noreply@universitymanagement.com`
   - Subject: **"Password Reset Request - University Management System"**
   - **If you don't see it**:
     - Check **Spam** folder
     - Wait 30 seconds and refresh
     - Check backend logs for errors

4. **Click Reset Link**
   - Email contains link like: `http://localhost:5174/reset-password?token=abc123...`
   - Click it
   - You'll be taken to reset password page

5. **Reset Your Password**
   - Enter: New password (min 6 characters)
   - Confirm: Same password
   - Click: **[Reset Password]**
   - Success! ✅

### Test 2: Direct API Test (For Developers)

```powershell
# Test forgot password endpoint
curl -X POST http://localhost:8080/api/auth/forgot-password `
  -H "Content-Type: application/json" `
  -d '{"email":"nayakshakti999@gmail.com"}'

# Response should be:
# {
#   "status": "success",
#   "message": "If email exists, reset link has been sent"
# }
```

---

## 🔍 Check Logs If Email Fails

If you don't receive the email, check the backend logs for errors:

**In backend PowerShell window**, look for messages like:
```
ERROR - Failed to send email to nayakshakti999@gmail.com
ERROR - SMTP Authentication failed
ERROR - Connection refused to smtp.gmail.com
```

### Common Error Solutions

#### Error 1: "Authentication failed"
```
ERROR: 535 5.7.8 Username and App password mismatch
```
**Solution**: 
- Verify app password is correct (copy-paste from Google)
- Ensure 2-Factor Authentication is enabled
- Try generating a new app password

#### Error 2: "Connection refused"
```
ERROR: Connection refused to smtp.gmail.com:587
```
**Solution**:
- Check internet connection
- Gmail SMTP might be blocked by firewall
- Try on mobile hotspot to test

#### Error 3: "Less secure app error"
```
ERROR: Please log in via your web browser and then try again later
```
**Solution**: 
- This shouldn't happen with app password, but if it does:
- Login to Gmail manually in browser
- Then try password reset again

---

## 📧 What Happens Now (Email Flow)

When user clicks "Forgot Password":

```
1. User enters: nayakshakti999@gmail.com
   ↓
2. Backend finds user by email (security: doesn't say if user exists)
   ↓
3. Generates random token: a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6
   ↓
4. Saves to database with 24-hour expiry
   ↓
5. Calls EmailService.sendPasswordResetEmail()
   ↓
6. Connects to Gmail SMTP: smtp.gmail.com:587
   ↓
7. Authenticates with:
      Email: nayakshakti999@gmail.com
      Password: YOUR_GMAIL_APP_PASSWORD_HERE
   ↓
8. Sends email:
      From: nayakshakti999@gmail.com
      To: nayakshakti999@gmail.com (or any registered user email)
      Subject: Password Reset Request
      Body: Reset link with token
   ↓
9. Email arrives in user's inbox (or spam)
   ↓
10. User clicks link
    ↓
11. Frontend shows reset password form
    ↓
12. Backend validates token (not expired, not used before)
    ↓
13. Hash new password with BCrypt
    ↓
14. Update database
    ↓
15. Mark token as used (prevents reuse)
    ↓
16. Success! Password changed
```

---

## 🔐 Security Notes

✅ **Good Security**:
- App password is separate from Gmail password (change app password without affecting Gmail)
- Token expires in 24 hours (can't use old reset links)
- Token is one-time use (can't reuse same token)
- Reset link contains random UUID (can't guess tokens)
- Password is hashed with BCrypt (even we can't see it)

⚠️ **Important**:
- **NEVER commit password to Git** (it's in properties file - add to .gitignore)
- **Change password before production** (use environment variables)
- **Use HTTPS in production** (reset links shouldn't be in HTTP logs)

---

## 🚀 For Production Deployment

Before deploying to live server:

1. **Use Environment Variables** (instead of properties file)
   ```powershell
   # Windows environment variable
   SET SPRING_MAIL_PASSWORD=your-app-password
   ```

2. **Use Custom Domain Email** (for professionalism)
   ```properties
   spring.mail.username=noreply@yourdomain.com
   spring.mail.properties.mail.from=noreply@yourdomain.com
   ```

3. **Use Custom SMTP Server** (if you have one)
   ```properties
   spring.mail.host=mail.yourdomain.com
   spring.mail.username=noreply@yourdomain.com
   spring.mail.password=your-password
   ```

4. **Enable HTTPS** in production
   ```properties
   app.frontend.url=https://yourdomain.com
   ```

---

## ❓ FAQ

**Q: Can I use a different email address?**  
A: Yes! Change `spring.mail.username` and `spring.mail.properties.mail.from` to any Gmail address. You'll need an app password for that account too.

**Q: What if I want to use Outlook/Hotmail?**  
A: Change these settings:
```properties
spring.mail.host=smtp.office365.com
spring.mail.port=587
spring.mail.username=youremaol@outlook.com
spring.mail.password=your-outlook-app-password
```

**Q: Can I test without real email?**  
A: Yes! For development, you can use a fake SMTP server:
```properties
spring.mail.host=localhost
spring.mail.port=1025
# Use MailHog (Docker) to view sent emails at http://localhost:8025
```

**Q: Password reset email template - can I customize?**  
A: Yes! Edit `EmailService.java` in backend/src/main/java/com/university/service/

---

## ✅ Checklist Before Testing

- [ ] Generated Gmail App Password
- [ ] Enabled 2-Factor Authentication on nayakshakti999@gmail.com
- [ ] Updated `application.properties` with app password
- [ ] Restarted backend (mvn spring-boot:run)
- [ ] Backend shows: "Tomcat started on port(s): 8080"
- [ ] Frontend is running on http://localhost:5173
- [ ] Ready to test!

---

## 📞 Troubleshooting Checklist

If password reset still doesn't work:

1. **Check backend logs** (look for email errors)
   - Ctrl+F in backend terminal for "mail" or "email"

2. **Verify Gmail Settings**
   - https://myaccount.google.com/security
   - 2-Factor Authentication enabled? ✓
   - App Passwords section visible? ✓
   - App password copied correctly (no spaces/typos)? ✓

3. **Test email directly** (send a test email from Java)
   ```bash
   # In backend directory
   mvn spring-boot:run -Dspring-boot.run.arguments="--debug"
   # Look for email-related debug logs
   ```

4. **Check Gmail Inbox**
   - Look in INBOX
   - Look in SPAM folder
   - Look in OTHER folder
   - Email subject: "Password Reset Request - University Management System"

5. **Check if Backend Can Reach Gmail**
   ```powershell
   # Test SMTP connection
   Test-NetConnection -ComputerName smtp.gmail.com -Port 587
   
   # Should show: TcpTestSucceeded: True
   ```

---

## 🎉 Next Steps After Email Works

1. **Inform Users** - Tell them password reset is now working
2. **Test with Different Email** - Try with another user account
3. **Test Spam Filter** - Check if emails go to spam for others
4. **Document Process** - Add to your system documentation
5. **Production Deploy** - When ready, deploy with proper SMTP security

---

**Last Updated**: March 22, 2026  
**Related Files**:
- Application Config: `backend/src/main/resources/application.properties`
- Email Service: `backend/src/main/java/com/university/service/EmailService.java`
- Auth Service: `backend/src/main/java/com/university/service/AuthService.java`
- Auth Controller: `backend/src/main/java/com/university/controller/AuthController.java`
