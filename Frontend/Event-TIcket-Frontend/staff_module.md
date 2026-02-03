Service: Event Ticket Platform
Module: Staff Management
Base Path: /api/v1/staff
Authentication: JWT (Bearer Token)
Roles Used: ROLE_ORGANISER, ROLE_STAFF

🔐 Authentication & Authorization Rules
Organizer

Must be logged in

Must have ROLE_ORGANISER

Can:

Generate staff

View staff

Delete staff

Reset staff password

Extend staff validity

View staff statistics

Staff

Logs in via email + password

Gets ONLY ROLE_STAFF

Can access only staff business APIs (/api/v1/staff/validation/**)

1️⃣ Generate Staff Accounts
Endpoint
POST /api/v1/staff/events/{eventId}/generate

Authorization
Authorization: Bearer <ORGANISER_JWT>

Request Body

DTO: GenerateStaffRequestDto

{
  "count": 5,
  "validityHours": 24
}

Notes

count → optional (default = 1)

validityHours → optional (default = 24)

Response

DTO: GenerateStaffResponseDto

{
  "message": "Staff accounts created successfully",
  "organiserId": "c1a5c2d4-8c30-4d0b-a8c4-8f3a1c2a9a91",
  "eventId": "9c6b8f61-3f1d-4e9f-a97e-cc8f98b2c321",
  "staffCount": 2,
  "validityHours": 24,
  "validFrom": "2026-02-03T16:20:00",
  "validUntil": "2026-02-04T16:20:00",
  "credentials": [
    {
      "staffUserId": "e8f7c12a-91a2-4d2a-bc2f-6a1a8c9f1111",
      "username": "staff_ab12cd34",
      "password": "XyZ@12345",
      "email": "staff_ab12cd34@staff.eventplatform.com",
      "validFrom": "2026-02-03T16:20:00",
      "validUntil": "2026-02-04T16:20:00"
    }
  ]
}


⚠️ Password is returned only once. Frontend must store or display it immediately.

2️⃣ Get All Staff for an Event (Including Expired)
Endpoint
GET /api/v1/staff/events/{eventId}

Authorization
Authorization: Bearer <ORGANISER_JWT>

Response

DTO: Page<StaffCredentialsDto>

{
  "content": [
    {
      "id": 1,
      "staffUserId": "e8f7c12a-91a2-4d2a-bc2f-6a1a8c9f1111",
      "username": "staff_ab12cd34",
      "email": "staff_ab12cd34@staff.eventplatform.com",
      "isActive": true,
      "validFrom": "2026-02-03T16:20:00",
      "validUntil": "2026-02-04T16:20:00",
      "isExpired": false,
      "createdAt": "2026-02-03T16:20:00",
      "lastLogin": "2026-02-03T18:10:00"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 10,
  "number": 0
}

3️⃣ Get Only Active Staff for an Event
Endpoint
GET /api/v1/staff/events/{eventId}/active

Authorization
Authorization: Bearer <ORGANISER_JWT>

Response

Same structure as Get All Staff, but only:

isActive = true

isExpired = false

4️⃣ Delete (Deactivate) Staff User
Endpoint
DELETE /api/v1/staff/events/{eventId}/users/{userId}

Authorization
Authorization: Bearer <ORGANISER_JWT>

Response
{
  "message": "Staff user deleted successfully",
  "userId": "e8f7c12a-91a2-4d2a-bc2f-6a1a8c9f1111",
  "eventId": "9c6b8f61-3f1d-4e9f-a97e-cc8f98b2c321"
}


📌 This is a soft delete (isActive = false).

5️⃣ Reset Staff Password
Endpoint
POST /api/v1/staff/events/{eventId}/users/{userId}/reset-password

Authorization
Authorization: Bearer <ORGANISER_JWT>

Response
{
  "message": "Password reset successfully",
  "userId": "e8f7c12a-91a2-4d2a-bc2f-6a1a8c9f1111",
  "eventId": "9c6b8f61-3f1d-4e9f-a97e-cc8f98b2c321",
  "newPassword": "AbC@98765",
  "note": "⚠️ Save this password securely. It won't be shown again."
}

6️⃣ Extend Staff Validity
Endpoint
POST /api/v1/staff/events/{eventId}/users/{userId}/extend-validity?hours=12

Authorization
Authorization: Bearer <ORGANISER_JWT>

Response
{
  "message": "Validity extended successfully",
  "userId": "e8f7c12a-91a2-4d2a-bc2f-6a1a8c9f1111",
  "eventId": "9c6b8f61-3f1d-4e9f-a97e-cc8f98b2c321",
  "newValidUntil": "2026-02-05T04:20:00",
  "extendedBy": "12 hours"
}

7️⃣ Get Staff Statistics for an Event
Endpoint
GET /api/v1/staff/events/{eventId}/stats

Authorization
Authorization: Bearer <ORGANISER_JWT>

Response
{
  "eventId": "9c6b8f61-3f1d-4e9f-a97e-cc8f98b2c321",
  "total": 10,
  "active": 6,
  "expired": 3,
  "inactive": 1
}

🔑 Staff Login (For Staff Users)
Endpoint
POST /auth/staff/login

Request
{
  "identifier": "staff_ab12cd34@staff.eventplatform.com",
  "password": "XyZ@12345"
}


📌 Staff can log in ONLY via email (not username).

Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}

✅ Key Backend Guarantees (Frontend Can Rely On)

Staff always get only ROLE_STAFF

Staff credentials expire automatically

Inactive or expired staff cannot log in

Staff cannot access organiser APIs

Passwords are never retrievable again after generation