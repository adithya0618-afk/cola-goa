This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


npm install drizzle-orm pg
npm install drizzle-kit --save-dev
npm install @types/pg --save-dev
npm install jsonwebtoken bcryptjs
npm install @types/jsonwebtoken @types/bcryptjs --save-dev
npm install axios zod
npm install dotenv

Utils and Lib folders use : 

FolderWhat Goes InExampleutils/Small, simple, pure functionsformatDate, formatCurrency, capitalizelib/Big, complex, third-party integrationsJWT setup, DB connection, Email client

Simple Way to Think
utils/  →  YOUR simple logic
            just plain functions
            no external packages needed

lib/    →  THIRD PARTY tool setup
            needs installing packages
            configuration required

Example
utils/ — Simple functions ✅
typescript// Just logic, no packages needed
export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-IN')
}

export const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString()}`
}

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
lib/ — Complex setup ✅
typescript// Needs jsonwebtoken package + config
import jwt from 'jsonwebtoken'
export const signToken = (payload: object) =>
  jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' })

// Needs pg + drizzle packages + DB URL
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
export const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL! }))


--------------------React Components ------------------------------
All Component Folders — Purpose
components/
│
├── ui/           → Tiny reusable pieces
│   ├── Button.tsx
│   ├── Badge.tsx
│   ├── Input.tsx
│   └── Modal.tsx
│
├── layout/       → Page structure
│   ├── Sidebar.tsx
│   ├── Navbar.tsx
│   └── Header.tsx
│
├── forms/        → Input forms
│   ├── BookingForm.tsx
│   ├── LoginForm.tsx
│   └── RoomForm.tsx
│
└── tables/       → Data tables
    ├── BookingsTable.tsx
    ├── RoomsTable.tsx
    └── StaffTable.tsx

Simple Rule 🎯

If a table is used in more than one place → put it in components/tables/
If a form is used in more than one place → put it in components/forms/
If a button/badge is used everywhere → put it in components/ui/

It's all about reusing code instead of copy pasting! 🚀

--------------------------Config------------------------------

config/ stores fixed values and settings that are used across the whole app.

Instead of typing the same value in 10 places — define it ONCE in config and import it everywhere!

// config/constants.ts → define ONCE
export const ROLES = {
  ADMIN  : "ADMIN",
  MANAGER: "MANAGER",
  STAFF  : "STAFF",
}

// bookings/route.ts
import { ROLES } from '@/config/constants'
if (user.role === ROLES.ADMIN) { ... }    ✅

// staff/route.ts
if (user.role === ROLES.ADMIN) { ... }    ✅

// rooms/route.ts
if (user.role === ROLES.ADMIN) { ... }    ✅

---------------------------Hooks-----------------
## `hooks/` in 10 Lines 🪝

1. **Hooks** are reusable functions that handle **logic & state** for frontend pages
2. They always start with `use` → `useAuth`, `useBookings`, `useRooms`
3. They live in `hooks/` folder so all pages can **import and reuse** them
4. Without hooks → you copy paste `useState + useEffect` in every page 😵
5. With hooks → write logic **once**, import in any page with 1 line ✅
6. `useAuth.ts` → checks if user is logged in, returns user info
7. `useBookings.ts` → fetches bookings from API, returns data + loading + error
8. `useRooms.ts` → fetches rooms, tells you which are available or occupied
9. They only work in **frontend** (`page.tsx`) — NOT in backend (`route.ts`)
10. **Rule** → same `useState + useEffect` in 2+ pages? → move it to a hook! 🚀

import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  integer,
  boolean,
  pgEnum,
  serial,
  date
} from "drizzle-orm/pg-core";


// =======================
// ENUMS
// =======================

export const roomStatusEnum = pgEnum("room_status", [
  "available",
  "occupied",
  "maintenance"
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "booked",
  "checked_in",
  "checked_out",
  "cancelled"
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "partial",
  "paid"
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "accepted",
  "rejected",
  "completed"
]);

export const itemTypeEnum = pgEnum("item_type", [
  "food",
  "service"
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "card",
  "upi"
]);

export const paymentTxnStatusEnum = pgEnum("payment_txn_status", [
  "pending",
  "success",
  "failed"
]);


// =======================
// USERS
// =======================

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),
  phone: text("phone").unique(),
  email: text("email").unique(),

  createdAt: timestamp("created_at").defaultNow(),
});


// =======================
// ROOMS
// =======================

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),

  roomNumber: integer("room_number").notNull().unique(),
  pricePerNight: numeric("price_per_night").notNull(),
  capacity: integer("capacity"),

  status: roomStatusEnum("status").default("available"),

  createdAt: timestamp("created_at").defaultNow(),
});


// =======================
// BOOKINGS (CORE)
// =======================

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),

  roomId: integer("room_id").references(() => rooms.id),

  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date").notNull(),

  status: bookingStatusEnum("status").default("booked"),
  paymentStatus: paymentStatusEnum("payment_status").default("pending"),

  guestToken: text("guest_token").unique(),

  // 💰 BILLING
  roomAmount: numeric("room_amount").default("0"),
  serviceAmount: numeric("service_amount").default("0"),
  totalAmount: numeric("total_amount").default("0"),

  createdAt: timestamp("created_at").defaultNow(),
});


// =======================
// ITEMS (FOOD + SERVICE)
// =======================

export const items = pgTable("items", {
  id: serial("id").primaryKey(),

  name: text("name").notNull(),
  type: itemTypeEnum("type"),
  category: text("category"),

  price: numeric("price").notNull(),
  isAvailable: boolean("is_available").default(true),

  createdAt: timestamp("created_at").defaultNow(),
});


// =======================
// ORDERS
// =======================

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),

  bookingId: uuid("booking_id").references(() => bookings.id, {
    onDelete: "cascade",
  }),

  roomId: integer("room_id").references(() => rooms.id),

  status: orderStatusEnum("status").default("pending"),

  totalAmount: numeric("total_amount").default("0"),

  createdAt: timestamp("created_at").defaultNow(),
});


// =======================
// ORDER ITEMS
// =======================

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),

  orderId: uuid("order_id").references(() => orders.id, {
    onDelete: "cascade",
  }),

  itemId: integer("item_id").references(() => items.id),

  quantity: integer("quantity").default(1),
  price: numeric("price").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});


// =======================
// PAYMENTS
// =======================

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),

  bookingId: uuid("booking_id").references(() => bookings.id, {
    onDelete: "cascade",
  }),

  amount: numeric("amount").notNull(),

  paymentMethod: paymentMethodEnum("payment_method"),
  status: paymentTxnStatusEnum("status").default("pending"),

  transactionRef: text("transaction_ref"),

  createdAt: timestamp("created_at").defaultNow(),
});


// =======================
// STAFF (OPTIONAL)
// =======================

export const staff = pgTable("staff", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name"),
  role: text("role"),
  shift: text("shift"),

  createdAt: timestamp("created_at").defaultNow(),
});

drizzle commands 
npm install drizzle-orm pg
npm install -D drizzle-kit
npm install dotenv

# create schema.ts
# create drizzle.config.ts

npx drizzle-kit generate
npx drizzle-kit push
npx drizzle-kit studio

npm install @supabase/supabase-js

backups of database 


Create a backups folder:

mkdir ~/db-backups

Then:

pg_dump "..." | gzip > ~/db-backups/backup_$(date +%F).sql.gz


.env.local
# Used by Drizzle to run migrations
DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Used if you use the Supabase JS Client in your Next.js frontend
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5c..."

