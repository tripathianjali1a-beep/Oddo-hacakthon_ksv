'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';

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
    <div className="min-h-screen bg-ivory flex">
      {/* Branded side panel — hidden on small screens */}
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
            <p className="text-amber text-xs font-semibold uppercase tracking-widest mb-4">Equipment Rentals, Done Right</p>
            <h1 className="font-display text-white text-4xl leading-tight font-semibold max-w-[24rem]">
              Heavy iron, studio gear — one login away.
            </h1>
            <p className="text-white/60 text-sm mt-4 max-w-[26rem] leading-relaxed">
              Track bookings, manage deposits, and keep your fleet moving from a single dashboard.
            </p>
          </div>

          <div className="flex items-center gap-8">
            {[{ n: '35+', l: 'Units in fleet' }, { n: '4.8★', l: 'Avg rating' }, { n: '24/7', l: 'Support' }].map((s) => (
              <div key={s.l}>
                <p className="text-white font-bold text-xl">{s.n}</p>
                <p className="text-white/50 text-[11px] uppercase tracking-wide mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
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
                    activeTab === tab ? 'border-amber text-navy' : 'border-transparent text-slate hover:text-navy'
                  }`}
                >
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <div className="p-7 sm:p-8">
              {activeTab === 'login' ? (
                <>
                  <h2 className="text-navy font-bold text-xl mb-1">Welcome back</h2>
                  <p className="text-slate text-sm mb-5">Sign in to your Rentora account</p>

                  <div className="mb-5 bg-amber/10 border border-amber/25 rounded-xl px-3.5 py-3 text-xs text-navy leading-relaxed">
                    <strong className="text-amber">Demo logins</strong><br />
                    Vendor — <code>vendor@rentora.com</code> / <code>admin</code><br />
                    Customer — <code>customer@rentora.com</code> / <code>customer</code>
                  </div>

                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-[13px] px-3.5 py-2.5 rounded-lg flex items-center gap-2">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate uppercase tracking-wide mb-1.5">Email Address</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate/50" style={{ fontSize: '18px' }}>mail</span>
                        <input
                          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com" autoComplete="email"
                          className="input-field pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate uppercase tracking-wide mb-1.5">Password</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate/50" style={{ fontSize: '18px' }}>lock</span>
                        <input
                          type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••" autoComplete="current-password"
                          className="input-field pl-10 pr-10"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate/60 hover:text-navy transition-colors">
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-slate/30 text-navy focus:ring-amber cursor-pointer" />
                        <span className="text-sm text-slate">Remember me</span>
                      </label>
                      <button type="button" className="text-amber text-sm font-medium hover:underline">Forgot password?</button>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                      {loading ? (
                        <><span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>refresh</span>Signing in...</>
                      ) : (
                        <>Sign In <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span></>
                      )}
                    </button>
                  </form>

                  {/* Vendor Toggle */}
                  <div className="mt-6 pt-6 border-t border-slate/15">
                    <div className="flex items-center justify-between p-3 bg-ivory rounded-xl border border-slate/15">
                      <div>
                        <p className="text-navy font-semibold text-sm">Admin / Vendor Access</p>
                        <p className="text-slate text-xs">Redirect to management portal</p>
                      </div>
                      <button
                        type="button" onClick={() => setIsVendor(!isVendor)}
                        role="switch" aria-checked={isVendor}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors outline-none ${isVendor ? 'bg-amber' : 'bg-slate/30'}`}
                      >
                        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${isVendor ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-navy font-bold text-xl mb-1">Create account</h2>
                  <p className="text-slate text-sm mb-6">Join Rentora today</p>

                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-[13px] px-3.5 py-2.5 rounded-lg">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSignup} className="flex flex-col gap-4">
                    {[
                      { label: 'Full Name', type: 'text', value: signupName, set: setSignupName, placeholder: 'John Smith', icon: 'person' },
                      { label: 'Email Address', type: 'email', value: signupEmail, set: setSignupEmail, placeholder: 'you@example.com', icon: 'mail' },
                      { label: 'Password', type: 'password', value: signupPassword, set: setSignupPassword, placeholder: 'Min. 8 characters', icon: 'lock' },
                    ].map((field) => (
                      <div key={field.label}>
                        <label className="block text-[11px] font-semibold text-slate uppercase tracking-wide mb-1.5">{field.label}</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate/50" style={{ fontSize: '18px' }}>{field.icon}</span>
                          <input
                            type={field.type} value={field.value} onChange={(e) => field.set(e.target.value)}
                            placeholder={field.placeholder} required
                            className="input-field pl-10"
                          />
                        </div>
                      </div>
                    ))}
                    <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                      {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                  </form>
                  <p className="mt-4 text-center text-xs text-slate">
                    By creating an account, you agree to our{' '}
                    <button className="text-amber underline">Terms</button>{' '}and{' '}
                    <button className="text-amber underline">Privacy Policy</button>.
                  </p>
                </>
              )}
            </div>
          </div>

          <p className="text-center mt-5 text-sm text-slate">
            <Link href="/home" className="text-amber font-medium hover:underline">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
