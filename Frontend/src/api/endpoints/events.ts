import apiClient from '../client';
import { PaginatedResponse } from '@/types';

// Ticket Type DTOs (matching backend CreateTicketTypeRequestDto)
export interface CreateTicketTypeDto {
  name: string;
  price: number;
  description?: string;
  totalAvailable?: number;
}

export interface UpdateTicketTypeRequestDto {
  id?: number;
  name?: string;
  price?: number;
  description?: string;
  totalAvailable?: number;
}

// Event DTOs (matching backend DTOs)
export interface Event {
  id: string;
  name: string;  // Changed from 'title' to 'name'
  description: string;
  startTime: string;  // Changed from 'startDate' to 'startTime'
  endTime: string;    // Changed from 'endDate' to 'endTime'
  venue: string;
  eventType:string;
  salesStartDate?: string;
  salesEndDate?: string;
  eventStatus: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  ticketTypes: TicketTypeCreatedResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDto {
  name: string;  // Changed from 'title' to 'name'
  description: string;
  startTime: string;  // Changed from 'startDate' to 'startTime'
  endTime: string;    // Changed from 'endDate' to 'endTime'
  venue: string;
  eventType:string;
  salesStartDate?: string;
  salesEndDate?: string;
  ticketTypes: CreateTicketTypeDto[];
}

export interface UpdateEventDto {
  name?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  eventType:string;
  salesStartDate?: string;
  salesEndDate?: string;
  ticketTypes?: UpdateTicketTypeRequestDto[];
}

// Response DTOs (matching backend response DTOs)
export interface EventCreatedResponseDto {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  venue: string;
  eventType:string;
  salesStartDate?: string;
  salesEndDate?: string;
  eventStatus: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  ticketTypes: TicketTypeCreatedResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketTypeCreatedResponseDto {
  id: number;
  name: string;
  price: number;
  description?: string;
  totalAvailable?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListEventResponseDto {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  venue: string;
  eventType:string;
  salesStartDate?: string;
  salesEndDate?: string;
  eventStatus: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  ticketTypes: ListEventTicketTypeResponseDto[];
}

export interface ListEventTicketTypeResponseDto {
  id: number;
  name: string;
  price: number;
  totalAvailable?: number;
}

export const eventsApi = {
  // GET /api/v1/events/listEvent
  getAll: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<ListEventResponseDto>> => {
    const response = await apiClient.get<PaginatedResponse<ListEventResponseDto>>('/events/listEvent', {
      params: { page, size },
    });
    return response.data;
  },

  // GET /api/v1/events/getEvent/{id}
  getById: async (id: string): Promise<EventCreatedResponseDto> => {
    const response = await apiClient.get<EventCreatedResponseDto>(`/events/getEvent/${id}`);
    return response.data;
  },

  // POST /api/v1/events/createEvent
  create: async (data: CreateEventDto): Promise<EventCreatedResponseDto> => {
    const response = await apiClient.post<EventCreatedResponseDto>('/events/createEvent', data);
    return response.data;
  },

  // PATCH /api/v1/events/updateEvent/{id}
  update: async (id: string, data: UpdateEventDto): Promise<EventCreatedResponseDto> => {
    const response = await apiClient.patch<EventCreatedResponseDto>(`/events/updateEvent/${id}`, data);
    return response.data;
  },

  // Note: Backend doesn't have delete yet, but keeping for future
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/events/${id}`);
  },
  deleteTicketType: async (eventId: string, ticketTypeId: string): Promise<void> => {
    await apiClient.delete(`/events/${eventId}/ticket-types/${ticketTypeId}`);
  },
};