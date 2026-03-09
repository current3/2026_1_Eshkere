import { renderTemplate } from "../../assets/js/utils/render.js";
import { renderPublicLayout } from "../../layouts/public/public-layout.js";
import { renderFormField } from "../../components/form-field/form-field.js";
import { renderButton } from "../../components/button/button.js";
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRepeatPassword,
  setFieldState
} from "../../assets/js/utils/validators.js";
import { registerUser } from "../../assets/js/services/auth.service.js";

/**
 * Рендерит содержимое страницы регистрации и оборачивает его в публичный layout.
 *
 * @returns {Promise<string>} Сгенерированная строка HTML.
 */
export async function renderRegisterPage() {
  const emailField = await renderFormField({
    id: "register-email",
    name: "email",
    type: "email",
    label: "Электронная почта",
    placeholder: "Ваш логин",
    required: true
  });

  const phoneField = await renderFormField({
    id: "register-phone",
    name: "phone",
    type: "text",
    label: "Телефон",
    placeholder: "+7 000 000 0000",
    required: true
  });

  const passwordField = await renderFormField({
    id: "register-password",
    name: "password",
    type: "password",
    label: "Пароль",
    placeholder: "Ваш пароль",
    required: true
  });

  const repeatPasswordField = await renderFormField({
    id: "register-password-repeat",
    name: "repeatPassword",
    type: "password",
    label: "Повторите пароль",
    placeholder: "Ваш пароль",
    required: true
  });

  const submitButton = await renderButton({
    text: "Зарегистрироваться",
    type: "submit",
    variant: "primary"
  });

  const loginLinkButton = await renderButton({
    text: "Войти в существующий аккаунт",
    href: "#/login",
    variant: "secondary"
  });

  const content = await renderTemplate("./pages/register/register.hbs", {
    emailField,
    phoneField,
    passwordField,
    repeatPasswordField,
    submitButton,
    loginLinkButton
  });

  return await renderPublicLayout(content, "/register");
}

/**
 * Подключает валидацию и обработчики submit для формы регистрации.
 *
 * @returns {void}
 */
export function initRegisterPage() {
  const form = document.getElementById("register-form");

  if (!form) {
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const SUBMIT_DEBOUNCE_MS = 400;
  let submitDebounceTimer = null;
  let isSubmitting = false;

  function validateEmailField() {
    const error = validateEmail(form.elements.email.value);
    setFieldState(form, "email", error);
    return !error;
  }

  function validatePhoneField() {
    const error = validatePhone(form.elements.phone.value);
    setFieldState(form, "phone", error);
    return !error;
  }

  function validatePasswordField() {
    const error = validatePassword(form.elements.password.value);
    setFieldState(form, "password", error);
    return !error;
  }

  function validateRepeatPasswordField() {
    const error = validateRepeatPassword(
      form.elements.password.value,
      form.elements.repeatPassword.value
    );

    setFieldState(form, "repeatPassword", error);
    return !error;
  }

  form.elements.email.addEventListener("input", validateEmailField);
  form.elements.phone.addEventListener("input", validatePhoneField);
  form.elements.password.addEventListener("input", () => {
    validatePasswordField();
    validateRepeatPasswordField();
  });
  form.elements.repeatPassword.addEventListener("input", validateRepeatPasswordField);

  async function handleRegisterSubmit() {
    if (isSubmitting) {
      return;
    }

    const isEmailValid = validateEmailField();
    const isPhoneValid = validatePhoneField();
    const isPasswordValid = validatePasswordField();
    const isRepeatPasswordValid = validateRepeatPasswordField();

    if (!isEmailValid || !isPhoneValid || !isPasswordValid || !isRepeatPasswordValid) {
      return;
    }

    isSubmitting = true;
    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      const result = await registerUser({
        email: form.elements.email.value,
        phone: form.elements.phone.value,
        password: form.elements.password.value
      });

      if (!result.ok) {
        setFieldState(form, "email", result.message);
        return;
      }

      location.hash = "#/ads";
    } finally {
      isSubmitting = false;
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    clearTimeout(submitDebounceTimer);
    submitDebounceTimer = setTimeout(() => {
      handleRegisterSubmit();
    }, SUBMIT_DEBOUNCE_MS);
  });
}
