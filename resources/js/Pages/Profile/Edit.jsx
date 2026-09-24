import { Head, useForm } from '@inertiajs/react';
import { Check, Circle, KeyRound, Save } from 'lucide-react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import AppLayout from '../../Components/Layout/AppLayout';
import TextField from '../../Components/Form/TextField';
import { Card } from '../../Components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../Components/ui/avatar';
import { useTranslations } from '../../lib/useTranslations';

export default function Edit({ user }) {
    const { t } = useTranslations();
    const isCommunityViewer = ['admin', 'enseignant', 'etudiant'].includes(user.role);
    const { data, setData, post, processing, errors } = useForm({
        _method: 'patch',
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        bio: user.bio ?? '',
        birth_date: user.birth_date ?? '',
        city: user.city ?? '',
        interests: user.interests ?? '',
        facebook_url: user.facebook_url ?? '',
        linkedin_url: user.linkedin_url ?? '',
        personal_website: user.personal_website ?? '',
        avatar: null,
        cover: null,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const passwordCriteria = [
        { key: 'length', label: t('auth.critere_longueur', 'Au moins 8 caractères'), met: passwordForm.data.password.length >= 8 },
        { key: 'case', label: t('auth.critere_casse', 'Majuscule et minuscule'), met: /[a-z]/.test(passwordForm.data.password) && /[A-Z]/.test(passwordForm.data.password) },
        { key: 'digit', label: t('auth.critere_chiffre', 'Au moins un chiffre'), met: /[0-9]/.test(passwordForm.data.password) },
    ];

    function submit(e) {
        e.preventDefault();
        post('/profil', { forceFormData: true });
    }

    function submitPassword(e) {
        e.preventDefault();
        passwordForm.put('/profil/mot-de-passe', {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    }

    const content = (
        <>
                <h1 className="text-2xl font-bold text-isstm-navy dark:text-white">{t('profil.mon_profil', 'Mon profil')}</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {t('profil.visibilite', 'Ces informations sont visibles par les autres membres de la communauté ISSTM.')}
                </p>

                <Card className="mt-8 overflow-hidden">
                    <div className="relative h-40 bg-gradient-to-br from-isstm-navy to-isstm-navy-dark sm:h-48">
                        {data.cover ? (
                            <img src={URL.createObjectURL(data.cover)} alt="" className="h-full w-full object-cover" />
                        ) : (
                            user.cover_path && <img src={`/storage/${user.cover_path}`} alt="" className="h-full w-full object-cover" />
                        )}
                        <label
                            htmlFor="cover"
                            className="absolute bottom-3 right-3 cursor-pointer rounded-full bg-black/50 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/70"
                        >
                            {t('profil.changer_couverture', 'Changer la couverture')}
                        </label>
                        <input
                            id="cover"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('cover', e.target.files[0])}
                            className="hidden"
                        />
                    </div>
                    {errors.cover && <p className="px-8 pt-2 text-sm text-red-600">{errors.cover}</p>}

                    <div className="space-y-6 p-8">
                    <form onSubmit={submit} encType="multipart/form-data" className="space-y-6">
                        <div className="flex items-center gap-5">
                            <Avatar className="h-16 w-16 ring-2 ring-isstm-navy/10">
                                <AvatarImage src={user.avatar_path ? `/storage/${user.avatar_path}` : undefined} alt="" />
                                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <label htmlFor="avatar" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                                    {t('profil.photo_profil', 'Photo de profil')}
                                </label>
                                <input
                                    id="avatar"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('avatar', e.target.files[0])}
                                    className="mt-1 text-sm text-slate-500 dark:text-slate-400"
                                />
                                {errors.avatar && <p className="mt-1 text-sm text-red-600">{errors.avatar}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <TextField id="name" label={t('profil.nom_complet', 'Nom complet')} value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} required />
                            <TextField id="email" label={t('auth.email', 'Adresse e-mail')} type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} required />
                            <TextField id="phone" label={t('profil.telephone', 'Téléphone')} value={data.phone} onChange={(e) => setData('phone', e.target.value)} error={errors.phone} />
                            <TextField id="birth_date" label={t('profil.date_naissance', 'Date de naissance')} type="date" value={data.birth_date} onChange={(e) => setData('birth_date', e.target.value)} error={errors.birth_date} />
                            <TextField id="city" label={t('profil.ville', 'Ville')} value={data.city} onChange={(e) => setData('city', e.target.value)} error={errors.city} />
                            <TextField id="interests" label={t('profil.centres_interet', "Centres d'intérêt")} value={data.interests} onChange={(e) => setData('interests', e.target.value)} error={errors.interests} />
                        </div>

                        <div>
                            <label htmlFor="bio" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                                {t('profil.bio', 'Bio')}
                            </label>
                            <textarea
                                id="bio"
                                rows={3}
                                maxLength={500}
                                value={data.bio}
                                onChange={(e) => setData('bio', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-isstm-navy focus:outline-none focus:ring-2 focus:ring-isstm-navy/20"
                            />
                            {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                            <TextField id="facebook_url" label="Facebook" value={data.facebook_url} onChange={(e) => setData('facebook_url', e.target.value)} error={errors.facebook_url} />
                            <TextField id="linkedin_url" label="LinkedIn" value={data.linkedin_url} onChange={(e) => setData('linkedin_url', e.target.value)} error={errors.linkedin_url} />
                            <TextField id="personal_website" label={t('profil.site_web', 'Site web')} value={data.personal_website} onChange={(e) => setData('personal_website', e.target.value)} error={errors.personal_website} />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 rounded-full bg-isstm-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                        >
                            <Save className="h-4 w-4" aria-hidden="true" />
                            {t('profil.enregistrer', 'Enregistrer')}
                        </button>
                    </form>
                    </div>
                </Card>

                <Card className="mt-8 p-8">
                    <h2 className="text-lg font-semibold text-isstm-navy dark:text-white">
                        {t('profil.changer_mot_de_passe', 'Changer le mot de passe')}
                    </h2>

                    <form onSubmit={submitPassword} className="mt-4 space-y-4">
                        <TextField
                            id="current_password"
                            label={t('profil.mot_de_passe_actuel', 'Mot de passe actuel')}
                            type="password"
                            value={passwordForm.data.current_password}
                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                            error={passwordForm.errors.current_password}
                            required
                        />

                        <TextField
                            id="password"
                            label={t('auth.nouveau_mot_de_passe', 'Nouveau mot de passe')}
                            type="password"
                            value={passwordForm.data.password}
                            onChange={(e) => passwordForm.setData('password', e.target.value)}
                            error={passwordForm.errors.password}
                            required
                        />

                        <ul className="space-y-1 text-xs">
                            {passwordCriteria.map((c) => (
                                <li key={c.key} className={`flex items-center gap-2 ${c.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                    {c.met ? (
                                        <Check className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                                    ) : (
                                        <Circle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                                    )}
                                    {c.label}
                                </li>
                            ))}
                        </ul>

                        <TextField
                            id="password_confirmation"
                            label={t('auth.confirmer_mot_de_passe', 'Confirmer le mot de passe')}
                            type="password"
                            value={passwordForm.data.password_confirmation}
                            onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                            error={passwordForm.errors.password_confirmation}
                            required
                        />

                        <button
                            type="submit"
                            disabled={passwordForm.processing}
                            className="flex items-center gap-2 rounded-full bg-isstm-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                        >
                            <KeyRound className="h-4 w-4" aria-hidden="true" />
                            {t('profil.enregistrer_mot_de_passe', 'Modifier le mot de passe')}
                        </button>
                    </form>
                </Card>
        </>
    );

    if (isCommunityViewer) {
        return (
            <AppLayout>
                <Head title="Mon profil" />
                <div className="mx-auto max-w-3xl">{content}</div>
            </AppLayout>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Mon profil" />
            <SiteHeader />

            <main className="mx-auto max-w-3xl px-6 py-12">{content}</main>

            <Footer />
        </div>
    );
}
