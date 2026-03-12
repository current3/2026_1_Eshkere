import {renderTemplate} from '../../assets/js/utils/render.js';
import {
  renderDashboardLayout,
} from '../../layouts/dashboard/dashboard-layout.js';
import {getAds} from '../../assets/js/services/ads.service.js';

let adsPageLifecycleController = null;

const MONTHS_RU_SHORT = [
  'янв',
  'фев',
  'мар',
  'апр',
  'май',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
];

const MONTHS_RU_FULL = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

/**
 * Форматирует число как цену в рублях.
 *
 * @param {number} value Значение цены.
 * @return {string} Отформатированная цена.
 */
function formatPrice(value) {
  return `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
}

/**
 * Форматирует дату для отображения.
 *
 * @param {string} value Исходная строка даты.
 * @return {string} Отформатированная дата или прочерк.
 */
function formatDate(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('ru-RU');
}

/**
 * Преобразует объявления в данные для таблицы кампаний.
 *
 * @param {!Array<Object>} [ads=[]] Список объявлений.
 * @return {!Array<Object>} Список кампаний для шаблона.
 */
function mapAdsToCampaigns(ads = []) {
  return ads.map((ad) => ({
    id: ad.id,
    title: ad.title || 'Без названия',
    budget: typeof ad.price === 'number' ? formatPrice(ad.price) : '—',
    goal: ad.target_action || 'Без target action',
    lastActionDate: formatDate(ad.created_at),
    status: 'Активно',
    statusType: 'working',
    enabled: true,
  }));
}

/**
 * Возвращает начало дня.
 *
 * @param {Date} date Исходная дата.
 * @return {Date} Дата без времени.
 */
function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Сдвигает дату на заданное число дней.
 *
 * @param {Date} date Исходная дата.
 * @param {number} days Число дней для сдвига.
 * @return {Date} Новая дата.
 */
function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

/**
 * Сдвигает дату на заданное число месяцев.
 *
 * @param {Date} date Исходная дата.
 * @param {number} months Число месяцев для сдвига.
 * @return {Date} Новая дата.
 */
function addMonths(date, months) {
  return new Date(
      date.getFullYear(),
      date.getMonth() + months,
      date.getDate(),
  );
}

/**
 * Возвращает начало месяца.
 *
 * @param {Date} date Исходная дата.
 * @return {Date} Первый день месяца.
 */
function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Возвращает конец месяца.
 *
 * @param {Date} date Исходная дата.
 * @return {Date} Последний день месяца.
 */
function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Возвращает начало года.
 *
 * @param {Date} date Исходная дата.
 * @return {Date} Первый день года.
 */
function startOfYear(date) {
  return new Date(date.getFullYear(), 0, 1);
}

/**
 * Возвращает конец года.
 *
 * @param {Date} date Исходная дата.
 * @return {Date} Последний день года.
 */
function endOfYear(date) {
  return new Date(date.getFullYear(), 11, 31);
}

/**
 * Возвращает начало недели.
 *
 * @param {Date} date Исходная дата.
 * @return {Date} Понедельник соответствующей недели.
 */
function startOfWeek(date) {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return addDays(date, mondayOffset);
}

/**
 * Возвращает конец недели.
 *
 * @param {Date} date Исходная дата.
 * @return {Date} Воскресенье соответствующей недели.
 */
function endOfWeek(date) {
  return addDays(startOfWeek(date), 6);
}

/**
 * Проверяет, совпадают ли даты по дню.
 *
 * @param {Date} first Первая дата.
 * @param {Date} second Вторая дата.
 * @return {boolean} Совпадают ли даты по календарному дню.
 */
function isSameDay(first, second) {
  return first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();
}

/**
 * Проверяет, попадает ли дата в диапазон включительно.
 *
 * @param {Date} date Проверяемая дата.
 * @param {Date} from Начало диапазона.
 * @param {Date} to Конец диапазона.
 * @return {boolean} Попадает ли дата в диапазон.
 */
function isBetween(date, from, to) {
  return date.getTime() >= from.getTime() &&
    date.getTime() <= to.getTime();
}

/**
 * Форматирует подпись диапазона дат.
 *
 * @param {Date} from Начальная дата.
 * @param {Date} to Конечная дата.
 * @return {string} Строка для UI.
 */
function formatRangeLabel(from, to) {
  if (
    from.getFullYear() === to.getFullYear() &&
    from.getMonth() === to.getMonth() &&
    from.getDate() === to.getDate()
  ) {
    return `${from.getDate()} ${MONTHS_RU_SHORT[from.getMonth()]} ` +
      `${from.getFullYear()}`;
  }

  const fromLabel = `${from.getDate()} ${MONTHS_RU_SHORT[from.getMonth()]}`;
  const toLabel = `${to.getDate()} ${MONTHS_RU_SHORT[to.getMonth()]} ` +
    `${to.getFullYear()}`;

  return `${fromLabel} - ${toLabel}`;
}

/**
 * Форматирует дату для поля диапазона.
 *
 * @param {Date} date Исходная дата.
 * @return {string} Дата в формате DD.MM.YYYY.
 */
function formatRangeDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
}

/**
 * Рендерит сетку дней для одного месяца.
 *
 * @param {HTMLElement} gridNode Узел сетки дней.
 * @param {HTMLElement} labelNode Узел подписи месяца.
 * @param {Date} monthDate Дата отображаемого месяца.
 * @param {Date} from Начало выбранного диапазона.
 * @param {Date} to Конец выбранного диапазона.
 * @return {void}
 */
function renderMonthGrid(gridNode, labelNode, monthDate, from, to) {
  labelNode.textContent =
    `${monthDate.getFullYear()} ${MONTHS_RU_FULL[monthDate.getMonth()]}`;
  gridNode.innerHTML = '';

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = first.getDay();
  const leading = firstDay === 0 ? 6 : firstDay - 1;

  for (let index = 0; index < leading; index += 1) {
    const emptyCell = document.createElement('span');
    emptyCell.className = 'campaigns-date-picker__empty';
    gridNode.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const dayNode = document.createElement('button');
    dayNode.type = 'button';
    dayNode.className = 'campaigns-date-picker__day';
    dayNode.textContent = String(day);
    dayNode.dataset.date = date.toISOString();

    if (isBetween(date, from, to)) {
      dayNode.classList.add('is-in-range');
    }

    if (isSameDay(date, from)) {
      dayNode.classList.add('is-range-start', 'is-selected');
    }

    if (isSameDay(date, to)) {
      dayNode.classList.add('is-range-end', 'is-selected');
    }

    gridNode.appendChild(dayNode);
  }
}

/**
 * Инициализирует date picker на странице кампаний.
 *
 * @param {AbortSignal} signal Сигнал жизненного цикла страницы.
 * @return {void}
 */
function initDatePicker(signal) {
  const toggle = document.getElementById('date-filter-toggle');
  const picker = document.getElementById('campaigns-date-picker');
  const filterLabel = document.getElementById('date-filter-label');

  if (!toggle || !picker || !filterLabel) {
    return;
  }

  const monthLeftLabel = document.getElementById('date-month-left-label');
  const monthRightLabel = document.getElementById('date-month-right-label');
  const gridLeft = document.getElementById('date-grid-left');
  const gridRight = document.getElementById('date-grid-right');
  const rangeFromNode = document.getElementById('date-range-from');
  const rangeToNode = document.getElementById('date-range-to');
  const cancelButton = document.getElementById('date-cancel');
  const applyButton = document.getElementById('date-apply');

  const today = startOfDay(new Date());
  let selectedFrom = today;
  let selectedTo = addMonths(today, 1);
  let draftFrom = selectedFrom;
  let draftTo = selectedTo;
  let viewMonth = startOfMonth(draftFrom);
  let pickingTo = false;

  const setPreset = (preset) => {
    const base = startOfDay(new Date());

    switch (preset) {
      case 'today':
        draftFrom = base;
        draftTo = base;
        break;
      case 'week':
        draftFrom = startOfWeek(base);
        draftTo = endOfWeek(base);
        break;
      case 'month':
        draftFrom = startOfMonth(base);
        draftTo = endOfMonth(base);
        break;
      case 'year':
        draftFrom = startOfYear(base);
        draftTo = endOfYear(base);
        break;
      case 'manual':
      default:
        break;
    }

    viewMonth = startOfMonth(draftFrom);
    pickingTo = false;
  };

  const render = () => {
    const rightMonth = new Date(
        viewMonth.getFullYear(),
        viewMonth.getMonth() + 1,
        1,
    );

    renderMonthGrid(
        gridLeft,
        monthLeftLabel,
        viewMonth,
        draftFrom,
        draftTo,
    );
    renderMonthGrid(
        gridRight,
        monthRightLabel,
        rightMonth,
        draftFrom,
        draftTo,
    );

    rangeFromNode.textContent = formatRangeDate(draftFrom);
    rangeToNode.textContent = formatRangeDate(draftTo);
  };

  const close = () => {
    picker.hidden = true;
    toggle.classList.remove('is-open');
  };

  const open = () => {
    draftFrom = selectedFrom;
    draftTo = selectedTo;
    viewMonth = startOfMonth(draftFrom);
    pickingTo = false;
    render();
    picker.hidden = false;
    toggle.classList.add('is-open');
  };

  toggle.addEventListener('click', () => {
    if (picker.hidden) {
      open();
      return;
    }

    close();
  }, {signal});

  picker.addEventListener('click', (event) => {
    const dayButton = event.target.closest('.campaigns-date-picker__day');

    if (!dayButton) {
      return;
    }

    const date = startOfDay(new Date(dayButton.dataset.date));

    if (!pickingTo) {
      draftFrom = date;
      if (draftTo.getTime() < draftFrom.getTime()) {
        draftTo = draftFrom;
      }
      pickingTo = true;
    } else {
      draftTo = date;
      if (draftTo.getTime() < draftFrom.getTime()) {
        const tmp = draftFrom;
        draftFrom = draftTo;
        draftTo = tmp;
      }
      pickingTo = false;
    }

    picker.querySelectorAll('.campaigns-date-picker__preset')
        .forEach((node) => {
          node.classList.remove('is-active');
        });

    const manual = picker.querySelector('[data-preset="manual"]');
    if (manual) {
      manual.classList.add('is-active');
    }

    render();
  }, {signal});

  picker.querySelectorAll('.campaigns-date-picker__preset')
      .forEach((node) => {
        node.addEventListener('click', () => {
          picker.querySelectorAll('.campaigns-date-picker__preset')
              .forEach((item) => {
                item.classList.remove('is-active');
              });

          node.classList.add('is-active');
          setPreset(node.dataset.preset);
          render();
        }, {signal});
      });

  /**
   * Сдвигает отображаемый месяц.
   *
   * @param {number} value Сдвиг в месяцах.
   * @return {void}
   */
  const shiftMonth = (value) => {
    viewMonth = new Date(
        viewMonth.getFullYear(),
        viewMonth.getMonth() + value,
        1,
    );
    render();
  };

  /**
   * Привязывает кнопке обработчик сдвига месяца.
   *
   * @param {string} id Идентификатор кнопки.
   * @param {number} value Сдвиг в месяцах.
   * @return {void}
   */
  const bindShift = (id, value) => {
    const control = document.getElementById(id);

    if (!control) {
      return;
    }

    control.addEventListener('click', () => shiftMonth(value), {signal});
  };

  bindShift('date-prev', -12);
  bindShift('date-prev-month', -1);
  bindShift('date-next-month', 1);
  bindShift('date-next', 12);
  bindShift('date-prev-right', -12);
  bindShift('date-prev-month-right', -1);
  bindShift('date-next-month-right', 1);
  bindShift('date-next-right', 12);

  cancelButton?.addEventListener('click', () => {
    close();
  }, {signal});

  applyButton?.addEventListener('click', () => {
    selectedFrom = draftFrom;
    selectedTo = draftTo;
    filterLabel.textContent = formatRangeLabel(selectedFrom, selectedTo);
    close();
  }, {signal});

  document.addEventListener('click', (event) => {
    if (picker.hidden) {
      return;
    }

    if (
      event.target.closest('#campaigns-date-picker') ||
      event.target.closest('#date-filter-toggle')
    ) {
      return;
    }

    close();
  }, {signal});

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !picker.hidden) {
      close();
    }
  }, {signal});
}

/**
 * Инициализирует выпадающие меню действий кампаний.
 *
 * @param {AbortSignal} signal Сигнал жизненного цикла страницы.
 * @return {void}
 */
function initCampaignActionMenus(signal) {
  const toggles = Array.from(
      document.querySelectorAll('.js-action-menu-toggle'),
  );

  if (!toggles.length) {
    return;
  }

  const closeAll = () => {
    toggles.forEach((toggle) => {
      const container = toggle.closest('.campaign-row__actions');
      const menu = container?.querySelector('.campaign-row__menu');

      if (!menu) {
        return;
      }

      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    });
  };

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', (event) => {
      const deleteAction = event.target.closest(
          '.js-delete-action-trigger',
      );

      if (deleteAction) {
        event.preventDefault();
        event.stopPropagation();
        closeAll();
        document.dispatchEvent(
            new CustomEvent('campaigns:open-delete-modal'),
        );
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const container = toggle.closest('.campaign-row__actions');
      const menu = container?.querySelector('.campaign-row__menu');

      if (!menu) {
        return;
      }

      const willOpen = menu.hidden;
      closeAll();
      menu.hidden = !willOpen;
      toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    }, {signal});
  });

  document.querySelectorAll('.campaign-row__menu-item').forEach((item) => {
    item.addEventListener('click', () => {
      closeAll();

      if (item.classList.contains('js-delete-menu-item')) {
        document.dispatchEvent(
            new CustomEvent('campaigns:open-delete-modal'),
        );
      }
    }, {signal});
  });

  document.addEventListener('click', (event) => {
    if (event.target.closest('.campaign-row__actions')) {
      return;
    }

    closeAll();
  }, {signal});

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAll();
    }
  }, {signal});
}

/**
 * Инициализирует модальное окно удаления кампании.
 *
 * @param {AbortSignal} signal Сигнал жизненного цикла страницы.
 * @return {void}
 */
function initCampaignDeleteModal(signal) {
  const modal = document.getElementById('campaigns-delete-modal');
  const confirmButton = document.getElementById('campaigns-delete-confirm');
  const cancelButton = document.getElementById('campaigns-delete-cancel');

  if (!modal || !confirmButton || !cancelButton) {
    return;
  }

  const close = () => {
    modal.hidden = true;
  };

  const open = () => {
    modal.hidden = false;
  };

  cancelButton.addEventListener('click', close, {signal});
  confirmButton.addEventListener('click', close, {signal});

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      close();
    }
  }, {signal});

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) {
      close();
    }
  }, {signal});

  document.addEventListener('campaigns:open-delete-modal', open, {signal});
}

/**
 * Рендерит страницу списка объявлений.
 *
 * @return {Promise<string>} Сгенерированная строка HTML.
 */
export async function renderAdsPage() {
  const result = await getAds();
  const campaigns = mapAdsToCampaigns(result.ads);

  const content = await renderTemplate('./pages/ads/ads.hbs', {
    campaigns,
    hasCampaigns: campaigns.length > 0,
    loadError: result.ok ? '' : result.message,
  });

  return await renderDashboardLayout(content);
}

/**
 * Инициализирует интерактивность страницы объявлений.
 *
 * @return {(function(): void)|undefined} Функция очистки обработчиков.
 */
export function initAdsPage() {
  if (adsPageLifecycleController) {
    adsPageLifecycleController.abort();
  }

  const controller = new AbortController();
  adsPageLifecycleController = controller;
  const {signal} = controller;

  const logoutButton = document.getElementById('logout-button');
  const navbarLogoutButton = document.getElementById('navbar-logout-button');

  if (logoutButton && navbarLogoutButton) {
    logoutButton.addEventListener('click', () => {
      navbarLogoutButton.click();
    }, {signal});
  }

  initDatePicker(signal);
  initCampaignActionMenus(signal);
  initCampaignDeleteModal(signal);

  return () => {
    if (adsPageLifecycleController === controller) {
      adsPageLifecycleController = null;
    }
    controller.abort();
  };
}
