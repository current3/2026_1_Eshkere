/**
 * Проверяет, соответствует ли значение формату email.
 *
 * @param {string} value - Проверяемое значение email.
 * @returns {boolean} `true`, если значение является корректным email.
 */
export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Проверяет, соответствует ли значение формату телефона.
 *
 * @param {string} value - Проверяемое значение телефона.
 * @returns {boolean} `true`, если значение является корректным телефоном.
 */
export function isPhone(value) {
  return /^\+?[0-9()\-\s]{10,18}$/.test(value);
}

/**
 * Валидирует поле email/телефон в форме входа.
 *
 * @param {string} value - Входное значение.
 * @returns {string} Пустая строка при успехе, иначе сообщение валидации.
 */
export function validateEmailOrPhone(value) {
  const normalized = value.trim();

  if (!normalized) {
    return "Введите email или телефон";
  }

  if (!isEmail(normalized) && !isPhone(normalized)) {
    return "Введите корректный email или телефон";
  }

  return "";
}

/**
 * Валидирует поле email.
 *
 * @param {string} value - Значение email.
 * @returns {string} Пустая строка при успехе, иначе сообщение валидации.
 */
export function validateEmail(value) {
  const normalized = value.trim();

  if (!normalized) {
    return "Введите email";
  }

  if (!isEmail(normalized)) {
    return "Введите корректный email";
  }

  return "";
}

/**
 * Валидирует поле телефона.
 *
 * @param {string} value - Значение телефона.
 * @returns {string} Пустая строка при успехе, иначе сообщение валидации.
 */
export function validatePhone(value) {
  const normalized = value.trim();

  if (!normalized) {
    return "Введите телефон";
  }

  if (!isPhone(normalized)) {
    return "Введите корректный телефон";
  }

  return "";
}

/**
 * Валидирует поле пароля.
 *
 * @param {string} value - Значение пароля.
 * @returns {string} Пустая строка при успехе, иначе сообщение валидации.
 */
export function validatePassword(value) {
  const normalized = value.trim();

  if (!normalized) {
    return "Введите пароль";
  }

  if (normalized.length < 6) {
    return "Пароль должен быть не короче 6 символов";
  }

  return "";
}

/**
 * Валидирует поле подтверждения пароля.
 *
 * @param {string} password - Исходный пароль.
 * @param {string} repeatPassword - Пароль подтверждения.
 * @returns {string} Пустая строка при успехе, иначе сообщение валидации.
 */
export function validateRepeatPassword(password, repeatPassword) {
  if (!repeatPassword.trim()) {
    return "Повторите пароль";
  }

  if (password !== repeatPassword) {
    return "Пароли не совпадают";
  }

  return "";
}

/**
 * Применяет UI-состояние ошибки/успеха к полю формы.
 *
 * @param {HTMLFormElement} form - Целевой элемент формы.
 * @param {string} fieldName - Имя контрола формы.
 * @param {string} [errorMessage=""] - Текст сообщения об ошибке.
 * @returns {void}
 */
export function setFieldState(form, fieldName, errorMessage = "") {
  const input = form.elements[fieldName];
  const errorElement = form.querySelector(`[data-error-for="${fieldName}"]`);

  if (!input || !errorElement) {
    return;
  }

  input.classList.remove("ui-input--error", "ui-input--success");

  if (errorMessage) {
    input.classList.add("ui-input--error");
    errorElement.textContent = errorMessage;
    return;
  }

  if (input.value.trim()) {
    input.classList.add("ui-input--success");
  }

  errorElement.textContent = "";
}
