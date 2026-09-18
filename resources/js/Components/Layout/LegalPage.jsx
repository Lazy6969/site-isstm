import { Head } from '@inertiajs/react';
import { Calendar } from 'lucide-react';
import SiteHeader from './SiteHeader';
import Footer from '../Home/Footer';
import { useTranslations } from '../../lib/useTranslations';

export default function LegalPage({ title, subtitle, updated, sections }) {
    const { t } = useTranslations();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title={title} />
            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-3xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
                    <p className="mt-2 text-white/80">{subtitle}</p>
                </div>
            </div>

            <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
                {updated && (
                    <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Calendar className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        <strong className="text-slate-700 dark:text-slate-200">{t('legal.derniere_maj', 'Dernière mise à jour :')}</strong> {updated}
                    </p>
                )}

                {sections.map((section) => (
                    <section key={section.title}>
                        <h2 className="text-lg font-semibold text-isstm-navy dark:text-white">{section.title}</h2>
                        <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">{section.text}</p>
                    </section>
                ))}
            </main>

            <Footer />
        </div>
    );
}
