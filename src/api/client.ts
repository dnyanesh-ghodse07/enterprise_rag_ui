/**
 * API client with automatic JWT authentication.
 * 
 * HOW IT WORKS:
 * 1. All requests pass through this client
 * 2. It automatically adds the Authorization header
 * 3. Protected requests refresh the session on 401 before redirecting to login
 * 4. Handles JSON serialization/deserialization
 * 
 * NEVER use raw fetch() in components — always use this client.
 */

import type { 
    User, 
    AuthTokens, 
    RegisterRequest, 
    PasswordChangeRequest, 
    PasswordChangeResponse 
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const GENERIC_API_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message = GENERIC_API_ERROR_MESSAGE) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

function readMessage(value: unknown): string | undefined {
    return typeof value === 'string' ? value.trim() || undefined : undefined;
}

async function readApiError(response: Response): Promise<ApiError> {
    const body: unknown = await response.json().catch(() => null);
    if (!body || typeof body !== 'object') {
        return new ApiError(response.status);
    }

    const error = 'error' in body ? body.error : undefined;
    const message = error && typeof error === 'object' && 'message' in error
        ? readMessage(error.message)
        : undefined;
    const legacyMessage = 'detail' in body ? readMessage(body.detail) : undefined;
    const topLevelMessage = 'message' in body ? readMessage(body.message) : undefined;

    return new ApiError(response.status, message ?? legacyMessage ?? topLevelMessage);
}

/**
 * Get the stored auth token.
 */
function getToken(): string | null {
    return localStorage.getItem('access_token');
}

/**
 * Get the stored refresh token.
 */
export function getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
}

/**
 * Save auth tokens after login.
 */
export function saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
}

/**
 * Clear auth tokens (logout).
 */
export function clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
}

// Track active refresh promise to prevent duplicate concurrent refresh requests
let refreshPromise: Promise<AuthTokens> | null = null;

/**
 * Refresh access token using stored refresh token.
 */
export async function refreshTokens(): Promise<AuthTokens> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        clearTokens();
        throw new Error('No refresh token available');
    }

    if (!refreshPromise) {
        refreshPromise = (async () => {
            try {
                const res = await fetch(`${API_BASE}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                });

                if (!res.ok) {
                    clearTokens();
                    throw new Error('Session expired. Please log in again.');
                }

                const data: AuthTokens = await res.json();
                saveTokens(data.access_token, data.refresh_token);
                return data;
            } catch (err) {
                clearTokens();
                throw err;
            } finally {
                refreshPromise = null;
            }
        })();
    }

    return refreshPromise;
}

/**
 * Make an authenticated API request.
 * 
 * Automatically:
 * - Adds Authorization header
 * - Serializes JSON body
 * - Automatically refreshes token on 401 and retries
 * - Redirects to login if a protected request remains unauthorized
 */
export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const token = getToken();

    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
    };

    // Add auth header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Add content-type for JSON bodies (not for FormData)
    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const handleRequestFailure = (cause: unknown): never => {
        if (options.signal?.aborted) {
            throw cause;
        }
        throw new Error(GENERIC_API_ERROR_MESSAGE, { cause });
    };

    const sendRequest = () => fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    }).catch(handleRequestFailure);
    let response = await sendRequest();

    // Handle 401 (unauthorized) with automatic refresh
    const isAuthEndpoint =
        endpoint.startsWith('/auth/login') ||
        endpoint.startsWith('/auth/refresh') ||
        endpoint.startsWith('/auth/register');

    if (response.status === 401 && !isAuthEndpoint) {
        if (getRefreshToken()) {
            const refreshed = await refreshTokens().catch(() => null);
            if (refreshed) {
                headers['Authorization'] = `Bearer ${refreshed.access_token}`;
                response = await sendRequest();
            }
        }

        if (response.status === 401) {
            clearTokens();
            window.location.href = '/login';
        }
    }

    // Handle errors
    if (!response.ok) {
        throw await readApiError(response);
    }

    return response.json().catch(handleRequestFailure);
}

/**
 * GET request helper.
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'GET' });
}

/**
 * POST request helper.
 */
export async function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
    });
}

/**
 * DELETE request helper.
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
    return apiRequest<T>(endpoint, { method: 'DELETE' });
}

/**
 * PATCH request helper.
 */
export async function apiPatch<T>(endpoint: string, body?: unknown): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
    });
}

/**
 * Upload a file with multipart/form-data.
 */
export async function apiUpload<T>(
    endpoint: string,
    formData: FormData,
): Promise<T> {
    return apiRequest<T>(endpoint, {
        method: 'POST',
        body: formData,
    });
}

/**
 * Fetches the current authenticated user from /auth/me.
 */
export function getCurrentUser(): Promise<User> {
    return apiGet<User>('/auth/me');
}

/**
 * Register a new user and organization.
 */
export async function registerUser(data: RegisterRequest): Promise<AuthTokens> {
    const res = await apiPost<AuthTokens>('/auth/register', data);
    saveTokens(res.access_token, res.refresh_token);
    return res;
}

/**
 * Change current password.
 */
export async function changePassword(data: PasswordChangeRequest): Promise<PasswordChangeResponse> {
    return apiPost<PasswordChangeResponse>('/auth/change-password', data);
}
