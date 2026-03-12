import {request} from '../utils/request.js';
import {normalizePhone} from '../utils/validators.js';

const AUTH_KEY = 'ads_auth';
let confirmedSession = false;

/**
 * Нормализует текст ошибки авторизации для UI.
 *
 * @param {string} message Исходное сообщение об ошибке.
 * @return {string} Нормализованный текст ошибки.
 */
function normalizeAuthErrorMessage(message) {
  const normalized = String(message || '').trim().toLowerCase();

  if (!normalized) {
    return 'Не удалось выполнить запрос. Попробуйте еще раз.';
  }

  if (
    normalized.includes('failed to fetch') ||
    normalized.includes('networkerror') ||
    normalized.includes('load failed')
  ) {
    return 'Не удалось подключиться к серверу. Попробуйте еще раз.';
  }

  if (
    normalized.includes('invalid credentials') ||
    normalized.includes('invalid identifier or password') ||
    normalized.includes('unauthorized') ||
    normalized.includes('неверно') ||
    normalized.includes('invalid password')
  ) {
    return 'Такого пользователя не существует или пароль неверный.';
  }

  if (
    normalized.includes('already exists') ||
    normalized.includes('уже существует') ||
    normalized.includes('already registered')
  ) {
    return 'Пользователь с такими данными уже зарегистрирован.';
  }

  if (
    normalized.includes('invalid request') ||
    normalized.includes('bad request')
  ) {
    return 'Проверьте корректность введённых данных.';
  }

  if (
    normalized.includes('session not found') ||
    normalized.includes('сесс') && normalized.includes('не найден')
  ) {
    return 'Сессия истекла. Войдите снова.';
  }

  if (normalized.includes('email')) {
    return 'Проверьте электронную почту.';
  }

  if (
    normalized.includes('phone') ||
    normalized.includes('телефон')
  ) {
    return 'Проверьте номер телефона.';
  }

  if (
    normalized.includes('password') ||
    normalized.includes('пароль')
  ) {
    return 'Проверьте пароль.';
  }

  return message;
}

/**
 * @typedef {Object} User
 * @property {string} [id]
 * @property {string} [email]
 * @property {string} [phone]
 * @property {string} [name]
 * @property {number} [balance]
 * @property {string} [avatar]
 */

/**
 * @typedef {Object} AuthResult
 * @property {boolean} ok
 * @property {User} [user]
 * @property {string} [message]
 */

/**
 * Читает пользователя из локального хранилища.
 *
 * @return {User|null} Сохраненный пользователь или null.
 */
function readStoredUser() {
  const raw = localStorage.getItem(AUTH_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Сохраняет пользователя в локальном хранилище.
 *
 * @param {User} user Пользователь для сохранения.
 * @return {void}
 */
function writeStoredUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

/**
 * Проверяет наличие локально сохраненного пользователя.
 *
 * @return {boolean} Есть ли кэш auth-данных.
 */
function hasStoredAuth() {
  return Boolean(readStoredUser());
}

/**
 * Читает текущего пользователя из localStorage.
 *
 * @return {User|null} Пользователь из localStorage или null.
 */
export function getCurrentUser() {
  return readStoredUser();
}

/**
 * Показывает, подтверждена ли авторизация сервером.
 *
 * @return {boolean} Подтверждено ли auth-состояние сервером.
 */
export function isAuthenticated() {
  return confirmedSession;
}

/**
 * Очищает локальное auth-состояние.
 *
 * @return {void}
 */
export function clearAuthState() {
  localStorage.removeItem(AUTH_KEY);
  confirmedSession = false;
}

/**
 * Подтверждает локальное состояние через серверную сессию.
 *
 * @return {Promise<boolean>} Признак активной серверной сессии.
 */
export async function initializeAuthState() {
  if (!hasStoredAuth()) {
    confirmedSession = false;
    return false;
  }

  const sessionIsActive = await hasActiveSession();
  confirmedSession = sessionIsActive;

  if (!sessionIsActive) {
    clearAuthState();
  }

  return sessionIsActive;
}

/**
 * Проверяет активность серверной сессии.
 *
 * @return {Promise<boolean>} Признак активной серверной сессии.
 */
export async function hasActiveSession() {
  if (!hasStoredAuth()) {
    confirmedSession = false;
    return false;
  }

  try {
    await request('/ads', {
      method: 'GET',
    });

    confirmedSession = true;
    return true;
  } catch (error) {
    const message = String(error?.message || '').toLowerCase();

    if (
      message.includes('unauthorized') ||
      message.includes('не авториз')
    ) {
      clearAuthState();
      return false;
    }

    confirmedSession = hasStoredAuth();
    return confirmedSession;
  }
}

/**
 * Регистрирует пользователя и сохраняет подтвержденную сессию.
 *
 * @param {{email: string, phone: string, password: string}} params
 *     Параметры регистрации.
 * @return {Promise<AuthResult>} Результат регистрации.
 */
export async function registerUser({email, phone, password}) {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();
    const normalizedPassword = password.trim();

    const registerResponse = await request('/advertiser/register', {
      method: 'POST',
      body: JSON.stringify({
        email: normalizedEmail,
        phone: normalizedPhone,
        password: normalizedPassword,
      }),
    });

    writeStoredUser(registerResponse.data);
    confirmedSession = true;

    return {
      ok: true,
      user: registerResponse.data,
    };
  } catch (error) {
    return {
      ok: false,
      message: normalizeAuthErrorMessage(error.message),
    };
  }
}

/**
 * Авторизует пользователя и сохраняет подтвержденную сессию.
 *
 * @param {{identifier: string, password: string}} params Параметры входа.
 * @return {Promise<AuthResult>} Результат входа.
 */
export async function loginUser({identifier, password}) {
  try {
    const normalizedIdentifier = normalizePhone(identifier) ||
      identifier.trim();

    const response = await request('/advertiser/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier: normalizedIdentifier,
        password: password.trim(),
      }),
    });

    writeStoredUser(response.data);
    confirmedSession = true;

    return {
      ok: true,
      user: response.data,
    };
  } catch (error) {
    return {
      ok: false,
      message: normalizeAuthErrorMessage(error.message),
    };
  }
}

/**
 * Выполняет выход пользователя.
 *
 * @return {Promise<{ok: boolean, message: (string|undefined)}>}
 *     Результат выхода.
 */
export async function logoutUser() {
  try {
    await request('/advertiser/logout', {
      method: 'POST',
    });

    return {
      ok: true,
    };
  } catch (error) {
    return {
      ok: false,
      message: normalizeAuthErrorMessage(error.message),
    };
  } finally {
    clearAuthState();
  }
}
