import api from "./axios";

/**
 * Đăng nhập — POST /api/auth/login
 * @param {{ email: string, password: string }} credentials
 * @returns {{ token: string, user: object }}
 */
export const loginAPI = async ({ email, password }) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data; // { token, user }
};

/**
 * Đăng ký — POST /api/auth/register
 * @param {{ fullName: string, email: string, password: string, phone?: string }} data
 * @returns {object} user vừa tạo
 */
export const registerAPI = async (data) => {
    const response = await api.post("/auth/register", data);
    return response.data;
};
