'use client';
import { useEffect, useState } from 'react';

const STATUS_META: any = {
  pending:   { color: "#F59E0B", bg: "#FEF3C7", label: "Pending" },
  accepted:  { color: "#16A34A", bg: "#DCFCE7", label: "Accepted" },
  completed: { color: "#6B7280", bg: "#F3F4F6", label: "Completed" },
  rejected:  { color: "#DC2626", bg: "#FEE2E2", label: "Rejected" },
};

export default function OrdersClient({ orders }: { orders: any[] }) {
  const [filter, setFilter] = useState('all');

  // REMOVED AUTO REFRESH TO FIX PERFORMANCE
  useEffect(() => {
    // Polling removed
  }, []);

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

 async function update(id: string, status: string) {
  const res = await fetch(`/api/admin/orders/${id}`, {
    method: 'PATCH',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  const data = await res.json();
  console.log("UPDATE RESPONSE:", data);

  if (!res.ok) {
    alert("Update failed");
    return;
  }

  window.location.reload();
}

  return (
    <div style={{ padding: 24 }}>
      {/* ─── HEADER ─── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1A1A2E" }}>Orders</h1>
          <p style={{ fontSize: 13, color: "#9CA3AF" }}>
            Manage and track all guest orders
          </p>
        </div>
      </div>

      {/* ─── FILTER PILLS ─── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {['all','pending','accepted','completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 12,
              border: "1px solid",
              cursor: "pointer",
              fontWeight: 600,
              background: filter === f ? "#0B74D4" : "#fff",
              color: filter === f ? "#fff" : "#6B7280",
              borderColor: filter === f ? "#0B74D4" : "#E5E7EB"
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* ─── GRID ─── */}
      {filtered.length === 0 ? (
        <div style={{
          background: "#fff",
          border: "1px solid #E8ECF0",
          borderRadius: 14,
          padding: 40,
          textAlign: "center",
          color: "#9CA3AF"
        }}>
          No orders found
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16
        }}>
          {filtered.map(o => {
            const meta = STATUS_META[o.status] || STATUS_META.pending;

            return (
              <div
                key={o.id}
                style={{
                  background: "#fff",
                  borderRadius: 14,
                  border: "1px solid #E8ECF0",
                  padding: 16,
                  transition: "0.2s",
                }}
              >
                {/* Top */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    Room {o.roomNumber || "-"}
                  </div>

                  <div style={{
                    fontSize: 11,
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontWeight: 600,
                    color: meta.color,
                    background: meta.bg,
                  }}>
                    {meta.label}
                  </div>
                </div>

                {/* Guest */}
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 6, display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ fontWeight: 500, color: "#1A1A2E" }}>{o.guestName || "Walk-in Guest"}</div>
                  {o.guestPhone && (
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>📞 {o.guestPhone}</div>
                  )}
                </div>

                {/* Amount */}
                <div style={{
                  marginTop: 10,
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#0B74D4"
                }}>
                  ₹{o.totalAmount}
                </div>

                {/* Time */}
                <div style={{
                  fontSize: 11,
                  color: "#9CA3AF",
                  marginTop: 4
                }}>
  {new Date(o.createdAt).toISOString().slice(0, 19).replace('T', ' ')}
                </div>

                <hr style={{ margin: "12px 0", borderColor: "#F3F4F6" }} />

                {/* ACTIONS */}
                <div style={{ display: "flex", gap: 8 }}>
                  {o.status === 'pending' && (
                    <>
                      <button
                        onClick={() => update(o.id, 'accepted')}
                        style={{
                          flex: 1,
                          background: "#16A34A",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          padding: "8px",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        Accept
                      </button>

                      <button
                        onClick={() => update(o.id, 'rejected')}
                        style={{
                          flex: 1,
                          background: "#FEE2E2",
                          color: "#DC2626",
                          border: "1px solid #FCA5A5",
                          borderRadius: 8,
                          padding: "8px",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {o.status === 'accepted' && (
                    <button
                      onClick={() => update(o.id, 'completed')}
                      style={{
                        width: "100%",
                        background: "#0B74D4",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "8px",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}