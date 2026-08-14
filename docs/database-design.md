# SmartBus Database Design

This document details the database schema and table structures of the **SmartBus – Intelligent Bus Ticket Reservation and Live Tracking System**.

## Entity-Relationship Diagram (Conceptual)

- **users**: Base entity representing registered users.
- **passengers** / **drivers**: Extensions of users with role-specific profile fields.
- **buses**: Vehicles deployed.
- **routes**: Static map routes.
- **schedules**: Deploys a bus on a route at a specific date & time.
- **seats**: Allocated seat configuration map for each schedule.
- **bookings**: Connects users to schedules and seats.
- **waiting_list**: Handles overbooked schedules.
- **gps_tracking**: Stores current coordinates of a bus during an active trip.

## Schema Details
Please refer to [schema.sql](file:///home/raj/SmartBus/database/schema.sql) for table definitions, indices, and foreign key relations.
