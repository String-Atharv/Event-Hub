// Add to existing types in types/index.ts:

// Existing types...
export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  roles: string[];
}

export interface StaffCredentialItem {
  staffUserId: string;
  username: string;
  password: string;
  email: string;
  validFrom: string;
  validUntil: string;
}

export interface StaffGenerationResponse {
  message: string;
  organiserId: string;
  eventId: string;
  staffCount: number;
  validityHours: number;
  validFrom: string;
  validUntil: string;
  credentials: StaffCredentialItem[];
}

export interface StaffGenerationRequest {
  count: number;
  validityHours: number;
}

export interface StaffMemberDto {
  id: number;
  staffUserId: string;
  username: string;
  email: string;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  isExpired: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface PasswordResetResponse {
  newPassword: string;
}

export interface ExtendValidityResponse {
  newValidUntil: string;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// ADD THESE NEW TYPES:
export interface TicketTypeDto {
  id: number;
  name: string;
  price: number;
  description?: string;
  totalAvailable?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventDto {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  venue: string;
  salesStartDate?: string;
  salesEndDate?: string;
  eventStatus: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  ticketTypes: TicketTypeDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ListEventDto {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  venue: string;
  salesStartDate?: string;
  salesEndDate?: string;
  eventStatus: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  ticketTypes: ListEventTicketTypeDto[];
}

export interface ListEventTicketTypeDto {
  id: number;
  name: string;
  price: number;
  totalAvailable?: number;
}

// Staff Validation Types
export interface TicketValidationResponse {
  validationId: string;
  ticketId: string;
  ticketTypeName: string;
  attendeeName: string;
  attendeeEmail: string;
  eventName: string;
  validatedAt: string;
  validatedBy: string;
  message: string;
}

export interface TicketSearchResult {
  ticketId: string;
  qrCode: string; // The publicCode used for validation
  attendeeName: string;
  attendeeEmail: string;
  ticketType: string;
  status: 'PURCHASED' | 'USED' | 'CANCELLED' | 'EXPIRED' | 'INVALID';
  price: number;
}

export interface StaffValidationStats {
  staffUserId: string;
  staffUsername: string;
  validatedCount: number;
  eventName: string;
}

// Organiser Dashboard Types
export interface EventValidationStats {
  eventId: string;
  eventName: string;
  totalTicketsSold: number;
  totalValidated: number;
  remainingAttendees: number;
  totalRevenue: number;
  revenueByTicketType?: {
    ticketTypeId: number;
    ticketTypeName: string;
    ticketsSold: number;
    revenue: number;
    averagePrice: number;
  }[];
}

export interface OrganiserOverview {
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

export interface TicketTypeAttendance {
  ticketTypeId: number;
  ticketTypeName: string;
  validatedCount: number;
}

export interface ValidationHistory {
  validationId: string;
  ticketId: string;
  ticketTypeName: string;
  attendeeName: string;
  attendeeEmail: string;
  validationMethod: 'QR' | 'MANUAL';
  validationStatus: 'VALID' | 'INVALID' | 'EXPIRED';
  validatedAt: string;
}