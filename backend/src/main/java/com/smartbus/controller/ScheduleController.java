package com.smartbus.controller;

import com.smartbus.dto.SeatResponse;
import com.smartbus.model.Schedule;
import com.smartbus.service.ScheduleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping
    public ResponseEntity<List<Schedule>> getAllSchedules() {
        return ResponseEntity.ok(
                scheduleService.getAllSchedules()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Schedule> getScheduleById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                scheduleService.getScheduleById(id)
        );
    }
@GetMapping("/{id}/seats")
public ResponseEntity<List<SeatResponse>> getSeatsByScheduleId(
        @PathVariable Long id) {

    return ResponseEntity.ok(
            scheduleService.getSeatsByScheduleId(id)
    );
}

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Schedule> createSchedule(
            @RequestParam Long busId,
            @RequestParam Long routeId,
            @RequestBody Schedule schedule) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        scheduleService.createSchedule(
                                busId,
                                routeId,
                                schedule
                        )
                );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Schedule> updateSchedule(
            @PathVariable Long id,
            @RequestParam Long busId,
            @RequestParam Long routeId,
            @RequestBody Schedule schedule) {

        return ResponseEntity.ok(
                scheduleService.updateSchedule(
                        id,
                        busId,
                        routeId,
                        schedule
                )
        );
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(
            @PathVariable Long id) {

        scheduleService.deleteSchedule(id);

        return ResponseEntity.noContent().build();
    }
}
