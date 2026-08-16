package com.smartbus.service;

import com.smartbus.model.Bus;
import com.smartbus.model.Route;
import com.smartbus.model.Schedule;
import com.smartbus.dto.SeatResponse;
import com.smartbus.model.Seat;
import com.smartbus.model.SeatStatus;
import com.smartbus.repository.BusRepository;
import com.smartbus.repository.RouteRepository;
import com.smartbus.repository.ScheduleRepository;
import com.smartbus.repository.SeatRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class ScheduleService {

    private static final int SEATS_PER_ROW = 4;

    private final ScheduleRepository scheduleRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;
    private final SeatRepository seatRepository;

    public ScheduleService(
            ScheduleRepository scheduleRepository,
            BusRepository busRepository,
            RouteRepository routeRepository,
            SeatRepository seatRepository) {

        this.scheduleRepository = scheduleRepository;
        this.busRepository = busRepository;
        this.routeRepository = routeRepository;
        this.seatRepository = seatRepository;
    }

    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    public Schedule getScheduleById(Long id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Schedule not found"
                        )
                );
    }

    @Transactional
    public Schedule createSchedule(
            Long busId,
            Long routeId,
            Schedule schedule) {

        Bus bus = busRepository.findById(busId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Bus not found"
                        )
                );

        Route route = routeRepository.findById(routeId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Route not found"
                        )
                );

        validateScheduleTimes(schedule);

        schedule.setBus(bus);
        schedule.setRoute(route);

        Schedule savedSchedule =
                scheduleRepository.save(schedule);

        generateSeats(
                savedSchedule,
                bus.getTotalSeats()
        );

        return savedSchedule;
    }
public List<SeatResponse> getSeatsByScheduleId(Long scheduleId) {

    Schedule schedule = getScheduleById(scheduleId);

    List<Seat> seats =
            seatRepository.findByScheduleIdOrderByIdAsc(scheduleId);

    return seats.stream()
            .map(seat -> new SeatResponse(
                    seat.getId(),
                    seat.getSeatNumber(),
                    seat.getStatus(),
                    schedule.getFare()
            ))
            .toList();
}
    public Schedule updateSchedule(
            Long id,
            Long busId,
            Long routeId,
            Schedule updatedSchedule) {

        Schedule existingSchedule = getScheduleById(id);

        Bus bus = busRepository.findById(busId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Bus not found"
                        )
                );

        Route route = routeRepository.findById(routeId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Route not found"
                        )
                );

        validateScheduleTimes(updatedSchedule);

        existingSchedule.setBus(bus);
        existingSchedule.setRoute(route);
        existingSchedule.setDepartureTime(
                updatedSchedule.getDepartureTime()
        );
        existingSchedule.setArrivalTime(
                updatedSchedule.getArrivalTime()
        );
        existingSchedule.setFare(
                updatedSchedule.getFare()
        );

        return scheduleRepository.save(existingSchedule);
    }

    public void deleteSchedule(Long id) {

        Schedule schedule = getScheduleById(id);

        scheduleRepository.delete(schedule);
    }

    private void validateScheduleTimes(
            Schedule schedule) {

        if (schedule.getDepartureTime() == null ||
                schedule.getArrivalTime() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Departure time and arrival time are required"
            );
        }

        if (schedule.getArrivalTime()
                .isBefore(schedule.getDepartureTime())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Arrival time cannot be before departure time"
            );
        }

        if (schedule.getFare() == null ||
                schedule.getFare().signum() < 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Fare must be zero or greater"
            );
        }
    }

    private void generateSeats(
            Schedule schedule,
            int totalSeats) {

        if (totalSeats <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Bus must have at least one seat"
            );
        }

        List<Seat> seats =
                new ArrayList<>();

        for (int seatIndex = 1;
             seatIndex <= totalSeats;
             seatIndex++) {

            int row =
                    (seatIndex - 1)
                            / SEATS_PER_ROW;

            int position =
                    ((seatIndex - 1)
                            % SEATS_PER_ROW) + 1;

            char rowLetter =
                    (char) ('A' + row);

            Seat seat = new Seat();

            seat.setSchedule(schedule);

            seat.setSeatNumber(
                    rowLetter + String.valueOf(position)
            );

            seat.setStatus(
                    SeatStatus.AVAILABLE
            );

            seats.add(seat);
        }

        seatRepository.saveAll(seats);
    }
}
