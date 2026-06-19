import { useState, useEffect } from 'react';
import api from '../services/api';

export function usePrizeConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await api.getPrizeConfig();
      setConfig(data);
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (newConfig) => {
    try {
      const data = await api.savePrizeConfig(newConfig);
      setConfig(data);
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  return [config, saveConfig, loading];
}