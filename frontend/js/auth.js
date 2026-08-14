"use strict";

/**
 * SmartBus authentication UI.
 *
 * This file currently handles only client-side validation
 * and UI interactions.
 *
 * Backend authentication will be integrated later through
 * the Spring Boot authentication API.
 */

document.addEventListener("DOMContentLoaded", () => {

  initializePasswordToggles();
  initializeLoginForm();
  initializeRegisterForm();

});


/* =========================================================
   Password Visibility
   ========================================================= */

function initializePasswordToggles() {

  const toggleButtons =
    document.querySelectorAll("[data-password-target]");

  toggleButtons.forEach((button) => {

    button.addEventListener("click", () => {

      const targetId =
        button.dataset.passwordTarget;

      const passwordInput =
        document.getElementById(targetId);

      if (!passwordInput) {
        return;
      }

      const isPassword =
        passwordInput.type === "password";

      passwordInput.type =
        isPassword ? "text" : "password";

      button.textContent =
        isPassword ? "Hide" : "Show";

      button.setAttribute(
        "aria-label",
        isPassword
          ? "Hide password"
          : "Show password"
      );
    });

  });
}


/* =========================================================
   Login
   ========================================================= */

function initializeLoginForm() {

  const form =
    document.getElementById("loginForm");

  if (!form) {
    return;
  }

  const email =
    document.getElementById("loginEmail");

  const password =
    document.getElementById("loginPassword");

  const message =
    document.getElementById("loginMessage");


  form.addEventListener("submit", (event) => {

    event.preventDefault();

    clearLoginErrors();

    const emailValue =
      email.value.trim();

    const passwordValue =
      password.value;

    let valid = true;


    if (!emailValue) {

      setFieldError(
        "loginEmailError",
        "Email address is required."
      );

      valid = false;

    } else if (!isValidEmail(emailValue)) {

      setFieldError(
        "loginEmailError",
        "Enter a valid email address."
      );

      valid = false;
    }


    if (!passwordValue) {

      setFieldError(
        "loginPasswordError",
        "Password is required."
      );

      valid = false;

    }


    if (!valid) {
      return;
    }


    /*
     * Backend integration will eventually happen here.
     *
     * Example future request:
     *
     * POST /api/auth/login
     *
     * {
     *     "email": emailValue,
     *     "password": passwordValue
     * }
     */

    showMessage(
      message,
      "Login form is valid. Backend authentication will be connected next.",
      "success"
    );

  });
}


/* =========================================================
   Registration
   ========================================================= */

function initializeRegisterForm() {

  const form =
    document.getElementById("registerForm");

  if (!form) {
    return;
  }


  const name =
    document.getElementById("registerName");

  const email =
    document.getElementById("registerEmail");

  const phone =
    document.getElementById("registerPhone");

  const password =
    document.getElementById("registerPassword");

  const confirmPassword =
    document.getElementById("registerConfirmPassword");

  const terms =
    document.getElementById("acceptTerms");

  const message =
    document.getElementById("registerMessage");


  /*
   * Keep phone input numeric.
   */
  phone.addEventListener("input", () => {

    phone.value =
      phone.value
        .replace(/\D/g, "")
        .slice(0, 10);

  });


  form.addEventListener("submit", (event) => {

    event.preventDefault();

    clearRegisterErrors();

    let valid = true;


    const nameValue =
      name.value.trim();

    const emailValue =
      email.value.trim();

    const phoneValue =
      phone.value.trim();

    const passwordValue =
      password.value;

    const confirmPasswordValue =
      confirmPassword.value;


    /* Name */

    if (nameValue.length < 2) {

      setFieldError(
        "registerNameError",
        "Enter your full name."
      );

      valid = false;
    }


    /* Email */

    if (!emailValue) {

      setFieldError(
        "registerEmailError",
        "Email address is required."
      );

      valid = false;

    } else if (!isValidEmail(emailValue)) {

      setFieldError(
        "registerEmailError",
        "Enter a valid email address."
      );

      valid = false;
    }


    /* Phone */

    if (!/^\d{10}$/.test(phoneValue)) {

      setFieldError(
        "registerPhoneError",
        "Enter a valid 10-digit phone number."
      );

      valid = false;
    }


    /* Password */

    if (passwordValue.length < 8) {

      setFieldError(
        "registerPasswordError",
        "Password must contain at least 8 characters."
      );

      valid = false;
    }


    /* Confirm password */

    if (confirmPasswordValue !== passwordValue) {

      setFieldError(
        "registerConfirmPasswordError",
        "Passwords do not match."
      );

      valid = false;
    }


    /* Terms */

    if (!terms.checked) {

      setFieldError(
        "termsError",
        "You must accept the terms to continue."
      );

      valid = false;
    }


    if (!valid) {
      return;
    }


    /*
     * Backend integration will eventually happen here.
     *
     * Example future request:
     *
     * POST /api/auth/register
     *
     * {
     *     "name": nameValue,
     *     "email": emailValue,
     *     "phone": phoneValue,
     *     "password": passwordValue
     * }
     */

    showMessage(
      message,
      "Registration form is valid. Backend registration will be connected next.",
      "success"
    );

  });
}


/* =========================================================
   Validation Helpers
   ========================================================= */

function isValidEmail(email) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}


function setFieldError(elementId, message) {

  const element =
    document.getElementById(elementId);

  if (element) {
    element.textContent = message;
  }

}


function showMessage(element, message, type) {

  if (!element) {
    return;
  }

  element.textContent = message;

  element.classList.remove(
    "error",
    "success"
  );

  element.classList.add(type);

}


function clearLoginErrors() {

  const ids = [
    "loginEmailError",
    "loginPasswordError"
  ];

  ids.forEach((id) => {

    const element =
      document.getElementById(id);

    if (element) {
      element.textContent = "";
    }

  });

}


function clearRegisterErrors() {

  const ids = [
    "registerNameError",
    "registerEmailError",
    "registerPhoneError",
    "registerPasswordError",
    "registerConfirmPasswordError",
    "termsError"
  ];

  ids.forEach((id) => {

    const element =
      document.getElementById(id);

    if (element) {
      element.textContent = "";
    }

  });

}