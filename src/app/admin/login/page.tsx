'use client';

import { useState } from 'react';
import { User, Lock, CheckCircle2, ShieldCheck, Globe, HelpCircle, FileText } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin/dashboard';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        router.push(redirect);
        router.refresh();
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', background: '#fff', colorScheme: 'light' }}>
      {/* Left Pane: Branding & Info */}
      <div style={{
        flex: 1.5,
        position: 'relative',
        background: 'url("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80") center/cover',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(14,165,233,0.85) 0%, rgba(2,132,199,0.92) 100%)',
          zIndex: 0
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, padding: '40px 60px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Logo Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 'auto' }}>
            <div style={{ 
              width: 48, height: 48, borderRadius: 12, background: '#fff', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', padding: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <img src="https://colagoa.com/wp-content/uploads/2022/04/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ color: '#fff', fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em' }}>Cola Goa Beach Resort</span>
          </div>

          {/* Main Copy */}
          <div style={{ marginTop: 'auto', marginBottom: 60 }}>
            <div style={{ 
              display: 'inline-block', padding: '6px 16px', background: 'rgba(255,255,255,0.15)', 
              borderRadius: 20, color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 24,
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              Staff Portal
            </div>
            <h1 style={{ color: '#fff', fontSize: 52, fontWeight: 800, lineHeight: 1.1, marginBottom: 24, textWrap: 'balance' }}>
              Precision Hospitality Management Starts Here.
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, lineHeight: 1.6, maxWidth: 540, marginBottom: 40 }}>
              Access the reception dashboard to manage guest arrivals, bookings, and concierge requests with our high-performance CRM engine.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, maxWidth: 600 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff', fontWeight: 700, marginBottom: 8 }}>
                  <CheckCircle2 size={20} /> Real-time Sync
                </div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.5 }}>
                  Cloud-ready data persistence across all terminals.
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff', fontWeight: 700, marginBottom: 8 }}>
                  <ShieldCheck size={20} /> Guest Privacy
                </div>
                <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 1.5 }}>
                  Fully GDPR and SOC2 Type II compliant security.
                </div>
              </div>
            </div>
          </div>

          {/* Footer Line */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', 
              padding: '6px 14px', borderRadius: 20, fontSize: 12, color: '#fff', fontWeight: 600 
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
              System Operational: v4.2.0
            </div>
            <div style={{ display: 'flex', gap: 24, fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
              <Link href="/privacy" style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link>
              <Link href="/terms" style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}>Terms of Service</Link>
              <Link href="/cookies" style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}>Cookies</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane: Login Form */}
      <div style={{ flex: 1, background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 40px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.02em' }}>
            Welcome back, Staff
          </h2>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>
            Please enter your credentials to access the terminal.
          </p>

          <div style={{
            background: '#fff', borderRadius: 16, padding: '28px 28px 20px',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Account Login</h3>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: 4, background: '#dcfce7', 
                color: '#16a34a', fontSize: 10, fontWeight: 800, padding: '4px 8px', 
                borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>
                <ShieldCheck size={12} /> SECURE SESSION
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>
              Credentials authorized for internal reception staff only.
            </p>

            {error && (
              <div style={{
                background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8,
                padding: '8px 12px', marginBottom: 16, color: '#b91c1c', fontSize: 13, fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                  Employee ID or Email
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    placeholder="receptionist.j@grandvantage.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    suppressHydrationWarning
                    style={{
                      width: '100%', height: 44, paddingLeft: 42, paddingRight: 16,
                      background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: 10,
                      fontSize: 14, color: '#0f172a', transition: 'all 0.2s', outline: 'none',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = '#0ea5e9';
                      e.target.style.boxShadow = '0 0 0 4px rgba(14,165,233,0.1)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.03)';
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Password</label>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#0ea5e9', cursor: 'pointer' }}>Forgot Password?</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    suppressHydrationWarning
                    style={{
                      width: '100%', height: 44, paddingLeft: 42, paddingRight: 16,
                      background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: 10,
                      fontSize: 14, color: '#0f172a', transition: 'all 0.2s', outline: 'none',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = '#0ea5e9';
                      e.target.style.boxShadow = '0 0 0 4px rgba(14,165,233,0.1)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.03)';
                    }}
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 2 }}>
                <input type="checkbox" style={{ width: 15, height: 15, accentColor: '#0ea5e9' }} defaultChecked />
                <span style={{ fontSize: 12, color: '#475569', fontWeight: 500 }}>Remember this workstation for 30 days</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                suppressHydrationWarning
                style={{
                  width: '100%', height: 46, background: '#0ea5e9', color: '#fff',
                  border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8,
                  boxShadow: '0 4px 14px rgba(14,165,233,0.4)', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#0284c7'}
                onMouseLeave={e => e.currentTarget.style.background = '#0ea5e9'}
              >
                {loading ? 'Authenticating...' : 'Access Dashboard >'}
              </button>
            </form>

            <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 24, paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#64748b', fontSize: 12, fontWeight: 500 }}>
              <Globe size={14} />
              Preferred Language: <span style={{ color: '#0f172a', fontWeight: 600 }}>English (US)</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginTop: 28, color: '#64748b', fontSize: 12, fontWeight: 500 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><HelpCircle size={14} /> Technical Support</span>
            <span style={{ width: 1, height: 12, background: '#cbd5e1' }} />
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><FileText size={14} /> System Manual</span>
          </div>

          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 11, lineHeight: 1.5, maxWidth: 360, margin: '16px auto 0' }}>
            Unauthorized access attempt is logged with IP tracking. By logging in, you agree to our <Link href="/terms" style={{ color: 'inherit' }}>Terms & Conditions</Link> and <Link href="/privacy" style={{ color: 'inherit' }}>Privacy Policy</Link>.
          </p>
          <p style={{ textAlign: 'center', marginTop: 6, color: '#cbd5e1', fontSize: 10 }}>Dev info: admin@colagoa.com / admin123</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div />}>
      <LoginForm />
    </Suspense>
  );
}
