import { useState, useEffect } from 'react';
import { useURLParams } from './hooks/useURLParams';
import { usePrizeConfig } from './hooks/usePrizeConfig';
import { useSettings } from './hooks/useSettings';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import UserFlow from './components/UserFlow';

export default function App() {
  const [config, saveConfig, configLoading] = usePrizeConfig();
  const [settings, saveSettings, settingsLoading] = useSettings();
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  const { adminParam, skipParam, uid } = useURLParams();

  const wantsAdmin = adminParam.length > 0;
  const gateSkipped = settings && skipParam === settings.skipKey;
  const autoAdmin = settings && adminParam === settings.adminKey;

  useEffect(() => {
    if (autoAdmin) setAdminUnlocked(true);
  }, [autoAdmin]);

  if (configLoading || settingsLoading) {
    return (
      <div className="page">
        <div className="title">Loading...</div>
      </div>
    );
  }

  if (!config || !settings) {
    return (
      <div className="page">
        <div className="title">⚠️ Error loading data</div>
        <div className="subtitle">Check console for details</div>
      </div>
    );
  }

  // Admin Route
  if (wantsAdmin) {
    if (!adminUnlocked) {
      return <AdminLogin correctKey={settings.adminKey} onSuccess={() => setAdminUnlocked(true)} />;
    }
    return (
      <AdminPanel
        config={config}
        saveConfig={saveConfig}
        settings={settings}
        saveSettings={saveSettings}
        onExit={() => (window.location.href = window.location.pathname)}
      />
    );
  }

  // User Route
  return <UserFlow config={config} settings={settings} uid={uid} gateSkipped={gateSkipped} />;
}