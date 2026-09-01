// Declare module to avoid TypeScript error when axios types are not installed
declare module "axios";
import axios from "axios";
const axiosInstance = axios.create({
    baseURL: process.env.EXPO_MODE === "development" ? process.env.EXPO_PUBLIC_API_URL : process.env.EXPO_PUBLIC_API_URL_PRODUCTION,
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;