import { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Check, Copy, KeyRound, Power, RefreshCw, Users } from 'lucide-react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Badge } from '../../../Components/ui/badge';
import { Button } from '../../../Components/ui/button';

const LABELS = {
    scolarite: 'Scolarité',
    enseignant: 'Enseignant',
    materiel: 'Matériel',
};

// The "status" flash toast auto-dismisses in 4s — too short to copy a secret
// key — so a freshly generated key gets its own persistent banner instead.
function GeneratedKeyBanner() {
    const { flash } = usePage().props;
    const [message, setMessage] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (flash?.status?.includes('copiez-la maintenant')) {
            setMessage(flash.status);
            setCopied(false);
        }
    }, [flash?.status]);

    if (!message) return null;

    const key = message.split(' : ')[1]?.split(' — ')[0];

    function copy() {
        navigator.clipboard?.writeText(key ?? '');
        setCopied(true);
    }

    return (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-admin-accent/30 bg-admin-accent/10 px-4 py-3">
            <p className="text-sm text-admin-text">{message}</p>
            <div className="flex flex-shrink-0 items-center gap-2">
                <Button onClick={copy} className="bg-admin-card text-admin-text hover:bg-admin-hover">
                    {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                    {copied ? 'Copiée' : 'Copier'}
                </Button>
                <button
                    onClick={() => setMessage(null)}
                    className="rounded-lg px-2 py-1 text-xs text-admin-text-secondary hover:bg-admin-hover"
                >
                    Fermer
                </button>
            </div>
        </div>
    );
}

export default function Index({ departments }) {
    const [pending, setPending] = useState(null);

    function generate(department) {
        setPending(department);
        router.post(
            `/console/cles-acces/${department}/generate`,
            {},
            { preserveScroll: true, onFinish: () => setPending(null) },
        );
    }

    function toggle(department) {
        setPending(department);
        router.post(
            `/console/cles-acces/${department}/toggle`,
            {},
            { preserveScroll: true, onFinish: () => setPending(null) },
        );
    }

    return (
        <AdminLayout title="Clés d'accès">
            <p className="mb-5 text-sm text-admin-text-secondary">
                Chaque espace d'administration séparé (Scolarité, Enseignant, Matériel) est protégé par une clé d'accès partagée, en plus du
                mot de passe habituel. La désactiver bloque immédiatement l'accès, même avec les bons identifiants.
            </p>

            <GeneratedKeyBanner />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {departments.map((dept) => (
                    <div key={dept.department} className="rounded-xl border border-admin-border bg-admin-card p-5">
                        <div className="mb-3 flex items-start justify-between">
                            <div>
                                <h3 className="font-semibold text-admin-text">{LABELS[dept.department] ?? dept.department}</h3>
                                <p className="mt-1 flex items-center gap-1 text-xs text-admin-text-secondary">
                                    <Users className="h-3.5 w-3.5" aria-hidden="true" />
                                    {dept.users_count} utilisateur(s) avec ce rôle
                                </p>
                            </div>
                            <Badge variant={dept.is_active ? 'success' : 'outline'}>{dept.is_active ? 'Activée' : 'Désactivée'}</Badge>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={() => generate(dept.department)}
                                disabled={pending === dept.department}
                                className="bg-admin-hover text-admin-text hover:bg-admin-hover/70"
                            >
                                {dept.has_key ? (
                                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                                ) : (
                                    <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                                )}
                                {dept.has_key ? 'Régénérer' : 'Générer une clé'}
                            </Button>
                            {dept.has_key && (
                                <Button
                                    onClick={() => toggle(dept.department)}
                                    disabled={pending === dept.department}
                                    className={
                                        dept.is_active
                                            ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400'
                                            : 'bg-admin-accent text-admin-accent-foreground hover:bg-admin-accent/90'
                                    }
                                >
                                    <Power className="h-3.5 w-3.5" aria-hidden="true" />
                                    {dept.is_active ? 'Désactiver' : 'Activer'}
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
