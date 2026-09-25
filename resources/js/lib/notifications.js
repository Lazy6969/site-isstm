import { xsrfToken } from './csrf';

/**
 * Where clicking a notification should land — deep-linking to the exact
 * post/comment/friend-request/conversation it refers to (with a `highlight`
 * or `comment` query param the target page reads to flash and scroll to it)
 * instead of the generic section index.
 */
export function notificationLink(notification) {
    switch (notification.type) {
        case 'demande_ami':
            return notification.friend_request_id
                ? `/amis?tab=recues&highlight=${notification.friend_request_id}`
                : '/amis?tab=recues';
        case 'ami_accepte':
            return notification.actor?.id ? `/amis?tab=amis&highlight=${notification.actor.id}` : '/amis?tab=amis';
        case 'nouveau_message':
            return notification.conversation_id ? `/messages/${notification.conversation_id}` : '/messages';
        case 'reponse_commentaire':
            if (!notification.post_id) return '/communaute';

            return notification.comment_id
                ? `/communaute/${notification.post_id}?comment=${notification.comment_id}`
                : `/communaute/${notification.post_id}`;
        case 'nouvelle_publication':
            return notification.post_id ? `/communaute/${notification.post_id}` : '/communaute';
        case 'nouvelle_preinscription':
            return notification.preinscription_id
                ? `/console/preinscriptions/${notification.preinscription_id}`
                : '/console/preinscriptions';
        default:
            return '/notifications';
    }
}

/**
 * Fire-and-await POST to mark a single notification read — a plain `fetch`
 * (not `router.post`) so it doesn't trigger its own Inertia page visit; the
 * caller awaits it, then navigates, so the unread count the next page loads
 * is already correct instead of racing the navigation.
 */
export function markNotificationRead(id) {
    return fetch(`/notifications/${id}/lu`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'X-XSRF-TOKEN': xsrfToken() },
    }).catch(() => {});
}
