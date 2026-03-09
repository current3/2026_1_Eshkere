import { renderTemplate } from "../../assets/js/utils/render.js";
import { renderPublicLayout } from "../../layouts/public/public-layout.js";
import { renderFormField } from "../../components/form-field/form-field.js";
import { renderButton } from "../../components/button/button.js";
import {
  validateEmailOrPhone,
  validatePassword,
  setFieldState
} from "../../assets/js/utils/validators.js";
import { loginUser } from "../../assets/js/services/auth.service.js";

/**
 * Рендерит содержимое страницы входа и оборачивает его в публичный layout.
 *
 * @returns {Promise<string>} Сгенерированная строка HTML.
 */
export async function renderLoginPage() {
  const loginField = await renderFormField({
    id: "login-email",
    name: "email",
    type: "text",
    label: "Электронная почта или телефон",
    placeholder: "Ваш логин",
    required: true
  });

  const passwordField = await renderFormField({
    id: "login-password",
    name: "password",
    type: "password",
    label: "Пароль",
    placeholder: "Ваш пароль",
    required: true
  });

  const submitButton = await renderButton({
    text: "Продолжить",
    type: "submit",
    variant: "primary"
  });

  const registerLinkButton = await renderButton({
    text: "Зарегистрироваться",
    href: "#/register",
    variant: "secondary"
  });

  const content = await renderTemplate("./pages/login/login.hbs", {
    loginField,
    passwordField,
    submitButton,
    registerLinkButton
  });

  return await renderPublicLayout(content, "/login");
}

/**
 * Подключает валидацию и обработчики submit для формы входа.
 *
 * @returns {void}
 */
export function initLoginPage() {
  const form = document.getElementById("login-form");

  if (!form) {
    return;
  }

  function validateLoginField() {
    const error = validateEmailOrPhone(form.elements.email.value);
    setFieldState(form, "email", error);
    return !error;
  }

  function validatePasswordField() {
    const error = validatePassword(form.elements.password.value);
    setFieldState(form, "password", error);
    return !error;
  }

  form.elements.email.addEventListener("input", validateLoginField);
  form.elements.password.addEventListener("input", validatePasswordField);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const isLoginValid = validateLoginField();
    const isPasswordValid = validatePasswordField();

    if (!isLoginValid || !isPasswordValid) {
      return;
    }

    const result = await loginUser({
      identifier: form.elements.email.value,
      password: form.elements.password.value
    });

    if (!result.ok) {
      setFieldState(form, "email", result.message);
      setFieldState(form, "password", " ");
      return;
    }

    location.hash = "#/ads";
  });
}
