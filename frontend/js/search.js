"use strict";

/*
 * =========================================================
 * SmartBus Bus Search
 * =========================================================
 *
 * Backend APIs:
 *
 * GET /api/schedules
 *
 * Flow:
 *
 * Backend schedules
 *        ↓
 * Search and filter results
 *        ↓
 * User clicks Select Seats
 *        ↓
 * seat-selection.html?scheduleId=REAL_BACKEND_ID
 *
 * Important:
 * The schedule ID is never hardcoded.
 * Each result uses the real schedule.id from the backend.
 */

const API_BASE_URL = "http://127.0.0.1:8080";

let allSchedules = [];
let filteredSchedules = [];


/* =========================================================
   Initialization
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

  initializeSearchDate();
  initializeRouteSwap();
  initializeSearchForm();
  initializeFilters();
  initializeSorting();

  await loadSchedules();

});


/* =========================================================
   Authentication
   ========================================================= */

function getAuthToken() {

  return (
    localStorage.getItem("smartbus_token") ||
    sessionStorage.getItem("smartbus_token")
  );

}


function getAuthorizationHeaders() {

  const token =
    getAuthToken();

  if (!token) {

    throw new Error(
      "Authentication token not found. Please log in again."
    );

  }

  return {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/json"
  };

}


/* =========================================================
   Date
   ========================================================= */

function initializeSearchDate() {

  const dateInput =
    document.getElementById("searchDate");

  if (!dateInput) {
    return;
  }

  const today =
    new Date();

  const year =
    today.getFullYear();

  const month =
    String(
      today.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      today.getDate()
    ).padStart(2, "0");

  const todayString =
    `${year}-${month}-${day}`;

  dateInput.min =
    todayString;

  /*
   * Keep the current value if one already exists.
   */
  if (!dateInput.value) {

    dateInput.value =
      "2026-08-20";

  }

}


/* =========================================================
   Route Swap
   ========================================================= */

function initializeRouteSwap() {

  const button =
    document.getElementById(
      "swapRouteButton"
    );

  const from =
    document.getElementById(
      "searchFrom"
    );

  const to =
    document.getElementById(
      "searchTo"
    );

  if (
    !button ||
    !from ||
    !to
  ) {
    return;
  }

  button.addEventListener(
    "click",
    () => {

      const temporary =
        from.value;

      from.value =
        to.value;

      to.value =
        temporary;

      applySearch();

    }
  );

}


/* =========================================================
   Search Form
   ========================================================= */

function initializeSearchForm() {

  const form =
    document.getElementById(
      "searchForm"
    );

  const button =
    document.getElementById(
      "searchButton"
    );

  if (form) {

    form.addEventListener(
      "submit",
      event => {

        event.preventDefault();

        applySearch();

      }
    );

  }

  if (
    button &&
    !form
  ) {

    button.addEventListener(
      "click",
      applySearch
    );

  }

}


/* =========================================================
   Load Schedules
   ========================================================= */

async function loadSchedules() {

  setLoadingState(true);

  try {

    const response =
      await fetch(
        `${API_BASE_URL}/api/schedules`,
        {
          method: "GET",

          headers:
            getAuthorizationHeaders()
        }
      );

    if (!response.ok) {

      handleApiError(
        response,
        "Failed to load bus schedules."
      );

    }

    const data =
      await response.json();

    if (!Array.isArray(data)) {

      throw new Error(
        "Invalid schedule data received from the server."
      );

    }

    allSchedules =
      data.filter(
        schedule =>
          isValidSchedule(
            schedule
          )
      );

    applySearch();

  } catch (error) {

    console.error(
      "Failed to load schedules:",
      error
    );

    allSchedules = [];
    filteredSchedules = [];

    renderBusResults();

    showSearchMessage(
      error.message ||
      "Unable to load buses."
    );

  } finally {

    setLoadingState(false);

  }

}


/* =========================================================
   Schedule Validation
   ========================================================= */

function isValidSchedule(schedule) {

  return Boolean(
    schedule &&
    schedule.id &&
    schedule.bus &&
    schedule.route &&
    schedule.departureTime &&
    schedule.arrivalTime
  );

}


/* =========================================================
   Search
   ========================================================= */

function applySearch() {

  const from =
    getInputValue(
      "searchFrom"
    );

  const to =
    getInputValue(
      "searchTo"
    );

  const date =
    getInputValue(
      "searchDate"
    );

  filteredSchedules =
    allSchedules.filter(
      schedule => {

        const route =
          schedule.route;

        const departure =
          new Date(
            schedule.departureTime
          );

        const matchesFrom =
          !from ||
          normalizeText(
            route.source
          ).includes(
            normalizeText(from)
          );

        const matchesTo =
          !to ||
          normalizeText(
            route.destination
          ).includes(
            normalizeText(to)
          );

        const matchesDate =
          !date ||
          formatDateForInput(
            departure
          ) === date;

        return (
          matchesFrom &&
          matchesTo &&
          matchesDate
        );

      }
    );

  applyFilters();

}


/* =========================================================
   Filters
   ========================================================= */

function initializeFilters() {

  const checkboxes =
    document.querySelectorAll(
      ".filter-checkbox, [data-filter]"
    );

  checkboxes.forEach(
    checkbox => {

      checkbox.addEventListener(
        "change",
        applyFilters
      );

    }
  );

  const priceRange =
    document.getElementById(
      "priceRange"
    );

  if (priceRange) {

    priceRange.addEventListener(
      "input",
      applyFilters
    );

  }

}


function applyFilters() {

  let results =
    [...filteredSchedules];

  const selectedTimes =
    getCheckedValues(
      'input[name="departureTime"]'
    );

  const selectedBusTypes =
    getCheckedValues(
      'input[name="busType"]'
    );

  const selectedSeatTypes =
    getCheckedValues(
      'input[name="seatType"]'
    );

  const maxPrice =
    getMaxPrice();


  /* -----------------------------------------------
     Departure Time
     ----------------------------------------------- */

  if (
    selectedTimes.length > 0
  ) {

    results =
      results.filter(
        schedule => {

          const hour =
            new Date(
              schedule.departureTime
            ).getHours();

          return selectedTimes.some(
            value =>
              matchesDepartureTime(
                hour,
                value
              )
          );

        }
      );

  }


  /* -----------------------------------------------
     Bus Type
     ----------------------------------------------- */

  if (
    selectedBusTypes.length > 0
  ) {

    results =
      results.filter(
        schedule => {

          const busType =
            String(
              schedule.bus.busType || ""
            ).toLowerCase();

          return selectedBusTypes.some(
            value =>
              busType.includes(
                String(value)
                  .toLowerCase()
              )
          );

        }
      );

  }


  /* -----------------------------------------------
     Seat Type
     ----------------------------------------------- */

  if (
    selectedSeatTypes.length > 0
  ) {

    results =
      results.filter(
        schedule => {

          const busType =
            String(
              schedule.bus.busType || ""
            ).toLowerCase();

          return selectedSeatTypes.some(
            value =>
              busType.includes(
                String(value)
                  .toLowerCase()
              )
          );

        }
      );

  }


  /* -----------------------------------------------
     Price
     ----------------------------------------------- */

  if (
    maxPrice !== null
  ) {

    results =
      results.filter(
        schedule =>
          Number(
            schedule.fare || 0
          ) <= maxPrice
      );

  }


  filteredSchedules =
    results;

  applySorting();

}


/* =========================================================
   Sorting
   ========================================================= */

function initializeSorting() {

  const sortSelect =
    document.getElementById(
      "sortSelect"
    );

  if (!sortSelect) {
    return;
  }

  sortSelect.addEventListener(
    "change",
    applySorting
  );

}


function applySorting() {

  const sortSelect =
    document.getElementById(
      "sortSelect"
    );

  const sortValue =
    sortSelect
      ? sortSelect.value
      : "recommended";

  filteredSchedules.sort(
    (a, b) => {

      const fareA =
        Number(
          a.fare || 0
        );

      const fareB =
        Number(
          b.fare || 0
        );

      const departureA =
        new Date(
          a.departureTime
        ).getTime();

      const departureB =
        new Date(
          b.departureTime
        ).getTime();


      switch (
      sortValue.toLowerCase()
      ) {

        case "price-low":

          return fareA - fareB;

        case "price-high":

          return fareB - fareA;

        case "departure":

          return (
            departureA -
            departureB
          );

        case "recommended":

        default:

          return (
            fareA -
            fareB
          );

      }

    }
  );

  renderBusResults();

}


/* =========================================================
   Render Results
   ========================================================= */

function renderBusResults() {

  const container =
    document.getElementById(
      "busResults"
    ) ||
    document.querySelector(
      ".bus-results"
    );

  if (!container) {
    return;
  }

  updateBusCount();

  container.innerHTML = "";

  if (
    filteredSchedules.length === 0
  ) {

    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⌕</div>
                <h3>No buses found</h3>
                <p>
                    Try changing your route,
                    travel date, or filters.
                </p>
            </div>
        `;

    return;
  }

  filteredSchedules.forEach(
    schedule => {

      const card =
        createBusCard(
          schedule
        );

      container.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   Create Bus Card
   ========================================================= */

function createBusCard(schedule) {

  const bus =
    schedule.bus;

  const route =
    schedule.route;

  const departure =
    new Date(
      schedule.departureTime
    );

  const arrival =
    new Date(
      schedule.arrivalTime
    );

  const duration =
    calculateDuration(
      departure,
      arrival
    );

  const availableSeats =
    Number(
      bus.totalSeats || 0
    );

  const card =
    document.createElement(
      "article"
    );

  card.className =
    "bus-card";

  card.dataset.scheduleId =
    String(
      schedule.id
    );

  const features =
    getBusFeatures(
      bus.busType
    );

  card.innerHTML = `
        <div class="bus-card-main">

            <div class="bus-info">

                <h3>
                    ${escapeHtml(
    bus.busName ||
    "SmartBus"
  )}
                </h3>

                <div class="bus-tags">

                    ${features
      .map(
        feature => `
                                <span class="bus-tag">
                                    ${escapeHtml(feature)}
                                </span>
                            `
      )
      .join("")
    }

                </div>

            </div>


            <div class="journey-info">

                <div class="time-location">

                    <strong>
                        ${formatTime(departure)}
                    </strong>

                    <span>
                        ${escapeHtml(
      route.source || ""
    )}
                    </span>

                </div>


                <div class="journey-line">

                    <span>
                        ${duration}
                    </span>

                    <div class="route-line">
                        <span class="route-point"></span>
                        <span class="route-path"></span>
                        <span class="route-point"></span>
                    </div>

                    <small>
                        Direct
                    </small>

                </div>


                <div class="time-location">

                    <strong>
                        ${formatTime(arrival)}
                    </strong>

                    <span>
                        ${escapeHtml(
      route.destination || ""
    )}
                    </span>

                </div>

            </div>


            <div class="fare-info">

                <span>
                    Starting from
                </span>

                <strong>
                    ${formatCurrency(
      schedule.fare
    )}
                </strong>

            </div>

        </div>


        <div class="bus-card-footer">

            <div class="bus-features">

                <span>
                    ✓ ${escapeHtml(
      bus.busType ||
      "Bus"
    )}
                </span>

                <span>
                    ✓ Live Tracking
                </span>

            </div>


            <div class="seat-action">

                <span class="seat-count">
                    ${availableSeats} seats
                </span>

                <button
                    type="button"
                    class="select-seat-button"
                    data-schedule-id="${Number(schedule.id)}"
                >
                    Select Seats →
                </button>

            </div>

        </div>
    `;


  const selectButton =
    card.querySelector(
      ".select-seat-button"
    );

  selectButton.addEventListener(
    "click",
    () => {

      openSeatSelection(
        schedule
      );

    }
  );

  return card;

}


/* =========================================================
   Open Seat Selection
   ========================================================= */

function openSeatSelection(schedule) {

  console.log("[search.js] openSeatSelection called with schedule:", schedule);
  console.log("[search.js] schedule.id (backend schedule ID):", schedule.id);
  console.log("[search.js] schedule.bus.busName:", schedule.bus?.busName);

  /*
   * Save the schedule as a convenience for later pages.
   * The seat-selection page still fetches the exact
   * schedule from the backend using scheduleId.
   */

  sessionStorage.setItem(
    "smartbus_schedule_id",
    String(
      schedule.id
    )
  );

  sessionStorage.setItem(
    "smartbus_selected_schedule",
    JSON.stringify(
      schedule
    )
  );


  /*
   * Real backend schedule ID.
   *
   * Example:
   *
   * Highland Bus -> scheduleId=4
   * Royal Express -> scheduleId=8
   */

  const url = `./passenger/seat-selection.html?scheduleId=${encodeURIComponent(schedule.id)}`;
  console.log("[search.js] Navigating to:", url);
  window.location.href = url;

}


/* =========================================================
   Filter Helpers
   ========================================================= */

function getCheckedValues(selector) {

  return [
    ...document.querySelectorAll(
      `${selector}:checked`
    )
  ].map(
    input =>
      input.value ||
      input.dataset.filter ||
      input.dataset.value
  );

}


function getMaxPrice() {

  const range =
    document.getElementById(
      "priceRange"
    );

  if (!range) {
    return null;
  }

  const value =
    Number(
      range.value
    );

  return Number.isFinite(value)
    ? value
    : null;

}


function matchesDepartureTime(
  hour,
  value
) {

  const normalized =
    String(value)
      .toLowerCase()
      .trim();

  if (
    normalized === "morning"
  ) {

    return (
      hour >= 6 &&
      hour < 12
    );

  }

  if (
    normalized === "afternoon"
  ) {

    return (
      hour >= 12 &&
      hour < 18
    );

  }

  if (
    normalized === "evening"
  ) {

    return (
      hour >= 18 ||
      hour < 6
    );

  }

  return true;

}


/* =========================================================
   Bus Count
   ========================================================= */

function updateBusCount() {

  const count =
    filteredSchedules.length;

  const countText =
    `${count} bus${count === 1 ? "" : "es"} found`;

  const element =
    document.getElementById(
      "busCount"
    );

  if (element) {

    element.textContent =
      countText;

  }

}


/* =========================================================
   API Error Handling
   ========================================================= */

function handleApiError(
  response,
  defaultMessage
) {

  if (
    response.status === 401
  ) {

    throw new Error(
      "Your session has expired. Please log in again."
    );

  }

  if (
    response.status === 403
  ) {

    throw new Error(
      "You do not have permission to access bus schedules."
    );

  }

  if (
    response.status === 404
  ) {

    throw new Error(
      "Bus schedules were not found."
    );

  }

  throw new Error(
    `${defaultMessage} HTTP ${response.status}`
  );

}


/* =========================================================
   Loading State
   ========================================================= */

function setLoadingState(isLoading) {

  const container =
    document.getElementById(
      "busResults"
    ) ||
    document.querySelector(
      ".bus-results"
    );

  if (
    !container ||
    !isLoading
  ) {
    return;
  }

  container.innerHTML = `
        <div class="empty-state">
            <h3>Loading buses...</h3>
            <p>
                Please wait while schedules are loaded.
            </p>
        </div>
    `;

}


/* =========================================================
   Utility Functions
   ========================================================= */

function getInputValue(id) {

  const element =
    document.getElementById(id);

  return element
    ? element.value.trim()
    : "";

}


function normalizeText(value) {

  return String(
    value || ""
  )
    .trim()
    .toLowerCase();

}


function formatDateForInput(date) {

  if (
    !(date instanceof Date) ||
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;

}


function formatTime(date) {

  if (
    !(date instanceof Date) ||
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }
  ).format(date);

}


function calculateDuration(
  departure,
  arrival
) {

  if (
    !(departure instanceof Date) ||
    !(arrival instanceof Date)
  ) {
    return "";
  }

  const difference =
    arrival.getTime() -
    departure.getTime();

  if (
    difference < 0
  ) {
    return "";
  }

  const totalMinutes =
    Math.round(
      difference / 60000
    );

  const hours =
    Math.floor(
      totalMinutes / 60
    );

  const minutes =
    totalMinutes % 60;

  return minutes === 0
    ? `${hours}h`
    : `${hours}h ${minutes}m`;

}


function formatCurrency(value) {

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }
  ).format(
    Number(value) || 0
  );

}


function getBusFeatures(busType) {

  const type =
    String(
      busType || ""
    );

  const features =
    [];

  if (
    type.toLowerCase()
      .includes("non-ac")
  ) {

    features.push(
      "Non-AC"
    );

  } else if (
    type.toLowerCase()
      .includes("ac")
  ) {

    features.push(
      "AC"
    );

  }

  if (
    type.toLowerCase()
      .includes("sleeper")
  ) {

    features.push(
      "Sleeper"
    );

  } else if (
    type.toLowerCase()
      .includes("seater")
  ) {

    features.push(
      "Seater"
    );

  }

  return features;

}


function escapeHtml(value) {

  const element =
    document.createElement(
      "div"
    );

  element.textContent =
    String(value || "");

  return element.innerHTML;

}


function showSearchMessage(message) {

  console.warn(
    message
  );

}