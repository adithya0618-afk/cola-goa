
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

    roomNumber: text("room_number").notNull().unique(),
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
    bookingCode: text("booking_code").unique(),

    userId: uuid("user_id").references(() => users.id, {
        onDelete: "cascade",
    }),
    name: text("name"),

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
    description: text("description"),
    image: text("image"),
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
    email: text("email").unique(),
    phone: text("phone").unique(),
    password: text("password"),

    createdAt: timestamp("created_at").defaultNow(),
});
