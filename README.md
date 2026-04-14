# 🌴 Cola Goa Resort — Full Stack CRM System

> **Branch:** `balaji-admin` | **Stack:** Next.js 16 · TypeScript · Drizzle ORM · PostgreSQL (Supabase) · Tailwind CSS v4 · JWT Auth

---

## 🌟 Beginner's Educational Guide (How to build this!)

Welcome! Whether you are a senior developer or a **10th-grade student learning to code**, this section will explain exactly how to build a powerful Hotel Management System from scratch. 

We actually built **two** apps in one codebase:
1. **The Guest Website (`/`)**: A public-facing site where random people can look at pictures of the resort.
2. **The Admin Dashboard (`/admin`)**: A lock-and-key protected portal where receptionists manage the hotel.

### 🧠 How We Wrote the Code (Easy Examples)

If you want to build a website like this, you just need to understand three core pieces: **The Database, The Backend API, and The Frontend UI**.

**A. The Database (Drizzle ORM)**
Instead of writing confusing raw SQL, we use **TypeScript**. We define our tables in `src/db/migrations/schema.ts`.
*Example of how we easily created the "rooms" table:*
```typescript
import { pgTable, serial, integer, text } from "drizzle-orm/pg-core";

export const rooms = pgTable("rooms", {
    id: serial("id").primaryKey(),                 // Auto-counts: 1, 2, 3
    roomNumber: integer("room_number").unique(),  // Example: 101
    pricePerNight: integer("price_per_night"),    // Example: 3500
    status: text("status").default("available"),  // available or occupied
});
```

**B. The Backend API (Route Handlers)**
When you click a button on the screen, it sends an invisible message to our API. 
*Example of how we fetch a specific room (`src/app/api/admin/rooms/[id]/route.ts`):*
```typescript
import db from '@/lib/db';
import { rooms } from '@/db/migrations/schema';
import { eq } from 'drizzle-orm';

// This function runs when the browser asks for GET /api/admin/rooms/101
export async function GET(request, { params }) {
  const { id } = await params;
  const myRoom = await db.select().from(rooms).where(eq(rooms.id, parseInt(id)));
  return Response.json({ room: myRoom[0] });
}
```

**C. The Frontend UI (React + Tailwind)**
We use **React** to draw the buttons and **TailwindCSS** to color them instantly.
*Example of a UI Button using descriptive words instead of tricky CSS:*
```tsx
<button className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold px-4 py-2">
   Process Check-Out
</button>
```

---

## 📋 Table of Contents

1. [What Was Built](#-what-was-built)
2. [Project Structure](#-project-structure)
3. [All Pages & Routes](#-all-pages--routes)
4. [JWT Authentication — How It Works](#-jwt-authentication--how-it-works)
5. [Database Schema](#-database-schema)
6. [Environment Variables](#-environment-variables)
7. [Complete Setup — All Commands at Once](#-complete-setup--all-commands-at-once)
8. [NPM Packages — What & Why](#-npm-packages--what--why)
9. [Git Workflow](#-git-workflow)
10. [Database Backup](#-database-backup)
11. [Team Architecture Guides](#-architecture-guides-for-new-developers)

---

## 🏗 What Was Built

This branch (`balaji-admin`) contains the complete **Reception CRM Dashboard** for Cola Goa Resort.

### Two Applications in One Codebase

| App | URL Path | Description |
|---|---|---|
| 🔐 **Admin CRM** | `/admin/*` | Reception/Staff dashboard — **JWT protected** |
| 🌴 **Guest Website** | `/` | Public guest site — scaffolded for friend's team |

### Admin CRM Features Built

| Page | URL | Feature |
|---|---|---|
| Login | `/admin/login` | Secure login with bcrypt + JWT cookie |
| Dashboard | `/admin/dashboard` | Stats overview, occupancy gauge, recent bookings |
| Rooms | `/admin/rooms` | **BookMyShow-style grid**, Manage Prices, Status (Maintenance), Checkout, **PDF Invoice Downloads** |
| Bookings | `/admin/bookings` | Full booking table, Check-In, Checkout, Cancel |
| Orders | `/admin/orders` | Live food/service orders, Accept/Reject/Complete |
| Menu/Items | `/admin/items` | Add/Edit/Delete food items and services |
| Staff | `/admin/staff` | Manage staff members, roles, shifts |
| Payments | `/admin/payments` | Track all transactions |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (admin)/              ← Route group (no URL effect)
│   │   ├── layout.tsx        ← Admin layout: Sidebar + Topbar (wraps all /admin/* pages)
│   │   └── admin/            ← Adds /admin/ prefix to all URLs
│   │       ├── dashboard/page.tsx
│   │       ├── rooms/page.tsx
│   │       ├── bookings/page.tsx + BookingsClient.tsx
│   │       ├── orders/page.tsx + OrdersClient.tsx
│   │       ├── items/page.tsx + ItemsClient.tsx
│   │       ├── staff/page.tsx + StaffClient.tsx
│   │       └── payments/page.tsx + PaymentsClient.tsx
│   │
│   ├── admin/
│   │   └── login/            ← Standalone login (no sidebar, dark design)
│   │       ├── layout.tsx
│   │       └── page.tsx
│   │
│   ├── (guest)/              ← Guest website (friend's team)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── api/admin/            ← All backend API routes
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   ├── bookings/route.ts + [id]/route.ts + [id]/checkout/route.ts
│   │   ├── orders/route.ts + [id]/route.ts
│   │   ├── rooms/route.ts + [id]/route.ts
│   │   ├── items/route.ts + [id]/route.ts
│   │   └── staff/route.ts + [id]/route.ts
│   │
│   ├── globals.css           ← Design system (tokens, buttons, badges, cards, tables)
│   ├── layout.tsx            ← Root layout
│   └── page.tsx              ← Redirects / → /admin/dashboard
│
├── components/
│   └── admin/
│       ├── AdminSidebar.tsx  ← Dark navy sidebar with nav + logout
│       ├── AdminTopbar.tsx   ← Search + notifications + user avatar
│       ├── RoomGrid.tsx      ← BookMyShow room selector + Editable Configs
│       ├── EditRoomModal.tsx ← Modal for Room Maintenance, Guest Edits, and Invoicing
│       └── BookingModal.tsx  ← 3-step booking flow modal
│
├── db/
│   ├── migrations/schema.ts  ← Drizzle ORM schema (all tables)
│   └── seed.ts               ← Seeds 13 rooms + default admin user
│
├── lib/
│   └── db.ts                 ← Drizzle DB connection singleton
│
└── proxy.ts                  ← JWT route protection (Next.js 16 "proxy" = old middleware)
```

### Pattern Used: Server + Client Component Split

Each admin page uses a **Server Component** for data fetching + a **Client Component** for interactivity:

```
bookings/
├── page.tsx          ← Server: fetches from DB, passes data as props
└── BookingsClient.tsx ← Client: search, filter, modals, actions ('use client')
```

---

## 🗺 All Pages & Routes

### Frontend Pages

| Route | Component | Data Source | Auth Required |
|---|---|---|---|
| `GET /` | `app/page.tsx` | — | No (redirects) |
| `GET /admin/login` | `admin/login/page.tsx` | — | No |
| `GET /admin/dashboard` | `admin/dashboard/page.tsx` | DB (server-side) | ✅ Yes |
| `GET /admin/rooms` | `admin/rooms/page.tsx` | DB (server-side) | ✅ Yes |
| `GET /admin/bookings` | `admin/bookings/page.tsx` | DB (server-side) | ✅ Yes |
| `GET /admin/orders` | `admin/orders/page.tsx` | DB (server-side) | ✅ Yes |
| `GET /admin/items` | `admin/items/page.tsx` | DB (server-side) | ✅ Yes |
| `GET /admin/staff` | `admin/staff/page.tsx` | DB (server-side) | ✅ Yes |
| `GET /admin/payments` | `admin/payments/page.tsx` | DB (server-side) | ✅ Yes |

### Backend API Routes

| Method | Route | What It Does |
|---|---|---|
| `POST` | `/api/admin/login` | Validates credentials, issues JWT cookie |
| `POST` | `/api/admin/logout` | Clears JWT cookie |
| `GET` | `/api/admin/bookings` | List all bookings |
| `POST` | `/api/admin/bookings` | Create a new booking (prevents double-booking) |
| `PATCH` | `/api/admin/bookings/[id]` | Update booking status |
| `PATCH` | `/api/admin/rooms/[id]` | Update Room Config, Process Checkouts, Overwrite User Info |
| `GET` | `/api/admin/orders` | List all orders |
| `PATCH` | `/api/admin/orders/[id]` | Accept/Reject/Complete an order |
| `GET` | `/api/admin/items` | List all menu items |
| `POST` | `/api/admin/items` | Create a new item |
| `PUT` | `/api/admin/items/[id]` | Update an item |
| `DELETE` | `/api/admin/items/[id]` | Delete an item |
| `GET` | `/api/admin/staff` | List all staff |
| `POST` | `/api/admin/staff` | Add new staff member |
| `PUT` | `/api/admin/staff/[id]` | Update staff member |
| `DELETE` | `/api/admin/staff/[id]` | Delete staff member |

---

## 🔐 JWT Authentication — How It Works

### Overview

```
User visits /admin/dashboard
      ↓
src/proxy.ts intercepts the request
      ↓
Does cookie "admin_token" exist and have 3 JWT parts?
      ↓ NO                    ↓ YES
Redirect to /admin/login     Allow through to the page
      ↓
User submits email + password
      ↓
POST /api/admin/login
      ↓
bcrypt.compare(password, hashed_password_from_DB)
      ↓ VALID
jwt.sign({ id, email, role, name }, JWT_SECRET, { expiresIn: '12h' })
      ↓
Cookie set: admin_token=<JWT>; HttpOnly; Path=/; Max-Age=43200
      ↓
Browser redirects to /admin/dashboard ✅
```

### JWT Token Details

| Property | Value |
|---|---|
| **Algorithm** | HS256 (HMAC SHA-256) |
| **Validity** | **12 hours** (`expiresIn: '12h'`) |
| **Cookie name** | `admin_token` |
| **Cookie type** | HttpOnly (not accessible via JavaScript — prevents XSS) |
| **Cookie age** | 43200 seconds = 12 hours |
| **Stored in** | Browser cookie (NOT localStorage) |
| **Secret key** | `JWT_SECRET` env variable |

### What Happens After 12 Hours?

- The cookie expires automatically in the browser
- Next request to any `/admin/*` page → proxy detects no cookie → redirect to `/admin/login`
- User must log in again

### To Extend JWT Validity

Open `src/app/api/admin/login/route.ts` and change:

```typescript
// Current: 12 hours
jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' })

// For 24 hours:
jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
// Cookie Max-Age must also match: 86400 (24h in seconds)

// For 7 days (not recommended for reception terminal):
jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
// Cookie Max-Age: 604800
```

### JWT Payload (What's Inside the Token)

```json
{
  "id": "uuid-of-staff-member",
  "email": "admin@colagoa.com",
  "role": "admin",
  "name": "Admin User",
  "iat": 1713000000,
  "exp": 1713043200
}
```

### How to Inspect a JWT Token (for debugging)

1. Open browser → F12 → Application → Cookies → `admin_token`
2. Copy the token value
3. Paste at [https://jwt.io](https://jwt.io) — you'll see the payload decoded

---

## 🗄 Database Schema

### Tables

| Table | Purpose | Key Fields |
|---|---|---|
| `users` | Resort guests | id, name, phone, email |
| `rooms` | 13 resort rooms | id, roomNumber, pricePerNight, status |
| `bookings` | All reservations | id, userId, roomId, checkIn/Out, status, paymentStatus, guestToken |
| `orders` | Food/service requests | id, bookingId, roomId, status, totalAmount |
| `order_items` | Line items per order | orderId, itemId, quantity, price |
| `items` | Menu + services catalog | id, name, type, category, price, isAvailable |
| `payments` | Payment transactions | id, bookingId, amount, method, status |
| `staff` | Resort employees | id, name, email, role, shift, password (hashed) |

### Room Status Flow

```
available → (admin disables) → maintenance 
available → (booking created) → occupied → (manual checkout process) → available
```

### Booking Status Flow

```
booked → (receptionist clicks Check-In) → checked_in → (checkout) → checked_out
booked → (receptionist cancels) → cancelled
```

### Order Cost Propagation

```
Guest orders food (₹500)
  → Order created: status=pending
  → Receptionist accepts → status=accepted
  → booking.serviceAmount += ₹500
  → booking.totalAmount = roomAmount + serviceAmount
  → Checkout: invoice shows full breakdown
```

---

## 🔑 Environment Variables

File: `.env.local`

```env
# ============================================
# DATABASE — Supabase PostgreSQL
# ============================================
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# ============================================
# SUPABASE (for Supabase JS client if needed)
# ============================================
NEXT_PUBLIC_SUPABASE_URL="https://jlkpuyuxsdaaatbcgvap.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsa3B1eXV4c2RhYWF0YmNndmFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzEwMDgsImV4cCI6MjA5MTQwNzAwOH0.Da0phfL1kcgnWysO5OP0Etlo8MpNht1nHFAEei5VbHg"

# ============================================
# JWT — Admin Authentication
# ============================================
# This is the secret used to SIGN and VERIFY JWT tokens
# CHANGE THIS in production to a long random string!
# Token validity is controlled in: src/app/api/admin/login/route.ts
JWT_SECRET="cola_goa_jwt_super_secret_change_in_production_2025"

# ============================================
# APP URL — Used for generating guest links
# ============================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **⚠️ Security Note:** Never commit `.env.local` to git. It is already in `.gitignore`.

---

## 🚀 Complete Setup — All Commands at Once

### First Time Setup (run in order)

```bash
# ─────────────────────────────────────────────
# 1. CLONE & SETUP BRANCH
# ─────────────────────────────────────────────
git clone "https://github.com/adithya0618-afk/cola-goa.git"
cd cola-goa
git checkout balaji-admin

# ─────────────────────────────────────────────
# 2. INSTALL ALL DEPENDENCIES
# ─────────────────────────────────────────────
npm install

# ─────────────────────────────────────────────
# 3. SET UP ENVIRONMENT
# ─────────────────────────────────────────────
# Edit .env.local and fill in your DATABASE_URL
# It already has JWT_SECRET and other values

# ─────────────────────────────────────────────
# 4. DATABASE MIGRATION (creates all tables)
# ─────────────────────────────────────────────
npm run db:migrate
# This runs: drizzle-kit migrate
# Creates: users, rooms, bookings, orders, order_items, items, payments, staff tables

# ─────────────────────────────────────────────
# 5. SEED DATABASE (13 rooms + admin user)
# ─────────────────────────────────────────────
npm run db:seed
# This creates:
#   - 13 rooms (101–303) with pricing
#   - Admin user: admin@colagoa.com / admin123

# ─────────────────────────────────────────────
# 6. START DEVELOPMENT SERVER
# ─────────────────────────────────────────────
npm run dev
# Open: http://localhost:3000/admin/login
# Login: admin@colagoa.com / admin123
```

### Daily Development Commands

```bash
npm run dev          # Start development server (hot reload)
npm run build        # Build for production (also runs TypeScript check)
npm run start        # Run production build locally

npm run db:generate  # Generate new migration files from schema changes
npm run db:migrate   # Apply pending migrations to database
npm run db:seed      # Re-seed rooms and admin user (safe — uses onConflictDoNothing)
```

### Git Workflow (Team Commands)

```bash
# Get latest from dev branch
git checkout dev
git pull origin dev

# Create your personal branch
git checkout -b "your-name-feature"

# Daily work
git add .
git commit -m "descriptive message of what you did"
git push origin "your-name-feature"

# To sync with latest dev changes
git pull origin dev
```

---

## 📦 NPM Packages — What & Why

### Production Dependencies

| Package | Version | Why We Need It |
|---|---|---|
| `next` | 16.2.2 | The React framework — routing, server components, API routes |
| `react` & `react-dom` | 19.x | React library — building UI components |
| `drizzle-orm` | ^0.45.2 | Type-safe SQL ORM — write SQL in TypeScript instead of raw queries |
| `pg` | ^8.20.0 | PostgreSQL client — connects Node.js to your Supabase PostgreSQL |
| `jsonwebtoken` | ^9.0.3 | Creates and verifies JWT tokens for authentication |
| `bcryptjs` | ^3.0.3 | Hashes passwords securely — never store plain text passwords |
| `lucide-react` | ^1.8.0 | Beautiful icon library — all the icons in sidebar, forms, buttons |
| `zod` | ^4.3.6 | Schema validation — validate API request bodies safely |
| `axios` | ^1.14.0 | HTTP client — for making API requests from frontend |
| `jspdf` | ^2.5.1 | Generates structured PDF bills directly in the browser |
| `jspdf-autotable` | ^3.8.2 | Renders dynamic pricing tables inside jsPDF output |
| `dotenv` | ^17.4.1 | Loads `.env.local` variables into `process.env` |

### Development Dependencies

| Package | Version | Why We Need It |
|---|---|---|
| `drizzle-kit` | ^0.31.10 | CLI tool — generates migrations, runs migrations, opens DB studio |
| `tsx` | ^4.x | TypeScript executor — runs `.ts` files directly (used for seed script) |
| `typescript` | ^5 | TypeScript compiler |
| `tailwindcss` | ^4 | Utility CSS framework |
| `@tailwindcss/postcss` | ^4 | Processes Tailwind CSS through PostCSS |
| `@types/node` | ^20 | TypeScript types for Node.js built-ins |
| `@types/pg` | ^8.20.0 | TypeScript types for `pg` package |
| `@types/bcryptjs` | | TypeScript types for bcryptjs |
| `@types/jsonwebtoken` | | TypeScript types for jsonwebtoken |
| `eslint` | ^9 | Catches code errors and enforces style |

---

## 🗃 Database Backup

```bash
# Create backup folder
mkdir ~/db-backups

# Backup (replace with your DB URL)
pg_dump "postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres" \
  | gzip > ~/db-backups/backup_$(date +%F).sql.gz

# Restore from backup
gunzip -c ~/db-backups/backup_2026-04-13.sql.gz \
  | psql "postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

---

## 👥 Team Branches

| Developer | Branch | Responsibility |
|---|---|---|
| Balaji | `balaji-admin` | Reception CRM Dashboard (this branch) |
| Adithya + Team | `dev` | Guest Website, core structure |
| Rajesh | `frontend-rajesh` | Guest Website frontend |

**Supabase DB Login:**
- Email: `balajimarpally931@gmail.com`
- Password: `Colagoa@123`

---

## 🏛 Architecture Guides (for new developers)

### utils/ vs lib/

| Folder | Use For | Example |
|---|---|---|
| `utils/` | Simple pure functions, no packages needed | `formatDate()`, `formatCurrency()` |
| `lib/` | Complex third-party setup | DB connection, JWT setup, email client |

### components/ folders

| Folder | Use For |
|---|---|
| `components/ui/` | Tiny reusable pieces: Button, Badge, Input, Modal |
| `components/layout/` | Page structure: Sidebar, Topbar, Header |
| `components/forms/` | Form components: BookingForm, LoginForm |
| `components/tables/` | Data tables shared across pages |
| `components/admin/` | Admin-specific components (RoomGrid, BookingModal) |

### hooks/ folder

Custom React hooks start with `use` — they encapsulate shared `useState + useEffect` logic:

- `useAuth.ts` → checks login state, returns user
- `useBookings.ts` → fetches bookings, returns `{ data, loading, error }`
- **Rule:** If same logic is in 2+ pages → extract to a hook!