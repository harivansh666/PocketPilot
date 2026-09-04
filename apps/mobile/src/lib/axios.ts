import axios from "axios";

const mode = (process.env.EXPO_PUBLIC_MODE || 'development').toLowerCase();
const baseURL = mode === 'production'
  ? (process.env.EXPO_PUBLIC_API_URL_PRODUCTION || "https://pocketpilotapp.vercel.app/api")
  : (process.env.EXPO_PUBLIC_API_URL || "http://192.168.29.16:5000/api");

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;