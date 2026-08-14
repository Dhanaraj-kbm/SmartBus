"use strict";

/*
 * SmartBus Passenger Details
 *
 * Data flow:
 *
 * Seat Selection
 *      ↓
 * sessionStorage
 *      ↓
 * Passenger Details
 *      ↓
 * Confirmation
 *
 * This is temporary frontend state.
 * Later the complete booking will be sent
 * to the Spring Boot backend.
 */


document.addEventListener(
    "DOMContentLoaded",
    initializePassengerDetails
);


/* =========================================================
   Configuration
   ========================================================= */

const SEAT_PRICE = 850;

const SERVICE_FEE_PER_SEAT = 25;


/* =========================================================
   Initialization
   ========================================================= */

function initializePassengerDetails() {

    const selectedSeats =
        getSelectedSeats();


    /*
     * The user should not be able to reach this page
     * without selecting seats.
     */

    if (selectedSeats.length === 0) {

        redirectToSeatSelection();

        return;
    }


    renderPassengerForms(
        selectedSeats
    );

    updatePassengerCount(
        selectedSeats.length
    );

    updateBookingSummary(
        selectedSeats
    );

    initializeContactValidation();

    initializeContinueButton(
        selectedSeats
    );

}


/* =========================================================
   Read Selected Seats
   ========================================================= */

function getSelectedSeats() {

    const storedSeats =
        sessionStorage.getItem(
            "smartbus_selected_seats"
        );


    if (!storedSeats) {
        return [];
    }


    try {

        const seats =
            JSON.parse(storedSeats);


        if (!Array.isArray(seats)) {
            return [];
        }


        return seats;

    } catch (error) {

        console.error(
            "Unable to read selected seats:",
            error
        );

        return [];

    }

}


/* =========================================================
   Passenger Forms
   ========================================================= */

function renderPassengerForms(
    selectedSeats
) {

    const container =
        document.getElementById(
            "passengerForms"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        selectedSeats
            .map(
                (seat, index) =>
                    createPassengerCard(
                        seat,
                        index
                    )
            )
            .join("");

}


/* =========================================================
   Passenger Card
   ========================================================= */

function createPassengerCard(
    seat,
    index
) {

    const passengerNumber =
        index + 1;


    return `
        <article
            class="passenger-card"
            data-passenger-index="${index}"
        >

            <div class="passenger-card-header">

                <div>

                    <span class="passenger-number">
                        ${passengerNumber}
                    </span>

                    <div class="passenger-title">

                        <strong>
                            Passenger ${passengerNumber}
                        </strong>

                        <span>
                            Enter traveller details
                        </span>

                    </div>

                </div>


                <span class="passenger-seat-badge">
                    Seat ${escapeHTML(seat)}
                </span>

            </div>


            <div class="passenger-fields">


                <div class="form-field">

                    <label
                        for="passenger-${index}-name"
                    >
                        Full name
                    </label>

                    <input
                        type="text"
                        id="passenger-${index}-name"
                        name="passenger-${index}-name"
                        placeholder="Enter full name"
                        autocomplete="name"
                        maxlength="100"
                        required
                    >

                </div>


                <div class="passenger-field-row">


                    <div class="form-field">

                        <label
                            for="passenger-${index}-age"
                        >
                            Age
                        </label>

                        <input
                            type="number"
                            id="passenger-${index}-age"
                            name="passenger-${index}-age"
                            placeholder="Age"
                            min="1"
                            max="120"
                            inputmode="numeric"
                            required
                        >

                    </div>


                    <div class="form-field">

                        <label
                            for="passenger-${index}-gender"
                        >
                            Gender
                        </label>

                        <select
                            id="passenger-${index}-gender"
                            name="passenger-${index}-gender"
                            required
                        >

                            <option value="">
                                Select
                            </option>

                            <option value="male">
                                Male
                            </option>

                            <option value="female">
                                Female
                            </option>

                            <option value="other">
                                Other
                            </option>

                        </select>

                    </div>

                </div>

            </div>

        </article>
    `;
}


/* =========================================================
   Passenger Count
   ========================================================= */

function updatePassengerCount(
    count
) {

    const element =
        document.getElementById(
            "passengerCount"
        );


    if (!element) {
        return;
    }


    element.textContent =
        `${count} ${count === 1
            ? "passenger"
            : "passengers"
        }`;

}


/* =========================================================
   Booking Summary
   ========================================================= */

function updateBookingSummary(
    selectedSeats
) {

    const seatCount =
        selectedSeats.length;


    const seatFare =
        seatCount * SEAT_PRICE;


    const serviceFee =
        seatCount *
        SERVICE_FEE_PER_SEAT;


    const total =
        seatFare +
        serviceFee;


    setText(
        "summarySeats",
        selectedSeats.join(", ")
    );


    setText(
        "summarySeatFare",
        formatCurrency(seatFare)
    );


    setText(
        "summaryServiceFee",
        formatCurrency(serviceFee)
    );


    setText(
        "summaryTotal",
        formatCurrency(total)
    );


    /*
     * Save the current total so the confirmation
     * page can use it later.
     */

    sessionStorage.setItem(
        "smartbus_seat_total",
        String(total)
    );

}


/* =========================================================
   Contact Validation
   ========================================================= */

function initializeContactValidation() {

    const phone =
        document.getElementById(
            "contactPhone"
        );


    if (!phone) {
        return;
    }


    phone.addEventListener(
        "input",
        () => {

            /*
             * Allow digits only.
             */

            phone.value =
                phone.value.replace(
                    /\D/g,
                    ""
                );

        }
    );

}


/* =========================================================
   Continue
   ========================================================= */

function initializeContinueButton(
    selectedSeats
) {

    const button =
        document.getElementById(
            "continueDetailsButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            const validation =
                validateForm(
                    selectedSeats
                );


            if (!validation.valid) {

                showValidationMessage(
                    validation.message
                );

                return;
            }


            const passengers =
                collectPassengerDetails(
                    selectedSeats
                );


            const contact =
                collectContactDetails();


            /*
             * Save the booking information temporarily.
             *
             * Later this exact object can be sent
             * to the Spring Boot API.
             */

            const bookingData = {

                bus: {
                    name: "Royal Express",
                    from: "Guwahati",
                    to: "Imphal",
                    departure: "07:30 AM",
                    arrival: "06:00 PM",
                    date: "2026-08-20"
                },

                seats: selectedSeats,

                passengers,

                contact,

                fare: {
                    seatFare:
                        selectedSeats.length *
                        SEAT_PRICE,

                    serviceFee:
                        selectedSeats.length *
                        SERVICE_FEE_PER_SEAT,

                    total:
                        calculateTotal(
                            selectedSeats.length
                        )
                }

            };


            sessionStorage.setItem(
                "smartbus_booking_data",
                JSON.stringify(
                    bookingData
                )
            );


            window.location.href =
                "./confirmation.html";

        }
    );

}


/* =========================================================
   Validation
   ========================================================= */

function validateForm(
    selectedSeats
) {

    if (
        !Array.isArray(selectedSeats) ||
        selectedSeats.length === 0
    ) {

        return {
            valid: false,
            message:
                "Please select at least one seat."
        };

    }


    /*
     * Passenger fields
     */

    for (
        let index = 0;
        index < selectedSeats.length;
        index++
    ) {

        const name =
            document.getElementById(
                `passenger-${index}-name`
            );


        const age =
            document.getElementById(
                `passenger-${index}-age`
            );


        const gender =
            document.getElementById(
                `passenger-${index}-gender`
            );


        if (
            !name ||
            !name.value.trim()
        ) {

            return {
                valid: false,
                message:
                    `Please enter the full name for Passenger ${index + 1
                    }.`
            };

        }


        const ageValue =
            Number(age.value);


        if (
            !Number.isInteger(ageValue) ||
            ageValue < 1 ||
            ageValue > 120
        ) {

            return {
                valid: false,
                message:
                    `Please enter a valid age for Passenger ${index + 1
                    }.`
            };

        }


        if (!gender.value) {

            return {
                valid: false,
                message:
                    `Please select the gender for Passenger ${index + 1
                    }.`
            };

        }

    }


    /*
     * Contact
     */

    const email =
        document.getElementById(
            "contactEmail"
        );


    const phone =
        document.getElementById(
            "contactPhone"
        );


    if (
        !email ||
        !isValidEmail(
            email.value.trim()
        )
    ) {

        return {
            valid: false,
            message:
                "Please enter a valid email address."
        };

    }


    if (
        !phone ||
        !/^\d{10}$/.test(
            phone.value.trim()
        )
    ) {

        return {
            valid: false,
            message:
                "Please enter a valid 10-digit mobile number."
        };

    }


    return {
        valid: true,
        message: ""
    };

}


/* =========================================================
   Collect Passenger Data
   ========================================================= */

function collectPassengerDetails(
    selectedSeats
) {

    return selectedSeats.map(
        (seat, index) => {

            const name =
                document.getElementById(
                    `passenger-${index}-name`
                );


            const age =
                document.getElementById(
                    `passenger-${index}-age`
                );


            const gender =
                document.getElementById(
                    `passenger-${index}-gender`
                );


            return {

                seat,

                name:
                    name.value.trim(),

                age:
                    Number(age.value),

                gender:
                    gender.value

            };

        }
    );

}


/* =========================================================
   Collect Contact
   ========================================================= */

function collectContactDetails() {

    return {

        email:
            document.getElementById(
                "contactEmail"
            ).value.trim(),

        phone:
            document.getElementById(
                "contactPhone"
            ).value.trim()

    };

}


/* =========================================================
   Redirect
   ========================================================= */

function redirectToSeatSelection() {

    window.location.replace(
        "./seat-selection.html"
    );

}


/* =========================================================
   Helpers
   ========================================================= */

function calculateTotal(
    passengerCount
) {

    const seatFare =
        passengerCount *
        SEAT_PRICE;


    const serviceFee =
        passengerCount *
        SERVICE_FEE_PER_SEAT;


    return seatFare + serviceFee;

}


function isValidEmail(
    email
) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
    );

}


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
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function showValidationMessage(
    message
) {

    /*
     * Temporary implementation.
     *
     * We'll replace this with a proper inline
     * validation/toast system during final polish.
     */

    alert(message);

}