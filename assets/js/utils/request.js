import { API_BASE_URL } from "../config/api.js";

/**
 * Выполняет HTTP-запрос к backend API с JSON-настройками по умолчанию.
 *
 * @template T
 * @param {string} path - Относительный путь API, начинающийся с `/`.
 * @param {RequestInit} [options={}] - Переопределения опций fetch.
 * @returns {Promise<T>} Распарсенный JSON-ответ сервера.
 * @throws {Error} Если статус ответа неуспешный.
 */
export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || data?.message || "Ошибка запроса");
  }

  return data;
}
