JWT Authentication API Documentation
Event Ticket Platform - Backend API Reference

Base URL
http://localhost:8080/api/v1/auth

Authentication Endpoints
1. User Registration
Endpoint: POST /api/v1/auth/register
Description: Register a new user account
Request Headers:
Content-Type: application/json
Request Body (DTO: RegisterRequest):
json{
  "name": "string",
  "email": "string",
  "password": "string"
}
Response (DTO: AuthenticationResponse):
json{
  "accessToken": "string (JWT access token)",
  "refreshToken": "string (JWT refresh token)"
}
Status Codes:

200 OK - Registration successful
400 BAD REQUEST - Invalid input data
409 CONFLICT - Email already exists


2. User Login
Endpoint: POST /api/v1/auth/login
Description: Authenticate user and receive JWT tokens
Request Headers:
Content-Type: application/json
Request Body (DTO: AuthenticationRequest):
json{
  "email": "string",
  "password": "string"
}
Response (DTO: AuthenticationResponse):
json{
  "accessToken": "string (JWT access token)",
  "refreshToken": "string (JWT refresh token)"
}
Status Codes:

200 OK - Login successful
401 UNAUTHORIZED - Invalid credentials
403 FORBIDDEN - Account locked or disabled


3. Refresh Token
Endpoint: POST /api/v1/auth/refresh
Description: Get a new access token using a valid refresh token
Request Headers:
Content-Type: application/json
Authorization: Bearer <refresh_token>
Request Body:
json{
  "refreshToken": "string (the refresh token received during login)"
}
Response (DTO: AuthenticationResponse):
json{
  "accessToken": "string (new JWT access token)",
  "refreshToken": "string (new JWT refresh token)"
}
Status Codes:

200 OK - Token refreshed successfully
401 UNAUTHORIZED - Invalid or expired refresh token
403 FORBIDDEN - Token has been revoked


Protected Endpoints Usage
All protected endpoints require authentication using the JWT access token.
Request Headers:
Authorization: Bearer <access_token>
Content-Type: application/json
Example:
GET /api/v1/events
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Data Transfer Objects (DTOs)
1. RegisterRequest
Location: Security/Dto/RegisterRequest.java
java{
  "name": "string",             // Required, not blank
  "email": "string",            // Required, valid email format
  "password": "string"          // Required, min 6 characters
}
Validation Rules:

name: Not blank
email: Valid email format, unique in system
password: Minimum 6 characters

Example:
json{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}

2. AuthenticationRequest
Location: Security/Dto/AuthenticationRequest.java
java{
  "email": "string",         // Required, valid email format
  "password": "string"       // Required
}
Validation Rules:

email: Valid email format
password: Not blank

Example:
json{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}

3. AuthenticationResponse
Location: Security/Dto/AuthenticationResponse.java
java{
  "accessToken": "string",    // JWT access token (short-lived)
  "refreshToken": "string"    // JWT refresh token (long-lived)
}
Token Details:

Access Token:

Valid for: 15 minutes (900 seconds)
Use for: All API requests
Contains: User ID, email, roles


Refresh Token:

Valid for: 7 days
Use for: Getting new access tokens
Store securely on client side



Example:
json{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTY4NDM4MjJ9.4Adcj0vZ9R8Y8L5c7FfQ5aE7M3B1N2H8P9K6D4G3F2E"
}

JWT Token Structure
Access Token Claims:
json{
  "sub": "user@example.com",           // Subject (user email)
  "userId": 123,                       // User ID
  "roles": ["USER", "ORGANISER"],      // User roles
  "iat": 1234567890,                   // Issued at
  "exp": 1234568790                    // Expiration (15 min from iat)
}
Refresh Token Claims:
json{
  "sub": "user@example.com",           // Subject (user email)
  "userId": 123,                       // User ID
  "iat": 1234567890,                   // Issued at
  "exp": 1235172690                    // Expiration (7 days from iat)
}

Error Responses
Standard Error Format (ErrorDto)
Location: Domain/DTO/ErrorDtos/ErrorDto.java
json{
  "message": "string",         // Error message
  "timestamp": "datetime",     // When error occurred
  "status": "integer"          // HTTP status code
}
Common Error Responses
1. Invalid Credentials (401)
json{
  "message": "Invalid email or password",
  "timestamp": "2024-02-03T10:30:00",
  "status": 401
}
2. Email Already Exists (409)
json{
  "message": "Email already registered",
  "timestamp": "2024-02-03T10:30:00",
  "status": 409
}
3. Invalid Token (401)
json{
  "message": "Invalid or expired token",
  "timestamp": "2024-02-03T10:30:00",
  "status": 401
}
4. Validation Error (400)
json{
  "message": "Validation failed: email must be valid",
  "timestamp": "2024-02-03T10:30:00",
  "status": 400
}
5. Access Denied (403)
json{
  "message": "Access denied",
  "timestamp": "2024-02-03T10:30:00",
  "status": 403
}

Security Configuration Details
CORS Settings

Allowed Origins:

http://localhost:5173 (Vite)
http://localhost:3000 (Create React App)


Allowed Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD
Allowed Headers: All (*)
Credentials: Enabled
Max Age: 3600 seconds

Public Endpoints (No Authentication Required)
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
GET  /api/v1/published-events
GET  /api/v1/published-events/{event-id}
Protected Endpoints (Authentication Required)
All /api/v1/events/** endpoints
All /api/v1/tickets/** endpoints
All /api/v1/analytics/** endpoints
All /api/v1/staff/** endpoints