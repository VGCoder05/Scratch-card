export default function CategorySelector({ config, selected, onSelect }) {
  const keys = Object.keys(config);

  if (keys.length === 0) {
    return (
      <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '20px' }}>
        No categories yet. Ask admin to add some.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 460 }}>
      <div className="step-label">① Choose a Category</div>
      <div className="cat-grid">
        {keys.map(key => (
          <button
            key={key}
            className={`cat-btn ${selected === key ? 'active' : ''}`}
            onClick={() => onSelect(key)}
          >
            <span className="cat-icon">{config[key].icon}</span>
            <span className="cat-name">{config[key].label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}