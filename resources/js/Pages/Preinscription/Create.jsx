import { Head, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import TextField from '../../Components/Form/TextField';
import SelectField from '../../Components/Form/SelectField';
import { countries, mentionsBacc, nationalites, seriesBacc } from '../../Components/Preinscription/countries';

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
};

const fieldLabels = {
    nom: 'Nom',
    prenoms: 'Prénoms',
    sexe: 'Sexe',
    date_naissance: 'Date de naissance',
    lieu_naissance: 'Lieu de naissance',
    nationalite: 'Nationalité',
    annee_bacc: 'Année du bac',
    serie_bacc: 'Série du bac',
    mention_bacc: 'Mention',
    adresse: 'Adresse',
    telephone: 'Téléphone',
    email: 'E-mail',
    pays: 'Pays',
    filiere: 'Filière',
    niveau: 'Niveau',
};

export default function Create({ filieres }) {
    const { flash } = usePage().props;
    const [step, setStep] = useState('form');
    const [photoPreview, setPhotoPreview] = useState(null);
    const { data, setData, post, processing, errors } = useForm(emptyForm);

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

    if (flash?.status) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Head title="Préinscription envoyée" />
                <SiteHeader />
                <main className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✓</div>
                    <h1 className="mt-6 text-2xl font-bold text-isstm-navy">Préinscription envoyée</h1>
                    <p className="mt-3 text-slate-600">{flash.status}</p>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title="Préinscription" />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-3xl px-6">
                    <h1 className="text-3xl font-bold">Préinscription en ligne</h1>
                    <p className="mt-2 text-white/80">Remplissez ce formulaire pour déposer votre candidature à l'ISSTM.</p>
                </div>
            </div>

            <main className="mx-auto max-w-3xl px-6 py-12">
                {step === 'form' ? (
                    <form onSubmit={reviewForm} encType="multipart/form-data" className="space-y-8">
                        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                            <h2 className="mb-4 font-semibold text-isstm-navy">Identité</h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <TextField id="nom" label="Nom" value={data.nom} onChange={set('nom')} error={errors.nom} required />
                                <TextField id="prenoms" label="Prénoms" value={data.prenoms} onChange={set('prenoms')} error={errors.prenoms} required />
                                <SelectField id="sexe" label="Sexe" value={data.sexe} onChange={set('sexe')} error={errors.sexe} required>
                                    <option value="" disabled>Choisir…</option>
                                    <option value="M">Masculin</option>
                                    <option value="F">Féminin</option>
                                </SelectField>
                                <TextField id="date_naissance" label="Date de naissance" type="date" value={data.date_naissance} onChange={set('date_naissance')} error={errors.date_naissance} required />
                                <TextField id="lieu_naissance" label="Lieu de naissance" value={data.lieu_naissance} onChange={set('lieu_naissance')} error={errors.lieu_naissance} required />
                                <TextField id="cin" label="CIN (si majeur)" value={data.cin} onChange={set('cin')} error={errors.cin} />
                                <SelectField id="nationalite" label="Nationalité" value={data.nationalite} onChange={set('nationalite')} error={errors.nationalite} required>
                                    <option value="" disabled>Choisir…</option>
                                    {nationalites.map((n) => <option key={n} value={n}>{n}</option>)}
                                </SelectField>
                                <SelectField id="pays" label="Pays de résidence" value={data.pays} onChange={set('pays')} error={errors.pays} required>
                                    <option value="" disabled>Choisir…</option>
                                    {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                                </SelectField>
                            </div>
                        </section>

                        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                            <h2 className="mb-4 font-semibold text-isstm-navy">Parcours bac</h2>
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
                            </div>
                        </section>

                        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                            <h2 className="mb-4 font-semibold text-isstm-navy">Filière souhaitée</h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <SelectField
                                    id="filiere_id"
                                    label="Filière"
                                    value={data.filiere_id}
                                    onChange={(e) => { setData('filiere_id', e.target.value); setData('niveau', ''); }}
                                    error={errors.filiere_id}
                                    required
                                >
                                    <option value="" disabled>Choisir…</option>
                                    {filieres.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
                                </SelectField>
                                <SelectField id="niveau" label="Niveau" value={data.niveau} onChange={set('niveau')} error={errors.niveau} required disabled={niveaux.length === 0}>
                                    <option value="" disabled>{niveaux.length ? 'Choisir…' : "Choisissez d'abord une filière"}</option>
                                    {niveaux.map((n) => <option key={n} value={n}>{n}</option>)}
                                </SelectField>
                            </div>
                        </section>

                        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                            <h2 className="mb-4 font-semibold text-isstm-navy">Contact</h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <TextField id="adresse" label="Adresse" value={data.adresse} onChange={set('adresse')} error={errors.adresse} required />
                                <TextField id="telephone" label="Téléphone" value={data.telephone} onChange={set('telephone')} error={errors.telephone} required />
                                <TextField id="email" label="E-mail" type="email" value={data.email} onChange={set('email')} error={errors.email} required className="sm:col-span-2" />
                            </div>
                        </section>

                        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                            <h2 className="mb-4 font-semibold text-isstm-navy">Filiation (facultatif)</h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <TextField id="nom_pere" label="Nom du père" value={data.nom_pere} onChange={set('nom_pere')} error={errors.nom_pere} />
                                <TextField id="profession_pere" label="Profession du père" value={data.profession_pere} onChange={set('profession_pere')} error={errors.profession_pere} />
                                <TextField id="nom_mere" label="Nom de la mère" value={data.nom_mere} onChange={set('nom_mere')} error={errors.nom_mere} />
                                <TextField id="profession_mere" label="Profession de la mère" value={data.profession_mere} onChange={set('profession_mere')} error={errors.profession_mere} />
                                <TextField id="adresse_parents" label="Adresse des parents" value={data.adresse_parents} onChange={set('adresse_parents')} error={errors.adresse_parents} className="sm:col-span-2" />
                                <TextField id="contact_parents" label="Contact des parents" value={data.contact_parents} onChange={set('contact_parents')} error={errors.contact_parents} />
                                <TextField id="contact_parents_2" label="Second contact" value={data.contact_parents_2} onChange={set('contact_parents_2')} error={errors.contact_parents_2} />
                            </div>
                        </section>

                        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                            <h2 className="mb-4 font-semibold text-isstm-navy">Photo d'identité</h2>
                            <div className="flex items-center gap-5">
                                {photoPreview && <img src={photoPreview} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-isstm-navy/10" />}
                                <div>
                                    <input id="photo" type="file" accept="image/*" onChange={onPhotoChange} className="text-sm text-slate-500" />
                                    {errors.photo && <p className="mt-1 text-sm text-red-600">{errors.photo}</p>}
                                </div>
                            </div>
                        </section>

                        <button
                            type="submit"
                            className="w-full rounded-full bg-isstm-navy py-3 text-sm font-semibold text-white transition hover:brightness-110"
                        >
                            Vérifier ma préinscription
                        </button>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                            <h2 className="mb-4 font-semibold text-isstm-navy">Récapitulatif</h2>
                            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                                {Object.entries(fieldLabels).map(([key, label]) => {
                                    const value = key === 'filiere' ? selectedFiliere?.nom : data[key];
                                    if (!value) return null;
                                    return (
                                        <div key={key}>
                                            <dt className="text-slate-400">{label}</dt>
                                            <dd className="font-medium text-slate-700">{value}</dd>
                                        </div>
                                    );
                                })}
                            </dl>
                            {photoPreview && (
                                <img src={photoPreview} alt="" className="mt-5 h-20 w-20 rounded-full object-cover ring-2 ring-isstm-navy/10" />
                            )}
                        </section>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setStep('form')}
                                className="flex-1 rounded-full border border-slate-300 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                            >
                                ← Modifier
                            </button>
                            <button
                                type="button"
                                onClick={submit}
                                disabled={processing}
                                className="flex-1 rounded-full bg-isstm-navy py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                            >
                                Confirmer et envoyer
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
