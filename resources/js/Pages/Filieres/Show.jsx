import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Briefcase, Landmark, Sparkles } from 'lucide-react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import { Badge } from '../../Components/ui/badge';
import { Separator } from '../../Components/ui/separator';
import { useTranslations } from '../../lib/useTranslations';

function Section({ icon: Icon, title, text }) {
    if (!text) return null;

    return (
        <section>
            <Separator className="mb-6" />
            <h2 className="flex items-center gap-2 text-lg font-semibold text-isstm-navy">
                <Icon className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                {title}
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{text}</p>
        </section>
    );
}

export default function Show({ filiere }) {
    const { t } = useTranslations();

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={filiere.nom} />
            <SiteHeader />

            <div
                className="relative h-72 bg-cover bg-center"
                style={{ backgroundImage: `url('/${filiere.image_path}')` }}
            >
                <div className="absolute inset-0 bg-isstm-navy-dark/70" />
                <div className="relative mx-auto flex h-full max-w-4xl flex-col justify-end px-6 pb-8 text-white">
                    <Link href="/filieres" className="mb-3 flex items-center gap-1.5 text-sm text-white/80 hover:underline">
                        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        {t('filieres.toutes_les_filieres', 'Toutes les filières')}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2">
                        {filiere.mention && <Badge variant="gold">{filiere.mention}</Badge>}
                        {filiere.niveaux && (
                            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">{filiere.niveaux}</span>
                        )}
                    </div>
                    <h1 className="mt-3 text-3xl font-bold">{filiere.nom}</h1>
                </div>
            </div>

            <main className="mx-auto max-w-4xl space-y-6 px-6 py-12">
                <p className="text-base leading-relaxed text-slate-700">{filiere.description}</p>
                <Section icon={Briefcase} title={t('filieres.debouches', 'Débouchés professionnels')} text={filiere.debouches} />
                <Section icon={Landmark} title={t('filieres.histoire', "Un peu d'histoire")} text={filiere.historique} />
                <Section icon={Sparkles} title={t('filieres.avantages', 'Pourquoi choisir cette filière ?')} text={filiere.avantages} />
            </main>

            <Footer />
        </div>
    );
}
