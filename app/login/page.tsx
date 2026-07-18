'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot'>('login');
  const [isVendor, setIsVendor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Forgot password state
  const [resetEmail, setResetEmail] = useState('');

  // Signup state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [productCategory, setProductCategory] = useState('Electronics');
  const [gstNo, setGstNo] = useState('');

  const validatePasswordRules = (pass: string) => {
    if (pass.length < 6 || pass.length > 12) return 'Password length must be between 6 and 12 characters.';
    if (!/[A-Z]/.test(pass)) return 'Password must include at least one uppercase letter.';
    if (!/[a-z]/.test(pass)) return 'Password must include at least one lowercase letter.';
    if (!/[@#$%^&*]/.test(pass)) return 'Password must include at least one special character (@ # $ % ^ & *).';
    return null;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    router.push(isVendor ? '/admin/dashboard' : '/home');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!firstName || !lastName || !signupEmail || !signupPassword || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (isVendor && (!companyName || !gstNo)) {
      setError('Company Name and GST No are required for vendor sign-up.');
      return;
    }
    const passErr = validatePasswordRules(signupPassword);
    if (passErr) {
      setError(passErr);
      return;
    }
    if (signupPassword !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    router.push(isVendor ? '/admin/dashboard' : '/home');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!resetEmail) {
      setError('Please enter your email ID.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSuccessMsg('The password reset link has been sent to your email.');
  };

  return (
    <div className="min-h-screen bg-ivory/40 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-[480px]">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/home" className="text-navy font-bold text-3xl tracking-tight inline-block hover:opacity-90">
            LuxRent
          </Link>
          <p className="text-slate text-xs mt-1 font-medium">Premium Rental Platform • Sign up & Login</p>
        </div>

        {/* New Signup Coupon Box from Mockup */}
        {activeTab === 'signup' && (
          <div className="mb-6 bg-gradient-to-r from-navy to-navy-container text-white p-4 rounded-xl border border-amber/30 shadow-lg text-center animate-fade-in">
            <span className="text-[10px] font-bold text-amber uppercase tracking-wider block mb-1">For New Signup Bonus</span>
            <div className="bg-white/10 rounded-lg py-2 px-4 border border-white/20 inline-block">
              <span className="font-mono font-bold text-base tracking-widest text-white">Coupon Code: xxxx10</span>
            </div>
            <p className="text-[11px] text-white/80 mt-1.5">Apply this code during checkout for instant $100 discount</p>
          </div>
        )}

        {/* Card */}
        <div className="bg-white border border-slate/15 rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate/10 bg-ivory/30">
            {[
              { id: 'login', label: 'Sign In' },
              { id: 'signup', label: isVendor ? 'Vendor Sign-up' : 'Sign Up' },
              { id: 'forgot', label: 'Reset Password' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setError(''); setSuccessMsg(''); }}
                className={`flex-1 py-4 text-xs md:text-sm font-bold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-amber text-navy bg-white shadow-xs'
                    : 'border-transparent text-slate hover:text-navy'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-600 text-xs p-3.5 rounded-xl flex items-center gap-2 animate-shake">
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>error</span>
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-xl flex items-center gap-2">
                <span className="material-symbols-outlined shrink-0 text-emerald-600" style={{ fontSize: '18px' }}>check_circle</span>
                <span>{successMsg}</span>
              </div>
            )}

            {/* LOGIN TAB */}
            {activeTab === 'login' && (
              <>
                <h1 className="text-xl font-bold text-navy mb-1">Welcome back</h1>
                <p className="text-xs text-slate mb-6">Enter your Login ID / Email and password to continue</p>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1.5">Login ID / Email Address</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/40 shrink-0" style={{ fontSize: '18px' }}>person</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1.5">Password</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/40 shrink-0" style={{ fontSize: '18px' }}>lock</span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber focus:bg-white transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate/60 hover:text-navy transition-colors"
                      >
                        <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate/30 text-amber focus:ring-amber"
                      />
                      <span className="text-xs font-medium text-slate">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('forgot'); setError(''); setSuccessMsg(''); }}
                      className="text-xs font-bold text-amber hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 shadow-md mt-2"
                  >
                    {loading ? (
                      <><span className="material-symbols-outlined shrink-0 animate-spin" style={{ fontSize: '18px' }}>refresh</span><span>Authenticating...</span></>
                    ) : (
                      <><span>Log In</span><span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>login</span></>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-slate/10 text-center">
                  <p className="text-xs text-slate">
                    Do not have an account?{' '}
                    <button onClick={() => setActiveTab('signup')} className="font-bold text-amber hover:underline">
                      Register here
                    </button>
                  </p>
                </div>
              </>
            )}

            {/* SIGNUP / VENDOR SIGNUP TAB */}
            {activeTab === 'signup' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-xl font-bold text-navy">{isVendor ? 'Vendor Sign-up Page' : 'Customer Sign-up'}</h1>
                    <p className="text-xs text-slate">Create account in database upon registration</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsVendor(!isVendor)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold border border-amber/30 bg-amber/10 text-amber hover:bg-amber hover:text-navy transition-all"
                  >
                    {isVendor ? 'Switch to Customer' : 'Switch to Vendor'}
                  </button>
                </div>

                <form onSubmit={handleSignup} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        required
                        className="w-full px-3.5 py-2 text-xs border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        required
                        className="w-full px-3.5 py-2 text-xs border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber transition-colors"
                      />
                    </div>
                  </div>

                  {/* Vendor specific fields from Mockup */}
                  {isVendor && (
                    <div className="bg-ivory/50 p-3.5 rounded-xl border border-slate/15 space-y-3">
                      <span className="text-[10px] font-bold text-amber uppercase tracking-wider block">Vendor Company & Category details</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate uppercase mb-1">Company Name</label>
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Enterprise LLC"
                            required={isVendor}
                            className="w-full px-3 py-1.5 text-xs border border-slate/20 rounded-lg bg-white outline-none focus:border-amber"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate uppercase mb-1">GST No.</label>
                          <input
                            type="text"
                            value={gstNo}
                            onChange={(e) => setGstNo(e.target.value)}
                            placeholder="29AAAAA0000A1Z5"
                            required={isVendor}
                            className="w-full px-3 py-1.5 text-xs border border-slate/20 rounded-lg bg-white outline-none focus:border-amber"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate uppercase mb-1">Product Category (Dropdown from Mockup)</label>
                        <select
                          value={productCategory}
                          onChange={(e) => setProductCategory(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate/20 rounded-lg bg-white outline-none focus:border-amber font-medium text-navy"
                        >
                          <option value="Electronics">Electronics & Cinema</option>
                          <option value="Furniture">Furniture & Executive Lounge</option>
                          <option value="Heavy Machinery">Heavy Machinery & Earthmoving</option>
                          <option value="Power Tools">Commercial Power Tools</option>
                          <option value="Scaffolding">Scaffolding & Aerial Lifts</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">Email ID</label>
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="email@domain.com"
                      required
                      className="w-full px-3.5 py-2 text-xs border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">Password</label>
                      <input
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-3.5 py-2 text-xs border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-3.5 py-2 text-xs border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password Rules Notice from Mockup */}
                  <div className="bg-slate/5 border border-slate/15 rounded-xl p-3 text-[10px] text-slate leading-relaxed">
                    <p className="font-bold text-navy mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-amber" style={{ fontSize: '14px' }}>info</span>
                      <span>Security Requirements:</span>
                    </p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Password length must be between 6 and 12 characters</li>
                      <li>Must include at least one uppercase & lowercase letter</li>
                      <li>Must include at least one special character (@ # $ % ^ & *)</li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 text-xs md:text-sm flex items-center justify-center gap-2 shadow-md mt-2"
                  >
                    {loading ? (
                      <><span className="material-symbols-outlined shrink-0 animate-spin" style={{ fontSize: '18px' }}>refresh</span><span>Registering in DB...</span></>
                    ) : (
                      <><span>Register</span><span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>person_add</span></>
                    )}
                  </button>
                </form>

                <div className="mt-5 pt-3 border-t border-slate/10 text-center">
                  <p className="text-xs text-slate">
                    Already a member?{' '}
                    <button onClick={() => setActiveTab('login')} className="font-bold text-amber hover:underline">
                      Sign in
                    </button>
                  </p>
                </div>
              </>
            )}

            {/* RESET PASSWORD TAB */}
            {activeTab === 'forgot' && (
              <>
                <h1 className="text-xl font-bold text-navy mb-1">Reset Password</h1>
                <p className="text-xs text-slate mb-6">Enter your registered Email ID. The system will verify and send the reset link.</p>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate uppercase tracking-wider mb-1.5">Enter Email ID:</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate/40 shrink-0" style={{ fontSize: '18px' }}>mail</span>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="registered@domain.com"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate/20 rounded-xl bg-ivory/30 outline-none focus:border-amber focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="bg-amber/10 border border-amber/30 rounded-xl p-3 text-xs text-navy flex items-start gap-2">
                    <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '18px' }}>help</span>
                    <p className="text-[11px]">Note: The system will verify whether the entered email exists in the database before generating the recovery token.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 shadow-md mt-4"
                  >
                    {loading ? (
                      <><span className="material-symbols-outlined shrink-0 animate-spin" style={{ fontSize: '18px' }}>refresh</span><span>Verifying DB...</span></>
                    ) : (
                      <><span>Submit</span><span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>send</span></>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-4 border-t border-slate/10 text-center">
                  <button onClick={() => setActiveTab('login')} className="text-xs font-bold text-amber hover:underline flex items-center justify-center gap-1 mx-auto">
                    <span>← Return to Login</span>
                  </button>
                </div>
              </>
            )}

            {/* Vendor Portal Switch */}
            <div className="mt-6 pt-4 border-t border-slate/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-navy">Admin / Vendor Dashboard</p>
                <p className="text-[11px] text-slate">Direct access to equipment & order management</p>
              </div>
              <button
                type="button"
                onClick={() => setIsVendor(!isVendor)}
                role="switch"
                aria-checked={isVendor}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isVendor ? 'bg-amber' : 'bg-slate/30'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isVendor ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-xs text-slate">
          <Link href="/home" className="text-amber hover:underline font-semibold">← Return to Storefront Home</Link>
        </p>
      </div>
    </div>
  );
}
