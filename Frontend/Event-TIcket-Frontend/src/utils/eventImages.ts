// Curated collection of high-quality event images from Unsplash
// Each image is matched to event types for better relevance

const EVENT_IMAGES = {
    // Performance-related images
    PERFORMANCES: [
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop', // Concert stage
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=600&fit=crop', // Concert crowd
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=600&fit=crop', // Live performance
        'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=600&fit=crop', // Festival lights
        'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&h=600&fit=crop', // Concert hands
    ],

    // Experience-related images
    EXPERIENCES: [
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=600&fit=crop', // Festival
        'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=600&fit=crop', // Crowd concert
        'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=600&fit=crop', // DJ set
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=600&fit=crop', // Confetti party
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop', // Celebration
    ],

    // Party-related images
    PARTIES: [
        'https://images.unsplash.com/photo-1496843916299-590492c751f4?w=400&h=600&fit=crop', // Club lights
        'https://images.unsplash.com/photo-1545128485-c400e7702796?w=400&h=600&fit=crop', // Disco ball
        'https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=400&h=600&fit=crop', // Party crowd
        'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&h=600&fit=crop', // Friends party
        'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400&h=600&fit=crop', // Celebration confetti
    ],

    // Sports-related images
    SPORTS: [
        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=600&fit=crop', // Stadium
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=600&fit=crop', // Football match
        'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=400&h=600&fit=crop', // Running event
        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=600&fit=crop', // Cricket
        'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=400&h=600&fit=crop', // Marathon
    ],

    // Conference-related images
    CONFERENCES: [
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=600&fit=crop', // Conference hall
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=600&fit=crop', // Presentation
        'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=600&fit=crop', // Speaker
        'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&h=600&fit=crop', // Tech conference
        'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=400&h=600&fit=crop', // Business event
    ],

    // Default/Generic event images
    DEFAULT: [
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=600&fit=crop', // Confetti
        'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=600&fit=crop', // Lights
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=600&fit=crop', // Festival
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=600&fit=crop', // Concert
        'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=600&fit=crop', // DJ
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=600&fit=crop', // Show
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=600&fit=crop', // Conference
        'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&h=600&fit=crop', // Hands up
    ],
};

/**
 * Generates a consistent hash from a string
 * Used to assign the same image to the same event consistently
 */
const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
};

/**
 * Get a consistent event image based on event ID and type
 * The same event will always get the same image
 */
export const getEventImage = (eventId: string, eventType?: string): string => {
    // Normalize event type to uppercase
    const type = eventType?.toUpperCase() || 'DEFAULT';

    // Get the appropriate image array based on event type
    const images = EVENT_IMAGES[type as keyof typeof EVENT_IMAGES] || EVENT_IMAGES.DEFAULT;

    // Use hash of event ID to consistently select an image
    const hash = hashString(eventId);
    const imageIndex = hash % images.length;

    return images[imageIndex];
};

/**
 * Get event image with a specific index (for variety in lists)
 */
export const getEventImageByIndex = (index: number, eventType?: string): string => {
    const type = eventType?.toUpperCase() || 'DEFAULT';
    const images = EVENT_IMAGES[type as keyof typeof EVENT_IMAGES] || EVENT_IMAGES.DEFAULT;

    return images[index % images.length];
};

export default EVENT_IMAGES;
