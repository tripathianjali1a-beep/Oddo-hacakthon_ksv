'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import { setSession } from '@/lib/session';
import type { UserRole } from '@/lib/types';

const ROLE_OPTIONS: { role: UserRole; label: string; desc: string; icon: string }[] = [
  { role: 'customer', label: 'Customer', desc: 'Browse & rent equipment', icon: 'person' },
  { role: 'vendor', label: 'Vendor', desc: 'List equipment, manage orders', icon: 'inventory_2' },
  { role: 'admin', label: 'Admin', desc: 'Full platform + user management', icon: 'admin_panel_settings' },
];

export default function LoginPage() {
  const router = useRouter();

  // ── Login state ──────────────────────────────────────────────
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // ── Signup state ─────────────────────────────────────────────
  const [activeTab, setActiveTab]         = useState<'login' | 'signup'>('login');
  const [signupName, setSignupName]       = useState('');
  const [signupEmail, setSignupEmail]     = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole]       = useState<UserRole>('customer');

  // ─────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      let data: { ok?: boolean; user?: { id: number; name: string; email: string; role: UserRole }; error?: string };
      try { data = await res.json(); }
      catch { data = {}; }

      if (!res.ok || !data.ok) {
        setError(data.error || `Login failed (${res.status}). Check your credentials.`);
        setLoading(false);
        return;
      }

      // Always persist session so all pages can read it
      setSession(data.user!);

      router.push(data.user?.role === 'customer' ? '/home' : '/admin/dashboard');
    } catch (err) {
      console.error('[login]', err);
      setError('Network error — make sure the dev server is running on localhost:3000.');
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: signupName.trim(),
          email: signupEmail.trim().toLowerCase(),
          password: signupPassword,
          role: signupRole,
        }),
      });

      let data: { ok?: boolean; user?: { id: number; name: string; email: string; role: UserRole }; error?: string };
      try { data = await res.json(); }
      catch { data = {}; }

      if (!res.ok || !data.ok) {
        setError(data.error || `Signup failed (${res.status}).`);
        setLoading(false);
        return;
      }

      setSession(data.user!);
      router.push(data.user?.role === 'customer' ? '/home' : '/admin/dashboard');
    } catch (err) {
      console.error('[signup]', err);
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex">
      {/* ── Left branded panel ───────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-navy">
        <img
          src="/images/marketing/hero-crane-sunset.jpg"
          alt="Construction crane silhouetted at dusk"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy/95 via-navy/80 to-navy/60" />
        <div className="absolute -top-20 -left-16 w-72 h-72 rounded-full bg-amber/20 blur-[110px]" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/home" className="inline-flex">
            <Logo size={38} light />
          </Link>

          <div>
            <p className="text-amber text-xs font-semibold uppercase tracking-widest mb-4">
              Equipment Rentals, Done Right
            </p>
            <h1 className="font-display text-white text-4xl leading-tight font-semibold max-w-[24rem]">
              Heavy iron, studio gear — one login away.
            </h1>
            <p className="text-white/60 text-sm mt-4 max-w-[26rem] leading-relaxed">
              Track bookings, manage deposits, and keep your fleet moving from a single dashboard.
            </p>
          </div>

          <div className="flex items-center gap-8">
            {[
              { n: 'Inspected', l: 'Certified fleet' },
              { n: 'Secure', l: 'Protected deposits' },
              { n: '24/7', l: 'Support' },
            ].map((s) => (
              <div key={s.l}>
                <p className="text-white font-bold text-xl">{s.n}</p>
                <p className="text-white/50 text-[11px] uppercase tracking-wide mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[26rem]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/home" className="inline-flex justify-center">
              <Logo size={36} />
            </Link>
            <p className="text-slate text-sm mt-1.5">Premium Equipment Rental Platform</p>
          </div>

          <div className="card p-0 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate/15">
              {(['login', 'signup'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setError(''); }}
                  className={`flex-1 py-4 text-sm font-semibold transition-all border-b-2 ${
                    activeTab === tab
                      ? 'border-amber text-navy'
                      : 'border-transparent text-slate hover:text-navy'
                  }`}
                >
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <div className="p-7 sm:p-8">
              {/* ── LOGIN ── */}
              {activeTab === 'login' && (
                <>
                  <h2 className="text-navy font-bold text-xl mb-1">Welcome back</h2>
                  <p className="text-slate text-sm mb-5">Sign in to your Rentora account</p>

                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-[13px] px-3.5 py-2.5 rounded-lg flex items-center gap-2">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>
                    {/* Email */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate uppercase tracking-wide mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate/50" style={{ fontSize: '18px' }}>mail</span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          autoComplete="email"
                          className="input-field pl-10"
                          required
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate uppercase tracking-wide mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate/50" style={{ fontSize: '18px' }}>lock</span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className="input-field pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate/60 hover:text-navy transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full justify-center py-3 mt-1"
                    >
                      {loading ? (
                        <>
                          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>refresh</span>
                          Signing in…
                        </>
                      ) : (
                        <>
                          Sign In
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                        </>
                      )}
                    </button>
                  </form>

                  <p className="mt-5 text-center text-xs text-slate">
                    New here?{' '}
                    <button onClick={() => { setActiveTab('signup'); setError(''); }} className="text-amber font-medium hover:underline">
                      Create an account
                    </button>
                  </p>
                </>
              )}

              {/* ── SIGNUP ── */}
              {activeTab === 'signup' && (
                <>
                  <h2 className="text-navy font-bold text-xl mb-1">Create account</h2>
                  <p className="text-slate text-sm mb-6">Join Rentora today</p>

                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-[13px] px-3.5 py-2.5 rounded-lg flex items-center gap-2">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSignup} className="flex flex-col gap-4" noValidate>
                    {(
                      [
                        { label: 'Full Name',      type: 'text',     value: signupName,     set: setSignupName,     placeholder: 'John Smith',        icon: 'person' },
                        { label: 'Email Address',  type: 'email',    value: signupEmail,    set: setSignupEmail,    placeholder: 'you@example.com',   icon: 'mail'   },
                        { label: 'Password',       type: 'password', value: signupPassword, set: setSignupPassword, placeholder: 'Min. 8 characters', icon: 'lock'   },
                      ] as const
                    ).map((field) => (
                      <div key={field.label}>
                        <label className="block text-[11px] font-semibold text-slate uppercase tracking-wide mb-1.5">
                          {field.label}
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate/50" style={{ fontSize: '18px' }}>
                            {field.icon}
                          </span>
                          <input
                            type={field.type}
                            value={field.value}
                            onChange={(e) => field.set(e.target.value)}
                            placeholder={field.placeholder}
                            required
                            className="input-field pl-10"
                          />
                        </div>
                      </div>
                    ))}

                    {/* Account type */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate uppercase tracking-wide mb-1.5">
                        Account Type
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {ROLE_OPTIONS.map((opt) => (
                          <label key={opt.role} className="cursor-pointer">
                            <input
                              type="radio"
                              name="signup-role"
                              value={opt.role}
                              checked={signupRole === opt.role}
                              onChange={() => setSignupRole(opt.role)}
                              className="sr-only peer"
                            />
                            <div className="p-2.5 rounded-xl border-2 border-slate/15 peer-checked:border-amber peer-checked:bg-amber/5 transition-all text-center h-full flex flex-col items-center justify-center gap-1">
                              <span className="material-symbols-outlined text-navy" style={{ fontSize: '18px' }}>{opt.icon}</span>
                              <p className="text-[11px] font-semibold text-navy leading-tight">{opt.label}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      <p className="text-slate text-[11px] mt-1.5 leading-relaxed">
                        {ROLE_OPTIONS.find((o) => o.role === signupRole)?.desc}
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full justify-center py-3"
                    >
                      {loading ? 'Creating account…' : 'Create Account'}
                    </button>
                  </form>

                  <p className="mt-4 text-center text-xs text-slate">
                    By creating an account, you agree to our{' '}
                    <button className="text-amber underline">Terms</button> and{' '}
                    <button className="text-amber underline">Privacy Policy</button>.
                  </p>
                </>
              )}
            </div>
          </div>

          <p className="text-center mt-5 text-sm text-slate">
            <Link href="/home" className="text-amber font-medium hover:underline">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
