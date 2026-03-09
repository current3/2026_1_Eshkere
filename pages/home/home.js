import { renderTemplate } from "../../assets/js/utils/render.js";
import { renderPublicLayout } from "../../layouts/public/public-layout.js";
import { isAuthenticated } from "../../assets/js/services/auth.service.js";

/**
 * Рендерит публичную главную страницу.
 *
 * @returns {Promise<string>} Сгенерированная строка HTML.
 */
export async function renderHomePage() {
  const authed = isAuthenticated();

  const content = await renderTemplate("./pages/home/home.hbs", {
    ctaHref: authed ? "#/ads" : "#/register",
    ctaText: authed ? "Запустить рекламу" : "Запустить рекламу"
  });

  return await renderPublicLayout(content, "/");
}
