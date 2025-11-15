# 🧪 EMERGENCY MODULE - QUICK TESTING GUIDE

## ✅ ISSUE FIXED - NOW TEST

### **What Was Fixed:**
The Emergency module form was crashing with error:
```
TypeError: Cannot read properties of undefined (reading 'filter')
```

**Fix:** Added optional chaining to staff filters in `/dashboard/emergency/new`

---

## 🚀 QUICK TEST STEPS

### **1. Start Development Server**
```bash
cd apps/frontend
npm run dev
```

### **2. Navigate to Emergency Module**
```
http://localhost:3000/dashboard/emergency
```

### **3. Test Dashboard** ✅
- [ ] Stats cards display (Total, Waiting, Under Treatment, Mortality)
- [ ] Search box works
- [ ] Status filter dropdown works
- [ ] Severity filter dropdown works
- [ ] Case list displays (may be empty if no data)
- [ ] "New Emergency Case" button visible

---

### **4. Test New Case Form** ✅ **CRITICAL TEST**
Click "New Emergency Case" button

#### **A. Patient Selection:**
- [ ] Toggle between "Existing Patient" and "Quick Registration"
- [ ] Existing Patient: Dropdown shows patients
- [ ] Quick Registration: Shows Name, Age, Gender, Contact, Address fields

#### **B. Triage Information:**
- [ ] Severity dropdown shows: CRITICAL, SERIOUS, MODERATE, STABLE
- [ ] Arrival Mode dropdown shows: AMBULANCE, WALK_IN, REFERRED, POLICE, OTHER
- [ ] Chief Complaint textarea works

#### **C. Staff Assignment (FIXED):** 🔥
- [ ] **Triage Nurse dropdown loads without error**
- [ ] **Attending Doctor dropdown loads without error**
- [ ] Dropdowns show staff names
- [ ] No console errors

#### **D. Vital Signs:**
- [ ] Blood Pressure field (text)
- [ ] Heart Rate field (number)
- [ ] Temperature field (number)
- [ ] Respiratory Rate field (number)
- [ ] O2 Saturation field (number)

#### **E. Clinical Information:**
- [ ] Primary Diagnosis field
- [ ] Known Allergies textarea
- [ ] Current Medications textarea
- [ ] Medical History textarea

#### **F. Billing:**
- [ ] Estimated Cost field (number)

#### **G. Form Actions:**
- [ ] "Create Emergency Case" button works
- [ ] "Cancel" button redirects back
- [ ] "Back to Emergency" link works

---

### **5. Test Form Submission** ✅

#### **Minimum Required Fields:**
```
Patient: Either select existing OR fill quick registration
Severity: Select any
Arrival Mode: Select any
Chief Complaint: Enter text
```

#### **Expected Behavior:**
1. Click "Create Emergency Case"
2. Button shows "Creating..."
3. Redirects to case details page
4. Shows success (or error message if backend issue)

---

### **6. Test Case Details Page** ✅
After creating a case, you should see:

- [ ] Emergency number displayed
- [ ] Patient information
- [ ] Severity badge (color-coded)
- [ ] Status badge
- [ ] Triage details
- [ ] Vital signs (if entered)
- [ ] Clinical information (if entered)
- [ ] Action buttons:
  - [ ] Start Treatment
  - [ ] Transfer to IPD
  - [ ] Discharge
  - [ ] Declare Death
- [ ] Print button
- [ ] Back button

---

### **7. Test Print Layout** ✅
Click "Print" button on details page

- [ ] Opens print preview
- [ ] Professional A4 layout
- [ ] All information displayed
- [ ] No navigation/buttons in print view
- [ ] Hospital header
- [ ] Footer with disclaimer

---

## 🔍 CONSOLE ERRORS TO IGNORE

### **Non-Critical Errors:**

#### **1. Favicon 404:**
```
/favicon.ico:1 Failed to load resource: 404
```
**Status:** ⚠️ Ignore - Just missing icon

#### **2. MetaMask:**
```
Failed to connect to MetaMask
```
**Status:** ⚠️ Ignore - Not needed for HMS

#### **3. Forgot Password:**
```
/auth/forgot-password?_rsc=y24w1:1 Failed to load resource: 404
```
**Status:** ⚠️ Ignore - Page not created yet

---

## ❌ ERRORS THAT SHOULD NOT APPEAR

### **FIXED - Should NOT see:**
```
❌ TypeError: Cannot read properties of undefined (reading 'filter')
❌ Cannot read properties of undefined (reading 'role')
❌ Cannot read properties of undefined (reading 'name')
```

**If you see these:** The fix didn't apply correctly

---

## 🎯 SUCCESS CRITERIA

### **✅ Form Loads Without Errors:**
- No console errors when opening new case form
- All dropdowns populate correctly
- Staff dropdowns show nurses and doctors

### **✅ Form Submits Successfully:**
- Can fill required fields
- Can submit form
- Redirects to details page
- Case appears in dashboard list

### **✅ Navigation Works:**
- Back buttons work
- Sidebar link works
- Case list click works
- Print button works

---

## 🐛 IF ISSUES PERSIST

### **1. Clear Browser Cache:**
```bash
Ctrl + Shift + Delete (Chrome/Edge)
Cmd + Shift + Delete (Mac)
```

### **2. Hard Reload:**
```bash
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### **3. Restart Dev Server:**
```bash
# Stop server (Ctrl+C)
npm run dev
```

### **4. Check Backend Running:**
```bash
cd apps/backend
npm run start:dev
```

### **5. Check Database Migration:**
Ensure Emergency tables exist in Supabase:
- emergency_cases
- EmergencySeverity enum
- EmergencyStatus enum
- ArrivalMode enum

---

## 📊 TEST DATA EXAMPLES

### **Quick Registration Test:**
```
Name: John Doe
Age: 35
Gender: MALE
Contact: 9876543210
Address: 123 Main St
Severity: SERIOUS
Arrival Mode: AMBULANCE
Chief Complaint: Chest pain and shortness of breath
```

### **Vitals Test:**
```
Blood Pressure: 140/90
Heart Rate: 95
Temperature: 38.5
Respiratory Rate: 22
O2 Saturation: 94
```

### **Clinical Test:**
```
Primary Diagnosis: Suspected Myocardial Infarction
Allergies: Penicillin
Current Medications: Aspirin 75mg daily
Medical History: Hypertension, Type 2 Diabetes
```

---

## ✅ EXPECTED RESULTS

### **Dashboard:**
```
✅ Stats cards show numbers
✅ Search works
✅ Filters work
✅ Pagination works (if multiple pages)
✅ Cases display in list
```

### **New Case Form:**
```
✅ Form loads without errors
✅ All fields accessible
✅ Staff dropdowns work (FIXED)
✅ Form validates required fields
✅ Submit creates case
✅ Redirects to details
```

### **Case Details:**
```
✅ All information displays
✅ Status can be changed
✅ Actions work
✅ Print opens preview
✅ Back button works
```

---

## 🎉 SUCCESS INDICATORS

### **✅ Form Working:**
- Opens without console errors
- All dropdowns populate
- Can select nurse and doctor
- Can submit successfully

### **✅ Module Complete:**
- Dashboard displays
- Can create cases
- Can view details
- Can print
- Can change status
- Can discharge/transfer

---

## 📞 TROUBLESHOOTING

### **Issue: Staff dropdowns empty**
**Solution:** 
1. Check if staff exist in database
2. Check staff have user relation
3. Check API endpoint `/staff` works

### **Issue: Form still crashes**
**Solution:**
1. Clear browser cache
2. Hard reload page
3. Check if fix was applied (line 311, 328 in new/page.tsx)

### **Issue: Can't submit form**
**Solution:**
1. Check required fields filled
2. Check backend server running
3. Check console for API errors
4. Check tenant ID exists

### **Issue: No cases display**
**Solution:**
1. Create a new case first
2. Check database has emergency_cases table
3. Check RLS policies allow read
4. Check API endpoint `/emergency` works

---

## 🚀 READY TO TEST!

**Start Here:**
1. ✅ Start dev server
2. ✅ Open `/dashboard/emergency`
3. ✅ Click "New Emergency Case"
4. ✅ Verify no console errors
5. ✅ Fill form and submit
6. ✅ Verify case created

**Status:** 🟢 **READY FOR TESTING**

---

**Last Updated:** November 15, 2025, 8:09 AM IST
**Fix Applied:** Optional chaining in staff filters
**Build Status:** ✅ Success
**Critical Errors:** 0
