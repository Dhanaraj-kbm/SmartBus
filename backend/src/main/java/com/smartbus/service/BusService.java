package com.smartbus.service;

import com.smartbus.model.Bus;
import com.smartbus.model.BusStatus;
import com.smartbus.repository.BusRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BusService {

    private final BusRepository busRepository;

    public BusService(BusRepository busRepository) {
        this.busRepository = busRepository;
    }

    public List<Bus> getAllBuses() {
        return busRepository.findAll();
    }

    public Bus getBusById(Long id) {
        return busRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Bus not found with id: " + id));
    }

    @Transactional
    public Bus createBus(Bus bus) {

        if (bus.getBusNumber() == null ||
                bus.getBusNumber().isBlank()) {
            throw new IllegalArgumentException(
                    "Bus number is required");
        }

        if (bus.getBusName() == null ||
                bus.getBusName().isBlank()) {
            throw new IllegalArgumentException(
                    "Bus name is required");
        }

        if (bus.getBusType() == null ||
                bus.getBusType().isBlank()) {
            throw new IllegalArgumentException(
                    "Bus type is required");
        }

        if (bus.getTotalSeats() == null ||
                bus.getTotalSeats() <= 0) {
            throw new IllegalArgumentException(
                    "Total seats must be greater than zero");
        }

        if (busRepository.existsByBusNumber(
                bus.getBusNumber())) {
            throw new IllegalArgumentException(
                    "A bus with this bus number already exists");
        }

        if (bus.getStatus() == null) {
            bus.setStatus(BusStatus.ACTIVE);
        }

        return busRepository.save(bus);
    }

    @Transactional
    public Bus updateBus(Long id, Bus updatedBus) {

        Bus existingBus = getBusById(id);

        if (updatedBus.getBusNumber() == null ||
                updatedBus.getBusNumber().isBlank()) {
            throw new IllegalArgumentException(
                    "Bus number is required");
        }

        if (updatedBus.getBusName() == null ||
                updatedBus.getBusName().isBlank()) {
            throw new IllegalArgumentException(
                    "Bus name is required");
        }

        if (updatedBus.getBusType() == null ||
                updatedBus.getBusType().isBlank()) {
            throw new IllegalArgumentException(
                    "Bus type is required");
        }

        if (updatedBus.getTotalSeats() == null ||
                updatedBus.getTotalSeats() <= 0) {
            throw new IllegalArgumentException(
                    "Total seats must be greater than zero");
        }

        busRepository.findByBusNumber(
                updatedBus.getBusNumber()
        ).ifPresent(bus -> {
            if (!bus.getId().equals(id)) {
                throw new IllegalArgumentException(
                        "A bus with this bus number already exists");
            }
        });

        existingBus.setBusNumber(
                updatedBus.getBusNumber());

        existingBus.setBusName(
                updatedBus.getBusName());

        existingBus.setBusType(
                updatedBus.getBusType());

        existingBus.setTotalSeats(
                updatedBus.getTotalSeats());

        if (updatedBus.getStatus() != null) {
            existingBus.setStatus(
                    updatedBus.getStatus());
        }

        return busRepository.save(existingBus);
    }

    @Transactional
    public void deleteBus(Long id) {
        Bus bus = getBusById(id);
        busRepository.delete(bus);
    }
}
