import { useState, useRef } from 'react';
import SocialGate from './SocialGate';
import CategorySelector from './CategorySelector';
import ScratchCard from './ScratchCard';
import PrizeEngine from '../utils/PrizeEngine';
import { launchConfetti } from '../utils/confetti';
import api from '../services/api';

export default function UserFlow({ config, settings, uid, gateSkipped }) {
  const [phase, setPhase] = useState(gateSkipped ? 'pick' : 'gate');
  const [selectedKey, setSelectedKey] = useState(null);
  const [prize, setPrize] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const stopConfetti = useRef(null);

  const selectCategory = async key => {
    setSelectedKey(key);

    // Check for admin override first
    try {
      const override = await api.getOverride();
      let selectedPrize;

      if (override?.active && override.categoryKey === key) {
        // Use the override prize
        selectedPrize = override.prize;
        // Clear the override so next person gets random
        await api.setOverride(null);
        console.log('🎯 Admin override used:', selectedPrize);
      } else {
        // Normal weighted random
        selectedPrize = PrizeEngine.pick(config[key].prizes);
      }

      setPrize(selectedPrize);
      setRevealed(false);
    } catch (error) {
      console.error('Error selecting category:', error);
      // Fallback to random
      setPrize(PrizeEngine.pick(config[key].prizes));
      setRevealed(false);
    }
  };

  const handleReveal = async () => {
    if (revealed) return;
    setRevealed(true);
    const cat = config[selectedKey];
    if (stopConfetti.current) stopConfetti.current();
    stopConfetti.current = launchConfetti(cat.color);

    // Log session to DB
    try {
      await api.logSession({
        uid,
        category: cat.label,
        categoryIcon: cat.icon,
        prize,
        gateSkipped,
      });
    } catch (error) {
      console.error('Error logging session:', error);
    }
  };

  const reset = () => {
    if (stopConfetti.current) stopConfetti.current();
    setSelectedKey(null);
    setPrize(null);
    setRevealed(false);
  };

  const selectedCat = selectedKey ? config[selectedKey] : null;

  if (phase === 'gate') return <SocialGate settings={settings} onPass={() => setPhase('pick')} />;

  return (
    <div className="page">
      <div style={{ textAlign: 'center' }}>
        <div className="title">{settings.cardTitle}</div>
        <div className="subtitle" style={{ marginTop: 6 }}>
          {settings.cardSubtitle}
        </div>
        {gateSkipped && (
          <div className="badge" style={{ marginTop: 8 }}>
            ⚡ VIP Access
          </div>
        )}
      </div>

      <CategorySelector config={config} selected={selectedKey} onSelect={selectCategory} />

      {selectedKey && (
        <>
          <div style={{ width: '100%', maxWidth: 460 }}>
            <div className="step-label">② Possible Prizes</div>
            <div className="chips">
              {PrizeEngine.getOdds(selectedCat.prizes).map((p, i) => (
                <span key={i} className={`chip ${revealed && p.value === prize ? 'won' : ''}`}>
                  {selectedCat.icon} {p.value}
                  <span style={{ fontSize: '0.7rem', opacity: 0.55, marginLeft: 4 }}>({p.pct}%)</span>
                </span>
              ))}
            </div>
          </div>

          <ScratchCard
            key={`${selectedKey}-${prize}`}
            catKey={selectedKey}
            category={selectedCat}
            prize={prize}
            revealed={revealed}
            onReveal={handleReveal}
          />

          <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 460 }}>
            <button className="btn btn-gold" style={{ flex: 1 }} disabled={revealed} onClick={handleReveal}>
              ✨ Reveal All
            </button>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={reset}>
              🔄 New Card
            </button>
          </div>

          <div className={`win-banner ${revealed ? 'show' : ''}`}>
            {revealed && `${selectedCat.icon}  You won ${prize}!  🎉`}
          </div>
        </>
      )}
    </div>
  );
}