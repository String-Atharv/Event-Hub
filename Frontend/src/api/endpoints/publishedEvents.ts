import apiClient from '../client';
import { PaginatedResponse } from '@/types';

export interface PublishedEventDto {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  venue: string;
  eventType:string;
  salesStartDate?: string;
  salesEndDate?: string;
  eventStatus: 'PUBLISHED';
  ticketTypes: {
    id: number;
    name: string;
    price: number;
    totalAvailable?: number;
  }[];
  imageUrl?: string;
}

export const publishedEventsApi = {
  // GET /api/v1/published-events
  getAll: async (page: number = 0, size: number = 12, search?: string): Promise<PaginatedResponse<PublishedEventDto>> => {
    const params: any = { page, size };
    if (search && search.trim()) {
      params.search = search.trim();
    }
    
    const response = await apiClient.get<PaginatedResponse<PublishedEventDto>>('/published-events', {
      params,
    });
    return response.data;
  },

  // GET /api/v1/published-events/{id}
  getById: async (id: string): Promise<PublishedEventDto> => {
    const response = await apiClient.get<PublishedEventDto>(`/published-events/${id}`);
    return response.data;
  },
};