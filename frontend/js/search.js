
/*
 * SmartBus Bus Search
 *
 * This currently uses frontend demo data.
 *
 * Later:
 *   demoBuses
 *       ↓
 *   Spring Boot API
 *       ↓
 *   renderBusResults()
 *
 * The UI does not need to be rewritten when the backend
 * becomes available.
 */


document.addEventListener("DOMContentLoaded", () => {

  initializeSearchDate();
  initializeRouteSwap();
  initializeSearchForm();
  initializeFilters();
  initializeSorting();

  renderBusResults();

});


/* =========================================================
   Demo Data
   ========================================================= */

const demoBuses = [

  {
  id: 1,
  scheduleId: 2,
  company: "Royal Express",
    from: "Guwahati",
    to: "Imphal",
    departure: "07:30 AM",
    arrival: "06:00 PM",
    departureHour: 7,
    duration: 630,
    durationText: "10h 30m",
    price: 850,
    busType: "AC",
    seatType: "Sleeper",
    seatsLeft: 12,
    features: [
      "AC",
      "Sleeper",
      "USB Charging",
      "Live Tracking"
    ],
    recommended: true
  },

  {
    id: 2,
    company: "Valley Rider",
    from: "Guwahati",
    to: "Imphal",
    departure: "09:00 AM",
    arrival: "07:30 PM",
    departureHour: 9,
    duration: 630,
    durationText: "10h 30m",
    price: 780,
    busType: "AC",
    seatType: "Seater",
    seatsLeft: 8,
    features: [
      "AC",
      "Seater",
      "USB Charging"
    ],
    recommended: true
  },

  {
    id: 3,
    company: "Highland Bus",
    from: "Guwahati",
    to: "Imphal",
    departure: "11:15 AM",
    arrival: "09:15 PM",
    departureHour: 11,
    duration: 600,
    durationText: "10h",
    price: 720,
    busType: "Non-AC",
    seatType: "Seater",
    seatsLeft: 18,
    features: [
      "Seater",
      "Charging Point"
    ],
    recommended: false
  },

  {
    id: 4,
    company: "Manipur Connect",
    from: "Guwahati",
    to: "Imphal",
    departure: "02:00 PM",
    arrival: "12:00 AM",
    departureHour: 14,
    duration: 600,
    durationText: "10h",
    price: 900,
    busType: "AC",
    seatType: "Sleeper",
    seatsLeft: 5,
    features: [
      "AC",
      "Sleeper",
      "Wi-Fi",
      "Live Tracking"
    ],
    recommended: true
  },

  {
    id: 5,
    company: "North East Travels",
    from: "Guwahati",
    to: "Imphal",
    departure: "06:30 PM",
    arrival: "05:30 AM",
    departureHour: 18,
    duration: 660,
    durationText: "11h",
    price: 820,
    busType: "AC",
    seatType: "Sleeper",
    seatsLeft: 21,
    features: [
      "AC",
      "Sleeper",
      "Blanket"
    ],
    recommended: false
  },

  {
    id: 6,
    company: "Eastern Rider",
    from: "Guwahati",
    to: "Imphal",
    departure: "08:45 PM",
    arrival: "07:15 AM",
    departureHour: 20,
    duration: 630,
    durationText: "10h 30m",
    price: 750,
    busType: "Non-AC",
    seatType: "Sleeper",
    seatsLeft: 9,
    features: [
      "Sleeper",
      "Charging Point"
    ],
    recommended: false
  }

];


/* =========================================================
   Date
   ========================================================= */

function initializeSearchDate() {

  const dateInput =
    document.getElementById("searchDate");

  if (!dateInput) {
    return;
  }


  const today = new Date();

  const year =
    today.getFullYear();

  const month =
    String(today.getMonth() + 1).padStart(2, "0");

  const day =
    String(today.getDate()).padStart(2, "0");


  const todayString =
    `${year}-${month}-${day}`;


  dateInput.min = todayString;


  /*
   * Demo date.
   *
   * In production this can be populated from
   * the dashboard search parameters.
   */
  dateInput.value = "2026-08-20";
}


/* =========================================================
   Route Swap
   ========================================================= */

function initializeRouteSwap() {

  const button =
    document.getElementById("swapRouteButton");

  const from =
    document.getElementById("searchFrom");

  const to =
    document.getElementById("searchTo");


  if (!button || !from || !to) {
    return;
  }


  button.addEventListener("click", () => {

    const temporary =
      from.value;

    from.value =
      to.value;

    to.value =
      temporary;

    renderBusResults();

  });
}


/* =========================================================
   Search Form
   ========================================================= */

function initializeSearchForm() {

  const form =
    document.getElementById("busSearchForm");

  if (!form) {
    return;
  }


  form.addEventListener("submit", (event) => {

    event.preventDefault();


    const from =
      document.getElementById("searchFrom")
        .value
        .trim();

    const to =
      document.getElementById("searchTo")
        .value
        .trim();

    const date =
      document.getElementById("searchDate")
        .value;


    if (!from || !to || !date) {
      return;
    }


    if (
      from.toLowerCase() ===
      to.toLowerCase()
    ) {
      alert(
        "Departure and destination cannot be the same."
      );

      return;
    }


    /*
     * Later:
     *
     * GET /api/buses/search
     *
     * ?from=Guwahati
     * &to=Imphal
     * &date=2026-08-20
     */


    renderBusResults();

  });
}


/* =========================================================
   Filters
   ========================================================= */

function initializeFilters() {

  const filterInputs =
    document.querySelectorAll(
      ".filter-option input"
    );


  filterInputs.forEach((input) => {

    input.addEventListener(
      "change",
      renderBusResults
    );

  });


  const priceFilter =
    document.getElementById("priceFilter");

  const priceValue =
    document.getElementById("priceValue");


  if (priceFilter && priceValue) {

    priceFilter.addEventListener(
      "input",
      () => {

        const value =
          Number(priceFilter.value);

        priceValue.textContent =
          formatCurrency(value);

        renderBusResults();

      }
    );

  }


  const clearButton =
    document.getElementById("clearFilters");


  if (clearButton) {

    clearButton.addEventListener(
      "click",
      () => {

        filterInputs.forEach(
          (input) => {
            input.checked = false;
          }
        );


        if (priceFilter) {
          priceFilter.value = "1500";
        }


        if (priceValue) {
          priceValue.textContent =
            "₹1,500";
        }


        renderBusResults();

      }
    );

  }
}


/* =========================================================
   Sorting
   ========================================================= */

function initializeSorting() {

  const sort =
    document.getElementById("sortResults");


  if (!sort) {
    return;
  }


  sort.addEventListener(
    "change",
    renderBusResults
  );
}


/* =========================================================
   Filter + Sort + Render
   ========================================================= */

function getFilteredBuses() {

  let buses =
    [...demoBuses];


  const departureFilters =
    getCheckedValues("departure");

  const busTypeFilters =
    getCheckedValues("busType");

  const seatTypeFilters =
    getCheckedValues("seatType");


  const maximumPrice =
    Number(
      document.getElementById("priceFilter")
        ?.value || 1500
    );


  /*
   * Departure filtering
   */

  if (departureFilters.length > 0) {

    buses =
      buses.filter((bus) => {

        return departureFilters.some(
          (filter) => {

            if (
              filter === "morning"
            ) {
              return (
                bus.departureHour >= 6 &&
                bus.departureHour < 12
              );
            }


            if (
              filter === "afternoon"
            ) {
              return (
                bus.departureHour >= 12 &&
                bus.departureHour < 18
              );
            }


            if (
              filter === "evening"
            ) {
              return (
                bus.departureHour >= 18 &&
                bus.departureHour <= 23
              );
            }


            return false;

          }
        );

      });

  }


  /*
   * Bus type
   */

  if (busTypeFilters.length > 0) {

    buses =
      buses.filter((bus) =>
        busTypeFilters.includes(
          bus.busType
        )
      );

  }


  /*
   * Seat type
   */

  if (seatTypeFilters.length > 0) {

    buses =
      buses.filter((bus) =>
        seatTypeFilters.includes(
          bus.seatType
        )
      );

  }


  /*
   * Price
   */

  buses =
    buses.filter(
      (bus) =>
        bus.price <= maximumPrice
    );


  /*
   * Sorting
   */

  const sortValue =
    document.getElementById("sortResults")
      ?.value || "recommended";


  if (sortValue === "price-low") {

    buses.sort(
      (a, b) =>
        a.price - b.price
    );

  } else if (sortValue === "price-high") {

    buses.sort(
      (a, b) =>
        b.price - a.price
    );

  } else if (sortValue === "departure") {

    buses.sort(
      (a, b) =>
        a.departureHour -
        b.departureHour
    );

  } else if (sortValue === "duration") {

    buses.sort(
      (a, b) =>
        a.duration -
        b.duration
    );

  } else {

    buses.sort(
      (a, b) =>
        Number(b.recommended) -
        Number(a.recommended)
    );

  }


  return buses;
}


function renderBusResults() {

  const container =
    document.getElementById("busResults");

  const summary =
    document.getElementById("resultsSummary");


  if (!container) {
    return;
  }


  const buses =
    getFilteredBuses();


  if (summary) {

    summary.textContent =
      `${buses.length} ${buses.length === 1
        ? "bus"
        : "buses"
      } found`;

  }


  if (buses.length === 0) {

    container.innerHTML = `
            <div class="results-empty">

                <div
                    class="results-empty-icon"
                    aria-hidden="true"
                >
                    ⌕
                </div>

                <h3>
                    No buses found
                </h3>

                <p>
                    Try changing your filters or
                    selecting another travel option.
                </p>

            </div>
        `;

    return;
  }


  container.innerHTML =
    buses
      .map(renderBusCard)
      .join("");


  initializeSeatButtons();

}


/* =========================================================
   Bus Card
   ========================================================= */

function renderBusCard(bus) {

  const features =
    bus.features
      .map(
        (feature) => `
                    <span class="bus-feature">
                        <span
                            class="bus-feature-icon"
                            aria-hidden="true"
                        >
                            ✓
                        </span>

                        ${escapeHTML(feature)}
                    </span>
                `
      )
      .join("");


  return `
        <article
            class="bus-card"
            data-bus-id="${bus.id}"
data-schedule-id="${bus.scheduleId || ""}"
        >

            <div class="bus-card-main">


                <div class="bus-company">

                    <span class="bus-company-name">
                        ${escapeHTML(bus.company)}
                    </span>

                    <div class="bus-company-meta">

                        <span class="bus-type-badge">
                            ${escapeHTML(bus.busType)}
                        </span>

                        <span class="bus-type-badge">
                            ${escapeHTML(bus.seatType)}
                        </span>

                    </div>

                </div>


                <div class="bus-route">

                    <div class="bus-time">

                        <strong>
                            ${escapeHTML(bus.departure)}
                        </strong>

                        <span>
                            ${escapeHTML(bus.from)}
                        </span>

                    </div>


                    <div class="bus-route-line">

                        <span class="bus-duration">
                            ${escapeHTML(bus.durationText)}
                        </span>

                        <div class="bus-line"></div>

                        <span class="bus-duration">
                            Direct
                        </span>

                    </div>


                    <div class="bus-time destination">

                        <strong>
                            ${escapeHTML(bus.arrival)}
                        </strong>

                        <span>
                            ${escapeHTML(bus.to)}
                        </span>

                    </div>

                </div>


                <div class="bus-price">

                    <span>
                        Starting from
                    </span>

                    <strong>
                        ${formatCurrency(bus.price)}
                    </strong>

                </div>

            </div>


            <div class="bus-card-details">

                <div class="bus-features">
                    ${features}
                </div>


                <div class="bus-card-actions">

                    <span class="seats-left">
                        ${bus.seatsLeft} seats left
                    </span>

                    <button
                        type="button"
                        class="btn btn-primary view-seats-button"
                        data-bus-id="${bus.id}"
data-schedule-id="${bus.scheduleId || ""}"
                    >
                        Select Seats
                        <span aria-hidden="true">→</span>
                    </button>

                </div>

            </div>

        </article>
    `;
}


/* =========================================================
   Seat Selection Button
   ========================================================= */

function initializeSeatButtons() {

  const buttons =
    document.querySelectorAll(
      ".view-seats-button"
    );

  buttons.forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        const busId =
          button.dataset.busId;

        const scheduleId =
          button.dataset.scheduleId;

        if (!scheduleId) {

          alert(
            "No schedule is associated with this bus."
          );

          return;
        }

        /*
         * Preserve the selected bus.
         */
        sessionStorage.setItem(
          "smartbus_selected_bus",
          busId
        );

        /*
         * Preserve the selected schedule.
         */
        sessionStorage.setItem(
          "smartbus_schedule_id",
          scheduleId
        );

        /*
         * Open seat selection using
         * the backend schedule ID.
         */
        window.location.href =
          `./passenger/seat-selection.html?scheduleId=${encodeURIComponent(scheduleId)}`;

      }
    );

  });

}


/* =========================================================
   Helpers
   ========================================================= */

function getCheckedValues(name) {

  return [
    ...document.querySelectorAll(
      `input[name="${name}"]:checked`
    )
  ].map(
    (input) => input.value
  );

}


function formatCurrency(value) {

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }
  ).format(value);

}


function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}
