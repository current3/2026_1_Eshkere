import {renderTemplate} from '../../assets/js/utils/render.js';
import {isAuthenticated} from '../../assets/js/services/auth.service.js';
import {getCurrentUser} from '../../assets/js/services/auth.service.js';
import {logoutUser} from '../../assets/js/services/auth.service.js';

let navbarLifecycleController = null;

/**
 * Рендерит публичную навигационную панель.
 *
 * @param {string} [pathname="/"] - Активный путь приложения.
 * @return {Promise<string>} Сгенерированная строка HTML.
 */
export async function renderNavbar(pathname = '/') {
  const isAuth = isAuthenticated();
  const currentUser = getCurrentUser() || {};
  const user = {
    ...currentUser,
    name: currentUser.email || currentUser.name || 'Профиль',
    balance: typeof currentUser.balance === 'number' ? currentUser.balance : 0,
    avatar: currentUser.avatar || '../../assets/images/avatar-placeholder.png',
  };

  return await renderTemplate('./components/navbar/navbar.hbs', {
    isLogin: pathname === '/login',
    isRegister: pathname === '/register',
    isAuthenticated: isAuth,
    user: user,
  });
}

/**
 * Подключает обработчик выхода из верхней панели профиля.
 *
 * @return {void}
 */
export function initNavbar() {
  if (navbarLifecycleController) {
    navbarLifecycleController.abort();
  }

  const controller = new AbortController();
  navbarLifecycleController = controller;
  const {signal} = controller;

  const navbar = document.querySelector('.navbar');
  const profileToggleButton = document.getElementById('navbar-profile-toggle');
  const profileMenu = document.getElementById('navbar-profile-menu');
  const logoutButton = document.getElementById('navbar-logout-button');
  const logoutModal = document.getElementById('navbar-logout-modal');
  const logoutConfirmButton = document.getElementById('navbar-logout-confirm');
  const logoutCancelButton = document.getElementById('navbar-logout-cancel');

  if (logoutModal && logoutModal.parentElement !== document.body) {
    document.body.appendChild(logoutModal);
  }

  if (navbar) {
    const syncScrollState = () => {
      navbar.classList.toggle('is-scrolled', window.scrollY > 12);
    };

    syncScrollState();
    window.addEventListener('scroll', syncScrollState, {passive: true, signal});
  }

  if (
    !profileToggleButton ||
    !profileMenu ||
    !logoutButton ||
    !logoutModal ||
    !logoutConfirmButton ||
    !logoutCancelButton
  ) {
    return () => {
      if (navbarLifecycleController === controller) {
        navbarLifecycleController = null;
      }
      controller.abort();
    };
  }

  const closeMenu = () => {
    profileMenu.hidden = true;
    profileToggleButton.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    profileMenu.hidden = false;
    profileToggleButton.setAttribute('aria-expanded', 'true');
  };

  const closeLogoutModal = () => {
    logoutModal.hidden = true;
  };

  const openLogoutModal = () => {
    logoutModal.hidden = false;
  };

  profileToggleButton.addEventListener('click', () => {
    if (profileMenu.hidden) {
      openMenu();
      return;
    }

    closeMenu();
  }, {signal});

  document.addEventListener('click', (event) => {
    if (!profileMenu.hidden && !event.target.closest('.navbar__actions-user')) {
      closeMenu();
    }
  }, {signal});

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !profileMenu.hidden) {
      closeMenu();
    }

    if (event.key === 'Escape' && !logoutModal.hidden) {
      closeLogoutModal();
    }
  }, {signal});

  logoutButton.addEventListener('click', () => {
    closeMenu();
    openLogoutModal();
  }, {signal});

  logoutCancelButton.addEventListener('click', () => {
    closeLogoutModal();
  }, {signal});

  logoutModal.addEventListener('click', (event) => {
    if (event.target === logoutModal) {
      closeLogoutModal();
    }
  }, {signal});

  logoutConfirmButton.addEventListener('click', async () => {
    logoutConfirmButton.disabled = true;

    try {
      await logoutUser();
      location.hash = '#/login';
      closeLogoutModal();
    } finally {
      logoutConfirmButton.disabled = false;
    }
  }, {signal});

  return () => {
    if (navbarLifecycleController === controller) {
      navbarLifecycleController = null;
    }
    controller.abort();
  };
}
