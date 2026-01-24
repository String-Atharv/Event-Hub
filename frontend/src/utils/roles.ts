import { User } from '@/types';

// Role Constants
export const ROLES = {
    ORGANISER: 'ROLE_ORGANISER',
    STAFF: 'ROLE_STAFF',
    ATTENDEE: 'ROLE_ATTENDEE',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

/**
 * Check if user has a specific role
 */
export const hasRole = (user: User | null, role: RoleType): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
};

/**
 * Check if user has STAFF role
 * ⚠️ PRIORITY RULE: If user has STAFF role, they are isolated to staff features ONLY
 */
export const isStaff = (user: User | null): boolean => {
    return hasRole(user, ROLES.STAFF);
};

/**
 * Check if user is an Organiser (and NOT a Staff member)
 * Returns false if user has STAFF role (even if they also have ORGANISER role)
 */
export const isOrganiser = (user: User | null): boolean => {
    return hasRole(user, ROLES.ORGANISER);
};

/**
 * Check if user is a pure Organiser (has ORGANISER but NOT STAFF)
 */
export const isPureOrganiser = (user: User | null): boolean => {
    return hasRole(user, ROLES.ORGANISER) && !hasRole(user, ROLES.STAFF);
};

/**
 * Check if user is an Attendee
 */
export const isAttendee = (user: User | null): boolean => {
    return hasRole(user, ROLES.ATTENDEE);
};

/**
 * Get the effective role of the user
 * STAFF takes absolute priority - if user has STAFF, that's their effective role
 */
export const getEffectiveRole = (user: User | null): RoleType | null => {
    if (!user || !user.roles) return null;

    // STAFF takes priority over everything
    if (isStaff(user)) return ROLES.STAFF;
    if (isOrganiser(user)) return ROLES.ORGANISER;
    if (isAttendee(user)) return ROLES.ATTENDEE;

    return null;
};

/**
 * Get the default redirect path based on user's effective role
 */
export const getDefaultRedirectForRole = (user: User | null): string => {
    const effectiveRole = getEffectiveRole(user);

    switch (effectiveRole) {
        case ROLES.STAFF:
            return '/staff/validation';
        case ROLES.ORGANISER:
            return '/dashboard';
        default:
            return '/';
    }
};
