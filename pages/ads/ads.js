import { renderTemplate } from "../../assets/js/utils/render.js";
import { renderDashboardLayout } from "../../layouts/dashboard/dashboard-layout.js";
import { logoutUser } from "../../assets/js/services/auth.service.js";
import { getAds } from "../../assets/js/services/ads.service.js";

const MONTHS_RU_SHORT = [
  "янв",
  "фев",
  "мар",
  "апр",
  "май",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "ноя",
  "дек"
];

const MONTHS_RU_FULL = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь"
];

function formatPrice(value) {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("ru-RU");
}

function mapAdsToCampaigns(ads = []) {
  return ads.map((ad) => ({
    id: ad.id,
    title: ad.title || "Без названия",
    budget: typeof ad.price === "number" ? formatPrice(ad.price) : "—",
    goal: ad.description || "Без описания",
    lastActionDate: formatDate(ad.created_at),
    status: "Активно",
    statusType: "working",
    enabled: true
  }));
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function startOfYear(date) {
  return new Date(date.getFullYear(), 0, 1);
}

function endOfYear(date) {
  return new Date(date.getFullYear(), 11, 31);
}

function startOfWeek(date) {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return addDays(date, mondayOffset);
}

function endOfWeek(date) {
  return addDays(startOfWeek(date), 6);
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isBetween(date, from, to) {
  return date.getTime() >= from.getTime() && date.getTime() <= to.getTime();
}

function formatRangeLabel(from, to) {
  const sameYear = from.getFullYear() === to.getFullYear();
  const fromLabel = `${from.getDate()} ${MONTHS_RU_SHORT[from.getMonth()]}`;
  const toLabel = sameYear
    ? `${to.getDate()} ${MONTHS_RU_SHORT[to.getMonth()]} ${to.getFullYear()}`
    : `${to.getDate()} ${MONTHS_RU_SHORT[to.getMonth()]} ${to.getFullYear()}`;

  if (sameYear && from.getMonth() === to.getMonth() && from.getDate() === to.getDate()) {
    return `${from.getDate()} ${MONTHS_RU_SHORT[from.getMonth()]} ${from.getFullYear()}`;
  }

  return `${fromLabel} - ${toLabel}`;
}

function formatRangeDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}`;
}

function renderMonthGrid(gridNode, labelNode, monthDate, from, to) {
  labelNode.textContent = `${monthDate.getFullYear()} ${MONTHS_RU_FULL[monthDate.getMonth()]}`;
  gridNode.innerHTML = "";

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = first.getDay();
  const leading = firstDay === 0 ? 6 : firstDay - 1;

  for (let i = 0; i < leading; i += 1) {
    const emptyCell = document.createElement("span");
    emptyCell.className = "campaigns-date-picker__empty";
    gridNode.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const dayNode = document.createElement("button");
    dayNode.type = "button";
    dayNode.className = "campaigns-date-picker__day";
    dayNode.textContent = String(day);
    dayNode.dataset.date = date.toISOString();

    if (isBetween(date, from, to)) {
      dayNode.classList.add("is-in-range");
    }

    if (isSameDay(date, from)) {
      dayNode.classList.add("is-range-start", "is-selected");
    }

    if (isSameDay(date, to)) {
      dayNode.classList.add("is-range-end", "is-selected");
    }

    gridNode.appendChild(dayNode);
  }
}

function initDatePicker() {
  const toggle = document.getElementById("date-filter-toggle");
  const picker = document.getElementById("campaigns-date-picker");
  const filterLabel = document.getElementById("date-filter-label");

  if (!toggle || !picker || !filterLabel) {
    return;
  }

  const monthLeftLabel = document.getElementById("date-month-left-label");
  const monthRightLabel = document.getElementById("date-month-right-label");
  const gridLeft = document.getElementById("date-grid-left");
  const gridRight = document.getElementById("date-grid-right");
  const rangeFromNode = document.getElementById("date-range-from");
  const rangeToNode = document.getElementById("date-range-to");
  const cancelButton = document.getElementById("date-cancel");
  const applyButton = document.getElementById("date-apply");

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
      case "today":
        draftFrom = base;
        draftTo = base;
        break;
      case "week":
        draftFrom = startOfWeek(base);
        draftTo = endOfWeek(base);
        break;
      case "month":
        draftFrom = startOfMonth(base);
        draftTo = endOfMonth(base);
        break;
      case "year":
        draftFrom = startOfYear(base);
        draftTo = endOfYear(base);
        break;
      case "manual":
      default:
        break;
    }

    viewMonth = startOfMonth(draftFrom);
    pickingTo = false;
  };

  const render = () => {
    const rightMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1);

    renderMonthGrid(gridLeft, monthLeftLabel, viewMonth, draftFrom, draftTo);
    renderMonthGrid(gridRight, monthRightLabel, rightMonth, draftFrom, draftTo);

    rangeFromNode.textContent = formatRangeDate(draftFrom);
    rangeToNode.textContent = formatRangeDate(draftTo);
  };

  const close = () => {
    picker.hidden = true;
    toggle.classList.remove("is-open");
  };

  const open = () => {
    draftFrom = selectedFrom;
    draftTo = selectedTo;
    viewMonth = startOfMonth(draftFrom);
    pickingTo = false;
    render();
    picker.hidden = false;
    toggle.classList.add("is-open");
  };

  toggle.addEventListener("click", () => {
    if (picker.hidden) {
      open();
      return;
    }

    close();
  });

  picker.addEventListener("click", (event) => {
    const dayButton = event.target.closest(".campaigns-date-picker__day");

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

    picker.querySelectorAll(".campaigns-date-picker__preset").forEach((node) => {
      node.classList.remove("is-active");
    });

    const manual = picker.querySelector('[data-preset="manual"]');
    if (manual) {
      manual.classList.add("is-active");
    }

    render();
  });

  picker.querySelectorAll(".campaigns-date-picker__preset").forEach((node) => {
    node.addEventListener("click", () => {
      picker.querySelectorAll(".campaigns-date-picker__preset").forEach((item) => {
        item.classList.remove("is-active");
      });

      node.classList.add("is-active");
      setPreset(node.dataset.preset);
      render();
    });
  });

  const shiftMonth = (value) => {
    viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + value, 1);
    render();
  };

  const bindShift = (id, value) => {
    const control = document.getElementById(id);

    if (!control) {
      return;
    }

    control.addEventListener("click", () => shiftMonth(value));
  };

  bindShift("date-prev", -12);
  bindShift("date-prev-month", -1);
  bindShift("date-next-month", 1);
  bindShift("date-next", 12);
  bindShift("date-prev-right", -12);
  bindShift("date-prev-month-right", -1);
  bindShift("date-next-month-right", 1);
  bindShift("date-next-right", 12);

  cancelButton?.addEventListener("click", () => {
    close();
  });

  applyButton?.addEventListener("click", () => {
    selectedFrom = draftFrom;
    selectedTo = draftTo;
    filterLabel.textContent = formatRangeLabel(selectedFrom, selectedTo);
    close();
  });

  document.addEventListener("click", (event) => {
    if (picker.hidden) {
      return;
    }

    if (event.target.closest("#campaigns-date-picker") || event.target.closest("#date-filter-toggle")) {
      return;
    }

    close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !picker.hidden) {
      close();
    }
  });
}

export async function renderAdsPage() {
  const result = await getAds();

  const campaigns = mapAdsToCampaigns(result.ads);

  const content = await renderTemplate("./pages/ads/ads.hbs", {
    campaigns,
    hasCampaigns: campaigns.length > 0,
    loadError: result.ok ? "" : result.message
  });

  return await renderDashboardLayout(content);
}

export function initAdsPage() {
  const logoutButton = document.getElementById("logout-button");

  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      logoutButton.disabled = true;
      await logoutUser();
      location.hash = "#/login";
    });
  }

  initDatePicker();
}
