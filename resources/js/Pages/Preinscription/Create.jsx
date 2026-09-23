import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ClipboardCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import TextField from '../../Components/Form/TextField';
import SelectField from '../../Components/Form/SelectField';
import { Card } from '../../Components/ui/card';
import EditableText from '../../Components/QuickEdit/EditableText';
import { countries, mentionsBacc, nationalites, seriesBacc } from '../../Components/Preinscription/countries';
import { useTranslations } from '../../lib/useTranslations';

const emptyForm = {
    nom: '',
    prenoms: '',
    sexe: '',
    date_naissance: '',
    lieu_naissance: '',
    cin: '',
    nationalite: '',
    annee_bacc: '',
    serie_bacc: '',
    serie_bacc_autre: '',
    mention_bacc: '',
    code_redoublement: '',
    adresse: '',
    telephone: '',
    email: '',
    nom_pere: '',
    profession_pere: '',
    nom_mere: '',
    profession_mere: '',
    adresse_parents: '',
    contact_parents: '',
    contact_parents_2: '',
    pays: '',
    filiere_id: '',
    niveau: '',
    photo: null,
    releve_bacc: null,
    cin_document: null,
    password: '',
    password_confirmation: '',
};

export default function Create({ filieres }) {
    const { content } = usePage().props;
    const { t } = useTranslations();
    const [step, setStep] = useState('form');
    const [photoPreview, setPhotoPreview] = useState(null);
    const { data, setData, post, processing, errors } = useForm(emptyForm);

    const fieldLabels = {
        nom: t('preinscription.champ_nom', 'Nom'),
        prenoms: t('preinscription.champ_prenoms', 'Prénoms'),
        sexe: t('preinscription.champ_sexe', 'Sexe'),
        date_naissance: t('preinscription.champ_date_naissance', 'Date de naissance'),
        lieu_naissance: t('preinscription.champ_lieu_naissance', 'Lieu de naissance'),
        nationalite: t('preinscription.champ_nationalite', 'Nationalité'),
        annee_bacc: t('preinscription.champ_annee_bacc', 'Année du bac'),
        serie_bacc: t('preinscription.champ_serie_bacc', 'Série du bac'),
        mention_bacc: t('preinscription.champ_mention', 'Mention'),
        adresse: t('preinscription.champ_adresse', 'Adresse'),
        telephone: t('preinscription.champ_telephone', 'Téléphone'),
        email: t('preinscription.champ_email', 'E-mail'),
        pays: t('preinscription.champ_pays', 'Pays'),
        filiere: t('preinscription.champ_filiere', 'Filière'),
        niveau: t('preinscription.champ_niveau', 'Niveau'),
    };

    const selectedFiliere = useMemo(() => filieres.find((f) => String(f.id) === String(data.filiere_id)), [filieres, data.filiere_id]);
    const niveaux = useMemo(() => (selectedFiliere?.niveaux ? selectedFiliere.niveaux.split(',') : []), [selectedFiliere]);

    function set(field) {
        return (e) => setData(field, e.target.value);
    }

    function onPhotoChange(e) {
        const file = e.target.files[0] ?? null;
        setData('photo', file);
        setPhotoPreview(file ? URL.createObjectURL(file) : null);
    }

    function onFileChange(field) {
        return (e) => setData(field, e.target.files[0] ?? null);
    }

    function reviewForm(e) {
        e.preventDefault();
        setStep('review');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function submit() {
        post('/preinscription', {
            forceFormData: true,
            onError: () => setStep('form'),
        });
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Préinscription" />
            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-3xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        <EditableText as="span" contentKey="preinscription_titre">
                            {content.preinscription_titre ?? t('preinscription.titre', 'Préinscription en ligne')}
                        </EditableText>
                    </h1>
                    <p className="mt-2 text-white/80">
                        <EditableText as="span" contentKey="preinscription_soustitre">
                            {content.preinscription_soustitre ??
                                t('preinscription.soustitre', "Remplissez ce formulaire pour déposer votre candidature à l'ISSTM.")}
                        </EditableText>
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-3xl px-6 py-12">
                {step === 'form' ? (
                    <form onSubmit={reviewForm} encType="multipart/form-data" className="space-y-8">
                        <Card className="p-6">
                            <h2 className="mb-4 font-semibold text-isstm-navy dark:text-white">{t('preinscription.section_identite', 'Identité')}</h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <TextField id="nom" label={fieldLabels.nom} value={data.nom} onChange={set('nom')} error={errors.nom} required />
                                <TextField id="prenoms" label={fieldLabels.prenoms} value={data.prenoms} onChange={set('prenoms')} error={errors.prenoms} required />
                                <SelectField id="sexe" label={fieldLabels.sexe} value={data.sexe} onChange={set('sexe')} error={errors.sexe} required>
                                    <option value="" disabled>{t('preinscription.choisir', 'Choisir…')}</option>
                                    <option value="M">{t('preinscription.masculin', 'Masculin')}</option>
                                    <option value="F">{t('preinscription.feminin', 'Féminin')}</option>
                                </SelectField>
                                <TextField id="date_naissance" label={fieldLabels.date_naissance} type="date" value={data.date_naissance} onChange={set('date_naissance')} error={errors.date_naissance} required />
                                <TextField id="lieu_naissance" label={fieldLabels.lieu_naissance} value={data.lieu_naissance} onChange={set('lieu_naissance')} error={errors.lieu_naissance} required />
                                <TextField id="cin" label={t('preinscription.champ_cin', 'CIN (si majeur)')} value={data.cin} onChange={set('cin')} error={errors.cin} />
                                <SelectField id="nationalite" label={fieldLabels.nationalite} value={data.nationalite} onChange={set('nationalite')} error={errors.nationalite} required>
                                    <option value="" disabled>{t('preinscription.choisir', 'Choisir…')}</option>
                                    {nationalites.map((n) => <option key={n} value={n}>{n}</option>)}
                                </SelectField>
                                <SelectField id="pays" label={t('preinscription.champ_pays_residence', 'Pays de résidence')} value={data.pays} onChange={set('pays')} error={errors.pays} required>
                                    <option value="" disabled>{t('preinscription.choisir', 'Choisir…')}</option>
                                    {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                                </SelectField>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="mb-4 font-semibold text-isstm-navy dark:text-white">{t('preinscription.section_bac', 'Parcours bac')}</h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <TextField id="annee_bacc" label={t('preinscription.champ_annee_obtention', "Année d'obtention du bac")} value={data.annee_bacc} onChange={set('annee_bacc')} error={errors.annee_bacc} required />
                                <SelectField id="serie_bacc" label={fieldLabels.serie_bacc} value={data.serie_bacc} onChange={set('serie_bacc')} error={errors.serie_bacc} required>
                                    <option value="" disabled>{t('preinscription.choisir', 'Choisir…')}</option>
                                    {seriesBacc.map((s) => <option key={s} value={s}>{s}</option>)}
                                </SelectField>
                                {data.serie_bacc === 'AUTRE' && (
                                    <TextField id="serie_bacc_autre" label={t('preinscription.champ_serie_autre', 'Précisez la série')} value={data.serie_bacc_autre} onChange={set('serie_bacc_autre')} error={errors.serie_bacc_autre} required />
                                )}
                                <SelectField id="mention_bacc" label={fieldLabels.mention_bacc} value={data.mention_bacc} onChange={set('mention_bacc')} error={errors.mention_bacc} required>
                                    <option value="" disabled>{t('preinscription.choisir', 'Choisir…')}</option>
                                    {mentionsBacc.map((m) => <option key={m} value={m}>{m}</option>)}
                                </SelectField>
                                <SelectField id="code_redoublement" label={t('preinscription.champ_situation', 'Situation')} value={data.code_redoublement} onChange={set('code_redoublement')} error={errors.code_redoublement} required>
                                    <option value="" disabled>{t('preinscription.choisir', 'Choisir…')}</option>
                                    <option value="N">{t('preinscription.nouveau_bachelier', 'Nouveau bachelier')}</option>
                                    <option value="R">{t('preinscription.redoublant', 'Redoublant(e)')}</option>
                                </SelectField>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="mb-4 font-semibold text-isstm-navy dark:text-white">{t('preinscription.section_filiere', 'Filière souhaitée')}</h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <SelectField
                                    id="filiere_id"
                                    label={fieldLabels.filiere}
                                    value={data.filiere_id}
                                    onChange={(e) => { setData('filiere_id', e.target.value); setData('niveau', ''); }}
                                    error={errors.filiere_id}
                                    required
                                >
                                    <option value="" disabled>{t('preinscription.choisir', 'Choisir…')}</option>
                                    {filieres.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
                                </SelectField>
                                <SelectField id="niveau" label={fieldLabels.niveau} value={data.niveau} onChange={set('niveau')} error={errors.niveau} required disabled={niveaux.length === 0}>
                                    <option value="" disabled>
                                        {niveaux.length ? t('preinscription.choisir', 'Choisir…') : t('preinscription.choisir_filiere_dabord', "Choisissez d'abord une filière")}
                                    </option>
                                    {niveaux.map((n) => <option key={n} value={n}>{n}</option>)}
                                </SelectField>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="mb-4 font-semibold text-isstm-navy dark:text-white">{t('preinscription.section_contact', 'Contact')}</h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <TextField id="adresse" label={fieldLabels.adresse} value={data.adresse} onChange={set('adresse')} error={errors.adresse} required />
                                <TextField id="telephone" label={fieldLabels.telephone} value={data.telephone} onChange={set('telephone')} error={errors.telephone} required />
                                <TextField id="email" label={fieldLabels.email} type="email" value={data.email} onChange={set('email')} error={errors.email} required className="sm:col-span-2" />
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="mb-4 font-semibold text-isstm-navy dark:text-white">{t('preinscription.section_compte', 'Votre compte candidat')}</h2>
                            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                                {t(
                                    'preinscription.section_compte_aide',
                                    'Ce mot de passe vous permettra de suivre votre dossier en ligne après vérification de votre e-mail.',
                                )}
                            </p>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <TextField
                                    id="password"
                                    type="password"
                                    label={t('preinscription.champ_mot_de_passe', 'Mot de passe')}
                                    value={data.password}
                                    onChange={set('password')}
                                    error={errors.password}
                                    required
                                />
                                <TextField
                                    id="password_confirmation"
                                    type="password"
                                    label={t('preinscription.champ_mot_de_passe_confirmation', 'Confirmer le mot de passe')}
                                    value={data.password_confirmation}
                                    onChange={set('password_confirmation')}
                                    error={errors.password_confirmation}
                                    required
                                />
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="mb-4 font-semibold text-isstm-navy dark:text-white">{t('preinscription.section_filiation', 'Filiation (facultatif)')}</h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <TextField id="nom_pere" label={t('preinscription.champ_nom_pere', 'Nom du père')} value={data.nom_pere} onChange={set('nom_pere')} error={errors.nom_pere} />
                                <TextField id="profession_pere" label={t('preinscription.champ_profession_pere', 'Profession du père')} value={data.profession_pere} onChange={set('profession_pere')} error={errors.profession_pere} />
                                <TextField id="nom_mere" label={t('preinscription.champ_nom_mere', 'Nom de la mère')} value={data.nom_mere} onChange={set('nom_mere')} error={errors.nom_mere} />
                                <TextField id="profession_mere" label={t('preinscription.champ_profession_mere', 'Profession de la mère')} value={data.profession_mere} onChange={set('profession_mere')} error={errors.profession_mere} />
                                <TextField id="adresse_parents" label={t('preinscription.champ_adresse_parents', 'Adresse des parents')} value={data.adresse_parents} onChange={set('adresse_parents')} error={errors.adresse_parents} className="sm:col-span-2" />
                                <TextField id="contact_parents" label={t('preinscription.champ_contact_parents', 'Contact des parents')} value={data.contact_parents} onChange={set('contact_parents')} error={errors.contact_parents} />
                                <TextField id="contact_parents_2" label={t('preinscription.champ_second_contact', 'Second contact')} value={data.contact_parents_2} onChange={set('contact_parents_2')} error={errors.contact_parents_2} />
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="mb-4 font-semibold text-isstm-navy dark:text-white">{t('preinscription.section_photo', "Photo d'identité")}</h2>
                            <div className="flex items-center gap-5">
                                {photoPreview && <img src={photoPreview} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-isstm-navy/10" />}
                                <div>
                                    <input id="photo" type="file" accept="image/*" onChange={onPhotoChange} className="text-sm text-slate-500 dark:text-slate-400" />
                                    {errors.photo && <p className="mt-1 text-sm text-red-600">{errors.photo}</p>}
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6">
                            <h2 className="mb-4 font-semibold text-isstm-navy dark:text-white">{t('preinscription.section_pieces', 'Pièces à joindre')}</h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="releve_bacc" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {t('preinscription.champ_releve_bacc', 'Relevé de notes du bac')}
                                    </label>
                                    <input
                                        id="releve_bacc"
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={onFileChange('releve_bacc')}
                                        className="text-sm text-slate-500 dark:text-slate-400"
                                    />
                                    {data.releve_bacc && <p className="mt-1 text-xs text-slate-400">{data.releve_bacc.name}</p>}
                                    {errors.releve_bacc && <p className="mt-1 text-sm text-red-600">{errors.releve_bacc}</p>}
                                </div>
                                <div>
                                    <label htmlFor="cin_document" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {t('preinscription.champ_cin_document', "Copie de la CIN")}
                                    </label>
                                    <input
                                        id="cin_document"
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={onFileChange('cin_document')}
                                        className="text-sm text-slate-500 dark:text-slate-400"
                                    />
                                    {data.cin_document && <p className="mt-1 text-xs text-slate-400">{data.cin_document.name}</p>}
                                    {errors.cin_document && <p className="mt-1 text-sm text-red-600">{errors.cin_document}</p>}
                                </div>
                            </div>
                        </Card>

                        <button
                            type="submit"
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-isstm-navy py-3 text-sm font-semibold text-white transition hover:brightness-110"
                        >
                            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                            {t('preinscription.verifier_cta', 'Vérifier ma préinscription')}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h2 className="mb-4 font-semibold text-isstm-navy dark:text-white">{t('preinscription.recapitulatif', 'Récapitulatif')}</h2>
                            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                                {Object.entries(fieldLabels).map(([key, label]) => {
                                    const value = key === 'filiere' ? selectedFiliere?.nom : data[key];
                                    if (!value) return null;
                                    return (
                                        <div key={key}>
                                            <dt className="text-slate-400 dark:text-slate-500">{label}</dt>
                                            <dd className="font-medium text-slate-700 dark:text-slate-200">{value}</dd>
                                        </div>
                                    );
                                })}
                            </dl>
                            {photoPreview && (
                                <img src={photoPreview} alt="" className="mt-5 h-20 w-20 rounded-full object-cover ring-2 ring-isstm-navy/10" />
                            )}
                            <ul className="mt-5 space-y-1 text-sm text-slate-500 dark:text-slate-400">
                                <li>{t('preinscription.recap_releve', 'Relevé du bac')} : {data.releve_bacc?.name ?? '—'}</li>
                                <li>{t('preinscription.recap_cin', 'CIN')} : {data.cin_document?.name ?? '—'}</li>
                                <li>{t('preinscription.recap_mot_de_passe', 'Mot de passe')} : {data.password ? '••••••••' : '—'}</li>
                            </ul>
                        </Card>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setStep('form')}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-300 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 transition hover:bg-slate-100"
                            >
                                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                {t('preinscription.modifier', 'Modifier')}
                            </button>
                            <button
                                type="button"
                                onClick={submit}
                                disabled={processing}
                                className="flex-1 rounded-full bg-isstm-navy py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                            >
                                {t('preinscription.confirmer_cta', 'Confirmer et envoyer')}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
