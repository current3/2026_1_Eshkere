import {renderTemplate} from '../../assets/js/utils/render.js';
import {renderPublicLayout} from '../../layouts/public/public-layout.js';
import {
  renderFormField,
  initPasswordVisibilityToggles,
} from '../../components/form-field/form-field.js';
import {renderButton} from '../../components/button/button.js';
import {
  validateEmailOrPhone,
  validatePassword,
  setFieldState,
} from '../../assets/js/utils/validators.js';
import {loginUser} from '../../assets/js/services/auth.service.js';

/**
 * Удаляет пробелы из пароля при вводе.
 *
 * @param {string} value Исходное значение пароля.
 * @return {string} Нормализованное значение.
 */
function sanitizePasswordInput(value) {
  return value.replace(/\s+/g, '');
}

/**
 * Подсвечивает поле формы как ошибочное без вывода текста ошибки.
 *
 * @param {HTMLFormElement} form Элемент формы.
 * @param {string} fieldName Имя поля.
 * @return {void}
 */
function setFieldErrorHighlight(form, fieldName) {
  const input = form.elements[fieldName];
  const errorElement = form.querySelector(`[data-error-for="${fieldName}"]`);

  if (!input || !errorElement) {
    return;
  }

  input.classList.remove('ui-input--success');
  input.classList.add('ui-input--error');
  errorElement.textContent = '';
}

/**
 * Рендерит содержимое страницы входа и оборачивает его в layout.
 *
 * @return {Promise<string>} Сгенерированная строка HTML.
 */
export async function renderLoginPage() {
  const loginField = await renderFormField({
    id: 'login-email',
    name: 'email',
    type: 'text',
    label: 'Почта или телефон',
    placeholder: 'Ваша почта или телефон',
    required: true,
  });

  const passwordField = await renderFormField({
    id: 'login-password',
    name: 'password',
    type: 'password',
    label: 'Пароль',
    placeholder: 'Введите ваш пароль',
    required: true,
  });

  const submitButton = await renderButton({
    text: 'Продолжить',
    type: 'submit',
    variant: 'primary',
  });

  const registerLinkButton = await renderButton({
    text: 'Зарегистрироваться',
    href: '#/register',
    variant: 'secondary',
  });

  const content = await renderTemplate('./pages/login/login.hbs', {
    loginField,
    passwordField,
    submitButton,
    registerLinkButton,
  });

  return await renderPublicLayout(content, '/login');
}

/**
 * Подключает валидацию и обработчики submit для формы входа.
 *
 * @return {void}
 */
export function initLoginPage() {
  const form = document.getElementById('login-form');

  if (!form) {
    return;
  }

  initPasswordVisibilityToggles(form);

  /**
   * Валидирует поле email или телефона.
   *
   * @return {boolean} Успешна ли валидация.
   */
  function validateLoginField() {
    const error = validateEmailOrPhone(form.elements.email.value);
    setFieldState(form, 'email', error);
    return !error;
  }

  /**
   * Валидирует поле пароля.
   *
   * @return {boolean} Успешна ли валидация.
   */
  function validatePasswordField() {
    const error = validatePassword(form.elements.password.value);
    setFieldState(form, 'password', error);
    return !error;
  }

  form.elements.email.addEventListener('input', validateLoginField);
  form.elements.password.addEventListener('input', () => {
    form.elements.password.value = sanitizePasswordInput(
        form.elements.password.value,
    );
    validatePasswordField();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const isLoginValid = validateLoginField();
    const isPasswordValid = validatePasswordField();

    if (!isLoginValid || !isPasswordValid) {
      return;
    }

    const result = await loginUser({
      identifier: form.elements.email.value,
      password: form.elements.password.value,
    });

    if (!result.ok) {
      setFieldErrorHighlight(form, 'email');
      setFieldState(form, 'password', result.message);
      return;
    }

    location.hash = '#/ads';
  });
}
