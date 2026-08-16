package com.smartbus.repository;

import com.smartbus.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByScheduleIdOrderByIdAsc(Long scheduleId);

    boolean existsByScheduleId(Long scheduleId);
}
