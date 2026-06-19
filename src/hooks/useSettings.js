import { useState, useEffect } from 'react';
import api from '../services/api';

export function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      const data = await api.saveSettings(newSettings);
      setSettings(data);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return [settings, saveSettings, loading];
}