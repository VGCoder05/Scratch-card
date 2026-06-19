import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL
  : "http://localhost:5000/api";

const api = {
  // Config
  getPrizeConfig: async () => {
    const { data } = await axios.get(`${API_URL}/config`);
    return data;
  },
  savePrizeConfig: async (config) => {
    const { data } = await axios.put(`${API_URL}/config`, config);
    return data;
  },

  // Settings
  getSettings: async () => {
    const { data } = await axios.get(`${API_URL}/settings`);
    return data;
  },
  saveSettings: async (settings) => {
    const { data } = await axios.put(`${API_URL}/settings`, settings);
    return data;
  },

  // Sessions
  logSession: async (sessionData) => {
    const { data } = await axios.post(`${API_URL}/sessions`, sessionData);
    return data;
  },
  getSessions: async () => {
    const { data } = await axios.get(`${API_URL}/sessions`);
    return data;
  },

  // Override
  getOverride: async () => {
    const { data } = await axios.get(`${API_URL}/override`);
    return data;
  },
  setOverride: async (override) => {
    const { data } = await axios.put(`${API_URL}/override`, override);
    return data;
  },
};

export default api;
