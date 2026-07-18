'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVendor, setIsVendor] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed.'); setLoading(false); return; }
      if (rememberMe) localStorage.setItem('luxrent.user', JSON.stringify(data.user));
      const dest = isVendor || data.user?.role === 'vendor' ? '/admin/dashboard' : '/home';
      router.push(dest);
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!signupName || !signupEmail || !signupPassword) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword, role: isVendor ? 'vendor' : 'customer' }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Signup failed.'); setLoading(false); return; }
      localStorage.setItem('luxrent.user', JSON.stringify(data.user));
      router.push(data.user?.role === 'vendor' ? '/admin/dashboard' : '/home');
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F3EF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/home" style={{ color: '#0F172A', fontWeight: 700, fontSize: '24px', textDecoration: 'none' }}>LuxRent</Link>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>Premium Rental Platform</p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: '#fff', border: '1px solid rgba(100,116,139,0.2)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(100,116,139,0.15)' }}>
            {(['login', 'signup'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setError(''); }}
                style={{
                  flex: 1, padding: '16px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  backgroundColor: 'transparent', border: 'none', borderBottom: activeTab === tab ? '2px solid #D97706' : '2px solid transparent',
                  color: activeTab === tab ? '#0F172A' : '#64748B', transition: 'all 0.2s'
                }}
              >
                {tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div style={{ padding: '32px' }}>
            {activeTab === 'login' ? (
              <>
                <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Welcome back</h1>
                <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '16px' }}>Sign in to your LuxRent account</p>

                <div style={{ marginBottom: '20px', background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#0F172A', lineHeight: 1.6 }}>
                  <strong style={{ color: '#D97706' }}>Demo logins</strong><br />
                  Vendor — <code>vendor@luxrent.com</code> / <code>admin</code><br />
                  Customer — <code>customer@luxrent.com</code> / <code>customer</code>
                </div>

                {error && (
                  <div style={{ marginBottom: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px', padding: '10px 14px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'rgba(100,116,139,0.5)' }}>mail</span>
                      <input
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com" autoComplete="email"
                        style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1px solid rgba(100,116,139,0.25)', borderRadius: '6px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'rgba(100,116,139,0.5)' }}>lock</span>
                      <input
                        type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" autoComplete="current-password"
                        style={{ width: '100%', padding: '10px 40px 10px 38px', border: '1px solid rgba(100,116,139,0.25)', borderRadius: '6px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(100,116,139,0.6)', padding: 0 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                      <span style={{ fontSize: '14px', color: '#64748B' }}>Remember me</span>
                    </label>
                    <button type="button" style={{ background: 'none', border: 'none', color: '#D97706', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>Forgot password?</button>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center' }}>
                    {loading ? (
                      <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>refresh</span>Signing in...</>
                    ) : (
                      <>Sign In <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span></>
                    )}
                  </button>
                </form>

                {/* Vendor Toggle */}
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(100,116,139,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F5F3EF', borderRadius: '8px', border: '1px solid rgba(100,116,139,0.15)' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Admin / Vendor Access</p>
                      <p style={{ fontSize: '12px', color: '#64748B' }}>Redirect to management portal</p>
                    </div>
                    <button
                      type="button" onClick={() => setIsVendor(!isVendor)}
                      role="switch" aria-checked={isVendor}
                      style={{
                        position: 'relative', display: 'inline-flex', height: '24px', width: '44px',
                        flexShrink: 0, cursor: 'pointer', borderRadius: '9999px', border: '2px solid transparent',
                        transition: 'background-color 0.2s', backgroundColor: isVendor ? '#D97706' : 'rgba(100,116,139,0.3)',
                        outline: 'none'
                      }}
                    >
                      <span style={{
                        display: 'inline-block', height: '20px', width: '20px', borderRadius: '9999px',
                        backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        transition: 'transform 0.2s', transform: isVendor ? 'translateX(20px)' : 'translateX(0)'
                      }} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Create account</h1>
                <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>Join LuxRent today</p>

                {error && (
                  <div style={{ marginBottom: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px', padding: '10px 14px', borderRadius: '6px' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { label: 'Full Name', type: 'text', value: signupName, set: setSignupName, placeholder: 'John Smith', icon: 'person' },
                    { label: 'Email Address', type: 'email', value: signupEmail, set: setSignupEmail, placeholder: 'you@example.com', icon: 'mail' },
                    { label: 'Password', type: 'password', value: signupPassword, set: setSignupPassword, placeholder: 'Min. 8 characters', icon: 'lock' },
                  ].map((field) => (
                    <div key={field.label}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{field.label}</label>
                      <div style={{ position: 'relative' }}>
                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'rgba(100,116,139,0.5)' }}>{field.icon}</span>
                        <input
                          type={field.type} value={field.value} onChange={(e) => field.set(e.target.value)}
                          placeholder={field.placeholder} required
                          style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1px solid rgba(100,116,139,0.25)', borderRadius: '6px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  ))}
                  <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center' }}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
                <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#64748B' }}>
                  By creating an account, you agree to our{' '}
                  <button style={{ background: 'none', border: 'none', color: '#D97706', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}>Terms</button>{' '}and{' '}
                  <button style={{ background: 'none', border: 'none', color: '#D97706', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}>Privacy Policy</button>.
                </p>
              </>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#64748B' }}>
          <Link href="/home" style={{ color: '#D97706', textDecoration: 'none', fontWeight: 500 }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
