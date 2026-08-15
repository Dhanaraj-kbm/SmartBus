package com.smartbus.repository;

import com.smartbus.model.Bus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BusRepository extends JpaRepository<Bus, Long> {

    Optional<Bus> findByBusNumber(String busNumber);

    boolean existsByBusNumber(String busNumber);
}
