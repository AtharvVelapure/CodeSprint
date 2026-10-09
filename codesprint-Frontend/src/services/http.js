import axios from "axios";
import { clearAuth, getAuthToken } from "./auth";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function isCandidateAssessmentPath(pathname = window.location.pathname) {
    return pathname.startsWith("/assessment/invite/");
}

function handleUnauthorized() {
    if (!getAuthToken() || isCandidateAssessmentPath()) {
        return;
    }

    clearAuth();

    if (window.location.pathname !== "/login") {
        const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        sessionStorage.setItem("authReturnTo", returnTo);
        window.location.assign("/login");
    }
}

axios.defaults.baseURL = API_BASE_URL || undefined;

axios.interceptors.request.use((config) => {
    const token = getAuthToken();

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            handleUnauthorized();
        }
        return Promise.reject(error);
    }
);

const nativeFetch = window.fetch.bind(window);

window.fetch = async (input, init = {}) => {
    let requestInput = input;
    const options = { ...init };
    const token = getAuthToken();

    if (typeof input === "string" && input.startsWith("/api") && API_BASE_URL) {
        requestInput = `${API_BASE_URL}${input}`;
    }

    const headers = new Headers(
        options.headers || (input instanceof Request ? input.headers : undefined)
    );

    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    options.headers = headers;

    const response = await nativeFetch(requestInput, options);

    if (response.status === 401) {
        handleUnauthorized();
    }

    return response;
};

export { API_BASE_URL };
