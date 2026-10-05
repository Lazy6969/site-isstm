import { router } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Avatar, AvatarFallback } from '../../../Components/ui/avatar';
import { Button } from '../../../Components/ui/button';
import { Textarea } from '../../../Components/ui/textarea';
import { useTranslations } from '../../../lib/useTranslations';

const STATUS_BADGE = {
    en_attente: { label: 'En attente', className: 'bg-admin-hover text-admin-text-secondary' },
    approuvee: { label: 'Approuvée', className: 'bg-emerald-500/15 text-emerald-600' },
    refusee: { label: 'Refusée', className: 'bg-red-500/15 text-red-600' },
};

function formatDate(value) {
    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function ReactivationRow({ reactivation }) {
    const [refusing, setRefusing] = useState(false);
    const [motif, setMotif] = useState('');
    const [processing, setProcessing] = useState(false);
    const status = STATUS_BADGE[reactivation.status] ?? STATUS_BADGE.en_attente;
    const pending = reactivation.status === 'en_attente';

    function approve() {
        setProcessing(true);
        router.post(
            `/console/reactivations/${reactivation.id}/approuver`,
            {},
            { preserveScroll: true, onFinish: () => setProcessing(false) },
        );
    }

    function refuse() {
        setProcessing(true);
        router.post(
            `/console/reactivations/${reactivation.id}/refuser`,
            { motif_refus: motif },
            { preserveScroll: true, onFinish: () => setProcessing(false), onSuccess: () => setRefusing(false) },
        );
    }

    return (
        <div className="rounded-xl border border-admin-border bg-admin-card p-5">
            <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-5">
                <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarFallback className="bg-admin-hover text-admin-text">{reactivation.user?.name?.[0]}</AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-medium text-admin-text">
                        {reactivation.user?.name}
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${status.className}`}>{status.label}</span>
                    </p>
                    <p className="truncate text-sm text-admin-text-secondary">{reactivation.user?.email}</p>
                    <p className="mt-0.5 text-xs text-admin-muted">
                        Demandé le {formatDate(reactivation.created_at)}
                        {!pending && reactivation.reviewed_at && ` · Traité le ${formatDate(reactivation.reviewed_at)}`}
                        {!pending && reactivation.reviewer && ` par ${reactivation.reviewer.name}`}
                    </p>
                    {reactivation.status === 'refusee' && reactivation.motif_refus && (
                        <p className="mt-1 text-sm text-red-600">Motif : {reactivation.motif_refus}</p>
                    )}
                </div>

                {pending && !refusing && (
                    <div className="flex flex-shrink-0 gap-2">
                        <Button
                            onClick={() => setRefusing(true)}
                            disabled={processing}
                            className="border border-red-200 bg-transparent text-red-600 hover:bg-red-50"
                        >
                            <X className="h-4 w-4" aria-hidden="true" />
                            Refuser
                        </Button>
                        <Button onClick={approve} disabled={processing} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                            <Check className="h-4 w-4" aria-hidden="true" />
                            Approuver
                        </Button>
                    </div>
                )}
            </div>

            {pending && refusing && (
                <div className="mt-4 space-y-2 border-t border-admin-border pt-4">
                    <Textarea
                        value={motif}
                        onChange={(e) => setMotif(e.target.value)}
                        placeholder="Motif du refus (optionnel)"
                        rows={3}
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setRefusing(false)} className="bg-admin-hover text-admin-text hover:bg-admin-hover/70">
                            Annuler
                        </Button>
                        <Button onClick={refuse} disabled={processing} className="bg-red-600 text-white hover:bg-red-700">
                            Confirmer le refus
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Index({ reactivations }) {
    const { t } = useTranslations();
    const pendingCount = reactivations.filter((r) => r.status === 'en_attente').length;

    return (
        <AdminLayout title={t('reactivations_admin.titre', 'Réactivations de compte')}>
            <p className="-mt-4 mb-6 text-sm text-admin-text-secondary">
                {pendingCount} {t('reactivations_admin.a_traiter', 'demande(s) à traiter.')}
            </p>

            {reactivations.length === 0 ? (
                <div className="rounded-xl border border-admin-border bg-admin-card p-8 text-center text-sm text-admin-muted">
                    {t('reactivations_admin.aucune', 'Aucune demande de réactivation pour le moment.')}
                </div>
            ) : (
                <div className="space-y-3">
                    {reactivations.map((reactivation) => (
                        <ReactivationRow key={reactivation.id} reactivation={reactivation} />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
