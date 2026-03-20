# Sage Intacct Web Services Verification Checklist

## Where to Look for Web Services Settings

Check these locations in your Sage Intacct account and note what you find:

### Location 1: Subscriptions
- [ ] Navigate to: `Company` → `Subscriptions`
- [ ] Do you see this menu? YES / NO
- [ ] Is "Web Services" or "Platform Services" listed? YES / NO
- [ ] If yes, is it Active/Checked? YES / NO

### Location 2: Web Services Subscriptions
- [ ] Navigate to: `Company` → `Admin` → `Web Services subscriptions`
- [ ] Do you see this menu? YES / NO
- [ ] If yes, what Sender ID is shown? ________________
- [ ] Can you reset Sender Password? YES / NO

### Location 3: Web Services Users
- [X] Navigate to: `Company` → `Admin` → `Web Services users`
- [X] Do you see this menu? YES ✓ (You confirmed this)
- [X] Can you create/edit users? YES ✓ (You created pursuit-dev)

### Location 4: Company Security
- [ ] Navigate to: `Company` → `Company Info` → Security tab
- [ ] Do you see this tab? YES / NO
- [ ] Is there a "Web Services" section? YES / NO
- [ ] If yes, what information is shown? ________________

### Location 5: Setup/Configuration
- [ ] Navigate to: `Company` → `Setup` → `Company`
- [ ] Look for Security or Web Services sections
- [ ] What do you see? ________________

---

## Current Known Information

**What You Have:**
- Company ID: pursuit
- User ID: pursuit-dev (Web Services user created)
- User Password: [see .env]
- Sender ID: pursuit (needs verification)
- Sender Password: [see .env]

**Current Error:**
```
The sender ID 'pursuit' is not authorized to make Web Services requests 
to company ID 'pursuit'
```

**What This Error Means:**
- ✅ Web Services API is responding (feature likely enabled)
- ✅ Your request format is correct
- ❌ Sender ID either incorrect OR not authorized for your company

---

## Next Steps Based on Checklist Results

### If you find "Web Services subscriptions" menu:
→ Get the Sender ID and reset Sender Password from there
→ Look for "Authorized Companies" and ensure 'pursuit' is checked
→ Use those credentials in your test

### If you can't find sender credentials anywhere:
→ Contact Sage Intacct Support: 1-877-437-7765
→ Say: "I need my Web Services Sender ID and Sender Password for company 'pursuit'"
→ Ask them to verify sender is authorized for your company

### If you find different Sender credentials:
→ Update the test script with new credentials
→ Run test again

---

## Support Contact Information

**Sage Intacct Support**
- Phone: 1-877-437-7765
- Email: support@intacct.com
- Hours: Monday-Friday, 8am-8pm ET

**What to Ask:**
"I'm setting up API integration for company ID 'pursuit'. I created a Web Services user 
called 'pursuit-dev' but I'm getting an authorization error with my Sender credentials. 
Can you provide or verify my Sender ID and Sender Password, and confirm the sender is 
authorized for company 'pursuit'?"

