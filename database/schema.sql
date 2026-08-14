-- SmartBus Database Schema Definition (Placeholder)
-- Project: SmartBus – Intelligent Bus Ticket Reservation and Live Tracking System
-- Target Database: MySQL

-- Planned Tables:

-- 1. users: Stores account details for passengers, drivers, and admins.
--    - id (INT, PK)
--    - username (VARCHAR)
--    - password (VARCHAR)
--    - email (VARCHAR)
--    - role (ENUM: 'PASSENGER', 'DRIVER', 'ADMIN')
--    - created_at (TIMESTAMP)

-- 2. buses: Stores vehicle information.
--    - id (INT, PK)
--    - bus_number (VARCHAR)
--    - total_seats (INT)
--    - model (VARCHAR)
--    - status (ENUM: 'ACTIVE', 'INACTIVE', 'MAINTENANCE')

-- 3. routes: Defines paths and start/end points.
--    - id (INT, PK)
--    - route_name (VARCHAR)
--    - source (VARCHAR)
--    - destination (VARCHAR)
--    - distance_km (DECIMAL)

-- 4. schedules: Stores scheduled trips on routes.
--    - id (INT, PK)
--    - bus_id (INT, FK)
--    - route_id (INT, FK)
--    - departure_time (DATETIME)
--    - arrival_time (DATETIME)
--    - price (DECIMAL)

-- 5. seats: Individual seats for buses/schedules.
--    - id (INT, PK)
--    - schedule_id (INT, FK)
--    - seat_number (VARCHAR)
--    - is_available (BOOLEAN)

-- 6. bookings: Handles reservations made by users.
--    - id (INT, PK)
--    - user_id (INT, FK)
--    - schedule_id (INT, FK)
--    - seat_id (INT, FK)
--    - booking_time (TIMESTAMP)
--    - status (ENUM: 'CONFIRMED', 'CANCELLED', 'WAITING')

-- 7. passengers: Additional details for a passenger.
--    - id (INT, PK)
--    - user_id (INT, FK)
--    - first_name (VARCHAR)
--    - last_name (VARCHAR)
--    - phone_number (VARCHAR)

-- 8. waiting_list: Tracks users on waitlist for full trips.
--    - id (INT, PK)
--    - user_id (INT, FK)
--    - schedule_id (INT, FK)
--    - joined_at (TIMESTAMP)
--    - priority (INT)

-- 9. drivers: Relates driver users to allocated buses and license details.
--    - id (INT, PK)
--    - user_id (INT, FK)
--    - license_number (VARCHAR)
--    - status (ENUM: 'AVAILABLE', 'ON_TRIP', 'OFF_DUTY')

-- 10. gps_tracking: Holds real-time coordinates for active buses.
--     - id (INT, PK)
--     - bus_id (INT, FK)
--     - latitude (DECIMAL)
--     - longitude (DECIMAL)
--     - updated_at (TIMESTAMP)
