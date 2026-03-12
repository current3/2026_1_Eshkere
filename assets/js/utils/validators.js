/**
 * Проверяет, соответствует ли значение формату электронной почты.
 *
 * @param {string} value Проверяемое значение.
 * @return {boolean} Является ли значение корректной почтой.
 */
export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const PASSWORD_ALLOWED_CHARS =
    /^[A-Za-z0-9!@#$%^&*()_\-+=[\]{};:'",.<>/?\\|`~]+$/;

/**
 * Оставляет только цифры из телефонной строки.
 *
 * @param {string} value Исходное значение телефона.
 * @return {string} Строка только с цифрами.
 */
function getPhoneDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

/**
 * Нормализует телефон к полному формату РФ, если это возможно.
 *
 * @param {string} value Исходное значение телефона.
 * @return {string} Телефон в формате +7XXXXXXXXXX или пустая строка.
 */
export function normalizePhone(value) {
  const normalizedValue = String(value || '').trim();

  if (!/^[\d\s()+-]+$/.test(normalizedValue)) {
    return '';
  }

  let digits = getPhoneDigits(normalizedValue);

  if (digits.length === 10) {
    digits = `7${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('8')) {
    digits = `7${digits.slice(1)}`;
  }

  if (
    digits.length !== 11 ||
    !digits.startsWith('7') ||
    digits[1] !== '9'
  ) {
    return '';
  }

  return `+${digits}`;
}

/**
 * Проверяет, соответствует ли значение формату телефона.
 *
 * @param {string} value Проверяемое значение.
 * @return {boolean} Является ли значение корректным телефоном.
 */
export function isPhone(value) {
  return Boolean(normalizePhone(value));
}

/**
 * Валидирует поле электронной почты или телефона в форме входа.
 *
 * @param {string} value Входное значение.
 * @return {string} Пустая строка при успехе, иначе сообщение ошибки.
 */
export function validateEmailOrPhone(value) {
  const normalized = value.trim();

  if (!normalized) {
    return 'Введите электронную почту или телефон';
  }

  if (!isEmail(normalized) && !isPhone(normalized)) {
    return 'Введите корректную электронную почту или телефон';
  }

  return '';
}

/**
 * Валидирует поле электронной почты.
 *
 * @param {string} value Значение электронной почты.
 * @return {string} Пустая строка при успехе, иначе сообщение ошибки.
 */
export function validateEmail(value) {
  const normalized = value.trim();

  if (!normalized) {
    return 'Введите электронную почту';
  }

  if (!isEmail(normalized)) {
    return 'Введите корректную электронную почту';
  }

  return '';
}

/**
 * Валидирует поле телефона.
 *
 * @param {string} value Значение телефона.
 * @return {string} Пустая строка при успехе, иначе сообщение ошибки.
 */
export function validatePhone(value) {
  const normalized = value.trim();

  if (!normalized) {
    return 'Введите телефон';
  }

  if (!isPhone(normalized)) {
    return 'Введите телефон в формате +7 999 123 45 67';
  }

  return '';
}

/**
 * Валидирует поле пароля.
 *
 * @param {string} value Значение пароля.
 * @return {string} Пустая строка при успехе, иначе сообщение ошибки.
 */
export function validatePassword(value) {
  const normalized = value.trim();

  if (!normalized) {
    return 'Введите пароль';
  }

  if (/\s/.test(value)) {
    return 'Пароль не должен содержать пробелы';
  }

  if (normalized.length < 6) {
    return 'Пароль должен быть не короче 6 символов';
  }

  if (normalized.length > 128) {
    return 'Пароль должен быть не длиннее 128 символов';
  }

  if (!PASSWORD_ALLOWED_CHARS.test(normalized)) {
    return 'Пароль может содержать только латинские буквы, цифры ' +
      'и спецсимволы';
  }

  return '';
}

/**
 * Валидирует поле подтверждения пароля.
 *
 * @param {string} password Исходный пароль.
 * @param {string} repeatPassword Подтверждение пароля.
 * @return {string} Пустая строка при успехе, иначе сообщение ошибки.
 */
export function validateRepeatPassword(password, repeatPassword) {
  if (!repeatPassword.trim()) {
    return 'Повторите пароль';
  }

  if (password !== repeatPassword) {
    return 'Пароли не совпадают';
  }

  return '';
}

/**
 * Применяет UI-состояние ошибки или успеха к полю формы.
 *
 * @param {HTMLFormElement} form Целевой элемент формы.
 * @param {string} fieldName Имя поля.
 * @param {string} [errorMessage=''] Текст сообщения об ошибке.
 * @return {void}
 */
export function setFieldState(form, fieldName, errorMessage = '') {
  const input = form.elements[fieldName];
  const errorElement = form.querySelector(`[data-error-for="${fieldName}"]`);

  if (!input || !errorElement) {
    return;
  }

  input.classList.remove('ui-input--error', 'ui-input--success');

  if (errorMessage) {
    input.classList.add('ui-input--error');
    errorElement.textContent = errorMessage;
    return;
  }

  if (input.value.trim()) {
    input.classList.add('ui-input--success');
  }

  errorElement.textContent = '';
}
