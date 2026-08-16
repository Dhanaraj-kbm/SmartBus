"use strict";

/*
 * SmartBus Seat Selection
 *
 * Loads real seat availability from the Spring Boot backend.
 *
 * API:
 * GET /api/schedules/{scheduleId}/seats
 */

document.addEventListener("DOMContentLoaded", () => {
    initializeSeatSelection();
});


/* =========================================================
   Configuration
   ========================================================= */

const API_BASE_URL = "http://127.0.0.1:8080";

const MAX_SEATS = 6;

const SERVICE_FEE_PER_SEAT = 25;


/*
 * Selected seats are stored locally while the user
 * is on the seat-selection page.
 */

const selectedSeats = new Set();


/*
 * Real seats returned by the backend.
 *
 * Example:
 *
 * {
 *   id: 1,
 *   seatNumber: "A1",
 *   status: "AVAILABLE",
 *   fare: 250.00
 * }
 */

let availableSeats = [];

let seatFare = 0;


/* =========================================================
   Initialization
   ========================================================= */

async function initializeSeatSelection() {

    try {

        /*
         * Get schedule ID from the URL.
         *
         * Example:
         * seat-selection.html?scheduleId=2
         */

        const scheduleId =
            getScheduleId();


        if (!scheduleId) {

            showSeatMessage(
                "No schedule was selected. Please return to the bus search page."
            );

            return;
        }


        await loadSeats(scheduleId);

        renderSeatGrid();

        updateSummary();

        initializeContinueButton();


    } catch (error) {

        console.error(
            "Seat selection initialization failed:",
            error
        );

        showSeatMessage(
            "Unable to load seat information. Please try again."
        );

    }

}


/* =========================================================
   Schedule
   ========================================================= */

function getScheduleId() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    return params.get(
        "scheduleId"
    );

}


/* =========================================================
   API
   ========================================================= */

async function loadSeats(scheduleId) {

    const token =
        localStorage.getItem("smartbus_token") ||
        sessionStorage.getItem("smartbus_token");


    if (!token) {

        throw new Error(
            "Authentication token not found."
        );

    }


    const response =
        await fetch(
            `${API_BASE_URL}/api/schedules/${encodeURIComponent(scheduleId)}/seats`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`,

                    "Accept":
                        "application/json"
                }
            }
        );


    if (!response.ok) {

        if (response.status === 401) {

            throw new Error(
                "Your session has expired."
            );

        }


        if (response.status === 404) {

            throw new Error(
                "Schedule not found."
            );

        }


        throw new Error(
            `Failed to load seats. HTTP ${response.status}`
        );

    }


    const data =
        await response.json();


    if (!Array.isArray(data)) {

        throw new Error(
            "Invalid seat data received from server."
        );

    }


    availableSeats =
        data;


    /*
     * Use the fare returned by the backend.
     *
     * Every seat currently belongs to the same
     * schedule and therefore has the same fare.
     */

    if (availableSeats.length > 0) {

        seatFare =
            Number(
                availableSeats[0].fare
            );

    } else {

        seatFare = 0;

    }

}


/* =========================================================
   Seat Layout
   ========================================================= */

function renderSeatGrid() {

    const grid =
        document.getElementById(
            "seatGrid"
        );


    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    /*
     * Group seats by row.
     *
     * A1 A2 A3 A4
     * B1 B2 B3 B4
     * ...
     */

    const rows = {};


    availableSeats.forEach(
        (seat) => {

            const row =
                seat.seatNumber
                    .charAt(0)
                    .toUpperCase();


            if (!rows[row]) {

                rows[row] = [];

            }


            rows[row].push(
                seat
            );

        }
    );


    const sortedRows =
        Object.keys(rows)
            .sort(
                (a, b) =>
                    a.localeCompare(b)
            );


    sortedRows.forEach(
        (row) => {

            createSeatRow(
                grid,
                row,
                rows[row]
            );

        }
    );

}


/* =========================================================
   Create Seat Row
   ========================================================= */

function createSeatRow(
    grid,
    row,
    seats
) {

    const rowElement =
        document.createElement(
            "div"
        );


    rowElement.className =
        "seat-row";


    /*
     * Row label
     */

    const rowLabel =
        document.createElement(
            "span"
        );


    rowLabel.className =
        "seat-row-label";


    rowLabel.textContent =
        row;


    rowElement.appendChild(
        rowLabel
    );


    /*
     * Sort seats by number.
     */

    seats.sort(
        (a, b) =>
            getSeatNumber(a.seatNumber) -
            getSeatNumber(b.seatNumber)
    );


    /*
     * Render:
     *
     * A1 A2 | A3 A4
     */

    seats.forEach(
        (seat) => {

            const seatNumber =
                getSeatNumber(
                    seat.seatNumber
                );


            /*
             * Insert aisle before seat 3.
             */

            if (seatNumber === 3) {

                const aisle =
                    document.createElement(
                        "span"
                    );


                aisle.className =
                    "seat-aisle";


                aisle.setAttribute(
                    "aria-hidden",
                    "true"
                );


                rowElement.appendChild(
                    aisle
                );

            }


            const seatButton =
                createSeatButton(
                    seat
                );


            rowElement.appendChild(
                seatButton
            );

        }
    );


    grid.appendChild(
        rowElement
    );

}


/* =========================================================
   Seat Button
   ========================================================= */

function createSeatButton(
    seat
) {

    const seatButton =
        document.createElement(
            "button"
        );


    seatButton.type =
        "button";


    seatButton.className =
        "bus-seat";


    seatButton.dataset.seat =
        seat.seatNumber;


    seatButton.textContent =
        seat.seatNumber;


    const status =
        String(
            seat.status || ""
        ).toUpperCase();


    /*
     * Booked seats cannot be selected.
     */

    if (
        status === "BOOKED" ||
        status === "OCCUPIED"
    ) {

        seatButton.classList.add(
            "occupied"
        );


        seatButton.disabled =
            true;


        seatButton.setAttribute(
            "aria-label",
            `Seat ${seat.seatNumber}, occupied`
        );


        return seatButton;

    }


    /*
     * Available seat.
     */

    seatButton.classList.add(
        "available"
    );


    seatButton.setAttribute(
        "aria-label",
        `Seat ${seat.seatNumber}, available`
    );


    seatButton.addEventListener(
        "click",
        () => {

            toggleSeat(
                seat.seatNumber
            );

        }
    );


    return seatButton;

}


/* =========================================================
   Seat Number
   ========================================================= */

function getSeatNumber(
    seatId
) {

    const match =
        String(seatId).match(
            /\d+$/
        );


    return match
        ? Number(match[0])
        : 0;

}


/* =========================================================
   Seat Selection
   ========================================================= */

function toggleSeat(
    seatId
) {

    /*
     * Deselect.
     */

    if (
        selectedSeats.has(
            seatId
        )
    ) {

        selectedSeats.delete(
            seatId
        );


        updateSeatVisual(
            seatId,
            false
        );


        updateSummary();

        return;

    }


    /*
     * Maximum selection.
     */

    if (
        selectedSeats.size >=
        MAX_SEATS
    ) {

        showSeatMessage(
            `You can select a maximum of ${MAX_SEATS} seats.`
        );

        return;

    }


    /*
     * Select.
     */

    selectedSeats.add(
        seatId
    );


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
            `[data-seat="${CSS.escape(seatId)}"]`
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
     * Selected seat count.
     */

    setText(
        "selectedSeatCount",
        String(
            seats.length
        )
    );


    /*
     * Selected seat names.
     */

    setText(
        "selectedSeatsText",
        seats.length > 0
            ? seats.join(", ")
            : "None"
    );


    /*
     * Fare.
     */

    const totalSeatFare =
        seats.length *
        seatFare;


    const serviceFee =
        seats.length *
        SERVICE_FEE_PER_SEAT;


    const total =
        totalSeatFare +
        serviceFee;


    setText(
        "seatFare",
        formatCurrency(
            totalSeatFare
        )
    );


    setText(
        "serviceFee",
        formatCurrency(
            serviceFee
        )
    );


    setText(
        "totalFare",
        formatCurrency(
            total
        )
    );


    /*
     * Continue button.
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

            if (
                selectedSeats.size === 0
            ) {

                return;

            }


            /*
             * Save selected seats for
             * the next booking page.
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
             * Preserve schedule ID.
             */

            const scheduleId =
                getScheduleId();


            if (scheduleId) {

                sessionStorage.setItem(
                    "smartbus_schedule_id",
                    scheduleId
                );

            }


            window.location.href =
                "./passenger-details.html";

        }
    );

}


/* =========================================================
   Fare
   ========================================================= */

function calculateTotal() {

    const seatFareTotal =
        selectedSeats.size *
        seatFare;


    const serviceFee =
        selectedSeats.size *
        SERVICE_FEE_PER_SEAT;


    return (
        seatFareTotal +
        serviceFee
    );

}


/* =========================================================
   Currency
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
    ).format(value);

}


/* =========================================================
   DOM Helper
   ========================================================= */

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


/* =========================================================
   User Message
   ========================================================= */

function showSeatMessage(
    message
) {

    alert(message);

}
