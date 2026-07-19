'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthTokens } from '@/lib/client';
import { useAuthStore } from '@/lib/store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

type LoginRole = 'customer' | 'vendor' | 'admin';
type Tab = 'login' | 'signup' | 'forgot';

const ROLE_CONFIG: Record<LoginRole, { label: string; icon: string; color: string; desc: string }> = {
  customer: { label: 'Customer', icon: 'person', color: 'bg-emerald-600', desc: 'Browse & rent products' },
  vendor: { label: 'Vendor', icon: 'storefront', color: 'bg-indigo-600', desc: 'Manage your inventory' },
  admin: { label: 'Admin', icon: 'admin_panel_settings', color: 'bg-navy', desc: 'Full system control' },
};

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [selectedRole, setSelectedRole] = useState<LoginRole>('customer');
  const [roleDropOpen, setRoleDropOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Signup fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [productCategory, setProductCategory] = useState('Electronics');
  const [gstNo, setGstNo] = useState('');

  // Forgot password
  const [resetEmail, setResetEmail] = useState('');

  const validatePassword = (p: string) => {
    if (p.length < 6) return 'Password must be at least 6 characters.';
    if (!/[A-Z]/.test(p)) return 'Must include an uppercase letter.';
    if (!/[a-z]/.test(p)) return 'Must include a lowercase letter.';
    if (!/[@#$%^&*]/.test(p)) return 'Must include a special character (@ # $ % ^ & *).';
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const form = new URLSearchParams();
      form.append('username', email);
      form.append('password', password);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Login failed');

      setAuthTokens(data.access_token, data.refresh_token);

      const meRes = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const user = await meRes.json();

      // Role mismatch guard
      const isStaff = user.role === 'admin' || user.role === 'vendor';
      if (selectedRole === 'customer' && isStaff) {
        throw new Error('Use the Admin or Vendor login option for staff accounts.');
      }
      if ((selectedRole === 'vendor' || selectedRole === 'admin') && user.role === 'customer') {
        throw new Error('This account does not have staff access.');
      }
      if (selectedRole === 'admin' && user.role === 'vendor') {
        throw new Error('This is a vendor account, not an admin account.');
      }

      setAuth({ user, access_token: data.access_token, refresh_token: data.refresh_token });

      document.cookie = `auth_token=${data.access_token}; path=/; max-age=3600; SameSite=Lax`;
      document.cookie = `user_role=${user.role}; path=/; max-age=3600; SameSite=Lax`;

      if (user.role === 'admin' || user.role === 'vendor') {
        router.push('/admin/dashboard');
      } else {
        router.push('/home');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!firstName || !lastName || !signupEmail || !signupPassword || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (selectedRole === 'vendor' && (!companyName || !gstNo)) {
      setError('Company Name and GST No. are required for vendor sign-up.');
      return;
    }
    const passErr = validatePassword(signupPassword);
    if (passErr) { setError(passErr); return; }
    if (signupPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    // Prevent self-registration as admin
    if (selectedRole === 'admin') {
      setError('Admin accounts must be created by an existing administrator.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          full_name: `${firstName} ${lastName}`.trim(),
          phone: phone || undefined,
          role: selectedRole, // 'customer' or 'vendor'
          company_name: selectedRole === 'vendor' ? companyName : undefined,
          gst_no: selectedRole === 'vendor' ? gstNo : undefined,
          product_category: selectedRole === 'vendor' ? productCategory : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Registration failed');

      setSuccessMsg(`Account created successfully! You can now sign in as ${selectedRole}.`);
      setActiveTab('login');
      setEmail(signupEmail);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) { setError('Please enter your email.'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSuccessMsg('If this email exists in our system, a password reset link has been sent.');
  };

  const roleConfig = ROLE_CONFIG[selectedRole];

  return (
    <div className="min-h-screen bg-ivory/40 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-[480px]">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/home" className="text-navy font-bold text-3xl tracking-tight inline-block hover:opacity-90">
            LuxRent
          </Link>
          <p className="text-slate text-xs mt-1 font-medium">Premium Rental Platform</p>
        </div>

        {/* Signup coupon banner */}
        {activeTab === 'signup' && selectedRole === 'customer' && (
          <div className="mb-5 bg-gradient-to-r from-navy to-navy-container text-white p-4 rounded-xl border border-amber/30 shadow-lg text-center">
            <span className="text-[10px] font-bold text-amber uppercase tracking-wider block mb-1">New Customer Signup Bonus</span>
            <div className="bg-white/10 rounded-lg py-2 px-4 border border-white/20 inline-block">
              <span className="font-mono font-bold text-base tracking-widest">Coupon: LUXNEW10</span>
            </div>
            <p className="text-[11px] text-white/80 mt-1.5">₹500 off your first rental — apply at checkout</p>
          </div>
        )}

        <div className="bg-white border border-slate/15 rounded-2xl shadow-xl overflow-hidden">
          {/* Role Selector — prominent dropdown at the top */}
          <div className="p-4 border-b border-slate/10 bg-ivory/40">
            <p className="text-[11px] font-bold text-slate uppercase tracking-wider mb-2">Sign in as</p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropOpen(!roleDropOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate/20 rounded-xl hover:border-amber transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${roleConfig.color} flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-white shrink-0" style={{ fontSize: '18px' }}>{roleConfig.icon}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-navy text-sm">{roleConfig.label}</p>
                    <p className="text-[11px] text-slate">{roleConfig.desc}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate shrink-0" style={{ fontSize: '20px' }}>
                  {roleDropOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {roleDropOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setRoleDropOpen(false)} />
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate/15 rounded-xl shadow-2xl z-20 overflow-hidden">
                    {(Object.entries(ROLE_CONFIG) as [LoginRole, typeof ROLE_CONFIG[LoginRole]][]).map(([key, cfg]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setSelectedRole(key); setRoleDropOpen(false); setError(''); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-ivory transition-colors ${selectedRole === key ? 'bg-amber/10' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-lg ${cfg.color} flex items-center justify-center shrink-0`}>
                          <span className="material-symbols-outlined text-white shrink-0" style={{ fontSize: '18px' }}>{cfg.icon}</span>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-navy text-sm">{cfg.label}</p>
                          <p className="text-[11px] text-slate">{cfg.desc}</p>
                        </div>
                        {selectedRole === key && (
                          <span className="material-symbols-outlined text-amber ml-auto shrink-0" style={{ fontSize: '18px' }}>check_circle</span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate/10 bg-ivory/20">
            {([
              { id: 'login', label: 'Sign In' },
              { id: 'signup', label: selectedRole === 'vendor' ? 'Vendor Sign Up' : selectedRole === 'admin' ? 'N/A' : 'Sign Up' },
              { id: 'forgot', label: 'Reset Password' },
            ] as { id: Tab; label: string }[]).filter(t => !(t.id === 'signup' && selectedRole === 'admin')).map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setError(''); setSuccessMsg(''); }}
                className={`flex-1 py-3.5 text-xs font-bold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-amber text-navy bg-white shadow-xs'
                    : 'border-transparent text-slate hover:text-navy'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>error</span>
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined shrink-0 text-emerald-600" style={{ fontSize: '16px' }}>check_circle</span>
                {successMsg}
              </div>
            )}

            {/* ── SIGN IN ── */}
            {activeTab === 'login' && (
              <>
                <h1 className="text-lg font-bold text-navy mb-1">
                  Welcome back{selectedRole !== 'customer' ? `, ${ROLE_CONFIG[selectedRole].label}` : ''}
                </h1>
                <p className="text-xs text-slate mb-5">
                  {selectedRole === 'customer' ? 'Sign in to manage your rentals.' :
                   selectedRole === 'vendor' ? 'Sign in to manage your inventory & orders.' :
                   'Sign in to access the admin panel.'}
                </p>

                {/* Demo credentials hint */}
                <div className="mb-4 p-3 bg-amber/10 border border-amber/20 rounded-xl text-[11px] text-navy">
                  <p className="font-bold mb-1">Demo credentials:</p>
                  {selectedRole === 'admin' && <p>admin@luxrent.com / admin123</p>}
                  {selectedRole === 'vendor' && <p>vendor@luxrent.com / vendor123</p>}
                  {selectedRole === 'customer' && <p>customer@example.com / customer123</p>}
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1.5">Email</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/40 shrink-0" style={{ fontSize: '18px' }}>person</span>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber focus:bg-white transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1.5">Password</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/40 shrink-0" style={{ fontSize: '18px' }}>lock</span>
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                        className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber focus:bg-white transition-colors" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate/60 hover:text-navy">
                        <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => { setActiveTab('forgot'); setError(''); }} className="text-xs font-bold text-amber hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <button type="submit" disabled={loading}
                    className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 shadow-md">
                    {loading
                      ? <><span className="material-symbols-outlined shrink-0 animate-spin" style={{ fontSize: '18px' }}>refresh</span><span>Signing in...</span></>
                      : <><span>Sign In as {ROLE_CONFIG[selectedRole].label}</span><span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>login</span></>
                    }
                  </button>
                </form>

                {selectedRole !== 'admin' && (
                  <p className="text-center mt-5 text-xs text-slate">
                    No account?{' '}
                    <button onClick={() => setActiveTab('signup')} className="font-bold text-amber hover:underline">Register here</button>
                  </p>
                )}
              </>
            )}

            {/* ── SIGN UP (customer or vendor) ── */}
            {activeTab === 'signup' && selectedRole !== 'admin' && (
              <>
                <h1 className="text-lg font-bold text-navy mb-1">
                  {selectedRole === 'vendor' ? 'Vendor Registration' : 'Create Account'}
                </h1>
                <p className="text-xs text-slate mb-5">
                  {selectedRole === 'vendor' ? 'Register your business to list rental products.' : 'Sign up to start renting premium equipment.'}
                </p>

                <form onSubmit={handleSignup} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">First Name</label>
                      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First" required
                        className="w-full px-3.5 py-2 text-xs border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">Last Name</label>
                      <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last" required
                        className="w-full px-3.5 py-2 text-xs border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber transition-colors" />
                    </div>
                  </div>

                  {/* Vendor-specific fields */}
                  {selectedRole === 'vendor' && (
                    <div className="bg-indigo-50 p-3.5 rounded-xl border border-indigo-200 space-y-3">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Business Details</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate uppercase mb-1">Company Name *</label>
                          <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="ABC Rentals Ltd" required
                            className="w-full px-3 py-1.5 text-xs border border-slate/20 rounded-lg bg-white outline-none focus:border-amber" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate uppercase mb-1">GST No. *</label>
                          <input type="text" value={gstNo} onChange={(e) => setGstNo(e.target.value)} placeholder="29AAAAA0000A1Z5" required
                            className="w-full px-3 py-1.5 text-xs border border-slate/20 rounded-lg bg-white outline-none focus:border-amber" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate uppercase mb-1">Product Category</label>
                        <select value={productCategory} onChange={(e) => setProductCategory(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate/20 rounded-lg bg-white outline-none focus:border-amber font-medium text-navy">
                          <option>Electronics & Cinema</option>
                          <option>Furniture & Lounge</option>
                          <option>Heavy Machinery</option>
                          <option>Power Tools</option>
                          <option>Scaffolding & Lifts</option>
                          <option>Audio Visual</option>
                          <option>Lighting & Decor</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">Email</label>
                    <input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="email@domain.com" required
                      className="w-full px-3.5 py-2 text-xs border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">Phone (optional)</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2 text-xs border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">Password</label>
                      <input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="••••••••" required
                        className="w-full px-3.5 py-2 text-xs border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">Confirm Password</label>
                      <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required
                        className="w-full px-3.5 py-2 text-xs border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber transition-colors" />
                    </div>
                  </div>
                  <div className="bg-slate/5 border border-slate/15 rounded-xl p-3 text-[10px] text-slate leading-relaxed">
                    <p className="font-bold text-navy mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-amber" style={{ fontSize: '14px' }}>info</span>
                      Password requirements:
                    </p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>At least 6 characters</li>
                      <li>One uppercase &amp; one lowercase letter</li>
                      <li>One special character (@ # $ % ^ &amp; *)</li>
                    </ul>
                  </div>

                  <button type="submit" disabled={loading}
                    className="btn-primary w-full py-3 text-sm flex items-center justify-center gap-2 shadow-md">
                    {loading
                      ? <><span className="material-symbols-outlined shrink-0 animate-spin" style={{ fontSize: '18px' }}>refresh</span><span>Creating account...</span></>
                      : <><span>Create {ROLE_CONFIG[selectedRole].label} Account</span><span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>person_add</span></>
                    }
                  </button>
                </form>

                <p className="text-center mt-4 text-xs text-slate">
                  Already registered?{' '}
                  <button onClick={() => setActiveTab('login')} className="font-bold text-amber hover:underline">Sign in</button>
                </p>
              </>
            )}

            {/* ── RESET PASSWORD ── */}
            {activeTab === 'forgot' && (
              <>
                <h1 className="text-lg font-bold text-navy mb-1">Reset Password</h1>
                <p className="text-xs text-slate mb-5">Enter your registered email to receive a reset link.</p>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1.5">Email Address</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/40 shrink-0" style={{ fontSize: '18px' }}>mail</span>
                      <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="registered@domain.com" required
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber focus:bg-white transition-colors" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 shadow-md">
                    {loading
                      ? <><span className="material-symbols-outlined shrink-0 animate-spin" style={{ fontSize: '18px' }}>refresh</span><span>Sending...</span></>
                      : <><span>Send Reset Link</span><span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>send</span></>
                    }
                  </button>
                </form>
                <button onClick={() => setActiveTab('login')} className="w-full text-center mt-5 text-xs font-bold text-amber hover:underline">
                  ← Back to Sign In
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-center mt-6 text-xs text-slate">
          <Link href="/home" className="text-amber hover:underline font-semibold">← Return to Storefront</Link>
        </p>
      </div>
    </div>
  );
}
