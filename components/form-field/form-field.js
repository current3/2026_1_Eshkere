import {renderTemplate} from '../../assets/js/utils/render.js';

/**
 * Рендерит переиспользуемый компонент поля формы.
 *
 * @param {Object} [options={}] Параметры поля.
 * @param {string} [options.label] Заголовок поля.
 * @param {string} [options.id] Идентификатор поля.
 * @param {string} [options.name] Имя поля.
 * @param {string} [options.type] Тип поля.
 * @param {string} [options.placeholder] Placeholder поля.
 * @param {string} [options.value] Значение поля.
 * @param {string} [options.className] Дополнительные CSS-классы.
 * @param {string} [options.prefix] Текстовый префикс.
 * @param {boolean} [options.required] Обязательное ли поле.
 * @param {boolean} [options.disabled] Заблокировано ли поле.
 * @return {Promise<string>} Сгенерированная строка HTML.
 */
export async function renderFormField(options = {}) {
  const isPassword = (options.type || 'text') === 'password';

  return await renderTemplate('./components/form-field/form-field.hbs', {
    label: options.label || '',
    id: options.id || '',
    name: options.name || '',
    type: options.type || 'text',
    placeholder: options.placeholder || '',
    value: options.value || '',
    className: options.className || '',
    prefix: options.prefix || '',
    hasPrefix: Boolean(options.prefix),
    isPassword,
    required: options.required || false,
    disabled: options.disabled || false,
  });
}

/**
 * Подключает toggle для показа и скрытия пароля.
 *
 * @param {(Document|Element)} [root=document] Корневой узел поиска.
 * @return {void}
 */
export function initPasswordVisibilityToggles(root = document) {
  const scope =
    root && typeof root.querySelectorAll === 'function' ? root : document;
  const toggleButtons = scope.querySelectorAll('[data-password-toggle]');

  toggleButtons.forEach((button) => {
    if (button.dataset.initialized === 'true') {
      return;
    }

    const control = button.closest('.ui-field__control');
    const input = control?.querySelector('input');

    if (!input) {
      return;
    }

    button.addEventListener('click', () => {
      const shouldShowPassword = input.type === 'password';
      input.type = shouldShowPassword ? 'text' : 'password';

      button.classList.toggle('is-visible', shouldShowPassword);

      const label = shouldShowPassword ?
        'Скрыть пароль' :
        'Показать пароль';
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
      button.setAttribute('aria-pressed', String(shouldShowPassword));
    });

    button.dataset.initialized = 'true';
  });
}
