import {
    pgTable,
    uuid,
    serial,
    varchar,
    integer,
    boolean,
    text,
    jsonb,
    timestamp,
    pgEnum,
    primaryKey,
    index
} from "drizzle-orm/pg-core";

//
// 🔥 ENUMS
//

export const userStatusEnum = pgEnum("user_status", [
    "active",
    "blocked",
]);

export const kycStatusEnum = pgEnum("kyc_status", [
    "pending",
    "verified",
    "rejected",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
    "deposit",
    "withdrawal",
    "ticket_purchase",
    "prize",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
    "pending",
    "success",
    "failed",
]);

export const gameTypeEnum = pgEnum("game_type_enum", [
    "lottery",
    "level",
]);

//
// 👤 USERS
//

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 150 }).notNull().unique(),
    phone: varchar("phone", { length: 20 }),
    passwordHash: text("password_hash").notNull(),

    status: userStatusEnum("status").default("active"),
    kycStatus: kycStatusEnum("kyc_status").default("pending"),

    createdAt: timestamp("created_at").defaultNow(),
});

//
// 💰 WALLET
//

export const wallets = pgTable("wallets", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),

    balance: integer("balance").notNull().default(0),

    createdAt: timestamp("created_at").defaultNow(),
});

//
// 💳 TRANSACTIONS
//

export const transactions = pgTable("transactions", {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
        .references(() => users.id)
        .notNull(),

    walletId: uuid("wallet_id")
        .references(() => wallets.id)
        .notNull(),

    amount: integer("amount").notNull(),

    type: transactionTypeEnum("type").notNull(),
    status: transactionStatusEnum("status").default("pending"),

    createdAt: timestamp("created_at").defaultNow(),
});

//
// 💸 PAYMENT ORDERS
//

export const paymentOrders = pgTable("payment_orders", {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
        .references(() => users.id)
        .notNull(),

    amount: integer("amount").notNull(),

    razorpayOrderId: varchar("razorpay_order_id", { length: 100 })
        .notNull()
        .unique(),

    status: transactionStatusEnum("status").default("pending"),

    createdAt: timestamp("created_at").defaultNow(),
});

//
// 🎮 GAME TYPES
//

export const gameTypes = pgTable("game_types", {
    id: serial("id").primaryKey(),

    name: varchar("name", { length: 100 }).notNull(),
    type: gameTypeEnum("type").notNull(),

    createdAt: timestamp("created_at").defaultNow(),
});

//
// 🎯 LOTTERY DRAWS
//

export const draws = pgTable("draws", {
    id: uuid("id").primaryKey().defaultRandom(),

    name: varchar("name", { length: 100 }).notNull(),
    entryFee: integer("entry_fee").notNull(),

    drawTime: timestamp("draw_time"),

    createdAt: timestamp("created_at").defaultNow(),
});

//
// 🎟️ TICKETS
//

export const tickets = pgTable("tickets", {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
        .references(() => users.id)
        .notNull(),

    drawId: uuid("draw_id")
        .references(() => draws.id)
        .notNull(),

    numbers: varchar("numbers", { length: 50 }),

    createdAt: timestamp("created_at").defaultNow(),
});

//
// 🏆 LEVEL POOLS
//

export const levelPools = pgTable("level_pools", {
    id: uuid("id").primaryKey().defaultRandom(),

    gameTypeId: integer("game_type_id")
        .references(() => gameTypes.id)
        .notNull(),

    entryFee: integer("entry_fee").notNull(),
    maxUsers: integer("max_users").notNull(),

    currentUsers: integer("current_users").default(0),

    createdAt: timestamp("created_at").defaultNow(),
});

//
// 👥 POOL USERS
//

export const poolUsers = pgTable(
    "pool_users",
    {
        poolId: uuid("pool_id")
            .references(() => levelPools.id)
            .notNull(),

        userId: uuid("user_id")
            .references(() => users.id)
            .notNull(),

        joinedAt: timestamp("joined_at").defaultNow(),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.poolId, t.userId] }),
    })
);

//
// 🏦 USER BANK ACCOUNTS
//

export const userBankAccounts = pgTable("user_bank_accounts", {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
        .references(() => users.id)
        .notNull(),

    accountHolderName: varchar("account_holder_name", { length: 100 }),
    accountNumber: varchar("account_number", { length: 30 }),
    ifscCode: varchar("ifsc_code", { length: 20 }),
    bankName: varchar("bank_name", { length: 100 }),

    createdAt: timestamp("created_at").defaultNow(),
});

//
// 💵 WITHDRAWALS
//

export const withdrawals = pgTable("withdrawals", {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
        .references(() => users.id)
        .notNull(),

    amount: integer("amount").notNull(),

    status: transactionStatusEnum("status").default("pending"),

    createdAt: timestamp("created_at").defaultNow(),
});