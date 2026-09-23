import { Link, router } from '@inertiajs/react';
import { FileText, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import { Avatar, AvatarFallback, AvatarImage } from '../../../Components/ui/avatar';
import { Button } from '../../../Components/ui/button';
import { Textarea } from '../../../Components/ui/textarea';
import { useTranslations } from '../../../lib/useTranslations';

function formatDate(value) {
    if (!value) return null;
    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

const FIELDS = [
    ['nom', 'Nom'],
    ['prenoms', 'Prénoms'],
    ['sexe', 'Sexe'],
    ['date_naissance', 'Date de naissance'],
    ['lieu_naissance', 'Lieu de naissance'],
    ['cin', 'CIN'],
    ['nationalite', 'Nationalité'],
    ['annee_bacc', 'Année du bac'],
    ['serie_bacc', 'Série du bac'],
    ['mention_bacc', 'Mention'],
    ['adresse', 'Adresse'],
    ['telephone', 'Téléphone'],
    ['email', 'E-mail'],
    ['pays', 'Pays'],
    ['niveau', 'Niveau'],
];

const DOCUMENTS = [
    ['photo_path', 'Photo'],
    ['releve_bacc_path', 'Relevé du bac'],
    ['cin_document_path', 'CIN'],
];

export default function Show({ preinscription }) {
    const { t } = useTranslations();
    const [processing, setProcessing] = useState(false);
    const [showRefuse, setShowRefuse] = useState(false);
    const [motif, setMotif] = useState('');

    const isDecided = preinscription.status !== 'en_attente';

    function approve() {
        if (!window.confirm(t('preinscriptions_admin.confirmer_approbation', 'Créer le compte étudiant pour cette préinscription ?'))) {
            return;
        }

        setProcessing(true);
        router.post(`/console/preinscriptions/${preinscription.id}/approve`, {}, { onFinish: () => setProcessing(false) });
    }

    function refuse() {
        setProcessing(true);
        router.post(
            `/console/preinscriptions/${preinscription.id}/refuse`,
            { motif_refus: motif },
            { onFinish: () => setProcessing(false) },
        );
    }

    return (
        <AdminLayout title={`${preinscription.nom} ${preinscription.prenoms}`}>
            <div className="mb-6 flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={preinscription.photo_path ? `/storage/${preinscription.photo_path}` : undefined} alt="" />
                    <AvatarFallback className="bg-admin-hover text-admin-text">{preinscription.nom?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-medium text-admin-text">
                        {preinscription.filiere?.nom_fr} · {preinscription.niveau}
                    </p>
                    <p className="text-sm text-admin-text-secondary">
                        {t('preinscriptions_admin.deposee_le', 'Déposée le')} {formatDate(preinscription.created_at)}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-admin-border bg-admin-card p-5 lg:col-span-2">
                    <h2 className="mb-4 text-sm font-semibold text-admin-text">{t('preinscriptions_admin.identite', 'Identité et dossier')}</h2>
                    <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                        {FIELDS.map(([key, label]) => {
                            const value = preinscription[key];
                            if (!value) return null;
                            return (
                                <div key={key}>
                                    <dt className="text-admin-muted">{label}</dt>
                                    <dd className="font-medium text-admin-text">{value}</dd>
                                </div>
                            );
                        })}
                    </dl>
                </div>

                <div className="rounded-xl border border-admin-border bg-admin-card p-5">
                    <h2 className="mb-4 text-sm font-semibold text-admin-text">{t('preinscriptions_admin.pieces', 'Pièces jointes')}</h2>
                    <div className="space-y-2">
                        {DOCUMENTS.map(([key, label]) =>
                            preinscription[key] ? (
                                <a
                                    key={key}
                                    href={`/storage/${preinscription[key]}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 rounded-lg border border-admin-border px-3 py-2 text-sm text-admin-text transition hover:bg-admin-hover"
                                >
                                    <FileText className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                    {label}
                                </a>
                            ) : null,
                        )}
                    </div>
                </div>
            </div>

            {isDecided ? (
                <div className="mt-6 rounded-xl border border-admin-border bg-admin-card p-5 text-sm text-admin-text-secondary">
                    {preinscription.status === 'approuve' &&
                        t('preinscriptions_admin.deja_acceptee', 'Ce dossier a déjà été accepté.')}
                    {preinscription.status === 'refuse' && (
                        <>
                            {t('preinscriptions_admin.deja_refusee', 'Ce dossier a été refusé.')}
                            {preinscription.motif_refus && <p className="mt-2">{preinscription.motif_refus}</p>}
                        </>
                    )}
                </div>
            ) : (
                <div className="mt-6 flex flex-col gap-3 rounded-xl border border-admin-border bg-admin-card p-5 sm:flex-row sm:items-start sm:justify-between">
                    {showRefuse ? (
                        <div className="flex-1 space-y-3">
                            <Textarea
                                value={motif}
                                onChange={(e) => setMotif(e.target.value)}
                                placeholder={t('preinscriptions_admin.motif_placeholder', 'Motif du refus (optionnel, visible par le candidat)')}
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setShowRefuse(false)}
                                    className="border border-admin-border bg-transparent text-admin-text hover:bg-admin-hover"
                                >
                                    {t('preinscriptions_admin.annuler', 'Annuler')}
                                </Button>
                                <Button onClick={refuse} disabled={processing} className="bg-red-600 text-white hover:bg-red-600/90">
                                    <UserX className="h-4 w-4" aria-hidden="true" />
                                    {t('preinscriptions_admin.confirmer_refus', 'Confirmer le refus')}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Button
                                onClick={() => setShowRefuse(true)}
                                disabled={processing}
                                className="border border-admin-border bg-transparent text-admin-text hover:bg-admin-hover"
                            >
                                <UserX className="h-4 w-4" aria-hidden="true" />
                                {t('preinscriptions_admin.refuser', 'Refuser')}
                            </Button>
                            <Button onClick={approve} disabled={processing} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                                <UserCheck className="h-4 w-4" aria-hidden="true" />
                                {t('preinscriptions_admin.approuver', 'Accepter')}
                            </Button>
                        </>
                    )}
                </div>
            )}

            <Link href="/console/preinscriptions" className="mt-4 inline-block text-sm text-admin-text-secondary hover:underline">
                {t('preinscriptions_admin.retour_liste', '← Retour à la liste')}
            </Link>
        </AdminLayout>
    );
}
