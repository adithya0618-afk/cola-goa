# 🧪 Cola Goa Resort CRM — Testing Guide

> This document tells you exactly how to test every single feature of the system, step by step, with real examples.

---

## Prerequisites Before Testing

## ⚠️ CRITICAL FIRST STEP: Supabase Connection

Before testing, understand how the app connects to Supabase:
- **We use Drizzle ORM.** Drizzle connects directly to the PostgreSQL database server using the `DATABASE_URL`.
- **We do NOT use the Supabase Anon Key** on the server. The Anon Key and `NEXT_PUBLIC_SUPABASE_URL` are for the `@supabase/supabase-js` client (which talks to Supabase's REST API and handles RLS, which is generally meant for frontend apps without a secure Node.js backend). Because we have a secure Next.js backend, writing raw fast SQL via Drizzle using `DATABASE_URL` is much better.

### Verify Your DB Before Testing
```bash
# Test the direct connection:
npx dotenv -e .env.local -- npx tsx test-db.ts

# Expected terminal output:
# Connection successful: { now: 2026-04-13T... }

# Second, make sure all 13 rooms exist inside your Supabase "rooms" table.
npm run db:seed
```

---

## 🔐 TEST 1: JWT Authentication & Route Protection

### Test 1.1 — Unauthenticated Access is Blocked

**Steps:**
1. Open a fresh browser (or clear cookies)
2. Go to `http://localhost:3000/admin/dashboard`

**Expected Result:**
- ✅ Browser is **immediately redirected** to `/admin/login?redirect=%2Fadmin%2Fdashboard`
- ✅ You see the dark login screen with "Cola Goa Resort" header
- ✅ You are NOT able to see the dashboard without logging in

---

### Test 1.2 — Login with Wrong Credentials

**Steps:**
1. Go to `http://localhost:3000/admin/login`
2. Enter email: `wrong@email.com`, password: `badpass`
3. Click **Sign In**

**Expected Result:**
- ✅ Red error message appears below the form: "Invalid email or password"
- ✅ Page does NOT navigate away

---

### Test 1.3 — Login with Correct Credentials

**Steps:**
1. Go to `http://localhost:3000/admin/login`
2. Enter email: `admin@colagoa.com`, password: `admin123`
3. Click **Sign In**

**Expected Result:**
- ✅ Browser navigates to `/admin/dashboard`
- ✅ You can see the dashboard with stats cards
- ✅ Sidebar with all navigation links is visible

**To verify JWT cookie was set:**
1. Press `F12` → Application → Cookies → `localhost`
2. Find cookie named `admin_token`
3. Value should be a long string like `eyJ...` (3 parts separated by dots)
4. HttpOnly should be checked (you can't read it via JavaScript)

---

### Test 1.4 — JWT Expires After 12 Hours

**Steps:**
1. Log in normally
2. Open Browser DevTools → Application → Cookies
3. Click on `admin_token` cookie → look at **Expires** field

**Expected Result:**
- ✅ Expiry is exactly 12 hours from login time
- ✅ After expiry, any visit to `/admin/*` will redirect back to login

**To simulate expiry (force logout):**
1. DevTools → Cookies → Right-click `admin_token` → Delete
2. Refresh page → Redirected to login ✅

---

### Test 1.5 — Logout

**Steps:**
1. Log into the dashboard
2. Click **Logout** button at the bottom of the sidebar

**Expected Result:**
- ✅ `admin_token` cookie is deleted
- ✅ Browser redirects to `/admin/login`
- ✅ Pressing browser Back button does NOT show dashboard (redirects to login again)

---

## 🏠 TEST 2: Dashboard Overview

### Test 2.1 — Stats Cards Display

**Steps:**
1. Log in and go to `/admin/dashboard`

**Expected Result:**
- ✅ Six stat cards visible: Total Rooms (13), Occupied, Available, Total Revenue, Pending Payments, Staff Members
- ✅ **Total Rooms = 13** (always, that's your resort)
- ✅ Occupancy gauge shows percentage (e.g. 0% if no bookings yet)

---

### Test 2.2 — Recent Bookings Table

**Steps:**
1. Create a booking first (Test 4 below)
2. Come back to `/admin/dashboard`

**Expected Result:**
- ✅ Table shows last 5 bookings
- ✅ Each row shows: Guest name, Room, Check-in, Check-out, Status badge, Payment badge
- ✅ "View all →" link goes to `/admin/bookings`

---

## 🛏 TEST 3: Room Grid (BookMyShow Style)

### Test 3.1 — Room Grid Loads All 13 Rooms

**Steps:**
1. Go to `/admin/rooms`

**Expected Result:**
- ✅ **13 room cards** displayed in a grid
- ✅ All rooms are **green** (available) if no bookings exist
- ✅ Each room card shows: Room number, Price/night, Capacity, "Book Now" button

---

### Test 3.2 — Available Room is Clickable

**Steps:**
1. Click on any **green** room card (e.g. Room 101)

**Expected Result:**
- ✅ Booking modal opens with title "Book Room 101"
- ✅ Shows price: ₹3500/night and Capacity: 2 guests
- ✅ Form shows fields: Guest Name, Phone, Email, Check-In, Check-Out, Payment Status

---

### Test 3.3 — Occupied Room is Blocked

**Steps:**
1. First create a booking for Room 101 (Test 4 below)
2. Come back to `/admin/rooms`

**Expected Result:**
- ✅ Room 101 card is now **red** (occupied)
- ✅ Clicking red room card does **nothing** (cursor shows "not-allowed")
- ✅ Button shows "Occupied" instead of "Book Now"

---

### Test 3.4 — Filter Tabs

**Steps:**
1. Go to `/admin/rooms`
2. Click **"Occupied"** filter tab
3. Click **"Available"** filter tab
4. Click **"All"** filter tab

**Expected Result:**
- ✅ Grid filters to show only rooms matching the selected status
- ✅ Count badges on each filter tab update correctly

---

## 📋 TEST 4: Creating a New Booking (Walk-In)

### Test 4.1 — Create a Valid Booking

**Steps:**
1. Go to `/admin/rooms`
2. Click on **Room 101** (green/available)
3. Fill in the booking form:
   - **Guest Name:** Rahul Sharma
   - **Phone:** 9999900000
   - **Email:** rahul@test.com
   - **Check-In:** today's date (e.g. 2026-04-13)
   - **Check-Out:** 2 days later (e.g. 2026-04-15)
   - **Payment Status:** Pending
4. Click **"Review Booking →"**
5. Review the summary — verify:
   - 2 nights × ₹3500 = **₹7000 Total**
6. Click **"✅ Confirm Booking"**

**Expected Result:**
- ✅ Booking Confirmed screen shows with a Booking ID
- ✅ Message: "📱 Guest link will be shared via WhatsApp/Email automatically"
- ✅ After clicking Done → modal closes
- ✅ Page reloads → Room 101 is now **red** (occupied)
- ✅ Go to `/admin/bookings` → Rahul Sharma's booking appears at top

---

### Test 4.2 — Double Booking Prevention

**Steps:**
1. Room 101 is already booked for 2026-04-13 to 2026-04-15 (from Test 4.1)
2. Try to click Room 101 again

**Expected Result:**
- ✅ Room 101 is **red and unclickable** — cannot open booking modal
- ✅ It is impossible to double-book an occupied room through the UI

**API Level Test (using browser DevTools or curl):**
```bash
curl -X POST http://localhost:3000/api/admin/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "phone": "1234567890",
    "roomId": 1,
    "checkInDate": "2026-04-14",
    "checkOutDate": "2026-04-16",
    "roomAmount": "7000",
    "totalAmount": "7000"
  }'
```
**Expected:** `409 Conflict — "Room is already booked for selected dates"`

---

### Test 4.3 — Partial Payment Flow

**Steps:**
1. Click an available room
2. Set **Payment Status** to **"Partial Advance"**
3. An "Advance Amount" field appears — enter **₹2000**
4. Complete the booking

**Expected Result:**
- ✅ Booking is created with `paymentStatus: partial`
- ✅ In bookings list — Payment badge shows **"partial"** (yellow)

---

## 📋 TEST 5: Booking Management

### Test 5.1 — Check-In a Guest

**Steps:**
1. Go to `/admin/bookings`
2. Find Rahul Sharma's booking (status: **booked**)
3. Click **"Check-In"** button in the Actions column

**Expected Result:**
- ✅ Booking status changes to **"checked_in"** (green badge)
- ✅ "Check-In" button disappears, replaced by "Checkout" button

---

### Test 5.2 — Search and Filter Bookings

**Steps:**
1. Go to `/admin/bookings`
2. In search box, type: **"Rahul"**

**Expected Result:**
- ✅ Only Rahul's booking appears in the table

**Test filter:**
1. Click **"checked_in"** filter button
2. Only checked-in bookings appear

---

### Test 5.3 — Cancel a Booking

**Steps:**
1. Create a new booking for Room 102 (don't check in)
2. Go to `/admin/bookings`
3. For the new booking (status: **booked**), click **"Cancel"** button

**Expected Result:**
- ✅ Booking status changes to **"cancelled"** (red badge)
- ✅ Go to `/admin/rooms` → Room 102 is **green again** (available)

---

### Test 5.4 — Checkout with Invoice

**Steps:**
1. Make sure Rahul Sharma's booking is **checked_in**
2. Order food for Room 101 (API test):
   ```bash
   # Simulate a guest ordering food (₹450)
   curl -X POST http://localhost:3000/api/admin/orders \
     -H "Content-Type: application/json" \
     -d '{"bookingId": "<BOOKING_ID>", "roomId": 1, "totalAmount": "450"}'
   ```
3. Accept the order in `/admin/orders` (click Accept)
4. Go back to `/admin/bookings`
5. Click **"Checkout"** on Rahul's booking

**Expected Result:**
- ✅ Checkout Invoice modal opens showing:
  - Check-In: 2026-04-13
  - Check-Out: 2026-04-15
  - Room Amount: **₹7,000**
  - Services / Food: **₹450**
  - **Grand Total: ₹7,450**
- ✅ "🖨️ Print Invoice" button triggers browser print dialog
- ✅ After closing: booking status is **"checked_out"**, Room 101 is **green** again

---

## 🍽 TEST 6: Orders Management

### Test 6.1 — View Pending Orders

**Steps:**
1. Go to `/admin/orders`

**Expected Result:**
- ✅ If orders exist: cards show Room number, Guest name, Amount, Time placed
- ✅ Red badge shows count of pending orders
- ✅ Pending orders have yellow left border and Accept/Reject buttons

---

### Test 6.2 — Accept an Order

**Steps:**
1. An order is showing as "pending"
2. Click **"✅ Accept"** button

**Expected Result:**
- ✅ Order status changes to **"accepted"** (blue badge)
- ✅ Order card shows "Mark Completed" button
- ✅ The booking's `serviceAmount` and `totalAmount` are updated in the DB

---

### Test 6.3 — Reject an Order

**Steps:**
1. A **pending** order exists
2. Click **"✗ Reject"** button

**Expected Result:**
- ✅ Order status changes to **"rejected"** (red badge)
- ✅ Amount is NOT added to booking bill (rejected = not charged)

---

### Test 6.4 — Complete an Order

**Steps:**
1. An order is **accepted**
2. Click **"✅ Mark Completed"**

**Expected Result:**
- ✅ Order status changes to **"completed"** (green badge)
- ✅ No more action buttons on this order

---

## 🍔 TEST 7: Menu Items Management

### Test 7.1 — Add a New Food Item

**Steps:**
1. Go to `/admin/items`
2. Click **"+ Add Item"**
3. Fill in:
   - **Name:** Butter Chicken
   - **Type:** Food
   - **Category:** Dinner
   - **Description:** Creamy North Indian curry
   - **Price:** 350
4. Click **"Add Item"**

**Expected Result:**
- ✅ New card appears in the grid showing "Butter Chicken — ₹350"
- ✅ Card shows "food" badge and "Dinner" category badge
- ✅ Shows "✅ Available" toggle

---

### Test 7.2 — Toggle Item Availability

**Steps:**
1. On Butter Chicken card, click **"✅ Available"** toggle

**Expected Result:**
- ✅ Toggle changes to **"❌ Unavailable"**
- ✅ Card becomes semi-transparent (opacity 0.6)
- ✅ Item would NOT appear for guests to order (your friend's guest app checks isAvailable)

---

### Test 7.3 — Edit an Item

**Steps:**
1. Click the **pencil icon** on any item card
2. Change price from 350 to **400**
3. Click **"Update Item"**

**Expected Result:**
- ✅ Price updates to ₹400 immediately

---

### Test 7.4 — Delete an Item

**Steps:**
1. Click the **trash icon** on any item card
2. Confirm the browser prompt

**Expected Result:**
- ✅ Item card disappears from grid

---

## 👥 TEST 8: Staff Management

### Test 8.1 — Add a New Staff Member

**Steps:**
1. Go to `/admin/staff`
2. Click **"+ Add Staff"**
3. Fill in:
   - **Name:** Priya Nair
   - **Role:** receptionist
   - **Shift:** morning
   - **Email:** priya@colagoa.com
   - **Phone:** 9876543210
   - **Password:** priya123
4. Click **"Add Staff"**

**Expected Result:**
- ✅ New staff card appears with Priya Nair's initials "PN" in a coloured avatar
- ✅ Shows "receptionist" badge, "⏰ morning shift" tag

---

### Test 8.2 — New Staff Can Login

**Steps:**
1. Click **Logout** in the sidebar
2. Go to `/admin/login`
3. Enter email: `priya@colagoa.com`, password: `priya123`
4. Click **Sign In**

**Expected Result:**
- ✅ Login succeeds and goes to `/admin/dashboard`
- ✅ Top right shows "Receptionist / Admin Access"

---

### Test 8.3 — Duplicate Email is Rejected

**Steps:**
1. Try to add another staff member with email: `admin@colagoa.com`

**Expected Result:**
- ✅ Error message: "Email already exists"

---

## 💰 TEST 9: Payment Tracking

### Test 9.1 — View Payment Summary

**Steps:**
1. After creating bookings with different payment statuses
2. Go to `/admin/payments`

**Expected Result:**
- ✅ Summary cards show: Total Collected (₹), Total Transactions, Pending count, Failed count
- ✅ Table shows each transaction with Guest, Amount, Method, Status, Date

---

## 🧪 TEST 10: API Testing (Postman / CURL)

### All API Endpoints

> Note: API routes under `/api/admin/*` do NOT check JWT (validation is done at the proxy level for page routes). For production you would add API-level auth too.

#### Login API

```bash
# Login
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"admin@colagoa.com","password":"admin123"}'

# Expected: {"success":true,"user":{"id":"...","name":"Admin User","email":"admin@colagoa.com","role":"admin"}}
# Cookie admin_token is saved to cookies.txt
```

#### Get All Bookings

```bash
curl -X GET http://localhost:3000/api/admin/bookings \
  -b cookies.txt

# Expected: Array of booking objects
```

#### Create Booking

```bash
curl -X POST http://localhost:3000/api/admin/bookings \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Test Guest",
    "phone": "9999900001",
    "email": "testguest@example.com",
    "roomId": 2,
    "checkInDate": "2026-04-20",
    "checkOutDate": "2026-04-22",
    "paymentStatus": "pending",
    "roomAmount": "8000",
    "totalAmount": "8000"
  }'

# Expected: {201} {"booking":{"id":"...","guestToken":"...",...}}
```

#### Update Order Status

```bash
curl -X PATCH http://localhost:3000/api/admin/orders/<ORDER_ID> \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"status":"accepted"}'

# Expected: {"order":{"id":"...","status":"accepted",...}}
```

#### Add Menu Item

```bash
curl -X POST http://localhost:3000/api/admin/items \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Masala Chai",
    "type": "food",
    "category": "Beverages",
    "description": "Strong Indian tea",
    "price": "80",
    "isAvailable": true
  }'

# Expected: {201} {"item":{"id":...,"name":"Masala Chai",...}}
```

#### Checkout a Booking

```bash
curl -X POST http://localhost:3000/api/admin/bookings/<BOOKING_ID>/checkout \
  -b cookies.txt

# Expected: {
#   "success": true,
#   "roomAmount": 7000,
#   "serviceAmount": 450,
#   "totalAmount": 7450,
#   "orders": [...]
# }
```

#### Logout

```bash
curl -X POST http://localhost:3000/api/admin/logout \
  -b cookies.txt \
  -c cookies.txt

# Expected: {"success":true}
# admin_token cookie is now cleared
```

---

## 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|---|---|---|
| Login fails with 500 error | DATABASE_URL not set | Fill in `.env.local` with real Supabase URL |
| "Room is already booked" on fresh start | DB has old data | Clear bookings table or use different dates |
| Rooms page shows "No rooms" | DB not seeded | Run `npm run db:seed` |
| Cookie not being set | HTTP not HTTPS in dev | Normal in dev — HttpOnly cookie works on localhost |
| JWT expired | 12 hours passed | Log in again |
| Build fails | TypeScript error | Run `npm run build` and check error message |
| Port 3000 in use | Another instance running | Kill with `taskkill /PID <pid> /F` or use port 3001 |

---

## ✅ Full End-to-End Test Flow (15 minutes)

Run this complete flow to verify everything works together:

```
1. npm run db:seed                        (seed rooms + admin)
2. npm run dev                            (start server)
3. Go to /admin/dashboard                 (should redirect to login)
4. Login: admin@colagoa.com / admin123    (JWT cookie set)
5. Dashboard: verify 13 total rooms       (stats card)
6. Rooms page: verify 13 green cards      (BookMyShow grid)
7. Click Room 201: book for Ramesh Gupta  (3-step modal)
8. Bookings page: verify Ramesh's booking appears
9. Click "Check-In" for Ramesh           (status → checked_in)
10. Items: add "Veg Thali — ₹250"        (menu item)
11. Orders: verify it shows (if guest ordered)
12. Bookings: click "Checkout" on Ramesh  (invoice modal)
13. Invoice shows: Room ₹5000 + Services = Total
14. Rooms page: Room 201 is green again   (freed on checkout)
15. Staff: add new staff Priya / priya@colagoa.com / priya123
16. Logout → login as Priya              (new staff can access)
17. Payments page: view transaction history
18. Logout                               (cookie cleared)
19. Try /admin/dashboard directly         (redirected to login ✅)
```

**If all 19 steps pass — the CRM is working correctly! 🎉**
