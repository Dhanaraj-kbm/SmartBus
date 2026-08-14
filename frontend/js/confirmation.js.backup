"use strict";

document.addEventListener(
    "DOMContentLoaded",
    initializeConfirmation
);


/* =========================================================
   Initialization
========================================================= */

function initializeConfirmation() {

    const bookingData =
        getBookingData();


    /*
     * If the user opens confirmation.html directly
     * without completing a booking, send them back.
     */

    if (!bookingData) {

        redirectToSearch();

        return;
    }


    const bookingId =
        getOrCreateBookingId();


    renderBookingId(
        bookingId
    );

    renderJourney(
        bookingData
    );

    renderPassengers(
        bookingData
    );

    renderContact(
        bookingData
    );

    renderFare(
        bookingData
    );

    initializeCopyButton(
        bookingId
    );

    initializeTicketButton(
        bookingData,
        bookingId
    );

}


/* =========================================================
   Booking Data
========================================================= */

function getBookingData() {

    const storedData =
        sessionStorage.getItem(
            "smartbus_booking_data"
        );


    if (!storedData) {
        return null;
    }


    try {

        const data =
            JSON.parse(storedData);


        if (
            !data ||
            !Array.isArray(data.seats) ||
            !Array.isArray(data.passengers)
        ) {

            return null;
        }


        return data;

    } catch (error) {

        console.error(
            "Unable to read booking data:",
            error
        );

        return null;
    }

}


/* =========================================================
   Booking ID
========================================================= */

function getOrCreateBookingId() {

    const existingId =
        sessionStorage.getItem(
            "smartbus_booking_id"
        );


    if (existingId) {
        return existingId;
    }


    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");


    const random =
        Math.floor(
            1000 + Math.random() * 9000
        );


    const bookingId =
        `SB${year}${month}${random}`;


    sessionStorage.setItem(
        "smartbus_booking_id",
        bookingId
    );


    return bookingId;

}


/* =========================================================
   Render Booking ID
========================================================= */

function renderBookingId(
    bookingId
) {

    setText(
        "bookingId",
        `#${bookingId}`
    );

}


/* =========================================================
   Journey
========================================================= */

function renderJourney(
    bookingData
) {

    const bus =
        bookingData.bus;


    if (!bus) {
        return;
    }


    setText(
        "busName",
        bus.name || "Royal Express"
    );


    setText(
        "departureCity",
        bus.from || "Guwahati"
    );


    setText(
        "arrivalCity",
        bus.to || "Imphal"
    );


    setText(
        "departureTime",
        bus.departure || "07:30 AM"
    );


    setText(
        "arrivalTime",
        bus.arrival || "06:00 PM"
    );


    setText(
        "travelDate",
        formatDate(
            bus.date
        )
    );

}


/* =========================================================
   Passengers
========================================================= */

function renderPassengers(
    bookingData
) {

    const container =
        document.getElementById(
            "confirmedPassengers"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        bookingData.passengers
            .map(
                (passenger, index) =>
                    createPassengerRow(
                        passenger,
                        index
                    )
            )
            .join("");

}


/* =========================================================
   Passenger Row
========================================================= */

function createPassengerRow(
    passenger,
    index
) {

    const gender =
        formatGender(
            passenger.gender
        );


    return `
        <div class="confirmed-passenger">

            <div class="confirmed-passenger-number">
                ${index + 1}
            </div>

            <div class="confirmed-passenger-main">

                <strong>
                    ${escapeHTML(
        passenger.name
    )}
                </strong>

                <span>
                    ${passenger.age} years
                    · ${gender}
                </span>

            </div>

            <span class="confirmed-seat">
                Seat ${escapeHTML(
        passenger.seat
    )}
            </span>

        </div>
    `;

}


/* =========================================================
   Contact
========================================================= */

function renderContact(
    bookingData
) {

    const contact =
        bookingData.contact;


    if (!contact) {
        return;
    }


    setText(
        "contactEmail",
        contact.email || "—"
    );


    setText(
        "contactPhone",
        contact.phone || "—"
    );

}


/* =========================================================
   Fare
========================================================= */

function renderFare(
    bookingData
) {

    const fare =
        bookingData.fare;


    if (!fare) {
        return;
    }


    setText(
        "seatFare",
        formatCurrency(
            fare.seatFare
        )
    );


    setText(
        "serviceFee",
        formatCurrency(
            fare.serviceFee
        )
    );


    setText(
        "totalFare",
        formatCurrency(
            fare.total
        )
    );

}


/* =========================================================
   Copy Booking ID
========================================================= */

function initializeCopyButton(
    bookingId
) {

    const button =
        document.getElementById(
            "copyBookingId"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async () => {

            try {

                await navigator.clipboard.writeText(
                    bookingId
                );


                const originalText =
                    button.textContent;


                button.textContent =
                    "Copied!";


                setTimeout(
                    () => {

                        button.textContent =
                            originalText;

                    },
                    1500
                );

            } catch (error) {

                console.error(
                    "Unable to copy booking ID:",
                    error
                );

            }

        }
    );

}


/* =========================================================
   Ticket Button
========================================================= */

function initializeTicketButton(
    bookingData,
    bookingId
) {

    const button =
        document.getElementById(
            "viewTicketButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            /*
             * Keep the confirmation data available
             * for the ticket page.
             */

            sessionStorage.setItem(
                "smartbus_ticket_data",
                JSON.stringify({
                    ...bookingData,
                    bookingId
                })
            );


            window.location.href =
                "./ticket.html";

        }
    );

}


/* =========================================================
   Helpers
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
    dateString
) {

    if (!dateString) {
        return "—";
    }


    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(date);

}


function formatGender(
    gender
) {

    const values = {

        male: "Male",

        female: "Female",

        other: "Other"

    };


    return values[
        gender
    ] || "—";

}


function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
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


function redirectToSearch() {

    window.location.replace(
        "../search.html"
    );

}
function saveBookingToHistory(
    booking
) {

    const raw =
        localStorage.getItem(
            "smartbus_bookings"
        );


    let bookings = [];


    try {

        const parsed =
            raw
                ? JSON.parse(raw)
                : [];

        bookings =
            Array.isArray(parsed)
                ? parsed
                : [];

    } catch (error) {

        console.error(
            "Unable to read booking history:",
            error
        );

        bookings = [];

    }


    const existingIndex =
        bookings.findIndex(
            item =>
                item.bookingId ===
                booking.bookingId
        );


    if (existingIndex >= 0) {

        bookings[
            existingIndex
        ] = booking;

    } else {

        bookings.unshift(
            booking
        );

    }


    localStorage.setItem(
        "smartbus_bookings",
        JSON.stringify(
            bookings
        )
    );

}