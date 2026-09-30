const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

export interface GoogleUser {
  name: string;
  email: string;
}

export interface AuthSession {
  user: GoogleUser | null;
  google_enabled: boolean;
}

export const authService = {
  async getSession(): Promise<AuthSession> {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
    if (!response.ok) throw new Error(await response.text());
    return await response.json() as AuthSession;
  },

  startGoogleLogin(): void {
    const frontendUrl = new URL(window.location.origin);
    const backendUrl = new URL(API_BASE_URL);
    const localHosts = new Set(['localhost', '127.0.0.1']);
    if (localHosts.has(frontendUrl.hostname) && localHosts.has(backendUrl.hostname)) {
      frontendUrl.hostname = backendUrl.hostname;
    }
    const frontendOrigin = encodeURIComponent(frontendUrl.origin);
    window.location.assign(`${API_BASE_URL}/api/auth/google/login?frontend_origin=${frontendOrigin}`);
  },

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) throw new Error(await response.text());
  },
};
