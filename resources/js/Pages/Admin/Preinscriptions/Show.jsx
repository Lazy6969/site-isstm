import { Link, router } from '@inertiajs/react';
import { FileText, PencilLine, UserCheck, UserX } from 'lucide-react';
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
    ['civilite', 'Civilité', 'preinscriptions_admin.field_civilite'],
    ['nom', 'Nom', 'admin.common.name'],
    ['prenoms', 'Prénoms', 'preinscriptions_admin.field_prenoms'],
    ['sexe', 'Sexe', 'preinscriptions_admin.field_sexe'],
    ['date_naissance', 'Date de naissance', 'preinscriptions_admin.field_date_naissance'],
    ['lieu_naissance', 'Lieu de naissance', 'preinscriptions_admin.field_lieu_naissance'],
    ['cin', 'CIN (numéro)', 'preinscriptions_admin.field_cin'],
    ['nationalite', 'Nationalité', 'preinscriptions_admin.field_nationalite'],
    ['annee_bacc', 'Année du bac', 'preinscriptions_admin.field_annee_bacc'],
    ['serie_bacc', 'Série du bac', 'preinscriptions_admin.field_serie_bacc'],
    ['mention_bacc', 'Mention', 'preinscriptions_admin.field_mention_bacc'],
    ['adresse', 'Adresse', 'preinscriptions_admin.field_adresse'],
    ['telephone', 'Téléphone', 'preinscriptions_admin.field_telephone'],
    ['email', 'E-mail', 'admin.common.email'],
    ['pays', 'Pays', 'preinscriptions_admin.field_pays'],
    ['niveau', 'Niveau', 'preinscriptions_admin.field_niveau'],
    ['nom_pere', 'Nom du père', 'preinscriptions_admin.field_nom_pere'],
    ['nom_mere', 'Nom de la mère', 'preinscriptions_admin.field_nom_mere'],
    ['contact_parents', 'Téléphone des parents', 'preinscriptions_admin.field_contact_parents'],
    ['repondant_nom', 'Nom du répondant', 'preinscriptions_admin.field_repondant_nom'],
    ['repondant_lien', 'Lien avec le candidat', 'preinscriptions_admin.field_repondant_lien'],
    ['repondant_telephone', 'Téléphone du répondant', 'preinscriptions_admin.field_repondant_telephone'],
];

const DOCUMENTS = [
    ['photo_path', "Photo d'identité", 'preinscriptions_admin.doc_photo'],
    ['cin_recto_path', 'CIN recto', 'preinscriptions_admin.doc_cin_recto'],
    ['cin_verso_path', 'CIN verso', 'preinscriptions_admin.doc_cin_verso'],
    ['diplome_attestation_path', 'Diplôme ou attestation', 'preinscriptions_admin.doc_diplome'],
    ['releve_bacc_path', 'Relevé de notes', 'preinscriptions_admin.doc_releve'],
];

export default function Show({ preinscription }) {
    const { t } = useTranslations();
    const [processing, setProcessing] = useState(false);
    const [panel, setPanel] = useState(null); // null | 'refuse' | 'correction'
    const [motif, setMotif] = useState('');
    const [commentaire, setCommentaire] = useState('');

    const isDecided = !['en_attente', 'en_cours_examen', 'a_completer'].includes(preinscription.status);

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

    function requestCorrection() {
        if (!commentaire) return;
        setProcessing(true);
        router.post(
            `/console/preinscriptions/${preinscription.id}/demander-correction`,
            { commentaire_correction: commentaire },
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
                        {preinscription.numero_dossier ? `${preinscription.numero_dossier} · ` : ''}
                        {t('preinscriptions_admin.deposee_le', 'Déposée le')} {formatDate(preinscription.submitted_at ?? preinscription.created_at)}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-admin-border bg-admin-card p-5 lg:col-span-2">
                    <h2 className="mb-4 text-sm font-semibold text-admin-text">{t('preinscriptions_admin.identite', 'Identité et dossier')}</h2>
                    <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                        {FIELDS.map(([key, label, i18nKey]) => {
                            const value = preinscription[key];
                            if (!value) return null;
                            return (
                                <div key={key}>
                                    <dt className="text-admin-muted">{t(i18nKey, label)}</dt>
                                    <dd className="font-medium text-admin-text">{value}</dd>
                                </div>
                            );
                        })}
                    </dl>
                </div>

                <div className="rounded-xl border border-admin-border bg-admin-card p-5">
                    <h2 className="mb-4 text-sm font-semibold text-admin-text">{t('preinscriptions_admin.pieces', 'Pièces jointes')}</h2>
                    <div className="grid grid-cols-2 gap-3">
                        {DOCUMENTS.map(([key, defaultLabel, i18nKey]) => {
                            const label = t(i18nKey, defaultLabel);
                            const path = preinscription[key];
                            if (!path) {
                                return (
                                    <div key={key} className="flex flex-col items-center gap-1.5">
                                        <div className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-admin-border text-xs text-admin-muted">
                                            {t('preinscriptions_admin.non_fourni', 'Non fourni')}
                                        </div>
                                        <p className="text-center text-xs text-admin-muted">{label}</p>
                                    </div>
                                );
                            }

                            const url = `/storage/${path}`;
                            const isPdf = /\.pdf$/i.test(path);

                            return (
                                <div key={key} className="flex flex-col items-center gap-1.5">
                                    {isPdf ? (
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex h-24 w-full flex-col items-center justify-center gap-1 rounded-lg border border-admin-border bg-admin-hover text-admin-text transition hover:brightness-95"
                                        >
                                            <FileText className="h-6 w-6" aria-hidden="true" />
                                            <span className="text-xs font-medium">{t('preinscriptions_admin.voir_pdf', 'Voir le PDF')}</span>
                                        </a>
                                    ) : (
                                        <a href={url} target="_blank" rel="noreferrer" className="block h-24 w-full overflow-hidden rounded-lg border border-admin-border">
                                            <img src={url} alt={label} className="h-full w-full object-cover" />
                                        </a>
                                    )}
                                    <p className="text-center text-xs text-admin-muted">{label}</p>
                                </div>
                            );
                        })}
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
                    {panel === 'refuse' && (
                        <div className="flex-1 space-y-3">
                            <Textarea
                                value={motif}
                                onChange={(e) => setMotif(e.target.value)}
                                placeholder={t('preinscriptions_admin.motif_placeholder', 'Motif du refus (optionnel, visible par le candidat)')}
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setPanel(null)}
                                    className="border border-admin-border bg-transparent text-admin-text hover:bg-admin-hover"
                                >
                                    {t('admin.common.cancel', 'Annuler')}
                                </Button>
                                <Button onClick={refuse} disabled={processing} className="bg-red-600 text-white hover:bg-red-600/90">
                                    <UserX className="h-4 w-4" aria-hidden="true" />
                                    {t('preinscriptions_admin.confirmer_refus', 'Confirmer le refus')}
                                </Button>
                            </div>
                        </div>
                    )}

                    {panel === 'correction' && (
                        <div className="flex-1 space-y-3">
                            <Textarea
                                value={commentaire}
                                onChange={(e) => setCommentaire(e.target.value)}
                                placeholder={t('preinscriptions_admin.correction_placeholder', 'Précisez ce qui doit être corrigé ou complété')}
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => setPanel(null)}
                                    className="border border-admin-border bg-transparent text-admin-text hover:bg-admin-hover"
                                >
                                    {t('preinscriptions_admin.annuler', 'Annuler')}
                                </Button>
                                <Button onClick={requestCorrection} disabled={processing || !commentaire} className="bg-amber-600 text-white hover:bg-amber-600/90">
                                    <PencilLine className="h-4 w-4" aria-hidden="true" />
                                    {t('preinscriptions_admin.envoyer_correction', 'Envoyer la demande')}
                                </Button>
                            </div>
                        </div>
                    )}

                    {panel === null && (
                        <>
                            <Button
                                onClick={() => setPanel('correction')}
                                disabled={processing}
                                className="border border-admin-border bg-transparent text-admin-text hover:bg-admin-hover"
                            >
                                <PencilLine className="h-4 w-4" aria-hidden="true" />
                                {t('preinscriptions_admin.demander_correction', 'Demander une correction')}
                            </Button>
                            <Button
                                onClick={() => setPanel('refuse')}
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
