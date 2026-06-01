import axios from "axios";
import useAuthStore from "../store/authStore";

// Production always uses same-origin /api (Render serves frontend + backend together).
// Local dev uses the backend on port 5000.
const API_URL = import.meta.env.DEV ? "http://localhost:5000/api" : "/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})


// Interceptor to add the Authorization header

api.interceptors.request.use((config) => {

    const token = useAuthStore.getState().token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
})

// Request or response interceptor to add the token

export default api