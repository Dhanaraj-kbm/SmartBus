"use strict";


document.addEventListener(
  "DOMContentLoaded",
  initializeBookings
);


/* =========================================================
   Initialization
========================================================= */

function initializeBookings() {

  const bookings =
    loadBookings();


  updateCounts(bookings);

  renderBookings(
    bookings
  );

  initializeTabs();

}


/* =========================================================
   Load bookings
========================================================= */

function loadBookings() {

  const bookings = [];


  /*
   * The current frontend prototype stores the latest
   * booking in sessionStorage.
   *
   * Later this function will call:
   *
   * GET /api/bookings/my
   *
   * from your Spring Boot backend.
   */


  const currentBooking =
    getCurrentBooking();


  if (currentBooking) {

    bookings.push(
      normalizeBooking(
        currentBooking
      )
    );

  }


  /*
   * Optional local booking history.
   *
   * This lets us keep multiple prototype bookings
   * without changing the backend architecture.
   */

  const storedBookings =
    getStoredBookings();


  storedBookings.forEach(
    booking => {

      if (
        booking.bookingId !==
        currentBooking?.bookingId
      ) {

        bookings.push(
          normalizeBooking(
            booking
          )
        );

      }

    }
  );


  return bookings;

}


/* =========================================================
   Current booking
========================================================= */

function getCurrentBooking() {

  const raw =
    sessionStorage.getItem(
      "smartbus_ticket_data"
    );


  if (!raw) {
    return null;
  }


  try {

    return JSON.parse(raw);

  } catch (error) {

    console.error(
      "Unable to read current booking:",
      error
    );

    return null;

  }

}


/* =========================================================
   Stored bookings
========================================================= */

function getStoredBookings() {

  const raw =
    localStorage.getItem(
      "smartbus_bookings"
    );


  if (!raw) {
    return [];
  }


  try {

    const parsed =
      JSON.parse(raw);


    return Array.isArray(parsed)
      ? parsed
      : [];

  } catch (error) {

    console.error(
      "Unable to read booking history:",
      error
    );

    return [];

  }

}


/* =========================================================
   Normalize booking
========================================================= */

function normalizeBooking(
  booking
) {

  const bus =
    booking.bus || {};

  const fare =
    booking.fare || {};


  const passengers =
    Array.isArray(
      booking.passengers
    )
      ? booking.passengers
      : [];


  return {

    bookingId:
      booking.bookingId ||
      "SB000000000",

    status:
      normalizeStatus(
        booking.status
      ),

    bus: {

      name:
        bus.name ||
        "Royal Express",

      type:
        bus.type ||
        "AC Sleeper",

      from:
        bus.from ||
        "Guwahati",

      to:
        bus.to ||
        "Imphal",

      departure:
        bus.departure ||
        "07:30 AM",

      arrival:
        bus.arrival ||
        "06:00 PM",

      date:
        bus.date ||
        "2026-08-20"

    },

    passengers,

    fare: {

      seatFare:
        Number(
          fare.seatFare
        ) || 0,

      serviceFee:
        Number(
          fare.serviceFee
        ) || 0,

      total:
        Number(
          fare.total
        ) || 0

    },

    createdAt:
      booking.createdAt ||
      new Date().toISOString()

  };

}


/* =========================================================
   Status
========================================================= */

function normalizeStatus(
  status
) {

  const value =
    String(
      status || "upcoming"
    ).toLowerCase();


  if (
    value === "cancelled" ||
    value === "canceled"
  ) {

    return "cancelled";

  }


  if (
    value === "completed" ||
    value === "past"
  ) {

    return "past";

  }


  return "upcoming";

}


/* =========================================================
   Counts
========================================================= */

function updateCounts(
  bookings
) {

  const upcoming =
    bookings.filter(
      booking =>
        booking.status ===
        "upcoming"
    );

  const past =
    bookings.filter(
      booking =>
        booking.status ===
        "past"
    );

  const cancelled =
    bookings.filter(
      booking =>
        booking.status ===
        "cancelled"
    );


  setText(
    "upcomingCount",
    upcoming.length
  );

  setText(
    "pastCount",
    past.length
  );

  setText(
    "cancelledCount",
    cancelled.length
  );


  setText(
    "upcomingSummary",
    formatCount(
      upcoming.length,
      "trip"
    )
  );

  setText(
    "pastSummary",
    formatCount(
      past.length,
      "trip"
    )
  );

  setText(
    "cancelledSummary",
    formatCount(
      cancelled.length,
      "booking"
    )
  );

}


/* =========================================================
   Render all lists
========================================================= */

function renderBookings(
  bookings
) {

  const groups = {

    upcoming:
      bookings.filter(
        booking =>
          booking.status ===
          "upcoming"
      ),

    past:
      bookings.filter(
        booking =>
          booking.status ===
          "past"
      ),

    cancelled:
      bookings.filter(
        booking =>
          booking.status ===
          "cancelled"
      )

  };


  renderList(
    "upcomingList",
    groups.upcoming,
    "upcoming"
  );


  renderList(
    "pastList",
    groups.past,
    "past"
  );


  renderList(
    "cancelledList",
    groups.cancelled,
    "cancelled"
  );

}


/* =========================================================
   Render list
========================================================= */

function renderList(
  elementId,
  bookings,
  type
) {

  const container =
    document.getElementById(
      elementId
    );


  if (!container) {
    return;
  }


  if (!bookings.length) {

    container.innerHTML =
      createEmptyState(
        type
      );

    return;

  }


  container.innerHTML =
    bookings
      .map(
        booking =>
          createBookingCard(
            booking
          )
      )
      .join("");


  initializeCardActions();

}


/* =========================================================
   Booking card
========================================================= */

function createBookingCard(
  booking
) {

  const bus =
    booking.bus;


  const passengers =
    booking.passengers;


  const seats =
    passengers
      .map(
        passenger =>
          passenger.seat
      )
      .filter(Boolean);


  const passengerCount =
    passengers.length;


  const status =
    booking.status;


  return `
        <article
            class="booking-card"
            data-booking-id="${escapeHTML(
    booking.bookingId
  )}"
        >

            <div class="booking-card-top">

                <div class="booking-bus">

                    <div class="booking-bus-icon">
                        🚌
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(
    bus.name
  )}
                        </strong>

                        <span>
                            ${escapeHTML(
    bus.type
  )}
                        </span>

                    </div>

                </div>


                <span
                    class="booking-status booking-status-${status}"
                >
                    ${getStatusLabel(status)}
                </span>

            </div>


            <div class="booking-card-route">

                <div class="booking-route-point">

                    <strong>
                        ${escapeHTML(
    bus.departure
  )}
                    </strong>

                    <span>
                        ${escapeHTML(
    bus.from
  )}
                    </span>

                </div>


                <div class="booking-route-middle">

                    <small>
                        Direct
                    </small>

                    <div class="booking-route-line">

                        <span></span>

                        <div></div>

                        <span>🚌</span>

                        <div></div>

                        <span></span>

                    </div>

                </div>


                <div class="booking-route-point arrival">

                    <strong>
                        ${escapeHTML(
    bus.arrival
  )}
                    </strong>

                    <span>
                        ${escapeHTML(
    bus.to
  )}
                    </span>

                </div>

            </div>


            <div class="booking-card-details">

                <div>

                    <span>
                        Travel date
                    </span>

                    <strong>
                        ${formatDate(
    bus.date
  )}
                    </strong>

                </div>


                <div>

                    <span>
                        Seats
                    </span>

                    <strong>
                        ${seats.length
      ? escapeHTML(
        seats.join(
          ", "
        )
      )
      : "—"
    }
                    </strong>

                </div>


                <div>

                    <span>
                        Passengers
                    </span>

                    <strong>
                        ${passengerCount}
                    </strong>

                </div>


                <div>

                    <span>
                        Total
                    </span>

                    <strong class="booking-price">
                        ${formatCurrency(
      booking.fare.total
    )}
                    </strong>

                </div>

            </div>


            <div class="booking-card-footer">

                <div>

                    <span>
                        Booking ID
                    </span>

                    <strong>
                        #${escapeHTML(
      booking.bookingId
    )}
                    </strong>

                </div>


                <div class="booking-card-actions">

                    <button
                        type="button"
                        class="booking-action secondary"
                        data-action="ticket"
                        data-booking-id="${escapeHTML(
      booking.bookingId
    )}"
                    >
                        View Ticket
                    </button>

                    ${status === "upcoming"
      ? `
                                <button
                                    type="button"
                                    class="booking-action primary"
                                    data-action="track"
                                    data-booking-id="${escapeHTML(
        booking.bookingId
      )}"
                                >
                                    Track Bus
                                </button>
                            `
      : ""
    }

                </div>

            </div>

        </article>
    `;

}


/* =========================================================
   Empty state
========================================================= */

function createEmptyState(
  type
) {

  const messages = {

    upcoming: {

      title:
        "No upcoming trips",

      text:
        "You don't have any upcoming bus journeys.",

      action:
        "Search Buses"

    },

    past: {

      title:
        "No past trips",

      text:
        "Your completed journeys will appear here.",

      action:
        "Book a Bus"

    },

    cancelled: {

      title:
        "No cancelled bookings",

      text:
        "Cancelled reservations will appear here.",

      action:
        "View Upcoming"

    }

  };


  const content =
    messages[type];


  const action =
    type === "cancelled"
      ? `
                <button
                    type="button"
                    class="empty-state-button"
                    data-action="upcoming"
                >
                    ${content.action}
                </button>
            `
      : `
                <a
                    href="../search.html"
                    class="empty-state-button"
                >
                    ${content.action}
                </a>
            `;


  return `
        <div class="booking-empty">

            <div
                class="booking-empty-icon"
                aria-hidden="true"
            >
                🚌
            </div>

            <h3>
                ${content.title}
            </h3>

            <p>
                ${content.text}
            </p>

            ${action}

        </div>
    `;

}


/* =========================================================
   Tabs
========================================================= */

function initializeTabs() {

  const tabs =
    document.querySelectorAll(
      ".booking-tab"
    );


  tabs.forEach(
    tab => {

      tab.addEventListener(
        "click",
        () => {

          const target =
            tab.dataset.tab;


          switchTab(
            target
          );

        }
      );

    }
  );

}


/* =========================================================
   Switch tab
========================================================= */

function switchTab(
  target
) {

  document
    .querySelectorAll(
      ".booking-tab"
    )
    .forEach(
      tab => {

        tab.classList.toggle(
          "active",
          tab.dataset.tab ===
          target
        );

      }
    );


  const sections = {

    upcoming:
      "upcomingBookings",

    past:
      "pastBookings",

    cancelled:
      "cancelledBookings"

  };


  Object.entries(
    sections
  ).forEach(
    ([key, id]) => {

      const section =
        document.getElementById(
          id
        );


      if (section) {

        section.classList.toggle(
          "hidden",
          key !== target
        );

      }

    }
  );

}


/* =========================================================
   Card actions
========================================================= */

function initializeCardActions() {

  document
    .querySelectorAll(
      "[data-action]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          handleAction
        );

      }
    );

}


/* =========================================================
   Handle actions
========================================================= */

function handleAction(
  event
) {

  const button =
    event.currentTarget;


  const action =
    button.dataset.action;


  if (
    action === "ticket"
  ) {

    const booking =
      findBooking(
        button.dataset.bookingId
      );


    if (booking) {

      sessionStorage.setItem(
        "smartbus_ticket_data",
        JSON.stringify(
          booking
        )
      );

      window.location.href =
        "./ticket.html";

    }

    return;
  }


  if (
    action === "track"
  ) {

    window.location.href =
      "./tracking.html";

    return;
  }


  if (
    action === "upcoming"
  ) {

    switchTab(
      "upcoming"
    );

  }

}


/* =========================================================
   Find booking
========================================================= */

function findBooking(
  bookingId
) {

  const bookings =
    loadBookings();


  return bookings.find(
    booking =>
      booking.bookingId ===
      bookingId
  );

}


/* =========================================================
   Formatting
========================================================= */

function formatCurrency(
  value
) {

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


function formatDate(
  value
) {

  if (!value) {
    return "—";
  }


  const date =
    new Date(
      `${value}T00:00:00`
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return value;

  }


  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  ).format(
    date
  );

}


function getStatusLabel(
  status
) {

  const labels = {

    upcoming:
      "Confirmed",

    past:
      "Completed",

    cancelled:
      "Cancelled"

  };


  return labels[
    status
  ] || "Confirmed";

}


function formatCount(
  count,
  singular
) {

  return `${count} ${count === 1
      ? singular
      : `${singular}s`
    }`;

}


/* =========================================================
   Utilities
========================================================= */

function setText(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (element) {

    element.textContent =
      value;

  }

}


function escapeHTML(
  value
) {

  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}