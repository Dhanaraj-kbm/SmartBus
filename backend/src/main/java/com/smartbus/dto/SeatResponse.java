package com.smartbus.dto;

import com.smartbus.model.SeatStatus;

import java.math.BigDecimal;

public record SeatResponse(
        Long id,
        String seatNumber,
        SeatStatus status,
        BigDecimal fare
) {
}
