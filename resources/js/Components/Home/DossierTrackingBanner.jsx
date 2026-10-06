import { router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import EditableText from '../QuickEdit/EditableText';
import BannerBackground from '../QuickEdit/BannerBackground';
import { useTranslations } from '../../lib/useTranslations';

/**
 * "Where's my file?" banner between Filières and Actualités — a DHL-style
 * tracking-number search that sends the visitor to /suivi-dossier with their
 * input. No photo by default (plain navy, like every other banner); an
 * admin can upload one via the pencil (see BannerBackground).
 */
export default function DossierTrackingBanner() {
    const { content } = usePage().props;
    const { t } = useTranslations();
    const [value, setValue] = useState('');

    function submit(e) {
        e.preventDefault();
        router.get('/suivi-dossier', { numero: value });
    }

    return (
        <section className="relative overflow-hidden bg-isstm-navy py-10 text-white sm:py-14">
            <BannerBackground contentKey="accueil_suivi_image_path" />
            <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
                <h2 className="text-xl font-bold sm:text-2xl">
                    <EditableText as="span" contentKey="accueil_suivi_titre">
                        {content.accueil_suivi_titre ?? t('suivi.accueil_titre', 'Suivi de votre dossier')}
                    </EditableText>
                </h2>
                <p className="mt-2 text-white/80">
                    <EditableText as="span" contentKey="accueil_suivi_soustitre">
                        {content.accueil_suivi_soustitre ?? t('suivi.accueil_soustitre', 'Entrez votre numéro de dossier pour connaître son état.')}
                    </EditableText>
                </p>

                <form onSubmit={submit} className="mx-auto mt-5 flex max-w-lg gap-2">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={t('suivi.placeholder', 'Ex. PI-2026-00001')}
                        className="w-full rounded-full border border-white/20 bg-white px-5 py-3 text-sm text-slate-900 shadow-sm focus:border-isstm-gold focus:outline-none focus:ring-2 focus:ring-isstm-gold"
                    />
                    <button
                        type="submit"
                        className="flex shrink-0 items-center gap-2 rounded-full bg-isstm-gold px-6 py-3 text-sm font-semibold text-isstm-navy-dark transition hover:brightness-110"
                    >
                        <Search className="h-4 w-4" aria-hidden="true" />
                        {t('suivi.suivre', 'Suivre')}
                    </button>
                </form>
            </div>
        </section>
    );
}
