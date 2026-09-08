import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Gắn token vào header nếu có
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Xử lý token hết hạn / không hợp lệ → tự động đăng xuất
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token hết hạn hoặc không hợp lệ
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Chuyển về trang login nếu chưa ở đó
            if (window.location.pathname !== "/auth") {
                window.location.href = "/auth";
            }
        }
        return Promise.reject(error);
    }
);

export default api;