import axios from 'axios';
import Constants from 'expo-constants';

const getDebuggerHost = (): string | undefined => {
  // Expo Go / dev client
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost;
  return hostUri?.split(':')[0];
};

const debuggerHost = getDebuggerHost();
console.log('debuggerHost:', debuggerHost);

const LOCAL_IP = '192.168.29.16';
const baseURL =
  process.env.EXPO_PUBLIC_MODE === 'production'
    ? process.env.EXPO_PUBLIC_API_URL_PRODUCTION || 'https://pocketpilotapp.vercel.app/api'
    : `http://${debuggerHost ?? LOCAL_IP}:5000/api`;

console.log('baseURL:', baseURL);

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;