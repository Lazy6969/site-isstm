import { Head, usePage } from '@inertiajs/react';
import { Download, Eye, FileText, Share2 } from 'lucide-react';
import { useState } from 'react';
import SiteHeader from '../../Components/Layout/SiteHeader';
import Footer from '../../Components/Home/Footer';
import EditableText from '../../Components/QuickEdit/EditableText';
import QuickAddButton from '../../Components/QuickEdit/QuickAddButton';
import QuickAddDocumentDialog from '../../Components/QuickEdit/QuickAddDocumentDialog';
import { useQuickEdit } from '../../lib/useQuickEdit';
import { Card } from '../../Components/ui/card';
import { Badge } from '../../Components/ui/badge';
import { useTranslations } from '../../lib/useTranslations';
import { xsrfToken } from '../../lib/csrf';
import BannerBackground from '../../Components/QuickEdit/BannerBackground';

export default function Index({ documents }) {
    const { auth, content } = usePage().props;
    const { t } = useTranslations();
    const { active } = useQuickEdit();
    const canQuickAdd = active && (auth?.permissions ?? []).includes('documents.create');
    const [quickAddOpen, setQuickAddOpen] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    /** Shares the tracked "consulter" link (native share sheet, else clipboard) and counts the share once it went through. */
    async function shareDocument(doc) {
        const url = `${window.location.origin}/consulter?fichier=${encodeURIComponent(doc.file_path)}`;

        try {
            if (navigator.share) {
                await navigator.share({ title: doc.title, url });
            } else {
                await navigator.clipboard.writeText(url);
                setCopiedId(doc.id);
                setTimeout(() => setCopiedId(null), 2500);
            }
        } catch {
            return;
        }

        fetch('/documents/partage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': xsrfToken(), Accept: 'application/json' },
            body: JSON.stringify({ fichier: doc.file_path }),
        }).catch(() => {});
    }

    const categoryLabels = {
        public: t('documents.public', 'Public'),
        etudiant: t('documents.etudiants', 'Étudiants'),
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Documents administratifs" />
            <SiteHeader />

            <div className="relative overflow-hidden bg-isstm-navy py-14 text-white sm:py-20">
                <BannerBackground contentKey="documents_banniere_image_path" />
                <div className="relative z-10 mx-auto max-w-4xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">
                        <EditableText as="span" contentKey="documents_titre">
                            {content.documents_titre ?? t('nav.documents', 'Documents administratifs')}
                        </EditableText>
                    </h1>
                    <p className="mt-2 text-white/80">
                        <EditableText as="span" contentKey="documents_soustitre">
                            {content.documents_soustitre ?? t('documents.soustitre', 'Formulaires et documents à télécharger.')}
                        </EditableText>
                    </p>
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
                                    <div className="flex shrink-0 items-center gap-2">
                                        {copiedId === doc.id && (
                                            <span className="text-xs font-medium text-emerald-600">{t('documents.lien_copie', 'Lien copié')}</span>
                                        )}
                                        <a
                                            href={`/consulter?fichier=${encodeURIComponent(doc.file_path)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={t('documents.consulter', 'Consulter')}
                                            title={t('documents.consulter', 'Consulter')}
                                            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                                        >
                                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => shareDocument(doc)}
                                            aria-label={t('documents.partager', 'Partager')}
                                            title={t('documents.partager', 'Partager')}
                                            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                                        >
                                            <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                                        </button>
                                    <a
                                        href={`/telecharger?fichier=${encodeURIComponent(doc.file_path)}`}
                                        download
                                        className="flex shrink-0 items-center gap-1.5 rounded-full bg-isstm-navy px-4 py-1.5 text-xs font-semibold text-white transition hover:brightness-110"
                                    >
                                        <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                        {t('documents.telecharger', 'Télécharger')}
                                    </a>
                                    </div>
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

            {canQuickAdd && (
                <>
                    <QuickAddButton label="Document" onClick={() => setQuickAddOpen(true)} />
                    <QuickAddDocumentDialog open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
                </>
            )}
        </div>
    );
}
