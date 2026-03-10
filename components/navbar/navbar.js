import { renderTemplate } from "../../assets/js/utils/render.js";
import { isAuthenticated } from "../../assets/js/services/auth.service.js";
import { getCurrentUser } from "../../assets/js/services/auth.service.js";
import { logoutUser } from "../../assets/js/services/auth.service.js";

/**
 * Рендерит публичную навигационную панель.
 *
 * @param {string} [pathname="/"] - Активный путь приложения.
 * @returns {Promise<string>} Сгенерированная строка HTML.
 */
export async function renderNavbar(pathname = "/") {
  const isAuth = isAuthenticated();
  const currentUser = getCurrentUser() || {};
  const user = {
    ...currentUser,
    name: currentUser.email || currentUser.name || "Профиль",
    balance: typeof currentUser.balance === "number" ? currentUser.balance : 0,
    avatar: currentUser.avatar || "../../assets/images/avatar-placeholder.png"
  };

  return await renderTemplate("./components/navbar/navbar.hbs", {
    isLogin: pathname === "/login",
    isRegister: pathname === "/register",
    isAuthenticated: isAuth,
    user: user
  });
}

/**
 * Подключает обработчик выхода из верхней панели профиля.
 *
 * @returns {void}
 */
export function initNavbar() {
  const navbar = document.querySelector(".navbar");
  const profileToggleButton = document.getElementById("navbar-profile-toggle");
  const profileMenu = document.getElementById("navbar-profile-menu");
  const logoutButton = document.getElementById("navbar-logout-button");
  const logoutModal = document.getElementById("navbar-logout-modal");
  const logoutConfirmButton = document.getElementById("navbar-logout-confirm");
  const logoutCancelButton = document.getElementById("navbar-logout-cancel");

  if (logoutModal && logoutModal.parentElement !== document.body) {
    document.body.appendChild(logoutModal);
  }

  if (navbar) {
    const syncScrollState = () => {
      navbar.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    syncScrollState();
    window.addEventListener("scroll", syncScrollState, { passive: true });
  }

  if (
    !profileToggleButton ||
    !profileMenu ||
    !logoutButton ||
    !logoutModal ||
    !logoutConfirmButton ||
    !logoutCancelButton
  ) {
    return;
  }

  const closeMenu = () => {
    profileMenu.hidden = true;
    profileToggleButton.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    profileMenu.hidden = false;
    profileToggleButton.setAttribute("aria-expanded", "true");
  };

  const closeLogoutModal = () => {
    logoutModal.hidden = true;
  };

  const openLogoutModal = () => {
    logoutModal.hidden = false;
  };

  profileToggleButton.addEventListener("click", () => {
    if (profileMenu.hidden) {
      openMenu();
      return;
    }

    closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!profileMenu.hidden && !event.target.closest(".navbar__actions-user")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !profileMenu.hidden) {
      closeMenu();
    }

    if (event.key === "Escape" && !logoutModal.hidden) {
      closeLogoutModal();
    }
  });

  logoutButton.addEventListener("click", () => {
    closeMenu();
    openLogoutModal();
  });

  logoutCancelButton.addEventListener("click", () => {
    closeLogoutModal();
  });

  logoutModal.addEventListener("click", (event) => {
    if (event.target === logoutModal) {
      closeLogoutModal();
    }
  });

  logoutConfirmButton.addEventListener("click", async () => {
    logoutConfirmButton.disabled = true;
    await logoutUser();
    location.hash = "#/login";
  });
}
