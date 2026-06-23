export const ADMIN_USERNAME = 'gero';
export const ADMIN_PASSWORD = '1234';

export function validateAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function getAdminToken(): string {
  return 'admin-token-' + Date.now();
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('admin-token');
  return !!token;
}

export function loginAdmin(username: string, password: string): boolean {
  if (validateAdminCredentials(username, password)) {
    const token = getAdminToken();
    localStorage.setItem('admin-token', token);
    return true;
  }
  return false;
}

export function logoutAdmin(): void {
  localStorage.removeItem('admin-token');
}
