# 🚀 Deployment Guide - Google Cloud Platform

This guide walks you through deploying the Financial Forecasting application to Google Cloud Platform using Cloud Run.

## 📋 Prerequisites

1. **Google Cloud Account** with billing enabled
2. **GCP Project** created
3. **gcloud CLI** installed and authenticated
   ```bash
   # Install gcloud CLI: https://cloud.google.com/sdk/docs/install
   
   # Authenticate
   gcloud auth login
   
   # Set your project
   gcloud config set project YOUR_PROJECT_ID
   ```

4. **Docker** installed (for local testing)

## 🔧 Pre-Deployment Setup

### 1. Update Google OAuth Settings

Before deploying, you need to configure OAuth for production:

1. Go to [Google Cloud Console → APIs & Credentials](https://console.cloud.google.com/apis/credentials)

2. Select your OAuth 2.0 Client ID

3. **Add Production URLs** (you'll update these after deployment):

   **Authorized JavaScript origins:**
   ```
   https://your-frontend-url.run.app
   ```

   **Authorized redirect URIs:**
   ```
   https://your-backend-url.run.app/auth/google/callback
   ```

   ⚠️ **Note:** You'll get these URLs after the first deployment. We'll update them in step 4.

### 2. Prepare Environment Variables

Review `env.production.template` and prepare your secrets:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `JWT_SECRET_KEY` (generate with: `openssl rand -hex 32`)
- `FIREFLIES_API_KEY`
- `SLACK_BOT_TOKEN` (optional)

## 🚀 Deployment Steps

### Step 1: Set Environment Variables

```bash
export GCP_PROJECT_ID="your-gcp-project-id"
export GCP_REGION="us-central1"  # or your preferred region
```

### Step 2: Run Deployment Script

```bash
cd financial_forecasting
./deploy-gcp.sh
```

This script will:
- Enable required GCP APIs
- Build and deploy the backend (FastAPI) to Cloud Run
- Build and deploy the frontend (React) to Cloud Run
- Output the URLs for your deployed services

### Step 3: Set Cloud Run Environment Variables

After deployment, set your environment variables for the backend service:

```bash
# Replace with your actual values
gcloud run services update financial-forecasting-api \
  --region $GCP_REGION \
  --update-env-vars "GOOGLE_CLIENT_ID=your-client-id,GOOGLE_CLIENT_SECRET=your-client-secret,JWT_SECRET_KEY=your-jwt-secret,FIREFLIES_API_KEY=your-fireflies-key,GOOGLE_REDIRECT_URI=https://your-backend-url.run.app/auth/google/callback"
```

**For Slack (optional):**
```bash
gcloud run services update financial-forecasting-api \
  --region $GCP_REGION \
  --update-env-vars "SLACK_BOT_TOKEN=xoxb-your-token"
```

### Step 4: Update OAuth Redirect URIs

Now that you have your production URLs, update Google OAuth:

1. Go to [Google Cloud Console → APIs & Credentials](https://console.cloud.google.com/apis/credentials)

2. Click on your OAuth 2.0 Client ID

3. Add your **actual Cloud Run URLs**:

   **Authorized JavaScript origins:**
   ```
   https://financial-forecasting-web-XXXXX-uc.a.run.app
   ```

   **Authorized redirect URIs:**
   ```
   https://financial-forecasting-api-XXXXX-uc.a.run.app/auth/google/callback
   ```

4. Click **Save**

### Step 5: Test Your Deployment

Visit your frontend URL:
```
https://financial-forecasting-web-XXXXX-uc.a.run.app
```

You should see:
- ✅ Login page with "Sign in with Google"
- ✅ Successful OAuth flow
- ✅ Dashboard loads after authentication

## 🧪 Local Testing with Docker

Before deploying, test locally with Docker:

```bash
# Build and run with docker-compose
docker-compose up --build

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## 🔍 Monitoring & Logs

### View Logs

**Backend logs:**
```bash
gcloud run services logs read financial-forecasting-api --region $GCP_REGION --limit 50
```

**Frontend logs:**
```bash
gcloud run services logs read financial-forecasting-web --region $GCP_REGION --limit 50
```

### View Service Details

```bash
# Backend info
gcloud run services describe financial-forecasting-api --region $GCP_REGION

# Frontend info
gcloud run services describe financial-forecasting-web --region $GCP_REGION
```

### Monitor in Console

Visit: https://console.cloud.google.com/run

## 🔄 Updating the Deployment

To deploy updates:

```bash
# 1. Make your code changes

# 2. Re-run deployment
./deploy-gcp.sh

# 3. Cloud Run will automatically build and deploy the new version
```

## 🛠️ Troubleshooting

### Issue: "OAuth redirect_uri_mismatch"

**Solution:** Make sure the redirect URI in Google Cloud Console exactly matches your Cloud Run backend URL + `/auth/google/callback`

### Issue: "CORS error when calling API"

**Solution:** Check that `GOOGLE_REDIRECT_URI` environment variable is set correctly in Cloud Run

### Issue: "Internal Server Error (500)"

**Solution:** Check Cloud Run logs:
```bash
gcloud run services logs read financial-forecasting-api --region $GCP_REGION --limit 100
```

### Issue: "Unauthorized (401)" after login

**Solution:** Verify that:
1. `JWT_SECRET_KEY` is set in Cloud Run environment variables
2. Cookies are being set correctly (check browser DevTools → Application → Cookies)

## 💰 Cost Estimation

Cloud Run pricing (as of 2024):
- **Free tier:** 2 million requests/month, 360,000 GB-seconds/month
- **Typical cost:** $0-20/month for low-traffic apps
- **Scale:** Automatically scales to zero when not in use

**Cost-saving tips:**
- Set `--min-instances=0` (already configured)
- Use `--memory=512Mi` for frontend (already configured)
- Monitor usage: https://console.cloud.google.com/billing

## 🔒 Security Best Practices

1. ✅ **Secrets Management:** Never commit secrets to git
2. ✅ **Use Secret Manager:** For production, consider using GCP Secret Manager
3. ✅ **HTTPS Only:** Cloud Run automatically provides HTTPS
4. ✅ **Authentication:** All routes require Google OAuth
5. ✅ **CORS:** Configure for your production domain only

## 📚 Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/docker/)

## 🆘 Support

If you encounter issues:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review Cloud Run logs
3. Verify all environment variables are set correctly
4. Check OAuth configuration in Google Cloud Console

---

**🎉 Congratulations!** Your Financial Forecasting app is now running on Google Cloud Platform!

