import { Head } from '@inertiajs/react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import ContactCards from '../../Components/Contact/ContactCards';
import ContactMaps from '../../Components/Contact/ContactMaps';

export default function Index({ content }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Contact" />
            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-6xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">Contactez-nous</h1>
                    <p className="mt-2 max-w-2xl text-white/80">
                        Une question sur les formations, les inscriptions ou la vie étudiante ? Notre équipe vous répond avec plaisir.
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-6xl px-6 py-12">
                <ContactCards content={content} />
                <ContactMaps content={content} />
            </main>

            <Footer />
        </div>
    );
}
