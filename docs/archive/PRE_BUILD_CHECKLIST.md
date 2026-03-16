# ✅ Pre-Build Checklist - Grant Lifecycle System

**Complete these items BEFORE starting development**

Print this page and check off items as you complete them!

---

## 📋 **PHASE 0: DISCOVERY (Must Complete First)**

### **Documentation Review**
- [ ] Leadership has read TEAM_SUMMARY.md
- [ ] Finance team has read TEAM_SUMMARY.md  
- [ ] Technical team has read IMPLEMENTATION_PLAN_REVISED.md
- [ ] Everyone understands the phased approach

### **Discovery Questionnaire**
- [ ] Finance team assigned to complete questionnaire
- [ ] FINANCE_TEAM_DISCOVERY_QUESTIONS.md completed
- [ ] At least 3 real grant examples provided
- [ ] Specific pain points documented
- [ ] Sample documents gathered:
  - [ ] 3-5 grant agreements (redacted if needed)
  - [ ] Sample invoices currently sent
  - [ ] Any funder-specific invoice templates

### **Review Meeting**
- [ ] Review meeting scheduled
- [ ] Attendees confirmed:
  - [ ] Finance Director/CFO
  - [ ] Grant Writer/Program Lead
  - [ ] Technical Lead
  - [ ] Project Manager
- [ ] Meeting agenda prepared
- [ ] Questionnaire responses discussed
- [ ] Workflow validated with real examples
- [ ] Edge cases identified
- [ ] Open questions answered

### **Sage Intacct Validation**
- [ ] Sage credentials verified and working
- [ ] Test invoice created manually in Sage
- [ ] Invoice creation process documented
- [ ] Customer/account structure understood
- [ ] API permissions verified
- [ ] Test customer created for system testing
- [ ] Sage admin contacted (if needed for API setup)

### **Salesforce Validation**
- [ ] NPSP Payment object reviewed
- [ ] Opportunity stages confirmed
- [ ] Sample opportunities created for testing
- [ ] Salesforce admin access confirmed
- [ ] Permission set strategy defined

### **Pilot Planning**
- [ ] 3-5 pilot grants identified:
  1. _________________________________ (simple, single payment)
  2. _________________________________ (moderate, 2-3 payments)
  3. _________________________________ (complex, multi-year or special requirements)
  4. _________________________________ (optional)
  5. _________________________________ (optional)
- [ ] Pilot grant details documented
- [ ] Finance team committed to testing pilots
- [ ] Success criteria defined for pilots

### **Approvals**
- [ ] Leadership approves Phase 1 approach
- [ ] Finance team approves workflow design
- [ ] Timeline approved (6 weeks)
- [ ] Resources allocated (finance team time)
- [ ] Budget approved (if any external costs)
- [ ] Phase 1 limitations accepted:
  - [ ] One invoice per grant only (MVP)
  - [ ] Manual payment tracking
  - [ ] Manual completion
  - [ ] No amendment workflow (Phase 2)

---

## 🔧 **PHASE 1: SETUP (Before Coding)**

### **Environment Setup**
- [ ] Development environment prepared
- [ ] Sage Intacct sandbox/test environment access
- [ ] Salesforce sandbox/test environment access
- [ ] Git repository set up
- [ ] .env file configured with credentials
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed

### **Salesforce Configuration**
- [ ] Sage_Invoice__c object created
  - [ ] All required fields added
  - [ ] Master-detail to Opportunity configured
  - [ ] Page layout updated
  - [ ] Related list added to Opportunity
- [ ] Invoice__c field added to npe01__OppPayment__c
  - [ ] Lookup to Sage_Invoice__c
  - [ ] Page layout updated
- [ ] Opportunity stages verified:
  - [ ] "Closed Won" exists
  - [ ] "Collecting / In Effect" exists
  - [ ] "Closed / Completed" exists
- [ ] Permission sets created:
  - [ ] Grant Writer permission set
  - [ ] Finance User permission set
  - [ ] Finance Admin permission set
- [ ] Test users assigned to permission sets
- [ ] Validation rules added:
  - [ ] Duplicate invoice prevention
  - [ ] Payment amount validation
  - [ ] Date validation

### **Data Preparation**
- [ ] Test data created in Salesforce:
  - [ ] 5+ test opportunities
  - [ ] Test accounts (as customers)
  - [ ] Test contacts
- [ ] Test data created in Sage:
  - [ ] Test customers matching Salesforce accounts
  - [ ] Test invoice templates
- [ ] Data mapping documented:
  - [ ] Salesforce Account → Sage Customer
  - [ ] Opportunity fields → Invoice fields
  - [ ] Payment fields → Sage payment fields

---

## 🧪 **PHASE 2: TESTING PREPARATION**

### **Test Plan**
- [ ] Test scenarios documented:
  - [ ] Create payment schedule
  - [ ] Create invoice (success)
  - [ ] Create invoice (duplicate attempt)
  - [ ] Mark payment as received
  - [ ] Complete grant
  - [ ] Error scenarios
- [ ] Test data requirements defined
- [ ] Expected results documented
- [ ] Testing checklist created

### **User Acceptance Testing (UAT)**
- [ ] UAT plan created
- [ ] UAT participants identified
- [ ] UAT timeline scheduled
- [ ] UAT feedback process defined
- [ ] Bug tracking process defined

### **Training Materials**
- [ ] User guide outline created
- [ ] Screenshots planned
- [ ] Video walkthrough outline
- [ ] FAQ started
- [ ] Training session scheduled

---

## 📊 **PHASE 3: DEPLOYMENT PREPARATION**

### **Rollout Plan**
- [ ] Deployment checklist created
- [ ] Rollback plan defined
- [ ] Go/no-go criteria defined
- [ ] Communication plan for users
- [ ] Support process defined:
  - [ ] Who users contact for help
  - [ ] How to report bugs
  - [ ] Office hours scheduled

### **Monitoring**
- [ ] Success metrics tracking plan:
  - [ ] Time to create invoice (baseline measured)
  - [ ] Number of errors (baseline measured)
  - [ ] User satisfaction survey prepared
- [ ] Error logging configured
- [ ] Audit trail requirements defined

---

## 🚨 **CRITICAL VALIDATIONS** (Do Not Skip!)

### **Before Writing Any Code:**
- [ ] ✅ Questionnaire completed and reviewed
- [ ] ✅ Real grant examples analyzed
- [ ] ✅ Sage integration tested manually
- [ ] ✅ Finance team approves workflow
- [ ] ✅ Pilot grants identified

### **Before First Deployment:**
- [ ] ✅ All unit tests pass
- [ ] ✅ Integration tests with Sage pass
- [ ] ✅ UAT completed with pilot grants
- [ ] ✅ No critical bugs outstanding
- [ ] ✅ Training completed
- [ ] ✅ Finance team signs off

### **Before Full Rollout:**
- [ ] ✅ Pilot grants successful (3-5 grants processed)
- [ ] ✅ Zero data corruption issues
- [ ] ✅ Zero duplicate invoice issues
- [ ] ✅ Finance team satisfaction > 7/10
- [ ] ✅ Time savings validated
- [ ] ✅ Support process working

---

## ⚠️ **RED FLAGS** (Stop and Reassess If Any of These Occur)

**Discovery Phase:**
- [ ] 🚩 Finance team can't complete questionnaire (don't understand their own process)
- [ ] 🚩 Answers are vague or "it depends" for everything
- [ ] 🚩 Each grant is completely unique (no standard process)
- [ ] 🚩 Sage API test fails or requires complex approval workflow
- [ ] 🚩 Finance team doesn't have time to test

**Build Phase:**
- [ ] 🚩 Requirements keep changing significantly
- [ ] 🚩 Sage integration doesn't work as expected
- [ ] 🚩 Data model doesn't support actual scenarios
- [ ] 🚩 Duplicate prevention doesn't work
- [ ] 🚩 Performance issues (slow API calls)

**Test Phase:**
- [ ] 🚩 Critical bugs found (data corruption, duplicate invoices)
- [ ] 🚩 Finance team says it's harder than old way
- [ ] 🚩 Payments don't match correctly
- [ ] 🚩 Sage and Salesforce get out of sync
- [ ] 🚩 Edge cases not handled

**If RED FLAG occurs:** STOP, document the issue, meet with team, decide: fix, defer to Phase 2, or redesign.

---

## ✅ **READY TO BUILD CRITERIA**

**You're ready to start coding when ALL of these are checked:**

**Must Have (Blocking):**
- [ ] ✅ Discovery questionnaire completed
- [ ] ✅ Review meeting held
- [ ] ✅ Sage integration tested manually
- [ ] ✅ Pilot grants identified
- [ ] ✅ Finance team approves Phase 1 plan
- [ ] ✅ Leadership approves timeline
- [ ] ✅ Salesforce environments ready
- [ ] ✅ Sage environments ready

**Should Have (Highly Recommended):**
- [ ] ✅ Sample documents gathered
- [ ] ✅ Test data prepared
- [ ] ✅ Permission sets designed
- [ ] ✅ Test plan drafted
- [ ] ✅ Rollout plan drafted

**Nice to Have (Can do during build):**
- [ ] Training materials outline
- [ ] User guide outline
- [ ] FAQ started

---

## 📝 **SIGN-OFF**

**I confirm that discovery is complete and we're ready to build:**

**Finance Director/CFO:**
- Name: ____________________________
- Signature: ________________________
- Date: _____________________________

**Technical Lead:**
- Name: ____________________________
- Signature: ________________________
- Date: _____________________________

**Project Manager:**
- Name: ____________________________
- Signature: ________________________
- Date: _____________________________

---

## 🚀 **NEXT STEP AFTER CHECKLIST COMPLETE**

→ Proceed to [`QUICK_SETUP_GUIDE.md`](QUICK_SETUP_GUIDE.md) for build instructions

**Estimated time to build Phase 1 after checklist complete:** 2-3 weeks

---

**Remember:** Time spent in discovery saves 10x time in rework! 💪

