// Credenciales locales para simulación de login
const VALID_CREDENTIALS = {
  users: [
    { username: 'admin', password: 'admin123' },
    { username: 'usuario', password: 'usuario123' }
  ]
};

/**
 * Validar credenciales locales (sin API)
 */
export const validateLocalCredentials = (username: string, password: string): boolean => {
  return VALID_CREDENTIALS.users.some(
    user => user.username === username && user.password === password
  );
};

/**
 * Obtener token del localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem('sgdt_session');
};

/**
 * Guardar sesión en localStorage
 */
export const setSession = (username: string): void => {
  localStorage.setItem('sgdt_session', JSON.stringify({ username, timestamp: Date.now() }));
};

/**
 * Limpiar sesión del localStorage
 */
export const clearSession = (): void => {
  localStorage.removeItem('sgdt_session');
};

/**
 * Verificar si el usuario está autenticado
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Obtener nombre de usuario de la sesión
 */
export const getUsername = (): string | null => {
  const session = getToken();
  if (!session) return null;
  try {
    const data = JSON.parse(session);
    return data.username;
  } catch {
    return null;
  }
};

