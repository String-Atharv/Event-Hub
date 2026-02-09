import { Badge } from './Badge';

interface RoleBadgesProps {
    roles: string[];
}

export const RoleBadges = ({ roles }: RoleBadgesProps) => {
    const getBadgeVariant = (role: string) => {
        const upperRole = role.toUpperCase();
        switch (upperRole) {
            case 'ROLE_ORGANISER':
                return 'success';
            case 'ROLE_STAFF':
                return 'warning';
            case 'ROLE_ATTENDEE':
                return 'info';
            default:
                return 'default';
        }
    };

    const formatRoleName = (role: string) => {
        return role.replace('ROLE_', '').toLowerCase().replace(/^\w/, c => c.toUpperCase());
    };

    // Filter relevant roles
    const relevantRoles = roles.filter(role => role.startsWith('ROLE_'));

    if (relevantRoles.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {relevantRoles.map(role => (
                <Badge key={role} variant={getBadgeVariant(role)}>
                    {formatRoleName(role)}
                </Badge>
            ))}
        </div>
    );
};
