import axios from 'axios';

// This is your base API configuration. 
// You can change 'baseURL' to the endpoint your backend team provides.
const api = axios.create({
    baseURL: 'http://192.168.0.181:8080/api', // Your backend IP address
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor (Optional: e.g., for adding Auth tokens)
api.interceptors.request.use(
    (config) => {
        // If you have a token, you can add it here
        // config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor (Optional: for global error handling)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle errors globally (e.g., logging out on 401)
        return Promise.reject(error);
    }
);

export default api;
