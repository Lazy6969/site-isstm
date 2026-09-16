import { Head } from '@inertiajs/react';
import SiteHeader from './SiteHeader';
import Footer from '../Home/Footer';

export default function LegalPage({ title, subtitle, updated, sections }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={title} />
            <SiteHeader />

            <div className="bg-isstm-navy py-14 text-white">
                <div className="mx-auto max-w-3xl px-6">
                    <h1 className="text-3xl font-bold">{title}</h1>
                    <p className="mt-2 text-white/80">{subtitle}</p>
                </div>
            </div>

            <main className="mx-auto max-w-3xl space-y-8 px-6 py-12">
                {updated && (
                    <p className="text-sm text-slate-500">
                        <strong className="text-slate-700">Dernière mise à jour :</strong> {updated}
                    </p>
                )}

                {sections.map((section) => (
                    <section key={section.title}>
                        <h2 className="text-lg font-semibold text-isstm-navy">{section.title}</h2>
                        <p className="mt-2 leading-relaxed text-slate-600">{section.text}</p>
                    </section>
                ))}
            </main>

            <Footer />
        </div>
    );
}
