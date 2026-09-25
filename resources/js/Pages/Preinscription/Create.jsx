import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Check, ClipboardCheck, GraduationCap, IdCard, Send, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import TextField from '../../Components/Form/TextField';
import SelectField from '../../Components/Form/SelectField';
import { Card } from '../../Components/ui/card';
import CandidateSidebar from '../../Components/Preinscription/CandidateSidebar';
import { countries, mentionsBacc, nationalites, seriesBacc } from '../../Components/Preinscription/countries';
import { useTranslations } from '../../lib/useTranslations';

const emptyForm = {
    civilite: '',
    sexe: '',
    prenoms: '',
    nom: '',
    date_naissance: '',
    lieu_naissance: '',
    nationalite: '',
    pays: '',
    cin: '',
    email: '',
    telephone: '',
    adresse: '',
    password: '',
    password_confirmation: '',
    nom_pere: '',
    nom_mere: '',
    contact_parents: '',
    repondant_nom: '',
    repondant_lien: '',
    repondant_telephone: '',
    annee_bacc: '',
    serie_bacc: '',
    serie_bacc_autre: '',
    mention_bacc: '',
    code_redoublement: '',
    filiere_id: '',
    niveau: '',
    photo: null,
    cin_recto: null,
    cin_verso: null,
    diplome_attestation: null,
    releve_bacc: null,
};

const STEPS = [
    { key: 'identite', label: 'Identité', icon: IdCard },
    { key: 'famille', label: 'Famille', icon: Users },
    { key: 'formation', label: 'Formation', icon: GraduationCap },
    { key: 'validation', label: 'Validation', icon: ClipboardCheck },
];

// Every field the server can reject must be listed here, otherwise an error on a
// missing field leaves the candidate on a step where nothing looks wrong.
const STEP_FIELDS = {
    identite: ['civilite', 'sexe', 'prenoms', 'nom', 'date_naissance', 'lieu_naissance', 'nationalite', 'pays', 'cin', 'email', 'telephone', 'adresse', 'password', 'password_confirmation'],
    famille: ['nom_pere', 'nom_mere', 'contact_parents', 'repondant_nom', 'repondant_lien', 'repondant_telephone'],
    formation: ['annee_bacc', 'serie_bacc', 'serie_bacc_autre', 'mention_bacc', 'code_redoublement', 'filiere_id', 'niveau'],
    validation: ['photo', 'cin_recto', 'cin_verso', 'diplome_attestation', 'releve_bacc'],
};

function stepOfField(field) {
    return STEPS.find((s) => STEP_FIELDS[s.key].includes(field)) ?? STEPS[0];
}

function RadioGroup({ name, options, value, onChange, error }) {
    return (
        <div>
            <div className="grid grid-cols-3 gap-2">
                {options.map((opt) => (
                    <label
                        key={opt.value}
                        className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-sm transition ${
                            value === opt.value
                                ? 'border-isstm-navy bg-isstm-navy/5 font-semibold text-isstm-navy dark:border-isstm-gold dark:bg-isstm-gold/10 dark:text-isstm-gold'
                                : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={opt.value}
                            checked={value === opt.value}
                            onChange={() => onChange(opt.value)}
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

function PasswordChecklist({ password }) {
    const rules = [
        { label: '8 caractères minimum', met: password.length >= 8 },
        { label: 'Une majuscule', met: /[A-Z]/.test(password) },
        { label: 'Une minuscule', met: /[a-z]/.test(password) },
        { label: 'Un chiffre', met: /[0-9]/.test(password) },
    ];

    return (
        <ul className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
            {rules.map((rule) => (
                <li
                    key={rule.label}
                    className={`flex items-center gap-1.5 text-xs ${rule.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}
                >
                    <span className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full ${rule.met ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                        {rule.met && <Check className="h-2.5 w-2.5" aria-hidden="true" />}
                    </span>
                    {rule.label}
                </li>
            ))}
        </ul>
    );
}

function FileInput({ id, label, file, onChange, error }) {
    return (
        <div>
            <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label} <span className="text-red-500">*</span>
            </label>
            <label
                htmlFor={id}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700/60"
            >
                <span className="rounded-md bg-isstm-navy px-3 py-1.5 text-xs font-semibold text-white">Choisir un fichier</span>
                <span className="min-w-0 flex-1 truncate text-right text-xs text-slate-500 dark:text-slate-400">
                    {file ? file.name : 'Aucun fichier n’a été sélectionné'}
                </span>
                <input id={id} type="file" accept="image/*,.pdf" onChange={onChange} className="sr-only" />
            </label>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}

export default function Create({ filieres }) {
    const { content, flash } = usePage().props;
    const { t } = useTranslations();
    const [step, setStep] = useState('identite');
    const [consent, setConsent] = useState(false);
    const [consentError, setConsentError] = useState('');
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm(emptyForm);

    const selectedFiliere = useMemo(() => filieres.find((f) => String(f.id) === String(data.filiere_id)), [filieres, data.filiere_id]);
    const niveaux = useMemo(() => (selectedFiliere?.niveaux ? selectedFiliere.niveaux.split(',') : []), [selectedFiliere]);

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

    function next() {
        const currentIndex = STEPS.findIndex((s) => s.key === step);
        const fields = STEP_FIELDS[step];
        const missing = {};

        if (step === 'identite') {
            for (const field of ['civilite', 'sexe', 'prenoms', 'nom', 'date_naissance', 'lieu_naissance', 'nationalite', 'pays', 'email', 'telephone', 'adresse', 'password']) {
                if (!data[field]) missing[field] = 'Ce champ est requis.';
            }
            if (data.password && (data.password.length < 8 || !/[A-Z]/.test(data.password) || !/[a-z]/.test(data.password) || !/[0-9]/.test(data.password))) {
                missing.password = 'Le mot de passe doit respecter les 4 conditions ci-dessous.';
            }
            if (data.password && data.password !== data.password_confirmation) {
                missing.password_confirmation = 'La confirmation ne correspond pas au mot de passe.';
            }
        } else if (step === 'famille') {
            if (!data.contact_parents && !data.repondant_telephone) {
                missing.contact_parents = 'Indiquez au moins un numéro joignable (parents ou répondant).';
            }
        } else if (step === 'formation') {
            for (const field of ['annee_bacc', 'serie_bacc', 'mention_bacc', 'code_redoublement', 'filiere_id', 'niveau']) {
                if (!data[field]) missing[field] = 'Ce champ est requis.';
            }
            if (data.serie_bacc === 'AUTRE' && !data.serie_bacc_autre) {
                missing.serie_bacc_autre = 'Précisez la série.';
            }
        }

        for (const field of fields) clearErrors(field);
        for (const [field, message] of Object.entries(missing)) setError(field, message);

        // Client-side checks are a hint, not a gate: the server is the source of
        // truth for validation (it re-checks everything on submit and routes back
        // to the first step with an error). Never trap a candidate on a step they
        // can't get past because of a client-only edge case.
        goTo(STEPS[currentIndex + 1].key);
    }

    function submit(e) {
        e.preventDefault();

        if (!consent) {
            setConsentError('Vous devez accepter le traitement de vos données pour envoyer votre dossier.');
            return;
        }
        setConsentError('');

        post('/preinscription', {
            forceFormData: true,
            onError: (serverErrors) => {
                const errorFields = Object.keys(serverErrors);
                if (errorFields.length === 0) return;

                // Jump to whichever step owns the *first* rejected field, so the
                // candidate always lands somewhere the error is actually visible —
                // never stuck on the last step looking at a form with no visible errors.
                goTo(stepOfField(errorFields[0]).key);
            },
        });
    }

    const currentStepIndex = STEPS.findIndex((s) => s.key === step);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Préinscription" />
            <SiteHeader />

            <div className="bg-isstm-navy py-8 text-white sm:py-10">
                <div className="mx-auto max-w-5xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        {t('preinscription.titre', 'Votre dossier d’inscription')}
                    </h1>
                    <p className="mt-2 text-white/80">
                        {t('preinscription.soustitre_form', 'Les champs avec un astérisque sont obligatoires. Vos données sont enregistrées uniquement après l’envoi final.')}
                    </p>
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
                    <CandidateSidebar content={content} />

                    <div>
                        <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
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
                                                value={data.sexe}
                                                onChange={(v) => setData('sexe', v)}
                                                error={errors.sexe}
                                                options={[
                                                    { value: 'M', label: 'Masculin' },
                                                    { value: 'F', label: 'Féminin' },
                                                ]}
                                            />
                                        </div>

                                        <TextField id="prenoms" label="Prénom(s)" value={data.prenoms} onChange={set('prenoms')} error={errors.prenoms} required />
                                        <TextField id="nom" label="Nom" value={data.nom} onChange={set('nom')} error={errors.nom} required />
                                        <TextField id="date_naissance" label="Date de naissance" type="date" value={data.date_naissance} onChange={set('date_naissance')} error={errors.date_naissance} required />
                                        <TextField id="lieu_naissance" label="Lieu de naissance" value={data.lieu_naissance} onChange={set('lieu_naissance')} error={errors.lieu_naissance} required />

                                        <SelectField id="nationalite" label="Nationalité" value={data.nationalite} onChange={set('nationalite')} error={errors.nationalite} required>
                                            <option value="" disabled>Choisir…</option>
                                            {nationalites.map((n) => <option key={n} value={n}>{n}</option>)}
                                        </SelectField>
                                        <SelectField id="pays" label="Pays de résidence" value={data.pays} onChange={set('pays')} error={errors.pays} required>
                                            <option value="" disabled>Choisir…</option>
                                            {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                                        </SelectField>

                                        <TextField id="cin" label="CIN ou passeport (facultatif)" value={data.cin} onChange={set('cin')} error={errors.cin} />
                                        <TextField id="telephone" label="Téléphone du candidat" value={data.telephone} onChange={set('telephone')} error={errors.telephone} required />

                                        <TextField id="email" label="Adresse e-mail" type="email" value={data.email} onChange={set('email')} error={errors.email} required className="sm:col-span-2" />

                                        <div className="sm:col-span-2">
                                            <label htmlFor="adresse" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Adresse complète <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                id="adresse"
                                                value={data.adresse}
                                                onChange={set('adresse')}
                                                rows={3}
                                                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-isstm-navy focus:outline-none focus:ring-2 focus:ring-isstm-navy/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                                            />
                                            {errors.adresse && <p className="mt-1 text-sm text-red-600">{errors.adresse}</p>}
                                        </div>
                                    </div>

                                    <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-700">
                                        <h3 className="mb-1 font-semibold text-isstm-navy dark:text-white">Votre compte candidat</h3>
                                        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                                            Ce mot de passe vous permettra de suivre votre dossier en ligne après vérification de votre e-mail.
                                        </p>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div>
                                                <TextField id="password" type="password" label="Mot de passe" value={data.password} onChange={set('password')} error={errors.password} required />
                                                <PasswordChecklist password={data.password} />
                                            </div>
                                            <TextField id="password_confirmation" type="password" label="Confirmer le mot de passe" value={data.password_confirmation} onChange={set('password_confirmation')} error={errors.password_confirmation} required />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end">
                                        <button type="button" onClick={next} className="rounded-full bg-isstm-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110">
                                            Continuer →
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
                                        <TextField id="nom_pere" label="Nom complet du père" value={data.nom_pere} onChange={set('nom_pere')} error={errors.nom_pere} />
                                        <TextField id="nom_mere" label="Nom complet de la mère" value={data.nom_mere} onChange={set('nom_mere')} error={errors.nom_mere} />
                                        <TextField id="contact_parents" label="Téléphone des parents" value={data.contact_parents} onChange={set('contact_parents')} error={errors.contact_parents} className="sm:col-span-2" />
                                    </div>

                                    <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-700">
                                        <p className="mb-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                                            Tuteur ou répondant <span className="text-slate-400">(si différent des parents)</span>
                                        </p>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <TextField id="repondant_nom" label="Nom complet" value={data.repondant_nom} onChange={set('repondant_nom')} error={errors.repondant_nom} />
                                            <TextField id="repondant_lien" label="Lien avec le candidat" placeholder="Ex. oncle, tante, répondant légal" value={data.repondant_lien} onChange={set('repondant_lien')} error={errors.repondant_lien} />
                                            <TextField id="repondant_telephone" label="Téléphone du répondant" value={data.repondant_telephone} onChange={set('repondant_telephone')} error={errors.repondant_telephone} className="sm:col-span-2" />
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
                                        <TextField id="annee_bacc" label="Année d'obtention du bac" value={data.annee_bacc} onChange={set('annee_bacc')} error={errors.annee_bacc} required />
                                        <SelectField id="serie_bacc" label="Série du bac" value={data.serie_bacc} onChange={set('serie_bacc')} error={errors.serie_bacc} required>
                                            <option value="" disabled>Choisir…</option>
                                            {seriesBacc.map((s) => <option key={s} value={s}>{s}</option>)}
                                        </SelectField>
                                        {data.serie_bacc === 'AUTRE' && (
                                            <TextField id="serie_bacc_autre" label="Précisez la série" value={data.serie_bacc_autre} onChange={set('serie_bacc_autre')} error={errors.serie_bacc_autre} required />
                                        )}
                                        <SelectField id="mention_bacc" label="Mention" value={data.mention_bacc} onChange={set('mention_bacc')} error={errors.mention_bacc} required>
                                            <option value="" disabled>Choisir…</option>
                                            {mentionsBacc.map((m) => <option key={m} value={m}>{m}</option>)}
                                        </SelectField>
                                        <SelectField id="code_redoublement" label="Situation" value={data.code_redoublement} onChange={set('code_redoublement')} error={errors.code_redoublement} required>
                                            <option value="" disabled>Choisir…</option>
                                            <option value="N">Nouveau bachelier</option>
                                            <option value="R">Redoublant(e)</option>
                                        </SelectField>
                                        <SelectField
                                            id="filiere_id"
                                            label="Filière souhaitée"
                                            value={data.filiere_id}
                                            onChange={(e) => { setData('filiere_id', e.target.value); setData('niveau', ''); }}
                                            error={errors.filiere_id}
                                            required
                                        >
                                            <option value="" disabled>Choisir…</option>
                                            {filieres.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
                                        </SelectField>
                                        <SelectField id="niveau" label="Niveau" value={data.niveau} onChange={set('niveau')} error={errors.niveau} required disabled={niveaux.length === 0}>
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
                                        <FileInput id="photo" label="Photo d'identité" file={data.photo} onChange={onFileChange('photo')} error={errors.photo} />
                                        <FileInput id="cin_recto" label="CIN recto" file={data.cin_recto} onChange={onFileChange('cin_recto')} error={errors.cin_recto} />
                                        <FileInput id="cin_verso" label="CIN verso" file={data.cin_verso} onChange={onFileChange('cin_verso')} error={errors.cin_verso} />
                                        <FileInput id="diplome_attestation" label="Diplôme ou attestation" file={data.diplome_attestation} onChange={onFileChange('diplome_attestation')} error={errors.diplome_attestation} />
                                        <FileInput id="releve_bacc" label="Relevé de notes" file={data.releve_bacc} onChange={onFileChange('releve_bacc')} error={errors.releve_bacc} />
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

                                    <label className="mt-6 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <input
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
                </div>
            </main>

            <Footer />
        </div>
    );
}
