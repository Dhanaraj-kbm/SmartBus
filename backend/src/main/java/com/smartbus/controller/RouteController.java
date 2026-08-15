
package com.smartbus.controller;

import com.smartbus.model.Route;
import com.smartbus.service.RouteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    // Authenticated users can view routes
    @GetMapping
    public ResponseEntity<List<Route>> getAllRoutes() {
        return ResponseEntity.ok(routeService.getAllRoutes());
    }

    // Authenticated users can view a specific route
    @GetMapping("/{id}")
    public ResponseEntity<Route> getRouteById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                routeService.getRouteById(id)
        );
    }

    // Only ADMIN can create routes
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Route> createRoute(
            @RequestBody Route route) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(routeService.createRoute(route));
    }

    // Only ADMIN can update routes
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Route> updateRoute(
            @PathVariable Long id,
            @RequestBody Route route) {

        return ResponseEntity.ok(
                routeService.updateRoute(id, route)
        );
    }

    // Only ADMIN can delete routes
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoute(
            @PathVariable Long id) {

        routeService.deleteRoute(id);

        return ResponseEntity.noContent().build();
    }
}
