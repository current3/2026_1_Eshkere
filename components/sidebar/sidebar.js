import {renderTemplate} from '../../assets/js/utils/render.js';

/**
 * Рендерит сайдбар дашборда.
 *
 * @return {Promise<string>} Сгенерированная строка HTML.
 */
export async function renderSidebar() {
  return await renderTemplate('./components/sidebar/sidebar.hbs');
}
