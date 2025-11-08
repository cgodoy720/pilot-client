# 🚀 Start Your Financial Forecasting POC

## Quick Start Guide

### Step 1: Start the Backend API

```bash
cd /Users/jacquelinereverand/pursuit-mcp-client/financial_forecasting
python simple_server.py
```

You should see:
```
🚀 Starting Financial Forecasting API...
📊 Connected to Salesforce: jac@pursuit.org
🌐 API available at: http://localhost:8000
📖 API docs at: http://localhost:8000/docs
```

**Keep this terminal open!** The API is running.

### Step 2: Start the Frontend (New Terminal)

Open a **NEW terminal** window and run:

```bash
cd /Users/jacquelinereverand/pursuit-mcp-client/financial_forecasting/frontend
npm install
npm start
```

This will:
- Install all React dependencies (first time only)
- Start the development server
- Automatically open http://localhost:3000 in your browser

### Step 3: Use the Dashboard

Once both are running, you'll see:

#### **Dashboard** (http://localhost:3000/dashboard)
- Total pipeline: $35.4M
- Weighted pipeline: $814K  
- 30-day expected revenue
- Cash flow projections chart
- Top opportunities

#### **Opportunities Page** (http://localhost:3000/opportunities)
- Table of all 50 grant opportunities
- Click **Edit** button on any row
- Change stage, amount, probability, close date
- Click **Save** - updates go directly to Salesforce!

## 🎯 What You Can Test

### 1. **View Your Real Data**
- See all your actual grants from Salesforce
- Google $300K, Amazon $1M, PNC $100K, etc.
- Real-time sync

### 2. **Edit an Opportunity**
1. Click Opportunities in sidebar
2. Find "Google SMB Expansion - $300K"
3. Click the edit icon (pencil)
4. Change probability from 28% to 50%
5. Change stage to "Proposal Submitted"
6. Click Save
7. **Check Salesforce** - your changes are there!

### 3. **View Forecasting**
- Dashboard shows expected revenue
- Cash flow projections by month
- Risk indicators
- Top opportunities by expected value

### 4. **Test Real-Time Updates**
1. Edit an opportunity in the app
2. Save it
3. Go to Salesforce and verify the change
4. Edit something in Salesforce
5. Click Refresh in the app
6. See the update appear

## 🔧 Troubleshooting

### Backend Won't Start
**Error:** "No module named 'fastapi'"
**Fix:**
```bash
pip install fastapi uvicorn simple-salesforce
```

### Frontend Won't Start
**Error:** "npm: command not found"
**Fix:** Install Node.js from https://nodejs.org

**Error:** Dependencies error
**Fix:**
```bash
cd financial_forecasting/frontend
rm -rf node_modules package-lock.json
npm install
```

### Can't Connect to Salesforce
**Check:** Your credentials in `financial_forecasting/config.py`
**Test:** Run `python test_simple_auth.py` from project root

### Port Already in Use
**Backend (8000):**
```bash
lsof -ti:8000 | xargs kill -9
```

**Frontend (3000):**
```bash
lsof -ti:3000 | xargs kill -9
```

## 📊 API Endpoints to Test

With backend running, visit:
- http://localhost:8000/docs - Interactive API documentation
- http://localhost:8000/health - Health check
- http://localhost:8000/api/salesforce/opportunities - Your opportunities (JSON)
- http://localhost:8000/api/forecasting/dashboard - Dashboard data

## 🎉 Success Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000  
- [ ] Can see dashboard with your data
- [ ] Can see 50 opportunities in table
- [ ] Can click Edit on an opportunity
- [ ] Can save changes and see them in Salesforce
- [ ] Cash flow chart displays
- [ ] Metrics show correct values

## 🔄 Quick Commands

**Stop everything:**
```bash
# Press Ctrl+C in both terminals
```

**Restart backend:**
```bash
# In backend terminal, press Ctrl+C then:
python simple_server.py
```

**Restart frontend:**
```bash
# In frontend terminal, press Ctrl+C then:
npm start
```

## 📝 What's Working

✅ Salesforce connection with your real data
✅ 50 grant opportunities visible
✅ Edit capability - saves back to Salesforce
✅ Dashboard with metrics and forecasting
✅ Cash flow projections
✅ Payment forecasts
✅ Real-time data sync

## ⏳ What's Next

After you test and it works:
1. Add more fields to edit form
2. Add filtering and search
3. Build invoice automation (need Sage Intacct password)
4. Add user authentication
5. Deploy to production server

---

**Need help?** Check SOLUTION_SUMMARY.md for full documentation!
