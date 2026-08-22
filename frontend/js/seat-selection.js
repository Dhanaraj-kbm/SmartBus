"use strict";

/*
 * =========================================================
 * SmartBus Seat Selection
 * =========================================================
 *
 * Backend APIs:
 *
 * GET /api/schedules/{scheduleId}
 * GET /api/schedules/{scheduleId}/seats
 *
 * Flow:
 *
 * Search Result
 *      ↓
 * User clicks Select Seats
 *      ↓
 * seat-selection.html?scheduleId=REAL_ID
 *      ↓
 * Load exact schedule from backend
 *      ↓
 * Load seats for the same schedule
 *      ↓
 * Passenger selects seats
 *      ↓
 * Passenger Details
 *
 * Important:
 *
 * Highland Bus -> scheduleId=4
 * Royal Express -> scheduleId=8
 *
 * No bus name is hardcoded.
 * =========================================================
 */


/* =========================================================
   Configuration
   ========================================================= */

const API_BASE_URL =
    "http://127.0.0.1:8080";

const MAX_SEATS =
    6;

const SERVICE_FEE_PER_SEAT =
    25;


/* =========================================================
   Application State
   ========================================================= */

const selectedSeats =
    new Set();

let availableSeats =
    [];

let seatFare =
    0;

let currentSchedule =
    null;


/* =========================================================
   Initialization
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeSeatSelection();

    }
);


async function initializeSeatSelection() {

    try {

        const scheduleId =
            getScheduleId();

        console.log("[seat-selection.js] initializeSeatSelection - scheduleId from URL:", scheduleId);

        if (!scheduleId) {

            throw new Error(
                "No valid schedule was selected. Please return to the bus search page."
            );

        }


        /*
         * Clear old seat selection when opening
         * a new schedule.
         */

        selectedSeats.clear();

        sessionStorage.removeItem(
            "smartbus_selected_seats"
        );

        sessionStorage.removeItem(
            "smartbus_selected_seat_data"
        );


        /*
         * Load the exact schedule first.
         */

        await loadScheduleDetails(
            scheduleId
        );


        /*
         * Then load seats belonging to that
         * exact same schedule.
         */

        await loadSeats(
            scheduleId
        );

        renderSeatGrid();

        updateSummary();

        initializeContinueButton();

    } catch (error) {

        console.error(
            "Seat selection initialization failed:",
            error
        );

        showSeatMessage(
            error.message ||
            "Unable to load seat information."
        );

    }

}


/* =========================================================
   Schedule ID
   ========================================================= */

function getScheduleId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const scheduleId =
        params.get(
            "scheduleId"
        );

    if (!scheduleId) {

        return null;

    }

    const numericScheduleId =
        Number(
            scheduleId
        );

    if (
        !Number.isInteger(
            numericScheduleId
        ) ||
        numericScheduleId <= 0
    ) {

        return null;

    }

    return String(
        numericScheduleId
    );

}


/* =========================================================
   Authentication
   ========================================================= */

function getAuthToken() {

    return (
        localStorage.getItem(
            "smartbus_token"
        ) ||

        sessionStorage.getItem(
            "smartbus_token"
        )
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

        "Authorization":
            `Bearer ${token}`,

        "Accept":
            "application/json"

    };

}


/* =========================================================
   Load Schedule Details
   ========================================================= */

async function loadScheduleDetails(scheduleId) {

    const response =
        await fetch(
            `${API_BASE_URL}/api/schedules/${encodeURIComponent(scheduleId)}`,
            {
                method: "GET",

                headers:
                    getAuthorizationHeaders()
            }
        );


    if (!response.ok) {

        handleApiError(
            response,
            "Failed to load schedule details."
        );

    }


    const schedule =
        await response.json();

    if (
        !schedule ||
        String(schedule.id) !== String(scheduleId)
    ) {

        throw new Error(
            "The backend returned a different schedule than the one selected."
        );

    }

    console.log("[seat-selection.js] loadScheduleDetails - schedule data returned by backend:", schedule);
    console.log("[seat-selection.js] schedule.id:", schedule.id, "busName:", schedule.bus?.busName);

    validateSchedule(
        schedule
    );


    currentSchedule =
        schedule;

    renderScheduleDetails(
        schedule
    );


}


/* =========================================================
   Validate Schedule
   ========================================================= */

function validateSchedule(schedule) {

    if (
        !schedule ||
        !schedule.id ||
        !schedule.bus ||
        !schedule.route ||
        !schedule.departureTime ||
        !schedule.arrivalTime
    ) {

        throw new Error(
            "Invalid schedule data received from the server."
        );

    }

}


/* =========================================================
   Save Selected Schedule
   ========================================================= */

function saveSelectedSchedule(schedule) {

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


    const selectedSchedule = {

        scheduleId:
            Number(
                schedule.id
            ),

        company:
            bus.busName ||
            "SmartBus",

        busName:
            bus.busName ||
            "",

        busNumber:
            bus.busNumber ||
            "",

        busType:
            bus.busType ||
            "",

        from:
            route.source ||
            "",

        to:
            route.destination ||
            "",

        routeName:
            route.routeName ||
            "",

        departureTime:
            formatTime(
                departure
            ),

        arrivalTime:
            formatTime(
                arrival
            ),

        departureDate:
            schedule.departureTime,

        arrivalDate:
            schedule.arrivalTime,

        duration:
            calculateDuration(
                departure,
                arrival
            ),

        fare:
            Number(
                schedule.fare || 0
            )

    };


    sessionStorage.setItem(
        "smartbus_schedule_id",
        String(
            schedule.id
        )
    );


    sessionStorage.setItem(
        "smartbus_selected_schedule",
        JSON.stringify(
            selectedSchedule
        )
    );

}


/* =========================================================
   Render Schedule Details
   ========================================================= */

function renderScheduleDetails(schedule) {

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


    const company =
        bus.busName ||
        "SmartBus";

    const busNumber =
        bus.busNumber ||
        "";

    const busType =
        bus.busType ||
        "";

    const from =
        route.source ||
        "";

    const to =
        route.destination ||
        "";

    const fare =
        Number(
            schedule.fare || 0
        );

    const departureTime =
        formatTime(
            departure
        );

    const arrivalTime =
        formatTime(
            arrival
        );

    const duration =
        calculateDuration(
            departure,
            arrival
        );


    /*
     * Update elements by ID.
     */

    setText(
        "selectedBusName",
        company
    );

    setText(
        "summaryBus",
        company
    );

    setText(
        "selectedBusTypeBadge",
        busType
    );

    setText(
        "selectedBusType",
        busType
    );

    setText("selectedFromCity", from);
    setText("summaryFromCity", from);

    setText("selectedToCity", to);
    setText("summaryToCity", to);

    setText("selectedDepartureTime", departureTime);

    setText(
        "summaryDepartureTime",
        departureTime
    );

    setText("selectedArrivalTime", arrivalTime);

    setText(
        "summaryArrivalTime",
        arrivalTime
    );

    setText("selectedDuration", duration);

    const travelDate =
        departure.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    setText("selectedTravelDate", travelDate);
    setText("summaryTravelDate", travelDate);

    setText(
        "seatFare",
        formatCurrency(
            fare
        )
    );


    /*
     * Update elements by data attribute.
     */

    updateElementsBySelector(
        "[data-bus-name]",
        company
    );

    updateElementsBySelector(
        "[data-company-name]",
        company
    );

    updateElementsBySelector(
        "[data-bus-number]",
        busNumber
    );

    updateElementsBySelector(
        "[data-bus-type]",
        busType
    );

    updateElementsBySelector(
        "[data-route-from]",
        from
    );

    updateElementsBySelector(
        "[data-route-to]",
        to
    );

    updateElementsBySelector(
        "[data-departure-time]",
        departureTime
    );

    updateElementsBySelector(
        "[data-arrival-time]",
        arrivalTime
    );

    updateElementsBySelector(
        "[data-duration]",
        duration
    );

    updateElementsBySelector(
        "[data-fare]",
        formatCurrency(
            fare
        )
    );

}


/* =========================================================
   Load Seats
   ========================================================= */

async function loadSeats(scheduleId) {

    const response =
        await fetch(
            `${API_BASE_URL}/api/schedules/${encodeURIComponent(scheduleId)}/seats`,
            {
                method: "GET",

                headers:
                    getAuthorizationHeaders()
            }
        );


    if (!response.ok) {

        handleApiError(
            response,
            "Failed to load seats."
        );

    }


    const data =
        await response.json();


    if (!Array.isArray(data)) {

        throw new Error(
            "Invalid seat data received from the server."
        );

    }


    availableSeats =
        data;


    if (
        availableSeats.length > 0
    ) {

        seatFare =
            Number(
                availableSeats[0].fare
            ) || 0;

    } else {

        seatFare =
            Number(
                currentSchedule?.fare || 0
            );

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
            "You do not have permission to access this schedule."
        );

    }


    if (
        response.status === 404
    ) {

        throw new Error(
            "The selected schedule was not found."
        );

    }


    throw new Error(
        `${defaultMessage} HTTP ${response.status}`
    );

}


/* =========================================================
   Render Seat Grid
   ========================================================= */

function renderSeatGrid() {

    const grid =
        document.getElementById(
            "seatGrid"
        );

    if (!grid) {

        return;

    }


    grid.innerHTML =
        "";


    const rows =
        {};


    availableSeats.forEach(
        seat => {

            const row =
                getSeatRow(
                    seat.seatNumber
                );

            if (!row) {

                return;

            }


            if (!rows[row]) {

                rows[row] =
                    [];

            }


            rows[row].push(
                seat
            );

        }
    );


    const sortedRows =
        Object.keys(
            rows
        ).sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    undefined,
                    {
                        numeric: true
                    }
                )
        );


    sortedRows.forEach(
        row => {

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


    seats.sort(
        (a, b) =>
            getSeatNumber(
                a.seatNumber
            ) -
            getSeatNumber(
                b.seatNumber
            )
    );


    seats.forEach(
        seat => {

            const seatNumber =
                getSeatNumber(
                    seat.seatNumber
                );


            /*
             * A1 A2 | A3 A4
             */

            if (
                seatNumber === 3
            ) {

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


            rowElement.appendChild(
                createSeatButton(
                    seat
                )
            );

        }
    );


    grid.appendChild(
        rowElement
    );

}


/* =========================================================
   Create Seat Button
   ========================================================= */

function createSeatButton(seat) {

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

    seatButton.dataset.seatId =
        String(
            seat.id
        );

    seatButton.textContent =
        seat.seatNumber;


    const status =
        String(
            seat.status || ""
        ).toUpperCase();


    if (
        status === "BOOKED" ||
        status === "OCCUPIED" ||
        status === "UNAVAILABLE"
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
   Seat Helpers
   ========================================================= */

function getSeatRow(seatId) {

    const match =
        String(
            seatId
        ).match(
            /^[A-Za-z]+/
        );

    return match
        ? match[0].toUpperCase()
        : "";

}


function getSeatNumber(seatId) {

    const match =
        String(
            seatId
        ).match(
            /\d+$/
        );

    return match
        ? Number(
            match[0]
        )
        : 0;

}


/* =========================================================
   Toggle Seat
   ========================================================= */

function toggleSeat(seatId) {

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


    if (
        selectedSeats.size >=
        MAX_SEATS
    ) {

        showSeatMessage(
            `You can select a maximum of ${MAX_SEATS} seats.`
        );

        return;

    }


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
   Seat Visual State
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
   Booking Summary
   ========================================================= */

function updateSummary() {

    const seats =
        [...selectedSeats];


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
        "selectedSeatCount",
        String(
            seats.length
        )
    );


    setText(
        "selectedSeatsText",
        seats.length > 0
            ? seats.join(", ")
            : "None"
    );


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
   Continue Button
   ========================================================= */

function initializeContinueButton() {

    const button =
        document.getElementById(
            "continueButton"
        );

    if (!button) {

        return;

    }


    button.onclick =
        () => {

            if (
                selectedSeats.size === 0
            ) {

                showSeatMessage(
                    "Please select at least one seat."
                );

                return;

            }


            if (!currentSchedule) {

                showSeatMessage(
                    "Schedule information is missing."
                );

                return;

            }


            const selectedSeatNumbers =
                [...selectedSeats];


            const selectedSeatData =
                availableSeats.filter(
                    seat =>
                        selectedSeats.has(
                            seat.seatNumber
                        )
                );


            /*
             * Save selected seat numbers.
             */

            sessionStorage.setItem(
                "smartbus_selected_seats",
                JSON.stringify(
                    selectedSeatNumbers
                )
            );


            /*
             * Save complete seat data.
             */

            sessionStorage.setItem(
                "smartbus_selected_seat_data",
                JSON.stringify(
                    selectedSeatData
                )
            );


            /*
             * Preserve the exact backend schedule.
             */

            sessionStorage.setItem(
                "smartbus_schedule_id",
                String(
                    currentSchedule.id
                )
            );


            saveSelectedSchedule(
                currentSchedule
            );


            /*
             * Save fare information.
             */

            sessionStorage.setItem(
                "smartbus_seat_fare",
                String(
                    seatFare
                )
            );


            sessionStorage.setItem(
                "smartbus_service_fee",
                String(
                    selectedSeats.size *
                    SERVICE_FEE_PER_SEAT
                )
            );


            sessionStorage.setItem(
                "smartbus_seat_total",
                String(
                    calculateTotal()
                )
            );


            window.location.href =
                "./passenger-details.html";

        };


    updateSummary();

}


/* =========================================================
   Fare Calculation
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
   Date and Time
   ========================================================= */

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
    ).format(
        date
    );

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


/* =========================================================
   Currency
   ========================================================= */

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


/* =========================================================
   DOM Helpers
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


function updateElementsBySelector(
    selector,
    value
) {

    const elements =
        document.querySelectorAll(
            selector
        );


    elements.forEach(
        element => {

            element.textContent =
                value;

        }
    );

}


/* =========================================================
   User Message
   ========================================================= */

function showSeatMessage(message) {

    alert(
        message
    );

}
