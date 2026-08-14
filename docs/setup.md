# SmartBus Setup Guide

This document describes how to build, run, and develop the **SmartBus – Intelligent Bus Ticket Reservation and Live Tracking System**.

## Prerequisites
- Java JDK 17 or higher (Java 21/25 recommended)
- Maven 3.x
- MySQL Server 8.x

## Database Initialization
1. Create a MySQL database:
   ```sql
   CREATE DATABASE smartbus_db;
   ```
2. Import the schema and seed data:
   ```bash
   mysql -u root -p smartbus_db < database/schema.sql
   mysql -u root -p smartbus_db < database/seed.sql
   ```

## Backend Configuration
1. Open the [application.properties](file:///home/raj/SmartBus/backend/src/main/resources/application.properties) file.
2. Configure your database credentials or set them as environment variables:
   ```properties
   spring.datasource.username=${DB_USERNAME}
   spring.datasource.password=${DB_PASSWORD}
   ```

## Building and Running Backend
Compile and start the Spring Boot backend server:
```bash
cd backend
mvn clean package
java -jar target/smartbus-0.0.1-SNAPSHOT.jar
```

## Running Frontend
The frontend consists of static files. You can open [index.html](file:///home/raj/SmartBus/frontend/index.html) directly in any modern web browser or serve the `frontend/` directory using a simple local web server (e.g., Python `http.server`, Live Server extensions, or `npx http-server`).
