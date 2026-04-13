'use client';

import { Bell, Search } from 'lucide-react';

export default function AdminTopbar() {
  return (
    <header style={{
      height: 64,
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      flexShrink: 0,
      zIndex: 5,
    }}>
      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--bg-base)', border: '1.5px solid var(--border)',
        borderRadius: 10, padding: '8px 14px', width: 280,
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

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button style={{
          width: 38, height: 38, borderRadius: 10, border: '1.5px solid var(--border)',
          background: 'var(--bg-base)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer',
        }}>
          <Bell size={16} color="var(--text-secondary)" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#0ea5e9,#0284c7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 14,
          }}>
            R
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Receptionist</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Admin Access</div>
          </div>
        </div>
      </div>
    </header>
  );
}
