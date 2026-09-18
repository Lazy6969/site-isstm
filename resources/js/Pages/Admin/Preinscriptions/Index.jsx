import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, UserCheck } from 'lucide-react';
import { useState } from 'react';
import SiteHeader from '../../../Components/Layout/SiteHeader';
import Footer from '../../../Components/Home/Footer';
import { Card } from '../../../Components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../../../Components/ui/avatar';
import { useTranslations } from '../../../lib/useTranslations';

function formatDate(value) {
    return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Index({ preinscriptions }) {
    const { flash } = usePage().props;
    const { t } = useTranslations();
    const [processingId, setProcessingId] = useState(null);

    function approve(id) {
        if (!confirm(t('preinscriptions_admin.confirmer_approbation', 'Créer le compte étudiant pour cette préinscription ?'))) return;
        setProcessingId(id);
        router.post(
            `/admin/preinscriptions/${id}/approve`,
            {},
            { preserveScroll: true, onFinish: () => setProcessingId(null) },
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <Head title="Préinscriptions en attente" />
            <SiteHeader />

            <div className="bg-isstm-navy py-10 text-white sm:py-14">
                <div className="mx-auto max-w-5xl px-6">
                    <h1 className="text-2xl font-bold sm:text-3xl">{t('preinscriptions_admin.titre', 'Préinscriptions en attente')}</h1>
                    <p className="mt-2 text-white/80">
                        {preinscriptions.length} {t('preinscriptions_admin.dossiers_a_traiter', 'dossier(s) à traiter.')}
                    </p>
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-6 py-12">
                {flash?.status && (
                    <p className="mb-6 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        {flash.status}
                    </p>
                )}

                {preinscriptions.length === 0 ? (
                    <Card className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        {t('preinscriptions_admin.aucune_preinscription', 'Aucune préinscription en attente.')}
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {preinscriptions.map((p) => (
                            <Card key={p.id} className="flex items-center gap-5 p-5">
                                <Avatar className="h-16 w-16 flex-shrink-0">
                                    <AvatarImage src={p.photo_path ? `/storage/${p.photo_path}` : undefined} alt="" />
                                    <AvatarFallback>{p.nom?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-slate-700 dark:text-slate-200">{p.nom} {p.prenoms}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {p.filiere?.nom_fr} · {p.niveau} · {p.email}
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                        {t('preinscriptions_admin.deposee_le', 'Déposée le')} {formatDate(p.created_at)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => approve(p.id)}
                                    disabled={processingId === p.id}
                                    className="flex flex-shrink-0 items-center gap-2 rounded-full bg-isstm-navy px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:animate-pulse disabled:opacity-60"
                                >
                                    <UserCheck className="h-4 w-4" aria-hidden="true" />
                                    {processingId === p.id
                                        ? t('preinscriptions_admin.approbation_en_cours', 'Approbation…')
                                        : t('preinscriptions_admin.approuver', 'Approuver')}
                                </button>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
