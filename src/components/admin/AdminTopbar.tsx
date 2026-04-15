'use client';

import { Bell, Search, Menu } from 'lucide-react';

interface AdminTopbarProps {
  onMenuToggle?: () => void;
}

export default function AdminTopbar({ onMenuToggle }: AdminTopbarProps) {
  return (
    <header className="admin-topbar">
      {/* Left: hamburger + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        {/* Hamburger — shown on tablet/mobile */}
        <button
          onClick={onMenuToggle}
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

        {/* Search — hidden on mobile via CSS */}
        <div className="topbar-search" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--bg-base)', border: '1.5px solid var(--border)',
          borderRadius: 10, padding: '8px 14px', maxWidth: 320, flex: 1,
        }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            placeholder="Search bookings, rooms, guests..."
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontSize: 13, color: 'var(--text-primary)', width: '100%',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button style={{
          width: 38, height: 38, borderRadius: 10,
          border: '1.5px solid var(--border)',
          background: 'var(--bg-base)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <Bell size={16} color="var(--text-secondary)" />
        </button>

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
