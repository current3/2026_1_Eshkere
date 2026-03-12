import {renderRoute} from './router.js';
import {initializeAuthState} from './services/auth.service.js';

/**
 * Инициализирует auth-состояние и первый рендер приложения.
 *
 * @return {Promise<void>} Завершение стартовой инициализации.
 */
async function bootstrapApp() {
  await initializeAuthState();
  await renderRoute();
}

window.addEventListener('DOMContentLoaded', () => {
  bootstrapApp();
});

window.addEventListener('hashchange', () => {
  renderRoute();
});
