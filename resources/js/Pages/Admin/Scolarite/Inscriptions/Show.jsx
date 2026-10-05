import { Link, router } from '@inertiajs/react';
import { FileText, PencilLine, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '../../../../Components/Layout/AdminLayout';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../Components/ui/avatar';
import { Button } from '../../../../Components/ui/button';
import { Select } from '../../../../Components/ui/select';
import { Textarea } from '../../../../Components/ui/textarea';

function formatDate(value) {
    if (!value) return null;
    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

const STATUT_LABELS = {
    brouillon: 'Brouillon',
    en_attente: 'Soumis',
    en_cours_examen: "En cours d'examen",
    a_completer: 'À compléter',
    validee: 'Validée',
    annulee: 'Refusée',
};

const TYPE_LABELS = { reinscription: 'Réinscription', redoublement: 'Redoublant' };

const DOCUMENTS = [
    ['releve_notes_path', "Relevé de notes de l'année précédente"],
    ['piece_supplementaire_path', 'Pièce complémentaire'],
];

export default function Show({ inscription, classes }) {
    const [processing, setProcessing] = useState(false);
    const [panel, setPanel] = useState(null); // null | 'refuse' | 'correction' | 'approve'
    const [motif, setMotif] = useState('');
    const [commentaire, setCommentaire] = useState('');
    const [classeId, setClasseId] = useState('');

    const isActive = ['en_attente', 'en_cours_examen', 'a_completer'].includes(inscription.statut);
    const user = inscription.etudiant?.user;

    function approve() {
        if (!classeId) return;
        setProcessing(true);
        router.post(`/console/scolarite/inscriptions/${inscription.id}/approuver`, { classe_id: classeId }, { onFinish: () => setProcessing(false) });
    }

    function refuse() {
        setProcessing(true);
        router.post(`/console/scolarite/inscriptions/${inscription.id}/refuser`, { motif_refus: motif }, { onFinish: () => setProcessing(false) });
    }

    function requestCorrection() {
        if (!commentaire) return;
        setProcessing(true);
        router.post(`/console/scolarite/inscriptions/${inscription.id}/demander-correction`, { commentaire_correction: commentaire }, { onFinish: () => setProcessing(false) });
    }

    return (
        <AdminLayout title={user?.name ?? 'Dossier'}>
            <div className="mb-6 flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.avatar_path ? `/storage/${user.avatar_path}` : undefined} alt="" />
                    <AvatarFallback className="bg-admin-hover text-admin-text">{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-medium text-admin-text">
                        {TYPE_LABELS[inscription.type] ?? 'Saisie manuelle'} · {inscription.annee}
                    </p>
                    <p className="text-sm text-admin-text-secondary">
                        {inscription.numero_dossier ? `Dossier n° ${inscription.numero_dossier} · ` : ''}
                        {inscription.submitted_at ? `Déposé le ${formatDate(inscription.submitted_at)}` : `Créé le ${formatDate(inscription.created_at)}`}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-admin-border bg-admin-card p-5 lg:col-span-2">
                    <h2 className="mb-4 text-sm font-semibold text-admin-text">Dossier</h2>
                    <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="text-admin-muted">Étudiant</dt>
                            <dd className="font-medium text-admin-text">{user?.name} ({inscription.etudiant?.matricule})</dd>
                        </div>
                        <div>
                            <dt className="text-admin-muted">Statut</dt>
                            <dd className="font-medium text-admin-text">{STATUT_LABELS[inscription.statut]}</dd>
                        </div>
                        <div>
                            <dt className="text-admin-muted">Filière souhaitée</dt>
                            <dd className="font-medium text-admin-text">{inscription.filiere?.nom_fr ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-admin-muted">Niveau souhaité</dt>
                            <dd className="font-medium text-admin-text">{inscription.niveau_souhaite ?? '—'}</dd>
                        </div>
                        {inscription.classe && (
                            <div>
                                <dt className="text-admin-muted">Classe assignée</dt>
                                <dd className="font-medium text-admin-text">{inscription.classe.nom}</dd>
                            </div>
                        )}
                        {inscription.motif_refus && (
                            <div className="sm:col-span-2">
                                <dt className="text-admin-muted">Motif du refus</dt>
                                <dd className="font-medium text-admin-text">{inscription.motif_refus}</dd>
                            </div>
                        )}
                        {inscription.commentaire_correction && (
                            <div className="sm:col-span-2">
                                <dt className="text-admin-muted">Dernière demande de correction</dt>
                                <dd className="font-medium text-admin-text">{inscription.commentaire_correction}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                <div className="rounded-xl border border-admin-border bg-admin-card p-5">
                    <h2 className="mb-4 text-sm font-semibold text-admin-text">Pièces jointes</h2>
                    <div className="space-y-2">
                        {DOCUMENTS.map(([key, label]) =>
                            inscription[key] ? (
                                <a
                                    key={key}
                                    href={`/storage/${inscription[key]}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 rounded-lg border border-admin-border px-3 py-2 text-sm text-admin-text transition hover:bg-admin-hover"
                                >
                                    <FileText className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                                    {label}
                                </a>
                            ) : null,
                        )}
                        {DOCUMENTS.every(([key]) => !inscription[key]) && <p className="text-sm text-admin-muted">Aucune pièce jointe.</p>}
                    </div>
                </div>
            </div>

            {!isActive ? (
                <div className="mt-6 rounded-xl border border-admin-border bg-admin-card p-5 text-sm text-admin-text-secondary">
                    Ce dossier a déjà été traité ({STATUT_LABELS[inscription.statut]}).
                </div>
            ) : (
                <div className="mt-6 space-y-3 rounded-xl border border-admin-border bg-admin-card p-5">
                    {panel === 'refuse' && (
                        <div className="space-y-3">
                            <Textarea value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Motif du refus (optionnel, visible par l'étudiant)" />
                            <div className="flex gap-2">
                                <Button onClick={() => setPanel(null)} className="border border-admin-border bg-transparent text-admin-text hover:bg-admin-hover">Annuler</Button>
                                <Button onClick={refuse} disabled={processing} className="bg-red-600 text-white hover:bg-red-600/90">
                                    <UserX className="h-4 w-4" aria-hidden="true" /> Confirmer le refus
                                </Button>
                            </div>
                        </div>
                    )}

                    {panel === 'correction' && (
                        <div className="space-y-3">
                            <Textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Précisez ce qui doit être corrigé ou complété" />
                            <div className="flex gap-2">
                                <Button onClick={() => setPanel(null)} className="border border-admin-border bg-transparent text-admin-text hover:bg-admin-hover">Annuler</Button>
                                <Button onClick={requestCorrection} disabled={processing || !commentaire} className="bg-amber-600 text-white hover:bg-amber-600/90">
                                    <PencilLine className="h-4 w-4" aria-hidden="true" /> Envoyer la demande
                                </Button>
                            </div>
                        </div>
                    )}

                    {panel === 'approve' && (
                        <div className="space-y-3">
                            <Select value={classeId} onChange={(e) => setClasseId(e.target.value)} className="w-full">
                                <option value="">Assigner une classe…</option>
                                {classes.map((c) => (
                                    <option key={c.id} value={c.id}>{c.nom} ({c.niveau}, {c.annee})</option>
                                ))}
                            </Select>
                            <div className="flex gap-2">
                                <Button onClick={() => setPanel(null)} className="border border-admin-border bg-transparent text-admin-text hover:bg-admin-hover">Annuler</Button>
                                <Button onClick={approve} disabled={processing || !classeId} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                                    <UserCheck className="h-4 w-4" aria-hidden="true" /> Confirmer la validation
                                </Button>
                            </div>
                        </div>
                    )}

                    {panel === null && (
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={() => setPanel('correction')} className="border border-admin-border bg-transparent text-admin-text hover:bg-admin-hover">
                                <PencilLine className="h-4 w-4" aria-hidden="true" /> Demander une correction
                            </Button>
                            <Button onClick={() => setPanel('refuse')} className="border border-admin-border bg-transparent text-admin-text hover:bg-admin-hover">
                                <UserX className="h-4 w-4" aria-hidden="true" /> Refuser
                            </Button>
                            <Button onClick={() => setPanel('approve')} className="bg-admin-text text-admin-bg hover:bg-admin-text/90">
                                <UserCheck className="h-4 w-4" aria-hidden="true" /> Valider
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <Link href="/console/scolarite/inscriptions" className="mt-4 inline-block text-sm text-admin-text-secondary hover:underline">
                ← Retour à la liste
            </Link>
        </AdminLayout>
    );
}
