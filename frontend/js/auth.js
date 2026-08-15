"use strict";

/*
 * SmartBus Authentication
 *
 * Connects the frontend to the Spring Boot backend:
 *
 * POST /api/auth/login
 * POST /api/auth/register
 *
 * Backend:
 * http://localhost:8080
 */

const API_BASE_URL = "http://localhost:8080";

/* =========================================================
   Initialization
========================================================= */

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
      const targetId = button.dataset.passwordTarget;
      const passwordInput = document.getElementById(targetId);

      if (!passwordInput) {
        return;
      }

      const isPassword = passwordInput.type === "password";

      passwordInput.type = isPassword ? "text" : "password";

      button.textContent = isPassword ? "Hide" : "Show";

      button.setAttribute(
        "aria-label",
        isPassword ? "Hide password" : "Show password"
      );
    });
  });
}


/* =========================================================
   Login
========================================================= */

function initializeLoginForm() {
  const form = document.getElementById("loginForm");

  if (!form) {
    return;
  }

  const email = document.getElementById("loginEmail");
  const password = document.getElementById("loginPassword");
  const rememberMe = document.getElementById("rememberMe");
  const message = document.getElementById("loginMessage");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearLoginErrors();

    const emailValue = email.value.trim().toLowerCase();
    const passwordValue = password.value;

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

    setLoading(form, true);
    clearMessage(message);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: emailValue,
            password: passwordValue
          })
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(data, "Invalid email or password.")
        );
      }

      /*
       * Store authentication information.
       *
       * "Remember me" controls whether we use localStorage
       * or sessionStorage.
       */
      const storage = rememberMe && rememberMe.checked
        ? localStorage
        : sessionStorage;

      storage.setItem("smartbus_token", data.token);
      storage.setItem("smartbus_token_type", data.tokenType || "Bearer");
      storage.setItem("smartbus_user_id", String(data.userId));
      storage.setItem("smartbus_name", data.name || "");
      storage.setItem("smartbus_email", data.email || "");
      storage.setItem("smartbus_role", data.role || "PASSENGER");

      /*
       * Also remove an old token from the other storage.
       * This prevents stale sessions.
       */
      const otherStorage = storage === localStorage
        ? sessionStorage
        : localStorage;

      otherStorage.removeItem("smartbus_token");
      otherStorage.removeItem("smartbus_token_type");
      otherStorage.removeItem("smartbus_user_id");
      otherStorage.removeItem("smartbus_name");
      otherStorage.removeItem("smartbus_email");
      otherStorage.removeItem("smartbus_role");

      showMessage(
        message,
        "Login successful. Redirecting...",
        "success"
      );

      redirectByRole(data.role);

    } catch (error) {
      console.error("SmartBus login error:", error);

      showMessage(
        message,
        getNetworkErrorMessage(error),
        "error"
      );

    } finally {
      setLoading(form, false);
    }
  });
}


/* =========================================================
   Registration
========================================================= */

function initializeRegisterForm() {
  const form = document.getElementById("registerForm");

  if (!form) {
    return;
  }

  const name = document.getElementById("registerName");
  const email = document.getElementById("registerEmail");
  const phone = document.getElementById("registerPhone");
  const password = document.getElementById("registerPassword");
  const confirmPassword =
    document.getElementById("registerConfirmPassword");
  const terms = document.getElementById("acceptTerms");
  const message = document.getElementById("registerMessage");

  /*
   * Keep phone number numeric.
   */
  phone.addEventListener("input", () => {
    phone.value = phone.value
      .replace(/\D/g, "")
      .slice(0, 10);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    clearRegisterErrors();

    const nameValue = name.value.trim();
    const emailValue = email.value.trim().toLowerCase();
    const phoneValue = phone.value.trim();
    const passwordValue = password.value;
    const confirmPasswordValue = confirmPassword.value;

    let valid = true;

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

    setLoading(form, true);
    clearMessage(message);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: nameValue,
            email: emailValue,
            phone: phoneValue,
            password: passwordValue
          })
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            data,
            "Unable to create your account."
          )
        );
      }

      /*
       * Registration already returns a JWT,
       * so we can authenticate the user immediately.
       */
      localStorage.setItem(
        "smartbus_token",
        data.token
      );

      localStorage.setItem(
        "smartbus_token_type",
        data.tokenType || "Bearer"
      );

      localStorage.setItem(
        "smartbus_user_id",
        String(data.userId)
      );

      localStorage.setItem(
        "smartbus_name",
        data.name || nameValue
      );

      localStorage.setItem(
        "smartbus_email",
        data.email || emailValue
      );

      localStorage.setItem(
        "smartbus_role",
        data.role || "PASSENGER"
      );

      sessionStorage.removeItem("smartbus_token");
      sessionStorage.removeItem("smartbus_token_type");
      sessionStorage.removeItem("smartbus_user_id");
      sessionStorage.removeItem("smartbus_name");
      sessionStorage.removeItem("smartbus_email");
      sessionStorage.removeItem("smartbus_role");

      showMessage(
        message,
        "Account created successfully. Redirecting...",
        "success"
      );

      redirectByRole(data.role);

    } catch (error) {
      console.error("SmartBus registration error:", error);

      showMessage(
        message,
        getNetworkErrorMessage(error),
        "error"
      );

    } finally {
      setLoading(form, false);
    }
  });
}


/* =========================================================
   Role-Based Redirect
========================================================= */

function redirectByRole(role) {
  const normalizedRole =
    String(role || "PASSENGER").toUpperCase();

  let destination;

  switch (normalizedRole) {
    case "ADMIN":
      destination = "./admin/dashboard.html";
      break;

    case "DRIVER":
      destination = "./driver/dashboard.html";
      break;

    case "PASSENGER":
    default:
      destination = "./passenger/dashboard.html";
      break;
  }

  /*
   * Small delay lets the success message be visible.
   */
  setTimeout(() => {
    window.location.href = destination;
  }, 500);
}


/* =========================================================
   API Helpers
========================================================= */

async function parseResponse(response) {
  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return await response.json();
  }

  const text = await response.text();

  return {
    message: text
  };
}


function getApiErrorMessage(data, fallback) {
  if (!data) {
    return fallback;
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data.message) {
    return data.message;
  }

  if (data.error) {
    return data.error;
  }

  if (data.detail) {
    return data.detail;
  }

  return fallback;
}


function getNetworkErrorMessage(error) {
  if (
    error instanceof TypeError &&
    error.message.toLowerCase().includes("fetch")
  ) {
    return "Unable to connect to SmartBus server. Make sure the backend is running on port 8080.";
  }

  return error.message || "Something went wrong. Please try again.";
}


/* =========================================================
   Loading State
========================================================= */

function setLoading(form, loading) {
  if (!form) {
    return;
  }

  const submitButton =
    form.querySelector('button[type="submit"]');

  if (!submitButton) {
    return;
  }

  if (loading) {
    if (!submitButton.dataset.originalText) {
      submitButton.dataset.originalText =
        submitButton.innerHTML;
    }

    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");

    submitButton.innerHTML = "Please wait...";
  } else {
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-busy");

    if (submitButton.dataset.originalText) {
      submitButton.innerHTML =
        submitButton.dataset.originalText;
    }
  }
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


function clearMessage(element) {
  if (!element) {
    return;
  }

  element.textContent = "";

  element.classList.remove(
    "error",
    "success"
  );
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
