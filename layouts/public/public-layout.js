import {renderTemplate} from '../../assets/js/utils/render.js';
import {renderNavbar} from '../../components/navbar/navbar.js';

/**
 * Рендерит публичный layout-контейнер с navbar.
 *
 * @param {string} content - Внутренний HTML страницы.
 * @param {string} [pathname="/"] - Текущий pathname маршрута.
 * @return {Promise<string>} Сгенерированная строка HTML.
 */
export async function renderPublicLayout(content, pathname = '/') {
  const navbar = await renderNavbar(pathname);

  return await renderTemplate('./layouts/public/public-layout.hbs', {
    navbar,
    content,
  });
}
