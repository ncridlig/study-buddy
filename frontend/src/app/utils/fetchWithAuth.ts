// utils/fetchWithAuth.ts
import Cookies from 'js-cookie';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const accessToken = Cookies.get('access_token');

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  // If token expired or invalid, redirect to home
  if (res.status === 401 || res.status === 403) {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  return res;
}
