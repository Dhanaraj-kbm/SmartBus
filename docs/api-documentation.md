# SmartBus API Documentation

This document describes the planned REST and WebSocket API endpoints for the **SmartBus – Intelligent Bus Ticket Reservation and Live Tracking System**.

## Authentication API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user (Passenger, Driver, Admin) |
| `POST` | `/api/auth/login`    | Authenticate credentials and establish session / issue tokens |
| `POST` | `/api/auth/logout`   | Invalidate the current session / token |

## Search & Schedules API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/schedules` | Search for available bus trips between source and destination on a given date |
| `GET`  | `/api/schedules/{id}/seats` | Fetch layout and availability status of all seats on a specific schedule |

## Bookings API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/bookings` | Book a seat or join the waiting list for a schedule |
| `GET`  | `/api/bookings/{id}` | Retrieve booking details and digital ticket metadata |
| `DELETE` | `/api/bookings/{id}` | Cancel an active booking and handle waiting-list promotions |

## Tracking WebSocket API

| Protocol | Destination | Description |
|----------|-------------|-------------|
| `WS` | `/ws-track/driver/gps` | Endpoint where Android Driver app publishes coordinates |
| `WS` | `/ws-track/passenger/bus/{id}` | Endpoint where Passenger clients subscribe for real-time location |
