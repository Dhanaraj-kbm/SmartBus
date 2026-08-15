package com.smartbus.service;

import com.smartbus.model.Route;
import com.smartbus.repository.RouteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class RouteService {

    private final RouteRepository routeRepository;

    public RouteService(RouteRepository routeRepository) {
        this.routeRepository = routeRepository;
    }

    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }

    public Route getRouteById(Long id) {
        return routeRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Route not found"
                        )
                );
    }

    public Route createRoute(Route route) {
        return routeRepository.save(route);
    }

    public Route updateRoute(Long id, Route updatedRoute) {

        Route existingRoute = getRouteById(id);

        existingRoute.setRouteName(updatedRoute.getRouteName());
        existingRoute.setSource(updatedRoute.getSource());
        existingRoute.setDestination(updatedRoute.getDestination());
        existingRoute.setDistanceKm(updatedRoute.getDistanceKm());

        return routeRepository.save(existingRoute);
    }

    public void deleteRoute(Long id) {

        Route route = getRouteById(id);

        routeRepository.delete(route);
    }
}
