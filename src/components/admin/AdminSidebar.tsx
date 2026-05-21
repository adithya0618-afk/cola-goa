'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  ShoppingCart,
  UtensilsCrossed,
  Users,
  CreditCard,
  LogOut,
  Hotel,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/rooms',     label: 'Rooms',        icon: BedDouble },
  { href: '/admin/bookings',  label: 'Bookings',     icon: CalendarCheck },
  { href: '/admin/orders',    label: 'Orders',       icon: ShoppingCart },
  { href: '/admin/items',     label: 'Menu / Items', icon: UtensilsCrossed },
  { href: '/admin/staff',     label: 'Staff',        icon: Users },
  { href: '/admin/payments',  label: 'Payments',     icon: CreditCard },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [unseenCount, setUnseenCount] = useState(0);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch('/api/admin/orders/count');
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data.pendingCount || 0);
          setUnseenCount(data.unseenCount || 0);
        }
      } catch (err) {
        console.error('Error fetching order counts:', err);
      }
    }

    fetchCounts();
    // Poll every 5 seconds for real-time updates
    const i = setInterval(fetchCounts, 5000);
    return () => clearInterval(i);
  }, []);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo + mobile close */}
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 8,
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
            padding: 4,
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            <img 
              src="https://colagoa.com/wp-content/uploads/2022/04/logo.jpg" 
              alt="Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 16, lineHeight: 1.1, letterSpacing: '-0.02em' }}>Cola Goa</div>
            <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>Resort CRM</div>
          </div>
        </div>
        {/* Close button — only visible on mobile via CSS */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#64748b', display: 'none', padding: 4,
            }}
            className="sidebar-close-btn"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        <div style={{ color: '#334155', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', padding: '8px 10px 6px', textTransform: 'uppercase' }}>
          Main Menu
        </div>
        <style>{`
          @keyframes orders-pulse {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(239,68,68,0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0); }
          }
          .new-badge-pulse {
            animation: orders-pulse 1.8s infinite;
          }
        `}</style>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }} onClick={onClose}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 10, marginBottom: 2,
                background: active ? 'rgba(14,165,233,0.15)' : 'transparent',
                color: active ? '#38bdf8' : 'var(--sidebar-text)',
                fontWeight: active ? 600 : 500,
                fontSize: 14,
                transition: 'all 0.15s',
                cursor: 'pointer',
                borderLeft: active ? '3px solid #38bdf8' : '3px solid transparent',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--sidebar-hover)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={17} />
                <span style={{ flex: 1 }}>{label}</span>
                {label === 'Orders' && (
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    {unseenCount > 0 && (
                      <span 
                        className="new-badge-pulse"
                        style={{
                          background: '#ef4444',
                          color: '#fff',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 5px',
                          borderRadius: 6,
                          lineHeight: 1.1,
                          display: 'inline-block',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {unseenCount} New
                      </span>
                    )}
                    {pendingCount > 0 && (
                      <span style={{
                        background: '#f59e0b',
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 5px',
                        borderRadius: 6,
                        lineHeight: 1.1,
                        display: 'inline-block',
                      }}>
                        {pendingCount}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '14px 10px', borderTop: '1px solid #1e293b' }}>
        <button
          onClick={handleLogout}
          suppressHydrationWarning
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 10px', borderRadius: 10, background: 'transparent',
            color: '#ef4444', fontSize: 14, fontWeight: 600, border: 'none',
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
