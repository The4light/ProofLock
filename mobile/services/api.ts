import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://rosamaria-uncopiable-willfully.ngrok-free.dev/api/v1',
});

// Using 'any' here is the "Deadline Savior"—it bypasses the version conflict
api.interceptors.request.use(async (config: any) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Token retrieval failed", error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;