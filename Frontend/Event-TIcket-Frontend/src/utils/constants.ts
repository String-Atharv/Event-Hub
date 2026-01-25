// Application constants

// Application constants

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const ROUTES = {
  DASHBOARD: '/',
  EVENTS: '/events',
  EVENT_CREATE: '/events/create',
  EVENT_EDIT: '/events/:id/edit',
  EVENT_DETAILS: '/events/:id',
  EVENT_TICKETS: '/events/:id/tickets',
  TICKETS: '/tickets',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
} as const;

