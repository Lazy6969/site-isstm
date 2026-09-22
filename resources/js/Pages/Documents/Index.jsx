import { Head, usePage } from '@inertiajs/react';
import { Download, FileText } from 'lucide-react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import { Card } from '../../Components/ui/card';
import { Badge } from '../../Components/ui/badge';
import { useTranslations } from '../../lib/useTranslations';

export default function Index({ documents }) {
    const { auth } = usePage().props;
    const { t } = useTranslations();

    const categoryLabels = {
        public: t('documents.public', 'Public'),
        etudiant: t('documents.etudiants', 'Étudiants'),
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Documents administratifs" />
            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-4xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">{t('nav.documents', 'Documents administratifs')}</h1>
                    <p className="mt-2 text-white/80">{t('documents.soustitre', 'Formulaires et documents à télécharger.')}</p>
                </div>
            </div>

            <main className="mx-auto max-w-4xl px-6 py-12">
                {documents.length === 0 ? (
                    <Card className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        {t('documents.aucun_document', "Aucun document n'est disponible pour le moment.")}
                    </Card>
                ) : (
                    <Card className="overflow-hidden">
                        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                            {documents.map((doc) => (
                                <li key={doc.id} className="flex items-center justify-between gap-4 px-6 py-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <FileText className="h-5 w-5 flex-shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                                        <div className="min-w-0">
                                            <p className="truncate font-medium text-slate-700 dark:text-slate-200">{doc.title}</p>
                                            <Badge className="mt-1">{categoryLabels[doc.category] ?? doc.category}</Badge>
                                        </div>
                                    </div>
                                    <a
                                        href={`/${doc.file_path}`}
                                        download
                                        className="flex shrink-0 items-center gap-1.5 rounded-full bg-isstm-navy px-4 py-1.5 text-xs font-semibold text-white transition hover:brightness-110"
                                    >
                                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                        {t('documents.telecharger', 'Télécharger')}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </Card>
                )}

                {!auth?.user && (
                    <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                        {t('documents.connexion_requise', 'Connectez-vous pour accéder aux documents réservés aux étudiants.')}
                    </p>
                )}
            </main>

            <Footer />
        </div>
    );
}
