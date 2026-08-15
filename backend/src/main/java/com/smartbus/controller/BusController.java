package com.smartbus.controller;

import com.smartbus.model.Bus;
import com.smartbus.service.BusService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buses")
public class BusController {

    private final BusService busService;

    public BusController(BusService busService) {
        this.busService = busService;
    }

    // Any authenticated user can view buses
    @GetMapping
    public ResponseEntity<List<Bus>> getAllBuses() {
        return ResponseEntity.ok(busService.getAllBuses());
    }

    // Any authenticated user can view a specific bus
    @GetMapping("/{id}")
    public ResponseEntity<Bus> getBusById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                busService.getBusById(id)
        );
    }

    // Only ADMIN can create buses
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Bus> createBus(
            @RequestBody Bus bus) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(busService.createBus(bus));
    }

    // Only ADMIN can update buses
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Bus> updateBus(
            @PathVariable Long id,
            @RequestBody Bus bus) {

        return ResponseEntity.ok(
                busService.updateBus(id, bus)
        );
    }

    // Only ADMIN can delete buses
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBus(
            @PathVariable Long id) {

        busService.deleteBus(id);

        return ResponseEntity.noContent().build();
    }
}
