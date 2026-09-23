import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Briefcase, Landmark, Sparkles } from 'lucide-react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import { Badge } from '../../Components/ui/badge';
import { Separator } from '../../Components/ui/separator';
import EditableText from '../../Components/QuickEdit/EditableText';

function Section({ icon: Icon, title, text }) {
    if (!text) return null;

    return (
        <section>
            <Separator className="mb-6" />
            <h2 className="flex items-center gap-2 text-lg font-semibold text-isstm-navy dark:text-white">
                <Icon className="h-5 w-5 text-isstm-gold" aria-hidden="true" />
                {title}
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">{text}</p>
        </section>
    );
}

export default function Show({ filiere }) {
    const { content } = usePage().props;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
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
                        <EditableText as="span" contentKey="filieres_show_retour">
                            {content.filieres_show_retour}
                        </EditableText>
                    </Link>
                    <div className="flex flex-wrap items-center gap-2">
                        {filiere.mention && <Badge variant="gold">{filiere.mention}</Badge>}
                        {filiere.niveaux && (
                            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">{filiere.niveaux}</span>
                        )}
                    </div>
                    <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{filiere.nom}</h1>
                </div>
            </div>

            <main className="mx-auto max-w-4xl space-y-6 px-6 py-12">
                <p className="text-base leading-relaxed text-slate-700 dark:text-slate-200">{filiere.description}</p>
                <Section
                    icon={Briefcase}
                    title={
                        <EditableText as="span" contentKey="filieres_show_debouches_titre">
                            {content.filieres_show_debouches_titre}
                        </EditableText>
                    }
                    text={filiere.debouches}
                />
                <Section
                    icon={Landmark}
                    title={
                        <EditableText as="span" contentKey="filieres_show_histoire_titre">
                            {content.filieres_show_histoire_titre}
                        </EditableText>
                    }
                    text={filiere.historique}
                />
                <Section
                    icon={Sparkles}
                    title={
                        <EditableText as="span" contentKey="filieres_show_avantages_titre">
                            {content.filieres_show_avantages_titre}
                        </EditableText>
                    }
                    text={filiere.avantages}
                />
            </main>

            <Footer />
        </div>
    );
}
