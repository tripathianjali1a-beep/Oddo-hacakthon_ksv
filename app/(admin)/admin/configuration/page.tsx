'use client';
import { useState, useEffect } from 'react';

const sections = [
  {
    title: 'Rental Policy',
    icon: 'policy',
    fields: [
      { key: 'minRental', label: 'Minimum Rental Duration', type: 'select', options: ['1 Day', '3 Days', '7 Days', '1 Month'], defaultValue: '1 Day' },
      { key: 'maxRental', label: 'Maximum Rental Duration', type: 'select', options: ['7 Days', '14 Days', '30 Days', '90 Days', '365 Days'], defaultValue: '30 Days' },
      { key: 'bufferTime', label: 'Buffer Time Between Rentals', type: 'select', options: ['None', '1 Day', '2 Days', '3 Days'], defaultValue: '1 Day' },
    ],
  },
  {
    title: 'Late Fee Settings',
    icon: 'schedule',
    fields: [
      { key: 'gracePeriod', label: 'Grace Period (Days)', type: 'number', placeholder: '0', defaultValue: '3' },
      { key: 'lateFeeType', label: 'Late Fee Type', type: 'select', options: ['Fixed Amount', 'Percentage per Day', 'Percentage per Week'], defaultValue: 'Percentage per Day' },
      { key: 'lateFeeRate', label: 'Late Fee Rate (%/day)', type: 'number', placeholder: '1.5', defaultValue: '1.5' },
      { key: 'maxLateFee', label: 'Maximum Late Fee Cap (₹)', type: 'number', placeholder: '500', defaultValue: '500' },
    ],
  },
  {
    title: 'Deposit Rules',
    icon: 'account_balance',
    fields: [
      { key: 'depositType', label: 'Deposit Calculation', type: 'select', options: ['Fixed Amount', 'Percentage of Order', 'Per Category Rule'], defaultValue: 'Percentage of Order' },
      { key: 'depositPct', label: 'Deposit Percentage (%)', type: 'number', placeholder: '20', defaultValue: '20' },
      { key: 'depositRefund', label: 'Refund Period (Days)', type: 'number', placeholder: '7', defaultValue: '7' },
    ],
  },
  {
    title: 'Notifications',
    icon: 'notifications',
    fields: [
      { key: 'reminderDays', label: 'Return Reminder (Days Before Due)', type: 'number', placeholder: '2', defaultValue: '2' },
      { key: 'overdueFreq', label: 'Overdue Notice Frequency', type: 'select', options: ['Daily', 'Every 2 Days', 'Weekly'], defaultValue: 'Daily' },
    ],
  },
];

// Build defaults map
const DEFAULTS = Object.fromEntries(
  sections.flatMap((s) => s.fields.map((f) => [f.key, f.defaultValue]))
);

export default function AdminConfigPage() {
  const [config, setConfig] = useState<Record<string, string>>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [error, setError] = useState('');

  // Load persisted config from API on mount
  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        // Merge saved values over defaults so any new keys still have defaults
        setConfig({ ...DEFAULTS, ...data });
      })
      .catch(() => setConfig(DEFAULTS))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || 'Failed to save settings.');
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError('Network error. Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(DEFAULTS);
    setSaved(false);
    setError('');
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rentora-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-[1440px]">
        <div className="h-8 bg-surface-high rounded animate-pulse w-48 mb-2" />
        <div className="h-4 bg-surface-high rounded animate-pulse w-72" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1440px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-h1 text-navy">Configuration</h1>
          <p className="text-slate text-sm mt-1">Manage platform settings, policies, and rules.</p>
        </div>
        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          {saved && (
            <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium animate-fade-in">
              <span className="material-symbols-outlined" style={{fontSize:'18px', fontVariationSettings:"'FILL' 1"}}>check_circle</span>
              Settings saved!
            </div>
          )}
          {error && (
            <div className="flex items-center gap-1.5 text-red-600 text-sm">
              <span className="material-symbols-outlined" style={{fontSize:'18px'}}>error</span>
              {error}
            </div>
          )}
          <button onClick={handleSave} disabled={saving} className="btn-primary py-2.5 px-5">
            {saving
              ? <><span className="material-symbols-outlined animate-spin" style={{fontSize:'18px'}}>refresh</span>Saving...</>
              : <><span className="material-symbols-outlined" style={{fontSize:'18px', fontVariationSettings:"'FILL' 1"}}>save</span>Save Changes</>
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
                <span className="material-symbols-outlined" style={{fontSize:'20px', fontVariationSettings: activeSection === i ? "'FILL' 1" : "'FILL' 0"}}>{s.icon}</span>
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
                <span className="material-symbols-outlined text-amber" style={{fontSize:'22px', fontVariationSettings:"'FILL' 1"}}>{section.icon}</span>
                <h2 className="text-sm font-semibold text-navy">{section.title}</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {section.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold text-slate uppercase tracking-wide mb-1.5">{field.label}</label>
                      {field.type === 'select' ? (
                        <select
                          value={config[field.key] ?? field.defaultValue}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          className="input-field text-sm"
                        >
                          {field.options?.map((opt) => <option key={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={config[field.key] ?? field.defaultValue}
                          onChange={(e) => handleChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="input-field text-sm"
                          min="0"
                          step="any"
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
              <span className="material-symbols-outlined text-red-500" style={{fontSize:'20px'}}>warning</span>
              <h2 className="text-sm font-semibold text-red-700">Danger Zone</h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between p-4 border border-red-100 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-navy">Reset All Settings</p>
                  <p className="text-xs text-slate">Revert all configuration to factory defaults.</p>
                </div>
                <button onClick={handleReset} className="btn-danger text-xs py-2 px-4">Reset</button>
              </div>
              <div className="flex items-center justify-between p-4 border border-red-100 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-navy">Export Configuration</p>
                  <p className="text-xs text-slate">Download all settings as a JSON backup.</p>
                </div>
                <button onClick={handleExport} className="btn-secondary text-xs py-2 px-4">
                  <span className="material-symbols-outlined" style={{fontSize:'16px'}}>download</span>
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
