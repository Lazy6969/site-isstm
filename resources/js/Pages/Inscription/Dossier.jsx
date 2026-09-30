import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, ClipboardCheck, PencilLine, Repeat, RotateCcw, Save, Send, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import BackButton from '../../Components/Layout/BackButton';
import Footer from '../../Components/Home/Footer';
import SelectField from '../../Components/Form/SelectField';
import FileInput from '../../Components/Form/FileInput';
import { Card } from '../../Components/ui/card';
import InscriptionChoices from '../../Components/Preinscription/InscriptionChoices';
import EditableText from '../../Components/QuickEdit/EditableText';
import BannerBackground from '../../Components/QuickEdit/BannerBackground';

const STATUS_LABELS = {
    brouillon: 'Brouillon',
    en_attente: 'Soumis',
    en_cours_examen: "En cours d'examen",
    a_completer: 'À compléter',
    validee: 'Validée',
    annulee: 'Refusée',
};

export default function Dossier({ content, filieres, inscription, suggestedType }) {
    // Aliased: this page's own `content` prop is the dossier's function
    // parameter — `siteContent` avoids shadowing it with the shared banner data.
    const { flash, content: siteContent } = usePage().props;
    const [consent, setConsent] = useState(false);
    const [consentError, setConsentError] = useState('');
    const [errorModal, setErrorModal] = useState('');
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        type: inscription.type ?? suggestedType ?? '',
        filiere_id: inscription.filiere_id ? String(inscription.filiere_id) : '',
        niveau_souhaite: inscription.niveau_souhaite ?? '',
        releve_notes: null,
        piece_supplementaire: null,
    });

    useEffect(() => {
        if (flash?.error) setErrorModal(flash.error);
    }, [flash?.error]);

    const selectedFiliere = useMemo(() => filieres.find((f) => String(f.id) === String(data.filiere_id)), [filieres, data.filiere_id]);
    const niveaux = useMemo(() => (selectedFiliere?.niveaux ? selectedFiliere.niveaux.split(',') : []), [selectedFiliere]);

    const isEditable = ['brouillon', 'a_completer'].includes(inscription.statut);
    const needsCorrection = inscription.statut === 'a_completer';

    function onFileChange(field) {
        return (e) => setData(field, e.target.files[0] ?? null);
    }

    function saveDraft() {
        router.patch(`/reinscription/${inscription.id}/brouillon`, data, { preserveScroll: true });
    }

    function submit(e) {
        e.preventDefault();

        const missing = {};
        if (!data.type) missing.type = 'Choisissez le type de dossier.';
        if (!data.filiere_id) missing.filiere_id = 'Choisissez une filière.';
        if (!data.niveau_souhaite) missing.niveau_souhaite = 'Choisissez un niveau.';
        clearErrors();
        for (const [field, message] of Object.entries(missing)) setError(field, message);
        if (Object.keys(missing).length > 0) return;

        if (!consent) {
            const message = 'Vous devez accepter le traitement de vos données pour envoyer votre dossier.';
            setConsentError(message);
            setErrorModal(message);
            return;
        }
        setConsentError('');

        post(`/reinscription/${inscription.id}/soumettre`, {
            forceFormData: true,
            onError: (serverErrors) => {
                const count = Object.keys(serverErrors).length;
                if (count > 0) setErrorModal(`${count} champ(s) du formulaire doivent être corrigés avant l'envoi.`);
            },
        });
    }

    const existingFiles = {
        releve_notes: inscription.releve_notes_path ? 'Fichier déjà envoyé ✓' : null,
        piece_supplementaire: inscription.piece_supplementaire_path ? 'Fichier déjà envoyé ✓' : null,
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Réinscription" />
            <SiteHeader />

            <div className="relative overflow-hidden bg-isstm-navy py-8 text-white sm:py-10">
                <BannerBackground contentKey="reinscription_banniere_image_path" />
                <div className="relative z-10 mx-auto max-w-5xl px-6">
                    <BackButton />
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        <EditableText as="span" contentKey="reinscription_titre">
                            {siteContent.reinscription_titre ?? 'Réinscription et redoublement'}
                        </EditableText>
                    </h1>
                    <p className="mt-2 text-white/80">
                        <EditableText as="span" contentKey="reinscription_soustitre">
                            {siteContent.reinscription_soustitre ??
                                "Étudiant déjà inscrit ? Soumettez votre dossier de réinscription ou de redoublement pour l'année en cours."}
                        </EditableText>
                    </p>
                    {inscription.numero_dossier && <p className="mt-1 text-sm font-medium text-isstm-gold">Dossier n° {inscription.numero_dossier}</p>}
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-6 py-10">
                {flash?.error && (
                    <p className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-500/15 dark:text-red-400">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        {flash.error}
                    </p>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
                    <InscriptionChoices active={data.type || null} content={content} showChoices />

                    <div>
                        {!isEditable && (
                            <Card className="mb-6 flex items-center gap-3 p-5">
                                <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" aria-hidden="true" />
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    Votre dossier est <strong>{STATUS_LABELS[inscription.statut]}</strong> — il n'est plus modifiable.
                                </p>
                            </Card>
                        )}

                        {needsCorrection && (
                            <Card className="mb-6 flex items-start gap-3 border-amber-200 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
                                <PencilLine className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                                <div>
                                    <p className="font-medium text-amber-800 dark:text-amber-300">La scolarité demande une correction</p>
                                    {inscription.commentaire_correction && (
                                        <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">{inscription.commentaire_correction}</p>
                                    )}
                                </div>
                            </Card>
                        )}

                        <form onSubmit={submit} encType="multipart/form-data">
                            <Card className="p-6">
                                <h2 className="mb-4 flex items-center gap-2 font-semibold text-isstm-navy dark:text-white">
                                    <ClipboardCheck className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                                    Type de dossier
                                </h2>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <label
                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                                            data.type === 'reinscription'
                                                ? 'border-isstm-navy bg-isstm-navy/5 dark:border-isstm-gold dark:bg-isstm-gold/10'
                                                : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <input type="radio" name="type" value="reinscription" checked={data.type === 'reinscription'} onChange={() => isEditable && setData('type', 'reinscription')} disabled={!isEditable} className="sr-only" />
                                        <Repeat className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-white">Réinscription</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Passage à l'année supérieure</p>
                                        </div>
                                    </label>
                                    <label
                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                                            data.type === 'redoublement'
                                                ? 'border-isstm-navy bg-isstm-navy/5 dark:border-isstm-gold dark:bg-isstm-gold/10'
                                                : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <input type="radio" name="type" value="redoublement" checked={data.type === 'redoublement'} onChange={() => isEditable && setData('type', 'redoublement')} disabled={!isEditable} className="sr-only" />
                                        <RotateCcw className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-white">Redoublant</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Reprise de la même année</p>
                                        </div>
                                    </label>
                                </div>
                                {errors.type && <p className="mt-2 text-sm text-red-600">{errors.type}</p>}

                                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <SelectField
                                        id="filiere_id"
                                        label="Filière"
                                        value={data.filiere_id}
                                        onChange={(e) => { setData('filiere_id', e.target.value); setData('niveau_souhaite', ''); }}
                                        error={errors.filiere_id}
                                        required
                                        disabled={!isEditable}
                                    >
                                        <option value="" disabled>Choisir…</option>
                                        {filieres.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
                                    </SelectField>
                                    <SelectField id="niveau_souhaite" label="Niveau souhaité" value={data.niveau_souhaite} onChange={(e) => setData('niveau_souhaite', e.target.value)} error={errors.niveau_souhaite} required disabled={!isEditable || niveaux.length === 0}>
                                        <option value="" disabled>{niveaux.length ? 'Choisir…' : "Choisissez d'abord une filière"}</option>
                                        {niveaux.map((n) => <option key={n} value={n}>{n}</option>)}
                                    </SelectField>
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FileInput id="releve_notes" label="Relevé de notes de l'année précédente" file={data.releve_notes} existingLabel={existingFiles.releve_notes} onChange={onFileChange('releve_notes')} error={errors.releve_notes} />
                                    <FileInput id="piece_supplementaire" label="Pièce complémentaire (facultatif)" file={data.piece_supplementaire} existingLabel={existingFiles.piece_supplementaire} onChange={onFileChange('piece_supplementaire')} error={errors.piece_supplementaire} required={false} />
                                </div>
                                <p className="mt-2 text-xs text-slate-400">JPG, PNG, WebP ou PDF (5 Mo maximum par fichier).</p>

                                {isEditable && (
                                    <>
                                        <label className="mt-6 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <input
                                                type="checkbox"
                                                checked={consent}
                                                onChange={(e) => { setConsent(e.target.checked); if (e.target.checked) setConsentError(''); }}
                                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-isstm-navy focus:ring-isstm-navy/30"
                                            />
                                            J&apos;accepte le traitement de mes données pour l&apos;étude de mon dossier. <span className="text-red-500">*</span>
                                        </label>
                                        {consentError && <p className="mt-1 text-sm text-red-600">{consentError}</p>}

                                        <div className="mt-6 flex flex-wrap justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={saveDraft}
                                                className="flex items-center gap-1.5 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-300"
                                            >
                                                <Save className="h-4 w-4" aria-hidden="true" />
                                                Enregistrer le brouillon
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <Send className="h-4 w-4" aria-hidden="true" />
                                                {processing ? 'Envoi en cours…' : 'Soumettre mon dossier'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </Card>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />

            {errorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" onClick={() => setErrorModal('')}>
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl dark:bg-slate-800" onClick={(e) => e.stopPropagation()}>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/15">
                            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                        </div>
                        <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">Votre dossier n'a pas pu être envoyé</h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{errorModal}</p>
                        <button type="button" onClick={() => setErrorModal('')} className="mt-5 w-full rounded-full bg-isstm-navy py-2.5 text-sm font-semibold text-white transition hover:brightness-110">
                            Corriger
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
