import { request } from "../utils/request.js";

const AUTH_KEY = "ads_auth";

function normalizeAuthErrorMessage(message) {
  const normalized = String(message || "").trim().toLowerCase();

  if (!normalized) {
    return "Не удалось выполнить запрос. Попробуйте еще раз.";
  }

  if (
    normalized.includes("failed to fetch") ||
    normalized.includes("networkerror") ||
    normalized.includes("load failed")
  ) {
    return "Не удалось подключиться к серверу. Попробуйте еще раз.";
  }

  if (
    normalized.includes("invalid credentials") ||
    normalized.includes("unauthorized") ||
    normalized.includes("неверн") ||
    normalized.includes("invalid password")
  ) {
    return "Неверная электронная почта, телефон или пароль.";
  }

  if (
    normalized.includes("already exists") ||
    normalized.includes("уже существует") ||
    normalized.includes("already registered")
  ) {
    return "Пользователь с такими данными уже зарегистрирован.";
  }

  if (normalized.includes("email")) {
    return "Проверьте электронную почту.";
  }

  if (normalized.includes("phone") || normalized.includes("телефон")) {
    return "Проверьте номер телефона.";
  }

  if (normalized.includes("password") || normalized.includes("парол")) {
    return "Проверьте пароль.";
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
 * @property {boolean} ok - Флаг результата операции.
 * @property {User} [user] - Данные пользователя при успешной операции.
 * @property {string} [message] - Описание ошибки при неуспешной операции.
 */

/**
 * Читает текущего пользователя из localStorage.
 *
 * @returns {User|null} Объект авторизованного пользователя или `null`.
 */
export function getCurrentUser() {
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
 * Проверяет, авторизован ли пользователь на фронтенде.
 *
 * @returns {boolean} `true`, если данные пользователя есть в localStorage.
 */
export function isAuthenticated() {
  return Boolean(getCurrentUser());
}

/**
 * Регистрирует нового пользователя в backend и возвращает нормализованный результат.
 *
 * @param {{ email: string, phone: string, password: string }} params - Параметры регистрации.
 * @returns {Promise<AuthResult>} Результат операции регистрации.
 */
export async function registerUser({ email, phone, password }) {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();
    const normalizedPassword = password.trim();

    await request("/advertiser/register", {
      method: "POST",
      body: JSON.stringify({
        email: normalizedEmail,
        phone: normalizedPhone,
        password: normalizedPassword
      })
    });

    const loginResponse = await request("/advertiser/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: normalizedEmail,
        password: normalizedPassword
      })
    });

    localStorage.setItem(AUTH_KEY, JSON.stringify(loginResponse.data));

    return {
      ok: true,
      user: loginResponse.data
    };
  } catch (error) {
    return {
      ok: false,
      message: normalizeAuthErrorMessage(error.message)
    };
  }
}

/**
 * Авторизует пользователя и сохраняет данные сессии в localStorage.
 *
 * @param {{ identifier: string, password: string }} params - Параметры входа.
 * @returns {Promise<AuthResult>} Результат операции входа.
 */
export async function loginUser({ identifier, password }) {
  try {
    const response = await request("/advertiser/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: identifier.trim(),
        password: password.trim()
      })
    });

    localStorage.setItem(AUTH_KEY, JSON.stringify(response.data));

    return {
      ok: true,
      user: response.data
    };
  } catch (error) {
    return {
      ok: false,
      message: normalizeAuthErrorMessage(error.message)
    };
  }
}

/**
 * Выполняет выход пользователя и очищает клиентский кэш авторизации.
 *
 * @returns {Promise<{ ok: boolean, message?: string }>} Результат операции выхода.
 */
export async function logoutUser() {
  try {
    await request("/advertiser/logout", {
      method: "POST"
    });

    return {
      ok: true
    };
  } catch (error) {
    return {
      ok: false,
      message: normalizeAuthErrorMessage(error.message)
    };
  } finally {
    localStorage.removeItem(AUTH_KEY);
  }
}
