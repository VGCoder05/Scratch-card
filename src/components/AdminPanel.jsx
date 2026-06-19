import { useState, useEffect } from 'react';
import PrizeEngine from '../utils/PrizeEngine';
import api from '../services/api';

export default function AdminPanel({ config, saveConfig, settings, saveSettings, onExit }) {
  const [tab, setTab] = useState('categories');
  const [newCat, setNewCat] = useState({
    key: '',
    label: '',
    icon: '',
    color: '#ffd700',
    sublabel: '',
  });
  const [newPrize, setNewPrize] = useState({});
  const [overrideCat, setOverrideCat] = useState('');
  const [overridePrize, setOverridePrize] = useState('');
  const [currentOverride, setCurrentOverride] = useState(null);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    loadOverride();
    if (tab === 'sessions') loadSessions();
  }, [tab]);

  const loadOverride = async () => {
    try {
      const data = await api.getOverride();
      setCurrentOverride(data);
    } catch (error) {
      console.error('Error loading override:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const addCategory = () => {
    const k = newCat.key.trim().toLowerCase().replace(/\s+/g, '_');
    if (!k || !newCat.label || !newCat.icon) return alert('Fill key, label & icon');
    if (config[k]) return alert('Key already exists');
    const { key, ...rest } = newCat;
    saveConfig({ ...config, [k]: { ...rest, prizes: [] } });
    setNewCat({ key: '', label: '', icon: '', color: '#ffd700', sublabel: '' });
  };

  const deleteCategory = key => {
    if (!confirm(`Delete "${config[key].label}"?`)) return;
    const updated = { ...config };
    delete updated[key];
    saveConfig(updated);
  };

  const addPrize = catKey => {
    const np = newPrize[catKey] || { value: '', weight: '' };
    if (!np.value.trim() || !np.weight) return alert('Fill prize value and weight');
    const updated = { ...config };
    updated[catKey] = {
      ...updated[catKey],
      prizes: [...updated[catKey].prizes, { value: np.value, weight: parseInt(np.weight) }],
    };
    saveConfig(updated);
    setNewPrize(p => ({ ...p, [catKey]: { value: '', weight: '' } }));
  };

  const deletePrize = (catKey, idx) => {
    const updated = { ...config };
    updated[catKey] = {
      ...updated[catKey],
      prizes: updated[catKey].prizes.filter((_, i) => i !== idx),
    };
    saveConfig(updated);
  };

  const updateSetting = (key, val) => saveSettings({ ...settings, [key]: val });
  const toggleSetting = key => saveSettings({ ...settings, [key]: !settings[key] });

  const setOverride = async () => {
    try {
      await api.setOverride({ categoryKey: overrideCat, prize: overridePrize });
      alert(
        `✅ Override set!\n\nNext person who picks "${config[overrideCat].label}" will win:\n${overridePrize}`
      );
      setOverrideCat('');
      setOverridePrize('');
      loadOverride();
    } catch (error) {
      console.error('Error setting override:', error);
    }
  };

  const clearOverride = async () => {
    try {
      await api.setOverride(null);
      loadOverride();
    } catch (error) {
      console.error('Error clearing override:', error);
    }
  };

  const tabs = [
    { id: 'categories', label: '🗂 Categories' },
    { id: 'control', label: '🎯 Prize Control' },
    { id: 'social', label: '📲 Social Gate' },
    { id: 'settings', label: '⚙️ Settings' },
    { id: 'sessions', label: '📊 Sessions' },
  ];

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-title">⚙️ Admin Panel</div>
        <button className="btn btn-ghost btn-sm" onClick={onExit}>
          ← Exit
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', width: '100%', maxWidth: 680 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            className={`btn btn-sm ${tab === t.id ? 'btn-gold' : 'btn-ghost'}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CATEGORIES ── */}
      {tab === 'categories' && (
        <div className="admin-section">
          <div className="section-head">Manage Categories &amp; Prizes</div>

          {Object.keys(config).length === 0 && (
            <div style={{ color: 'var(--muted)', textAlign: 'center', padding: 20 }}>
              No categories yet.
            </div>
          )}

          {Object.entries(config).map(([key, cat]) => (
            <div key={key} className="cat-admin-card">
              <div className="cat-admin-head">
                <div className="cat-admin-name">
                  <span style={{ fontSize: '1.4rem' }}>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className="badge">key: {key}</span>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => deleteCategory(key)}>
                  🗑 Delete
                </button>
              </div>

              {cat.prizes.length === 0 && (
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 10 }}>
                  No prizes yet
                </div>
              )}
              {PrizeEngine.getOdds(cat.prizes).map((p, i) => (
                <div key={i} className="prize-row">
                  <span style={{ fontSize: '0.88rem', flex: 1, color: '#eee' }}>{p.value}</span>
                  <span className="weight-badge">
                    ⚖ {p.weight} ({p.pct}%)
                  </span>
                  <button className="btn btn-danger btn-sm" onClick={() => deletePrize(key, i)}>
                    ✕
                  </button>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <input
                  placeholder="Prize value (e.g. ₹5,000 OFF)"
                  value={(newPrize[key] || {}).value || ''}
                  onChange={e =>
                    setNewPrize(p => ({ ...p, [key]: { ...(p[key] || {}), value: e.target.value } }))
                  }
                  style={{
                    flex: 2,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none',
                    minWidth: 120,
                  }}
                />
                <input
                  placeholder="Weight"
                  type="number"
                  value={(newPrize[key] || {}).weight || ''}
                  onChange={e =>
                    setNewPrize(p => ({ ...p, [key]: { ...(p[key] || {}), weight: e.target.value } }))
                  }
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none',
                    minWidth: 70,
                  }}
                />
                <button className="btn btn-gold btn-sm" onClick={() => addPrize(key)}>
                  + Add
                </button>
              </div>
            </div>
          ))}

          <div className="add-form">
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--gold)', marginBottom: 12 }}>
              + Add New Category
            </div>
            <div className="form-grid">
              <input
                placeholder="Key (e.g. fridge)"
                value={newCat.key}
                onChange={e => setNewCat(c => ({ ...c, key: e.target.value }))}
              />
              <input
                placeholder="Label (e.g. Fridge)"
                value={newCat.label}
                onChange={e => setNewCat(c => ({ ...c, label: e.target.value }))}
              />
              <input
                placeholder="Emoji icon (e.g. 🧊)"
                value={newCat.icon}
                onChange={e => setNewCat(c => ({ ...c, icon: e.target.value }))}
              />
              <input
                placeholder="Sub-label (e.g. OFF on…)"
                value={newCat.sublabel}
                onChange={e => setNewCat(c => ({ ...c, sublabel: e.target.value }))}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Theme Color:</label>
              <input
                type="color"
                value={newCat.color}
                onChange={e => setNewCat(c => ({ ...c, color: e.target.value }))}
                style={{
                  width: 40,
                  height: 30,
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: 'none',
                }}
              />
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{newCat.color}</span>
            </div>
            <button className="btn btn-gold" onClick={addCategory}>
              + Add Category
            </button>
          </div>
        </div>
      )}

      {/* ── PRIZE CONTROL ── */}
      {tab === 'control' && (
        <div className="admin-section">
          <div className="section-head">🎯 Prize Control — Override Next Scratch</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
            Set what the <strong>next person</strong> will win (works for anyone, even without UID).
            <br />
            After one use, it auto-resets to random.
          </div>

          {currentOverride?.active ? (
            <div
              className="panel"
              style={{ marginBottom: 16, background: 'rgba(255,215,0,0.08)', borderColor: 'var(--gold)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 4 }}>
                    ACTIVE OVERRIDE
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold)' }}>
                    {config[currentOverride.categoryKey]?.icon} {currentOverride.prize}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
                    Category: {config[currentOverride.categoryKey]?.label}
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={clearOverride}>
                  ✕ Clear Override
                </button>
              </div>
            </div>
          ) : (
            <div className="panel" style={{ marginBottom: 16, background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'center', padding: '10px 0' }}>
                ⚪ No override active — prizes are random based on weights
              </div>
            </div>
          )}

          <div className="panel">
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: 12 }}>
              Set New Override
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                1. Select Category
              </label>
              <select
                value={overrideCat}
                onChange={e => {
                  setOverrideCat(e.target.value);
                  setOverridePrize('');
                }}
                className="select-input"
              >
                <option value="">— Choose a category —</option>
                {Object.entries(config).map(([key, cat]) => (
                  <option key={key} value={key}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {overrideCat && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                  2. Select Exact Prize
                </label>
                <select value={overridePrize} onChange={e => setOverridePrize(e.target.value)} className="select-input">
                  <option value="">— Choose exact prize —</option>
                  {config[overrideCat].prizes.map((p, i) => (
                    <option key={i} value={p.value}>
                      {p.value}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button className="btn btn-gold btn-full" disabled={!overrideCat || !overridePrize} onClick={setOverride}>
              🎯 Set Override
            </button>

            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 10, lineHeight: 1.5, textAlign: 'center' }}>
              💡 Tip: Set this right before a customer walks in, then hand them the QR
            </div>
          </div>
        </div>
      )}

      {/* ── SOCIAL ── */}
      {tab === 'social' && (
        <div className="admin-section">
          <div className="section-head">Social Gate Configuration</div>
          <div className="panel social-config">
            <div className="toggle-row">
              <span className="toggle-label">📸 Require Instagram Follow</span>
              <label className="toggle">
                <input type="checkbox" checked={settings.requireIG} onChange={() => toggleSetting('requireIG')} />
                <span className="slider" />
              </label>
            </div>
            <div className="toggle-row">
              <span className="toggle-label">💬 Require WhatsApp Join</span>
              <label className="toggle">
                <input type="checkbox" checked={settings.requireWA} onChange={() => toggleSetting('requireWA')} />
                <span className="slider" />
              </label>
            </div>
            <div style={{ marginTop: 16 }}>
              <label>Instagram Handle (shown to users)</label>
              <input
                value={settings.igHandle}
                onChange={e => updateSetting('igHandle', e.target.value)}
                placeholder="your_username"
              />
              <label>Instagram Profile Link</label>
              <input
                value={settings.igLink}
                onChange={e => updateSetting('igLink', e.target.value)}
                placeholder="https://instagram.com/..."
              />
              <label>WhatsApp Join Link</label>
              <input
                value={settings.waLink}
                onChange={e => updateSetting('waLink', e.target.value)}
                placeholder="https://wa.me/..."
              />
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS ── */}
      {tab === 'settings' && (
        <div className="admin-section">
          <div className="section-head">App Settings</div>
          <div className="panel social-config">
            <label>Card Title</label>
            <input value={settings.cardTitle} onChange={e => updateSetting('cardTitle', e.target.value)} />
            <label>Card Subtitle</label>
            <input value={settings.cardSubtitle} onChange={e => updateSetting('cardSubtitle', e.target.value)} />
          </div>
          <div style={{ height: 16 }} />
          <div className="section-head">🔐 Secret Keys</div>
          <div className="panel social-config">
            <label>
              Admin Key — URL: <code style={{ color: 'var(--gold)' }}>?admin=YOUR_KEY</code>
            </label>
            <input
              type="password"
              value={settings.adminKey}
              onChange={e => updateSetting('adminKey', e.target.value)}
              placeholder="Admin secret key"
            />
            <label>
              Skip Gate Key — URL: <code style={{ color: 'var(--gold)' }}>?skip=YOUR_KEY</code>
            </label>
            <input
              type="password"
              value={settings.skipKey}
              onChange={e => updateSetting('skipKey', e.target.value)}
              placeholder="Skip gate key"
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.6, marginTop: 4 }}>
              📌 VIP link example: <code style={{ color: '#aaa' }}>yoursite.com?skip=SKIP2024</code>
            </div>
          </div>
        </div>
      )}

      {/* ── SESSIONS ── */}
      {tab === 'sessions' && (
        <div className="admin-section">
          <div className="section-head">📊 Scratch Sessions</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 12 }}>
            Real-time data from MongoDB
          </div>
          {sessions.length === 0 ? (
            <div style={{ color: 'var(--muted)', padding: 20, textAlign: 'center' }}>No sessions yet.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--gold)' }}>
                    <th style={{ padding: '8px 10px' }}>UID</th>
                    <th style={{ padding: '8px 10px' }}>Category</th>
                    <th style={{ padding: '8px 10px' }}>Prize</th>
                    <th style={{ padding: '8px 10px' }}>Skip</th>
                    <th style={{ padding: '8px 10px' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '8px 10px', color: '#aaa' }}>{s.uid || '—'}</td>
                      <td style={{ padding: '8px 10px' }}>
                        {s.categoryIcon} {s.category}
                      </td>
                      <td style={{ padding: '8px 10px', color: 'var(--gold)', fontWeight: 700 }}>{s.prize}</td>
                      <td style={{ padding: '8px 10px' }}>{s.gateSkipped ? '⚡ Yes' : '—'}</td>
                      <td style={{ padding: '8px 10px', color: 'var(--muted)' }}>
                        {new Date(s.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}