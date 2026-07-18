'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type MainMenu = 'Order' | 'Schedule' | 'Product' | 'Report' | 'Setting';
type SubMenu = string;

interface TemplateLine {
  id: number;
  product: string;
  quantity: number;
  unit: string;
}

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

  // Setting -> Quotation Template states from Image 4
  const [selectedTemplate, setSelectedTemplate] = useState('Home Rental Furniture');
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateForm, setTemplateForm] = useState({
    name: 'Home Rental Furniture',
    validity: '30',
    paymentTerms: '50',
    tab: 'Lines' as 'Lines' | 'Quote Builder',
  });
  const [templateLines, setTemplateLines] = useState<TemplateLine[]>([
    { id: 1, product: 'Executive Office Desk Set', quantity: 5, unit: 'Units' },
    { id: 2, product: 'Aeron Ergonomic Mesh Chair', quantity: 10, unit: 'Units' },
  ]);

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
            <p className="text-xs text-slate mt-0.5">Configure system policies, late fees, variants, quotation templates, and enterprise role permissions</p>
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mainMenu === main ? 'bg-navy text-white shadow-sm scale-105' : 'text-slate hover:bg-slate/10 hover:text-navy'
              }`}
            >
              {main}
            </button>
          ))}
        </div>

        {/* Sub-navigation items */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate/10 overflow-x-auto pb-1">
          {menuStructure[mainMenu].map((sub) => (
            <button
              key={sub}
              onClick={() => setSubMenu(sub)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                subMenu === sub ? 'bg-purple-100 text-purple-800 border border-purple-300 font-bold' : 'text-slate hover:text-navy'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Pickup & Return Settings from Image 4 */}
          {mainMenu === 'Setting' && subMenu === 'Pickup & Return' && (
            <div className="card p-6 border-slate/15 shadow-sm space-y-6 animate-fade-in">
              <div className="pb-4 border-b border-slate/15">
                <h2 className="text-base font-bold text-navy flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600" style={{ fontSize: '22px' }}>schedule</span>
                  <span>Pickup & Return Policies</span>
                </h2>
                <p className="text-xs text-slate mt-0.5">Enforce global late fee rules and penalty calculation structures across your rental fleet.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-ivory p-4 rounded-xl border border-slate/15">
                  <input
                    type="checkbox"
                    id="lateFeeRule"
                    checked={enableLateFee}
                    onChange={(e) => setEnableLateFee(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate/30 text-purple-600 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="lateFeeRule" className="text-xs font-bold text-navy cursor-pointer">
                      Late Fee / Overdue Penalty
                    </label>
                    <p className="text-[11px] text-slate mt-0.5">
                      Automatically calculate and deduct penalties from customer security deposit upon late return.
                    </p>

                    {/* Conditional Input Box from Image 4 note */}
                    {enableLateFee && (
                      <div className="mt-3 pt-3 border-t border-slate/15 flex items-center gap-3">
                        <span className="text-xs font-bold text-navy">Late Fee $</span>
                        <input
                          type="number"
                          value={lateFeeAmount}
                          onChange={(e) => setLateFeeAmount(e.target.value)}
                          className="input-field text-xs py-1.5 w-24 text-center font-bold font-currency"
                        />
                        <span className="text-xs font-semibold text-slate">per hour / late</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-amber/10 border border-amber/30 rounded-xl p-4 text-xs text-amber-900 font-medium">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-amber shrink-0" style={{ fontSize: '18px' }}>info</span>
                    <span>Note on Item-Level Overrides:</span>
                  </p>
                  <p className="text-[11px] text-slate">
                    If this global setting is checked and numerical late fees are set, it acts as the default penalty. However, individual products with custom late fee definitions on their Product Configuration page will take precedence over this rate.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. Product Settings from Image 4 */}
          {mainMenu === 'Setting' && subMenu === 'Product' && (
            <div className="card p-6 border-slate/15 shadow-sm space-y-6 animate-fade-in">
              <div className="pb-4 border-b border-slate/15">
                <h2 className="text-base font-bold text-navy flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600" style={{ fontSize: '22px' }}>category</span>
                  <span>Product Attributes & Pricing Structure</span>
                </h2>
                <p className="text-xs text-slate mt-0.5">Toggle variant configuration swatches and tiered corporate price lists.</p>
              </div>

              <div className="space-y-4">
                {/* Variants Rule */}
                <div className="flex items-start justify-between bg-ivory p-4 rounded-xl border border-slate/15">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="variantsRule"
                      checked={enableVariants}
                      onChange={(e) => setEnableVariants(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate/30 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <label htmlFor="variantsRule" className="text-xs font-bold text-navy cursor-pointer">
                        Variants (Colors, Sizes, Attachment Kits)
                      </label>
                      <p className="text-[11px] text-slate mt-0.5">
                        Allow equipment to have multiple configurable options and optional add-ons selected before booking.
                      </p>
                    </div>
                  </div>
                  {enableVariants && (
                    <button
                      type="button"
                      onClick={() => router.push('/admin/products?tab=attributes')}
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-300 flex items-center gap-1 shrink-0"
                    >
                      <span>Attributes</span>
                      <span className="material-symbols-outlined text-sm" style={{ fontSize: '14px' }}>arrow_outward</span>
                    </button>
                  )}
                </div>

                {/* Price List Rule */}
                <div className="flex items-start justify-between bg-ivory p-4 rounded-xl border border-slate/15">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="priceListRule"
                      checked={enablePriceList}
                      onChange={(e) => setEnablePriceList(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-slate/30 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <label htmlFor="priceListRule" className="text-xs font-bold text-navy cursor-pointer">
                        Price list (Tiered Corporate Rates & Discounts)
                      </label>
                      <p className="text-[11px] text-slate mt-0.5">
                        Activate duration-based discount rates and special customer group price lists during quotation setup.
                      </p>
                    </div>
                  </div>
                  {enablePriceList && (
                    <button
                      type="button"
                      onClick={() => router.push('/admin/products')}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-300 flex items-center gap-1 shrink-0"
                    >
                      <span>Price lists</span>
                      <span className="material-symbols-outlined text-sm" style={{ fontSize: '14px' }}>arrow_outward</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. User Settings from Image 5 */}
          {mainMenu === 'Setting' && subMenu === 'User' && (
            <div className="card p-6 border-slate/15 shadow-sm space-y-6 animate-fade-in">
              <div className="pb-4 border-b border-slate/15 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-navy flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: '22px' }}>manage_accounts</span>
                    <span>User Profile & Role Permissions</span>
                  </h2>
                  <p className="text-xs text-slate mt-0.5">Manage operator information, tax credentials, and system access role.</p>
                </div>
                <div className="flex items-center gap-2 bg-ivory px-3 py-1.5 rounded-xl border border-slate/20">
                  <span className="material-symbols-outlined text-purple-600" style={{ fontSize: '18px' }}>shield</span>
                  <span className="text-xs font-bold text-navy">Active Role: {userForm.role}</span>
                </div>
              </div>

              {/* Form grid from Image 5 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate uppercase mb-1">Name</label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="input-field text-xs py-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="input-field text-xs py-2 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate uppercase mb-1">Phone</label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="input-field text-xs py-2 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate uppercase mb-1">Company Name</label>
                  <input
                    type="text"
                    value={userForm.company}
                    onChange={(e) => setUserForm({ ...userForm, company: e.target.value })}
                    className="input-field text-xs py-2 font-bold text-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate uppercase mb-1">GST In / Tax ID</label>
                  <input
                    type="text"
                    value={userForm.gst}
                    onChange={(e) => setUserForm({ ...userForm, gst: e.target.value })}
                    className="input-field text-xs py-2 font-mono font-semibold text-purple-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate uppercase mb-1">Corporate Address</label>
                  <input
                    type="text"
                    value={userForm.address}
                    onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                    className="input-field text-xs py-2 font-medium"
                  />
                </div>
              </div>

              {/* Logo Upload Box from Image 5 */}
              <div className="p-4 bg-ivory rounded-xl border border-slate/15 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                    LX
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-navy">Corporate Brand Logo</h4>
                    <p className="text-[11px] text-slate">Appears on quotations, invoices, and email correspondence.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => triggerToast('Opening file browser to upload company logo PNG/SVG...')}
                  className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload</span>
                  <span>Upload Logo</span>
                </button>
              </div>

              {/* Role Selection Radio from Image 5 */}
              <div className="pt-4 border-t border-slate/15 space-y-3">
                <label className="block text-xs font-bold text-navy uppercase">Assign System Access Role:</label>
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

          {/* 4. Quotation Template from Image 4 */}
          {mainMenu === 'Setting' && subMenu === 'Quotation Template' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in">
              {/* Left List Pane (`Template`) from Image 4 */}
              <div className="xl:col-span-5 card p-5 border-slate/15 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplate('New Custom Rental Template');
                      setTemplateForm({ name: 'New Custom Rental Template', validity: '14', paymentTerms: '30', tab: 'Lines' });
                      triggerToast('Created new quotation template draft.');
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px' }}>add</span>
                    <span>New</span>
                  </button>
                  <span className="text-xs font-black text-navy uppercase tracking-wide">Quotation Template</span>
                </div>

                <div className="relative">
                  <span className="material-symbols-outlined shrink-0 absolute left-3 top-1/2 -translate-y-1/2 text-slate/40" style={{ fontSize: '18px' }}>search</span>
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-ivory border border-slate/20 rounded-lg text-navy font-medium"
                  />
                </div>

                <div className="border border-slate/20 rounded-xl overflow-hidden">
                  <div className="bg-navy text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider">
                    Template
                  </div>
                  <div className="divide-y divide-slate/10 bg-white">
                    {['Home Rental Furniture', 'Office Rental Furniture'].map((tName) => (
                      <div
                        key={tName}
                        onClick={() => {
                          setSelectedTemplate(tName);
                          setTemplateForm({ ...templateForm, name: tName });
                          triggerToast(`Selected template: ${tName}`);
                        }}
                        className={`p-3.5 text-xs font-bold cursor-pointer transition-colors flex items-center justify-between ${
                          selectedTemplate === tName ? 'bg-purple-100 text-purple-900 border-l-4 border-purple-600' : 'text-navy hover:bg-amber/5'
                        }`}
                      >
                        <span>{tName}</span>
                        {selectedTemplate === tName && (
                          <span className="material-symbols-outlined text-purple-600 text-sm">arrow_forward_ios</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Details Pane (When template is clicked/opened) from Image 4 */}
              <div className="xl:col-span-7 card rounded-xl overflow-hidden border-slate/15 shadow-md flex flex-col">
                <div className="bg-navy text-white px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded bg-purple-600 text-[10px] font-black uppercase tracking-wider">New</span>
                    <span className="text-sm font-bold">Quotation Template</span>
                    <button
                      type="button"
                      onClick={() => triggerToast(`Template ${templateForm.name} saved!`)}
                      className="w-6 h-6 rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-xs">check</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerToast('Cancelled template edit')}
                      className="w-6 h-6 rounded bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                  <span className="text-xs font-mono text-slate-300">{templateForm.name}</span>
                </div>

                <div className="p-6 space-y-6 flex-1 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-ivory/70 border border-slate/15 rounded-xl p-5">
                    <div className="space-y-3 border-r border-slate/15 pr-4">
                      <label className="block text-xs font-bold text-slate uppercase">Template</label>
                      <input
                        type="text"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                        className="input-field text-xs py-2 font-bold text-navy bg-white border-b-2 border-emerald-600"
                      />
                    </div>

                    <div className="space-y-3 text-xs font-bold text-navy">
                      <div className="text-slate uppercase font-bold text-[11px] pb-1 border-b border-slate/15">Confirmation</div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate">Quotation Validity</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={templateForm.validity}
                            onChange={(e) => setTemplateForm({ ...templateForm, validity: e.target.value })}
                            className="input-field text-xs py-1 w-16 text-center bg-white"
                          />
                          <span>Days</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate">Payment Terms</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={templateForm.paymentTerms}
                            onChange={(e) => setTemplateForm({ ...templateForm, paymentTerms: e.target.value })}
                            className="input-field text-xs py-1 w-16 text-center bg-white"
                          />
                          <span>%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabs: [ Lines ] [ Quote Builder ] */}
                  <div className="border border-slate/20 rounded-xl overflow-hidden">
                    <div className="bg-surface-high px-4 pt-2 border-b border-slate/15 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setTemplateForm({ ...templateForm, tab: 'Lines' })}
                        className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                          templateForm.tab === 'Lines' ? 'border-purple-600 text-purple-700 bg-white' : 'border-transparent text-slate hover:text-navy'
                        }`}
                      >
                        Lines
                      </button>
                      <button
                        type="button"
                        onClick={() => setTemplateForm({ ...templateForm, tab: 'Quote Builder' })}
                        className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                          templateForm.tab === 'Quote Builder' ? 'border-purple-600 text-purple-700 bg-white' : 'border-transparent text-slate hover:text-navy'
                        }`}
                      >
                        Quote Builder
                      </button>
                    </div>

                    {templateForm.tab === 'Lines' ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-ivory text-[11px] uppercase text-slate font-bold border-b border-slate/15">
                            <tr>
                              <th className="py-2.5 px-4">Product</th>
                              <th className="py-2.5 px-4 text-center">Quantity</th>
                              <th className="py-2.5 px-4">Unit</th>
                              <th className="py-2.5 px-4 w-10 text-center"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate/10 font-semibold text-navy">
                            {templateLines.map((line) => (
                              <tr key={line.id} className="hover:bg-amber/5">
                                <td className="py-3 px-4">{line.product}</td>
                                <td className="py-3 px-4 text-center">{line.quantity}</td>
                                <td className="py-3 px-4">{line.unit}</td>
                                <td className="py-3 px-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => setTemplateLines(templateLines.filter((l) => l.id !== line.id))}
                                    className="text-rose-600 hover:text-rose-800"
                                    title="Delete Line"
                                  >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="p-3 bg-ivory/50 border-t border-slate/15">
                          <button
                            type="button"
                            onClick={() => {
                              const newId = Date.now();
                              setTemplateLines([...templateLines, { id: newId, product: 'Ergonomic Standing Desk', quantity: 2, unit: 'Units' }]);
                              triggerToast('Added product line item to template');
                            }}
                            className="text-xs font-bold text-purple-700 hover:underline"
                          >
                            + Add a product line
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-slate font-semibold space-y-2">
                        <span className="material-symbols-outlined text-4xl text-purple-600">build_circle</span>
                        <p>Interactive drag-and-drop Quote Builder canvas active for {templateForm.name}.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs fallback */}
          {!(mainMenu === 'Setting' && ['Pickup & Return', 'Product', 'User', 'Quotation Template'].includes(subMenu)) && (
            <div className="card p-8 text-center rounded-2xl border-slate/15 space-y-3">
              <span className="material-symbols-outlined text-slate/40 text-5xl">tune</span>
              <h3 className="text-base font-bold text-navy">{mainMenu} — {subMenu} Settings</h3>
              <p className="text-xs text-slate max-w-sm mx-auto">This sub-module is active and configured. Select Setting → Pickup &amp; Return, Product, User, or Quotation Template to inspect exact mockup behaviors.</p>
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
              <p><strong className="text-navy">Quotation Templates:</strong> Pre-packaged equipment bundles with standard validity dates and payment terms.</p>
              <p><strong className="text-navy">Role Segregation:</strong> Only authenticated `Admin` credentials can access this backend configuration dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
