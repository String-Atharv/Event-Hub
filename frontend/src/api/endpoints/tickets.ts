import apiClient from '../client';
import { PaginatedResponse } from '@/types';

// ============================================================================
// TICKET DTOs (matching backend)
// ============================================================================

export interface TicketPurchasedDto {
  id: string;
  price: number;
  status: 'PURCHASED' | 'USED' | 'CANCELLED' | 'EXPIRED' | 'INVALID';
  ticketType: TicketTypeDtoForTicketPurchase;
  event: EventDtoForTicketPurchase;
}

export interface TicketPurchasedDetails {
  id: string;
  price: number;
  status: 'PURCHASED' | 'USED' | 'CANCELLED' | 'EXPIRED' | 'INVALID';
  ticketType: TicketTypeDetails;
  purchasedAt: string;
}

export interface TicketTypeDtoForTicketPurchase {
  id: number;
  name: string;
  totalAvailable: number;
  price: number;
}

export interface TicketTypeDetails {
  id: number;
  name: string;
  price: number;
}

export interface EventDtoForTicketPurchase {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

// ============================================================================
// QR CODE DTOs (matching backend)
// ============================================================================

export interface QrCodeDetails {
  id: string;
  publicCode: string;
  qrCodeStatus: 'ACTIVE' | 'EXPIRED' | 'USED';
  generatedDateTime: string;
}

// ============================================================================
// TICKETS API
// ============================================================================

export const ticketsApi = {
  /**
   * Purchase a ticket for a specific ticket type
   * POST /api/v1/tickets/purchase/{ticketTypeId}
   * 
   * Backend creates ticket with PURCHASED status
   * NO QR code is generated at this stage
   */
  purchaseTicket: async (ticketTypeId: number): Promise<TicketPurchasedDto> => {
    const response = await apiClient.post<TicketPurchasedDto>(
      `/tickets/purchase/${ticketTypeId}`
    );
    return response.data;
  },

  /**
   * List all tickets purchased by the authenticated user (paginated)
   * GET /api/v1/tickets
   */
  listMyTickets: async (
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<TicketPurchasedDto>> => {
    const response = await apiClient.get<PaginatedResponse<TicketPurchasedDto>>(
      '/tickets',
      { params: { page, size } }
    );
    return response.data;
  },

  /**
   * Get detailed information about a specific ticket
   * GET /api/v1/tickets/{ticketId}
   * 
   * Returns ticket details WITHOUT generating QR code
   * This is read-only - QR metadata fetched separately
   */
  getTicketDetails: async (ticketId: string): Promise<TicketPurchasedDetails> => {
    const response = await apiClient.get<TicketPurchasedDetails>(
      `/tickets/${ticketId}`
    );
    return response.data;
  },

  /**
   * Get QR code metadata for a ticket (read-only)
   * GET /api/v1/tickets/{ticketId}/qr
   * 
   * Returns QR details if one exists
   * Does NOT generate a new QR code
   */
  getQrCodeDetails: async (ticketId: string): Promise<QrCodeDetails | null> => {
    try {
      const response = await apiClient.get<QrCodeDetails>(
        `/tickets/${ticketId}/qr`
      );
      return response.data;
    } catch (error: any) {
      // If no QR exists yet, return null instead of throwing
      if (error.status === 404 || error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Generate QR code image for a ticket
   * POST /api/v1/tickets/{ticketId}/qr
   * 
   * This is the ONLY endpoint that generates QR codes
   * Backend validates ticket status and either:
   * - Reuses existing ACTIVE QR if not expired
   * - Generates new QR if none exists or previous expired
   * 
   * Returns binary image data (PNG)
   */
  generateQrCode: async (ticketId: string): Promise<Blob> => {
    const response = await apiClient.post(
      `/tickets/${ticketId}/qr`,
      {},
      {
        responseType: 'blob', // Important: receive binary data
      }
    );
    return response.data;
  },

  /**
   * Scan/validate QR code at venue
   * POST /api/v1/tickets/scanQr?publicCode={publicCode}
   * 
   * Backend validates:
   * - QR exists and is ACTIVE
   * - QR not expired (based on generation time + expiry window)
   * - Ticket status is PURCHASED
   * 
   * If valid, marks both QR and ticket as USED (atomic operation)
   */
  scanQrCode: async (publicCode: string): Promise<void> => {
    await apiClient.post('/tickets/scanQr', null, {
      params: { publicCode },
    });
  },

  /**
   * Cancel a ticket (restore availability)
   * POST /api/v1/tickets/{ticketId}/cancel
   * 
   * Only allowed for PURCHASED tickets (not USED)
   */
  cancelTicket: async (ticketId: string): Promise<void> => {
    await apiClient.post(`/tickets/${ticketId}/cancel`);
  },
};