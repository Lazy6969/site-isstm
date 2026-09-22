import { router } from '@inertiajs/react';
import { UserCheck } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Avatar, AvatarFallback, AvatarImage } from '../../../Components/ui/avatar';
import { Button } from '../../../Components/ui/button';
import { useTranslations } from '../../../lib/useTranslations';

function formatDate(value) {
    return new Date(value).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export default function Index({ preinscriptions }) {
    const { t } = useTranslations();
    const [processingId, setProcessingId] = useState(null);

    function approve(id) {
        const confirmed = window.confirm(
            t(
                'preinscriptions_admin.confirmer_approbation',
                'Créer le compte étudiant pour cette préinscription ?',
            ),
        );

        if (!confirmed) {
            return;
        }

        setProcessingId(id);

        router.post(
            `/console/preinscriptions/${id}/approve`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessingId(null),
            },
        );
    }

    return (
        <AdminLayout
            title={t(
                'preinscriptions_admin.titre',
                'Préinscriptions en attente',
            )}
        >
            <p className="-mt-4 mb-6 text-sm text-admin-text-secondary">
                {preinscriptions.length}{' '}
                {t(
                    'preinscriptions_admin.dossiers_a_traiter',
                    'dossier(s) à traiter.',
                )}
            </p>

            {preinscriptions.length === 0 ? (
                <div className="rounded-xl border border-admin-border bg-admin-card p-8 text-center text-sm text-admin-muted">
                    {t(
                        'preinscriptions_admin.aucune_preinscription',
                        'Aucune préinscription en attente.',
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {preinscriptions.map((p) => (
                        <div
                            key={p.id}
                            className="flex flex-col items-stretch gap-4 rounded-xl border border-admin-border bg-admin-card p-5 sm:flex-row sm:items-center sm:gap-5"
                        >
                            <Avatar className="h-14 w-14 flex-shrink-0">
                                <AvatarImage
                                    src={
                                        p.photo_path
                                            ? `/storage/${p.photo_path}`
                                            : undefined
                                    }
                                    alt=""
                                />
                                <AvatarFallback className="bg-admin-hover text-admin-text">
                                    {p.nom?.[0]}
                                </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0 flex-1">
                                <p className="font-medium text-admin-text">
                                    {p.nom} {p.prenoms}
                                </p>

                                <p className="text-sm text-admin-text-secondary">
                                    {p.filiere?.nom_fr} · {p.niveau} · {p.email}
                                </p>

                                <p className="text-xs text-admin-muted">
                                    {t(
                                        'preinscriptions_admin.deposee_le',
                                        'Déposée le',
                                    )}{' '}
                                    {formatDate(p.created_at)}
                                </p>
                            </div>

                            <Button
                                onClick={() => approve(p.id)}
                                disabled={processingId === p.id}
                                className="flex-shrink-0 bg-admin-text text-admin-bg hover:bg-admin-text/90 disabled:animate-pulse disabled:opacity-60"
                            >
                                <UserCheck
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />

                                {processingId === p.id
                                    ? t(
                                          'preinscriptions_admin.approbation_en_cours',
                                          'Approbation…',
                                      )
                                    : t(
                                          'preinscriptions_admin.approuver',
                                          'Approuver',
                                      )}
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}