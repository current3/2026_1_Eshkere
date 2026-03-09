import { renderHomePage } from "../../pages/home/home.js";
import { renderLoginPage, initLoginPage } from "../../pages/login/login.js";
import { renderRegisterPage, initRegisterPage } from "../../pages/register/register.js";
import { renderAdsPage, initAdsPage } from "../../pages/ads/ads.js";
import { isAuthenticated } from "./services/auth.service.js";
import { initNavbar } from "../../components/navbar/navbar.js";

/**
 * @typedef {Object} RouteDefinition
 * @property {() => Promise<string>} render - Асинхронный рендерер HTML страницы.
 * @property {() => void} [init] - Опциональный инициализатор страницы.
 * @property {boolean} [guestOnly] - Маршрут доступен только гостям.
 * @property {boolean} [protected] - Маршрут требует авторизации.
 */

/** @type {Record<string, RouteDefinition>} */
const routes = {
  "/": {
    render: renderHomePage
  },
  "/login": {
    render: renderLoginPage,
    init: initLoginPage,
    guestOnly: true
  },
  "/register": {
    render: renderRegisterPage,
    init: initRegisterPage,
    guestOnly: true
  },
  "/ads": {
    render: renderAdsPage,
    init: initAdsPage,
    protected: true
  }
};

/**
 * Определяет текущий hash-маршрут и рендерит соответствующую страницу в `#app`.
 *
 * @returns {Promise<void>}
 */
export async function renderRoute() {
  const app = document.getElementById("app");
  const path = location.hash.slice(1) || "/";
  const route = routes[path];

  if (!route) {
    app.innerHTML = "<h1>404</h1><p>Страница не найдена</p>";
    return;
  }

  if (route.protected && !isAuthenticated()) {
    location.hash = "#/login";
    return;
  }

  if (route.guestOnly && isAuthenticated()) {
    location.hash = "#/ads";
    return;
  }

  try {
    const html = await route.render();
    app.innerHTML = html;

    if (route.init) {
      route.init();
    }

    initNavbar();
  } catch (error) {
    console.error(error);
    app.innerHTML = "<h1>Ошибка</h1><p>Не удалось загрузить страницу</p>";
  }
}
