# 🔐 Google OAuth Configuration Guide

This guide explains how to configure Google OAuth for both development and production environments.

## 📍 Current Configuration (Development)

You already have OAuth configured for local development:

**Authorized JavaScript origins:**
```
http://localhost:3000
```

**Authorized redirect URIs:**
```
http://localhost:8000/auth/google/callback
```

## 🚀 Adding Production Configuration

After deploying to Google Cloud Run, you'll need to **ADD** (not replace) production URLs to your OAuth client.

### Step 1: Deploy and Get URLs

First, deploy your application:
```bash
./deploy-gcp.sh
```

You'll get two URLs:
- **Frontend URL:** `https://financial-forecasting-web-XXXXX-uc.a.run.app`
- **Backend URL:** `https://financial-forecasting-api-XXXXX-uc.a.run.app`

### Step 2: Update Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials

2. Click on your OAuth 2.0 Client ID

3. **Add to Authorized JavaScript origins:**
   ```
   http://localhost:3000                                      ← Keep for dev
   https://financial-forecasting-web-XXXXX-uc.a.run.app     ← Add for prod
   ```

4. **Add to Authorized redirect URIs:**
   ```
   http://localhost:8000/auth/google/callback                           ← Keep for dev
   https://financial-forecasting-api-XXXXX-uc.a.run.app/auth/google/callback    ← Add for prod
   ```

5. Click **SAVE**

### Step 3: Update Backend Environment Variable

Set the production redirect URI in Cloud Run:

```bash
gcloud run services update financial-forecasting-api \
  --region us-central1 \
  --update-env-vars GOOGLE_REDIRECT_URI=https://financial-forecasting-api-XXXXX-uc.a.run.app/auth/google/callback
```

## ✅ Final Configuration

Your OAuth client should have **BOTH** development and production URLs:

**Authorized JavaScript origins:**
```
http://localhost:3000
https://financial-forecasting-web-XXXXX-uc.a.run.app
```

**Authorized redirect URIs:**
```
http://localhost:8000/auth/google/callback
https://financial-forecasting-api-XXXXX-uc.a.run.app/auth/google/callback
```

## 🧪 Testing

### Development
```
http://localhost:3000 → Click "Sign in with Google" → Should work ✅
```

### Production
```
https://financial-forecasting-web-XXXXX-uc.a.run.app → Click "Sign in with Google" → Should work ✅
```

## ❌ Common Errors

### Error: "redirect_uri_mismatch"

**Cause:** The redirect URI doesn't match exactly what's in Google Cloud Console.

**Solution:** 
1. Check the error message for the exact redirect URI being used
2. Copy it exactly (including https://, path, etc.)
3. Add it to your OAuth client in Google Cloud Console

### Error: "invalid_request"

**Cause:** OAuth client configuration is incomplete or incorrect.

**Solution:**
1. Verify Client ID and Client Secret are correct
2. Check that all URLs use `https://` in production (not `http://`)
3. Ensure no trailing slashes in URLs

## 🔒 Security Notes

- ✅ Keep your Client Secret secure (never commit to git)
- ✅ Only add trusted domains to Authorized origins
- ✅ Production should always use HTTPS
- ✅ Consider restricting OAuth to `@pursuit.org` emails (set User Type to "Internal" in OAuth consent screen)

## 📚 Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OAuth 2.0 Redirect URI Validation](https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation)

