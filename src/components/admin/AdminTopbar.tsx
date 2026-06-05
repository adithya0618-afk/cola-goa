'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  guestName: string | null;
  roomNumber: string | null;
  totalAmount: string;
  createdAt: string;
  status: string;
}

interface AdminTopbarProps {
  onMenuToggle?: () => void;
}

export default function AdminTopbar({ onMenuToggle }: AdminTopbarProps) {
  const router = useRouter();
  const [unseenCount, setUnseenCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Poll every 15 seconds for new orders
  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 15_000);
    return () => clearInterval(interval);
  }, []);

  async function fetchCounts() {
    try {
      const res = await fetch('/api/admin/orders/count');
      if (!res.ok) return;
      const data = await res.json();
      setUnseenCount(data.unseenCount ?? 0);
    } catch {}
  }

  async function fetchRecentOrders() {
    try {
      const res = await fetch('/api/admin/orders/recent');
      if (!res.ok) return;
      const data = await res.json();
      setRecentOrders(data.orders ?? []);
    } catch {}
  }

  function handleBellClick() {
    if (!open) fetchRecentOrders();
    setOpen((v) => !v);
  }

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function goToOrders() {
    setOpen(false);
    router.push('/admin/orders');
  }

  function timeAgo(dateStr: string) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }

  return (
    <header className="admin-topbar">
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        <button
          onClick={onMenuToggle}
          suppressHydrationWarning
          className="topbar-menu-btn"
          style={{
            width: 38, height: 38, borderRadius: 10,
            border: '1.5px solid var(--border)',
            background: 'var(--bg-base)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
          aria-label="Toggle menu"
        >
          <Menu size={18} color="var(--text-secondary)" />
        </button>

        <div className="topbar-search" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--bg-base)', border: '1.5px solid var(--border)',
          borderRadius: 10, padding: '8px 14px', maxWidth: 320, flex: 1,
        }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            placeholder="Search bookings, rooms, guests..."
            suppressHydrationWarning
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontSize: 13, color: 'var(--text-primary)', width: '100%',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>

        {/* ── Bell ── */}
        <div ref={dropRef} style={{ position: 'relative' }}>
          <button
            suppressHydrationWarning
            onClick={handleBellClick}
            style={{
              width: 38, height: 38, borderRadius: 10,
              border: '1.5px solid var(--border)',
              background: 'var(--bg-base)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative',
            }}
            aria-label="Notifications"
          >
            <Bell size={16} color="var(--text-secondary)" />
            {unseenCount > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -5,
                background: '#E24B4A', color: '#fff',
                borderRadius: '50%', width: 18, height: 18,
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid white',
                fontFamily: 'inherit',
              }}>
                {unseenCount > 9 ? '9+' : unseenCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div style={{
              position: 'absolute', top: 46, right: 0,
              width: 300, background: 'white',
              border: '1px solid #E8ECF0', borderRadius: 14,
              boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
              zIndex: 999, overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                padding: '12px 14px', borderBottom: '1px solid #F3F4F6',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>
                  Notifications {unseenCount > 0 && (
                    <span style={{
                      background: '#FEE2E2', color: '#DC2626',
                      fontSize: 10, fontWeight: 700, borderRadius: 20,
                      padding: '2px 7px', marginLeft: 6,
                    }}>
                      {unseenCount} new
                    </span>
                  )}
                </span>
                <button
                  onClick={goToOrders}
                  style={{
                    fontSize: 11, color: '#0B74D4', background: 'none',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  View all
                </button>
              </div>

              {/* Order rows */}
              {recentOrders.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>
                  No recent orders
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    onClick={goToOrders}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderBottom: '1px solid #F9FAFB',
                      cursor: 'pointer', transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 9,
                      background: order.status === 'pending' ? '#FEF3C7' : '#F3F4F6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, flexShrink: 0,
                    }}>
                      🛒
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 6 }}>
                        Room {order.roomNumber ?? '—'}
                        {order.status === 'pending' && (
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
                        ₹{order.totalAmount} · {timeAgo(order.createdAt)}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: 600, padding: '3px 8px',
                      borderRadius: 20,
                      color: order.status === 'pending' ? '#F59E0B' : '#6B7280',
                      background: order.status === 'pending' ? '#FEF3C7' : '#F3F4F6',
                    }}>
                      {order.status}
                    </div>
                  </div>
                ))
              )}

              {/* Footer */}
              <div
                onClick={goToOrders}
                style={{
                  padding: '10px 14px', textAlign: 'center',
                  fontSize: 12, fontWeight: 600, color: '#0B74D4',
                  cursor: 'pointer', borderTop: '1px solid #F3F4F6',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F0F7FF')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                Go to Orders page →
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#0ea5e9,#0284c7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
          }}>
            R
          </div>
          <div className="topbar-user-label">
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Receptionist</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Admin Access</div>
          </div>
        </div>
      </div>
    </header>
  );
}