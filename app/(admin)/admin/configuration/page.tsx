'use client';
import { useState } from 'react';

const sections = [
  {
    title: 'Rental Policy',
    icon: 'policy',
    fields: [
      { key: 'minRental', label: 'Minimum Rental Duration', type: 'select', options: ['1 Day', '3 Days', '7 Days', '1 Month'], value: '1 Day' },
      { key: 'maxRental', label: 'Maximum Rental Duration', type: 'select', options: ['7 Days', '14 Days', '30 Days', '90 Days', '365 Days'], value: '30 Days' },
      { key: 'bufferTime', label: 'Buffer Time Between Rentals', type: 'select', options: ['None', '1 Day', '2 Days', '3 Days'], value: '1 Day' },
    ],
  },
  {
    title: 'Late Fee Settings',
    icon: 'schedule',
    fields: [
      { key: 'gracePeriod', label: 'Grace Period (Days)', type: 'number', placeholder: '0', value: '3' },
      { key: 'lateFeeType', label: 'Late Fee Type', type: 'select', options: ['Fixed Amount', 'Percentage per Day', 'Percentage per Week'], value: 'Percentage per Day' },
      { key: 'lateFeeRate', label: 'Late Fee Rate (%/day)', type: 'number', placeholder: '1.5', value: '1.5' },
      { key: 'maxLateFee', label: 'Maximum Late Fee Cap ($)', type: 'number', placeholder: '500', value: '500' },
    ],
  },
  {
    title: 'Deposit Rules',
    icon: 'account_balance',
    fields: [
      { key: 'depositType', label: 'Deposit Calculation', type: 'select', options: ['Fixed Amount', 'Percentage of Order', 'Per Category Rule'], value: 'Percentage of Order' },
      { key: 'depositPct', label: 'Deposit Percentage (%)', type: 'number', placeholder: '20', value: '20' },
      { key: 'depositRefund', label: 'Refund Period (Days)', type: 'number', placeholder: '7', value: '7' },
    ],
  },
  {
    title: 'Notifications',
    icon: 'notifications',
    fields: [
      { key: 'reminderDays', label: 'Return Reminder (Days Before Due)', type: 'number', placeholder: '2', value: '2' },
      { key: 'overdueFreq', label: 'Overdue Notice Frequency', type: 'select', options: ['Daily', 'Every 2 Days', 'Weekly'], value: 'Daily' },
    ],
  },
];

export default function AdminConfigPage() {
  const [config, setConfig] = useState(() =>
    Object.fromEntries(sections.flatMap((s) => s.fields.map((f) => [f.key, f.value])))
  );
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 max-w-[1440px] relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white px-5 py-3.5 rounded-xl shadow-2xl border border-amber/30 flex items-center gap-3 animate-slide-up">
          <span className="material-symbols-outlined shrink-0 text-amber" style={{ fontSize: '20px' }}>check_circle</span>
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-h1 text-navy">Configuration</h1>
          <p className="text-slate text-sm mt-1">Manage platform settings, policies, and rules.</p>
        </div>
        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          {saved && (
            <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium animate-fade-in">
              <span className="material-symbols-outlined shrink-0" style={{fontSize:'18px', fontVariationSettings:"'FILL' 1"}}>check_circle</span>
              <span>Settings saved!</span>
            </div>
          )}
          <button onClick={handleSave} disabled={saving} className="btn-primary py-2.5 px-5 flex items-center justify-center gap-1.5">
            {saving
              ? <><span className="material-symbols-outlined shrink-0 animate-spin" style={{fontSize:'18px'}}>refresh</span><span>Saving...</span></>
              : <><span className="material-symbols-outlined shrink-0" style={{fontSize:'18px', fontVariationSettings:"'FILL' 1"}}>save</span><span>Save Changes</span></>
            }
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Nav */}
        <div className="lg:col-span-1">
          <div className="card rounded-xl overflow-hidden">
            {sections.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveSection(i)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-l-4 ${activeSection === i ? 'border-amber bg-amber/5 text-navy' : 'border-transparent text-slate hover:text-navy hover:bg-ivory'}`}
              >
                <span className="material-symbols-outlined shrink-0" style={{fontSize:'20px', fontVariationSettings: activeSection === i ? "'FILL' 1" : "'FILL' 0"}}>{s.icon}</span>
                <span className="text-sm font-medium">{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Config Panel */}
        <div className="lg:col-span-3 space-y-5">
          {sections.map((section, si) => (
            <div key={si} className={`card rounded-xl overflow-hidden transition-all ${si === activeSection ? 'block' : 'hidden lg:block'}`}>
              <div className="px-6 py-4 border-b border-slate/10 flex items-center gap-2.5 bg-ivory">
                <span className="material-symbols-outlined shrink-0 text-amber" style={{fontSize:'22px', fontVariationSettings:"'FILL' 1"}}>{section.icon}</span>
                <h2 className="text-sm font-semibold text-navy">{section.title}</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {section.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          value={config[field.key]}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          className="input-field text-sm"
                        >
                          {field.options?.map((opt) => <option key={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={config[field.key]}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="input-field text-sm"
                          min="0"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Danger Zone */}
          <div className="card rounded-xl overflow-hidden border-red-100">
            <div className="px-6 py-4 border-b border-red-100 bg-red-50/50 flex items-center gap-2.5">
              <span className="material-symbols-outlined shrink-0 text-red-500" style={{fontSize:'20px'}}>warning</span>
              <h2 className="text-sm font-semibold text-red-700">Danger Zone</h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between p-4 border border-red-100 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-navy">Reset All Settings</p>
                  <p className="text-xs text-slate">Revert all configuration to factory defaults.</p>
                </div>
                <button
                  onClick={() => {
                    setConfig(Object.fromEntries(sections.flatMap((s) => s.fields.map((f) => [f.key, f.value]))));
                    triggerToast('All configuration settings reset to factory defaults.');
                  }}
                  className="btn-danger text-xs py-2 px-4 flex items-center justify-center"
                >
                  <span>Reset</span>
                </button>
              </div>
              <div className="flex items-center justify-between p-4 border border-red-100 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-navy">Export Configuration</p>
                  <p className="text-xs text-slate">Download all settings as a JSON backup.</p>
                </div>
                <button
                  onClick={() => triggerToast('Exporting system configuration backup to JSON file...')}
                  className="btn-secondary text-xs py-2 px-4 flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined shrink-0" style={{fontSize:'16px'}}>download</span>
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
