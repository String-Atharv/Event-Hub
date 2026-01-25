# Complete Backend API Endpoints Documentation

## 🌐 Base URL
```
http://localhost:8080/api/v1
```

---

## 📊 ANALYTICS CONTROLLER (`/analytics/*`)

### 1. Get Complete Analytics Across All Events
**Most Important - Use this for main dashboard**

```http
GET /api/v1/analytics/complete
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "organiserId": "550e8400-e29b-41d4-a716-446655440000",
  "organiserName": "John Smith",
  "organiserEmail": "john@example.com",
  
  "totalEvents": 5,
  "publishedEvents": 3,
  "draftEvents": 2,
  "totalTicketsSold": 1500,
  "totalRevenue": 75000.00,
  "totalAttendeesValidated": 1200,
  "averageAttendanceRate": 80.0,
  
  "eventAnalytics": [
    {
      "eventId": "650e8400-e29b-41d4-a716-446655440001",
      "eventName": "Summer Music Festival",
      "eventStatus": "PUBLISHED",
      "eventType": "PERFORMANCES",
      "venue": "Central Park",
      "startTime": "2026-07-15T19:00:00",
      "endTime": "2026-07-15T23:00:00",
      
      "totalTicketsSold": 500,
      "totalRevenue": 25000.00,
      "totalAttendeesValidated": 400,
      "overallAttendanceRate": 80.0,
      
      "ticketTypeAnalytics": [
        {
          "ticketTypeId": 1,
          "ticketTypeName": "VIP",
          "price": 100.00,
          "totalAvailable": 100,
          "ticketsSold": 100,
          "revenue": 10000.00,
          "attendeesValidated": 95,
          "attendanceRate": 95.0,
          "remainingTickets": 0
        },
        {
          "ticketTypeId": 2,
          "ticketTypeName": "General Admission",
          "price": 50.00,
          "totalAvailable": 500,
          "ticketsSold": 400,
          "revenue": 15000.00,
          "attendeesValidated": 305,
          "attendanceRate": 76.25,
          "remainingTickets": 100
        }
      ]
    },
    {
      "eventId": "650e8400-e29b-41d4-a716-446655440002",
      "eventName": "Winter Gala",
      "eventStatus": "PUBLISHED",
      "eventType": "PARTIES",
      "venue": "Grand Hotel",
      "startTime": "2026-12-20T20:00:00",
      "endTime": "2026-12-21T01:00:00",
      
      "totalTicketsSold": 300,
      "totalRevenue": 30000.00,
      "totalAttendeesValidated": 295,
      "overallAttendanceRate": 98.33,
      
      "ticketTypeAnalytics": [
        {
          "ticketTypeId": 3,
          "ticketTypeName": "Premium",
          "price": 150.00,
          "totalAvailable": 200,
          "ticketsSold": 200,
          "revenue": 30000.00,
          "attendeesValidated": 195,
          "attendanceRate": 97.5,
          "remainingTickets": 0
        }
      ]
    }
  ],
  
  "mostRevenueEvent": {
    "eventId": "650e8400-e29b-41d4-a716-446655440002",
    "eventName": "Winter Gala",
    "totalRevenue": 30000.00
    // ... full event analytics object
  },
  
  "mostTicketsSoldEvent": {
    "eventId": "650e8400-e29b-41d4-a716-446655440001",
    "eventName": "Summer Music Festival",
    "totalTicketsSold": 500
    // ... full event analytics object
  },
  
  "bestAttendanceRateEvent": {
    "eventId": "650e8400-e29b-41d4-a716-446655440002",
    "eventName": "Winter Gala",
    "overallAttendanceRate": 98.33
    // ... full event analytics object
  }
}
```

**TypeScript Interface:**
```typescript
interface OrganiserCompleteAnalyticsDto {
  organiserId: string;
  organiserName: string;
  organiserEmail: string;
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  totalAttendeesValidated: number;
  averageAttendanceRate: number;
  eventAnalytics: EventAnalyticsDto[];
  mostRevenueEvent: EventAnalyticsDto | null;
  mostTicketsSoldEvent: EventAnalyticsDto | null;
  bestAttendanceRateEvent: EventAnalyticsDto | null;
}
```

---

### 2. Get Analytics for Specific Event
**Use this for Event Details page**

```http
GET /api/v1/analytics/events/{eventId}
Authorization: Bearer {jwt_token}
```

**Example Request:**
```http
GET /api/v1/analytics/events/650e8400-e29b-41d4-a716-446655440001
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI...
```

**Response (200 OK):**
```json
{
  "eventId": "650e8400-e29b-41d4-a716-446655440001",
  "eventName": "Summer Music Festival",
  "eventStatus": "PUBLISHED",
  "eventType": "PERFORMANCES",
  "venue": "Central Park",
  "startTime": "2026-07-15T19:00:00",
  "endTime": "2026-07-15T23:00:00",
  
  "totalTicketsSold": 500,
  "totalRevenue": 25000.00,
  "totalAttendeesValidated": 400,
  "overallAttendanceRate": 80.0,
  
  "ticketTypeAnalytics": [
    {
      "ticketTypeId": 1,
      "ticketTypeName": "VIP",
      "price": 100.00,
      "totalAvailable": 100,
      "ticketsSold": 100,
      "revenue": 10000.00,
      "attendeesValidated": 95,
      "attendanceRate": 95.0,
      "remainingTickets": 0
    },
    {
      "ticketTypeId": 2,
      "ticketTypeName": "General Admission",
      "price": 50.00,
      "totalAvailable": 500,
      "ticketsSold": 400,
      "revenue": 15000.00,
      "attendeesValidated": 305,
      "attendanceRate": 76.25,
      "remainingTickets": 100
    }
  ]
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Failed to get event analytics",
  "message": "You don't have permission to view this event"
}
```

**TypeScript Interface:**
```typescript
interface EventAnalyticsDto {
  eventId: string;
  eventName: string;
  eventStatus: string;
  eventType: string | null;
  venue: string;
  startTime: string;
  endTime: string;
  totalTicketsSold: number;
  totalRevenue: number;
  totalAttendeesValidated: number;
  overallAttendanceRate: number;
  ticketTypeAnalytics: TicketTypeAnalyticsDto[];
}

interface TicketTypeAnalyticsDto {
  ticketTypeId: number;
  ticketTypeName: string;
  price: number;
  totalAvailable: number;
  ticketsSold: number;
  revenue: number;
  attendeesValidated: number;
  attendanceRate: number;
  remainingTickets: number;
}
```

---

### 3. Get Quick Summary (Lightweight)
**Use this for dashboard overview - faster than /complete**

```http
GET /api/v1/analytics/summary
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "organiserId": "550e8400-e29b-41d4-a716-446655440000",
  "organiserName": "John Smith",
  "totalEvents": 5,
  "publishedEvents": 3,
  "draftEvents": 2,
  "totalTicketsSold": 1500,
  "totalRevenue": 75000.00,
  "totalAttendeesValidated": 1200,
  "averageAttendanceRate": 80.0
}
```

**TypeScript Interface:**
```typescript
interface AnalyticsSummary {
  organiserId: string;
  organiserName: string;
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  totalAttendeesValidated: number;
  averageAttendanceRate: number;
}
```

---

### 4. Get Published Events Analytics Only

```http
GET /api/v1/analytics/published
Authorization: Bearer {jwt_token}
```

**Response:** Same structure as `/analytics/complete` but only includes published events

---

### 5. Get Ticket Type Performance Across All Events

```http
GET /api/v1/analytics/ticket-types/performance
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
[
  {
    "ticketTypeName": "VIP",
    "totalSold": 500,
    "totalRevenue": 50000.00,
    "totalValidated": 475,
    "averagePrice": 100.00,
    "numberOfEvents": 3
  },
  {
    "ticketTypeName": "General Admission",
    "totalSold": 1000,
    "totalRevenue": 25000.00,
    "totalValidated": 800,
    "averagePrice": 25.00,
    "numberOfEvents": 5
  },
  {
    "ticketTypeName": "Early Bird",
    "totalSold": 200,
    "totalRevenue": 4000.00,
    "totalValidated": 190,
    "averagePrice": 20.00,
    "numberOfEvents": 2
  }
]
```

**TypeScript Interface:**
```typescript
interface TicketTypePerformanceDto {
  ticketTypeName: string;
  totalSold: number;
  totalRevenue: number;
  totalValidated: number;
  averagePrice: number;
  numberOfEvents: number;
}
```

---

### 6. Compare Multiple Events

```http
POST /api/v1/analytics/events/compare
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "eventIds": [
    "650e8400-e29b-41d4-a716-446655440001",
    "650e8400-e29b-41d4-a716-446655440002",
    "650e8400-e29b-41d4-a716-446655440003"
  ]
}
```

**Response (200 OK):**
```json
{
  "events": [
    {
      "eventId": "650e8400-e29b-41d4-a716-446655440001",
      "eventName": "Summer Festival",
      "totalTicketsSold": 500,
      "totalRevenue": 25000.00,
      "totalAttendeesValidated": 400,
      "overallAttendanceRate": 80.0,
      "ticketTypeAnalytics": [...]
    },
    {
      "eventId": "650e8400-e29b-41d4-a716-446655440002",
      "eventName": "Winter Gala",
      "totalTicketsSold": 300,
      "totalRevenue": 30000.00,
      "totalAttendeesValidated": 295,
      "overallAttendanceRate": 98.33,
      "ticketTypeAnalytics": [...]
    }
  ],
  "comparisonCount": 2,
  "organiserId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 🏢 ORGANISER DASHBOARD CONTROLLER (`/organiser/*`)

### 7. Get Organiser Overview

```http
GET /api/v1/organiser/overview
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "organiserId": "550e8400-e29b-41d4-a716-446655440000",
  "organiserName": "John Smith",
  "organiserEmail": "john@example.com",
  "totalEvents": 5,
  "publishedEvents": 3,
  "draftEvents": 2,
  "totalTicketsSold": 1500,
  "totalRevenue": 75000.00,
  "totalAttendees": 1200,
  "averageRevenuePerEvent": 15000.00,
  "averageTicketsPerEvent": 300.0
}
```

**TypeScript Interface:**
```typescript
interface OrganiserOverview {
  organiserId: string;
  organiserName: string;
  organiserEmail: string;
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  totalAttendees: number;
  averageRevenuePerEvent: number;
  averageTicketsPerEvent: number;
}
```

---

### 8. Get Revenue Trend Over Time

```http
GET /api/v1/organiser/revenue-trend
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "totalRevenue": 75000.00,
  "eventCount": 5,
  "revenueByEvent": [
    {
      "eventId": "650e8400-e29b-41d4-a716-446655440001",
      "eventName": "Spring Concert",
      "eventDate": "2026-03-15T19:00:00",
      "revenue": 10000.00,
      "ticketsSold": 200
    },
    {
      "eventId": "650e8400-e29b-41d4-a716-446655440002",
      "eventName": "Summer Festival",
      "eventDate": "2026-07-15T19:00:00",
      "revenue": 25000.00,
      "ticketsSold": 500
    },
    {
      "eventId": "650e8400-e29b-41d4-a716-446655440003",
      "eventName": "Fall Workshop",
      "eventDate": "2026-09-20T14:00:00",
      "revenue": 5000.00,
      "ticketsSold": 100
    }
  ]
}
```

---

### 9. Get Individual Event Statistics

```http
GET /api/v1/organiser/events/{eventId}/stats
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "eventId": "650e8400-e29b-41d4-a716-446655440001",
  "eventName": "Summer Music Festival",
  "eventStatus": "PUBLISHED",
  "ticketsSold": 500,
  "revenue": 25000.00,
  "attendeesCount": 400,
  "attendanceRate": 80.0,
  
  "ticketTypeBreakdown": [
    {
      "ticketTypeId": 1,
      "ticketTypeName": "VIP",
      "price": 100.00,
      "totalAvailable": 100,
      "sold": 100,
      "revenue": 10000.00,
      "remaining": 0
    },
    {
      "ticketTypeId": 2,
      "ticketTypeName": "General",
      "price": 50.00,
      "totalAvailable": 500,
      "sold": 400,
      "revenue": 15000.00,
      "remaining": 100
    }
  ],
  
  "startTime": "2026-07-15T19:00:00",
  "endTime": "2026-07-15T23:00:00",
  "venue": "Central Park"
}
```

---

### 10. Get Event Attendees List

```http
GET /api/v1/organiser/events/{eventId}/attendees
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
[
  {
    "userId": "750e8400-e29b-41d4-a716-446655440001",
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  {
    "userId": "750e8400-e29b-41d4-a716-446655440002",
    "name": "Jane Smith",
    "email": "jane.smith@example.com"
  },
  {
    "userId": "750e8400-e29b-41d4-a716-446655440003",
    "name": "Bob Johnson",
    "email": "bob.johnson@example.com"
  }
]
```

---

### 11. Get Event Dashboard Stats (Validation + Revenue)

```http
GET /api/v1/organiser/events/{eventId}/dashboard/stats
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "eventId": "650e8400-e29b-41d4-a716-446655440001",
  "eventName": "Summer Music Festival",
  "totalTicketsSold": 500,
  "totalValidated": 400,
  "remainingAttendees": 100,
  "totalRevenue": 25000.00,
  
  "revenueByTicketType": [
    {
      "ticketTypeId": 1,
      "ticketTypeName": "VIP",
      "ticketsSold": 100,
      "revenue": 10000.00,
      "averagePrice": 100.00
    },
    {
      "ticketTypeId": 2,
      "ticketTypeName": "General",
      "ticketsSold": 400,
      "revenue": 15000.00,
      "averagePrice": 50.00
    }
  ]
}
```

---

### 12. Get Validations by Ticket Type

```http
GET /api/v1/organiser/events/{eventId}/dashboard/ticket-types
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
[
  {
    "ticketTypeId": 1,
    "ticketTypeName": "VIP",
    "validatedCount": 95
  },
  {
    "ticketTypeId": 2,
    "ticketTypeName": "General Admission",
    "validatedCount": 305
  }
]
```

---

### 13. Get Validations by Staff

```http
GET /api/v1/organiser/events/{eventId}/dashboard/staff
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
[
  {
    "staffUserId": "850e8400-e29b-41d4-a716-446655440001",
    "staffUsername": "staff_abc123",
    "validatedCount": 150
  },
  {
    "staffUserId": "850e8400-e29b-41d4-a716-446655440002",
    "staffUsername": "staff_xyz789",
    "validatedCount": 120
  },
  {
    "staffUserId": "850e8400-e29b-41d4-a716-446655440003",
    "staffUsername": "staff_def456",
    "validatedCount": 130
  }
]
```

---

### 14. Get Attendees Validated by Specific Staff

```http
GET /api/v1/organiser/events/{eventId}/dashboard/staff/{staffUserId}/validations?page=0&size=20
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "content": [
    {
      "validationId": "950e8400-e29b-41d4-a716-446655440001",
      "ticketId": "a50e8400-e29b-41d4-a716-446655440001",
      "ticketTypeName": "VIP",
      "attendeeName": "John Doe",
      "attendeeEmail": "john@example.com",
      "validationMethod": "QR",
      "validationStatus": "VALID",
      "validatedAt": "2026-07-15T19:30:00"
    },
    {
      "validationId": "950e8400-e29b-41d4-a716-446655440002",
      "ticketId": "a50e8400-e29b-41d4-a716-446655440002",
      "ticketTypeName": "General",
      "attendeeName": "Jane Smith",
      "attendeeEmail": "jane@example.com",
      "validationMethod": "MANUAL",
      "validationStatus": "VALID",
      "validatedAt": "2026-07-15T19:35:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 150,
  "totalPages": 8,
  "last": false,
  "first": true
}
```

---

### 15. Get Revenue Stats Only

```http
GET /api/v1/organiser/events/{eventId}/dashboard/revenue
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
```json
{
  "eventId": "650e8400-e29b-41d4-a716-446655440001",
  "eventName": "Summer Music Festival",
  "totalRevenue": 25000.00,
  
  "revenueByTicketType": [
    {
      "ticketTypeId": 1,
      "ticketTypeName": "VIP",
      "ticketsSold": 100,
      "revenue": 10000.00,
      "averagePrice": 100.00
    },
    {
      "ticketTypeId": 2,
      "ticketTypeName": "General",
      "ticketsSold": 400,
      "revenue": 15000.00,
      "averagePrice": 50.00
    }
  ]
}
```

---

## 🔒 Authentication

All endpoints require JWT Bearer token:

```javascript
headers: {
  'Authorization': `Bearer ${jwtToken}`,
  'Content-Type': 'application/json'
}
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "error": "Failed to get analytics",
  "message": "You don't have permission to view this event"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Event not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Failed to fetch analytics"
}
```

---

## 🎯 Recommended Frontend Usage

### For Main Dashboard:
```typescript
// Option 1: Lightweight (faster)
GET /api/v1/analytics/summary

// Option 2: Complete data
GET /api/v1/analytics/complete
```

### For Event Details Page:
```typescript
// Get event-specific analytics
GET /api/v1/analytics/events/{eventId}
```

### For Revenue Analysis:
```typescript
// Revenue by ticket type across all events
GET /api/v1/analytics/ticket-types/performance

// Revenue trend over time
GET /api/v1/organiser/revenue-trend
```

---

## 📱 Complete Frontend API Service Example

```typescript
// src/api/analytics.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/v1';

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
  'Content-Type': 'application/json'
});

export const analyticsApi = {
  // Main dashboard
  getSummary: async () => {
    const response = await axios.get(`${BASE_URL}/analytics/summary`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getComplete: async () => {
    const response = await axios.get(`${BASE_URL}/analytics/complete`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Event specific
  getEventAnalytics: async (eventId: string) => {
    const response = await axios.get(`${BASE_URL}/analytics/events/${eventId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Performance
  getTicketTypePerformance: async () => {
    const response = await axios.get(`${BASE_URL}/analytics/ticket-types/performance`, {
      headers: getAuthHeaders()
    });
    return response.data;
  }
};

export const organiserApi = {
  getOverview: async () => {
    const response = await axios.get(`${BASE_URL}/organiser/overview`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getRevenueTrend: async () => {
    const response = await axios.get(`${BASE_URL}/organiser/revenue-trend`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getEventStats: async (eventId: string) => {
    const response = await axios.get(`${BASE_URL}/organiser/events/${eventId}/stats`, {
      headers: getAuthHeaders()
    });
    return response.data;
  },

  getEventAttendees: async (eventId: string) => {
    const response = await axios.get(`${BASE_URL}/organiser/events/${eventId}/attendees`, {
      headers: getAuthHeaders()
    });
    return response.data;
  }
};
```

---

This documentation provides complete endpoint details with actual response structures for frontend integration! 🚀