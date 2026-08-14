"use strict";

/**
 * SmartBus Passenger Dashboard
 *
 * Current stage:
 * - UI interactions
 * - Client-side search validation
 * - User dropdown
 * - Mobile navigation
 *
 * Backend API integration will be added later.
 */

document.addEventListener("DOMContentLoaded", () => {
    initializeDashboardSearch();
    initializeUserMenu();
    initializeMobileNavigation();
});


/* =========================================================
   Dashboard Search
   ========================================================= */

function initializeDashboardSearch() {
    const form = document.getElementById("dashboardSearchForm");

    if (!form) {
        return;
    }

    const from = document.getElementById("dashboardFrom");
    const to = document.getElementById("dashboardTo");
    const date = document.getElementById("dashboardDate");

    const message = document.getElementById(
        "dashboardSearchMessage"
    );


    // Prevent selecting a date in the past.
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    date.min = `${year}-${month}-${day}`;


    form.addEventListener("submit", (event) => {
        event.preventDefault();

        clearMessage(message);

        const fromValue = from.value.trim();
        const toValue = to.value.trim();
        const dateValue = date.value;


        if (!fromValue || !toValue || !dateValue) {
            showMessage(
                message,
                "Please complete all search fields.",
                "error"
            );

            return;
        }


        if (
            fromValue.toLowerCase() ===
            toValue.toLowerCase()
        ) {
            showMessage(
                message,
                "Departure and destination cannot be the same.",
                "error"
            );

            return;
        }


        showMessage(
            message,
            "Search details are ready. Backend bus search will be connected later.",
            "success"
        );


        /*
         * Future API:
         *
         * GET /api/buses/search
         *
         * Query:
         * from
         * to
         * travelDate
         */
    });
}


/* =========================================================
   User Menu
   ========================================================= */

function initializeUserMenu() {
    const button =
        document.getElementById("userMenuButton");

    const dropdown =
        document.getElementById("userDropdown");

    if (!button || !dropdown) {
        return;
    }


    button.addEventListener("click", () => {
        const isOpen = !dropdown.hasAttribute("hidden");

        if (isOpen) {
            dropdown.setAttribute("hidden", "");
        } else {
            dropdown.removeAttribute("hidden");
        }

        button.setAttribute(
            "aria-expanded",
            String(!isOpen)
        );
    });


    document.addEventListener("click", (event) => {
        if (
            !button.contains(event.target) &&
            !dropdown.contains(event.target)
        ) {
            dropdown.setAttribute("hidden", "");

            button.setAttribute(
                "aria-expanded",
                "false"
            );
        }
    });


    const logoutButton =
        document.getElementById("logoutButton");

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            /*
             * Real logout will be implemented when
             * authentication is connected to the backend.
             */

            window.location.href = "../index.html";
        });
    }
}


/* =========================================================
   Mobile Navigation
   ========================================================= */

function initializeMobileNavigation() {
    const toggle =
        document.getElementById("dashboardMobileToggle");

    const navigation =
        document.getElementById("dashboardNavigation");

    if (!toggle || !navigation) {
        return;
    }


    toggle.addEventListener("click", () => {
        const isOpen =
            navigation.classList.toggle("open");

        toggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        toggle.setAttribute(
            "aria-label",
            isOpen
                ? "Close navigation menu"
                : "Open navigation menu"
        );
    });


    const links =
        navigation.querySelectorAll("a");

    links.forEach((link) => {
        link.addEventListener("click", () => {
            navigation.classList.remove("open");

            toggle.setAttribute(
                "aria-expanded",
                "false"
            );
        });
    });
}


/* =========================================================
   Message Helpers
   ========================================================= */

function showMessage(element, text, type) {
    if (!element) {
        return;
    }

    element.textContent = text;

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