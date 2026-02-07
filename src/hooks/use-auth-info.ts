import { useUser } from '@/firebase';

export function useAuthInfo() {
    const { user } = useUser();

    const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
        if (name) {
            const nameParts = name.trim().split(' ');
            if (nameParts.length > 1 && nameParts[nameParts.length -1]) {
                return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
            }
            return name.charAt(0).toUpperCase();
        }
        if (email) {
            return email.charAt(0).toUpperCase();
        }
        return 'U';
    };

    return {
        user,
        initials: getInitials(user?.displayName, user?.email),
    };
}