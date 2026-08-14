"use strict";

document.addEventListener(
    "DOMContentLoaded",
    initializeTicket
);


/* =========================================================
   Initialization
========================================================= */

function initializeTicket() {

    const ticketData =
        getTicketData();


    if (!ticketData) {

        redirectToConfirmation();

        return;
    }


    renderBookingId(
        ticketData.bookingId
    );

    renderJourney(
        ticketData
    );

    renderPassengers(
        ticketData
    );

    renderFare(
        ticketData
    );

    renderContact(
        ticketData
    );

    initializePrintButton();

}


/* =========================================================
   Get Ticket Data
========================================================= */

function getTicketData() {

    const storedData =
        sessionStorage.getItem(
            "smartbus_ticket_data"
        );


    if (!storedData) {
        return null;
    }


    try {

        const data =
            JSON.parse(storedData);


        if (!data) {
            return null;
        }


        return data;

    } catch (error) {

        console.error(
            "Unable to load ticket data:",
            error
        );

        return null;
    }

}


/* =========================================================
   Booking ID
========================================================= */

function renderBookingId(
    bookingId
) {

    if (!bookingId) {
        return;
    }


    setText(
        "ticketBookingId",
        `#${bookingId}`
    );

}


/* =========================================================
   Journey
========================================================= */

function renderJourney(
    ticketData
) {

    const bus =
        ticketData.bus;


    if (!bus) {
        return;
    }


    setText(
        "ticketBusName",
        bus.name || "Royal Express"
    );


    setText(
        "ticketBusType",
        bus.type || "AC Sleeper"
    );


    setText(
        "ticketDepartureCity",
        bus.from || "Guwahati"
    );


    setText(
        "ticketArrivalCity",
        bus.to || "Imphal"
    );


    setText(
        "ticketDepartureTime",
        bus.departure || "07:30 AM"
    );


    setText(
        "ticketArrivalTime",
        bus.arrival || "06:00 PM"
    );


    setText(
        "ticketTravelDate",
        formatDate(bus.date)
    );

}


/* =========================================================
   Passengers
========================================================= */

function renderPassengers(
    ticketData
) {

    const container =
        document.getElementById(
            "ticketPassengers"
        );


    if (!container) {
        return;
    }


    const passengers =
        Array.isArray(
            ticketData.passengers
        )
            ? ticketData.passengers
            : [];


    if (!passengers.length) {

        container.innerHTML = `
            <div class="ticket-empty-passengers">
                No passenger information available.
            </div>
        `;

        return;
    }


    container.innerHTML =
        passengers
            .map(
                (passenger, index) =>
                    createPassenger(
                        passenger,
                        index
                    )
            )
            .join("");

}


/* =========================================================
   Passenger
========================================================= */

function createPassenger(
    passenger,
    index
) {

    const name =
        passenger.name ||
        `Passenger ${index + 1}`;


    const age =
        passenger.age ||
        "—";


    const gender =
        formatGender(
            passenger.gender
        );


    const seat =
        passenger.seat ||
        "—";


    return `
        <div class="ticket-passenger">

            <div class="ticket-passenger-number">
                ${index + 1}
            </div>

            <div class="ticket-passenger-info">

                <strong>
                    ${escapeHTML(name)}
                </strong>

                <span>
                    ${escapeHTML(
        String(age)
    )}
                    years
                    ·
                    ${gender}
                </span>

            </div>

            <div class="ticket-seat">

                <span>
                    SEAT
                </span>

                <strong>
                    ${escapeHTML(seat)}
                </strong>

            </div>

        </div>
    `;

}


/* =========================================================
   Fare
========================================================= */

function renderFare(
    ticketData
) {

    const fare =
        ticketData.fare;


    if (!fare) {
        return;
    }


    setText(
        "ticketSeatFare",
        formatCurrency(
            fare.seatFare
        )
    );


    setText(
        "ticketServiceFee",
        formatCurrency(
            fare.serviceFee
        )
    );


    setText(
        "ticketTotalFare",
        formatCurrency(
            fare.total
        )
    );

}


/* =========================================================
   Contact
========================================================= */

function renderContact(
    ticketData
) {

    const contact =
        ticketData.contact;


    if (!contact) {
        return;
    }


    setText(
        "ticketEmail",
        contact.email || "—"
    );


    setText(
        "ticketPhone",
        contact.phone || "—"
    );

}


/* =========================================================
   Print
========================================================= */

function initializePrintButton() {

    const button =
        document.getElementById(
            "printTicket"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            window.print();

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
    id,
    value
) {

    const element =
        document.getElementById(id);


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


function redirectToConfirmation() {

    window.location.replace(
        "./confirmation.html"
    );

}