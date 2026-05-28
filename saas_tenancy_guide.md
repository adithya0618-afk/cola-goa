# 🏢 The Ultimate Guide to Multi-Tenant SaaS: How It Works Under the Hood

This guide explains in simple, plain English—using a real-life example—how a single codebase, a single server deployment, and a single database can serve multiple different resorts simultaneously while keeping their data, branding, and guest requests completely separated and secure.

---

## 🌟 The Real-Life Example Scenario

To understand the architecture, let’s follow two different resorts using our SaaS platform:

| Resort Details | Resort 1 (Tenant A) | Resort 2 (Tenant B) |
| :--- | :--- | :--- |
| **Resort Name** | **Cola Goa Resort** | **Sunset Palms Resort** |
| **Database ID** | `1111-1111-1111-1111` | `2222-2222-2222-2222` |
| **URL (Subdomain)**| `cola-goa.resortcrm.com` | `sunset-palms.resortcrm.com` |
| **Theme Color** | **Ocean Blue** (`#0B74D4`) | **Emerald Green** (`#10B981`) |
| **Staff Member** | **Rahul** (Manager) | **Siddharth** (Manager) |
| **Guest Name** | **Sarah** (Room 104) | **David** (Room 205) |

---

## 🚪 Part 1: How the Admin Portal Knows Who is Accessing

When Rahul (Cola Goa) and Siddharth (Sunset Palms) visit their respective admin portals, they go to two different URLs, but they are looking at the **exact same code** running on the **exact same server** (Vercel).

```
                  ┌──────────────────────────────┐
                  │   Vercel Shared Deployment   │
                  │   (One Node.js/Next.js App)  │
                  └──────────────┬───────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
[cola-goa.resortcrm.com]                      [sunset-palms.resortcrm.com]
Reads domain ➡️ "cola-goa"                     Reads domain ➡️ "sunset-palms"
App looks up database:                         App looks up database:
`WHERE slug = 'cola-goa'`                      `WHERE slug = 'sunset-palms'`
Primary Color: 🔵 Ocean Blue                  Primary Color: 🟢 Emerald Green
```

### Step 1: The Middleware Reads the URL
Every request entering the server is intercepted by Next.js **Middleware**. The middleware looks at the website address (the domain) typing:
* If the domain is `cola-goa.resortcrm.com`, the middleware grabs the word `cola-goa`.
* It queries the database to find the hotel matching that slug, retrieving its ID (`1111-1111-1111-1111`) and its brand settings (Blue color).
* It dynamically injects this config into the webpage. **Result:** Rahul's login screen turns **Ocean Blue**; Siddharth's login screen turns **Emerald Green**.

### Step 2: Hitting Login
When Rahul logs in, the backend authenticates him by filtering on **both** email and hotel ID:
```sql
SELECT * FROM staff 
WHERE email = 'rahul@colagoa.com' 
  AND hotel_id = '1111-1111-1111-1111';
```

### Step 3: The Tamper-Proof ID Badge (JWT)
Once authenticated, the server returns an encrypted **JWT cookie** stored in their browser. This JWT has the `hotel_id` locked inside:
```json
{
  "staff_name": "Rahul",
  "hotel_id": "1111-1111-1111-1111", 
  "role": "admin"
}
```
Whenever Rahul opens his dashboard to view reservations, the browser sends this cookie. The backend decrypts it, finds `"hotel_id": "1111-1111-1111-1111"`, and runs:
```sql
SELECT * FROM bookings WHERE hotel_id = '1111-1111-1111-1111';
```
Rahul only sees guests booked at **Cola Goa**. He has no physical way to access Sunset Palms' bookings because his "ID Badge" prevents the database query from looking elsewhere!

---

## 📱 Part 2: How the Guest Portal Knows Which Guest is Ordering

Now let’s look at the guests: **Sarah** (staying in Room 104 at Cola Goa) and **David** (staying in Room 205 at Sunset Palms).

To order food, they scan a printed QR Code in their rooms.

```
       [Sarah scans QR Code in Room 104]
                      │
                      ▼
    Sarah's browser opens this link:
    https://cola-goa.resortcrm.com/guest?token=sarah_uuid_abc
                      │
                      ▼
    Server checks token: 'sarah_uuid_abc' in Database:
    ┌────────────────────────────────────────────────────────┐
    │  BOOKINGS TABLE                                        │
    │  ID: booking_999                                       │
    │  Guest Token: 'sarah_uuid_abc'                         │
    │  Room ID: 104 (References Room 104 at Cola Goa)        │
    │  Hotel ID: '1111-1111-1111-1111'                       │
    └────────────────────────────────────────────────────────┘
                      │
                      ▼
    Portal automatically welcomes Sarah:
    "Welcome Sarah to Room 104!" (Renders Ocean Blue buttons)
```

### Why This is 100% Secure & Frictionless:
1. **No Manual Inputs:** Sarah did not have to register, select "Cola Goa", or type her room number. The secure, random **UUIDv4 token** (`sarah_uuid_abc`) in her URL did the mapping instantly.
2. **Zero IDOR Attack Vulnerability:** If David (at Sunset Palms) tries to hack the system by altering his URL parameter to see another room, he cannot guess a 128-bit random UUID (e.g. `sarah_uuid_abc` has 3.4 x 10^38 combinations!). Your guest database is absolutely secure.

---

## 🛎️ Part 3: How Guest Orders Get Routed to the Right Resort

Sarah decides she wants a **Masala Omelette** delivered to Room 104.

```
[Sarah clicks "Place Order"]
             │
             ▼
[POST Request sent to /api/guest/orders]
Headers contain token: 'sarah_uuid_abc'
             │
             ▼
[Server Processes Token]
1. Server validates token 'sarah_uuid_abc'
2. Locates Sarah's booking records
3. Resolves Hotel ID: '1111-1111-1111-1111'
4. Resolves Room ID: 104
             │
             ▼
[Postgres Database Save]
Inserts a row into the ORDERS table:
┌──────────────────────┬──────────────────────┬─────────────┬──────────────┐
│  id                  │  hotel_id            │  room_id    │  amount      │
├──────────────────────┼──────────────────────┼─────────────┼──────────────┤
│  order_uuid_xyz      │  1111-1111-1111-1111 │  104        │  180.00      │
└──────────────────────┴──────────────────────┴─────────────┴──────────────┘
             │
             ▼
[Websocket Live Sync Broker]
Broadcasts event: "NEW_ORDER" strictly to channel:
📢 `resort_orders:1111-1111-1111-1111`
```

### The Live Screen Notification:
* **Rahul's Dashboard (Cola Goa)** is actively listening to channel `resort_orders:1111-1111-1111-1111`. **It immediately plays a bell chime and pops up the order on his screen!**
* **Siddharth's Dashboard (Sunset Palms)** is actively listening to channel `resort_orders:2222-2222-2222-2222`. Because the websocket event was not broadcasted to his resort's ID, **his screen remains completely quiet and unchanged.**

---

## 📈 Summary of Data Separation

This single-database strategy uses standard indexing to keep columns separated:

```
               ┌──────────────────────────────┐
               │    SINGLE DATABASE ENGINE    │
               │         (PostgreSQL)         │
               └──────────────┬───────────────┘
                              │
         ┌────────────────────┴────────────────────┐
         ▼                                         ▼
  [Query matching:                          [Query matching:
   hotel_id = '1111-...']                    hotel_id = '2222-...']
         │                                         │
         ▼                                         ▼
 📊 COLA GOA DATA ONLY                     📊 SUNSET PALMS DATA ONLY
  - Bookings (Sarah, Rm 104)                - Bookings (David, Rm 205)
  - Staff (Rahul)                           - Staff (Siddharth)
  - Rooms (101, 102, 103, 104)              - Rooms (201, 202, 203, 204, 205)
  - Orders (Breakfast: Masala Omelette)     - Orders (Wellness: Deep Tissue Spa)
```

By adding a `hotel_id` filter to Drizzle queries, you turn a single-tenant application into a multi-tenant empire. You write code once, host it once, and collect subscription revenues from as many hotels as you can sign up!
