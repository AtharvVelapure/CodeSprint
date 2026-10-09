export function getStoredUser() {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function getAuthToken() {
    return getStoredUser()?.token || null;
}

export function isAuthenticated() {
    return Boolean(getAuthToken());
}

export function hasRole(role) {
    return getStoredUser()?.role === role;
}

export function clearAuth() {
    localStorage.removeItem("user");
}
