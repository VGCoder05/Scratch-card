import { useState } from 'react';

export default function SocialGate({ settings, onPass }) {
  const [igDone, setIgDone] = useState(false);
  const [waDone, setWaDone] = useState(false);

  const needIG = settings.requireIG;
  const needWA = settings.requireWA;
  const canPass = (!needIG || igDone) && (!needWA || waDone);

  const openIG = () => {
    window.open(settings.igLink, '_blank');
    setTimeout(() => setIgDone(true), 1500);
  };

  const openWA = () => {
    window.open(settings.waLink, '_blank');
    setTimeout(() => setWaDone(true), 1500);
  };

  return (
    <div className="page">
      <div style={{ textAlign: 'center' }}>
        <div className="title">🎟 Scratch &amp; Win</div>
        <div className="subtitle" style={{ marginTop: 6 }}>
          Complete the steps below to unlock your card
        </div>
      </div>

      <div className="gate-card">
        {needIG && (
          <button className={`social-btn ig ${igDone ? 'done' : ''}`} onClick={openIG}>
            <span>
              <span style={{ marginRight: 10 }}>📸</span>
              {igDone ? 'Following on Instagram ✓' : `Follow @${settings.igHandle}`}
            </span>
            {igDone ? (
              <span className="check-badge">✓</span>
            ) : (
              <span style={{ fontSize: '0.8rem', color: '#e1306c' }}>TAP →</span>
            )}
          </button>
        )}

        {needWA && (
          <button className={`social-btn wa ${waDone ? 'done' : ''}`} onClick={openWA}>
            <span>
              <span style={{ marginRight: 10 }}>💬</span>
              {waDone ? 'Joined WhatsApp ✓' : 'Join our WhatsApp'}
            </span>
            {waDone ? (
              <span className="check-badge">✓</span>
            ) : (
              <span style={{ fontSize: '0.8rem', color: '#25d366' }}>TAP →</span>
            )}
          </button>
        )}

        {!needIG && !needWA && (
          <div style={{ color: 'var(--muted)', fontSize: '0.9rem', textAlign: 'center' }}>
            Social gate is currently disabled.
          </div>
        )}

        <button
          className="btn btn-gold btn-full"
          disabled={!canPass}
          onClick={onPass}
          style={{ marginTop: 8 }}
        >
          {canPass ? '🎉 Unlock My Card!' : 'Complete steps above first'}
        </button>

        {!canPass && (needIG || needWA) && (
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center' }}>
            Tap each button, complete the action, then come back
          </div>
        )}
      </div>
    </div>
  );
}