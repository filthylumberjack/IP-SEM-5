# VoltFlow Backend - Electricity Bill Management System

Spring Boot 3.3.5 REST API backend built with Java 21/25, Maven 3.9, and MySQL 8.0.

## Backend Architecture

```
com.electricity.billing
├── config/              # CORS and WebMvc configuration
├── controller/          # REST API endpoints (DTO request/response)
├── dto/                 # Request/Response Data Transfer Objects
├── entity/              # JPA Entities & Enums (Customer, Bill, MeterReading, Payment, Tariff)
├── exception/           # Custom exceptions & @RestControllerAdvice GlobalExceptionHandler
├── repository/          # Spring Data JPA Repositories with custom queries
└── service/             # Business logic layer (Progressive Tariff Calculation, Billing, Payments)
```

## Prerequisites

- Java Development Kit (JDK 21 or 25)
- MySQL 8.0+ running on `localhost:3306`
- Maven 3.8+ (or use the included `mvnw.cmd` wrapper)

## Configuration

Database credentials can be supplied via environment variables or default properties in `src/main/resources/application.properties`:

```properties
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/electricity_billing?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:Aaditya@777}
```

## Maven Commands (Windows)

Compile without tests:
```powershell
.\mvnw.cmd compile
```

Run automated tests:
```powershell
.\mvnw.cmd test
```

Run Spring Boot application:
```powershell
.\mvnw.cmd spring-boot:run
```
Backend will start on `http://localhost:8080`.
