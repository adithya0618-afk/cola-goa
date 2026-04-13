'use client';

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
} from 'lucide-react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/admin/rooms',     label: 'Rooms',       icon: BedDouble },
  { href: '/admin/bookings',  label: 'Bookings',    icon: CalendarCheck },
  { href: '/admin/orders',    label: 'Orders',      icon: ShoppingCart },
  { href: '/admin/items',     label: 'Menu / Items',icon: UtensilsCrossed },
  { href: '/admin/staff',     label: 'Staff',       icon: Users },
  { href: '/admin/payments',  label: 'Payments',    icon: CreditCard },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  }

  return (
    <aside style={{
      width: 240,
      minWidth: 240,
      background: 'var(--sidebar-bg)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Hotel size={18} color="#fff" />
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Cola Goa</div>
          <div style={{ color: '#475569', fontSize: 11, fontWeight: 500 }}>Resort CRM</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        <div style={{ color: '#334155', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', padding: '8px 10px 6px', textTransform: 'uppercase' }}>
          Main Menu
        </div>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
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
                <span>{label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '14px 10px', borderTop: '1px solid #1e293b' }}>
        <button
          onClick={handleLogout}
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
