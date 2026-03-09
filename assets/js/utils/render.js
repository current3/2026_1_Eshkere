/**
 * Загружает файл шаблона Handlebars с диска/сервера.
 *
 * @param {string} path - Путь к шаблону.
 * @returns {Promise<string>} Исходный текст шаблона.
 * @throws {Error} Если шаблон не удалось загрузить.
 */
export async function loadTemplate(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Не удалось загрузить шаблон: ${path}`);
  }

  return await response.text();
}

/**
 * Компилирует и рендерит шаблон Handlebars с входными данными.
 *
 * @param {string} path - Путь к шаблону.
 * @param {Record<string, unknown>} [data={}] - Контекст данных, передаваемый в шаблон.
 * @returns {Promise<string>} Сгенерированная строка HTML.
 */
export async function renderTemplate(path, data = {}) {
  const templateSource = await loadTemplate(path);
  const template = Handlebars.compile(templateSource);
  return template(data);
}
