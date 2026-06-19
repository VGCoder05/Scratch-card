import { useState } from 'react';

export default function AdminLogin({ correctKey, onSuccess }) {
  const [input, setInput] = useState('');
  const [err, setErr] = useState(false);

  const attempt = () => {
    if (input === correctKey) {
      onSuccess();
    } else {
      setErr(true);
      setTimeout(() => setErr(false), 2000);
    }
  };

  return (
    <div className="page">
      <div className="login-box">
        <div className="title" style={{ fontSize: '1.6rem' }}>
          ⚙️ Admin Access
        </div>
        <div className="subtitle">Enter your admin key to continue</div>
        <input
          type="password"
          value={input}
          placeholder="• • • • • • • •"
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && attempt()}
        />
        {err && <div className="error-msg">❌ Incorrect key. Try again.</div>}
        <button className="btn btn-gold btn-full" onClick={attempt}>
          Unlock Panel →
        </button>
        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
          Tip: use URL <code>?admin=YOUR_KEY</code> to auto-unlock
        </div>
      </div>
    </div>
  );
}