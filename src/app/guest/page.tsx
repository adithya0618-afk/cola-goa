"use client";
import { useState, useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category: string | null;
  type: string | null;
  isAvailable: boolean | null;
}

interface CartItem extends MenuItem {
  qty: number;
}

// ── Config ────────────────────────────────────────────────────────────────────
const CATEGORIES = ["All", "Breakfast", "Lunch", "Snacks", "Dinner", "Housekeeping", "Wellness"];

const CATEGORY_META: Record<string, { emoji: string; bg: string }> = {
  "Breakfast":    { emoji: "🥐", bg: "#FFF7EC" },
  "Main Course":  { emoji: "🍽️", bg: "#EAF3FD" },
  "Light Bites":  { emoji: "🥪", bg: "#F0FAF4" },
  "Housekeeping": { emoji: "🛁", bg: "#F0EDFD" },
  "Wellness":     { emoji: "🌿", bg: "#E8FAF0" },
  "Lunch":        { emoji: "🍱", bg: "#FFF7EC" },
  "Dinner":       { emoji: "🍜", bg: "#EAF3FD" },
  "Snacks":       { emoji: "🍿", bg: "#FFF5F0" },
  "Beverages":    { emoji: "☕", bg: "#F5F0FF" },
  "Spa":          { emoji: "💆", bg: "#E8FAF0" },
  "Extras":       { emoji: "✨", bg: "#F0F4FF" },
};

function getMeta(category: string | null) {
  return CATEGORY_META[category ?? ""] ?? { emoji: "🍽️", bg: "#EAF3FD" };
}

function getBadge(item: MenuItem): { label: string; color: string; bg: string } | null {
  if (Number(item.price) === 0)        return { label: "Complimentary", color: "#6A1B9A", bg: "#F3E5F5" };
  if (item.type === "service")         return { label: "Service",        color: "#1565C0", bg: "#E3F2FD" };
  if (item.category === "Breakfast")   return { label: "Vegetarian",     color: "#2E7D32", bg: "#E8F5E9" };
  if (item.category === "Wellness")    return { label: "Healthy",        color: "#1565C0", bg: "#E3F2FD" };
  if (item.category === "Main Course") return { label: "Chef's Pick",    color: "#C62828", bg: "#FFEBEE" };
  return null;
}

// ── Drinks Data ───────────────────────────────────────────────────────────────
const DRINK_CATEGORIES = ["Cocktails", "Mocktails", "Wine & Bubbly", "Spirits", "Wellness"];

const DRINK_BG: Record<string, string> = {
  "Cocktails":    "#FFF7EC",
  "Mocktails":    "#F0FAF4",
  "Wine & Bubbly":"#F5F0FF",
  "Spirits":      "#FFF3E0",
  "Wellness":     "#E8FAF0",
};

interface DrinkItem {
  emoji: string;
  name: string;
  desc: string;
  price: string;
  tags: { l: string; c: string; bg: string }[];
}

const DRINKS: Record<string, DrinkItem[]> = {
  "Cocktails": [
    { emoji: "🍸", name: "Goa Sunset",     desc: "Kokum, vodka, passion fruit, tajin rim",          price: "₹580",  tags: [{ l: "Signature", c: "#6A1B9A", bg: "#F3E5F5" }, { l: "Bestseller", c: "#C62828", bg: "#FFEBEE" }] },
    { emoji: "🥂", name: "Palapa Spritz",  desc: "Aperol, prosecco, blood orange, rosemary",        price: "₹620",  tags: [{ l: "Light",     c: "#1565C0", bg: "#E3F2FD" }] },
    { emoji: "🍹", name: "Coastal Mule",   desc: "Ginger beer, rum, coconut water, lime",           price: "₹540",  tags: [{ l: "Tropical",  c: "#2E7D32", bg: "#E8F5E9" }] },
    { emoji: "🥃", name: "Smoked Negroni", desc: "Campari, gin, vermouth, orange peel smoke",       price: "₹720",  tags: [{ l: "Premium",   c: "#E65100", bg: "#FFF3E0" }] },
  ],
  "Mocktails": [
    { emoji: "🌿", name: "Garden Refresh", desc: "Cucumber, mint, lemon, tonic water",             price: "₹280",  tags: [{ l: "Alcohol-Free", c: "#2E7D32", bg: "#E8F5E9" }] },
    { emoji: "🫐", name: "Berry Bliss",    desc: "Mixed berries, basil, sparkling water",          price: "₹260",  tags: [{ l: "Antioxidant",  c: "#6A1B9A", bg: "#F3E5F5" }] },
    { emoji: "🥭", name: "Alphonso Dream", desc: "Alphonso mango, cardamom, rose, soda",           price: "₹240",  tags: [{ l: "Seasonal",     c: "#C62828", bg: "#FFEBEE" }] },
  ],
  "Wine & Bubbly": [
    { emoji: "🍾", name: "Chandon Brut",        desc: "French method sparkling, crisp & dry",          price: "₹480",  tags: [{ l: "French", c: "#1565C0", bg: "#E3F2FD" }] },
    { emoji: "🍷", name: "Sula Dindori Shiraz", desc: "Full-bodied red, dark fruits, spice finish",    price: "₹420",  tags: [{ l: "Indian", c: "#C62828", bg: "#FFEBEE" }] },
    { emoji: "🥂", name: "Sauvignon Blanc",     desc: "Crisp white, citrus, green apple, mineral",     price: "₹390",  tags: [{ l: "Chilled", c: "#1565C0", bg: "#E3F2FD" }] },
  ],
  "Spirits": [
    { emoji: "🥃", name: "Single Malt Scotch", desc: "18yr Glenfarclas, sherry cask, 30ml serve",  price: "₹980",  tags: [{ l: "Premium", c: "#E65100", bg: "#FFF3E0" }] },
    { emoji: "🫙", name: "Japanese Whisky",    desc: "Nikka From The Barrel, blended malt",         price: "₹1100", tags: [{ l: "Rare",    c: "#6A1B9A", bg: "#F3E5F5" }] },
    { emoji: "🍶", name: "Artisan Gin",         desc: "Stranger & Sons, Indian botanicals, tonic",  price: "₹560",  tags: [{ l: "Craft",   c: "#2E7D32", bg: "#E8F5E9" }] },
  ],
  "Wellness": [
    { emoji: "🌿", name: "Morning Detox",      desc: "Cold-pressed greens, ginger, lemon, aloe",   price: "Complimentary", tags: [{ l: "Healthy", c: "#2E7D32", bg: "#E8F5E9" }] },
    { emoji: "☕", name: "Signature Coffee",   desc: "Single origin cold brew, oat milk",           price: "₹180",          tags: [{ l: "Barista", c: "#E65100", bg: "#FFF3E0" }] },
    { emoji: "🍵", name: "Ceremonial Matcha", desc: "Japanese grade A, oat milk, no sugar",        price: "₹200",          tags: [{ l: "Vegan",   c: "#2E7D32", bg: "#E8F5E9" }] },
  ],
};

// ── TrackingStep ──────────────────────────────────────────────────────────────
function TrackingStep({ label, time, status, showLine }: {
  label: string; time: string;
  status: "done" | "active" | "pending"; showLine: boolean;
}) {
  return (
    <div className="track-step">
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: 20, height: 20, borderRadius: "50%",
          border: `2px solid ${status === "done" ? "#16A34A" : status === "active" ? "#F59E0B" : "#E5E7EB"}`,
          background: status === "done" ? "#16A34A" : status === "active" ? "#F59E0B" : "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {status === "done"   && <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>✓</span>}
          {status === "active" && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />}
        </div>
        {showLine && (
          <div style={{ position: "absolute", top: 22, left: "50%", transform: "translateX(-50%)", width: 1, height: 22, background: "#E5E7EB" }} />
        )}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: status === "active" ? 600 : 500, color: status === "active" ? "#F59E0B" : "#1A1A2E" }}>
          {label}
        </div>
        <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 1 }}>{time}</div>
        {status === "active" && (
          <div style={{ height: 4, borderRadius: 2, background: "#F3F4F6", marginTop: 5, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "60%", borderRadius: 2, background: "#F59E0B" }} />
          </div>
        )}
      </div>
      {status === "active" && (
        <span style={{ fontSize: 10, background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A", borderRadius: 20, padding: "2px 8px", fontWeight: 600, whiteSpace: "nowrap" }}>
          IN PROGRESS
        </span>
      )}
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
  const meta  = getMeta(item.category);
  const badge = getBadge(item);
  const isFree = Number(item.price) === 0;

  return (
    <div
      className="menu-card"
      style={{ boxShadow: hovered ? "0 4px 18px rgba(11,116,212,0.1)" : "none", transform: hovered ? "translateY(-2px)" : "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="menu-card-img" style={{ background: meta.bg }}>
        <span>{meta.emoji}</span>
        {badge && (
          <div style={{ position: "absolute", top: 8, left: 8, padding: "2px 8px", borderRadius: 20, fontSize: 9, fontWeight: 600, color: badge.color, background: badge.bg, letterSpacing: "0.05em" }}>
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
        <div className="menu-name">{item.name}</div>
        <div className="menu-desc">{item.description || "Premium quality item prepared with care."}</div>
        <div className="menu-footer">
          <span style={{ fontSize: 15, fontWeight: 700, color: isFree ? "#16A34A" : "#0B74D4" }}>
            {isFree ? "Free" : `₹${Number(item.price).toFixed(2)}`}
          </span>
          {qty > 0 ? (
            <div className="qty-ctrl">
              <button className="qty-btn qty-btn-el" onClick={() => onRemove(item.id)}>−</button>
              <span className="qty-num">{qty}</span>
              <button className="qty-btn qty-btn-el" onClick={() => onAdd(item)}>+</button>
            </div>
          ) : (
            <button className="add-btn add-btn-el" onClick={() => onAdd(item)}>
              <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── DrinkMenuSheet ────────────────────────────────────────────────────────────
function DrinkMenuSheet({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("Cocktails");
  const drinks = DRINKS[activeTab];

  return (
    <div className="cart-sheet-overlay" onClick={onClose}>
      <div className="cart-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "90vh" }}>
        <div className="cart-sheet-handle" />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#1A1A2E" }}>🍹 Drinks Menu</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>Crafted by our Head Mixologist · Room Delivery</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "#F3F4F6", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 16, color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}
          >
            ✕
          </button>
        </div>

        {/* Category tabs */}
        <div className="filter-row" style={{ marginBottom: 14 }}>
          {DRINK_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className="filter-pill"
              style={{
                fontWeight: activeTab === cat ? 600 : 400,
                color: activeTab === cat ? "#0B74D4" : "#6B7280",
                background: activeTab === cat ? "#EBF4FD" : "#fff",
                borderColor: activeTab === cat ? "#0B74D4" : "#E5E7EB",
              }}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Drinks list */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {drinks.map((d, i) => (
            <div key={i}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 8px", borderRadius: 12 }}>
                {/* Icon */}
                <div style={{ width: 48, height: 48, borderRadius: 12, background: DRINK_BG[activeTab], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                  {d.emoji}
                </div>
                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E" }}>{d.name}</div>
                  <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2, lineHeight: 1.4 }}>{d.desc}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
                    {d.tags.map((t) => (
                      <span key={t.l} style={{ fontSize: 9, padding: "1px 7px", borderRadius: 20, fontWeight: 600, color: t.c, background: t.bg }}>
                        {t.l}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Price + Add */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: d.price === "Complimentary" ? "#16A34A" : "#0B74D4" }}>
                    {d.price}
                  </span>
                  <button className="add-btn add-btn-el">
                    <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> Add
                  </button>
                </div>
              </div>
              {i < drinks.length - 1 && (
                <div style={{ height: 1, background: "#F3F4F6", margin: "0 8px" }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Cart Sheet (Mobile) ───────────────────────────────────────────────────────
function CartSheet({
  cartItems, cartCount, cartTotal, placing, onRemoveOne, onAddOne, onPlace, onClose,
  roomsList, roomNumber, setRoomNumber, guestName, setGuestName, guestPhone, setGuestPhone
}: {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  placing: boolean;
  onRemoveOne: (id: number) => void;
  onAddOne: (item: CartItem) => void;
  onPlace: () => void;
  onClose: () => void;
  roomsList: { id: number; roomNumber: string }[];
  roomNumber: string;
  setRoomNumber: (val: string) => void;
  guestName: string;
  setGuestName: (val: string) => void;
  guestPhone: string;
  setGuestPhone: (val: string) => void;
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
              Cart is empty.<br />Add items from the menu.
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
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#4B5563", display: "block", marginBottom: 6 }}>
                🔑 Enter Room Number
              </label>
              <input
                type="text"
                list="rooms-datalist-mobile"
                placeholder="e.g. 104"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #D1D5DB",
                  background: "#fff",
                  fontSize: 13,
                  fontFamily: "inherit",
                  outline: "none",
                  color: "#1A1A2E"
                }}
              />
              <datalist id="rooms-datalist-mobile">
                {roomsList.map((room) => (
                  <option key={room.id} value={room.roomNumber} />
                ))}
              </datalist>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#4B5563", display: "block", marginBottom: 6 }}>
                👤 Your Name
              </label>
              <input
                type="text"
                placeholder="e.g. Jane Doe"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #D1D5DB",
                  background: "#fff",
                  fontSize: 13,
                  fontFamily: "inherit",
                  outline: "none",
                  color: "#1A1A2E"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#4B5563", display: "block", marginBottom: 6 }}>
                📞 Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #D1D5DB",
                  background: "#fff",
                  fontSize: 13,
                  fontFamily: "inherit",
                  outline: "none",
                  color: "#1A1A2E"
                }}
              />
            </div>
          </div>
        )}

        {cartItems.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, paddingTop: 4, marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: "#6B7280" }}>Total</span>
            <strong style={{ fontSize: 19, fontWeight: 700, color: "#0B74D4" }}>₹{cartTotal.toFixed(0)}</strong>
          </div>
        )}

        <button
          className="checkout-btn"
          disabled={cartItems.length === 0 || !roomNumber.trim() || !guestName.trim() || !guestPhone.trim() || placing}
          onClick={onPlace}
          style={{
            width: "100%", background: "#0B74D4", border: "none", borderRadius: 12,
            padding: "14px 0", fontSize: 14, fontWeight: 600, color: "#fff",
            cursor: "pointer", marginTop: 8, fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          {placing ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}>
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              Placing Order…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Place Order{cartTotal > 0 ? ` · ₹${cartTotal.toFixed(0)}` : ""}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function ColaGoaApp() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [menu,         setMenu]         = useState<MenuItem[]>([]);
  const [loadingMenu,  setLoadingMenu]  = useState(true);
  const [cart,         setCart]         = useState<Record<number, CartItem>>({});
  const [placing,      setPlacing]      = useState(false);
  const [toast,        setToast]        = useState<{ msg: string; ok: boolean } | null>(null);
  const [cartOpen,     setCartOpen]     = useState(false);
  const [trackOpen,    setTrackOpen]    = useState(false);
  const [drinksOpen,   setDrinksOpen]   = useState(false);
  const [roomsList,      setRoomsList]      = useState<{ id: number; roomNumber: string }[]>([]);
  const [roomNumber,     setRoomNumber]     = useState<string>("");
  const [guestName,      setGuestName]      = useState<string>("");
  const [guestPhone,     setGuestPhone]     = useState<string>("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      .then((data) => {
        if (Array.isArray(data)) {
          setRoomsList(data);
        }
      })
      .catch((e) => console.error("Error fetching rooms:", e));
  }, []);

  const filtered  = activeFilter === "All" ? menu : menu.filter((i) => i.category === activeFilter);
  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cartItems.reduce((s, i) => s + Number(i.price) * i.qty, 0);

  const addItem = (item: MenuItem) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: { ...item, qty: (prev[item.id]?.qty || 0) + 1 },
    }));
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
    if (!cartItems.length) return;
    if (!roomNumber.trim()) {
      showToast("Please enter your room number.", false);
      return;
    }
    if (!guestName.trim()) {
      showToast("Please enter your name.", false);
      return;
    }
    if (!guestPhone.trim()) {
      showToast("Please enter your phone number.", false);
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
      showToast("Order placed! Your concierge is on it. 🎉", true);
      setCart({});
      setCartOpen(false);
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { overflow-x: hidden; }

        /* ── Base (Mobile-first) ── */
        .page {
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
          background: #F5F6FA;
          min-height: 100vh;
          color: #1A1A2E;
        }

        /* ── NAV ── */
        .nav {
          background: #FFFFFF;
          border-bottom: 1px solid #E8ECF0;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 56px;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        .logo-wrap { display: flex; align-items: center; gap: 8px; }
        .logo-box {
          width: 30px; height: 30px; background: #0B74D4; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .logo-text { font-size: 15px; font-weight: 700; color: #0B74D4; letter-spacing: -0.3px; }
        .nav-right { display: flex; align-items: center; gap: 10px; }
        .room-badge {
          font-size: 11px; color: #6B7280;
          background: #F3F4F6; border: 1px solid #E5E7EB;
          border-radius: 20px; padding: 3px 10px;
        }
        .avatar-circle {
          width: 32px; height: 32px; border-radius: 50%;
          background: #0B74D4; display: flex;
          align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff; cursor: pointer;
          flex-shrink: 0;
        }

        /* Cart FAB — mobile only */
        .cart-fab {
          position: fixed; bottom: 20px; right: 16px;
          background: #0B74D4; color: #fff;
          border: none; border-radius: 50px;
          padding: 12px 20px; font-size: 13px; font-weight: 600;
          font-family: inherit; cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          box-shadow: 0 6px 24px rgba(11,116,212,0.35);
          z-index: 90;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .cart-fab:active { transform: scale(0.96); }
        .cart-fab-badge {
          background: #fff; color: #0B74D4;
          border-radius: 50%; width: 20px; height: 20px;
          font-size: 11px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }

        /* ── HERO ── */
        .hero {
          margin: 12px 16px;
          border-radius: 16px;
          background: linear-gradient(135deg, #0B2A4A 0%, #0B74D4 100%);
          padding: 20px 20px;
          display: flex; justify-content: space-between; align-items: center;
          overflow: hidden; position: relative; color: #fff;
        }
        .hero-bg-circle  { position: absolute; right: -40px; top: -40px;   width: 180px; height: 180px; border-radius: 50%; background: rgba(255,255,255,0.06); pointer-events: none; }
        .hero-bg-circle2 { position: absolute; right: 60px; bottom: -60px; width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.04); pointer-events: none; }
        .hero-badge {
          display: inline-block;
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.35);
          border-radius: 20px; padding: 2px 10px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.07em;
          margin-bottom: 6px; color: #fff;
        }
        .hero-title { font-size: 20px; font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 4px; }
        .hero-desc  { font-size: 11px; color: rgba(255,255,255,0.8); line-height: 1.6; max-width: 200px; margin-bottom: 12px; }
        .hero-stats { display: flex; gap: 12px; margin-bottom: 14px; align-items: center; }
        .hero-stat  { display: flex; flex-direction: column; }
        .hero-stat-val { font-size: 13px; font-weight: 700; color: #fff; }
        .hero-stat-lbl { font-size: 9px; color: rgba(255,255,255,0.6); letter-spacing: 0.05em; }
        .hero-stat-divider { width: 1px; height: 28px; background: rgba(255,255,255,0.2); }
        .hero-btn {
          background: #fff; color: #0B2A4A;
          border: none; border-radius: 9px;
          padding: 8px 16px; font-size: 11px; font-weight: 700; cursor: pointer;
          font-family: inherit; display: flex; align-items: center; gap: 5px;
          transition: all 0.2s;
        }
        .hero-btn:hover { background: #e8f3fd; transform: translateY(-1px); }
        .hero-right {
          display: flex; flex-direction: column; align-items: center;
          gap: 6px; flex-shrink: 0; position: relative; z-index: 1;
        }
        .hero-glass-wrap { position: relative; }
        .hero-emoji { font-size: 54px; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3)); }
        .hero-glow {
          position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%);
          width: 40px; height: 8px; background: rgba(255,255,255,0.15);
          border-radius: 50%; filter: blur(4px);
        }
        .hero-open-tag {
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25);
          border-radius: 20px; padding: 2px 8px; font-size: 9px;
          color: rgba(255,255,255,0.9); font-weight: 600; white-space: nowrap;
        }

        /* ── MAIN ── */
        .page-content { padding: 0 16px 100px; }

        /* ── STATUS STRIP ── */
        .status-strip {
          background: #fff; border-radius: 10px; border: 1px solid #E8ECF0;
          padding: 10px 12px; display: flex; justify-content: space-between;
          align-items: center; margin-bottom: 16px;
        }
        .strip-item   { text-align: center; flex: 1; }
        .strip-label  { font-size: 8px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2px; }
        .strip-value  { font-size: 11px; font-weight: 600; color: #1A1A2E; }
        .strip-divider { width: 1px; height: 28px; background: #E5E7EB; }

        /* ── SECTION HEADER ── */
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .section-title  { font-size: 16px; font-weight: 700; color: #1A1A2E; }

        /* ── FILTER ROW ── */
        .filter-row {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          gap: 8px;
          margin-bottom: 14px;
          overflow-x: scroll;
          overflow-y: visible;
          padding-bottom: 6px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          width: 100%;
          min-width: 0;
        }
        .filter-row::-webkit-scrollbar { display: none; }
        .filter-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
          padding: 6px 16px;
          font-size: 12px;
          border: 1px solid;
          white-space: nowrap;
          flex-shrink: 0;
          flex-grow: 0;
          min-width: max-content;
        }
        .filter-pill:hover { border-color: #0B74D4 !important; color: #0B74D4 !important; }

        /* ── MENU GRID ── */
        .menu-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        /* ── MENU CARD ── */
        .menu-card {
          background: #fff; border-radius: 14px; border: 1px solid #E8ECF0;
          overflow: hidden; transition: box-shadow 0.2s, transform 0.2s;
        }
        .menu-card-img {
          height: 90px; display: flex; align-items: center;
          justify-content: center; font-size: 32px; position: relative;
        }
        .menu-body   { padding: 10px 10px 8px; }
        .menu-name   { font-size: 12px; font-weight: 600; color: #1A1A2E; margin-bottom: 3px; line-height: 1.3; }
        .menu-desc   { font-size: 10px; color: #9CA3AF; line-height: 1.5; margin-bottom: 8px; min-height: 28px; }
        .menu-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 4px; }
        .add-btn {
          background: #EBF4FD; border: 1px solid #C2DFF9; border-radius: 7px;
          padding: 5px 10px; font-size: 10px; font-weight: 600; color: #0B74D4;
          cursor: pointer; display: flex; align-items: center; gap: 3px; font-family: inherit;
        }
        .add-btn-el:hover { background: #0B74D4 !important; color: #fff !important; border-color: #0B74D4 !important; }
        .qty-ctrl { display: flex; align-items: center; gap: 5px; }
        .qty-btn {
          width: 26px; height: 26px; border-radius: 7px; border: 1px solid #E5E7EB;
          background: #fff; color: #0B74D4; font-size: 15px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-family: inherit;
        }
        .qty-btn-el:hover { background: #EBF4FD !important; }
        .qty-num { font-size: 13px; font-weight: 600; min-width: 18px; text-align: center; }

        /* ── SIDEBAR (desktop only) ── */
        .layout { display: block; }
        .sidebar { display: none; }
        .side-card { background: #fff; border-radius: 14px; border: 1px solid #E8ECF0; padding: 16px; margin-bottom: 14px; }
        .side-card-title { font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
        .live-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: #F0FDF4; border: 1px solid #BBF7D0;
          border-radius: 20px; padding: 2px 8px; font-size: 10px; color: #16A34A; font-weight: 600;
        }

        /* ── TRACK STEP ── */
        .track-step { display: flex; align-items: flex-start; gap: 10px; padding: 6px 0; }

        /* ── TRACKING MODAL (Mobile) ── */
        .track-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4);
          z-index: 200; display: flex; align-items: flex-end;
          animation: fadeIn 0.2s ease;
        }
        .track-modal {
          background: #fff; width: 100%; border-radius: 20px 20px 0 0;
          padding: 20px 20px 36px;
          animation: slideUp 0.25s ease;
        }
        .track-btn {
          background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px;
          padding: 10px 14px; font-size: 12px; font-weight: 600; color: #16A34A;
          cursor: pointer; font-family: inherit;
          display: flex; align-items: center; gap: 6px; width: 100%;
          margin-bottom: 16px;
        }

        /* ── CART SHEET ── */
        .cart-sheet-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.45);
          z-index: 200; display: flex; align-items: flex-end;
          animation: fadeIn 0.2s ease;
        }
        .cart-sheet {
          background: #fff; width: 100%; border-radius: 20px 20px 0 0;
          padding: 20px 20px 36px; max-height: 85vh;
          display: flex; flex-direction: column;
          animation: slideUp 0.25s ease;
        }
        .cart-sheet-handle {
          width: 36px; height: 4px; background: #E5E7EB; border-radius: 2px;
          margin: 0 auto 16px; flex-shrink: 0;
        }

        /* ── PROMO CARD ── */
        .promo-card {
          background: #FFFBEB; border: 1px solid #FDE68A;
          border-radius: 12px; padding: 14px; cursor: pointer;
          margin-top: 16px;
        }

        /* ── FOOTER ── */
        .footer {
          background: #fff; border-top: 1px solid #E8ECF0;
          padding: 24px 16px; display: flex; flex-direction: column; gap: 20px;
          margin-top: 8px;
        }
        .footer-bottom {
          background: #F9FAFB; border-top: 1px solid #E8ECF0;
          padding: 12px 16px; display: flex; flex-direction: column;
          gap: 6px; font-size: 10px; color: #9CA3AF;
        }

        /* ── CHECKOUT BTN ── */
        .checkout-btn { transition: background 0.2s; }
        .checkout-btn:hover:not(:disabled) { background: #085AA8 !important; }
        .checkout-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── EMPTY STATE ── */
        .empty-state {
          background: #fff; border-radius: 14px; border: 1px solid #E8ECF0;
          padding: 48px 24px; text-align: center; color: #9CA3AF;
        }

        /* ── TOAST ── */
        .toast {
          position: fixed; bottom: 88px; left: 50%; transform: translateX(-50%);
          background: #1A1A2E; color: #fff; border-radius: 10px;
          padding: 10px 18px; font-size: 13px; font-weight: 500;
          display: flex; align-items: center; gap: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 999;
          white-space: nowrap;
          animation: slideUp 0.25s ease;
        }

        /* ── ANIMATIONS ── */
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.2)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes spin    { to { transform: rotate(360deg); } }

        /* ── TABLET ≥ 640px ── */
        @media (min-width: 640px) {
          .nav { padding: 0 24px; height: 58px; }
          .hero { margin: 14px 20px; padding: 22px 24px; }
          .hero-title { font-size: 22px; }
          .hero-desc  { max-width: 260px; }
          .hero-emoji { font-size: 62px; }
          .page-content { padding: 0 20px 110px; }
          .menu-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
          .menu-card-img { height: 100px; font-size: 36px; }
          .section-title { font-size: 17px; }
          .strip-label { font-size: 9px; }
          .strip-value { font-size: 12px; }
          .toast { bottom: 96px; }
        }

        /* ── DESKTOP ≥ 1024px ── */
        @media (min-width: 1024px) {
          .nav { padding: 0 28px; height: 60px; }
          .logo-text { font-size: 17px; }
          .hero { margin: 16px 24px; padding: 28px 32px; }
          .hero-title { font-size: 28px; }
          .hero-desc  { font-size: 12px; max-width: 320px; }
          .hero-emoji { font-size: 72px; }
          .page-content { padding: 0 24px 32px; }

          .layout {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 16px;
            align-items: start;
          }
          .sidebar {
            display: flex;
            flex-direction: column;
            gap: 14px;
            position: sticky;
            top: 80px;
          }

          .cart-fab  { display: none !important; }
          .track-btn { display: none !important; }

          .menu-grid { grid-template-columns: repeat(3, 1fr); }
          .menu-card-img { height: 110px; font-size: 38px; }
          .menu-name { font-size: 13px; }
          .menu-desc { font-size: 11px; }
          .section-title { font-size: 18px; }

          .footer {
            padding: 28px 40px;
            flex-direction: row;
            gap: 32px;
          }
          .footer > div:first-child { flex: 2; }
          .footer > div:not(:first-child) { flex: 1; }
          .footer-bottom {
            padding: 12px 40px;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
          }

          .toast { bottom: 24px; left: auto; right: 24px; transform: none; }
        }

        /* ── LARGE DESKTOP ≥ 1280px ── */
        @media (min-width: 1280px) {
          .layout { grid-template-columns: 1fr 320px; }
          .menu-grid { grid-template-columns: repeat(4, 1fr); }
        }

        /* ── Utility hover classes ── */
        .nav-tab-btn { background: none; cursor: pointer; transition: all 0.15s; font-family: inherit; }
        .nav-tab-btn:hover { color: #0B74D4 !important; }
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
        </nav>

        {/* ─── HERO (Premium Drinks) ─── */}
        <div className="hero">
          <div className="hero-bg-circle" />
          <div className="hero-bg-circle2" />

          {/* Left content */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="hero-badge">SIGNATURE COLLECTION</div>
            <div className="hero-title">Premium Bar &<br />Beverages</div>
            <div className="hero-desc">Handcrafted cocktails, rare spirits & artisan blends by our head mixologist.</div>

            {/* Stats row */}
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-val">40+</span>
                <span className="hero-stat-lbl">DRINKS</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-val">24/7</span>
                <span className="hero-stat-lbl">SERVICE</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-val">15 min</span>
                <span className="hero-stat-lbl">DELIVERY</span>
              </div>
            </div>

            <button className="hero-btn" onClick={() => setDrinksOpen(true)}>
              🍹 View Drinks Menu
            </button>
          </div>

          {/* Right — glass + status */}
          <div className="hero-right">
            <div className="hero-glass-wrap">
              <div className="hero-emoji">🍸</div>
              <div className="hero-glow" />
            </div>
            <div className="hero-open-tag">Bar is Open ●</div>
          </div>
        </div>

        {/* ─── CONTENT ─── */}
        <div className="page-content">
          <div className="layout">

            {/* LEFT / MAIN COLUMN */}
            <div>
              {/* Status strip */}
              <div className="status-strip">
                <div className="strip-item">
                  <div className="strip-label">Estimated Time</div>
                  <div className="strip-value">25–35 mins</div>
                </div>
                <div className="strip-divider" />
                <div className="strip-item">
                  <div className="strip-label">Kitchen</div>
                  <div className="strip-value" style={{ color: "#16A34A" }}>● Active</div>
                </div>
                <div className="strip-divider" />
                <div className="strip-item">
                  <div className="strip-label">Assistance</div>
                  <div className="strip-value">Ext. 009</div>
                </div>
              </div>

              {/* Tracking button (mobile only) */}
              <button className="track-btn" onClick={() => setTrackOpen(true)}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#16A34A", animation: "pulse-dot 1.5s infinite" }} />
                🕐 Track Live Order · #GR-9921
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#9CA3AF" }}>›</span>
              </button>

              {/* Section header */}
              <div className="section-header">
                <div className="section-title">Digital Concierge</div>
                {loadingMenu && <span style={{ fontSize: 12, color: "#9CA3AF" }}>Loading…</span>}
              </div>

              {/* Filters */}
              <div className="filter-row">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className="filter-pill"
                    style={{
                      fontWeight: activeFilter === cat ? 600 : 400,
                      color: activeFilter === cat ? "#0B74D4" : "#6B7280",
                      background: activeFilter === cat ? "#EBF4FD" : "#fff",
                      borderColor: activeFilter === cat ? "#0B74D4" : "#E5E7EB",
                    }}
                    onClick={() => setActiveFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Menu grid */}
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
                <div className="menu-grid">
                  {filtered.map((item) => (
                    <MenuCard key={item.id} item={item} qty={cart[item.id]?.qty || 0} onAdd={addItem} onRemove={removeItem} />
                  ))}
                </div>
              )}

              {/* Promo card */}
              <div className="promo-card" onClick={() => setDrinksOpen(true)}>
                <div style={{ fontSize: 18, marginBottom: 6 }}>🍸</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E", marginBottom: 3 }}>Thirsty?</div>
                <div style={{ fontSize: 11, color: "#B45309", lineHeight: 1.5 }}>Our mixologists are crafting signature cocktails & mocktails for in-room delivery.</div>
                <div style={{ fontSize: 11, color: "#0B74D4", fontWeight: 600, marginTop: 8 }}>Open Drinks Menu →</div>
              </div>
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
                    Your cart is empty.<br />Start adding items from the menu.
                  </div>
                ) : (
                  <>
                    {cartItems.map((item) => (
                      <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F3F4F6" }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: "#1A1A2E" }}>{item.name}</div>
                          <div style={{ fontSize: 10, color: "#9CA3AF" }}>×{item.qty}</div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0B74D4" }}>
                          {Number(item.price) === 0 ? "Free" : `₹${(Number(item.price) * item.qty).toFixed(0)}`}
                        </div>
                      </div>
                    ))}

                    <div style={{ margin: "14px 0", paddingTop: 10, borderTop: "1px solid #F3F4F6", display: "flex", flexDirection: "column", gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 10, fontWeight: 700, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                          🔑 Room Number
                        </label>
                        <input
                          type="text"
                          list="rooms-datalist-desktop"
                          placeholder="e.g. 104"
                          value={roomNumber}
                          onChange={(e) => setRoomNumber(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: 8,
                            border: "1px solid #D1D5DB",
                            background: "#fff",
                            fontSize: 12,
                            fontFamily: "inherit",
                            outline: "none",
                            color: "#1A1A2E"
                          }}
                        />
                        <datalist id="rooms-datalist-desktop">
                          {roomsList.map((room) => (
                            <option key={room.id} value={room.roomNumber} />
                          ))}
                        </datalist>
                      </div>

                      <div>
                        <label style={{ fontSize: 10, fontWeight: 700, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                          👤 Your Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Jane Doe"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: 8,
                            border: "1px solid #D1D5DB",
                            background: "#fff",
                            fontSize: 12,
                            fontFamily: "inherit",
                            outline: "none",
                            color: "#1A1A2E"
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 10, fontWeight: 700, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 6 }}>
                          📞 Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. +91 98765 43210"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: 8,
                            border: "1px solid #D1D5DB",
                            background: "#fff",
                            fontSize: 12,
                            fontFamily: "inherit",
                            outline: "none",
                            color: "#1A1A2E"
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: "1px solid #E5E7EB" }}>
                      <span style={{ fontSize: 12, color: "#6B7280" }}>Total</span>
                      <strong style={{ fontSize: 17, fontWeight: 700, color: "#0B74D4" }}>₹{cartTotal.toFixed(0)}</strong>
                    </div>
                  </>
                )}

                <button
                  className="checkout-btn"
                  disabled={cartItems.length === 0 || !roomNumber.trim() || !guestName.trim() || !guestPhone.trim() || placing}
                  onClick={placeOrder}
                  style={{
                    width: "100%", background: "#0B74D4", border: "none", borderRadius: 9,
                    padding: "11px 0", fontSize: 13, fontWeight: 600, color: "#fff",
                    cursor: "pointer", marginTop: 12, fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  {placing ? (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}>
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                      </svg>
                      Placing Order…
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Place Order{cartTotal > 0 ? ` · ₹${cartTotal.toFixed(0)}` : ""}
                    </>
                  )}
                </button>
              </div>

              {/* LIVE TRACKING */}
              <div className="side-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div className="side-card-title" style={{ marginBottom: 0, display: "flex", alignItems: "center", gap: 6 }}>
                    🕐 Live Tracking
                  </div>
                  <div className="live-badge">
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A", animation: "pulse-dot 1.5s infinite" }} />
                    Live
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "#9CA3AF", margin: "6px 0 12px" }}>Order #GR-9921 · Room 402</div>
                <TrackingStep label="Confirmed"        time="12:45 PM"     status="done"    showLine />
                <TrackingStep label="Preparing"        time="In Progress"  status="active"  showLine />
                <TrackingStep label="Out for Delivery" time="Est. 1:15 PM" status="pending" showLine={false} />
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
            cartItems={cartItems}
            cartCount={cartCount}
            cartTotal={cartTotal}
            placing={placing}
            onRemoveOne={removeItem}
            onAddOne={addItem}
            onPlace={placeOrder}
            onClose={() => setCartOpen(false)}
            roomsList={roomsList}
            roomNumber={roomNumber}
            setRoomNumber={setRoomNumber}
            guestName={guestName}
            setGuestName={setGuestName}
            guestPhone={guestPhone}
            setGuestPhone={setGuestPhone}
          />
        )}

        {/* ─── DRINKS MENU SHEET ─── */}
        {drinksOpen && (
          <DrinkMenuSheet onClose={() => setDrinksOpen(false)} />
        )}

        {/* ─── MOBILE TRACKING SHEET ─── */}
        {trackOpen && (
          <div className="track-modal-overlay" onClick={() => setTrackOpen(false)}>
            <div className="track-modal" onClick={(e) => e.stopPropagation()}>
              <div style={{ width: 36, height: 4, background: "#E5E7EB", borderRadius: 2, margin: "0 auto 16px" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E" }}>🕐 Live Tracking</div>
                <div className="live-badge">
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A", animation: "pulse-dot 1.5s infinite" }} />
                  Live
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#9CA3AF", margin: "6px 0 16px" }}>Order #GR-9921 · Room 402</div>
              <TrackingStep label="Confirmed"        time="12:45 PM"     status="done"    showLine />
              <TrackingStep label="Preparing"        time="In Progress"  status="active"  showLine />
              <TrackingStep label="Out for Delivery" time="Est. 1:15 PM" status="pending" showLine={false} />
              <button
                onClick={() => setTrackOpen(false)}
                style={{ width: "100%", marginTop: 20, background: "#F3F4F6", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 13, fontWeight: 600, color: "#6B7280", cursor: "pointer", fontFamily: "inherit" }}
              >
                Close
              </button>
            </div>
          </div>
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