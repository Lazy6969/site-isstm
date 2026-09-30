import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, CalendarClock, Check, CheckCircle2, ClipboardCheck, GraduationCap, IdCard, Mail, Save, Send, Users, Wallet, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import BackButton from '../../Components/Layout/BackButton';
import Footer from '../../Components/Home/Footer';
import TextField from '../../Components/Form/TextField';
import SelectField from '../../Components/Form/SelectField';
import FileInput from '../../Components/Form/FileInput';
import { Card } from '../../Components/ui/card';
import EditableText from '../../Components/QuickEdit/EditableText';
import BannerBackground from '../../Components/QuickEdit/BannerBackground';
import { countries, mentionsBacc, nationalites, seriesBacc } from '../../Components/Preinscription/countries';
import { useTranslations } from '../../lib/useTranslations';

function draftToForm(draft) {
    return {
        civilite: draft?.civilite ?? '',
        sexe: draft?.sexe ?? '',
        prenoms: draft?.prenoms ?? '',
        nom: draft?.nom ?? '',
        date_naissance: draft?.date_naissance ?? '',
        lieu_naissance: draft?.lieu_naissance ?? '',
        nationalite: draft?.nationalite ?? '',
        pays: draft?.pays ?? '',
        cin: draft?.cin ?? '',
        email: draft?.email ?? '',
        telephone: draft?.telephone ?? '',
        adresse: draft?.adresse ?? '',
        nom_pere: draft?.nom_pere ?? '',
        nom_mere: draft?.nom_mere ?? '',
        contact_parents: draft?.contact_parents ?? '',
        repondant_nom: draft?.repondant_nom ?? '',
        repondant_lien: draft?.repondant_lien ?? '',
        repondant_telephone: draft?.repondant_telephone ?? '',
        annee_bacc: draft?.annee_bacc ?? '',
        serie_bacc: draft?.serie_bacc ?? '',
        serie_bacc_autre: draft?.serie_bacc_autre ?? '',
        mention_bacc: draft?.mention_bacc ?? '',
        code_redoublement: draft?.code_redoublement ?? '',
        filiere_id: draft?.filiere_id ? String(draft.filiere_id) : '',
        niveau: draft?.niveau ?? '',
        photo: null,
        cin_recto: null,
        cin_verso: null,
        diplome_attestation: null,
        releve_bacc: null,
    };
}

const STEPS = [
    { key: 'identite', label: 'Identité', icon: IdCard },
    { key: 'famille', label: 'Famille', icon: Users },
    { key: 'formation', label: 'Formation', icon: GraduationCap },
    { key: 'validation', label: 'Validation', icon: ClipboardCheck },
];

// Every field the server can reject must be listed here, otherwise an error on a
// missing field leaves the candidate on a step where nothing looks wrong.
const STEP_FIELDS = {
    identite: ['civilite', 'sexe', 'prenoms', 'nom', 'date_naissance', 'lieu_naissance', 'nationalite', 'pays', 'cin', 'email', 'telephone', 'adresse'],
    famille: ['nom_pere', 'nom_mere', 'contact_parents', 'repondant_nom', 'repondant_lien', 'repondant_telephone'],
    formation: ['annee_bacc', 'serie_bacc', 'serie_bacc_autre', 'mention_bacc', 'code_redoublement', 'filiere_id', 'niveau'],
    validation: ['photo', 'cin_recto', 'cin_verso', 'diplome_attestation', 'releve_bacc'],
};

function stepOfField(field) {
    return STEPS.find((s) => STEP_FIELDS[s.key].includes(field)) ?? STEPS[0];
}

// Used to name the offending fields when a step blocks. Without these, a
// blocked "Continuer" could only show an anonymous "Ce champ est requis."
// under one input — easy to miss when it sits below the fold.
const FIELD_LABELS = {
    civilite: 'Civilité',
    sexe: 'Genre',
    prenoms: 'Prénom(s)',
    nom: 'Nom',
    date_naissance: 'Date de naissance',
    lieu_naissance: 'Lieu de naissance',
    nationalite: 'Nationalité',
    pays: 'Pays de résidence',
    cin: 'CIN ou passeport',
    email: 'Adresse e-mail',
    telephone: 'Téléphone du candidat',
    adresse: 'Adresse complète',
    nom_pere: 'Nom complet du père',
    nom_mere: 'Nom complet de la mère',
    contact_parents: 'Téléphone des parents',
    repondant_nom: 'Nom complet du répondant',
    repondant_lien: 'Lien avec le candidat',
    repondant_telephone: 'Téléphone du répondant',
    annee_bacc: 'Année d’obtention du bac',
    serie_bacc: 'Série du bac',
    serie_bacc_autre: 'Précisez la série',
    mention_bacc: 'Mention',
    code_redoublement: 'Situation',
    filiere_id: 'Filière souhaitée',
    niveau: 'Niveau',
    photo: 'Photo d’identité',
    cin_recto: 'CIN recto',
    cin_verso: 'CIN verso',
    diplome_attestation: 'Diplôme ou attestation',
    releve_bacc: 'Relevé de notes',
};

function labelOf(field) {
    return FIELD_LABELS[field] ?? field;
}

/**
 * Brings a field into view and focuses it. Every input carries its field name
 * as `id`; the civilité/genre radios are addressed by `name` instead, since
 * each of their options owns a distinct id.
 */
function focusField(field) {
    const element = document.getElementById(field) ?? document.querySelector(`[name="${field}"]`);

    if (!element) {
        return;
    }

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.focus({ preventScroll: true });
}

function RadioGroup({ name, options, value, onChange, error, autoComplete }) {
    return (
        <div>
            <div className="grid grid-cols-3 gap-2">
                {options.map((opt) => (
                    <label
                        key={opt.value}
                        htmlFor={`${name}-${opt.value}`}
                        className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm transition ${
                            value === opt.value
                                ? 'border-isstm-navy bg-isstm-navy/5 font-semibold text-isstm-navy dark:border-isstm-gold dark:bg-isstm-gold/10 dark:text-isstm-gold'
                                : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                    >
                        <input
                            id={`${name}-${opt.value}`}
                            type="radio"
                            name={name}
                            value={opt.value}
                            checked={value === opt.value}
                            onChange={() => onChange(opt.value)}
                            autoComplete={autoComplete}
                            className="sr-only"
                        />
                        {opt.label}
                    </label>
                ))}
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}

export default function Create({ filieres, draft, initialStep }) {
    const { content, flash } = usePage().props;
    const { t } = useTranslations();
    const [draftId, setDraftId] = useState(draft?.id ?? null);
    const [step, setStep] = useState(initialStep);
    const [consent, setConsent] = useState(false);
    const [consentError, setConsentError] = useState('');
    // A single pop-up surfaces every outcome the candidate needs to see —
    // success (green) and failure (red) alike — instead of some messages
    // (like a flashed `status`) being silently dropped while only errors got shown.
    const [dialog, setDialog] = useState(null); // { type: 'success' | 'error', title?: string, message: string, onClose?: () => void }
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm(draftToForm(draft));

    function showError(message, title) {
        setDialog({ type: 'error', title, message });
    }

    function showSuccess(message, onClose) {
        setDialog({ type: 'success', message, onClose });
    }

    function closeDialog() {
        dialog?.onClose?.();
        setDialog(null);
    }

    // A failed submit (catch block in the controller) comes back as a full
    // page redirect with a flashed `error`, not an Inertia form error — catch
    // it here so it gets the same visible pop-up as a validation failure.
    //
    // Deliberately NOT watching `flash?.status` here: the server flashes
    // "Brouillon enregistré." on every /brouillon save, including the silent
    // autosave fired on each "Continuer" between steps — reacting to it would
    // pop up that message after every single step. Only the explicit
    // "Enregistrer le brouillon et continuer plus tard" action shows a success
    // pop-up, via its own direct showSuccess() call in saveAndLeave().
    useEffect(() => {
        if (flash?.error) showError(flash.error);
    }, [flash?.error]);

    // The dossier exists as soon as the account is created, so advancing is
    // driven by the `draft` prop rather than only by the create call's own
    // success callback: whichever way the page got here — Inertia visit, or a
    // full reload after the assets changed — the candidate lands on the step
    // after Identité instead of being dropped back onto it.
    useEffect(() => {
        if (draft?.id && draft.id !== draftId) {
            setDraftId(draft.id);
        }

        if (draft?.id && step === 'identite') {
            goTo('famille');
        }
    }, [draft?.id]);

    const dateLimite = content?.inscription_date_limite
        ? new Date(content.inscription_date_limite).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    const selectedFiliere = useMemo(() => filieres.find((f) => String(f.id) === String(data.filiere_id)), [filieres, data.filiere_id]);
    const niveaux = useMemo(() => (selectedFiliere?.niveaux ? selectedFiliere.niveaux.split(',') : []), [selectedFiliere]);

    const existingFiles = {
        photo: draft?.photo_path ? 'Fichier déjà envoyé ✓' : null,
        cin_recto: draft?.cin_recto_path ? 'Fichier déjà envoyé ✓' : null,
        cin_verso: draft?.cin_verso_path ? 'Fichier déjà envoyé ✓' : null,
        diplome_attestation: draft?.diplome_attestation_path ? 'Fichier déjà envoyé ✓' : null,
        releve_bacc: draft?.releve_bacc_path ? 'Fichier déjà envoyé ✓' : null,
    };

    function set(field) {
        return (e) => setData(field, e.target.value);
    }

    function onFileChange(field) {
        return (e) => setData(field, e.target.files[0] ?? null);
    }

    function goTo(target) {
        setStep(target);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * Marks up whatever the step is still missing and reports it, rather than
     * only returning a boolean: the caller needs the field names to tell the
     * candidate what to fix and where to look.
     *
     * Facultative fields (cin, série "Autre" unless selected, parent details
     * beyond the one required phone number) are never reported, so they never
     * hold up navigation. The server re-validates everything on final submit.
     *
     * @returns {{fields: string[], message: string|null}}
     */
    function validateStep(targetStep) {
        const missing = {};
        let customMessage = null;

        if (targetStep === 'identite') {
            const required = ['civilite', 'sexe', 'prenoms', 'nom', 'date_naissance', 'lieu_naissance', 'nationalite', 'pays', 'email', 'telephone', 'adresse'];
            for (const field of required) {
                if (!data[field]) missing[field] = 'Ce champ est requis.';
            }
        } else if (targetStep === 'famille') {
            if (!data.contact_parents && !data.repondant_telephone) {
                customMessage = 'Indiquez au moins un numéro joignable : téléphone des parents ou téléphone du répondant.';
                missing.contact_parents = customMessage;
                missing.repondant_telephone = customMessage;
            }
        } else if (targetStep === 'formation') {
            for (const field of ['annee_bacc', 'serie_bacc', 'mention_bacc', 'code_redoublement', 'filiere_id', 'niveau']) {
                if (!data[field]) missing[field] = 'Ce champ est requis.';
            }
            if (data.serie_bacc === 'AUTRE' && !data.serie_bacc_autre) {
                missing.serie_bacc_autre = 'Précisez la série.';
            }
        }

        for (const field of STEP_FIELDS[targetStep]) clearErrors(field);
        for (const [field, message] of Object.entries(missing)) setError(field, message);

        return { fields: Object.keys(missing), message: customMessage };
    }

    /**
     * Turns the blocked fields into one sentence naming them — the candidate
     * should never have to hunt for which input stopped them.
     */
    function blockedMessage({ fields, message }) {
        if (message) {
            return message;
        }

        if (fields.length === 1) {
            return `Le champ « ${labelOf(fields[0])} » doit être rempli pour continuer.`;
        }

        return `${fields.length} champs doivent être remplis pour continuer : ${fields.map(labelOf).join(', ')}.`;
    }

    function draftPayload() {
        const { nom, prenoms, civilite, sexe, email, ...rest } = data;
        return rest;
    }

    function next() {
        const currentIndex = STEPS.findIndex((s) => s.key === step);
        const blocked = validateStep(step);

        // Never fail silently: a blocked step used to return here with nothing
        // but a small red line under one input, which read as a dead button.
        if (blocked.fields.length > 0) {
            showError(blockedMessage(blocked));
            focusField(blocked.fields[0]);

            return;
        }

        if (step === 'identite' && !draftId) {
            // Advancing is handled by the `draft` effect above, so it happens
            // on a full reload too — not just when this callback runs.
            post('/preinscription/compte', {
                preserveState: true,
                preserveScroll: true,
                onError: (serverErrors) => {
                    if (serverErrors.email) {
                        showError(
                            "Cette adresse e-mail est déjà associée à un compte. Utilisez une autre adresse, ou connectez-vous si ce dossier est déjà le vôtre.",
                            'Adresse e-mail déjà utilisée',
                        );
                        focusField('email');
                        return;
                    }

                    showError('Impossible de créer votre compte. Vérifiez les champs indiqués.');
                },
            });
            return;
        }

        if (draftId) {
            router.patch(`/preinscription/${draftId}/brouillon`, draftPayload(), {
                preserveScroll: true,
                preserveState: true,
                onError: () => showError("Votre progression n'a pas pu être enregistrée. Vérifiez votre connexion et réessayez."),
            });
        }

        goTo(STEPS[currentIndex + 1].key);
    }

    function saveAndLeave() {
        if (!draftId) return;
        router.patch(`/preinscription/${draftId}/brouillon`, draftPayload(), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => showSuccess('Brouillon enregistré. Vous pouvez le reprendre à tout moment depuis « Mon dossier ».', () => router.visit('/mon-dossier')),
            onError: () => showError("Votre brouillon n'a pas pu être enregistré. Réessayez."),
        });
    }

    function submit(e) {
        e.preventDefault();

        if (!consent) {
            const message = 'Vous devez accepter le traitement de vos données pour envoyer votre dossier.';
            setConsentError(message);
            showError(message);
            return;
        }
        setConsentError('');

        post(`/preinscription/${draftId}/soumettre`, {
            forceFormData: true,
            onError: (serverErrors) => {
                const errorFields = Object.keys(serverErrors);
                if (errorFields.length === 0) return;

                // Jump to whichever step owns the *first* rejected field, so the
                // candidate always lands somewhere the error is actually visible —
                // never stuck on the last step looking at a form with no visible errors.
                const target = stepOfField(errorFields[0]);
                goTo(target.key);

                showError(
                    `À corriger à l’étape « ${target.label} » avant l’envoi : ${errorFields.map(labelOf).join(', ')}.`,
                );

                // The step only just changed, so the input isn't in the DOM yet.
                setTimeout(() => focusField(errorFields[0]), 0);
            },
        });
    }

    const currentStepIndex = STEPS.findIndex((s) => s.key === step);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Préinscription" />
            <SiteHeader />

            <div className="relative overflow-hidden bg-isstm-navy py-8 text-white sm:py-10">
                <BannerBackground contentKey="preinscription_banniere_image_path" />
                <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-6 px-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <BackButton />
                        <h1 className="text-2xl font-bold sm:text-3xl">
                            <EditableText as="span" contentKey="preinscription_titre">
                                {content.preinscription_titre ?? t('preinscription.titre', 'Votre dossier d’inscription')}
                            </EditableText>
                        </h1>
                        <p className="mt-2 text-white/80">
                            {draftId ? (
                                <EditableText as="span" contentKey="preinscription_soustitre_brouillon">
                                    {content.preinscription_soustitre_brouillon ??
                                        t(
                                            'preinscription.soustitre_brouillon',
                                            'Votre progression est enregistrée à chaque étape. Vous pouvez reprendre ce dossier plus tard depuis « Mon dossier ».',
                                        )}
                                </EditableText>
                            ) : (
                                <EditableText as="span" contentKey="preinscription_soustitre">
                                    {content.preinscription_soustitre ??
                                        t('preinscription.soustitre_form', 'Les champs avec un astérisque sont obligatoires. Créez votre compte candidat pour commencer.')}
                                </EditableText>
                            )}
                        </p>
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:items-end">
                        {dateLimite && (
                            <p className="flex items-center gap-2 text-sm text-white/80">
                                <CalendarClock className="h-4 w-4 flex-shrink-0 text-isstm-gold" aria-hidden="true" />
                                {t('preinscription.cloture', 'Clôture des dépôts')} : <strong className="text-white">{dateLimite}</strong>
                            </p>
                        )}
                        <a
                            href="/inscription"
                            className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                        >
                            <Wallet className="h-4 w-4" aria-hidden="true" />
                            {t('preinscription.voir_frais', 'Voir les frais')}
                        </a>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-6 py-10">
                {dialog && (
                    <p
                        className={`mb-6 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${
                            dialog.type === 'success'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                                : 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400'
                        }`}
                    >
                        {dialog.type === 'success' ? (
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        ) : (
                            <AlertTriangle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        )}
                        {dialog.message}
                    </p>
                )}

                <div>
                        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                            {STEPS.map((s, index) => {
                                const Icon = s.icon;
                                const done = index < currentStepIndex;
                                const active = index === currentStepIndex;
                                return (
                                    <div key={s.key} className="flex flex-1 flex-col items-center gap-1.5 text-center">
                                        <div
                                            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                                                done
                                                    ? 'bg-emerald-500 text-white'
                                                    : active
                                                      ? 'bg-isstm-navy text-white'
                                                      : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                                            }`}
                                        >
                                            {done ? <Check className="h-4 w-4" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
                                        </div>
                                        <span
                                            className={`text-xs font-medium ${
                                                active ? 'text-isstm-navy dark:text-white' : 'text-slate-400 dark:text-slate-500'
                                            }`}
                                        >
                                            {s.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {draftId && (
                            <div className="mb-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={saveAndLeave}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-isstm-navy dark:text-slate-400 dark:hover:text-white"
                                >
                                    <Save className="h-3.5 w-3.5" aria-hidden="true" />
                                    {t('preinscription.enregistrer_quitter', 'Enregistrer le brouillon et continuer plus tard')}
                                </button>
                            </div>
                        )}

                        <form onSubmit={submit} encType="multipart/form-data">
                            {step === 'identite' && (
                                <Card className="p-6">
                                    <h2 className="mb-4 flex items-center gap-2 font-semibold text-isstm-navy dark:text-white">
                                        <IdCard className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                                        État civil et coordonnées
                                    </h2>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Civilité <span className="text-red-500">*</span>
                                            </label>
                                            <RadioGroup
                                                name="civilite"
                                                autoComplete="honorific-prefix"
                                                value={data.civilite}
                                                onChange={(v) => setData('civilite', v)}
                                                error={errors.civilite}
                                                options={[
                                                    { value: 'M', label: 'M.' },
                                                    { value: 'Mme', label: 'Mme' },
                                                    { value: 'Mlle', label: 'Mlle' },
                                                ]}
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Genre <span className="text-red-500">*</span>
                                            </label>
                                            <RadioGroup
                                                name="sexe"
                                                autoComplete="sex"
                                                value={data.sexe}
                                                onChange={(v) => setData('sexe', v)}
                                                error={errors.sexe}
                                                options={[
                                                    { value: 'M', label: 'Masculin' },
                                                    { value: 'F', label: 'Féminin' },
                                                ]}
                                            />
                                        </div>

                                        <TextField id="prenoms" name="prenoms" autoComplete="given-name" label="Prénom(s)" value={data.prenoms} onChange={set('prenoms')} error={errors.prenoms} required disabled={!!draftId} />
                                        <TextField id="nom" name="nom" autoComplete="family-name" label="Nom" value={data.nom} onChange={set('nom')} error={errors.nom} required disabled={!!draftId} />
                                        <TextField id="date_naissance" name="date_naissance" autoComplete="bday" label="Date de naissance" type="date" value={data.date_naissance} onChange={set('date_naissance')} error={errors.date_naissance} required />
                                        <TextField id="lieu_naissance" name="lieu_naissance" autoComplete="off" label="Lieu de naissance" value={data.lieu_naissance} onChange={set('lieu_naissance')} error={errors.lieu_naissance} required />

                                        <SelectField id="nationalite" name="nationalite" autoComplete="off" label="Nationalité" value={data.nationalite} onChange={set('nationalite')} error={errors.nationalite} required>
                                            <option value="" disabled>Choisir…</option>
                                            {nationalites.map((n) => <option key={n} value={n}>{n}</option>)}
                                        </SelectField>
                                        <SelectField id="pays" name="pays" autoComplete="country-name" label="Pays de résidence" value={data.pays} onChange={set('pays')} error={errors.pays} required>
                                            <option value="" disabled>Choisir…</option>
                                            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                                        </SelectField>

                                        <TextField id="cin" name="cin" autoComplete="off" label="CIN ou passeport (facultatif)" value={data.cin} onChange={set('cin')} error={errors.cin} />
                                        <TextField id="telephone" name="telephone" autoComplete="tel" label="Téléphone du candidat" value={data.telephone} onChange={set('telephone')} error={errors.telephone} required />

                                        <TextField id="email" name="email" autoComplete="email" label="Adresse e-mail" type="email" value={data.email} onChange={set('email')} error={errors.email} required disabled={!!draftId} className="sm:col-span-2" />

                                        <div className="sm:col-span-2">
                                            <label htmlFor="adresse" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Adresse complète <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                id="adresse"
                                                name="adresse"
                                                autoComplete="street-address"
                                                value={data.adresse}
                                                onChange={set('adresse')}
                                                rows={3}
                                                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-isstm-navy focus:outline-none focus:ring-2 focus:ring-isstm-navy/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                                            />
                                            {errors.adresse && <p className="mt-1 text-sm text-red-600">{errors.adresse}</p>}
                                        </div>
                                    </div>

                                    {!draftId && (
                                        <p className="mt-6 flex items-start gap-2 rounded-lg bg-isstm-navy/5 px-3.5 py-3 text-sm text-isstm-navy dark:bg-white/5 dark:text-white">
                                            <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-isstm-gold" aria-hidden="true" />
                                            Un e-mail vous sera envoyé à cette adresse pour définir votre mot de passe et accéder à votre espace candidat.
                                        </p>
                                    )}

                                    <div className="mt-6 flex justify-end">
                                        <button type="button" disabled={processing} onClick={next} className="rounded-full bg-isstm-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
                                            {processing ? 'Création du compte…' : 'Continuer →'}
                                        </button>
                                    </div>
                                </Card>
                            )}

                            {step === 'famille' && (
                                <Card className="p-6">
                                    <h2 className="mb-4 flex items-center gap-2 font-semibold text-isstm-navy dark:text-white">
                                        <Users className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                                        Parents et répondant
                                    </h2>

                                    <p className="mb-4 rounded-lg bg-isstm-navy/5 px-3 py-2 text-sm text-isstm-navy dark:bg-white/5 dark:text-white">
                                        Indiquez au minimum un numéro joignable : téléphone des parents ou téléphone du répondant.
                                    </p>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <TextField id="nom_pere" name="nom_pere" autoComplete="off" label="Nom complet du père" value={data.nom_pere} onChange={set('nom_pere')} error={errors.nom_pere} />
                                        <TextField id="nom_mere" name="nom_mere" autoComplete="off" label="Nom complet de la mère" value={data.nom_mere} onChange={set('nom_mere')} error={errors.nom_mere} />
                                        <TextField id="contact_parents" name="contact_parents" autoComplete="tel" label="Téléphone des parents" value={data.contact_parents} onChange={set('contact_parents')} error={errors.contact_parents} className="sm:col-span-2" />
                                    </div>

                                    <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-700">
                                        <p className="mb-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                                            Tuteur ou répondant <span className="text-slate-400">(si différent des parents)</span>
                                        </p>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <TextField id="repondant_nom" name="repondant_nom" autoComplete="off" label="Nom complet" value={data.repondant_nom} onChange={set('repondant_nom')} error={errors.repondant_nom} />
                                            <TextField id="repondant_lien" name="repondant_lien" autoComplete="off" label="Lien avec le candidat" placeholder="Ex. oncle, tante, répondant légal" value={data.repondant_lien} onChange={set('repondant_lien')} error={errors.repondant_lien} />
                                            <TextField id="repondant_telephone" name="repondant_telephone" autoComplete="tel" label="Téléphone du répondant" value={data.repondant_telephone} onChange={set('repondant_telephone')} error={errors.repondant_telephone} className="sm:col-span-2" />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-between">
                                        <button type="button" onClick={() => goTo('identite')} className="flex items-center gap-1.5 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-300">
                                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                            Étape précédente
                                        </button>
                                        <button type="button" onClick={next} className="rounded-full bg-isstm-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110">
                                            Continuer →
                                        </button>
                                    </div>
                                </Card>
                            )}

                            {step === 'formation' && (
                                <Card className="p-6">
                                    <h2 className="mb-4 flex items-center gap-2 font-semibold text-isstm-navy dark:text-white">
                                        <GraduationCap className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                                        Parcours bac et filière souhaitée
                                    </h2>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <TextField id="annee_bacc" name="annee_bacc" autoComplete="off" label="Année d'obtention du bac" value={data.annee_bacc} onChange={set('annee_bacc')} error={errors.annee_bacc} required />
                                        <SelectField id="serie_bacc" name="serie_bacc" autoComplete="off" label="Série du bac" value={data.serie_bacc} onChange={set('serie_bacc')} error={errors.serie_bacc} required>
                                            <option value="" disabled>Choisir…</option>
                                            {seriesBacc.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </SelectField>
                                        {data.serie_bacc === 'AUTRE' && (
                                            <TextField id="serie_bacc_autre" name="serie_bacc_autre" autoComplete="off" label="Précisez la série" value={data.serie_bacc_autre} onChange={set('serie_bacc_autre')} error={errors.serie_bacc_autre} required />
                                        )}
                                        <SelectField id="mention_bacc" name="mention_bacc" autoComplete="off" label="Mention" value={data.mention_bacc} onChange={set('mention_bacc')} error={errors.mention_bacc} required>
                                            <option value="" disabled>Choisir…</option>
                                            {mentionsBacc.map((m) => <option key={m} value={m}>{m}</option>)}
                                        </SelectField>
                                        <SelectField id="code_redoublement" name="code_redoublement" autoComplete="off" label="Situation" value={data.code_redoublement} onChange={set('code_redoublement')} error={errors.code_redoublement} required>
                                            <option value="" disabled>Choisir…</option>
                                            <option value="N">Nouveau bachelier</option>
                                            <option value="R">Redoublant(e)</option>
                                        </SelectField>
                                        <SelectField
                                            id="filiere_id"
                                            name="filiere_id"
                                            autoComplete="off"
                                            label="Filière souhaitée"
                                            value={data.filiere_id}
                                            onChange={(e) => { setData('filiere_id', e.target.value); setData('niveau', ''); }}
                                            error={errors.filiere_id}
                                            required
                                        >
                                            <option value="" disabled>Choisir…</option>
                                            {filieres.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
                                        </SelectField>
                                        <SelectField id="niveau" name="niveau" autoComplete="off" label="Niveau" value={data.niveau} onChange={set('niveau')} error={errors.niveau} required disabled={niveaux.length === 0}>
                                            <option value="" disabled>
                                                {niveaux.length ? 'Choisir…' : "Choisissez d'abord une filière"}
                                            </option>
                                            {niveaux.map((n) => <option key={n} value={n}>{n}</option>)}
                                        </SelectField>
                                    </div>

                                    <div className="mt-6 flex justify-between">
                                        <button type="button" onClick={() => goTo('famille')} className="flex items-center gap-1.5 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-300">
                                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                            Étape précédente
                                        </button>
                                        <button type="button" onClick={next} className="rounded-full bg-isstm-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110">
                                            Continuer →
                                        </button>
                                    </div>
                                </Card>
                            )}

                            {step === 'validation' && (
                                <Card className="p-6">
                                    <h2 className="mb-4 flex items-center gap-2 font-semibold text-isstm-navy dark:text-white">
                                        <ClipboardCheck className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                                        Pièces et confirmation
                                    </h2>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <FileInput id="photo" label="Photo d'identité" file={data.photo} existingLabel={existingFiles.photo} onChange={onFileChange('photo')} error={errors.photo} />
                                        <FileInput id="cin_recto" label="CIN recto" file={data.cin_recto} existingLabel={existingFiles.cin_recto} onChange={onFileChange('cin_recto')} error={errors.cin_recto} />
                                        <FileInput id="cin_verso" label="CIN verso" file={data.cin_verso} existingLabel={existingFiles.cin_verso} onChange={onFileChange('cin_verso')} error={errors.cin_verso} />
                                        <FileInput id="diplome_attestation" label="Diplôme ou attestation" file={data.diplome_attestation} existingLabel={existingFiles.diplome_attestation} onChange={onFileChange('diplome_attestation')} error={errors.diplome_attestation} />
                                        <FileInput id="releve_bacc" label="Relevé de notes" file={data.releve_bacc} existingLabel={existingFiles.releve_bacc} onChange={onFileChange('releve_bacc')} error={errors.releve_bacc} />
                                    </div>
                                    <p className="mt-2 text-xs text-slate-400">JPG, PNG, WebP ou PDF (5 Mo maximum par fichier).</p>

                                    <div className="mt-6 rounded-xl bg-slate-50 p-5 dark:bg-slate-800/60">
                                        <h3 className="mb-3 font-semibold text-isstm-navy dark:text-white">Résumé du dossier</h3>
                                        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                                            <div>
                                                <p className="text-slate-400">Candidat</p>
                                                <p className="font-medium text-slate-700 dark:text-slate-200">{data.civilite} {data.prenoms} {data.nom}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Contact</p>
                                                <p className="font-medium text-slate-700 dark:text-slate-200">{data.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Orientation</p>
                                                <p className="font-medium text-slate-700 dark:text-slate-200">
                                                    {data.niveau} · {selectedFiliere?.nom ?? '—'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Dernier diplôme</p>
                                                <p className="font-medium text-slate-700 dark:text-slate-200">
                                                    {data.annee_bacc || '—'} ({data.serie_bacc === 'AUTRE' ? data.serie_bacc_autre : data.serie_bacc || '—'})
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <label htmlFor="consent" className="mt-6 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <input
                                            id="consent"
                                            name="consent"
                                            type="checkbox"
                                            checked={consent}
                                            onChange={(e) => {
                                                setConsent(e.target.checked);
                                                if (e.target.checked) setConsentError('');
                                            }}
                                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-isstm-navy focus:ring-isstm-navy/30"
                                        />
                                        J&apos;accepte le traitement de mes données pour l&apos;étude de mon dossier et j&apos;ai lu la{' '}
                                        <a href="/confidentialite" target="_blank" rel="noreferrer" className="font-medium text-isstm-navy underline dark:text-isstm-gold">
                                            politique de confidentialité
                                        </a>
                                        . <span className="text-red-500">*</span>
                                    </label>
                                    {consentError && <p className="mt-1 text-sm text-red-600">{consentError}</p>}

                                    <div className="mt-6 flex justify-between">
                                        <button type="button" onClick={() => goTo('formation')} className="flex items-center gap-1.5 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-300">
                                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                            Étape précédente
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Send className="h-4 w-4" aria-hidden="true" />
                                            {processing ? 'Envoi en cours…' : 'Envoyer mon inscription'}
                                        </button>
                                    </div>
                                </Card>
                            )}
                        </form>
                    </div>
            </main>

            <Footer />

            {dialog && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    role="dialog"
                    aria-modal="true"
                    onClick={closeDialog}
                >
                    <div
                        className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl dark:bg-slate-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
                                dialog.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/15' : 'bg-red-100 dark:bg-red-500/15'
                            }`}
                        >
                            {dialog.type === 'success' ? (
                                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                            ) : (
                                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                            )}
                        </div>
                        <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                            {dialog.title ?? (dialog.type === 'success' ? 'Succès' : 'Une erreur est survenue')}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{dialog.message}</p>
                        <button
                            type="button"
                            onClick={closeDialog}
                            className={`mt-5 w-full rounded-full py-2.5 text-sm font-semibold text-white transition hover:brightness-110 ${
                                dialog.type === 'success' ? 'bg-emerald-600' : 'bg-isstm-navy'
                            }`}
                        >
                            {dialog.type === 'success' ? 'OK' : 'Corriger'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
