import { renderTemplate } from "../../assets/js/utils/render.js";

/**
 * Рендерит переиспользуемый компонент поля формы.
 *
 * @param {Object} [options={}]
 * @param {string} [options.label]
 * @param {string} [options.id]
 * @param {string} [options.name]
 * @param {string} [options.type]
 * @param {string} [options.placeholder]
 * @param {string} [options.value]
 * @param {string} [options.className]
 * @param {boolean} [options.required]
 * @param {boolean} [options.disabled]
 * @returns {Promise<string>} Сгенерированная строка HTML.
 */
export async function renderFormField(options = {}) {
  return await renderTemplate("./components/form-field/form-field.hbs", {
    label: options.label || "",
    id: options.id || "",
    name: options.name || "",
    type: options.type || "text",
    placeholder: options.placeholder || "",
    value: options.value || "",
    className: options.className || "",
    prefix: options.prefix || "",
    hasPrefix: Boolean(options.prefix),
    required: options.required || false,
    disabled: options.disabled || false
  });
}
