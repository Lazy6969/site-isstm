import { Head, useForm } from '@inertiajs/react';
import { Save } from 'lucide-react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import TextField from '../../Components/Form/TextField';
import { Card } from '../../Components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../Components/ui/avatar';
import { useTranslations } from '../../lib/useTranslations';

export default function Edit({ user }) {
    const { t } = useTranslations();
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
    });

    function submit(e) {
        e.preventDefault();
        post('/profil', { forceFormData: true });
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Mon profil" />
            <SiteHeader />

            <main className="mx-auto max-w-3xl px-6 py-12">
                <h1 className="text-2xl font-bold text-isstm-navy dark:text-white">{t('profil.mon_profil', 'Mon profil')}</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {t('profil.visibilite', 'Ces informations sont visibles par les autres membres de la communauté ISSTM.')}
                </p>

                <Card className="mt-8 space-y-6 p-8">
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
                </Card>
            </main>

            <Footer />
        </div>
    );
}
