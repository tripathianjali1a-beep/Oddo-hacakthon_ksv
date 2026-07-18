'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type MainMenu = 'Order' | 'Schedule' | 'Product' | 'Report' | 'Setting';
type SubMenu = string;

export default function AdminConfigPage() {
  const router = useRouter();
  const [mainMenu, setMainMenu] = useState<MainMenu>('Setting');
  const [subMenu, setSubMenu] = useState<SubMenu>('Pickup & Return');

  // Setting -> Pickup & Return states from Image 4
  const [enableLateFee, setEnableLateFee] = useState(true);
  const [lateFeeAmount, setLateFeeAmount] = useState('25.00');

  // Setting -> Product states from Image 4
  const [enableVariants, setEnableVariants] = useState(true);
  const [enablePriceList, setEnablePriceList] = useState(true);

  // Setting -> User states from Image 5
  const [userForm, setUserForm] = useState({
    name: 'Alexander Wright',
    email: 'alexander@luxrent.com',
    phone: '+1 (555) 382-9102',
    company: 'LuxRent Equipment Group Ltd.',
    gst: '27AAACL1234F1Z8',
    address: '742 Evergreen Terrace, Industrial Sector B, Springfield',
    role: 'Admin' as 'Admin' | 'Vendor' | 'Customer',
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    triggerToast('Configuration settings updated successfully across all active product policies!');
    setTimeout(() => setSaved(false), 3000);
  };

  const menuStructure: Record<MainMenu, SubMenu[]> = {
    Order: ['Invoice', 'Customer'],
    Schedule: ['Calendar Overview'],
    Product: ['Product', 'Price list', 'Attribute', 'Rental Period'],
    Report: ['Sales Analytics', 'Late Fee Ledger'],
    Setting: ['Pickup & Return', 'Product', 'User', 'Quotation Template', 'Header/Footer'],
  };

  return (
    <div className="p-6 md:p-8 max-w-[1440px] mx-auto relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-5 py-3.5 rounded-xl shadow-2xl border border-amber/30 flex items-center gap-3 animate-slide-up">
          <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '20px' }}>check_circle</span>
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Header & Navigation Menu layout from Image 4 */}
      <div className="card p-5 mb-6 border-slate/15 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate/15">
          <div>
            <h1 className="text-xl font-black text-navy flex items-center gap-2">
              <span className="material-symbols-outlined text-amber" style={{ fontSize: '26px' }}>admin_panel_settings</span>
              <span>Backend Configuration & Settings</span>
            </h1>
            <p className="text-xs text-slate mt-0.5">Configure system policies, late fees, variants, and enterprise role permissions</p>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold animate-fade-in">
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span>Saved!</span>
              </div>
            )}
            <button
              onClick={() => { setEnableLateFee(true); setLateFeeAmount('25.00'); setEnableVariants(true); triggerToast('Configuration discarded to default values'); }}
              className="btn-secondary py-2 px-4 text-xs font-bold"
            >
              Discard
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-6 text-xs font-bold flex items-center gap-1.5 shadow-md">
              {saving ? (
                <><span className="material-symbols-outlined shrink-0 animate-spin" style={{ fontSize: '16px' }}>refresh</span><span>Saving...</span></>
              ) : (
                <><span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>save</span><span>Save</span></>
              )}
            </button>
          </div>
        </div>

        {/* Top Navigation Menu from Image 4 */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {(Object.keys(menuStructure) as MainMenu[]).map((main) => (
            <button
              key={main}
              onClick={() => {
                setMainMenu(main);
                setSubMenu(menuStructure[main][0]);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                mainMenu === main
                  ? 'bg-navy text-white border-navy shadow-md scale-105'
                  : 'bg-ivory text-slate border-slate/20 hover:text-navy hover:bg-amber/10'
              }`}
            >
              {main}
            </button>
          ))}
        </div>

        {/* Sub-navigation Tabs from Image 4 */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate/10 flex-wrap">
          {menuStructure[mainMenu].map((sub) => (
            <button
              key={sub}
              onClick={() => setSubMenu(sub)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                subMenu === sub
                  ? 'bg-amber text-navy shadow-sm'
                  : 'text-slate hover:text-navy hover:bg-slate/10'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Main Settings Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* Setting -> Pickup & Return (Image 4) */}
          {mainMenu === 'Setting' && subMenu === 'Pickup & Return' && (
            <div className="card p-6 rounded-2xl border-slate/15 space-y-6 animate-fade-in shadow-sm">
              <div className="pb-4 border-b border-slate/15">
                <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber" style={{ fontSize: '22px' }}>schedule_send</span>
                  <span>Pickup & Return Policies</span>
                </h2>
                <p className="text-xs text-slate mt-0.5">Default overdue penalty rule enforced across all rental equipment</p>
              </div>

              {/* Late Fee Checkbox + Conditional Input from Image 4 */}
              <div className="bg-ivory border border-slate/20 rounded-xl p-5 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableLateFee}
                    onChange={(e) => setEnableLateFee(e.target.checked)}
                    className="w-5 h-5 rounded border-slate/30 text-amber focus:ring-amber mt-0.5"
                  />
                  <div>
                    <span className="text-sm font-bold text-navy block">Late Fee / Overdue Penalty</span>
                    <span className="text-xs text-slate">Automatically calculate penalty charges when equipment return timestamp exceeds the authorized window</span>
                  </div>
                </label>

                {enableLateFee && (
                  <div className="pt-3 border-t border-slate/15 pl-8 space-y-3 animate-fade-in">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-bold text-navy">Late Fee $</span>
                      <input
                        type="number"
                        value={lateFeeAmount}
                        onChange={(e) => setLateFeeAmount(e.target.value)}
                        className="input-field w-28 text-xs font-mono font-bold py-1.5"
                        placeholder="25.00"
                      />
                      <span className="text-xs font-bold text-navy">per hour / late</span>
                    </div>

                    <div className="bg-amber/10 border border-amber/30 rounded-lg p-3 text-[11px] text-navy font-medium leading-relaxed">
                      <span className="font-bold block mb-0.5">Policy Enforcement Rule:</span>
                      Show this option only when the late fee/overdue penalty option is check marked. Whatever the amount is mentioned here will be applied to all the products by default. If somebody wants to apply the late fee on a particular product then that can be set from individual product page below.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Setting -> Product (Image 4) */}
          {mainMenu === 'Setting' && subMenu === 'Product' && (
            <div className="card p-6 rounded-2xl border-slate/15 space-y-6 animate-fade-in shadow-sm">
              <div className="pb-4 border-b border-slate/15">
                <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber" style={{ fontSize: '22px' }}>inventory_2</span>
                  <span>Product Configuration & Attributes</span>
                </h2>
                <p className="text-xs text-slate mt-0.5">Enable product variants, color swatches, and custom commercial price lists</p>
              </div>

              <div className="space-y-4">
                {/* Variants -> Attributes link from Image 4 */}
                <div className="bg-ivory border border-slate/20 rounded-xl p-5 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableVariants}
                      onChange={(e) => setEnableVariants(e.target.checked)}
                      className="w-5 h-5 rounded border-slate/30 text-amber focus:ring-amber"
                    />
                    <span className="text-sm font-bold text-navy">Variants</span>
                  </label>

                  {enableVariants && (
                    <div className="pl-8 pt-2 border-t border-slate/15 space-y-2 animate-fade-in">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-purple-600" style={{ fontSize: '18px' }}>arrow_right_alt</span>
                        <button
                          type="button"
                          onClick={() => {
                            triggerToast('Redirecting to Attribute specification page...');
                            router.push('/admin/products');
                          }}
                          className="text-xs font-black text-purple-700 underline hover:text-navy flex items-center gap-1"
                        >
                          <span>Attributes</span>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate font-medium">
                        Enable this option then the Attributes text link below is check marked and once user clicks on the Attribute redirect to the attribute page. Keep the name for the Attribute text link.
                      </p>
                    </div>
                  )}
                </div>

                {/* Price List link from Image 4 */}
                <div className="bg-ivory border border-slate/20 rounded-xl p-5 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enablePriceList}
                      onChange={(e) => setEnablePriceList(e.target.checked)}
                      className="w-5 h-5 rounded border-slate/30 text-amber focus:ring-amber"
                    />
                    <span className="text-sm font-bold text-navy">Price list</span>
                  </label>

                  {enablePriceList && (
                    <div className="pl-8 pt-2 border-t border-slate/15 flex items-center gap-3 animate-fade-in">
                      <span className="material-symbols-outlined text-purple-600" style={{ fontSize: '18px' }}>arrow_right_alt</span>
                      <button
                        type="button"
                        onClick={() => triggerToast('Opening Price List & Tiered Corporate Rate management ledger...')}
                        className="text-xs font-black text-purple-700 underline hover:text-navy flex items-center gap-1"
                      >
                        <span>Price list</span>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Setting -> User (Image 5) */}
          {mainMenu === 'Setting' && subMenu === 'User' && (
            <div className="card p-6 rounded-2xl border-slate/15 space-y-6 animate-fade-in shadow-sm">
              <div className="pb-4 border-b border-slate/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber" style={{ fontSize: '22px' }}>manage_accounts</span>
                    <span>User Profile & Access Role Management</span>
                  </h2>
                  <p className="text-xs text-slate mt-0.5">Modify administrator organization profiles or review corporate GST identity</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="badge-amber text-xs font-bold px-3 py-1">Admin Protected</span>
                </div>
              </div>

              {/* Form fields from Image 5 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate uppercase tracking-wide mb-1.5">Name *</label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="input-field text-xs py-2 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate uppercase tracking-wide mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="input-field text-xs py-2 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate uppercase tracking-wide mb-1.5">Phone *</label>
                  <input
                    type="tel"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="input-field text-xs py-2 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate uppercase tracking-wide mb-1.5">Company Name *</label>
                  <input
                    type="text"
                    value={userForm.company}
                    onChange={(e) => setUserForm({ ...userForm, company: e.target.value })}
                    className="input-field text-xs py-2 font-medium"
                  />
                </div>
              </div>

              {/* Company Logo Upload & GST In from Image 5 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate/10">
                <div>
                  <label className="block text-xs font-bold text-slate uppercase tracking-wide mb-1.5">Company Logo</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-navy text-amber font-bold flex items-center justify-center border border-slate/20">
                      LOGO
                    </div>
                    <button
                      type="button"
                      onClick={() => triggerToast('Opening file selector to upload PNG/JPG Company Logo...')}
                      className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>upload</span>
                      <span>Upload Logo</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate uppercase tracking-wide mb-1.5">GST In / Tax ID *</label>
                  <input
                    type="text"
                    value={userForm.gst}
                    onChange={(e) => setUserForm({ ...userForm, gst: e.target.value })}
                    className="input-field text-xs py-2 font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate uppercase tracking-wide mb-1.5">Corporate Address *</label>
                <textarea
                  value={userForm.address}
                  onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                  rows={2}
                  className="input-field text-xs resize-none font-medium"
                />
              </div>

              {/* Role Radio Selection from Image 5 */}
              <div className="pt-3 border-t border-slate/10 space-y-2">
                <span className="block text-xs font-bold text-slate uppercase tracking-wide">Role Assignment</span>
                <div className="flex items-center gap-6">
                  {(['Admin', 'Vendor', 'Customer'] as const).map((role) => (
                    <label key={role} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="userRole"
                        checked={userForm.role === role}
                        onChange={() => setUserForm({ ...userForm, role })}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs font-bold text-navy">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Annotation reminder box from Image 5 */}
              <div className="bg-slate/5 border border-slate/20 rounded-xl p-4 text-xs text-navy font-semibold space-y-1">
                <p className="flex items-center gap-1.5 text-amber-800 font-bold">
                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: '18px' }}>info</span>
                  <span>Permission Note:</span>
                </p>
                <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-slate font-medium">
                  <li>Settings should only be visible to admin user.</li>
                  <li>For all the users (vendors/customers) this user information page should only be visible under their individual profile section (`/profile` or storefront profile dropdown).</li>
                </ul>
              </div>
            </div>
          )}

          {/* Other tabs fallback */}
          {!(mainMenu === 'Setting' && ['Pickup & Return', 'Product', 'User'].includes(subMenu)) && (
            <div className="card p-8 text-center rounded-2xl border-slate/15 space-y-3">
              <span className="material-symbols-outlined text-slate/40 text-5xl">tune</span>
              <h3 className="text-base font-bold text-navy">{mainMenu} — {subMenu} Settings</h3>
              <p className="text-xs text-slate max-w-sm mx-auto">This sub-module is active and configured. Select Setting → Pickup &amp; Return, Product, or User to inspect exact mockup behaviors.</p>
            </div>
          )}
        </div>

        {/* Right Help Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card p-5 sticky top-24 border-amber/20 shadow-md space-y-4">
            <h3 className="font-bold text-navy text-sm pb-3 border-b border-slate/15 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber shrink-0" style={{ fontSize: '18px' }}>help</span>
              <span>Configuration Guide</span>
            </h3>
            <div className="space-y-3 text-xs text-slate font-medium leading-relaxed">
              <p><strong className="text-navy">Pickup & Return Rule:</strong> Enabling late fee penalty globally enforces automated hourly deductions on late returns.</p>
              <p><strong className="text-navy">Product Attributes:</strong> Enabling `Variants` activates the direct link to the Attribute definition page where colors & attachments are managed.</p>
              <p><strong className="text-navy">Role Segregation:</strong> Only authenticated `Admin` credentials can access this backend configuration dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
