import {renderHomePage} from '../../pages/home/home.js';
import {renderLoginPage, initLoginPage} from '../../pages/login/login.js';
import {
  renderRegisterPage,
  initRegisterPage,
} from '../../pages/register/register.js';
import {renderAdsPage, initAdsPage} from '../../pages/ads/ads.js';
import {isAuthenticated, hasActiveSession} from './services/auth.service.js';
import {initNavbar} from '../../components/navbar/navbar.js';

/**
 * @typedef {Object} RouteDefinition
 * @property {() => Promise<string>} render
 * @property {() => (void|(() => void))} [init]
 * @property {boolean} [guestOnly]
 * @property {boolean} [protected]
 */

/** @type {Record<string, RouteDefinition>} */
const routes = {
  '/': {
    render: renderHomePage,
  },
  '/login': {
    render: renderLoginPage,
    init: initLoginPage,
    guestOnly: true,
  },
  '/register': {
    render: renderRegisterPage,
    init: initRegisterPage,
    guestOnly: true,
  },
  '/ads': {
    render: renderAdsPage,
    init: initAdsPage,
    protected: true,
  },
};

let activeCleanup = null;
let renderRequestId = 0;

/**
 * Определяет текущий hash-маршрут и рендерит нужную страницу.
 *
 * @return {Promise<void>} Завершение рендера маршрута.
 */
export async function renderRoute() {
  renderRequestId += 1;
  const currentRequestId = renderRequestId;

  if (typeof activeCleanup === 'function') {
    activeCleanup();
    activeCleanup = null;
  }

  const app = document.getElementById('app');
  const path = location.hash.slice(1) || '/';
  const route = routes[path];

  if (!route) {
    app.innerHTML = '<h1>404</h1><p>Страница не найдена</p>';
    return;
  }

  if (route.protected) {
    const sessionIsActive = await hasActiveSession();

    if (!sessionIsActive) {
      location.hash = '#/login';
      return;
    }
  }

  if (route.guestOnly && isAuthenticated()) {
    location.hash = '#/ads';
    return;
  }

  try {
    const html = await route.render();

    if (currentRequestId !== renderRequestId) {
      return;
    }

    app.innerHTML = html;

    const cleanups = [];

    if (route.init) {
      const routeCleanup = route.init();
      if (typeof routeCleanup === 'function') {
        cleanups.push(routeCleanup);
      }
    }

    const navbarCleanup = initNavbar();
    if (typeof navbarCleanup === 'function') {
      cleanups.push(navbarCleanup);
    }

    if (cleanups.length > 0) {
      activeCleanup = () => {
        cleanups.forEach((cleanup) => cleanup());
      };
    }
  } catch (error) {
    console.error(error);
    app.innerHTML = '<h1>Ошибка</h1><p>Не удалось загрузить страницу</p>';
  }
}
