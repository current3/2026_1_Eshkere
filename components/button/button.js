import { renderTemplate } from "../../assets/js/utils/render.js";

/**
 * Рендерит переиспользуемый компонент кнопки.
 *
 * @param {Object} [options={}]
 * @param {string} [options.text] - Текст кнопки.
 * @param {string} [options.type] - Тип кнопки (`button`, `submit`).
 * @param {string} [options.href] - Опциональный URL ссылки; при наличии рендерится как ссылка.
 * @param {string} [options.variant] - Ключ визуального варианта.
 * @param {string} [options.className] - Дополнительные CSS-классы.
 * @returns {Promise<string>} Сгенерированная строка HTML.
 */
export async function renderButton(options = {}) {
  return await renderTemplate("./components/button/button.hbs", {
    text: options.text || "Кнопка",
    type: options.type || "button",
    href: options.href || "",
    variant: options.variant || "primary",
    className: options.className || ""
  });
}
