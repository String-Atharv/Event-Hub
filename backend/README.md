# Event Ticket Booking Platform

A full-stack event ticket booking platform that enables users to discover events, book tickets, and validate entry using QR codes. The system supports multiple roles such as attendees, event organizers, and staff members, with secure authentication and authorization.

---

## Features

### Attendee
- View and search available events
- Book tickets for events
- Receive a unique QR code for each ticket
- View booking history

### Event Organizer
- Create and manage events
- Publish or unpublish events
- Configure ticket pricing and capacity
- View ticket sales
- Allocate staff for ticket validation

### Event Staff
- Validate tickets using:
  - QR code scanning
  - Manual entry of public QR code
- Prevent duplicate ticket usage
- Track ticket validation status

### Security
- Role-based access control
- Secure authentication and authorization using Keycloak

---

## Tech Stack

### Backend
- Spring Boot
- Spring Data JPA / Hibernate
- MySQL
- REST APIs

### Frontend
- React
- Axios

### Authentication & Authorization
- Keycloak
- OAuth 2.0 / OpenID Connect

### Tools
- Maven
- Git & GitHub
- QR code generation and validation

---

## Ticket Validation Flow

1. User books a ticket
2. System generates a QR code containing a public QR identifier
3. Staff scans the QR code or enters the public code manually
4. Backend validates ticket authenticity and usage status
5. Ticket is marked as validated to prevent reuse

---

## Setup Instructions

### Prerequisites
- Java 17+
- Node.js
- MySQL
- Keycloak
- Maven

### Backend
```bash
mvn clean install
mvn spring-boot:run
