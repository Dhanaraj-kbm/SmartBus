"use strict";

/*
 * SmartBus Seat Selection
 *
 * Frontend demo implementation.
 *
 * Later:
 *
 * GET /api/buses/{id}/seats
 *
 * will provide the real seat availability from
 * the Spring Boot backend.
 */


document.addEventListener("DOMContentLoaded", () => {

    initializeSeatSelection();

});


/* =========================================================
   Configuration
   ========================================================= */

const MAX_SEATS = 6;

const SEAT_PRICE = 850;

const SERVICE_FEE_PER_SEAT = 25;


/*
 * Demo occupied seats.
 *
 * Backend will eventually provide these.
 */

const occupiedSeats = new Set([
    "A2",
    "A3",
    "B1",
    "B4",
    "C2",
    "D3",
    "E1",
    "E4",
    "F2",
    "G3",
    "H1",
    "H4"
]);


const selectedSeats = new Set();


/* =========================================================
   Initialization
   ========================================================= */

function initializeSeatSelection() {

    renderSeatGrid();

    updateSummary();

    initializeContinueButton();

}


/* =========================================================
   Seat Layout
   ========================================================= */

function renderSeatGrid() {

    const grid =
        document.getElementById("seatGrid");

    if (!grid) {
        return;
    }


    const rows =
        [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H"
        ];


    grid.innerHTML = "";


    rows.forEach((row) => {

        const rowElement =
            document.createElement("div");

        rowElement.className =
            "seat-row";


        const rowLabel =
            document.createElement("span");

        rowLabel.className =
            "seat-row-label";

        rowLabel.textContent =
            row;


        rowElement.appendChild(rowLabel);


        /*
         * Layout:
         *
         * A1 A2 | A3 A4
         *
         * Creates an aisle between seats.
         */

        for (let number = 1; number <= 4; number++) {

            if (number === 3) {

                const aisle =
                    document.createElement("span");

                aisle.className =
                    "seat-aisle";

                rowElement.appendChild(aisle);

            }


            const seatId =
                `${row}${number}`;


            const seatButton =
                document.createElement("button");

            seatButton.type =
                "button";

            seatButton.className =
                "bus-seat";

            seatButton.dataset.seat =
                seatId;

            seatButton.textContent =
                number;

            seatButton.setAttribute(
                "aria-label",
                `Seat ${seatId}`
            );


            if (occupiedSeats.has(seatId)) {

                seatButton.classList.add(
                    "occupied"
                );

                seatButton.disabled = true;

                seatButton.setAttribute(
                    "aria-label",
                    `Seat ${seatId}, occupied`
                );

            } else {

                seatButton.classList.add(
                    "available"
                );

                seatButton.addEventListener(
                    "click",
                    () => toggleSeat(seatId)
                );

            }


            rowElement.appendChild(
                seatButton
            );

        }


        grid.appendChild(rowElement);

    });

}


/* =========================================================
   Seat Selection
   ========================================================= */

function toggleSeat(seatId) {

    /*
     * Deselect
     */

    if (selectedSeats.has(seatId)) {

        selectedSeats.delete(seatId);

        updateSeatVisual(
            seatId,
            false
        );

        updateSummary();

        return;
    }


    /*
     * Maximum selection
     */

    if (selectedSeats.size >= MAX_SEATS) {

        showSeatMessage(
            `You can select a maximum of ${MAX_SEATS} seats.`
        );

        return;
    }


    /*
     * Select
     */

    selectedSeats.add(seatId);

    updateSeatVisual(
        seatId,
        true
    );

    updateSummary();

}


/* =========================================================
   Visual State
   ========================================================= */

function updateSeatVisual(
    seatId,
    selected
) {

    const seat =
        document.querySelector(
            `[data-seat="${seatId}"]`
        );


    if (!seat) {
        return;
    }


    if (selected) {

        seat.classList.remove(
            "available"
        );

        seat.classList.add(
            "selected"
        );

        seat.setAttribute(
            "aria-label",
            `Seat ${seatId}, selected`
        );

    } else {

        seat.classList.remove(
            "selected"
        );

        seat.classList.add(
            "available"
        );

        seat.setAttribute(
            "aria-label",
            `Seat ${seatId}, available`
        );

    }

}


/* =========================================================
   Summary
   ========================================================= */

function updateSummary() {

    const seats =
        [...selectedSeats];


    /*
     * Seat count
     */

    const countElement =
        document.getElementById(
            "selectedSeatCount"
        );

    if (countElement) {

        countElement.textContent =
            seats.length;

    }


    /*
     * Selected seats
     */

    const selectedText =
        document.getElementById(
            "selectedSeatsText"
        );

    if (selectedText) {

        selectedText.textContent =
            seats.length > 0
                ? seats.join(", ")
                : "None";

    }


    /*
     * Fare
     */

    const seatFare =
        seats.length * SEAT_PRICE;


    const serviceFee =
        seats.length * SERVICE_FEE_PER_SEAT;


    const total =
        seatFare + serviceFee;


    setText(
        "seatFare",
        formatCurrency(seatFare)
    );


    setText(
        "serviceFee",
        formatCurrency(serviceFee)
    );


    setText(
        "totalFare",
        formatCurrency(total)
    );


    /*
     * Continue button
     */

    const continueButton =
        document.getElementById(
            "continueButton"
        );


    if (continueButton) {

        continueButton.disabled =
            seats.length === 0;

    }

}


/* =========================================================
   Continue
   ========================================================= */

function initializeContinueButton() {

    const button =
        document.getElementById(
            "continueButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            if (selectedSeats.size === 0) {
                return;
            }


            /*
             * Save temporary booking state.
             *
             * Later this information will be
             * submitted to the backend.
             */

            sessionStorage.setItem(
                "smartbus_selected_seats",
                JSON.stringify(
                    [...selectedSeats]
                )
            );


            sessionStorage.setItem(
                "smartbus_seat_total",
                String(
                    calculateTotal()
                )
            );


            /*
             * Next page will be built later.
             */

            window.location.href =
                "./passenger-details.html";

        }
    );

}


/* =========================================================
   Fare
   ========================================================= */

function calculateTotal() {

    const seatFare =
        selectedSeats.size *
        SEAT_PRICE;


    const serviceFee =
        selectedSeats.size *
        SERVICE_FEE_PER_SEAT;


    return seatFare + serviceFee;

}


/* =========================================================
   Helpers
   ========================================================= */

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


function showSeatMessage(message) {

    /*
     * Keep this simple for now.
     *
     * We'll replace it with a proper toast
     * notification during UI polish.
     */

    alert(message);

}