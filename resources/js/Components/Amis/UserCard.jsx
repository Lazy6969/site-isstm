import { Link, router } from '@inertiajs/react';

export default function UserCard({ user }) {
    function sendRequest() {
        router.post(`/amis/${user.id}`, {}, { preserveScroll: true });
    }

    function cancel() {
        router.delete(`/amis/demandes/${user.friend_request_id}`, { preserveScroll: true });
    }

    return (
        <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <Link href={`/profil/${user.id}`}>
                <img
                    src={user.avatar_path ? `/storage/${user.avatar_path}` : '/images/logo-isstm.jpg'}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover"
                />
            </Link>
            <div className="min-w-0 flex-1">
                <Link href={`/profil/${user.id}`} className="block truncate font-semibold text-slate-800 hover:text-isstm-navy">
                    {user.name}
                </Link>
                <p className="truncate text-xs text-slate-400">
                    {user.role_label}
                    {user.filiere ? ` · ${user.filiere}` : ''}
                </p>
            </div>

            {user.status === 'aucune' && (
                <button
                    onClick={sendRequest}
                    className="rounded-full bg-isstm-navy px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-isstm-navy-dark"
                >
                    Ajouter
                </button>
            )}
            {user.status === 'envoyee' && (
                <button onClick={cancel} className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50">
                    Demande envoyée
                </button>
            )}
            {user.status === 'recue' && <span className="rounded-full bg-isstm-gold/10 px-3 py-1.5 text-xs font-semibold text-isstm-gold">En attente</span>}
            {user.status === 'amis' && (
                <div className="flex items-center gap-2">
                    <Link
                        href={`/messages/nouveau/${user.id}`}
                        method="post"
                        as="button"
                        className="rounded-full border border-isstm-navy/30 px-3 py-1.5 text-xs font-medium text-isstm-navy hover:bg-isstm-navy/5"
                    >
                        Message
                    </Link>
                    <button onClick={cancel} className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-50">
                        Retirer
                    </button>
                </div>
            )}
        </div>
    );
}
