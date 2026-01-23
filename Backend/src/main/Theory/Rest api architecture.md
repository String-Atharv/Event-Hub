## Overview Of Rest API End Points

# Organiser

### Create Event

POST/api/v1/events

Request-Body:events

### List Events

GET/api/v1/events

### Retrieve a Specific Event

GET/api/v1/events/{event-id}

### Update Event

PUT/api/v1/event/{event-id}

Request-Body:events

### Delete Events

DELETE/api/v1/event/{event-id}

### Validate Tickets

POST/api/v1/events/{event-id}/ticket-validations

### List Ticket Validations

GET/api/v1/events/{event-id}/ticket-validations

### List Ticket Sales

GET/api/v1/events/{event-id}/tickets

### Retrieve Ticket Sales

GET/api/v1/events/{event-id}/tickets/{ticket-id}

### Partial Update  Ticket

Request-Body:Partial Ticket

### List Ticket Types                                                                   
                                                                                                    
GET/api/v1/event/{event-id}/ticket-types

### Retrieve Ticket Type

GET/api/v1/event/{event-id}/ticket-types /{ticket-type-id}

### Partial Update Ticket Type

### Delete Ticket Type

Delete/api/v1/event/{event-id}/ticket-types/{ticket-type-id}

# Attendee

### Landing Page : Browse all events

GET/api//v1/published-events

### Get the Specific Event

GET/api/v1/published-events/{published-event-id}

### Get the Ticket Types

### Purchase Ticket

POST/api/v1/published-events/{published-event-id}/{ticket-type}/{ticket_types-id}

### List Tickets Purchased By User

GET/api/v1/Tickets

### Retrieve Specific Ticket

Get/api/v1/Tickets/{ticket-id}

### Retrieve QR Code from Specific Ticket

Get/api/v1/Tickets/{ticket-id}/QR-code

