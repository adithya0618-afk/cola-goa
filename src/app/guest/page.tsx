"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category: string | null;
  categories?: string[];
  type: string | null;
  isAvailable: boolean | null;
}

interface CartItem extends MenuItem {
  qty: number;
}

interface TrackedOrder {
  id: string;
  status: "pending" | "accepted" | "completed" | "rejected";
  createdAt: string;
  totalAmount: string;
  roomNumber?: string;
}

// ── Category Config ───────────────────────────────────────────────────────────
// All categories that exist in the DB — tabs let guests browse by section
const CATEGORY_TABS = [
  { key: "All",          label: "All",           emoji: "✦" },
  { key: "Breakfast",    label: "Breakfast",      emoji: "🥐" },
  { key: "Lunch",        label: "Lunch",          emoji: "🍱" },
  { key: "Dinner",       label: "Dinner",         emoji: "🍜" },
  { key: "Snacks",       label: "Snacks",         emoji: "🍿" },
  { key: "Beverages",           label: "Beverages",      emoji: "☕" },
  { key: "Cocktails & Spirits", label: "Cocktails",      emoji: "🍸" },
  { key: "Wines & Champagne",   label: "Wine",           emoji: "🍷" },
  { key: "Craft Beer",          label: "Beer",           emoji: "🍺" },
  { key: "Juices & Mocktails",  label: "Mocktails",      emoji: "🌿" },
  { key: "Housekeeping", label: "Housekeeping",   emoji: "🛁" },
  { key: "Wellness",     label: "Wellness",       emoji: "💆" },
];

const DRINK_CATEGORIES = [
  "Beverages", "Cocktails & Spirits", "Wines & Champagne",
  "Craft Beer", "Juices & Mocktails", "Soft Drinks", "Hot Beverages",
];

const CATEGORY_BG: Record<string, string> = {
  Breakfast:            "#FFF7EC",
  Lunch:                "#EAF3FD",
  Dinner:               "#EAF3FD",
  Snacks:               "#FFF5F0",
  Beverages:            "#F5F0FF",
  "Cocktails & Spirits":"#1a1a2e",
  "Wines & Champagne":  "#FFF0F5",
  "Craft Beer":         "#FFF8E1",
  "Juices & Mocktails": "#F0FAF4",
  "Soft Drinks":        "#E8F5FD",
  "Hot Beverages":      "#FFF3E0",
  Housekeeping:         "#F0EDFD",
  Wellness:             "#E8FAF0",
  Spa:                  "#E8FAF0",
  Extras:               "#F0F4FF",
};

const CATEGORY_EMOJI: Record<string, string> = {
  Breakfast:            "🥐",
  Lunch:                "🍱",
  Dinner:               "🍜",
  Snacks:               "🍿",
  Beverages:            "☕",
  "Cocktails & Spirits":"🍸",
  "Wines & Champagne":  "🍷",
  "Craft Beer":         "🍺",
  "Juices & Mocktails": "🌿",
  "Soft Drinks":        "🥤",
  "Hot Beverages":      "☕",
  Housekeeping:         "🛁",
  Wellness:             "💆",
  Spa:                  "💆",
  Extras:               "✨",
};

function getItemMeta(item: MenuItem) {
  const cats: string[] = item.categories?.length
    ? item.categories
    : item.category ? [item.category] : [];
  const primary = cats[0] ?? "";
  return {
    bg:    CATEGORY_BG[primary]    ?? "#EAF3FD",
    emoji: CATEGORY_EMOJI[primary] ?? "🍽️",
    isDrink: cats.some(c => DRINK_CATEGORIES.includes(c)),
  };
}

function getBadge(item: MenuItem) {
  const price = Number(item.price);
  if (price === 0)                  return { label: "Complimentary", color: "#6A1B9A", bg: "#F3E5F5" };
  if (item.type === "service")      return { label: "Service",       color: "#1565C0", bg: "#E3F2FD" };
  const cats = item.categories ?? (item.category ? [item.category] : []);
  if (cats.includes("Breakfast"))   return { label: "Vegetarian",    color: "#2E7D32", bg: "#E8F5E9" };
  if (cats.includes("Wellness"))    return { label: "Healthy",       color: "#1565C0", bg: "#E3F2FD" };
  if (cats.some(c => DRINK_CATEGORIES.includes(c)))
                                    return { label: "Bar",           color: "#C9A84C", bg: "#1a1a2e" };
  return null;
}

// ── Order Tracker ─────────────────────────────────────────────────────────────
function OrderTracker({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order ?? data);
      }
    } catch {
      // silently ignore network blips
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
    // Poll every 15 seconds
    intervalRef.current = setInterval(fetchOrder, 15_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchOrder]);

  // Step definitions — always 3 steps
  const steps: { label: string; desc: string; status: "done" | "active" | "pending" }[] = [
    {
      label: "Order Received",
      desc:  "Your order has been placed",
      status: order
        ? (["accepted","completed","rejected"].includes(order.status) ? "done" : "active")
        : "active",
    },
    {
      label: "Accepted & Preparing",
      desc:  "Kitchen is preparing your order",
      status: order
        ? order.status === "pending"   ? "pending"
        : order.status === "accepted"  ? "active"
        : order.status === "completed" ? "done"
        : "pending"
        : "pending",
    },
    {
      label: "Delivered",
      desc:  "Your order is on its way",
      status: order?.status === "completed" ? "done" : "pending",
    },
  ];

  const statusColors: Record<string, { color: string; bg: string; label: string }> = {
    pending:   { color: "#F59E0B", bg: "#FEF3C7", label: "Pending"   },
    accepted:  { color: "#16A34A", bg: "#DCFCE7", label: "Accepted"  },
    completed: { color: "#0B74D4", bg: "#EBF4FD", label: "Delivered" },
    rejected:  { color: "#DC2626", bg: "#FEE2E2", label: "Rejected"  },
  };

  const currentMeta = order ? statusColors[order.status] : statusColors.pending;

  return (
    <div className="cart-sheet-overlay" onClick={onClose}>
      <div className="cart-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "80vh" }}>
        <div className="cart-sheet-handle" />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>🕐 Order Tracker</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}>
              ID: {orderId.slice(0, 8).toUpperCase()}
            </div>
          </div>
          {order && (
            <div style={{
              padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
              color: currentMeta.color, background: currentMeta.bg,
            }}>
              {currentMeta.label}
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#9CA3AF", fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div>
            Loading order status…
          </div>
        ) : !order ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#9CA3AF", fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>❌</div>
            Order not found
          </div>
        ) : (
          <>
            {/* Rejected state */}
            {order.status === "rejected" && (
              <div style={{ background: "#FEE2E2", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#991B1B", fontWeight: 500 }}>
                ⚠️ Your order was rejected. Please contact the front desk at Ext. 009.
              </div>
            )}

            {/* Steps */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 20 }}>
              {steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 14, paddingBottom: i < steps.length - 1 ? 0 : 0 }}>
                  {/* Left: dot + line */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${
                        step.status === "done"   ? "#16A34A" :
                        step.status === "active" ? "#F59E0B" : "#E5E7EB"
                      }`,
                      background: step.status === "done" ? "#16A34A" : step.status === "active" ? "#F59E0B" : "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.3s",
                    }}>
                      {step.status === "done" && (
                        <span style={{ fontSize: 10, color: "#fff", fontWeight: 800 }}>✓</span>
                      )}
                      {step.status === "active" && (
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
                      )}
                    </div>
                    {i < steps.length - 1 && (
                      <div style={{
                        width: 2, flex: 1, minHeight: 28,
                        background: step.status === "done" ? "#16A34A" : "#E5E7EB",
                        margin: "3px 0", borderRadius: 1, transition: "background 0.3s",
                      }} />
                    )}
                  </div>

                  {/* Right: text */}
                  <div style={{ paddingBottom: i < steps.length - 1 ? 20 : 0, flex: 1 }}>
                    <div style={{
                      fontSize: 13, fontWeight: step.status === "active" ? 700 : 500,
                      color: step.status === "pending" ? "#9CA3AF" : "#1A1A2E",
                    }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{step.desc}</div>
                    {step.status === "active" && (
                      <div style={{ height: 3, borderRadius: 2, background: "#F3F4F6", marginTop: 8, overflow: "hidden", maxWidth: 160 }}>
                        <div style={{
                          height: "100%", borderRadius: 2, background: "#F59E0B",
                          animation: "progressPulse 2s ease-in-out infinite",
                        }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#6B7280" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span>Total Amount</span>
                <strong style={{ color: "#0B74D4" }}>₹{order.totalAmount}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Placed at</span>
                <span>{new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>

            <div style={{ fontSize: 10, color: "#C4C9D4", textAlign: "center", marginTop: 12 }}>
              Auto-refreshes every 15 seconds
            </div>
          </>
        )}

        <button
          onClick={onClose}
          style={{
            width: "100%", marginTop: 16, background: "#F3F4F6", border: "none",
            borderRadius: 10, padding: "12px 0", fontSize: 13, fontWeight: 600,
            color: "#6B7280", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ── MenuCard ──────────────────────────────────────────────────────────────────
function MenuCard({ item, qty, onAdd, onRemove }: {
  item: MenuItem; qty: number;
  onAdd: (item: MenuItem) => void;
  onRemove: (id: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const meta  = getItemMeta(item);
  const badge = getBadge(item);
  const isFree = Number(item.price) === 0;

  return (
    <div
      className="menu-card"
      style={{
        boxShadow: hovered ? "0 4px 18px rgba(11,116,212,0.1)" : "none",
        transform: hovered ? "translateY(-2px)" : "none",
        // border: meta.isDrink ? "1.5px solid rgba(201,168,76,0.25)" : "1px solid #E8ECF0",
        border: "1px solid #E8ECF0",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="menu-card-img" style={{ background: meta.bg }}>
        <span>{meta.emoji}</span>
        {badge && (
          <div style={{
            position: "absolute", top: 8, left: 8, padding: "2px 8px",
            borderRadius: 20, fontSize: 9, fontWeight: 600,
            color: badge.color, background: badge.bg, letterSpacing: "0.05em",
          }}>
            {badge.label}
          </div>
        )}
        {item.type === "food" && (
          <div style={{ position: "absolute", bottom: 6, right: 8, fontSize: 9, color: "#9CA3AF", display: "flex", alignItems: "center", gap: 2 }}>
            <span>⚡</span><span>{440 + (item.id * 37) % 420} kcal</span>
          </div>
        )}
      </div>
      <div className="menu-body">
        <div className="menu-name" style={{ color: meta.isDrink ? "#1A1A2E" : undefined }}>
          {item.name}
        </div>
        <div className="menu-desc">{item.description || "Premium quality item prepared with care."}</div>
        <div className="menu-footer">
          <span style={{ fontSize: 15, fontWeight: 700, color: isFree ? "#16A34A" : "#0B74D4" }}>
            {isFree ? "Free" : `₹${Number(item.price).toFixed(0)}`}
          </span>
          {qty > 0 ? (
            <div className="qty-ctrl">
              <button className="qty-btn qty-btn-el" onClick={() => onRemove(item.id)}>−</button>
              <span className="qty-num">{qty}</span>
              <button className="qty-btn qty-btn-el" onClick={() => onAdd(item)}>+</button>
            </div>
          ) : (
            <button
  className="add-btn add-btn-el"
  onClick={() => onAdd(item)}
>
  + Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Cart Sheet ────────────────────────────────────────────────────────────────
function CartSheet({
  cartItems, cartCount, cartTotal, placing,
  onRemoveOne, onAddOne, onPlace, onClose,
  roomsList, roomNumber, setRoomNumber,
  guestName, setGuestName, guestPhone, setGuestPhone,
}: {
  cartItems: CartItem[]; cartCount: number; cartTotal: number; placing: boolean;
  onRemoveOne: (id: number) => void; onAddOne: (item: CartItem) => void;
  onPlace: () => void; onClose: () => void;
  roomsList: { id: number; roomNumber: string }[];
  roomNumber: string; setRoomNumber: (v: string) => void;
  guestName: string; setGuestName: (v: string) => void;
  guestPhone: string; setGuestPhone: (v: string) => void;
}) {
  return (
    <div className="cart-sheet-overlay" onClick={onClose}>
      <div className="cart-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="cart-sheet-handle" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E" }}>🛒 Your Request</div>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>{cartCount} {cartCount === 1 ? "item" : "items"}</span>
        </div>

        <div style={{ overflowY: "auto", maxHeight: "40vh", marginBottom: 16 }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#9CA3AF", fontSize: 13 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🍽️</div>
              Cart is empty. Add items from the menu.
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#1A1A2E" }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                    {Number(item.price) === 0 ? "Free" : `₹${Number(item.price).toFixed(0)} each`}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button className="qty-btn qty-btn-el" onClick={() => onRemoveOne(item.id)}>−</button>
                    <span style={{ fontSize: 13, fontWeight: 600, minWidth: 18, textAlign: "center" }}>{item.qty}</span>
                    <button className="qty-btn qty-btn-el" onClick={() => onAddOne(item)}>+</button>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0B74D4", minWidth: 48, textAlign: "right" }}>
                    {Number(item.price) === 0 ? "Free" : `₹${(Number(item.price) * item.qty).toFixed(0)}`}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div style={{ marginBottom: 16, borderBottom: "1px solid #F3F4F6", paddingBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "🔑 Room Number", key: "room",  placeholder: "Select Room",       value: roomNumber, set: setRoomNumber  },
              { label: "👤 Your Name",   key: "name",  placeholder: "e.g. Jane Doe",       value: guestName,  set: setGuestName   },
              { label: "📞 Phone",       key: "phone", placeholder: "e.g. 9876543210",    value: guestPhone, set: setGuestPhone  },
            ].map((f) => (
              <div key={f.key}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#4B5563", display: "block", marginBottom: 6 }}>{f.label}</label>
                {f.key === "room" ? (
                  <select
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 13, fontFamily: "inherit", outline: "none", color: "#1A1A2E", background: "#fff" }}
                  >
                    <option value="">Select Room</option>
                    {roomsList.map((r) => (
                      <option key={r.id} value={r.roomNumber}>
                        Room {r.roomNumber}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.key === "phone" ? "tel" : "text"}
                    placeholder={f.placeholder}
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 13, fontFamily: "inherit", outline: "none", color: "#1A1A2E" }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {cartItems.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "#6B7280" }}>Total</span>
            <strong style={{ fontSize: 19, fontWeight: 700, color: "#0B74D4" }}>₹{cartTotal.toFixed(0)}</strong>
          </div>
        )}

        <button
          className="checkout-btn"
          disabled={cartItems.length === 0 || !roomNumber.trim() || !guestName.trim() || !guestPhone.trim() || placing}
          onClick={onPlace}
          style={{ width: "100%", background: "#0B74D4", border: "none", borderRadius: 12, padding: "14px 0", fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer", marginTop: 8, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          {placing ? (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>Placing Order…</>
          ) : (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Place Order{cartTotal > 0 ? ` · ₹${cartTotal.toFixed(0)}` : ""}</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function ColaGoaApp() {
  const [activeTab,    setActiveTab]    = useState("All");
  const [menu,         setMenu]         = useState<MenuItem[]>([]);
  const [loadingMenu,  setLoadingMenu]  = useState(true);
  const [cart,         setCart]         = useState<Record<number, CartItem>>({});
  const [placing,      setPlacing]      = useState(false);
  const [toast,        setToast]        = useState<{ msg: string; ok: boolean } | null>(null);
  const [cartOpen,     setCartOpen]     = useState(false);
  const [trackerOpen,  setTrackerOpen]  = useState(false);
  const [trackedOrderId, setTrackedOrderId] = useState<string | null>(null);
  const [roomsList,    setRoomsList]    = useState<{ id: number; roomNumber: string }[]>([]);
  const [roomNumber,   setRoomNumber]   = useState("");
  const [guestName,    setGuestName]    = useState("");
  const [guestPhone,   setGuestPhone]   = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch menu + rooms on mount
  useEffect(() => {
    fetch("/api/admin/items")
      .then((r) => r.json())
      .then((data: MenuItem[]) => {
        setMenu(data.filter((i) => i.isAvailable));
        setLoadingMenu(false);
      })
      .catch(() => setLoadingMenu(false));

    fetch("/api/rooms")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setRoomsList(data); })
      .catch(() => {});
  }, []);

  // Filter by active tab
  const filtered = activeTab === "All"
    ? menu
    : menu.filter((item) => {
        const cats = item.categories?.length ? item.categories : item.category ? [item.category] : [];
        return cats.includes(activeTab);
      });

  // Group filtered items: drinks section after food/services
  const foodItems    = filtered.filter((i) => !getItemMeta(i).isDrink);
  const drinkItems   = filtered.filter((i) => getItemMeta(i).isDrink);

  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cartItems.reduce((s, i) => s + Number(i.price) * i.qty, 0);

  const addItem = (item: MenuItem) => {
    setCart((prev) => ({ ...prev, [item.id]: { ...item, qty: (prev[item.id]?.qty || 0) + 1 } }));
    showToast(`${item.name} added!`, true);
  };

  const removeItem = (id: number) => {
    setCart((prev) => {
      const cur = prev[id];
      if (!cur) return prev;
      if (cur.qty <= 1) { const n = { ...prev }; delete n[id]; return n; }
      return { ...prev, [id]: { ...cur, qty: cur.qty - 1 } };
    });
  };

  const placeOrder = async () => {
    if (!cartItems.length || !roomNumber.trim() || !guestName.trim() || !guestPhone.trim()) {
      showToast("Please fill in room, name and phone.", false);
      return;
    }
    const cleanPhone = guestPhone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      showToast("Phone number must be exactly 10 digits.", false);
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
          totalAmount: cartTotal,
          roomNumber: roomNumber.trim(),
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
          bookingId: null,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const newOrderId = data.order?.id;

      showToast("Order placed! Track it below 🎉", true);
      setCart({});
      setCartOpen(false);

      // Open tracker immediately with the new order
      if (newOrderId) {
        setTrackedOrderId(newOrderId);
        setTrackerOpen(true);
      }
    } catch {
      showToast("Failed to place order. Please try again.", false);
    } finally {
      setPlacing(false);
    }
  };

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  // How many distinct tabs actually have items
  const tabsWithItems = CATEGORY_TABS.filter((tab) => {
    if (tab.key === "All") return true;
    return menu.some((item) => {
      const cats = item.categories?.length ? item.categories : item.category ? [item.category] : [];
      return cats.includes(tab.key);
    });
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }

        .page {
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
          background: #F5F6FA;
          min-height: 100vh;
          color: #1A1A2E;
        }

        /* NAV */
        .nav {
          background: #fff; border-bottom: 1px solid #E8ECF0;
          padding: 0 16px; display: flex; align-items: center;
          justify-content: space-between; height: 56px;
          position: sticky; top: 0; z-index: 100;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .logo-wrap { display: flex; align-items: center; gap: 8px; }
        .logo-box {
          width: 30px; height: 30px; background: #0B74D4; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .logo-text { font-size: 15px; font-weight: 700; color: #0B74D4; letter-spacing: -0.3px; }

        /* CART FAB */
        .cart-fab {
          position: fixed; bottom: 20px; right: 16px;
          background: #0B74D4; color: #fff; border: none; border-radius: 50px;
          padding: 12px 20px; font-size: 13px; font-weight: 600; font-family: inherit;
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          box-shadow: 0 6px 24px rgba(11,116,212,0.35); z-index: 90;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .cart-fab:active { transform: scale(0.96); }
        .cart-fab-badge {
          background: #fff; color: #0B74D4; border-radius: 50%;
          width: 20px; height: 20px; font-size: 11px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }

        /* HERO BANNER */
        .hero {
          margin: 12px 16px; border-radius: 16px; overflow: hidden;
          position: relative; color: #fff;
          background: linear-gradient(135deg, #0B2A4A 0%, #0B74D4 100%);
          padding: 20px;
        }
        .hero-bg-circle  { position: absolute; right: -40px; top: -40px;   width: 180px; height: 180px; border-radius: 50%; background: rgba(255,255,255,0.06); pointer-events: none; }
        .hero-bg-circle2 { position: absolute; right: 60px; bottom: -60px; width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.04); pointer-events: none; }
        .hero-badge {
          display: inline-block; background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.35); border-radius: 20px;
          padding: 2px 10px; font-size: 10px; font-weight: 600; letter-spacing: 0.07em;
          margin-bottom: 6px; color: #fff;
        }
        .hero-title { font-size: 20px; font-weight: 800; line-height: 1.2; margin-bottom: 4px; }
        .hero-desc  { font-size: 11px; color: rgba(255,255,255,0.8); line-height: 1.6; max-width: 210px; margin-bottom: 12px; }
        .hero-stats { display: flex; gap: 12px; margin-bottom: 14px; align-items: center; }
        .hero-stat  { display: flex; flex-direction: column; }
        .hero-stat-val { font-size: 13px; font-weight: 700; }
        .hero-stat-lbl { font-size: 9px; color: rgba(255,255,255,0.6); letter-spacing: 0.05em; }
        .hero-stat-div { width: 1px; height: 28px; background: rgba(255,255,255,0.2); }
        .hero-right {
          position: absolute; right: 20px; top: 50%; transform: translateY(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 6px;
        }
        .hero-emoji { font-size: 52px; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3)); }
        .hero-open-tag {
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25);
          border-radius: 20px; padding: 2px 8px; font-size: 9px;
          color: rgba(255,255,255,0.9); font-weight: 600; white-space: nowrap;
        }
        .hero-track-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.35);
          border-radius: 9px; padding: 7px 14px; font-size: 11px; font-weight: 600;
          color: #fff; cursor: pointer; font-family: inherit; transition: background 0.2s;
        }
        .hero-track-btn:hover { background: rgba(255,255,255,0.25); }
        .hero-track-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* PAGE CONTENT */
        .page-content { padding: 0 16px 100px; }

        /* STATUS STRIP */
        .status-strip {
          background: #fff; border-radius: 10px; border: 1px solid #E8ECF0;
          padding: 10px 12px; display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 16px;
        }
        .strip-item { text-align: center; flex: 1; }
        .strip-label { font-size: 8px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px; }
        .strip-value { font-size: 11px; font-weight: 600; color: #1A1A2E; }
        .strip-div { width: 1px; height: 28px; background: #E5E7EB; }

        /* CATEGORY TABS */
        .tab-row {
          display: flex; gap: 8px; overflow-x: auto; overflow-y: visible;
          scrollbar-width: none; padding-bottom: 6px;
          -webkit-overflow-scrolling: touch; margin-bottom: 14px;
        }
        .tab-row::-webkit-scrollbar { display: none; }
        .tab-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 14px; border-radius: 20px; border: 1px solid;
          font-family: inherit; font-size: 12px; cursor: pointer;
          white-space: nowrap; flex-shrink: 0; transition: all 0.15s;
        }

        /* SECTION TITLE */
        .section-title-row {
          display: flex; align-items: center; gap: 10px;
          margin: 18px 0 12px;
        }
        .section-title-line { flex: 1; height: 1px; background: #E8ECF0; }
        .section-title-text { font-size: 11px; font-weight: 700; color: #9CA3AF; letter-spacing: 0.1em; text-transform: uppercase; white-space: nowrap; }

        /* MENU GRID */
        .menu-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }

        /* MENU CARD */
        .menu-card { background: #fff; border-radius: 14px; overflow: hidden; transition: box-shadow 0.2s, transform 0.2s; }
        .menu-card-img { height: 90px; display: flex; align-items: center; justify-content: center; font-size: 32px; position: relative; }
        .menu-body  { padding: 10px 10px 8px; }
        .menu-name  { font-size: 12px; font-weight: 600; color: #1A1A2E; margin-bottom: 3px; line-height: 1.3; }
        .menu-desc  { font-size: 10px; color: #9CA3AF; line-height: 1.5; margin-bottom: 8px; min-height: 28px; }
        .menu-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px; }
        .add-btn {
          background: #EBF4FD; border: 1px solid #C2DFF9; border-radius: 7px;
          padding: 5px 10px; font-size: 10px; font-weight: 600; color: #0B74D4;
          cursor: pointer; display: flex; align-items: center; gap: 3px; font-family: inherit;
        }
        .add-btn-el:hover { background: #0B74D4 !important; color: #fff !important; border-color: #0B74D4 !important; }
        .qty-ctrl  { display: flex; align-items: center; gap: 5px; }
        .qty-btn   { width: 26px; height: 26px; border-radius: 7px; border: 1px solid #E5E7EB; background: #fff; color: #0B74D4; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; font-family: inherit; }
        .qty-btn-el:hover { background: #EBF4FD !important; }
        .qty-num   { font-size: 13px; font-weight: 600; min-width: 18px; text-align: center; }

        /* SIDEBAR (desktop) */
        .layout  { display: block; }
        .sidebar { display: none; }
        .side-card { background: #fff; border-radius: 14px; border: 1px solid #E8ECF0; padding: 16px; margin-bottom: 14px; }
        .side-card-title { font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }

        /* CART SHEET */
        .cart-sheet-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.45);
          z-index: 200; display: flex; align-items: flex-end;
          animation: fadeIn 0.2s ease;
        }
        .cart-sheet {
          background: #fff; width: 100%; border-radius: 20px 20px 0 0;
          padding: 20px 20px 36px; max-height: 85vh;
          display: flex; flex-direction: column; animation: slideUp 0.25s ease;
        }
        .cart-sheet-handle { width: 36px; height: 4px; background: #E5E7EB; border-radius: 2px; margin: 0 auto 16px; flex-shrink: 0; }

        /* EMPTY STATE */
        .empty-state { background: #fff; border-radius: 14px; border: 1px solid #E8ECF0; padding: 48px 24px; text-align: center; color: #9CA3AF; }

        /* TOAST */
        .toast {
          position: fixed; bottom: 88px; left: 50%; transform: translateX(-50%);
          background: #1A1A2E; color: #fff; border-radius: 10px;
          padding: 10px 18px; font-size: 13px; font-weight: 500;
          display: flex; align-items: center; gap: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 999;
          white-space: nowrap; animation: slideUp 0.25s ease;
        }

        /* CHECKOUT */
        .checkout-btn { transition: background 0.2s; }
        .checkout-btn:hover:not(:disabled) { background: #085AA8 !important; }
        .checkout-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* FOOTER */
        .footer { background: #fff; border-top: 1px solid #E8ECF0; padding: 24px 16px; margin-top: 8px; }
        .footer-bottom { background: #F9FAFB; border-top: 1px solid #E8ECF0; padding: 12px 16px; font-size: 10px; color: #9CA3AF; }

        @keyframes pulse-dot  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.2)} }
        @keyframes slideUp    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn     { from{opacity:0} to{opacity:1} }
        @keyframes spin       { to { transform: rotate(360deg); } }
        @keyframes progressPulse {
          0%   { width: 20%; }
          50%  { width: 80%; }
          100% { width: 20%; }
        }

        @media (min-width: 640px) {
          .nav { padding: 0 24px; }
          .hero { margin: 14px 20px; padding: 22px 24px; }
          .hero-title { font-size: 22px; }
          .hero-emoji { font-size: 62px; }
          .page-content { padding: 0 20px 110px; }
          .menu-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
          .menu-card-img { height: 100px; font-size: 36px; }
        }

        @media (min-width: 1024px) {
          .nav { padding: 0 28px; }
          .hero { margin: 16px 24px; padding: 28px 32px; }
          .hero-title { font-size: 26px; }
          .page-content { padding: 0 24px 32px; }
          .layout {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 16px; align-items: start;
          }
          .sidebar {
            display: flex; flex-direction: column; gap: 14px;
            position: sticky; top: 76px;
          }
          .cart-fab { display: none !important; }
          .menu-grid { grid-template-columns: repeat(3, 1fr); }
          .menu-card-img { height: 110px; font-size: 38px; }
          .menu-name { font-size: 13px; }
          .menu-desc { font-size: 11px; }
          .toast { bottom: 24px; left: auto; right: 24px; transform: none; }
          .footer { padding: 28px 40px; }
          .footer-bottom { padding: 12px 40px; font-size: 11px; }
        }

        @media (min-width: 1280px) {
          .layout { grid-template-columns: 1fr 320px; }
          .menu-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      <div className="page">

        {/* ─── NAV ─── */}
        <nav className="nav">
          <div className="logo-wrap">
            <div className="logo-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="logo-text">Cola Goa</span>
          </div>

          {/* Track order button in nav (shows when there's a tracked order) */}
          {trackedOrderId && (
            <button
              onClick={() => setTrackerOpen(true)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "#F0FDF4", border: "1px solid #BBF7D0",
                borderRadius: 20, padding: "5px 12px",
                fontSize: 11, fontWeight: 600, color: "#16A34A",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A", animation: "pulse-dot 1.5s infinite" }} />
              Track Order
            </button>
          )}
        </nav>

        {/* ─── HERO BANNER ─── */}
        <div className="hero">
          <div className="hero-bg-circle" />
          <div className="hero-bg-circle2" />

          <div style={{ position: "relative", zIndex: 1, paddingRight: 80 }}>
            <div className="hero-badge">COLA BEACH · SOUTH GOA</div>
            <div className="hero-title">In-Room<br />Concierge</div>
            <div className="hero-desc">
              Food, drinks, housekeeping & wellness — delivered to your room, all in one place.
            </div>

            {/* Track order CTA — appears after an order is placed */}
            {trackedOrderId ? (
              <button className="hero-track-btn" onClick={() => setTrackerOpen(true)}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ADE80", animation: "pulse-dot 1.5s infinite" }} />
                Track My Order
              </button>
            ) : (
              <button className="hero-track-btn" disabled style={{ opacity: 0.5, cursor: "default" }}>
                🕐 Place an order to track it
              </button>
            )}
          </div>

          <div className="hero-right">
            <div className="hero-emoji">🛎️</div>
            <div className="hero-open-tag">Kitchen Open ●</div>
          </div>
        </div>

        {/* ─── PAGE CONTENT ─── */}
        <div className="page-content">
          <div className="layout">

            {/* LEFT / MAIN COLUMN */}
            <div>
              {/* Status strip */}
              <div className="status-strip">
                <div className="strip-item">
                  <div className="strip-label">Delivery Time</div>
                  <div className="strip-value">25–35 mins</div>
                </div>
                <div className="strip-div" />
                <div className="strip-item">
                  <div className="strip-label">Kitchen</div>
                  <div className="strip-value" style={{ color: "#16A34A" }}>● Active</div>
                </div>
                <div className="strip-div" />
                <div className="strip-item">
                  <div className="strip-label">Front Desk</div>
                  <div className="strip-value">Ext. 009</div>
                </div>
              </div>

              {/* Section heading */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>Digital Menu</div>
                {loadingMenu && <span style={{ fontSize: 12, color: "#9CA3AF" }}>Loading…</span>}
                {!loadingMenu && <span style={{ fontSize: 11, color: "#9CA3AF" }}>{menu.length} items available</span>}
              </div>

              {/* Category tab pills — only show tabs that have items */}
              <div className="tab-row">
                {tabsWithItems.map((tab) => (
                  <button
                    key={tab.key}
                    className="tab-pill"
                    style={{
                      fontWeight: activeTab === tab.key ? 600 : 400,
                      color: activeTab === tab.key ? "#0B74D4" : "#6B7280",
                      background: activeTab === tab.key ? "#EBF4FD" : "#fff",
                      borderColor: activeTab === tab.key ? "#0B74D4" : "#E5E7EB",
                    }}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    <span>{tab.emoji}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Menu content */}
              {loadingMenu ? (
                <div style={{ padding: "48px 0", textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
                  Fetching menu from kitchen…
                </div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🍽️</div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#1A1A2E", marginBottom: 4 }}>No items in this category</div>
                  <div style={{ fontSize: 12 }}>Try a different filter above.</div>
                </div>
              ) : (
                <>
                  {/* Food items */}
                  {foodItems.length > 0 && (
                    <>
                      {drinkItems.length > 0 && (
                        <div className="section-title-row">
                          <div className="section-title-line" />
                          <span className="section-title-text">🍽️ Food & Services</span>
                          <div className="section-title-line" />
                        </div>
                      )}
                      <div className="menu-grid">
                        {foodItems.map((item) => (
                          <MenuCard key={item.id} item={item} qty={cart[item.id]?.qty || 0} onAdd={addItem} onRemove={removeItem} />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Drinks section — visually distinct */}
                  {drinkItems.length > 0 && (
                    <>
                      <div className="section-title-row">
                        <div className="section-title-line" />
                        <span className="section-title-text" style={{ color: "#C9A84C" }}>🍸 Bar & Beverages</span>
                        <div className="section-title-line" />
                      </div>
                      
<div className="menu-grid">
  {drinkItems.map((item) => (
    <MenuCard key={item.id} item={item} qty={cart[item.id]?.qty || 0} onAdd={addItem} onRemove={removeItem} />
  ))}
</div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* RIGHT SIDEBAR — desktop only */}
            <div className="sidebar">
              {/* CART */}
              <div className="side-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div className="side-card-title" style={{ marginBottom: 0 }}>🛒 Your Request</div>
                  <span style={{ fontSize: 11, color: "#9CA3AF" }}>{cartCount} {cartCount === 1 ? "item" : "items"}</span>
                </div>

                {cartItems.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px 0", color: "#9CA3AF", fontSize: 12 }}>
                    <div style={{ fontSize: 30, marginBottom: 8 }}>🍽️</div>
                    Your cart is empty.<br />Start adding items.
                  </div>
                ) : (
                  <>
                    {cartItems.map((item) => (
                      <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F3F4F6" }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1A2E" }}>{item.name}</div>
                          <div style={{ fontSize: 10, color: "#9CA3AF" }}>×{item.qty}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button className="qty-btn qty-btn-el" style={{ width: 22, height: 22, fontSize: 13 }} onClick={() => removeItem(item.id)}>−</button>
                          <button className="qty-btn qty-btn-el" style={{ width: 22, height: 22, fontSize: 13 }} onClick={() => addItem(item)}>+</button>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#0B74D4", minWidth: 42, textAlign: "right" }}>
                            {Number(item.price) === 0 ? "Free" : `₹${(Number(item.price) * item.qty).toFixed(0)}`}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Inputs */}
                    <div style={{ margin: "12px 0", display: "flex", flexDirection: "column", gap: 10 }}>
                      {[
                        { label: "🔑 Room Number", key: "room",  placeholder: "e.g. 104",      type: "text", value: roomNumber, set: setRoomNumber },
                        { label: "👤 Your Name",   key: "name",  placeholder: "e.g. Jane Doe", type: "text", value: guestName,  set: setGuestName  },
                        { label: "📞 Phone",       key: "phone", placeholder: "+91 98765…",    type: "tel",  value: guestPhone, set: setGuestPhone },
                      ].map((f) => (
                        <div key={f.key}>
                          <label style={{ fontSize: 10, fontWeight: 700, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 5 }}>{f.label}</label>
                          <input
                            type={f.type}
                            list={f.key === "room" ? "rooms-list-desktop" : undefined}
                            placeholder={f.placeholder}
                            value={f.value}
                            onChange={(e) => f.set(e.target.value)}
                            style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 12, fontFamily: "inherit", outline: "none", color: "#1A1A2E" }}
                          />
                          {f.key === "room" && (
                            <datalist id="rooms-list-desktop">
                              {roomsList.map((r) => <option key={r.id} value={r.roomNumber} />)}
                            </datalist>
                          )}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid #E5E7EB" }}>
                      <span style={{ fontSize: 12, color: "#6B7280" }}>Total</span>
                      <strong style={{ fontSize: 17, fontWeight: 700, color: "#0B74D4" }}>₹{cartTotal.toFixed(0)}</strong>
                    </div>
                  </>
                )}

                <button
                  className="checkout-btn"
                  disabled={cartItems.length === 0 || !roomNumber.trim() || !guestName.trim() || !guestPhone.trim() || placing}
                  onClick={placeOrder}
                  style={{ width: "100%", background: "#0B74D4", border: "none", borderRadius: 9, padding: "11px 0", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", marginTop: 12, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  {placing ? (
                    <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>Placing Order…</>
                  ) : (
                    <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>Place Order{cartTotal > 0 ? ` · ₹${cartTotal.toFixed(0)}` : ""}</>
                  )}
                </button>
              </div>

              {/* LIVE ORDER TRACKER (sidebar) */}
              <div className="side-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div className="side-card-title" style={{ marginBottom: 0 }}>🕐 Order Tracker</div>
                  {trackedOrderId && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 20, padding: "2px 8px", fontSize: 10, color: "#16A34A", fontWeight: 600 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A", animation: "pulse-dot 1.5s infinite" }} />
                      Live
                    </div>
                  )}
                </div>

                {!trackedOrderId ? (
                  <div style={{ textAlign: "center", padding: "16px 0", color: "#9CA3AF", fontSize: 12 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
                    Place an order to track it here in real-time.
                  </div>
                ) : (
                  <SidebarTracker orderId={trackedOrderId} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── MOBILE CART FAB ─── */}
        <button className="cart-fab" onClick={() => setCartOpen(true)}>
          🛒
          <span>View Order</span>
          {cartCount > 0 && <span className="cart-fab-badge">{cartCount}</span>}
          {cartTotal > 0 && <span style={{ marginLeft: 2, fontSize: 12, fontWeight: 700 }}>· ₹{cartTotal.toFixed(0)}</span>}
        </button>

        {/* ─── MOBILE CART SHEET ─── */}
        {cartOpen && (
          <CartSheet
            cartItems={cartItems} cartCount={cartCount} cartTotal={cartTotal} placing={placing}
            onRemoveOne={removeItem} onAddOne={addItem} onPlace={placeOrder} onClose={() => setCartOpen(false)}
            roomsList={roomsList}
            roomNumber={roomNumber} setRoomNumber={setRoomNumber}
            guestName={guestName} setGuestName={setGuestName}
            guestPhone={guestPhone} setGuestPhone={setGuestPhone}
          />
        )}

        {/* ─── ORDER TRACKER SHEET (mobile + opens after place order) ─── */}
        {trackerOpen && trackedOrderId && (
          <OrderTracker orderId={trackedOrderId} onClose={() => setTrackerOpen(false)} />
        )}

        {/* ─── TOAST ─── */}
        {toast && (
          <div className="toast">
            <span style={{ color: toast.ok ? "#4ADE80" : "#F87171" }}>{toast.ok ? "✓" : "✗"}</span>
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}

// ── Sidebar Tracker (inline, no modal) ───────────────────────────────────────
function SidebarTracker({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (res.ok) { const d = await res.json(); setOrder(d.order ?? d); }
    } catch {}
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
    const t = setInterval(fetchOrder, 15_000);
    return () => clearInterval(t);
  }, [fetchOrder]);

  if (!order) return (
    <div style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", padding: "12px 0" }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite", display: "inline-block" }}><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
      {" "}Loading…
    </div>
  );

  const steps = [
    { label: "Received",  status: ["accepted","completed"].includes(order.status) ? "done" : order.status === "pending" ? "active" : "pending" },
    { label: "Preparing", status: order.status === "pending" ? "pending" : order.status === "accepted" ? "active" : order.status === "completed" ? "done" : "pending" },
    { label: "Delivered", status: order.status === "completed" ? "done" : "pending" },
  ] as const;

  return (
    <div>
      <div style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 12 }}>
        #{orderId.slice(0, 8).toUpperCase()} · ₹{order.totalAmount}
      </div>
      {steps.map((step, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
            <div style={{
              width: 18, height: 18, borderRadius: "50%",
              border: `2px solid ${step.status === "done" ? "#16A34A" : step.status === "active" ? "#F59E0B" : "#E5E7EB"}`,
              background: step.status === "done" ? "#16A34A" : step.status === "active" ? "#F59E0B" : "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8,
            }}>
              {step.status === "done" && <span style={{ color: "#fff", fontWeight: 800 }}>✓</span>}
              {step.status === "active" && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
            </div>
            {i < 2 && <div style={{ width: 2, height: 18, background: step.status === "done" ? "#16A34A" : "#E5E7EB", borderRadius: 1, margin: "2px 0" }} />}
          </div>
          <div style={{ paddingBottom: i < 2 ? 6 : 0, paddingTop: 1 }}>
            <div style={{ fontSize: 12, fontWeight: step.status === "active" ? 700 : 500, color: step.status === "pending" ? "#9CA3AF" : "#1A1A2E" }}>
              {step.label}
            </div>
          </div>
        </div>
      ))}
      {order.status === "rejected" && (
        <div style={{ marginTop: 10, background: "#FEE2E2", borderRadius: 8, padding: "8px 10px", fontSize: 11, color: "#991B1B" }}>
          ⚠️ Rejected — call Ext. 009
        </div>
      )}
      <div style={{ fontSize: 9, color: "#D1D5DB", marginTop: 10 }}>Refreshes every 15s</div>
    </div>
  );
}